import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { processUserMessage } from "@/lib/ai/engine";

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      console.log("[CHAT_API] No authenticated user");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { message, sessionId } = body;
    
    if (!message || !sessionId) {
      return NextResponse.json(
        { error: "Message and sessionId are required" }, 
        { status: 400 }
      );
    }

    // Find the database user record
    const dbUser = await db.user.findUnique({
      where: { clerkId: user.id }
    });

    if (!dbUser) {
      console.log(`[CHAT_API] No DB user for clerkId: ${user.id}`);
      return NextResponse.json(
        { error: "User record not found. Please complete onboarding first." }, 
        { status: 404 }
      );
    }

    console.log(`[CHAT_API] Processing for user: ${dbUser.name || dbUser.id}`);
    const result = await processUserMessage(dbUser.id, sessionId, message);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[CHAT_API_ERROR]", error?.message || error);
    return NextResponse.json(
      { 
        error: "Something went wrong. Please try again.",
        response: "I'm having trouble processing your request right now. Please try again in a moment.",
        specialist: "EXPERT",
        actions: []
      }, 
      { status: 200 } // Return 200 with error message so frontend can display it
    );
  }
}
