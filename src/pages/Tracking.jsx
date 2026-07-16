import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "../components/PageShell";
import Logo from "../components/Logo";
import Button from "../components/Button";
import RouteLine from "../components/RouteLine";
import LiveMap from "../components/LiveMap";
import { useBooking } from "../context/BookingContext";
import { imageUrl } from "../utils/api";
import { getRoadRoute } from "../utils/placesService";
import "./Tracking.css";

const PARTNER_NAMES = ["Anoop", "Sreejith", "Manoj", "Rahul", "Vipin", "Arun"];

export default function Tracking() {
  const navigate = useNavigate();
  const { booking, resetBooking } = useBooking();

  useEffect(() => {
    if (!booking.bookingId) {
      navigate("/");
    }
  }, [booking.bookingId, navigate]);

  const [route, setRoute] = useState(null);
  useEffect(() => {
    let cancelled = false;
    if (booking.pickup?.lat && booking.drop?.lat) {
      getRoadRoute(booking.pickup, booking.drop).then((info) => {
        if (!cancelled && info) setRoute(info.geometry);
      });
    }
    return () => {
      cancelled = true;
    };
  }, [booking.pickup, booking.drop]);

  if (!booking.bookingId) return null;

  const partnerName = PARTNER_NAMES[booking.bookingId.length % PARTNER_NAMES.length];
  const price = booking.service?.price ?? "—";

  function handleDone() {
    resetBooking();
    navigate("/");
  }

  return (
    <PageShell>
      <div className="page-shell__body tracking-body">

        {/* Header */}
        <div className="tracking-topbar">
          <Logo size="sm" linkTo={null} />
          <span className="tracking-id mono">{booking.bookingId}</span>
        </div>

        {/* ── Order Confirmed Banner ── */}
        <div className="tracking-confirmed">
          <div className="tracking-confirmed__icon">✅</div>
          <h2 className="tracking-confirmed__title">Order Confirmed!</h2>
          <p className="tracking-confirmed__sub">
            Thank you for choosing <strong>BRINZO</strong>.
          </p>
        </div>

        {/* Status pill */}
        <div className="tracking-status">
          <span className="tracking-status__dot" />
          {partnerName} is heading to pickup
        </div>

        {/* Confirmation message card */}
        <div className="tracking-card tracking-message">
          <p>Our delivery partner is on the way to the pickup location.</p>
          <p>
            <span className="tracking-msg-icon">📦</span>
            Please keep your items packed and ready near the entrance to help us ensure a quick pickup.
          </p>
          <p>
            <span className="tracking-msg-icon">
              {booking.payment === "cash" ? "💵" : "💳"}
            </span>
            <strong>Payment Method:</strong>{" "}
            {booking.payment === "cash" ? "Cash on Delivery" : "Online Payment"}
          </p>
          <p className="tracking-message__notify">
            We'll notify you once your order has been picked up.
          </p>
          <p className="tracking-message__thanks">
            Thank you for choosing <strong>BRINZO</strong>!
          </p>
        </div>

        {/* Live street map */}
        <div className="tracking-map">
          <LiveMap
            pickup={booking.pickup}
            drop={booking.drop}
            route={route}
            height={200}
          />
        </div>

        {/* Route */}
        <div className="tracking-card">
          <RouteLine
            pickupLabel={booking.pickup?.description}
            dropLabel={booking.drop?.description}
          />
        </div>

        {/* Service + price */}
        <div className="tracking-card tracking-card--row">
          <span className="tracking-service-icon">{booking.service?.icon}</span>
          <div className="tracking-service-info">
            <span className="tracking-service-label">
              {booking.service?.label} · {booking.item.itemType || booking.item.description}
            </span>
            <span className="tracking-service-sub">
              {booking.item.recipientName} · {booking.payment === "cash" ? "Cash on Delivery" : "Online Payment"}
            </span>
          </div>
          <span className="tracking-price mono">₹{price}</span>
        </div>

        {/* Item image if uploaded */}
        {booking.item.imageUrl && (
          <div className="tracking-card tracking-item-img">
            <span className="tracking-service-label" style={{fontSize:"0.8rem",marginBottom:"8px",display:"block"}}>Item photo</span>
            <img src={imageUrl(booking.item.imageUrl)} alt="Item" className="tracking-item-img__img"/>
          </div>
        )}

        <div className="locations-spacer" />

        <div className="tracking-actions">
          <Button variant="dark" full onClick={handleDone}>
            Done
          </Button>
        </div>
      </div>
    </PageShell>
  );
}
