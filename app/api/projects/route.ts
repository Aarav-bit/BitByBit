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
    const project = await db.project.create({
      data: {
        title,
        description,
        totalEscrow,
        employerId: user.id,
        milestones: {
          create: milestones.map((m: any) => ({
            title: m.title,
            description: m.dod ?? m.title ?? "",
            amount: m.amount,
            definitionOfDone: m.dod,
          })),
        },
      },
      include: {
        milestones: true,
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error("[PROJECTS_CREATE_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
