// places.js
// ---------------------------------------------------------------
// Server-side proxy for the Google Places API (New) — Text Search.
//
// WHY THIS LIVES ON THE BACKEND, NOT THE FRONTEND:
//   Google's Places endpoints (places.googleapis.com) do not send
//   CORS headers, so a browser `fetch()` straight to Google is
//   blocked. The API key would also be sitting in plain sight in
//   browser devtools if called from the client. Routing it through
//   our own server avoids both problems: this file holds the key,
//   and the frontend just calls our own `/api/places/search`.
//
// FALLBACK BEHAVIOR:
//   If GOOGLE_PLACES_API_KEY is not set, isConfigured() returns
//   false and the frontend automatically falls back to the free
//   Photon/Nominatim/local-dataset search (see src/utils/placesService.js).
//   Nothing breaks if you haven't set up billing yet — you just get
//   the old, more limited search until you do.
// ---------------------------------------------------------------

const API_KEY = process.env.GOOGLE_PLACES_API_KEY || "";
const SEARCH_URL = "https://places.googleapis.com/v1/places:searchText";

// Kannur service area — used to bias (not hard-restrict) results so
// "Chala" in Kannur is preferred over "Chala" somewhere else in India.
const KANNUR_CENTER = { latitude: 11.8745, longitude: 75.3704 };
const BIAS_RADIUS_METERS = 30000; // 30km covers the whole service area

export function isConfigured() {
  return Boolean(API_KEY);
}

export function configStatus() {
  return {
    configured: isConfigured(),
    hint: isConfigured()
      ? null
      : "Set GOOGLE_PLACES_API_KEY in server/.env to enable live Google-quality place search.",
  };
}

/**
 * searchGooglePlaces — text search biased to the Kannur area.
 * Returns a normalized array: [{ description, lat, lng, placeId }]
 * matching the shape the frontend's searchPlaces() already expects.
 *
 * If `debug` is true, returns { places, raw, status } instead, where
 * `raw` is Google's actual response body — useful for seeing the real
 * error (billing/API-not-enabled/key-restriction) instead of a
 * silently-swallowed empty array.
 */
export async function searchGooglePlaces(query, { debug = false } = {}) {
  if (!isConfigured()) {
    return debug ? { places: [], raw: null, status: null, error: "NOT_CONFIGURED" } : [];
  }
  if (!query || query.trim().length < 2) {
    return debug ? { places: [], raw: null, status: null, error: "QUERY_TOO_SHORT" } : [];
  }

  try {
    const res = await fetch(SEARCH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask":
          "places.id,places.displayName,places.formattedAddress,places.location",
      },
      body: JSON.stringify({
        textQuery: query,
        regionCode: "IN",
        locationBias: {
          circle: {
            center: KANNUR_CENTER,
            radius: BIAS_RADIUS_METERS,
          },
        },
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.error("Google Places search failed:", res.status, JSON.stringify(data));
      return debug ? { places: [], raw: data, status: res.status } : [];
    }

    const places = (data?.places || [])
      .map((p) => ({
        placeId: p.id,
        description:
          [p.displayName?.text, p.formattedAddress].filter(Boolean).join(", ") ||
          p.formattedAddress ||
          p.displayName?.text ||
          "Unknown place",
        lat: p.location?.latitude,
        lng: p.location?.longitude,
      }))
      .filter((p) => typeof p.lat === "number" && typeof p.lng === "number");

    return debug ? { places, raw: data, status: res.status } : places;
  } catch (err) {
    console.error("Google Places request error:", err);
    return debug ? { places: [], raw: null, status: null, error: String(err) } : [];
  }
}
