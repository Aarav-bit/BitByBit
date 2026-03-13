export type EmailTemplateId =
  | "milestone-submitted"
  | "milestone-auto-release-warning"
  | "payment-auto-released"
  | "payment-manually-released"
  | "milestone-rejected";

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

interface MilestoneContext {
  projectTitle: string;
  milestoneTitle: string;
  amount: number;
  deadline?: Date;
}

export function renderMilestoneSubmittedEmail(
  to: string,
  ctx: MilestoneContext
): EmailPayload {
  const deadlineText = ctx.deadline
    ? ctx.deadline.toLocaleString()
    : "the configured auto-release deadline";

  return {
    to,
    subject: `BITBYBIT // Milestone ready for review: ${ctx.milestoneTitle}`,
    html: `
      <h2>Milestone Completed – Review Required</h2>
      <p>Your freelancer has submitted work for the following milestone:</p>
      <ul>
        <li><strong>Project</strong>: ${ctx.projectTitle}</li>
        <li><strong>Milestone</strong>: ${ctx.milestoneTitle}</li>
        <li><strong>Escrow Amount</strong>: $${ctx.amount.toFixed(2)}</li>
      </ul>
      <p>
        Please review this milestone by <strong>${deadlineText}</strong>.
        If you do not respond by this time, the BITBYBIT AI Monitor will
        automatically release payment from escrow to the freelancer.
      </p>
      <p>
        You can approve or reject this milestone from your dashboard.
      </p>
    `,
  };
}

export function renderMilestoneAutoReleaseWarningEmail(
  to: string,
  ctx: MilestoneContext
): EmailPayload {
  const deadlineText = ctx.deadline
    ? ctx.deadline.toLocaleString()
    : "the configured auto-release deadline";

  return {
    to,
    subject: `BITBYBIT // Auto-release warning: ${ctx.milestoneTitle}`,
    html: `
      <h2>Auto-Release Countdown</h2>
      <p>
        This is a reminder that the following milestone is scheduled for
        automatic payment release soon:
      </p>
      <ul>
        <li><strong>Project</strong>: ${ctx.projectTitle}</li>
        <li><strong>Milestone</strong>: ${ctx.milestoneTitle}</li>
        <li><strong>Escrow Amount</strong>: $${ctx.amount.toFixed(2)}</li>
      </ul>
      <p>
        If you do not take action by <strong>${deadlineText}</strong>,
        the BITBYBIT AI Monitor will release the funds to the freelancer.
      </p>
    `,
  };
}

export function renderPaymentAutoReleasedEmail(
  to: string,
  ctx: MilestoneContext
): EmailPayload {
  return {
    to,
    subject: `BITBYBIT // Payment auto-released: ${ctx.milestoneTitle}`,
    html: `
      <h2>Payment Auto-Released</h2>
      <p>
        The monitoring window for the following milestone has expired without
        a response. Payment has been automatically released from escrow.
      </p>
      <ul>
        <li><strong>Project</strong>: ${ctx.projectTitle}</li>
        <li><strong>Milestone</strong>: ${ctx.milestoneTitle}</li>
        <li><strong>Amount Released</strong>: $${ctx.amount.toFixed(2)}</li>
      </ul>
      <p>
        All actions are logged in the BITBYBIT AI Monitor for transparency.
      </p>
    `,
  };
}

export function renderPaymentManuallyReleasedEmail(
  to: string,
  ctx: MilestoneContext
): EmailPayload {
  return {
    to,
    subject: `BITBYBIT // Payment released: ${ctx.milestoneTitle}`,
    html: `
      <h2>Payment Released</h2>
      <p>
        You have approved the following milestone. Payment has been released
        from escrow to the freelancer.
      </p>
      <ul>
        <li><strong>Project</strong>: ${ctx.projectTitle}</li>
        <li><strong>Milestone</strong>: ${ctx.milestoneTitle}</li>
        <li><strong>Amount Released</strong>: $${ctx.amount.toFixed(2)}</li>
      </ul>
      <p>
        This decision is recorded in the BITBYBIT AI Monitor.
      </p>
    `,
  };
}

export function renderMilestoneRejectedEmail(
  to: string,
  ctx: MilestoneContext
): EmailPayload {
  return {
    to,
    subject: `BITBYBIT // Milestone rejected: ${ctx.milestoneTitle}`,
    html: `
      <h2>Milestone Rejected</h2>
      <p>
        The employer has rejected the following milestone. The BITBYBIT AI
        Monitor has flagged this for review.
      </p>
      <ul>
        <li><strong>Project</strong>: ${ctx.projectTitle}</li>
        <li><strong>Milestone</strong>: ${ctx.milestoneTitle}</li>
        <li><strong>Escrow Amount</strong>: $${ctx.amount.toFixed(2)}</li>
      </ul>
      <p>
        Please review the feedback and coordinate next steps. If necessary,
        this decision can be escalated for human review.
      </p>
    `,
  };
}


