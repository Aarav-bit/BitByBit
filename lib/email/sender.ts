import { Resend } from "resend";
import type { EmailPayload } from "./templates";

/**
 * Resend email client.
 * 
 * Required env var:
 *   RESEND_API_KEY — Get from https://resend.com/api-keys
 */
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send an email using Resend.
 * Falls back to console.log if API key is missing.
 */
export async function sendEmail(payload: EmailPayload): Promise<void> {
  const { to, subject, html } = payload;

  // Graceful fallback for development
  if (!process.env.RESEND_API_KEY) {
    console.log("╔══════════════════════════════════════════════════════════╗");
    console.log("║  📧 EMAIL (dev mode - no RESEND_API_KEY configured)     ║");
    console.log("╠══════════════════════════════════════════════════════════╣");
    console.log(`║  TO:      ${to}`);
    console.log(`║  SUBJECT: ${subject}`);
    console.log("╚══════════════════════════════════════════════════════════╝");
    return;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: "FluxCred Monitor <onboarding@resend.dev>",
      to,
      subject,
      html,
    });

    if (error) {
      console.error(`[EMAIL_ERROR] Resend error for ${to}:`, error);
      return;
    }

    console.log(`[EMAIL_SENT] Resend ID: ${data?.id} → ${to}`);
  } catch (error) {
    console.error(`[EMAIL_ERROR] Failed to send to ${to}:`, error);
    // Don't throw — email failure shouldn't break the workflow
  }
}
