import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import {
  KANNUR_BOUNDS,
  KANNUR_CENTER,
  searchPlaces,
  reverseGeocode,
} from "../utils/placesService";
import "./LiveMap.css";

// Padded bounding box so the map never scrolls out of the Kannur /
// Thalassery / Eachur service area — matches placesService's hard
// search restriction so what you can search is what you can see.
const PAD = 0.03;
const MAX_BOUNDS = L.latLngBounds(
  [KANNUR_BOUNDS.south - PAD, KANNUR_BOUNDS.west - PAD],
  [KANNUR_BOUNDS.north + PAD, KANNUR_BOUNDS.east + PAD]
);

function dotIcon(color) {
  return L.divIcon({
    className: "live-map__pin",
    html: `<span class="live-map__pin-dot" style="background:${color}"></span>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

const pickupIcon = dotIcon("var(--navy, #17324d)");
const dropIcon = dotIcon("var(--orange, #ff7a3d)");
const genericIcon = dotIcon("var(--navy, #17324d)");

/**
 * LiveMap — a real Google Maps street map (roads, lanes, junctions,
 * landmarks all rendered by Google's own tiles) scoped to Brinzo's
 * Kannur / Thalassery / Eachur service area.
 *
 * Props:
 *  - pickup, drop: { description, lat, lng } | null — draws pins
 *  - route: [[lat,lng], ...] | null — real road-following polyline
 *  - markers: [{ name, lat, lng }] — extra plain dots (e.g. service areas)
 *  - height: px height of the map box
 *  - showSearch: render the "Address, Business, Place..." search bar
 *  - onSearchSelect(place): called when a search result is picked
 *  - onMapClick(place, type): called when clicking map to set location (type is "pickup" | "drop")
 */
export default function LiveMap({
  pickup = null,
  drop = null,
  route = null,
  markers = null,
  height = 260,
  showSearch = false,
  searchPlaceholder = "Address, Business, Place, ZIP code, etc.",
  onSearchSelect,
  onMapClick = null,
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const layersRef = useRef({ pickup: null, drop: null, route: null, extra: [] });

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [clickMode, setClickMode] = useState("drop"); // "pickup" | "drop"

  const clickModeRef = useRef(clickMode);
  useEffect(() => {
    clickModeRef.current = clickMode;
  }, [clickMode]);

  // Init map once
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    const map = L.map(containerRef.current, {
      center: [KANNUR_CENTER.lat, KANNUR_CENTER.lng],
      zoom: 13,
      maxBounds: MAX_BOUNDS,
      maxBoundsViscosity: 0.6,
      minZoom: 11,
      zoomControl: true,
      attributionControl: true,
    });

    // Google Maps Roadmap tiles - detailed, clean, and free!
    L.tileLayer("https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
      maxZoom: 20,
      subdomains: ["mt0", "mt1", "mt2", "mt3"],
      attribution: "&copy; Google Maps",
    }).addTo(map);

    // Map click selection
    map.on("click", async (e) => {
      if (!onMapClick) return;
      const { lat, lng } = e.latlng;
      
      // Temporary user feedback: let's add a temporary generic marker while reverse-geocoding
      const tempMarker = L.marker([lat, lng], {
        icon: clickModeRef.current === "pickup" ? pickupIcon : dropIcon
      }).addTo(map);
      
      try {
        const place = await reverseGeocode(lat, lng);
        onMapClick(place, clickModeRef.current);
        // Switch click mode helper automatically after setting one (optional, but keep it manual/intuitive)
      } catch (err) {
        console.error("Map click geocode failed:", err);
      } finally {
        map.removeLayer(tempMarker);
      }
    });

    mapRef.current = map;

    // Fix sizing issues when the container mounts inside a flex/tab layout
    setTimeout(() => map.invalidateSize(), 150);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [onMapClick]);

  // Plain marker dots (e.g. landing page service areas)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    layersRef.current.extra.forEach((m) => map.removeLayer(m));
    layersRef.current.extra = [];

    if (markers && markers.length) {
      markers.forEach((m) => {
        const mk = L.marker([m.lat, m.lng], { icon: genericIcon }).addTo(map);
        if (m.name) mk.bindTooltip(m.name, { direction: "top", offset: [0, -6] });
        layersRef.current.extra.push(mk);
      });

      const group = L.featureGroup(layersRef.current.extra);
      map.fitBounds(group.getBounds().pad(0.25));
    }
  }, [markers]);

  // Pickup / drop markers + route
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (layersRef.current.pickup) map.removeLayer(layersRef.current.pickup);
    if (layersRef.current.drop) map.removeLayer(layersRef.current.drop);
    if (layersRef.current.route) map.removeLayer(layersRef.current.route);
    layersRef.current.pickup = null;
    layersRef.current.drop = null;
    layersRef.current.route = null;

    const boundsPoints = [];

    if (pickup?.lat) {
      const mk = L.marker([pickup.lat, pickup.lng], { icon: pickupIcon }).addTo(map);
      mk.bindTooltip(pickup.description?.split(",")[0] || "Pickup", {
        direction: "top",
        offset: [0, -8],
        permanent: false,
      });
      layersRef.current.pickup = mk;
      boundsPoints.push([pickup.lat, pickup.lng]);
    }

    if (drop?.lat) {
      const mk = L.marker([drop.lat, drop.lng], { icon: dropIcon }).addTo(map);
      mk.bindTooltip(drop.description?.split(",")[0] || "Drop", {
        direction: "top",
        offset: [0, -8],
        permanent: false,
      });
      layersRef.current.drop = mk;
      boundsPoints.push([drop.lat, drop.lng]);
    }

    if (route && route.length > 1) {
      const line = L.polyline(route, {
        color: "#17324d",
        weight: 4,
        opacity: 0.85,
        lineJoin: "round",
      }).addTo(map);
      layersRef.current.route = line;
      boundsPoints.push(...route);
    }

    if (boundsPoints.length === 1) {
      map.setView(boundsPoints[0], 15);
    } else if (boundsPoints.length > 1) {
      map.fitBounds(L.latLngBounds(boundsPoints).pad(0.25));
    }
  }, [pickup, drop, route]);

  // Search bar
  async function handleInput(e) {
    const v = e.target.value;
    setQuery(v);
    if (v.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    setOpen(true);
    const places = await searchPlaces(v);
    setResults(places);
  }

  function handlePick(place) {
    setQuery(place.description);
    setOpen(false);
    setResults([]);
    const map = mapRef.current;
    if (map && place.lat) {
      map.setView([place.lat, place.lng], 16);
      if (layersRef.current.searchMarker) map.removeLayer(layersRef.current.searchMarker);
      const mk = L.marker([place.lat, place.lng], { icon: genericIcon }).addTo(map);
      mk.bindTooltip(place.description?.split(",")[0] || "Selected", { permanent: true, direction: "top", offset: [0, -8] });
      layersRef.current.searchMarker = mk;
    }
    onSearchSelect?.(place);
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    if (results[0]) handlePick(results[0]);
  }

  return (
    <div className="live-map">
      {showSearch && (
        <form className="live-map__search" onSubmit={handleSearchSubmit}>
          <div className="live-map__search-box">
            <span className="live-map__search-icon">🔍</span>
            <input
              value={query}
              onChange={handleInput}
              placeholder={searchPlaceholder}
              onFocus={() => query.trim().length >= 2 && setOpen(true)}
              autoComplete="off"
            />
          </div>
          <button type="submit" className="live-map__search-btn">
            Search
          </button>

          {open && results.length > 0 && (
            <div className="live-map__suggestions">
              {results.map((r, i) => (
                <button
                  type="button"
                  key={r.placeId || r.description + i}
                  className="live-map__suggestion"
                  onClick={() => handlePick(r)}
                >
                  <span className="live-map__suggestion-pin">📍</span>
                  <span>
                    <strong>{r.description.split(",")[0]}</strong>
                    <span className="live-map__suggestion-sub">
                      {r.description.split(",").slice(1).join(",").trim()}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </form>
      )}

      {/* Floating click mode selector for interactive map input */}
      {onMapClick && (
        <div className="live-map__click-control">
          <span className="live-map__control-label">Click map to set:</span>
          <div className="live-map__control-tabs">
            <button
              type="button"
              className={`live-map__control-btn live-map__control-btn--pickup ${
                clickMode === "pickup" ? "live-map__control-btn--active" : ""
              }`}
              onClick={() => setClickMode("pickup")}
            >
              🔵 Pickup
            </button>
            <button
              type="button"
              className={`live-map__control-btn live-map__control-btn--drop ${
                clickMode === "drop" ? "live-map__control-btn--active" : ""
              }`}
              onClick={() => setClickMode("drop")}
            >
              🟠 Drop
            </button>
          </div>
        </div>
      )}

      <div className="live-map__canvas" style={{ height }} ref={containerRef} />
      
      {onMapClick && (
        <div className="live-map__click-tip">
          💡 Click or tap anywhere on the map to set the {clickMode} location
        </div>
      )}
    </div>
  );
}
