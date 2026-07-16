// whatsapp.js
// ---------------------------------------------------------------
// Thin client for Meta's WhatsApp Cloud API (graph.facebook.com).
//
// THE PART MOST INTEGRATIONS GET WRONG (and likely why your image
// never sent before): you cannot just hand WhatsApp a local file
// path or a URL on your own machine. Two separate calls are
// required:
//
//   1. POST /{PHONE_NUMBER_ID}/media   — upload the binary,
//      get back a media_id
//   2. POST /{PHONE_NUMBER_ID}/messages — send a message that
//      references that media_id
//
// A plain "send this URL as an image" call only works if the URL
// is genuinely public and reachable by Meta's servers — a
// localhost or private-network path never works, which is the
// most common reason an image silently fails to arrive.
// ---------------------------------------------------------------
import fs from "fs";
import path from "path";

const GRAPH_VERSION = process.env.WHATSAPP_GRAPH_VERSION || "v21.0";
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || "";
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || "";
const RECIPIENT_NUMBER = process.env.WHATSAPP_RECIPIENT_NUMBER || ""; // your own WhatsApp number, in E.164 w/o '+', e.g. 919876543210

const BASE_URL = `https://graph.facebook.com/${GRAPH_VERSION}`;

export function isConfigured() {
  return Boolean(PHONE_NUMBER_ID && ACCESS_TOKEN && RECIPIENT_NUMBER);
}

export function configStatus() {
  return {
    configured: isConfigured(),
    missing: [
      !PHONE_NUMBER_ID && "WHATSAPP_PHONE_NUMBER_ID",
      !ACCESS_TOKEN && "WHATSAPP_ACCESS_TOKEN",
      !RECIPIENT_NUMBER && "WHATSAPP_RECIPIENT_NUMBER",
    ].filter(Boolean),
  };
}

/**
 * Step 1 — upload a local file to WhatsApp's media store, get a media_id.
 * mimeType must be one Meta supports for images: image/jpeg, image/png, image/webp.
 */
async function uploadMedia(localFilePath, mimeType) {
  const fileBuffer = fs.readFileSync(localFilePath);
  const filename = path.basename(localFilePath);

  const form = new FormData();
  form.append("messaging_product", "whatsapp");
  form.append("file", new Blob([fileBuffer], { type: mimeType }), filename);

  const res = await fetch(`${BASE_URL}/${PHONE_NUMBER_ID}/media`, {
    method: "POST",
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
    body: form,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`MEDIA_UPLOAD_FAILED: ${JSON.stringify(data)}`);
  }
  return data.id; // media_id
}

/**
 * Step 2 — send a text message.
 */
async function sendText(body) {
  const res = await fetch(`${BASE_URL}/${PHONE_NUMBER_ID}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: RECIPIENT_NUMBER,
      type: "text",
      text: { body },
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`SEND_TEXT_FAILED: ${JSON.stringify(data)}`);
  }
  return data;
}

/**
 * Step 3 — send an image message referencing an already-uploaded media_id.
 */
async function sendImageByMediaId(mediaId, caption) {
  const res = await fetch(`${BASE_URL}/${PHONE_NUMBER_ID}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: RECIPIENT_NUMBER,
      type: "image",
      image: { id: mediaId, caption: caption || undefined },
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`SEND_IMAGE_FAILED: ${JSON.stringify(data)}`);
  }
  return data;
}

function mimeFromExt(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  return "image/jpeg"; // covers .jpg/.jpeg, and HEIC gets converted before this point ideally
}

/**
 * Sends a full order notification: the formatted text message, then
 * (if an item image was provided) the image as a separate message
 * with the item description as its caption.
 *
 * localImagePath: absolute path on disk to the uploaded item image,
 * or null/undefined if no image was provided.
 */
export async function sendOrderNotification({ messageText, localImagePath }) {
  if (!isConfigured()) {
    const status = configStatus();
    throw new Error(
      `WHATSAPP_NOT_CONFIGURED: missing ${status.missing.join(", ")}. ` +
        `Set these in server/.env — see server/.env.example.`
    );
  }

  const results = { textSent: false, imageSent: false, mediaId: null };

  await sendText(messageText);
  results.textSent = true;

  if (localImagePath && fs.existsSync(localImagePath)) {
    const mimeType = mimeFromExt(localImagePath);
    const mediaId = await uploadMedia(localImagePath, mimeType);
    results.mediaId = mediaId;
    await sendImageByMediaId(mediaId, "📦 Item photo");
    results.imageSent = true;
  }

  return results;
}
