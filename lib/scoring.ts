import { db } from "@/lib/db";
import { User, Role } from "@prisma/client";

/**
 * Detailed employer score components.
 */
export function calculateEmployerScores(user: any) {
  const {
    milestonesPaidWithin48h = 0,
    totalMilestonesApproved = 0,
    totalReviewHours = 0,
    totalMilestonesDisputedByEmp = 0,
    totalMilestonesCreated = 0,
    aqaFirstPassCount = 0,
    projectsCreatedCount = 0,
    projectsCompletedCount = 0,
    rejectionsUpheldCount = 0,
    totalRejectionsCount = 0,
    messagesRepliedWithinDeadline = 0,
    totalMessagesExpectedReply = 0,
  } = user;

  return {
    paymentReliability: totalMilestonesApproved > 0 ? (milestonesPaidWithin48h / totalMilestonesApproved) * 100 : 100,
    responseTime: totalMilestonesApproved > 0 ? Math.max(0, 100 - ((totalReviewHours / totalMilestonesApproved) / 24 * 100)) : 100,
    disputeRate: totalMilestonesCreated > 0 ? 100 - (totalMilestonesDisputedByEmp / totalMilestonesCreated * 100) : 100,
    scopeClarity: totalMilestonesCreated > 0 ? (aqaFirstPassCount / totalMilestonesCreated) * 100 : 100,
    projectCompletion: projectsCreatedCount > 0 ? (projectsCompletedCount / projectsCreatedCount) * 100 : 100,
    fairnessIndex: totalRejectionsCount > 0 ? (rejectionsUpheldCount / totalRejectionsCount) * 100 : 100,
    communicationQuality: totalMessagesExpectedReply > 0 ? (messagesRepliedWithinDeadline / totalMessagesExpectedReply) * 100 : 100,
  };
}

/**
 * Detailed freelancer score components.
 */
export function calculateFreelancerScores(user: any) {
  const {
    submissionsFirstPassCount = 0,
    totalSubmissionsCount = 0,
    milestonesOnTimeCount = 0,
    totalMilestonesAssignedCount = 0,
    projectsFinishedCount = 0,
    projectsAcceptedCount = 0,
    disputesLostCount = 0,
    milestonesCompletedCount = 0,
    messagesRepliedWithinDeadline = 0,
    totalMessagesExpectedReply = 0,
    rehireCount = 0,
  } = user;

  return {
    qualityScore: totalSubmissionsCount > 0 ? (submissionsFirstPassCount / totalSubmissionsCount) * 100 : 100,
    onTimeDelivery: totalMilestonesAssignedCount > 0 ? (milestonesOnTimeCount / totalMilestonesAssignedCount) * 100 : 100,
    successRate: projectsAcceptedCount > 0 ? (projectsFinishedCount / projectsAcceptedCount) * 100 : 100,
    rehireRate: projectsAcceptedCount > 0 ? (rehireCount / projectsAcceptedCount) * 100 : 0,
    communication: totalMessagesExpectedReply > 0 ? (messagesRepliedWithinDeadline / totalMessagesExpectedReply) * 100 : 100,
    disputeHistory: totalMilestonesAssignedCount > 0 ? 100 - (disputesLostCount / totalMilestonesAssignedCount * 100) : 100,
    experience: Math.min(100, Math.log(milestonesCompletedCount + 1) * 20),
  };
}

/**
 * Updates the user's reputation scores in the database.
 */
export async function updateReputationScores(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
  });

  if (!user) return;

  if (user.role === Role.EMPLOYER) {
    const scores = calculateEmployerScores(user);
    const avgScore = (Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length);

    await db.user.update({
      where: { id: userId },
      data: {
        empPaymentReliability: scores.paymentReliability,
        empResponseTime: scores.responseTime,
        empDisputeRate: scores.disputeRate,
        empScopeClarity: scores.scopeClarity,
        empProjectCompletion: scores.projectCompletion,
        empFairnessIndex: scores.fairnessIndex,
        empCommunication: scores.communicationQuality,
        employerScore: avgScore,
      }
    });
  } else if (user.role === Role.FREELANCER) {
    const scores = calculateFreelancerScores(user);
    const avgScore = (Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length);

    await db.user.update({
      where: { id: userId },
      data: {
        freeQualityScore: scores.qualityScore,
        freeOnTimeDelivery: scores.onTimeDelivery,
        freeProjectSuccess: scores.successRate,
        freeRehireRate: scores.rehireRate,
        freeCommunication: scores.communication,
        freeDisputeHistory: scores.disputeHistory,
        freeExperience: scores.experience,
        freelancerScore: avgScore,
      }
    });
  }
}
