import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "../components/PageShell";
import FlowHeader from "../components/FlowHeader";
import RouteLine from "../components/RouteLine";
import Button from "../components/Button";
import { useBooking } from "../context/BookingContext";
import { getRoadRoute } from "../utils/placesService";
import LiveMap from "../components/LiveMap";
import "./ServiceSelect.css";

// -------------------------------------------------------------------
// Distance helpers
// -------------------------------------------------------------------

/**
 * haversineKm — straight-line distance between two GPS points.
 * We then apply a road-factor of 1.4 to approximate real road distance
 * (Kannur is a coastal city with detours; 1.4x is a standard urban factor).
 */
function haversineKm(a, b) {
  if (!a?.lat || !b?.lat) return 6;
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  const straightLine = R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  // Road factor: real road distance is typically 1.3–1.5x straight-line in Kannur
  return Math.round(straightLine * 1.4 * 10) / 10;
}

/**
 * Tiered delivery fee:
 * 0–2 km  → ₹50
 * 2–5 km  → ₹80
 * 5–8 km  → ₹120
 * 8–10 km → ₹180
 * 10–15 km→ ₹200
 * >15 km  → ₹200 + ₹15 per km above 15
 */
function calcDeliveryFee(km) {
  if (km <= 2)  return 50;
  if (km <= 5)  return 80;
  if (km <= 8)  return 120;
  if (km <= 10) return 180;
  if (km <= 15) return 200;
  return Math.round(200 + (km - 15) * 15);
}

// ETA: ~2.5 min/km for bike in city traffic, min 4 min
function calcEta(km) {
  return Math.max(4, Math.round(km * 2.5));
}

function buildServices(distanceKm, durationMin) {
  const fee = calcDeliveryFee(distanceKm);
  const eta = durationMin ?? calcEta(distanceKm);

  return [
    {
      id: "service",
      label: "Service charges",
      icon: "📦",
      price: fee,
      eta,
      distanceKm,
      available: true,
    },
  ];
}

// -------------------------------------------------------------------
// Real street map + stats panel
// -------------------------------------------------------------------
function DeliveryMap({ pickup, drop, distanceKm, route }) {
  return (
    <div className="delivery-map">
      <LiveMap pickup={pickup} drop={drop} route={route} height={200} />

      <div className="delivery-map__info">
        <div className="delivery-map__stat">
          <span className="delivery-map__stat-label">Distance</span>
          <span className="delivery-map__stat-value mono">~{distanceKm.toFixed(1)} km</span>
        </div>
        <div className="delivery-map__divider" />
        <div className="delivery-map__stat">
          <span className="delivery-map__stat-label">Delivery fee</span>
          <span className="delivery-map__stat-value mono">₹{calcDeliveryFee(distanceKm)}</span>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------------
// Page
// -------------------------------------------------------------------
export default function ServiceSelect() {
  const navigate = useNavigate();
  const { booking, setService, setPayment } = useBooking();

  useEffect(() => {
    if (!booking.pickup || !booking.drop) {
      navigate("/book/locations");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Straight-line estimate — shown immediately, replaced by the real
  // road distance below as soon as the Google Distance Matrix call resolves.
  const estimatedKm = useMemo(
    () => haversineKm(booking.pickup, booking.drop),
    [booking.pickup, booking.drop]
  );

  const [roadInfo, setRoadInfo] = useState(null); // { distanceKm, durationMin } | null
  const [route, setRoute] = useState(null); // [[lat,lng], ...] real road path

  useEffect(() => {
    let cancelled = false;
    setRoadInfo(null);
    setRoute(null);
    // One routing call gives us distance, duration AND the actual
    // road-following geometry, so we use it for both the fee/ETA
    // numbers and the line drawn on the live street map.
    getRoadRoute(booking.pickup, booking.drop).then((info) => {
      if (!cancelled && info) {
        setRoute(info.geometry);
        if (info.distanceKm != null) setRoadInfo(info);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [booking.pickup, booking.drop]);

  const distanceKm = roadInfo?.distanceKm ?? estimatedKm;

  const services = useMemo(
    () => buildServices(distanceKm, roadInfo?.durationMin),
    [distanceKm, roadInfo]
  );

  // Auto-select the first available service card automatically
  useEffect(() => {
    const availableService = services.find((s) => s.available);
    if (availableService) {
      if (
        !booking.service ||
        booking.service.id !== availableService.id ||
        booking.service.price !== availableService.price ||
        booking.service.distanceKm !== availableService.distanceKm
      ) {
        setService(availableService);
      }
    }
  }, [services, booking.service, setService]);

  const selected = booking.service;

  return (
    <PageShell>
      <FlowHeader title="Choose a ride for it" step={3} totalSteps={5} />
      <div className="page-shell__body">
        <div className="item-route-summary">
          <RouteLine
            pickupLabel={booking.pickup?.description}
            dropLabel={booking.drop?.description}
            compact
          />
        </div>

        {/* Interactive Map */}
        <DeliveryMap
          pickup={booking.pickup}
          drop={booking.drop}
          distanceKm={distanceKm}
          route={route}
        />

        <p className="service-distance mono">
          ~{distanceKm.toFixed(1)} km · {booking.item.description || "Package"}
        </p>

        <span className="item-field__label">Select service</span>
        <div className="service-list">
          {services.map((s) => (
            <button
              type="button"
              key={s.id}
              disabled={!s.available}
              className={`service-card ${selected?.id === s.id ? "service-card--active" : ""}`}
              onClick={() => setService(s)}
            >
              <span className="service-card__icon">{s.icon}</span>
              <span className="service-card__main">
                <span className="service-card__label">{s.label}</span>
                <span className="service-card__hint">
                  {s.available ? `${s.eta} min away` : "Not available"}
                </span>
              </span>
              <span className="service-card__price mono">₹{s.price}</span>
            </button>
          ))}
        </div>

        {/* Fee breakdown note */}
        <div className="service-fee-note">
          <span className="service-fee-note__icon">ℹ️</span>
          <span>
            Fee based on road distance: ₹50 (0–2 km) · ₹80 (2–5 km) · ₹120 (5–8 km) · ₹180 (8–10 km) · ₹200 (10–15 km) · ₹200 + ₹15/km above 15 km
          </span>
        </div>

        {/* ✅ Fix: Payment auto-selected as Cash, shown clearly */}
        <div className="service-payment">
          <span className="item-field__label">Payment method</span>
          <div className="service-payment__auto">
            <div className="service-payment__auto-selected">
              <span className="service-payment__auto-icon">✅</span>
              <span className="service-payment__auto-label">
                {booking.payment === "cash" ? "Cash on Delivery" : "Pay online"}
              </span>
              <span className="service-payment__auto-badge">Auto-selected</span>
            </div>
            <button
              type="button"
              className="service-payment__switch"
              onClick={() => setPayment(booking.payment === "cash" ? "online" : "cash")}
            >
              Switch to {booking.payment === "cash" ? "💳 Pay online" : "💵 Cash on Delivery"}
            </button>
          </div>
        </div>

        <div className="locations-spacer" />

        <Button
          variant="primary"
          size="lg"
          full
          disabled={!selected}
          onClick={() => navigate("/login")}
        >
          Continue booking
        </Button>
      </div>
    </PageShell>
  );
}
