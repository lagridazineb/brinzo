import { useNavigate } from "react-router-dom";
import PageShell from "../components/PageShell";
import FlowHeader from "../components/FlowHeader";
import LocationInput, { PlacesModeBadge } from "../components/LocationInput";
import LiveMap from "../components/LiveMap";
import Button from "../components/Button";
import { useBooking } from "../context/BookingContext";
import { getRoadRoute } from "../utils/placesService";
import { useEffect, useState } from "react";
import "./Locations.css";

// -------------------------------------------------------------------
// Inline map showing pickup + drop markers within Kannur service area
// -------------------------------------------------------------------
export default function Locations() {
  const navigate = useNavigate();
  const { booking, setPickup, setDrop } = useBooking();

  const canContinue = Boolean(booking.pickup && booking.drop);

  // Real road-following route (drawn on the live street map below) —
  // refetched any time pickup or drop changes.
  const [route, setRoute] = useState(null);
  useEffect(() => {
    let cancelled = false;
    setRoute(null);
    if (booking.pickup?.lat && booking.drop?.lat) {
      getRoadRoute(booking.pickup, booking.drop).then((info) => {
        if (!cancelled && info) setRoute(info.geometry);
      });
    }
    return () => {
      cancelled = true;
    };
  }, [booking.pickup, booking.drop]);

  return (
    <PageShell>
      <FlowHeader title="Where's it going?" step={1} totalSteps={5} />
      <div className="page-shell__body">
        <div className="locations-card">
          <LocationInput
            value={booking.pickup}
            onChange={setPickup}
            placeholder="Enter pickup"
            dotColor="lagoon"
            showCurrentLocation
          />
          <div className="locations-divider" />
          <LocationInput
            value={booking.drop}
            onChange={setDrop}
            placeholder="Enter drop"
            dotColor="clay"
          />
        </div>

      <p className="locations-hint">
  Type at least 2 letters to search Kannur delivery areas — streets, junctions, and landmarks.
</p>

<PlacesModeBadge />

{/* Real street map — Kannur / Thalassery / Eachur, live roads */}
<LiveMap
  pickup={booking.pickup}
  drop={booking.drop}
  route={route}
  height={280}
  onMapClick={(place, type) => {
    if (type === "pickup") {
      setPickup(place);
    } else {
      setDrop(place);
    }
  }}
/>
        <div className="locations-spacer" />

        <Button
          variant="primary"
          size="lg"
          full
          disabled={!canContinue}
          onClick={() => navigate("/book/item")}
        >
          Continue
        </Button>
      </div>
    </PageShell>
  );
}
