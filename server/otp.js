// otp.js
// ---------------------------------------------------------------
// Phone-login OTP, sent via Fast2SMS (https://www.fast2sms.com).
// Codes are kept in memory (fine for a single small server — they
// live for a few minutes anyway). If FAST2SMS_API_KEY isn't set,
// isOtpConfigured() is false and the frontend falls back to the
// demo code 123456 instead of calling this at all for verify.
// ---------------------------------------------------------------

const FAST2SMS_API_KEY = (process.env.FAST2SMS_API_KEY || "").trim();

const OTP_TTL_MS = 5 * 60 * 1000; // code valid for 5 minutes
const RESEND_COOLDOWN_MS = 30 * 1000; // matches the 29s timer in Otp.jsx
const MAX_ATTEMPTS = 5;

// phone (10 digits, no country code) -> { code, expiresAt, attempts, lastSentAt }
const store = new Map();

export function isOtpConfigured() {
  return Boolean(FAST2SMS_API_KEY);
}

export function otpConfigStatus() {
  return {
    configured: isOtpConfigured(),
    missing: [!FAST2SMS_API_KEY && "FAST2SMS_API_KEY"].filter(Boolean),
  };
}

function normalizePhone(phone) {
  const digits = (phone || "").toString().replace(/\D/g, "");
  // Accept a leading "91" country code and strip it, so both
  // "8089118428" and "918089118428" work the same way.
  const stripped = digits.length === 12 && digits.startsWith("91") ? digits.slice(2) : digits;
  return stripped;
}

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function sendViaFast2Sms(phone, code) {
  const url = new URL("https://www.fast2sms.com/dev/bulkV2");
  url.searchParams.set("authorization", FAST2SMS_API_KEY);
  url.searchParams.set("route", "otp");
  url.searchParams.set("variables_values", code);
  url.searchParams.set("flash", "0");
  url.searchParams.set("numbers", phone);

  const res = await fetch(url.toString(), { method: "GET" });
  const data = await res.json().catch(() => ({}));

  if (!res.ok || data.return !== true) {
    const detail = data.message
      ? Array.isArray(data.message)
        ? data.message.join("; ")
        : data.message
      : `HTTP ${res.status}`;
    throw new Error(`FAST2SMS_ERROR: ${detail}`);
  }

  return { requestId: data.request_id };
}

/**
 * Generates a fresh code, sends it via Fast2SMS, and stores it for
 * verification. Throws INVALID_PHONE, COOLDOWN, or an
 * "OTP_NOT_CONFIGURED..." / "FAST2SMS_ERROR: ..." message on failure.
 */
export async function sendOtp(phone) {
  const normalized = normalizePhone(phone);
  if (normalized.length !== 10) {
    throw new Error("INVALID_PHONE");
  }

  const existing = store.get(normalized);
  if (existing && Date.now() - existing.lastSentAt < RESEND_COOLDOWN_MS) {
    throw new Error("COOLDOWN");
  }

  if (!isOtpConfigured()) {
    const status = otpConfigStatus();
    throw new Error(`OTP_NOT_CONFIGURED: missing ${status.missing.join(", ")}`);
  }

  const code = generateCode();
  await sendViaFast2Sms(normalized, code);

  store.set(normalized, {
    code,
    expiresAt: Date.now() + OTP_TTL_MS,
    attempts: 0,
    lastSentAt: Date.now(),
  });

  return { sent: true };
}

/**
 * Verifies a submitted code against the stored one.
 * Returns { ok: true } or { ok: false, error } where error is one of
 * NOT_FOUND, EXPIRED, TOO_MANY_ATTEMPTS, INCORRECT_CODE.
 */
export function verifyOtp(phone, code) {
  const normalized = normalizePhone(phone);
  const entry = store.get(normalized);

  if (!entry) {
    return { ok: false, error: "NOT_FOUND" };
  }
  if (Date.now() > entry.expiresAt) {
    store.delete(normalized);
    return { ok: false, error: "EXPIRED" };
  }
  if (entry.attempts >= MAX_ATTEMPTS) {
    store.delete(normalized);
    return { ok: false, error: "TOO_MANY_ATTEMPTS" };
  }
  if ((code || "").toString() !== entry.code) {
    entry.attempts += 1;
    return { ok: false, error: "INCORRECT_CODE" };
  }

  store.delete(normalized);
  return { ok: true };
}
