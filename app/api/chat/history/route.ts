import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json([], { status: 200 }); // Return empty array for unauthenticated
    }

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json([], { status: 200 }); // Return empty for missing sessionId
    }

    // Check if session exists first
    const session = await db.chatSession.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
      // Session doesn't exist yet — return empty (will be created on first message)
      return NextResponse.json([]);
    }

    const messages = await db.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: "asc" },
      take: 50
    });

    return NextResponse.json(messages);
  } catch (error: any) {
    console.error("[CHAT_HISTORY_ERROR]", error?.message || error);
    // Return empty array on error so FE doesn't break
    return NextResponse.json([]);
  }
}
