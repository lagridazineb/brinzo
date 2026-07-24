import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "../components/PageShell";
import FlowHeader from "../components/FlowHeader";
import Logo from "../components/Logo";
import Button from "../components/Button";
import { useBooking } from "../context/BookingContext";
import { sendOtp, verifyOtp, getHealth } from "../utils/api";
import "./Otp.css";

const OTP_LENGTH = 6;
const DEMO_OTP = "123456"; // fallback only, used if the backend has no
// FAST2SMS_API_KEY configured yet — see server/otp.js

export default function Otp() {
  const navigate = useNavigate();
  const { booking } = useBooking();
  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(""));
  const [seconds, setSeconds] = useState(29);
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const inputsRef = useRef([]);

  useEffect(() => {
    if (!booking.phone) {
      navigate("/login");
      return;
    }
    getHealth()
      .then((data) => setDemoMode(!data.otp?.configured))
      .catch(() => setDemoMode(true)); // if we can't even reach the backend, fall back
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [seconds]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  function handleChange(i, val) {
    const v = val.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = v;
    setDigits(next);
    setError("");
    if (v && i < OTP_LENGTH - 1) {
      inputsRef.current[i + 1]?.focus();
    }
  }

  function handleKeyDown(i, e) {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      inputsRef.current[i - 1]?.focus();
    }
  }

  const code = digits.join("");
  const complete = code.length === OTP_LENGTH;

  async function handleVerify() {
    if (!complete || verifying) return;

    if (demoMode) {
      if (code !== DEMO_OTP) {
        setError(`Demo mode — use ${DEMO_OTP} to continue.`);
        return;
      }
      navigate("/matching");
      return;
    }

    setError("");
    setVerifying(true);
    try {
      await verifyOtp(booking.phone, code);
      navigate("/matching");
    } catch (err) {
      const messages = {
        NOT_FOUND: "Code expired — tap Resend OTP to get a new one.",
        EXPIRED: "This code has expired — tap Resend OTP to get a new one.",
        INCORRECT_CODE: "That code isn't right. Try again.",
        TOO_MANY_ATTEMPTS: "Too many attempts — tap Resend OTP to get a new one.",
      };
      setError(messages[err.data?.error] || "Couldn't verify the code. Try again.");
    } finally {
      setVerifying(false);
    }
  }

  async function handleResend() {
    if (seconds > 0 || resending) return;
    setError("");
    setResending(true);
    try {
      await sendOtp(booking.phone);
      setDemoMode(false);
      setSeconds(29);
    } catch (err) {
      if (err.message === "OTP_NOT_CONFIGURED") {
        setDemoMode(true);
        setSeconds(29);
      } else if (err.message === "COOLDOWN") {
        setError("Please wait a bit before requesting another code.");
      } else {
        setError("Couldn't resend the code. Try again shortly.");
      }
    } finally {
      setResending(false);
    }
  }

  return (
    <PageShell>
      <FlowHeader title="" step={5} totalSteps={5} onBack={() => navigate(-1)} />
      <div className="page-shell__body login-body">
        <Logo size="lg" linkTo={null} />

        <h2 className="login-title">Enter verification code</h2>
        <p className="login-sub">
          Sent to <span className="mono">+91 {booking.phone || "—"}</span>
          {demoMode ? ` (demo code: ${DEMO_OTP})` : ""}
        </p>

        <div className="otp-row">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => (inputsRef.current[i] = el)}
              className={`otp-box mono ${d ? "otp-box--filled" : ""}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
            />
          ))}
        </div>

        {error && <p className="otp-error">{error}</p>}

        <button
          type="button"
          className="otp-resend"
          disabled={seconds > 0 || resending}
          onClick={handleResend}
        >
          {seconds > 0 ? `Resend OTP in ${seconds}s` : resending ? "Resending…" : "Resend OTP"}
        </button>

        <div className="locations-spacer" />

        <Button variant="dark" size="lg" full disabled={!complete || verifying} onClick={handleVerify}>
          {verifying ? "Verifying…" : "Verify"}
        </Button>
      </div>
    </PageShell>
  );
}
