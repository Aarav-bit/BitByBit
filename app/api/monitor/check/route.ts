import { db } from "@/lib/db";
import { processExpiredActions } from "@/lib/monitor/scheduler";
import { NextResponse } from "next/server";

/**
 * CRON JOB ENDPOINT
 * This should be secured with a CRON_SECRET if using Vercel/Netlify.
 * For this demo, we leave it open but expect it to be called hourly.
 */
export async function GET(req: Request) {
  try {
    const results = await processExpiredActions();
    
    return NextResponse.json({
      status: "SUCCESS",
      processed: results.length,
      details: results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[MONITOR_CHECK_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
