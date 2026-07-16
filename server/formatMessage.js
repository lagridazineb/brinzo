// formatMessage.js
// ---------------------------------------------------------------
// Builds the WhatsApp order notification text in the exact layout
// requested:
//
//   📦 New BRINZO Order
//
//   Pickup: ...
//   Drop: ...
//   Recipient: ...
//   Phone: ...
//   Item: ...
//   Distance: ...
//   Delivery Fee: ...
//   Payment: ...
//   Order Time: ...
// ---------------------------------------------------------------

function shortLocation(place) {
  if (!place) return "—";
  if (typeof place === "string") return place;
  return place.description ? place.description.split(",")[0] : "—";
}

function formatTime(date) {
  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatOrderMessage(booking) {
  const {
    pickup,
    drop,
    item = {},
    distanceKm,
    charge,
    payment,
    id,
  } = booking;

  const lines = [
    "📦 New BRINZO Order",
    "",
    `Order ID: ${id || "—"}`,
    "",
    "Pickup:",
    shortLocation(pickup),
    "",
    "Drop:",
    shortLocation(drop),
    "",
    "Recipient:",
    item.recipientName || "—",
    "",
    "Phone:",
    item.recipientPhone ? `+91 ${item.recipientPhone}` : "—",
    "",
    "Item:",
    item.itemType || item.description || "—",
    "",
    "Distance:",
    distanceKm != null ? `${Number(distanceKm).toFixed(1)} km` : "—",
    "",
    "Delivery Fee:",
    charge != null ? `₹${charge}` : "—",
    "",
    "Payment:",
    payment === "cash" ? "Cash" : payment === "online" ? "Online" : payment || "—",
  ];

  if (item.notes && item.notes.trim()) {
    lines.push("", "Note:", item.notes.trim());
  }

  lines.push("", "Order Time:", formatTime(new Date()));

  return lines.join("\n");
}
