import { db } from "@/lib/db";
import { 
  ActionStatus, 
  ActionType, 
  EscrowStatus, 
  MonitorStatus,
} from "@prisma/client";
import { 
  renderMilestoneSubmittedEmail, 
  renderPaymentAutoReleasedEmail, 
  renderPaymentManuallyReleasedEmail, 
  renderMilestoneRejectedEmail 
} from "../email/templates";
import { sendEmail } from "../email/sender";

/**
 * Atomically creates a project, deducts funds from employer, and initializes monitoring.
 */
export async function publishProject(data: {
  title: string;
  description: string;
  totalEscrow: number;
  employerId: string;
  milestones: { title: string; amount: number; dod?: string }[];
}) {
  const result = await db.$transaction(async (tx) => {
    // 1. Check & Deduct from employer balance
    const employer = await tx.user.findUnique({
      where: { id: data.employerId }
    });

    if (!employer) throw new Error("Employer not found");
    if (employer.virtualBalance < data.totalEscrow) {
      throw new Error("Insufficient virtual balance to publish project");
    }

    // 2. Create Project with Milestones
    const project = await tx.project.create({
      data: {
        title: data.title,
        description: data.description,
        totalEscrow: data.totalEscrow,
        employerId: data.employerId,
        milestones: {
          create: data.milestones.map((m) => ({
            title: m.title,
            description: m.dod ?? m.title,
            amount: m.amount,
            definitionOfDone: m.dod || m.title, // Ensure string
          })),
        },
      },
      include: { milestones: true }
    });

    // 3. Update User Metrics
    await tx.user.update({
      where: { id: data.employerId },
      data: { 
        virtualBalance: { decrement: data.totalEscrow },
        projectsCreatedCount: { increment: 1 },
        totalMilestonesCreated: { increment: (project as any).milestones.length }
      } as any
    });

    // 4. Update Project Escrow
    await tx.project.update({
      where: { id: project.id },
      data: {
        escrowBalance: data.totalEscrow,
        escrowStatus: "HELD",
      } as any,
    });

    // 5. Initialize Monitor
    const monitor = await (tx as any).projectMonitor.create({
      data: {
        projectId: project.id,
        totalHeld: data.totalEscrow,
        status: "ACTIVE",
      }
    });

    return { project, monitor };
  });

  // 6. Update Scores (outside transaction)
  const { updateReputationScores } = await import("@/lib/scoring");
  await updateReputationScores(data.employerId);

  return result;
}

/**
 * Initializes the escrow for an existing project and creates the ProjectMonitor entry.
 * Use for projects created before atomic funding was implemented or manual adjustments.
 */
export async function holdProjectFunds(projectId: string, amount: number) {
  const updatedProject = await db.$transaction(async (tx) => {
    const project = await tx.project.findUnique({
      where: { id: projectId },
      include: { employer: true, milestones: true }
    });

    if (!project) throw new Error("Project not found");
    if (project.employer.virtualBalance < amount) {
      throw new Error("Insufficient virtual balance to publish project node");
    }

    // 1. Deduct from employer balance
    await tx.user.update({
      where: { id: project.employerId },
      data: { 
        virtualBalance: { decrement: amount },
        projectsCreatedCount: { increment: 1 },
        totalMilestonesCreated: { increment: project.milestones?.length || 0 }
      }
    });

    // 2. Update project escrow
    const updatedProject = await tx.project.update({
      where: { id: projectId },
      data: {
        escrowBalance: { increment: amount },
        escrowStatus: EscrowStatus.HELD,
      } as any,
    });

    let monitor = await (tx as any).projectMonitor.findUnique({
      where: { projectId }
    });

    if (!monitor) {
      monitor = await (tx as any).projectMonitor.create({
        data: {
          projectId,
          totalHeld: amount,
          status: MonitorStatus.ACTIVE,
        }
      });
    } else {
      await (tx as any).projectMonitor.update({
        where: { id: monitor.id },
        data: { totalHeld: { increment: amount } }
      });
    }

    return updatedProject;
  });

  // 3. Update Scores (outside transaction)
  const { updateReputationScores } = await import("@/lib/scoring");
  await updateReputationScores(updatedProject.employerId);
}

