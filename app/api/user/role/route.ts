import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return new NextResponse("Unauthorized", { status: 401 });

  const { role } = await req.json();

  if (!role || !["EMPLOYER", "FREELANCER"].includes(role)) {
    return new NextResponse("Invalid role", { status: 400 });
  }

  try {
    const user = await db.user.update({
      where: { clerkId },
      data: { role },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("[ROLE_UPDATE_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
