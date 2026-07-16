// callmebot.js
// ---------------------------------------------------------------
// An easier alternative to the official WhatsApp Cloud API for
// getting a plain-text notification to your own phone. It's a free,
// unofficial third-party service (not affiliated with WhatsApp/Meta)
// — no business account or app review needed, just a one-time
// WhatsApp message to activate it. Trade-offs vs. the Cloud API in
// whatsapp.js:
//   - Text only (no item photo — the photo still goes out by email
//     if you've set that up, or is visible in the admin dashboard).
//   - Personal-use / best-effort — not meant for high volume.
//   - Can only message the one phone number it was activated for.
//
// Setup (~2 minutes, see server/CALLMEBOT_SETUP.md for details):
//   1. Save CallMeBot's WhatsApp contact on your phone (get the
//      current number from callmebot.com — it occasionally changes).
//   2. WhatsApp it: "I allow callmebot to send me messages"
//   3. It replies with an API key. Put that in CALLMEBOT_APIKEY
//      below, and your own WhatsApp number in CALLMEBOT_PHONE.
// ---------------------------------------------------------------

const CALLMEBOT_PHONE = process.env.CALLMEBOT_PHONE || "";
const CALLMEBOT_APIKEY = process.env.CALLMEBOT_APIKEY || "";

export function isCallMeBotConfigured() {
  return Boolean(CALLMEBOT_PHONE && CALLMEBOT_APIKEY);
}

export function callMeBotConfigStatus() {
  return {
    configured: isCallMeBotConfigured(),
    missing: [!CALLMEBOT_PHONE && "CALLMEBOT_PHONE", !CALLMEBOT_APIKEY && "CALLMEBOT_APIKEY"].filter(
      Boolean
    ),
  };
}

export async function sendCallMeBotMessage(text) {
  if (!isCallMeBotConfigured()) {
    const status = callMeBotConfigStatus();
    throw new Error(`CALLMEBOT_NOT_CONFIGURED: missing ${status.missing.join(", ")}.`);
  }

  const url =
    `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(CALLMEBOT_PHONE)}` +
    `&text=${encodeURIComponent(text)}&apikey=${encodeURIComponent(CALLMEBOT_APIKEY)}`;

  const res = await fetch(url);
  const body = await res.text();

  // CallMeBot returns 200 with an error message in the body on
  // failure (invalid key, not activated, etc.) rather than a
  // non-2xx status, so we have to check the text itself too.
  if (!res.ok || /error/i.test(body)) {
    throw new Error(`CallMeBot request failed: ${body.slice(0, 200)}`);
  }

  return { sent: true };
}
