import "./PageShell.css";

export default function PageShell({ children, className = "" }) {
  return <div className={`page-shell ${className}`}>{children}</div>;
}
