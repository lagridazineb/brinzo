// db.js
// ---------------------------------------------------------------
// Minimal JSON-file datastore for bookings. No native bindings —
// works identically on every OS. Good enough for a small business
// tool; swap for a real database if this grows.
// ---------------------------------------------------------------
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, "data", "store.json");

function readStore() {
  if (!fs.existsSync(DATA_FILE)) return { bookings: {}, idempotencyKeys: {} };
  try {
    const store = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
    if (!store.idempotencyKeys) store.idempotencyKeys = {};
    return store;
  } catch {
    return { bookings: {}, idempotencyKeys: {} };
  }
}

function writeStore(store) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2));
}

// If the same idempotencyKey was used for an earlier booking, return
// that booking's id instead of creating a new one. This is a second
// line of defense (belt-and-suspenders) alongside the frontend's own
// duplicate-call guard — it also protects against network retries.
export function findBookingByIdempotencyKey(key) {
  if (!key) return null;
  const store = readStore();
  const id = store.idempotencyKeys[key];
  return id ? store.bookings[id] || null : null;
}

export function saveBooking(id, booking, idempotencyKey) {
  const store = readStore();
  store.bookings[id] = booking;
  if (idempotencyKey) store.idempotencyKeys[idempotencyKey] = id;
  writeStore(store);
}

export function getBooking(id) {
  const store = readStore();
  return store.bookings[id] || null;
}

export function listBookings() {
  const store = readStore();
  return Object.values(store.bookings).sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
}

export function updateBooking(id, patch) {
  const store = readStore();
  if (!store.bookings[id]) return null;
  store.bookings[id] = { ...store.bookings[id], ...patch };
  writeStore(store);
  return store.bookings[id];
}
