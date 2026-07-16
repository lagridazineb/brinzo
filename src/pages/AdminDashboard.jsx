import { useCallback, useEffect, useState } from "react";
import Logo from "../components/Logo";
import Button from "../components/Button";
import LiveMap from "../components/LiveMap";
import { useAdminAuth } from "../context/AdminAuthContext";
import { adminListBookings, adminUpdateBookingLocation, imageUrl, ApiError } from "../utils/api";
import "./AdminDashboard.css";

function shortLocation(place) {
  if (!place) return "—";
  if (typeof place === "string") return place;
  return place.description ? place.description.split(",")[0] : "—";
}

// A plain https://www.google.com/maps?q=lat,lng link opens directly to
// that exact pin in Google Maps (app or web) on any phone — no API key,
// no account, works for any messaging app the admin wants to send it
// through (WhatsApp, SMS, a phone call read-out, etc).
function mapsLink(place) {
  if (!place || typeof place.lat !== "number" || typeof place.lng !== "number") return null;
  return `https://www.google.com/maps?q=${place.lat},${place.lng}`;
}

function LocationSharePanel({ booking, onSaved }) {
  const [pickup, setPickup] = useState(booking.pickup);
  const [drop, setDrop] = useState(booking.drop);
  const [saving, setSaving] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  // Keep in sync if the list refreshes with server data (e.g. another
  // admin device already adjusted this pin).
  useEffect(() => {
    setPickup(booking.pickup);
    setDrop(booking.drop);
  }, [booking.pickup, booking.drop]);

  async function handleMapClick(place, type) {
    if (type === "pickup") setPickup(place);
    else setDrop(place);

    setSaving(true);
    try {
      const token = localStorage.getItem("brinzo_admin_token");
      const { booking: updated } = await adminUpdateBookingLocation(token, booking.id, {
        [type]: place,
      });
      onSaved?.(updated);
    } catch (err) {
      console.error("Failed to save adjusted location:", err);
    } finally {
      setSaving(false);
    }
  }

  async function copyLink(place, field) {
    const link = mapsLink(place);
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopiedField(field);
      setTimeout(() => setCopiedField((f) => (f === field ? null : f)), 2000);
    } catch {
      // Clipboard API can fail (e.g. insecure context) — fall back to
      // a prompt so the admin can still copy it manually.
      window.prompt("Copy this link:", link);
    }
  }

  return (
    <div className="admin-location-panel">
      <p className="admin-location-panel__tip">
        Click the map to fine-tune either pin if the typed address isn't exact, then copy the
        link and send it to the delivery person however you like.
        {saving && <span className="admin-location-panel__saving"> Saving…</span>}
      </p>

      <LiveMap pickup={pickup} drop={drop} height={220} onMapClick={handleMapClick} />

      {[
        { label: "Pickup", place: pickup, field: "pickup" },
        { label: "Drop", place: drop, field: "drop" },
      ].map(({ label, place, field }) => (
        <div className="admin-location-panel__row" key={field}>
          <span className="admin-location-panel__row-label">{label}</span>
          <span className="admin-location-panel__row-desc">{shortLocation(place)}</span>
          <div className="admin-location-panel__row-actions">
            <button
              type="button"
              className="admin-location-panel__btn"
              disabled={!mapsLink(place)}
              onClick={() => copyLink(place, field)}
            >
              {copiedField === field ? "✅ Copied" : "📋 Copy link"}
            </button>
            <a
              className="admin-location-panel__btn admin-location-panel__btn--link"
              href={mapsLink(place) || "#"}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => !mapsLink(place) && e.preventDefault()}
            >
              🗺️ Open
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}

function StatusPill({ label, status }) {
  // status: { attempted, ok, error }
  let tone = "off";
  let text = "Not set up";
  if (status?.attempted) {
    if (status.ok) {
      tone = "ok";
      text = "Sent";
    } else {
      tone = "fail";
      text = "Failed";
    }
  }
  return (
    <span className={`admin-pill admin-pill--${tone}`} title={status?.error || ""}>
      {label}: {text}
    </span>
  );
}

export default function AdminDashboard() {
  const { logout } = useAdminAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedIds, setExpandedIds] = useState(() => new Set());

  const toggleExpanded = useCallback((id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleLocationSaved = useCallback((updated) => {
    setBookings((prev) => prev.map((b) => (b.id === updated.id ? { ...b, ...updated } : b)));
  }, []);

  const load = useCallback(async () => {
    setError("");
    try {
      const data = await adminListBookings(localStorage.getItem("brinzo_admin_token"));
      setBookings(data.bookings || []);
    } catch (err) {
      if (err instanceof ApiError && err.data?.error === "UNAUTHORIZED") {
        logout();
        return;
      }
      setError("Couldn't load orders. Try refreshing.");
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    load();
    const id = setInterval(load, 30000); // gentle auto-refresh
    return () => clearInterval(id);
  }, [load]);

  return (
    <div className="admin-dash">
      <header className="admin-dash__header">
        <Logo size="sm" linkTo={null} />
        <div className="admin-dash__header-actions">
          <Button variant="secondary" size="sm" onClick={load}>Refresh</Button>
          <Button variant="dark" size="sm" onClick={logout}>Log out</Button>
        </div>
      </header>

      <div className="admin-dash__body">
        <h1 className="admin-dash__title">Incoming deliveries</h1>
        <p className="admin-dash__sub">{bookings.length} order{bookings.length === 1 ? "" : "s"}</p>

        {error && <p className="admin-dash__error">{error}</p>}
        {loading && <p className="admin-dash__loading">Loading…</p>}

        {!loading && bookings.length === 0 && !error && (
          <p className="admin-dash__empty">No orders yet.</p>
        )}

        <div className="admin-dash__list">
          {bookings.map((b) => (
            <article className="admin-card" key={b.id}>
              <div className="admin-card__photo">
                {b.item?.imageUrl ? (
                  <img src={imageUrl(b.item.imageUrl)} alt="Item" />
                ) : (
                  <div className="admin-card__photo-placeholder">No photo</div>
                )}
              </div>

              <div className="admin-card__body">
                <div className="admin-card__top">
                  <span className="admin-card__id mono">{b.id}</span>
                  <span className="admin-card__time">
                    {b.createdAt ? new Date(b.createdAt).toLocaleString() : "—"}
                  </span>
                </div>

                <div className="admin-card__grid">
                  <div>
                    <span className="admin-card__label">Pickup</span>
                    <p>{shortLocation(b.pickup)}</p>
                  </div>
                  <div>
                    <span className="admin-card__label">Drop</span>
                    <p>{shortLocation(b.drop)}</p>
                  </div>
                  <div>
                    <span className="admin-card__label">Recipient</span>
                    <p>{b.item?.recipientName || "—"}</p>
                  </div>
                  <div>
                    <span className="admin-card__label">Phone</span>
                    <p>{b.item?.recipientPhone ? `+91 ${b.item.recipientPhone}` : "—"}</p>
                  </div>
                  <div>
                    <span className="admin-card__label">Item</span>
                    <p>{b.item?.itemType || b.item?.description || "—"}</p>
                  </div>
                  <div>
                    <span className="admin-card__label">Payment</span>
                    <p>{b.payment === "cash" ? "Cash" : b.payment === "online" ? "Online" : b.payment || "—"}</p>
                  </div>
                  <div>
                    <span className="admin-card__label">Distance</span>
                    <p>{b.distanceKm != null ? `${Number(b.distanceKm).toFixed(1)} km` : "—"}</p>
                  </div>
                  <div>
                    <span className="admin-card__label">Fee</span>
                    <p>{b.charge != null ? `₹${b.charge}` : "—"}</p>
                  </div>
                </div>

                {b.item?.notes && (
                  <p className="admin-card__notes"><strong>Note:</strong> {b.item.notes}</p>
                )}

                <div className="admin-card__status">
                  <StatusPill label="WhatsApp" status={b.whatsapp} />
                  <StatusPill label="WhatsApp (quick)" status={b.callmebot} />
                  <StatusPill label="Email" status={b.email} />
                </div>

                <button
                  type="button"
                  className="admin-card__location-toggle"
                  onClick={() => toggleExpanded(b.id)}
                >
                  {expandedIds.has(b.id) ? "▲ Hide exact location" : "📍 Exact location for delivery"}
                </button>

                {expandedIds.has(b.id) && (
                  <LocationSharePanel booking={b} onSaved={handleLocationSaved} />
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
