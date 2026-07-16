import "./Logo.css";
import { Link } from "react-router-dom";

export default function Logo({ size = "md", linkTo = "/" }) {
  const content = (
    <span className={`brinzo-logo brinzo-logo--${size}`}>
      <img
        src="/brinzo-logo.png"
        alt="BRINZO"
        className="brinzo-logo__img"
      />
    </span>
  );
  if (!linkTo) return content;
  return (
    <Link to={linkTo} className="brinzo-logo__link" aria-label="Brinzo home">
      {content}
    </Link>
  );
}
