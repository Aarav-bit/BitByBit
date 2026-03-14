import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Prisma } from "@prisma/client";
import { evaluateSubmission } from "@/lib/ai/evaluator";

export async function POST(req: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return new NextResponse("Unauthorized", { status: 401 });

  const user = await db.user.findUnique({
    where: { clerkId },
  });

  if (!user || user.role !== "FREELANCER") {
    return new NextResponse("Only Freelancers can submit work", { status: 403 });
  }

  const { milestoneId, content } = await req.json();

  if (!milestoneId || !content) {
    return new NextResponse("Missing required fields", { status: 400 });
  }

  const milestone = await db.milestone.findUnique({
    where: { id: milestoneId },
    include: { project: true },
  });

  if (!milestone) return new NextResponse("Milestone not found", { status: 404 });
  if (milestone.project.freelancerId !== user.id) {
    return new NextResponse("Not assigned to this project", { status: 403 });
  }

  // --- AQA LOGIC (AI ASSESSOR) ---
  const aqaResponse = await evaluateSubmission(content, milestone.definitionOfDone, milestone.project.description);
  
  const isPass = aqaResponse.overall >= 70; // Pass threshold

  const result = await db.$transaction(async (tx: Prisma.TransactionClient) => {
    // 0. Count previous submissions
    const previousSubmissionsCount = await tx.submission.count({
      where: { milestoneId: milestone.id }
    });

    // 1. Create submission record
    const submission = await tx.submission.create({
      data: {
        milestoneId: milestone.id,
        content,
        aqaScores: aqaResponse as any,
        aqaFeedback: aqaResponse.feedback,
      },
    });

    // 2. Update milestone status
    // If AQA passes, it goes to SUBMITTED (awaiting employer/monitor)
    // If AQA fails, it stays REJECTED/Needs work
    await tx.milestone.update({
      where: { id: milestone.id },
      data: {
        status: isPass ? "SUBMITTED" : "REJECTED",
      },
    });

    if (isPass) {
      // 3. AI MONITOR INTEGRATION
      // We don't release funds here. We trigger the monitor review window.
      const { onMilestoneSubmitted } = await import("@/lib/monitor/actions");
      await onMilestoneSubmitted(milestone.id);

      // PFI Rule: +5 on first attempt, +2 otherwise (Awarded on submission pass)
      const pfiBoost = previousSubmissionsCount === 0 ? 5 : 2;
      
      // NEW METRICS
      const isOnTime = !milestone.dueDate || new Date() <= milestone.dueDate;

      await tx.user.update({
        where: { id: user.id },
        data: { 
          pfiScore: { increment: pfiBoost },
          totalSubmissionsCount: { increment: 1 },
          submissionsFirstPassCount: { increment: previousSubmissionsCount === 0 ? 1 : 0 },
          milestonesOnTimeCount: { increment: isOnTime ? 1 : 0 },
        },
      });

      // Update Employer Scope Clarity metric
      if (previousSubmissionsCount === 0) {
        await tx.user.update({
          where: { id: milestone.project.employerId },
          data: { aqaFirstPassCount: { increment: 1 } }
        });
      }
    } else {
      // PFI Rule: -5 on rejection
      await tx.user.update({
        where: { id: user.id },
        data: { 
          pfiScore: { decrement: 5 },
          totalSubmissionsCount: { increment: 1 },
        },
      });
    }

    return { submission, aqaScores: aqaResponse, feedback: aqaResponse.feedback };
  });

  return NextResponse.json(result);
}
