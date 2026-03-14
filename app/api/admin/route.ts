import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

export async function GET() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return new NextResponse("Unauthorized", { status: 401 });

  // const user = await db.user.findUnique({ where: { clerkId } });
  // For MVP, we can assume certain users are admins or just allow all for testing
  // if (user?.email !== "admin@fluxcred.com") return new NextResponse("Forbidden", { status: 403 });

  const projects = await db.project.findMany({
    include: {
      employer: true,
      freelancer: true,
      milestones: {
        include: {
          submissions: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json(projects);
}

export async function PATCH(req: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return new NextResponse("Unauthorized", { status: 401 });

  const { milestoneId, status, pfiAdjustment } = await req.json();

  const milestone = await db.milestone.findUnique({
    where: { id: milestoneId },
    include: { project: true }
  });

  if (!milestone) return new NextResponse("Milestone not found", { status: 404 });

  const result = await db.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.milestone.update({
      where: { id: milestoneId },
      data: { status }
    });

    if (pfiAdjustment && milestone.project.freelancerId) {
      await tx.user.update({
        where: { id: milestone.project.freelancerId },
        data: { pfiScore: { increment: pfiAdjustment } }
      });
    }

    return { success: true };
  });

  return NextResponse.json(result);
}
