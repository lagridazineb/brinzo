import "./Button.css";

export default function Button({
  children,
  variant = "primary",
  size = "md",
  full = false,
  disabled = false,
  type = "button",
  onClick,
  icon,
  className = "",
}) {
  return (
    <button
      type={type}
      className={`btn btn--${variant} btn--${size} ${full ? "btn--full" : ""} ${className}`}
      disabled={disabled}
      onClick={onClick}
    >
      {icon && <span className="btn__icon">{icon}</span>}
      {children}
    </button>
  );
}
