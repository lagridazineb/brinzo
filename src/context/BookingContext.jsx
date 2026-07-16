import { createContext, useContext, useState, useCallback, useRef } from "react";
import { createBooking } from "../utils/api";

/**
 * BookingContext holds the in-progress delivery booking as the user
 * moves through the flow: locations -> item details -> service/price
 * -> auth -> matching -> tracking.
 *
 * confirmBooking() sends the full booking (including the already-
 * uploaded item image URL) to the backend, which formats it and
 * forwards it — text and photo — to your WhatsApp number.
 *
 * IMPORTANT: confirmBooking() is guarded against firing twice for the
 * same booking. In React 18 StrictMode (dev only), effects that call
 * it on mount get invoked twice on purpose, which — without this
 * guard — created two separate orders on the backend for a single
 * click. `confirmingRef` makes a second call while one is already in
 * flight just await the same request instead of sending a new one,
 * and once a bookingId exists we short-circuit entirely.
 */

function makeIdempotencyKey() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `bnz-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const defaultBooking = {
  pickup: null, // { description, lat, lng, placeId }
  drop: null,
  item: {
    description: "",
    itemType: "",
    imageUrl: null, // server-relative path, e.g. /uploads/xyz.png, set after upload completes
    imageName: null,
    size: "small", // small | medium | large
    weight: "",
    recipientName: "",
    recipientPhone: "",
    notes: "",
  },
  service: null, // { id, label, icon, price, eta, distanceKm }
  payment: "cash",
  phone: "",
  bookingId: null,
  whatsapp: null, // result reported back by the backend after confirmBooking()
};

const BookingContext = createContext(null);

export function BookingProvider({ children }) {
  const [booking, setBooking] = useState(defaultBooking);

  // In-flight confirm promise (survives StrictMode's double effect
  // invocation) and a per-booking idempotency key (also sent to the
  // backend as a second line of defense against duplicate orders).
  const confirmingRef = useRef(null);
  const idempotencyKeyRef = useRef(makeIdempotencyKey());

  const setPickup = useCallback((place) => {
    setBooking((b) => ({ ...b, pickup: place }));
  }, []);

  const setDrop = useCallback((place) => {
    setBooking((b) => ({ ...b, drop: place }));
  }, []);

  const setItem = useCallback((patch) => {
    setBooking((b) => ({ ...b, item: { ...b.item, ...patch } }));
  }, []);

  const setService = useCallback((service) => {
    setBooking((b) => ({ ...b, service }));
  }, []);

  const setPayment = useCallback((payment) => {
    setBooking((b) => ({ ...b, payment }));
  }, []);

  const setPhone = useCallback((phone) => {
    setBooking((b) => ({ ...b, phone }));
  }, []);

  const confirmBooking = useCallback(async () => {
    // Already confirmed (e.g. a second effect run after success) —
    // don't create a second order.
    if (booking.bookingId) return booking.bookingId;

    // Already in flight (e.g. StrictMode's synchronous double
    // invocation) — piggyback on the same request instead of firing
    // a second one.
    if (confirmingRef.current) return confirmingRef.current;

    const promise = (async () => {
      const { booking: created } = await createBooking({
        pickup: booking.pickup,
        drop: booking.drop,
        item: booking.item,
        distanceKm: booking.service?.distanceKm,
        charge: booking.service?.price,
        payment: booking.payment,
        phone: booking.phone,
        idempotencyKey: idempotencyKeyRef.current,
      });

      setBooking((b) => ({
        ...b,
        bookingId: created.id,
        whatsapp: created.whatsapp || null,
      }));

      return created.id;
    })();

    confirmingRef.current = promise;
    try {
      return await promise;
    } finally {
      confirmingRef.current = null;
    }
    // `booking` here is the value captured at call time. That's
    // correct because confirmBooking is only ever invoked from the
    // Matching page, after all prior steps (pickup, drop, item,
    // service, payment) have already settled into state and this
    // provider has re-rendered with the final values.
  }, [booking]);

  const resetBooking = useCallback(() => {
    idempotencyKeyRef.current = makeIdempotencyKey();
    confirmingRef.current = null;
    setBooking(defaultBooking);
  }, []);

  return (
    <BookingContext.Provider
      value={{
        booking,
        setPickup,
        setDrop,
        setItem,
        setService,
        setPayment,
        setPhone,
        confirmBooking,
        resetBooking,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used within BookingProvider");
  return ctx;
}
