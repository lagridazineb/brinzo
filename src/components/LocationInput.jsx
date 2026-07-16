import { useState, useRef, useEffect, useId } from "react";
import { searchPlaces, getPlaceDetails, getCurrentLocation, isLiveMode } from "../utils/placesService";
import "./LocationInput.css";

/**
 * LocationInput — debounced Kerala place autocomplete.
 * value: { description, lat, lng, placeId? } | null
 * onChange(place)
 */
export default function LocationInput({
  value,
  onChange,
  placeholder = "Enter location",
  dotColor = "lagoon",
  showCurrentLocation = false,
}) {
  const [query, setQuery] = useState(value?.description || "");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const debounceRef = useRef(null);
  const wrapRef = useRef(null);
  const listId = useId();

  useEffect(() => {
    setQuery(value?.description || "");
  }, [value]);

  useEffect(() => {
    function onClickOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function handleInput(e) {
    const v = e.target.value;
    setQuery(v);
    setOpen(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (v.trim().length < 2) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      const places = await searchPlaces(v);
      setResults(places);
      setLoading(false);
    }, 280);
  }

  async function handleSelect(place) {
    setLoading(true);
    const resolved = await getPlaceDetails(place);
    setLoading(false);
    setQuery(resolved.description);
    setOpen(false);
    setResults([]);
    onChange(resolved);
  }

  async function handleUseCurrentLocation() {
    setLocating(true);
    try {
      const loc = await getCurrentLocation();
      setQuery(loc.description);
      onChange(loc);
      setOpen(false);
    } catch {
      // silently ignore — user can type instead
    } finally {
      setLocating(false);
    }
  }

  return (
    <div className="location-input" ref={wrapRef}>
      <span className={`location-input__dot location-input__dot--${dotColor}`} />
      <input
        className="location-input__field"
        type="text"
        value={query}
        onChange={handleInput}
        onFocus={() => query.trim().length >= 2 && setOpen(true)}
        placeholder={placeholder}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        autoComplete="off"
      />
      {query && (
        <button
          type="button"
          className="location-input__clear"
          aria-label="Clear"
          onClick={() => {
            setQuery("");
            setResults([]);
            onChange(null);
          }}
        >
          ×
        </button>
      )}

      {open && (query.trim().length >= 2 || showCurrentLocation) && (
        <div className="location-input__panel" id={listId} role="listbox">
          {showCurrentLocation && (
            <button
              type="button"
              className="location-input__current"
              onClick={handleUseCurrentLocation}
              disabled={locating}
            >
              <span className="location-input__current-icon">⦿</span>
              {locating ? "Locating…" : "Use my current location"}
            </button>
          )}

          {query.trim().length >= 2 && (
            <>
              {loading && <div className="location-input__hint">Searching Kannur…</div>}
              {!loading && results.length === 0 && (
                <div className="location-input__hint">No places found in Kannur for "{query}"</div>
              )}
              {!loading &&
                results.map((place, i) => (
                  <button
                    type="button"
                    key={place.placeId || place.description + i}
                    className="location-input__option"
                    role="option"
                    onClick={() => handleSelect(place)}
                  >
                    <span className="location-input__option-pin">📍</span>
                    <span className="location-input__option-text">
                      <span className="location-input__option-main">{place.description.split(",")[0]}</span>
                      <span className="location-input__option-sub">
                        {place.description.split(",").slice(1).join(",").trim()}
                        {place.category ? ` · ${place.category}` : ""}
                      </span>
                    </span>
                  </button>
                ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export function PlacesModeBadge() {
  if (isLiveMode()) return null;
  return (
    <p className="location-input__mode-note">
      Showing Kannur service area places. Add a Google Maps API key for live search — see README.
    </p>
  );
}
