import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  const { userId: clerkId } = await auth();
  if (!clerkId) return new NextResponse("Unauthorized", { status: 401 });

  const user = await db.user.findUnique({
    where: { clerkId },
  });

  if (!user || user.role !== "FREELANCER") {
    return new NextResponse("Only Freelancers can claim projects", { status: 403 });
  }

  const project = await db.project.findUnique({
    where: { id },
  });

  if (!project) return new NextResponse("Project not found", { status: 404 });
  if (project.freelancerId) return new NextResponse("Project already claimed", { status: 400 });

  const milestoneCount = await db.milestone.count({
    where: { projectId: id }
  });

  // Check for rehire (if freelancer has another project with THIS employer)
  const previousCollaborations = await db.project.count({
    where: {
      employerId: project.employerId,
      freelancerId: user.id,
      NOT: { id: project.id }
    }
  });

  const isRehire = previousCollaborations > 0;

  const updatedProject = await db.$transaction(async (tx) => {
    // 1. Assign freelancer
    const p = await tx.project.update({
      where: { id },
      data: {
        freelancerId: user.id,
      },
    });

    // 2. Update freelancer metrics
    await tx.user.update({
      where: { id: user.id },
      data: {
        projectsAcceptedCount: { increment: 1 },
        totalMilestonesAssignedCount: { increment: milestoneCount },
        rehireCount: { increment: isRehire ? 1 : 0 }
      }
    });

    return p;
  });

  // 3. Update Scores
  const { updateReputationScores } = await import("@/lib/scoring");
  await updateReputationScores(user.id);

  return NextResponse.json(updatedProject);
}
