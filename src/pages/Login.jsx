import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "../components/PageShell";
import FlowHeader from "../components/FlowHeader";
import Logo from "../components/Logo";
import Button from "../components/Button";
import { useBooking } from "../context/BookingContext";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const { booking, setPhone } = useBooking();
  const [value, setValue] = useState("");

  useEffect(() => {
    if (!booking.service) {
      navigate("/book/locations");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const valid = /^[6-9]\d{9}$/.test(value);

  function handleGetOtp() {
    if (!valid) return;
    setPhone(value);
    navigate("/otp");
  }

  return (
    <PageShell>
      <FlowHeader title="" step={4} totalSteps={5} onBack={() => navigate(-1)} />
      <div className="page-shell__body login-body">
        <Logo size="lg" linkTo={null} />

        <h2 className="login-title">Log in to Brinzo</h2>
        <p className="login-sub">Enter your phone number</p>

        <div className="login-phone-field">
          <span className="login-phone-field__prefix mono">
            <span className="login-phone-field__flag" aria-hidden="true">🇮🇳</span> +91
          </span>
          <input
            className="login-phone-field__input"
            type="tel"
            inputMode="numeric"
            placeholder="98765 43210"
            maxLength={10}
            value={value}
            onChange={(e) => setValue(e.target.value.replace(/\D/g, ""))}
            autoFocus
          />
        </div>

        <div className="locations-spacer" />

        <p className="login-terms">
          By continuing, you agree to Brinzo's <a href="#terms">T&amp;C</a>
        </p>

        <Button variant="dark" size="lg" full disabled={!valid} onClick={handleGetOtp}>
          Get OTP
        </Button>
      </div>
    </PageShell>
  );
}
