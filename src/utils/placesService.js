/**
 * placesService.js
 * ------------------------------------------------------------------
 * Location search for Brinzo's Kannur service area.
 *
 * Search strategy (in order):
 *   0. Google Places (New), via our own backend — best coverage
 *      (schools, pharmacies, small local businesses). Only runs if
 *      GOOGLE_PLACES_API_KEY is set on the server; see server/places.js.
 *      If this returns results, we use them and skip the free sources
 *      below entirely (faster, and no point double-querying).
 *   1. Photon API (OSM-based, no API key, very accurate, biased to Kannur)
 *   2. Nominatim fallback (no bounded — just India-wide bias toward Kannur)
 *   3. Local KANNUR_PLACES dataset for well-known places missing from OSM
 *
 * Routing: Open Source Routing Machine / OSRM (free, no API key)
 * Reverse geocoding: Nominatim
 * ------------------------------------------------------------------
 */
import { searchPlacesBackend } from "./api.js";

export const KANNUR_BOUNDS = {
  north: 12.100,
  south: 11.650,
  west:  75.200,
  east:  75.650,
};

export const KANNUR_CENTER = { lat: 11.8745, lng: 75.3704 };

export function isLiveMode() {
  return true;
}

/**
 * Local fallback dataset.
 * Covers well-known Kannur places that may be missing from OSM
 * (malls, landmarks, junctions, hospitals, etc.)
 * All coordinates are verified against real GPS data.
 */
