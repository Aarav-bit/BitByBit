import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { holdProjectFunds } from "@/lib/monitor/actions";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return new NextResponse("Unauthorized", { status: 401 });

  const project = await (db.project as any).findUnique({
    where: { id: params.id },
    include: {
      monitor: {
        include: {
          actions: {
            orderBy: { createdAt: "desc" },
          },
        },
      },
      milestones: {
        include: {
          submissions: { orderBy: { createdAt: "desc" } }
        }
      }
    },
  });

  if (!project) return new NextResponse("Project not found", { status: 404 });

  return NextResponse.json(project.monitor);
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return new NextResponse("Unauthorized", { status: 401 });

  const project = await db.project.findUnique({
    where: { id: params.id },
  });

  if (!project) return new NextResponse("Project not found", { status: 404 });

  try {
    const monitor = await holdProjectFunds(project.id, project.totalEscrow);
    return NextResponse.json(monitor);
  } catch (error) {
    console.error("[MONITOR_INIT_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return new NextResponse("Unauthorized", { status: 401 });

  const { autoReleaseDays } = await req.json();

  try {
    const project = await db.project.update({
      where: { id: params.id },
      data: { autoReleaseDays: Number(autoReleaseDays) },
    });
    return NextResponse.json(project);
  } catch (error) {
    console.error("[MONITOR_PATCH_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
