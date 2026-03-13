import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { Prisma } from "@prisma/client";

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
  const aqaResponse = await evaluateWithAI(content, milestone.definitionOfDone);
  
  const isPass = aqaResponse.result === "PASS";

  const result = await db.$transaction(async (tx: Prisma.TransactionClient) => {
    // 0. Count previous submissions to determine if this is the first attempt
    const previousSubmissionsCount = await tx.submission.count({
      where: { milestoneId: milestone.id }
    });

    // 1. Create submission record
    const submission = await tx.submission.create({
      data: {
        milestoneId: milestone.id,
        content,
        aqaResult: aqaResponse.result,
        aqaFeedback: aqaResponse.feedback,
      },
    });

    // 2. Update milestone status
    await tx.milestone.update({
      where: { id: milestone.id },
      data: {
        status: isPass ? "APPROVED" : "REJECTED",
      },
    });

    if (isPass) {
      // 3. VIRTUAL PAYOUT
      await tx.user.update({
        where: { id: milestone.project.employerId },
        data: { virtualBalance: { decrement: milestone.amount } },
      });

      // PFI Rule: +5 on first attempt, +2 otherwise
      const pfiBoost = previousSubmissionsCount === 0 ? 5 : 2;

      await tx.user.update({
        where: { id: user.id },
        data: { 
          virtualBalance: { increment: milestone.amount },
          pfiScore: { increment: pfiBoost }
        },
      });
    } else {
      // PFI Rule: -5 on rejection
      await tx.user.update({
        where: { id: user.id },
        data: { pfiScore: { decrement: 5 } },
      });
    }

    return { submission, aqaResult: aqaResponse.result, aqaFeedback: aqaResponse.feedback };
  });

  return NextResponse.json(result);
}

async function evaluateWithAI(content: string, dod: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.warn("GEMINI_API_KEY missing - using mocked AQA result");
    const isMockPass = content.length > 50; 
    return {
      result: isMockPass ? "PASS" : "FAIL",
      feedback: isMockPass 
        ? "MOCK AQA: Protocol verified. Content density sufficient. Definition of Done requirements detected."
        : "MOCK AQA: Verification failed. Content too sparse to meet Definition of Done criteria. Provide more detailed deliverables.",
    };
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `
    TASK: AI Quality Assurance (AQA) for BITBYBIT Escrow Protocol.
    
    CRITIQUE CRITERIA (Definition of Done):
    "${dod}"
    
    SUBMISSION CONTENT:
    """
    ${content}
    """
    
    INSTRUCTIONS:
    Evaluate the submission against the criteria. 
    Be strict. If the criteria asks for 3 items and only 2 are present, it is a FAIL.
    Return your response in EXACTLY this JSON format:
    {
      "result": "PASS" | "FAIL",
      "feedback": "Detailed explanation of why it passed or failed, referencing specific criteria."
    }
  `;

  try {
    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    const text = result.text ?? "";
    const jsonStr = text.match(/\{[\s\S]*\}/)?.[0] || text;
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("AI Evaluation error:", error);
    return { result: "FAIL", feedback: "AQA Protocol error: AI evaluation service unavailable." };
  }
}
