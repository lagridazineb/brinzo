import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "../components/PageShell";
import Button from "../components/Button";
import { useBooking } from "../context/BookingContext";
import "./Matching.css";

export default function Matching() {
  const navigate = useNavigate();
  const { booking, confirmBooking } = useBooking();
  const [progress, setProgress] = useState(6);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!booking.service) {
      navigate("/book/locations");
      return;
    }

    let cancelled = false;
    const tick = setInterval(() => {
      setProgress((p) => Math.min(96, p + Math.random() * 14));
    }, 450);

    const minDelay = new Promise((resolve) => setTimeout(resolve, 2600));

    Promise.all([confirmBooking(), minDelay])
      .then(() => {
        if (cancelled) return;
        setProgress(100);
        setTimeout(() => navigate("/tracking"), 250);
      })
      .catch(() => {
        if (cancelled) return;
        setError("Couldn't reach the server to confirm this booking. Check your connection and try again.");
      });

    return () => {
      cancelled = true;
      clearInterval(tick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <PageShell>
        <div className="page-shell__body matching-body">
          <div className="matching-avatar">
            <span className="matching-avatar__emoji">⚠️</span>
          </div>
          <p className="matching-label">Booking failed</p>
          <h2 className="matching-title" style={{ fontSize: "1.1rem", textTransform: "none" }}>
            {error}
          </h2>
          <div className="locations-spacer" />
          <Button variant="dark" size="lg" full onClick={() => navigate("/book/service")}>
            Go back
          </Button>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="page-shell__body matching-body">
        <div className="matching-avatar">
          <span className="matching-avatar__emoji">{booking.service?.icon || "🛵"}</span>
        </div>

        <p className="matching-label">Looking for your</p>
        <h2 className="matching-title">{booking.service?.label || "delivery"} partner</h2>

        <div className="matching-progress">
          <div className="matching-progress__fill" style={{ width: `${progress}%` }} />
        </div>

        <p className="matching-route mono">
          {(booking.pickup?.description || "Pickup").split(",")[0]} → {(booking.drop?.description || "Drop").split(",")[0]}
        </p>

        <div className="locations-spacer" />

        <Button variant="danger" size="lg" full onClick={() => navigate("/book/service")}>
          Cancel
        </Button>
      </div>
    </PageShell>
  );
}
