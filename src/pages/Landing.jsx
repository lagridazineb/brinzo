import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Logo from "../components/Logo";
import Button from "../components/Button";
import LocationInput, { PlacesModeBadge } from "../components/LocationInput";
import LiveMap from "../components/LiveMap";
import RouteLine from "../components/RouteLine";
import { useBooking } from "../context/BookingContext";
import { LEGAL_DOCS, LEGAL_NAV_ORDER } from "../data/legalContent";
import "./Landing.css";

// ── Service areas (Kannur only) ─────────────────────────────────────
const KANNUR_AREAS = [
  "Chala", "Mundayad", "Thazhe Chovva", "Chovva", "Elayavoor",
  "Secura Centre", "Chelora", "Pallikunnu", "Puzhathi", "Kappad",
  "Koyyode", "Munderi", "Varam", "Palipoyil", "Chalad",
  "Edakkad", "Valapattanam", "Azhikode", "Kannadiparamba", "Kannur Town",
];

const HOW_IT_WORKS = [
  {
    title: "Tell us pickup and drop",
    body: "Mark where the item is and where it needs to reach — anywhere in Kannur.",
  },
  {
    title: "Describe what's travelling",
    body: "Category, size, and who's receiving it. We match the right vehicle.",
  },
  {
    title: "A partner picks it up",
    body: "Track the route live as your delivery moves across Kannur in real time.",
  },
];

// ── Tiny Kannur area map (SVG) ───────────────────────────────────────
// Real approximate coords for the service zones around Kannur city
const AREA_DOTS = [
  { name: "Kannur Town",      lat: 11.8745, lng: 75.3704 },
  { name: "Chala",            lat: 11.8710, lng: 75.3640 },
  { name: "Mundayad",         lat: 11.8650, lng: 75.3580 },
  { name: "Thazhe Chovva",    lat: 11.8820, lng: 75.3550 },
  { name: "Chovva",           lat: 11.8870, lng: 75.3500 },
  { name: "Elayavoor",        lat: 11.8950, lng: 75.3420 },
  { name: "Chelora",          lat: 11.8600, lng: 75.3800 },
  { name: "Pallikunnu",       lat: 11.8680, lng: 75.3650 },
  { name: "Puzhathi",         lat: 11.8750, lng: 75.3480 },
  { name: "Kappad",           lat: 11.8800, lng: 75.3700 },
  { name: "Koyyode",          lat: 11.8550, lng: 75.3750 },
  { name: "Munderi",          lat: 11.8900, lng: 75.3600 },
  { name: "Varam",            lat: 11.8830, lng: 75.3450 },
  { name: "Palipoyil",        lat: 11.8700, lng: 75.3520 },
  { name: "Chalad",           lat: 11.8950, lng: 75.3700 },
  { name: "Edakkad",          lat: 11.8780, lng: 75.3580 },
  { name: "Valapattanam",     lat: 11.8640, lng: 75.3440 },
  { name: "Azhikode",         lat: 11.8990, lng: 75.3480 },
  { name: "Kannadiparamba",   lat: 11.8720, lng: 75.3420 },
  { name: "Secura Centre",    lat: 11.8760, lng: 75.3680 },
];