/**
 * Triggered when a freelancer submits a milestone and it passes AQA.
 * Creates a monitor action and emails the employer.
 */
export async function onMilestoneSubmitted(milestoneId: string) {
  const milestone = await db.milestone.findUnique({
    where: { id: milestoneId },
    include: { 
      project: { 
        include: { employer: true } 
      } 
    }
  });

  if (!milestone) throw new Error("Milestone not found");

  const monitor = await (db as any).projectMonitor.findUnique({
    where: { projectId: milestone.projectId }
  });
  if (!monitor) return;

  const autoReleaseDays = (milestone.project as any).autoReleaseDays || 5;
  const autoReleaseAt = new Date();
  autoReleaseAt.setDate(autoReleaseAt.getDate() + autoReleaseDays);

  const action = await db.$transaction(async (tx) => {
    const newAction = await (tx as any).monitorAction.create({
      data: {
        monitorId: monitor.id,
        milestoneId: milestone.id,
        actionType: ActionType.NOTIFY_EMPLOYER,
        status: ActionStatus.PENDING,
        amount: milestone.amount,
        submittedAt: new Date(),
        responseDeadline: autoReleaseAt,
        autoReleaseAt: autoReleaseAt,
      },
    });

    await (tx as any).projectMonitor.update({
      where: { id: monitor.id },
      data: { lastAction: new Date() },
    });

    return newAction;
  });

  // 📧 Send email to employer
  const employer = milestone.project.employer;
  if (employer?.email) {
    const emailPayload = renderMilestoneSubmittedEmail(employer.email, {
      projectTitle: milestone.project.title,
      milestoneTitle: milestone.title,
      amount: milestone.amount,
      deadline: autoReleaseAt,
    });
    await sendEmail(emailPayload);
  }

  return action;
}

/**
 * Releases funds for a milestone. Can be called by auto-release or manual approval.
 */
