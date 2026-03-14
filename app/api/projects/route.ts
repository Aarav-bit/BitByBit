import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return new NextResponse("Unauthorized", { status: 401 });

  const user = await db.user.findUnique({
    where: { clerkId },
  });

  if (!user) return new NextResponse("User not found", { status: 404 });

  let projects;

  if (user.role === "EMPLOYER") {
    // Employers see projects they created
    projects = await db.project.findMany({
      where: { employerId: user.id },
      include: {
        milestones: true,
        employer: true,
        freelancer: true,
      },
      orderBy: { createdAt: "desc" },
    });
  } else {
    // Freelancers see projects they are assigned to + Unassigned projects
    projects = await db.project.findMany({
      where: {
        OR: [
          { freelancerId: user.id },
          { freelancerId: null }
        ]
      },
      include: {
        milestones: true,
        employer: true,
        freelancer: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  return NextResponse.json(projects);
}

export async function POST(req: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return new NextResponse("Unauthorized", { status: 401 });

  const user = await db.user.findUnique({
    where: { clerkId },
  });

  if (!user || user.role !== "EMPLOYER") {
    return new NextResponse("Only employers can create projects", { status: 403 });
  }

  const { title, description, totalEscrow, milestones } = await req.json();

  if (!title || !description || !totalEscrow || !milestones || !milestones.length) {
    return new NextResponse("Missing required fields", { status: 400 });
  }

  try {
    // Atomic Create + Fund + Monitor
    const { publishProject } = await import("@/lib/monitor/actions");
    const result = await publishProject({
      title,
      description,
      totalEscrow,
      employerId: user.id,
      milestones: milestones.map((m: any) => ({
        title: m.title,
        amount: m.amount,
        dod: m.dod,
      })),
    });

    return NextResponse.json(result.project);
  } catch (error: any) {
    console.error("[PROJECTS_CREATE_ERROR]", error);
    if (error.message === "Insufficient virtual balance to publish project") {
      return new NextResponse(error.message, { status: 400 });
    }
    return new NextResponse(error.message || "Internal Server Error", { status: 500 });
  }
}