export default function Landing() {
  const navigate = useNavigate();
  const { booking, setPickup, setDrop } = useBooking();
  const [localPickup, setLocalPickup] = useState(booking.pickup);
  const [localDrop, setLocalDrop] = useState(booking.drop);

  function handleBook() {
    if (localPickup) setPickup(localPickup);
    if (localDrop) setDrop(localDrop);
    navigate("/book/locations");
  }

  return (
    <div className="landing">
      <nav className="landing__nav">
        <Logo size="md" linkTo={null} />
        <div className="landing__nav-actions">
          <Link to="/admin/login" className="landing__nav-admin">Admin</Link>
          <button className="landing__nav-link" onClick={() => navigate("/book/locations")}>
            Book a delivery
          </button>
        </div>
      </nav>

      <section className="landing__hero">
        <svg className="landing__hero-streaks" viewBox="0 0 420 420" aria-hidden="true">
          <path d="M0,140 L150,140" stroke="var(--orange)" strokeWidth="14" strokeLinecap="round" opacity="0.9" />
          <path d="M0,170 L110,170" stroke="var(--orange)" strokeWidth="10" strokeLinecap="round" opacity="0.55" />
          <path d="M0,196 L80,196" stroke="var(--orange)" strokeWidth="7" strokeLinecap="round" opacity="0.3" />
        </svg>

        <div className="landing__hero-copy">
          <span className="landing__eyebrow mono">KANNUR · DOOR TO DOOR</span>
          <h1 className="landing__headline">
            Pickup. <em>Delivery.</em><br />Done.
          </h1>
          <p className="landing__sub">
            We currently provide pickup &amp; delivery services in: Chala, Mundayad,
            Thazhe Chovva, Chovva, Elayavoor, Secura Centre, Chelora, Pallikunnu,
            Puzhathi, Kappad, Koyyode, Munderi, Varam, Palipoyil, Chalad, Edakkad,
            Valapattanam, Azhikode, Kannadiparamba, and Kannur Town.
          </p>

          <div className="landing__quick-form">
            <LocationInput
              value={localPickup}
              onChange={setLocalPickup}
              placeholder="Pickup location in Kannur"
              dotColor="lagoon"
              showCurrentLocation
            />
            <LocationInput
              value={localDrop}
              onChange={setLocalDrop}
              placeholder="Drop location in Kannur"
              dotColor="clay"
            />
            <Button variant="primary" size="lg" full onClick={handleBook}>
              Book a delivery →
            </Button>
            <PlacesModeBadge />
          </div>
        </div>

        <div className="landing__hero-art">
          <div className="landing__map-label">Our delivery zone · Kannur</div>
          <LiveMap
            markers={AREA_DOTS}
            showSearch
            height={280}
            searchPlaceholder="Address, area, landmark in Kannur…"
            onSearchSelect={(place) => setLocalDrop(place)}
          />
        </div>
      </section>

      <section className="landing__how">
        <h2 className="landing__section-title">How a delivery travels</h2>
        <div className="landing__how-grid">
          {HOW_IT_WORKS.map((step, i) => (
            <div className="landing__how-card" key={step.title}>
              <span className="landing__how-index mono">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="landing__how-title">{step.title}</h3>
              <p className="landing__how-body">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="landing__coverage">
        <h2 className="landing__section-title">Where we deliver</h2>
        <p className="landing__coverage-sub">
          Every neighbourhood in and around Kannur city — we know every lane.
        </p>
        <div className="landing__coverage-tags">
          {KANNUR_AREAS.map((place) => (
            <span className="landing__coverage-tag" key={place}>{place}</span>
          ))}
        </div>
      </section>

      <footer className="landing__footer">
        <div className="landing__footer-top">
          <div className="landing__footer-brand">
            <Logo size="sm" linkTo={null} />
            <p className="landing__footer-note">Delivering across Kannur. Cash on delivery, always.</p>
          </div>
          <div className="landing__footer-hours">
            <span className="landing__footer-hours-icon">🕖</span>
            <div>
              <p className="landing__footer-hours-title">Working Hours</p>
              <p className="landing__footer-hours-time">Monday – Sunday · 7:00 AM – 11:00 PM</p>
            </div>
          </div>
        </div>

        <div className="landing__footer-legal">
          <p className="landing__footer-legal-title">Legal</p>
          <nav className="landing__footer-legal-links">
            {LEGAL_NAV_ORDER.map((slug) => (
              <Link key={slug} to={`/legal/${slug}`} className="landing__footer-legal-link">
                {LEGAL_DOCS[slug].shortLabel}
              </Link>
            ))}
          </nav>
          <p className="landing__footer-copyright">
            © {new Date().getFullYear()} BRINZO, Kannur. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
