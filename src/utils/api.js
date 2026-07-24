// api.js
// ---------------------------------------------------------------
// Thin client for the BRINZO backend (see /server). All requests
// go to VITE_API_URL, defaulting to localhost:4000 for local dev.
// ---------------------------------------------------------------

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

class ApiError extends Error {
  constructor(message, data) {
    super(message);
    this.data = data;
  }
}

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      headers: options.body instanceof FormData ? undefined : { "Content-Type": "application/json" },
      ...options,
    });
  } catch {
    throw new ApiError("NETWORK_ERROR", { error: "NETWORK_ERROR" });
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(data.error || "REQUEST_FAILED", data);
  }
  return data;
}

// ---------------- Admin ----------------
// Bearer-token requests for the admin dashboard. Token is passed in
// explicitly (rather than stashed globally) so callers stay in
// control of where it's stored (see AdminAuthContext).
async function adminRequest(path, token, options = {}) {
  return request(path, {
    ...options,
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function adminLogin(username, password) {
  return request("/api/admin/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export async function adminLogout(token) {
  return request("/api/admin/logout", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function adminMe(token) {
  return adminRequest("/api/admin/me", token);
}

export async function adminListBookings(token) {
  return adminRequest("/api/bookings", token);
}

// Save an admin-adjusted exact pickup/drop pin for a booking (see
// AdminDashboard's "Exact location" panel). Only send the field(s)
// you're changing, e.g. { drop: { lat, lng, description } }.
export async function adminUpdateBookingLocation(token, id, patch) {
  return request(`/api/bookings/${id}/location`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
}

export async function uploadItemImage(file) {
  const form = new FormData();
  form.append("image", file);
  return request("/api/upload-item-image", {
    method: "POST",
    body: form,
  });
}

export async function createBooking(booking) {
  return request("/api/bookings", {
    method: "POST",
    body: JSON.stringify(booking),
  });
}

export async function getBooking(id) {
  return request(`/api/bookings/${id}`);
}

// ---------------- Phone login OTP ----------------
export async function sendOtp(phone) {
  return request("/api/otp/send", {
    method: "POST",
    body: JSON.stringify({ phone }),
  });
}

export async function verifyOtp(phone, code) {
  return request("/api/otp/verify", {
    method: "POST",
    body: JSON.stringify({ phone, code }),
  });
}

export async function getHealth() {
  return request("/api/health");
}

// Google Places search (proxied through our own backend — see
// server/places.js). Returns [] if the backend has no key configured
// or the request fails; callers should treat that as "try the free
// fallback search instead", not as an error.
export async function searchPlacesBackend(query) {
  try {
    const data = await request(`/api/places/search?q=${encodeURIComponent(query)}`);
    return data.places || [];
  } catch {
    return [];
  }
}

export function imageUrl(path) {
  if (!path) return null;
  if (path.startsWith("http") || path.startsWith("data:")) return path;
  return `${API_URL}${path}`;
}

export { ApiError };