const KANNUR_PLACES = [
  // ── Secura Centre Mall ─────────────────────────────────────────
  { description: "Secura Centre Kannur Mall, Thazhe Chovva, Elayavoor, Kannur",  category: "Mall",     lat: 11.8658, lng: 75.4072 },
  { description: "Secura Mall, NH 66, Elayavoor, Kannur",                        category: "Mall",     lat: 11.8658, lng: 75.4072 },

  // ── Kannur Town Core ─────────────────────────────────────────────
  { description: "Kannur Town, Kannur, Kerala",                    category: "Area",     lat: 11.8745, lng: 75.3704 },
  { description: "Kannur Railway Station, Kannur",                  category: "Transit",  lat: 11.8689, lng: 75.3717 },
  { description: "Kannur Bus Stand, Thavakkara, Kannur",            category: "Transit",  lat: 11.8669, lng: 75.3717 },
  { description: "Kannur KSRTC Bus Stand, Kannur",                  category: "Transit",  lat: 11.8754, lng: 75.3744 },
  { description: "Thavakkara, Kannur",                              category: "Area",     lat: 11.8680, lng: 75.3708 },
  { description: "SM Street, Kannur Town",                          category: "Street",   lat: 11.8750, lng: 75.3720 },
  { description: "Fort Road, Kannur",                               category: "Street",   lat: 11.8670, lng: 75.3620 },
  { description: "Station Road, Kannur",                            category: "Street",   lat: 11.8720, lng: 75.3730 },
  { description: "Kannur Town Hall, Kannur",                        category: "Landmark", lat: 11.8760, lng: 75.3680 },
  { description: "Kannur District Collectorate, Kannur",            category: "Office",   lat: 11.8748, lng: 75.3722 },
  { description: "Kannur District Hospital, Kannur",                category: "Hospital", lat: 11.8619, lng: 75.3714 },
  { description: "Talap, Kannur",                                   category: "Area",     lat: 11.8800, lng: 75.3720 },
  { description: "Puzhathi, Kannur",                                category: "Area",     lat: 11.8690, lng: 75.3510 },
  { description: "Puzhathi Junction, Kannur",                       category: "Junction", lat: 11.8692, lng: 75.3512 },
  { description: "Caltex Bus Stop, Puzhathi, Kannur",               category: "Transit",  lat: 11.8693, lng: 75.3513 },

  // ── Payyambalam & Seafront ───────────────────────────────────────
  { description: "Payyambalam Beach, Kannur",                       category: "Landmark", lat: 11.8814, lng: 75.3438 },
  { description: "Payyambalam Beach Road, Kannur",                  category: "Street",   lat: 11.8800, lng: 75.3460 },
  { description: "Payyambalam, Kannur",                             category: "Area",     lat: 11.8810, lng: 75.3480 },
  { description: "St. Angelo Fort, Kannur",                         category: "Landmark", lat: 11.8517, lng: 75.3618 },
  { description: "Pallikunnu, Kannur",                              category: "Area",     lat: 11.8710, lng: 75.3540 },

  // ── Chovva ────────────────────────────────────────────────────
  { description: "Chovva, Kannur",                                  category: "Area",     lat: 11.8810, lng: 75.3510 },
  { description: "Thazhe Chovva, Kannur",                           category: "Area",     lat: 11.8658, lng: 75.4072 },
  { description: "Chovva Junction, Kannur",                         category: "Junction", lat: 11.8815, lng: 75.3512 },
  { description: "Chovva Mambaram Road, Kannur",                    category: "Street",   lat: 11.8660, lng: 75.4070 },

  // ── Elayavoor & East Kannur ───────────────────────────────────
  { description: "Elayavoor, Kannur",                               category: "Area",     lat: 11.8826, lng: 75.3996 },
  { description: "Elayavoor Junction, Kannur",                      category: "Junction", lat: 11.8826, lng: 75.3996 },
  { description: "NH 66, Elayavoor, Kannur",                        category: "Street",   lat: 11.8660, lng: 75.4500 },
  { description: "Kannothumchal, Kannur",                           category: "Area",     lat: 11.8740, lng: 75.4200 },
  { description: "Chelora, Kannur",                                  category: "Area",     lat: 11.9000, lng: 75.4400 },
  { description: "Chelora Junction, Kannur",                        category: "Junction", lat: 11.9005, lng: 75.4405 },
  { description: "Valiyannur, Kannur",                              category: "Area",     lat: 11.8940, lng: 75.4380 },

  // ── Eachur & Munderi ──────────────────────────────────────────
  { description: "Eachur, Kannur",                                  category: "Area",     lat: 11.9067, lng: 75.4478 },
  { description: "Eachur Junction, Kannur",                         category: "Junction", lat: 11.9014, lng: 75.4457 },
  { description: "Munderi, Kannur",                                  category: "Area",     lat: 11.9265, lng: 75.4393 },

  // ── Chala ────────────────────────────────────────────────────
  { description: "Chala, Kannur, Kerala",                           category: "Area",     lat: 11.8473, lng: 75.4334 },
  { description: "Chala Market, Kannur",                            category: "Market",   lat: 11.8470, lng: 75.4335 },
  { description: "Chala Junction, Kannur",                          category: "Junction", lat: 11.8470, lng: 75.4335 },

  // ── Valapattanam & South West ─────────────────────────────────
  { description: "Valapattanam, Kannur",                            category: "Area",     lat: 11.8540, lng: 75.3600 },
  { description: "Valapattanam Junction, Kannur",                   category: "Junction", lat: 11.8540, lng: 75.3600 },

  // ── Azhikode & Coastal North ──────────────────────────────────
  { description: "Azhikode, Kannur",                                category: "Area",     lat: 11.9100, lng: 75.3280 },
  { description: "Dharmadam, Kannur",                               category: "Area",     lat: 11.9250, lng: 75.3400 },
  { description: "Dharmadam Beach, Kannur",                         category: "Landmark", lat: 11.9280, lng: 75.3360 },
  { description: "Dharmadam Island, Kannur",                        category: "Landmark", lat: 11.9280, lng: 75.3360 },

  // ── Hospitals & Healthcare ────────────────────────────────────
  { description: "Aster MIMS Hospital, Kanjirode, Kannur",          category: "Hospital", lat: 11.8860, lng: 75.3680 },
  { description: "Pariyaram Medical College, Kannur",                category: "Hospital", lat: 11.9540, lng: 75.4570 },
  { description: "Baby Memorial Hospital, Kannur",                  category: "Hospital", lat: 11.8760, lng: 75.3720 },
  { description: "VIMS Hospital, Kannur",                           category: "Hospital", lat: 11.8600, lng: 75.3638 },
  { description: "District Hospital Kannur",                        category: "Hospital", lat: 11.8619, lng: 75.3714 },

  // ── Shopping & Malls ─────────────────────────────────────────
  { description: "Decathlon Sports Kannur, NH 66",                  category: "Shopping", lat: 11.8665, lng: 75.4710 },
  { description: "Kannur City Market, Kannur",                      category: "Market",   lat: 11.8750, lng: 75.3715 },
  { description: "Bazar Road, Kannur",                              category: "Market",   lat: 11.8750, lng: 75.3720 },

  // ── Education ─────────────────────────────────────────────────
  { description: "Kannur University, Mangattuparamba",              category: "Education", lat: 11.9030, lng: 75.4650 },

  // ── Thalassery ────────────────────────────────────────────────
  { description: "Thalassery, Kannur",                              category: "Area",     lat: 11.7530, lng: 75.4930 },
  { description: "Thalassery Railway Station, Kannur",              category: "Transit",  lat: 11.7533, lng: 75.4937 },
  { description: "Thalassery Bus Stand, Kannur",                    category: "Transit",  lat: 11.7525, lng: 75.4932 },
  { description: "Thalassery Fort, Kannur",                         category: "Landmark", lat: 11.7519, lng: 75.4897 },

  // ── Key Junctions & Restaurants ──────────────────────────────
  { description: "Thana Junction, Kannur",                          category: "Junction", lat: 11.8668, lng: 75.3697 },
  { description: "Anjarakandy, Kannur",                             category: "Area",     lat: 11.8940, lng: 75.3840 },
  { description: "Edakkad, Kannur",                                 category: "Area",     lat: 11.8850, lng: 75.3930 },
  { description: "Pepperpot Restaurant, Thavakkara, Kannur",        category: "Restaurant", lat: 11.8680, lng: 75.3720 },
  { description: "Pulari Restaurant, Talap, Kannur",                category: "Restaurant", lat: 11.8800, lng: 75.3730 },
  { description: "Hotel Odhen's, Thavakkara, Kannur",               category: "Restaurant", lat: 11.8760, lng: 75.3700 },
  { description: "Melechowa, Kannur",                               category: "Area",     lat: 11.8620, lng: 75.4350 },
  { description: "Marakkarkandy, Kannur",                           category: "Area",     lat: 11.8450, lng: 75.4300 },
  { description: "Kodapparambu, Kannur",                            category: "Area",     lat: 11.8300, lng: 75.3900 },
  { description: "State Bank Colony, Kannur",                       category: "Area",     lat: 11.8870, lng: 75.3900 },
];

