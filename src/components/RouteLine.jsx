import "./RouteLine.css";

/**
 * RouteLine — Brinzo's signature element.
 * A pickup pin connected to a drop pin by a curving dotted line,
 * echoing Kerala's backwater canals. Used on the hero, every
 * booking step, and the tracking screen so the route is always
 * visually present, not just textual.
 *
 * variant: "vertical" (stacked card use) | "horizontal" (hero use)
 */
export default function RouteLine({
  pickupLabel,
  dropLabel,
  variant = "vertical",
  compact = false,
}) {
  if (variant === "horizontal") {
    return (
      <div className={`route-line route-line--horizontal ${compact ? "route-line--compact" : ""}`}>
        <div className="route-line__pin route-line__pin--pickup">
          <span className="route-line__dot route-line__dot--pickup" />
          <span className="route-line__label">{pickupLabel || "Pickup"}</span>
        </div>
        <svg className="route-line__curve" viewBox="0 0 200 24" preserveAspectRatio="none" aria-hidden="true">
          <path d="M2,12 C60,2 140,22 198,12" fill="none" stroke="var(--lagoon)" strokeWidth="2" strokeDasharray="1,7" strokeLinecap="round" />
        </svg>
        <div className="route-line__pin route-line__pin--drop">
          <span className="route-line__dot route-line__dot--drop" />
          <span className="route-line__label">{dropLabel || "Drop"}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`route-line route-line--vertical ${compact ? "route-line--compact" : ""}`}>
      <div className="route-line__col">
        <span className="route-line__dot route-line__dot--pickup" />
        <svg className="route-line__curve-v" viewBox="0 0 24 56" preserveAspectRatio="none" aria-hidden="true">
          <path d="M12,2 C2,18 22,38 12,54" fill="none" stroke="var(--paper-line)" strokeWidth="2" strokeDasharray="1,6" strokeLinecap="round" />
        </svg>
        <span className="route-line__dot route-line__dot--drop" />
      </div>
      <div className="route-line__labels">
        <span className="route-line__label" title={pickupLabel}>{pickupLabel || "Enter pickup"}</span>
        <span className="route-line__label route-line__label--drop" title={dropLabel}>{dropLabel || "Enter drop"}</span>
      </div>
    </div>
  );
}
