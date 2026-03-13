import { db } from "@/lib/db";
import { ActionStatus } from "@prisma/client";
import { executeRelease } from "./actions";

/**
 * Finds monitor actions that have passed their auto-release deadline
 * and are still pending employer response.
 */
export async function findExpiredMonitorActions(now = new Date()) {
  return (db as any).monitorAction.findMany({
    where: {
      status: ActionStatus.PENDING,
      autoReleaseAt: { lte: now },
    },
    include: {
      monitor: {
        include: { project: true },
      },
      milestone: {
        include: {
          project: {
            include: {
              employer: true,
              freelancer: true,
            },
          },
        },
      },
    },
  });
}

/**
 * Updates the next scheduled check time for a monitor.
 */
export async function updateMonitorNextCheck(monitorId: string, when: Date) {
  await (db as any).projectMonitor.update({
    where: { id: monitorId },
    data: { nextScheduledCheck: when },
  });
}

/**
 * Core cron loop: find all expired actions and auto-release funds.
 */
export async function processExpiredActions() {
  const expired = await findExpiredMonitorActions();
  const results = [];

  for (const action of expired) {
    try {
      await executeRelease(action.id, true);
      results.push({ id: action.id, status: "SUCCESS" });
    } catch (error) {
      console.error(`Failed to auto-release action ${action.id}:`, error);
      results.push({ id: action.id, status: "FAILED", error: String(error) });
    }
  }

  return results;
}