// ── Query preprocessing ───────────────────────────────────────────────
/**
 * Extract the most searchable part of a query.
 * If the user pastes a full address like "Secura Centre KANNUR - MALL, Thazhe Chovva, ...",
 * we extract only "Secura Centre Kannur Mall" (the first meaningful segment).
 */
function extractSearchTerm(query) {
  if (!query) return "";
  let q = query.trim();
  // Map common spelling variants
  q = q.replace(/\btavakkara\b/gi, "Thavakkara");
  q = q.replace(/\bcannanore\b/gi, "Kannur");
  q = q.replace(/\bknr\b/gi, "Kannur");
  q = q.replace(/\brd\b/gi, "Road");
  q = q.replace(/\bst\b/gi, "Street");

  // If query has commas (full address pasted), try to extract the best search term:
  // Take up to the first 2 comma-separated segments to preserve location context
  const parts = q.split(",").map((s) => s.trim()).filter(Boolean);
  if (parts.length >= 3) {
    // e.g. "Secura Centre Kannur - Mall, Thazhe Chovva, Chovva Mambaram Rd, Elayavoor, Kerala 670018"
    // → "Secura Centre Kannur Mall" + "Thazhe Chovva"
    const mainName = parts[0].replace(/[-–]/g, " ").replace(/\s+/g, " ").trim();
    return mainName;
  }
  return q;
}

