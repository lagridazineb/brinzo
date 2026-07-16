// email.js
// ---------------------------------------------------------------
// Optional second notification channel: emails the admin the same
// order details (and the item photo, if any) whenever a booking
// comes in. Works independently of the WhatsApp channel — you can
// have one, the other, or both configured.
//
// Uses the Resend API (https://resend.com) — just fill in
// RESEND_API_KEY, EMAIL_FROM and ADMIN_EMAIL in server/.env
// (and in your host's dashboard for the deployed version).
// ---------------------------------------------------------------
import { Resend } from "resend";
import fs from "fs";
import path from "path";

const RESEND_API_KEY = (process.env.RESEND_API_KEY || "").trim();
// Must be an address on a domain you've verified in Resend, e.g.
// "orders@yourdomain.com" — or Resend's own sandbox sender
// "onboarding@resend.dev" (only delivers to your own Resend account
// email until you verify a domain).
const EMAIL_FROM = (process.env.EMAIL_FROM || "").trim();
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "").trim();

let resend = null;

export function isEmailConfigured() {
  return Boolean(RESEND_API_KEY && EMAIL_FROM && ADMIN_EMAIL);
}

export function emailConfigStatus() {
  return {
    configured: isEmailConfigured(),
    missing: [
      !RESEND_API_KEY && "RESEND_API_KEY",
      !EMAIL_FROM && "EMAIL_FROM",
      !ADMIN_EMAIL && "ADMIN_EMAIL",
    ].filter(Boolean),
  };
}

function getClient() {
  if (!resend) {
    resend = new Resend(RESEND_API_KEY);
  }
  return resend;
}

/**
 * Sends the order notification by email to ADMIN_EMAIL.
 * messageText: the same plain-text order summary used for WhatsApp.
 * localImagePath: absolute path to the item photo on disk, or null.
 */
export async function sendOrderEmail({ subject, messageText, localImagePath }) {
  if (!isEmailConfigured()) {
    const status = emailConfigStatus();
    throw new Error(
      `EMAIL_NOT_CONFIGURED: missing ${status.missing.join(", ")}. Set these in server/.env ` +
        `(and in your hosting dashboard's environment variables for the deployed server).`
    );
  }

  const attachments = [];
  if (localImagePath && fs.existsSync(localImagePath)) {
    attachments.push({
      filename: "item-photo" + path.extname(localImagePath),
      content: fs.readFileSync(localImagePath).toString("base64"),
    });
  }

  const html = `<pre style="font-family:ui-monospace,Menlo,Consolas,monospace;font-size:14px;white-space:pre-wrap;">${messageText.replace(
    /[<>&]/g,
    (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c])
  )}</pre>`;

  const { data, error } = await getClient().emails.send({
    from: EMAIL_FROM,
    to: ADMIN_EMAIL,
    subject: subject || "New BRINZO order",
    text: messageText,
    html,
    attachments,
  });

  if (error) {
    const msg = error.message || JSON.stringify(error);
    if (/domain is not verified/i.test(msg)) {
      throw new Error(
        `Resend rejected the send: the EMAIL_FROM domain isn't verified yet. Verify a domain ` +
          `at resend.com/domains, or temporarily use "onboarding@resend.dev" as EMAIL_FROM ` +
          `(sandbox sender — only delivers to the email on your Resend account).`
      );
    }
    if (/api key/i.test(msg)) {
      throw new Error(
        `Resend rejected the API key. Generate a fresh one at resend.com/api-keys and ` +
          `update RESEND_API_KEY in server/.env and in your host's environment variables.`
      );
    }
    throw new Error(`Resend error: ${msg}`);
  }

  return { sent: true, id: data?.id };
}
