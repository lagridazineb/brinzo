// auth.js
// ---------------------------------------------------------------
// Very small admin-login system. On purpose this does NOT pull in
// a database or an auth provider — there's exactly one admin
// account, configured via env vars, and tokens live in memory.
//
//   ADMIN_USERNAME / ADMIN_PASSWORD  -> the one admin login
//   ADMIN_SESSION_SECRET             -> used to sign tokens
//
// If the server restarts, everyone is logged out (tokens are
// in-memory only) — acceptable for a small ops dashboard, and
// avoids needing a real database just for sessions.
// ---------------------------------------------------------------
import crypto from "crypto";

const ADMIN_USERNAME = (process.env.ADMIN_USERNAME || "").trim();
const ADMIN_PASSWORD = (process.env.ADMIN_PASSWORD || "").trim();
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || "brinzo-dev-secret-change-me";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

// token -> { username, expiresAt }
const sessions = new Map();

export function isAdminConfigured() {
  return Boolean(ADMIN_USERNAME && ADMIN_PASSWORD);
}

function timingSafeEqual(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Verifies username/password and, if valid, returns a fresh token.
 * Returns null if credentials are wrong or admin isn't configured.
 */
export function loginAdmin(username, password) {
  if (!isAdminConfigured()) return null;
  if (!username || !password) return null;
  if (!timingSafeEqual(username, ADMIN_USERNAME) || !timingSafeEqual(password, ADMIN_PASSWORD)) {
    return null;
  }

  const token = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(`${username}:${crypto.randomBytes(24).toString("hex")}:${Date.now()}`)
    .digest("hex");

  sessions.set(token, { username, expiresAt: Date.now() + SESSION_TTL_MS });
  return token;
}

export function verifyToken(token) {
  if (!token) return null;
  const session = sessions.get(token);
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    sessions.delete(token);
    return null;
  }
  return session;
}

export function logoutAdmin(token) {
  sessions.delete(token);
}

/**
 * Express middleware — expects "Authorization: Bearer <token>".
 */
export function requireAdmin(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  const session = verifyToken(token);
  if (!session) {
    return res.status(401).json({ ok: false, error: "UNAUTHORIZED" });
  }
  req.admin = session;
  next();
}
