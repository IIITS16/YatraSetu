import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { API_BASE } from "../config";
import { useAuth } from "../auth";

export function VerifyOtp() {
  const { state } = useLocation();
  const channel = state?.channel || "phone";
  const phone = state?.phone || "";
  const email = state?.email || "";
  const identifier = channel === "email" ? email : phone;
  const role = state?.role || "tourist";
  const navigate = useNavigate();
  const { login } = useAuth();
  // Prefill OTP from development login route to make testing easier
  const [otp, setOtp] = useState(state?.generatedOtp || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [seconds, setSeconds] = useState(300);

  useEffect(() => {
    const timer = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(timer);
  }, []);

  const canResend = seconds === 0;
  const label = useMemo(() => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`, [seconds]);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          channel === "email"
            ? { channel, email, otp, role }
            : { channel, phone, otp }
        ),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "OTP verification failed");
      await login(data.token, data.user);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function resend() {
    setError("");
    await fetch(`${API_BASE}/auth/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        channel === "email" ? { channel, email } : { channel, phone }
      ),
    });
    setSeconds(300);
  }

  return (
    <div className="mx-auto max-w-md rounded-3xl bg-white p-6 shadow-soft">
      <p className="text-sm font-semibold text-sea">VERIFY OTP</p>
      <h1 className="mt-1 text-3xl font-bold text-ink">Enter the 6-digit code</h1>
      <p className="mt-2 text-sm text-slate-600">{identifier}</p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <input
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="123456"
          inputMode="numeric"
          maxLength={6}
          className="w-full rounded-xl border border-slate-200 px-3 py-3 text-center text-xl tracking-[0.4em] outline-none focus:ring-2 focus:ring-sea"
        />
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <button
          disabled={loading}
          className="w-full rounded-xl bg-ink py-3 font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
      </form>
      <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
        <span>Resend in {label}</span>
        <button disabled={!canResend} onClick={resend} className="font-semibold text-sea disabled:opacity-40">
          Resend OTP
        </button>
      </div>
    </div>
  );
}