export async function executeRelease(actionId: string, isAuto: boolean = false) {
  return await db.$transaction(async (tx) => {
    const action = await (tx as any).monitorAction.findUnique({
      where: { id: actionId },
      include: { 
        monitor: { include: { project: true } },
        milestone: { include: { project: { include: { freelancer: true, employer: true } } } }
      },
    });

    if (!action || !action.milestone) {
      throw new Error("Invalid action for release");
    }

    const freelancer = action.milestone.project.freelancer;
    if (!freelancer) throw new Error("No freelancer assigned to project");

    // 1. Credit freelancer
    await tx.user.update({
      where: { id: freelancer.id },
      data: { virtualBalance: { increment: action.amount || 0 } },
    });

    // 2. Deduct from project escrow
    await tx.project.update({
      where: { id: action.monitor.projectId },
      data: { 
        escrowBalance: { decrement: action.amount || 0 },
        escrowStatus: EscrowStatus.PARTIAL
      } as any,
    });

    // 3. Update monitor stats
    await (tx as any).projectMonitor.update({
      where: { id: action.monitorId },
      data: { 
        totalHeld: { decrement: action.amount || 0 },
        totalReleased: { increment: action.amount || 0 },
        lastAction: new Date()
      },
    });

    // 4. Close the action
    await (tx as any).monitorAction.update({
      where: { id: actionId },
      data: { 
        status: isAuto ? ActionStatus.AUTO_RELEASED : ActionStatus.MANUALLY_REVIEWED,
        executedAt: new Date()
      },
    });

    // 5. Update Employer Metrics
    const reviewHours = (new Date().getTime() - action.submittedAt.getTime()) / (1000 * 60 * 60);
    const paidWithin48h = reviewHours <= 48;

    await tx.user.update({
      where: { id: action.monitor.project.employerId },
      data: {
        totalMilestonesApproved: { increment: 1 },
        milestonesPaidWithin48h: { increment: paidWithin48h ? 1 : 0 },
        totalReviewHours: { increment: reviewHours },
      }
    });

    // 6. Update Freelancer Metrics
    await tx.user.update({
      where: { id: freelancer.id },
      data: {
        milestonesCompletedCount: { increment: 1 },
      }
    });

    // 7. Approve the milestone
    await tx.milestone.update({
      where: { id: action.milestoneId! },
      data: { status: "APPROVED" },
    });

    // 8. Check if project is finished
    const remainingMilestones = await tx.milestone.count({
      where: { 
        projectId: action.monitor.projectId,
        status: { not: "APPROVED" }
      }
    });

    if (remainingMilestones === 0) {
      await tx.user.update({
        where: { id: action.monitor.project.employerId },
        data: { projectsCompletedCount: { increment: 1 } }
      });
      await tx.user.update({
        where: { id: action.milestone.project.freelancerId! },
        data: { projectsFinishedCount: { increment: 1 } }
      });
      await tx.project.update({
        where: { id: action.monitor.projectId },
        data: { status: "COMPLETED" }
      });
    }

    // 9. Update Scores
    const { updateReputationScores } = await import("@/lib/scoring");
    await updateReputationScores(action.monitor.project.employerId);
    await updateReputationScores(freelancer.id);

    // 📧 Send email notification
    const employer = action.milestone.project.employer;
    if (employer?.email) {
      const templateFn = isAuto ? renderPaymentAutoReleasedEmail : renderPaymentManuallyReleasedEmail;
      const emailPayload = templateFn(employer.email, {
        projectTitle: action.milestone.project.title,
        milestoneTitle: action.milestone.title,
        amount: action.amount || 0,
      });
      await sendEmail(emailPayload);
    }

    return action;
  });
}

/**
 * Rejects a milestone and escalates for human review.
 */
export async function handleRejection(actionId: string, reason: string) {
  return await db.$transaction(async (tx) => {
    const action = await (tx as any).monitorAction.findUnique({
      where: { id: actionId },
      include: { 
        monitor: true, 
        milestone: { include: { project: { include: { freelancer: true, employer: true } } } } 
      },
    });

    if (!action) {
      throw new Error("Invalid action for rejection");
    }

    // 1. Escalate the action
    await (tx as any).monitorAction.update({
      where: { id: actionId },
      data: { status: ActionStatus.ESCALATED, metadata: { rejectionReason: reason } },
    });

    // 2. Dispute the monitor
    await (tx as any).projectMonitor.update({
      where: { id: action.monitorId },
      data: { status: MonitorStatus.DISPUTED },
    });

    // 3. Update Employer Metrics
    await tx.user.update({
      where: { id: action.monitor.project.employerId },
      data: {
        totalRejectionsCount: { increment: 1 },
        totalMilestonesDisputedByEmp: { increment: 1 },
      }
    });

    // 4. Update Freelancer Metrics
    await tx.user.update({
      where: { id: action.milestone.project.freelancerId! },
      data: {
        disputesLostCount: { increment: 1 },
      }
    });

    // 5. Reject the milestone
    await tx.milestone.update({
      where: { id: action.milestoneId! },
      data: { status: "REJECTED" },
    });

    // 6. Update Scores
    const { updateReputationScores } = await import("@/lib/scoring");
    await updateReputationScores(action.monitor.project.employerId);
    await updateReputationScores(action.milestone.project.freelancerId!);

    // 📧 Notify freelancer of rejection
    const freelancer = action.milestone?.project?.freelancer;
    if (freelancer?.email) {
      const emailPayload = renderMilestoneRejectedEmail(freelancer.email, {
        projectTitle: action.milestone.project.title,
        milestoneTitle: action.milestone.title,
        amount: action.amount || 0,
      });
      await sendEmail(emailPayload);
    }

    return action;
  });
}