function searchMockPlaces(query) {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  // Score: higher score = better match
  const scored = KANNUR_PLACES.map((p) => {
    const desc = p.description.toLowerCase();
    // Exact word match at start = highest score
    if (desc.startsWith(q)) return { p, score: 3 };
    // Any word in description starts with query = high score
    if (desc.split(/[\s,]+/).some((w) => w.startsWith(q))) return { p, score: 2 };
    // Contains anywhere = lower score
    if (desc.includes(q)) return { p, score: 1 };
    return { p, score: 0 };
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.p);
  return scored.slice(0, 6);
}

/**
 * searchPlaces — Smart multi-source search for Kannur.
 *
 * Strategy:
 *   1. Photon (OSM geocoder, proximity-biased to Kannur, no API key)
 *   2. Nominatim fallback (no bounded restriction — just India-wide)
 *   3. Local mock dataset for places not in OSM (like Secura Centre Mall)
 *
 * The LOCAL dataset is ALWAYS included if it matches — this is essential
 * for places that exist in Google Maps but not in OSM.
 */
export async function searchPlaces(query) {
  if (!query || query.trim().length < 2) return [];

  const searchTerm = extractSearchTerm(query);

  // ── 0. Google Places (New), via backend — best coverage ──────────
  // If configured and it finds something, use it and stop here.
  try {
    const googleMatches = await searchPlacesBackend(searchTerm);
    if (googleMatches.length > 0) return googleMatches.slice(0, 10);
  } catch (err) {
    console.warn("Google Places backend search failed:", err);
  }

  const mockMatches = searchMockPlaces(searchTerm);

  // ── 1 & 2. Query Photon AND Nominatim IN PARALLEL and merge both ──
  // (Previously Nominatim only ran if Photon returned zero results, which
  // meant that a single loosely-related Photon hit could suppress a much
  // better Nominatim match. Both are OSM-based so neither has full coverage
  // of small local businesses — running both and merging maximizes recall.)
  let liveMatches = [];

  const photonPromise = (async () => {
    const out = [];
    try {
      const photonUrl = [
        `https://photon.komoot.io/api/`,
        `?q=${encodeURIComponent(searchTerm)}`,
        `&lat=${KANNUR_CENTER.lat}`,
        `&lon=${KANNUR_CENTER.lng}`,
        `&limit=8`,
        `&lang=en`,
      ].join("");

      const res = await fetch(photonUrl);
      if (res.ok) {
        const data = await res.json();
        const features = data?.features || [];
        for (const f of features) {
          const props = f.properties || {};
          const coords = f.geometry?.coordinates; // [lng, lat]
          if (!coords) continue;
          const lat = coords[1];
          const lng = coords[0];

          // Only include results within or near the Kannur district
          if (
            lat < KANNUR_BOUNDS.south - 0.5 ||
            lat > KANNUR_BOUNDS.north + 0.5 ||
            lng < KANNUR_BOUNDS.west - 0.5 ||
            lng > KANNUR_BOUNDS.east + 0.5
          )
            continue;

          // Build a readable display name
          const parts = [
            props.name,
            props.street,
            props.city || props.town || props.village || props.county,
            props.state,
          ]
            .filter(Boolean)
            .filter((v, i, arr) => arr.indexOf(v) === i); // dedupe
          const description = parts.join(", ");
          if (!description) continue;

          out.push({ description, lat, lng });
        }
      }
    } catch (err) {
      console.warn("Photon search failed:", err);
    }
    return out;
  })();

  const nominatimPromise = (async () => {
    const out = [];
    try {
      const nomUrl = [
        `https://nominatim.openstreetmap.org/search`,
        `?q=${encodeURIComponent(searchTerm + ", Kannur, Kerala")}`,
        `&format=json`,
        `&addressdetails=1`,
        `&limit=8`,
        `&countrycodes=in`,
        // Bias (not hard-restrict) toward the Kannur district
        `&viewbox=${KANNUR_BOUNDS.west},${KANNUR_BOUNDS.north},${KANNUR_BOUNDS.east},${KANNUR_BOUNDS.south}`,
        `&bounded=0`,
      ].join("");

      const res = await fetch(nomUrl, { headers: { "User-Agent": "BrinzoLiveMap/2.0" } });
      if (res.ok) {
        const data = await res.json();
        for (const r of data || []) {
          out.push({
            description: r.display_name,
            lat: parseFloat(r.lat),
            lng: parseFloat(r.lon),
          });
        }
      }
    } catch (err) {
      console.warn("Nominatim search failed:", err);
    }
    return out;
  })();

  const [photonResults, nominatimResults] = await Promise.all([
    photonPromise,
    nominatimPromise,
  ]);

  // Merge, de-duping near-identical coordinates, Photon first (usually
  // cleaner names for autocomplete-style queries).
  const liveSeen = new Set();
  for (const p of [...photonResults, ...nominatimResults]) {
    const key = `${p.lat.toFixed(4)},${p.lng.toFixed(4)}`;
    if (!liveSeen.has(key)) {
      liveSeen.add(key);
      liveMatches.push(p);
    }
  }

  // ── 3. Merge: live results first, then local mock (for OSM gaps) ─
  const seen = new Set(
    liveMatches.map((p) => `${p.lat.toFixed(4)},${p.lng.toFixed(4)}`)
  );
  const combined = [...liveMatches];
  for (const p of mockMatches) {
    const key = `${p.lat.toFixed(4)},${p.lng.toFixed(4)}`;
    if (!seen.has(key)) {
      seen.add(key);
      combined.push(p);
    }
  }

  // If we have nothing at all, try again with just the raw query
  if (combined.length === 0 && query !== searchTerm) {
    return searchPlaces(searchTerm);
  }

  return combined.slice(0, 10);
}

/**
 * getRoadDistance — real driving distance/duration via OSRM (free).
 */
export async function getRoadDistance(origin, destination) {
  if (!origin?.lat || !origin?.lng || !destination?.lat || !destination?.lng) return null;
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=false`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const route = data?.routes?.[0];
    if (!route) return null;
    return {
      distanceKm: route.distance / 1000,
      durationMin: Math.round(route.duration / 60),
    };
  } catch (err) {
    console.error("OSRM distance error:", err);
    return null;
  }
}

/**
 * getRoadRoute — real road geometry + distance/duration via OSRM.
 */
export async function getRoadRoute(origin, destination) {
  const fallback =
    origin?.lat && destination?.lat
      ? {
          distanceKm: null,
          durationMin: null,
          geometry: [
            [origin.lat, origin.lng],
            [destination.lat, destination.lng],
          ],
        }
      : null;

  if (!origin?.lat || !origin?.lng || !destination?.lat || !destination?.lng) return fallback;

  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    if (!res.ok) return fallback;
    const data = await res.json();
    const route = data?.routes?.[0];
    if (!route) return fallback;

    // OSRM GeoJSON coords are [lng, lat] — flip to Leaflet [lat, lng]
    const coords = route.geometry?.coordinates || [];
    const geometry = coords.map(([lng, lat]) => [lat, lng]);

    return {
      distanceKm: route.distance / 1000,
      durationMin: Math.round(route.duration / 60),
      geometry: geometry.length ? geometry : fallback.geometry,
    };
  } catch (err) {
    console.error("OSRM route error:", err);
    return fallback;
  }
}

export async function getPlaceDetails(place) {
  return place;
}

export async function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("GEOLOCATION_UNSUPPORTED"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          description: "My current location",
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}

/**
 * reverseGeocode — lat/lng → address string via Nominatim.
 */
export async function reverseGeocode(lat, lng) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=18&addressdetails=1`;
    const res = await fetch(url, { headers: { "User-Agent": "BrinzoLiveMap/2.0" } });
    if (!res.ok) throw new Error("Failed");
    const data = await res.json();
    return {
      description: data.display_name || `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
      lat,
      lng,
    };
  } catch {
    return { description: `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`, lat, lng };
  }
}
