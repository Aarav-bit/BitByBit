import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { executeRelease, handleRejection } from "@/lib/monitor/actions";

export async function POST(req: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return new NextResponse("Unauthorized", { status: 401 });

  const user = await db.user.findUnique({
    where: { clerkId },
  });

  if (!user || user.role !== "EMPLOYER") {
    return new NextResponse("Only employers can respond to milestones", { status: 403 });
  }

  const { actionId, decision, reason } = await req.json();

  if (!actionId || !decision) {
    return new NextResponse("Missing required fields", { status: 400 });
  }

  const action = await (db as any).monitorAction.findUnique({
    where: { id: actionId },
    include: {
      milestone: true,
      monitor: {
        include: { project: true }
      }
    }
  });

  if (!action || !action.milestone) {
    return new NextResponse("Action or milestone not found", { status: 404 });
  }

  if (action.monitor.project.employerId !== user.id) {
    return new NextResponse("Not authorized for this project", { status: 403 });
  }

  try {
    if (decision === "APPROVE") {
      await executeRelease(actionId, false);
      return NextResponse.json({ message: "Milestone approved and payment released" });
    } else if (decision === "REJECT") {
      await handleRejection(actionId, reason || "No reason provided");
      return NextResponse.json({ message: "Milestone rejected and escalated for review" });
    } else {
      return new NextResponse("Invalid decision", { status: 400 });
    }
  } catch (error) {
    console.error("[MONITOR_RESPOND_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
