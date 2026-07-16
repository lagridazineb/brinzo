import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Logo from "../components/Logo";
import Button from "../components/Button";
import { useAdminAuth } from "../context/AdminAuthContext";
import { ApiError } from "../utils/api";
import "./AdminLogin.css";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAdminAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!username || !password) return;
    setError("");
    setLoading(true);
    try {
      await login(username, password);
      navigate("/admin", { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.data?.error === "INVALID_CREDENTIALS") {
        setError("Wrong username or password.");
      } else {
        setError("Couldn't reach the server. Try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-login">
      <div className="admin-login__card">
        <Logo size="md" linkTo={null} />
        <h1 className="admin-login__title">Admin login</h1>
        <p className="admin-login__sub">Sign in to see incoming deliveries.</p>

        <form className="admin-login__form" onSubmit={handleSubmit}>
          <label className="admin-login__field">
            <span>Username</span>
            <input
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
            />
          </label>

          <label className="admin-login__field">
            <span>Password</span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          {error && <p className="admin-login__error">{error}</p>}

          <Button type="submit" variant="dark" size="lg" full disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <Link to="/" className="admin-login__back">← Back to BRINZO</Link>
      </div>
    </div>
  );
}
