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

  const updatedProject = await db.project.update({
    where: { id },
    data: {
      freelancerId: user.id,
    },
  });

  return NextResponse.json(updatedProject);
}
