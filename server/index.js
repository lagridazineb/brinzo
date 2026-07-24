import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { nanoid } from "nanoid";
import { saveBooking, getBooking, listBookings, updateBooking, findBookingByIdempotencyKey } from "./db.js";
import { sendOrderNotification, isConfigured, configStatus } from "./whatsapp.js";
import { sendOrderEmail, isEmailConfigured, emailConfigStatus } from "./email.js";
import { sendCallMeBotMessage, isCallMeBotConfigured, callMeBotConfigStatus } from "./callmebot.js";
import { formatOrderMessage } from "./formatMessage.js";
import { loginAdmin, logoutAdmin, verifyToken, requireAdmin, isAdminConfigured } from "./auth.js";
import { searchGooglePlaces, isConfigured as isGooglePlacesConfigured, configStatus as googlePlacesConfigStatus } from "./places.js";
import { sendOtp, verifyOtp, isOtpConfigured, otpConfigStatus } from "./otp.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.join(__dirname, "uploads");
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use("/uploads", express.static(UPLOADS_DIR));

// ---------------- Image upload ----------------
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/heic"]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "").slice(0, 10) || ".jpg";
    cb(null, `${nanoid(12)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      cb(new Error("UNSUPPORTED_FILE_TYPE"));
      return;
    }
    cb(null, true);
  },
});

app.post("/api/upload-item-image", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ ok: false, error: "NO_FILE" });
  }
  res.json({
    ok: true,
    url: `/uploads/${req.file.filename}`,
    filename: req.file.filename,
  });
});

app.use((err, _req, res, next) => {
  if (err && err.message === "UNSUPPORTED_FILE_TYPE") {
    return res.status(415).json({ ok: false, error: "UNSUPPORTED_FILE_TYPE" });
  }
  if (err && err.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ ok: false, error: "FILE_TOO_LARGE" });
  }
  next(err);
});

// ---------------- Admin auth ----------------
app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body || {};
  const token = loginAdmin(username, password);
  if (!token) {
    return res.status(401).json({ ok: false, error: "INVALID_CREDENTIALS" });
  }
  res.json({ ok: true, token });
});

app.post("/api/admin/logout", (req, res) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (token) logoutAdmin(token);
  res.json({ ok: true });
});

app.get("/api/admin/me", requireAdmin, (req, res) => {
  res.json({ ok: true, username: req.admin.username });
});

// ---------------- Phone login OTP (via Fast2SMS) ----------------
app.post("/api/otp/send", async (req, res) => {
  const { phone } = req.body || {};
  try {
    const result = await sendOtp(phone);
    res.json({ ok: true, ...result });
  } catch (err) {
    const message = err.message || "";
    if (message === "INVALID_PHONE") {
      return res.status(400).json({ ok: false, error: "INVALID_PHONE" });
    }
    if (message === "COOLDOWN") {
      return res.status(429).json({ ok: false, error: "COOLDOWN" });
    }
    if (message.startsWith("OTP_NOT_CONFIGURED")) {
      console.warn(`[OTP] ${message}`);
      return res.status(503).json({ ok: false, error: "OTP_NOT_CONFIGURED", detail: message });
    }
    console.error("[OTP] Failed to send:", message);
    res.status(502).json({ ok: false, error: "SEND_FAILED", detail: message });
  }
});

app.post("/api/otp/verify", (req, res) => {
  const { phone, code } = req.body || {};
  const result = verifyOtp(phone, code);
  if (!result.ok) {
    return res.status(400).json({ ok: false, error: result.error });
  }
  res.json({ ok: true });
});

// ---------------- Bookings (-> WhatsApp + Email) ----------------
app.post("/api/bookings", async (req, res) => {
  const payload = req.body || {};

  // If the client already sent this exact booking (e.g. a retried
  // request, or two calls racing on the frontend), hand back the
  // original booking instead of creating a second one.
  if (payload.idempotencyKey) {
    const existing = findBookingByIdempotencyKey(payload.idempotencyKey);
    if (existing) {
      return res.json({ ok: true, booking: existing, deduped: true });
    }
  }

  const id =
    "BNZ" + nanoid(6).toUpperCase().replace(/[^A-Z0-9]/g, "X") + Date.now().toString().slice(-4);

  const record = { id, ...payload, createdAt: new Date().toISOString() };
  saveBooking(id, record, payload.idempotencyKey);

  const messageText = formatOrderMessage(record);

  let localImagePath = null;
  if (record.item?.imageUrl) {
    const filename = path.basename(record.item.imageUrl);
    const candidate = path.join(UPLOADS_DIR, filename);
    if (fs.existsSync(candidate)) localImagePath = candidate;
  }

  let whatsapp = { attempted: false, ok: false, error: null };

  if (isConfigured()) {
    whatsapp.attempted = true;
    try {
      const result = await sendOrderNotification({ messageText, localImagePath });
      whatsapp = { attempted: true, ok: true, ...result };
    } catch (err) {
      whatsapp = { attempted: true, ok: false, error: err.message };
      console.error("[WhatsApp] Failed to send order notification:", err.message);
    }
  } else {
    const status = configStatus();
    whatsapp.error = `Not configured. Missing: ${status.missing.join(", ")}`;
    console.warn(`[WhatsApp] Skipped — ${whatsapp.error}`);
  }

  let email = { attempted: false, ok: false, error: null };

  if (isEmailConfigured()) {
    email.attempted = true;
    try {
      await sendOrderEmail({
        subject: `📦 New BRINZO Order — ${id}`,
        messageText,
        localImagePath,
      });
      email = { attempted: true, ok: true };
    } catch (err) {
      email = { attempted: true, ok: false, error: err.message };
      console.error("[Email] Failed to send order notification:", err.message);
    }
  } else {
    const status = emailConfigStatus();
    email.error = `Not configured. Missing: ${status.missing.join(", ")}`;
    console.warn(`[Email] Skipped — ${email.error}`);
  }

  // CallMeBot: a much quicker-to-set-up WhatsApp alternative to the
  // Meta Cloud API above. Text only (no photo), runs independently —
  // fine to have both this and the Meta channel configured at once.
  let callmebot = { attempted: false, ok: false, error: null };

  if (isCallMeBotConfigured()) {
    callmebot.attempted = true;
    try {
      await sendCallMeBotMessage(messageText);
      callmebot = { attempted: true, ok: true };
    } catch (err) {
      callmebot = { attempted: true, ok: false, error: err.message };
      console.error("[CallMeBot] Failed to send order notification:", err.message);
    }
  } else {
    const status = callMeBotConfigStatus();
    callmebot.error = `Not configured. Missing: ${status.missing.join(", ")}`;
    console.warn(`[CallMeBot] Skipped — ${callmebot.error}`);
  }

  updateBooking(id, { whatsapp, email, callmebot });

  res.json({ ok: true, booking: { ...record, whatsapp, email, callmebot } });
});

// Booking status lookup (used by the customer-facing tracking page)
// stays public — a customer needs to check their own order without
// logging in as admin.
// Admin can nudge/confirm the *exact* pickup or drop pin (the customer's
// typed address is sometimes imprecise) so the location shared with the
// delivery person is spot-on. Only touches the field(s) sent.
app.patch("/api/bookings/:id/location", requireAdmin, (req, res) => {
  const { id } = req.params;
  const { pickup, drop } = req.body || {};

  const patch = {};
  if (pickup && typeof pickup.lat === "number" && typeof pickup.lng === "number") {
    patch.pickup = pickup;
  }
  if (drop && typeof drop.lat === "number" && typeof drop.lng === "number") {
    patch.drop = drop;
  }
  if (Object.keys(patch).length === 0) {
    return res.status(400).json({ ok: false, error: "NO_VALID_LOCATION" });
  }

  const updated = updateBooking(id, patch);
  if (!updated) return res.status(404).json({ ok: false, error: "NOT_FOUND" });
  res.json({ ok: true, booking: updated });
});

app.get("/api/bookings/:id", (req, res) => {
  const booking = getBooking(req.params.id);
  if (!booking) return res.status(404).json({ ok: false, error: "NOT_FOUND" });
  res.json({ ok: true, booking });
});

// Full bookings list is admin-only — this is the data source for
// the admin dashboard.
app.get("/api/bookings", requireAdmin, (_req, res) => {
  res.json({ ok: true, bookings: listBookings() });
});

// ---------------- Place search (Google Places, server-side) ----------------
// Frontend calls this instead of hitting Google directly (Google's Places
// endpoints don't support browser CORS, and this keeps the key off the
// client). If no key is configured, returns an empty list — the frontend
// then falls back to its free Photon/Nominatim search automatically.
app.get("/api/places/search", async (req, res) => {
  const q = (req.query.q || "").toString();
  const debug = req.query.debug === "1";
  try {
    const result = await searchGooglePlaces(q, { debug });
    if (debug) {
      return res.json({ ok: true, configured: isGooglePlacesConfigured(), ...result });
    }
    res.json({ ok: true, configured: isGooglePlacesConfigured(), places: result });
  } catch (err) {
    console.error("Places search route error:", err);
    res.status(500).json({ ok: false, configured: isGooglePlacesConfigured(), places: [] });
  }
});

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    whatsapp: configStatus(),
    callmebot: callMeBotConfigStatus(),
    email: emailConfigStatus(),
    otp: otpConfigStatus(),
    googlePlaces: googlePlacesConfigStatus(),
    adminConfigured: isAdminConfigured(),
  });
});

app.listen(PORT, () => {
  console.log(`BRINZO backend running at http://localhost:${PORT}`);

  const waStatus = configStatus();
  console.log(
    waStatus.configured
      ? "WhatsApp (Meta Cloud API): configured ✅"
      : `WhatsApp (Meta Cloud API): NOT configured — missing ${waStatus.missing.join(", ")}`
  );

  const cmbStatus = callMeBotConfigStatus();
  console.log(
    cmbStatus.configured
      ? "WhatsApp (CallMeBot, quick setup): configured ✅"
      : `WhatsApp (CallMeBot, quick setup): NOT configured — missing ${cmbStatus.missing.join(", ")}`
  );

  const emailStatus = emailConfigStatus();
  console.log(
    emailStatus.configured
      ? "Email: configured ✅"
      : `Email: NOT configured — missing ${emailStatus.missing.join(", ")}`
  );

  console.log(
    isAdminConfigured()
      ? "Admin login: configured ✅"
      : "Admin login: NOT configured — set ADMIN_USERNAME / ADMIN_PASSWORD in server/.env"
  );

  const otpStatus = otpConfigStatus();
  console.log(
    otpStatus.configured
      ? "OTP (Fast2SMS): configured ✅"
      : `OTP (Fast2SMS): NOT configured — missing ${otpStatus.missing.join(", ")}`
  );

  if (!waStatus.configured || !emailStatus.configured || !isAdminConfigured() || !otpStatus.configured) {
    console.log("See server/.env.example to set these up.");
  }
});
