import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../config";

export function Login() {
  const [mode, setMode] = useState("tourist");
  const [staffRole, setStaffRole] = useState("inspector");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload =
        mode === "tourist"
          ? { channel: "phone", phone }
          : { channel: "email", email, role: staffRole };

      const response = await fetch(`${API_BASE}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to send OTP");
      
      // For development: Show the OTP in an alert so the user knows what to enter
      alert(`TESTING MODE: Your OTP is ${data.otp}`);

      navigate("/verify-otp", {
        state:
          mode === "tourist"
            ? { channel: "phone", phone, generatedOtp: data.otp }
            : { channel: "email", email, role: staffRole, generatedOtp: data.otp },
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md rounded-3xl bg-white p-6 shadow-soft">
      <p className="text-sm font-semibold text-sea">SIGN IN</p>
      <h1 className="mt-1 text-3xl font-bold text-ink">Login to YatraSetu</h1>
      <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => setMode("tourist")}
          className={`rounded-xl px-3 py-2 text-sm font-semibold ${mode === "tourist" ? "bg-white text-ink shadow-sm" : "text-slate-600"}`}
        >
          Tourist
        </button>
        <button
          type="button"
          onClick={() => setMode("staff")}
          className={`rounded-xl px-3 py-2 text-sm font-semibold ${mode === "staff" ? "bg-white text-ink shadow-sm" : "text-slate-600"}`}
        >
          Inspector / Govt
        </button>
      </div>
      <form onSubmit={submit} className="mt-6 space-y-4">
        {mode === "tourist" ? (
          <label className="block text-sm font-semibold text-ink">
            Indian mobile number
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91XXXXXXXXXX"
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:ring-2 focus:ring-sea"
            />
          </label>
        ) : (
          <label className="block text-sm font-semibold text-ink">
            Official email address
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@iiitsonepat.ac.in"
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:ring-2 focus:ring-sea"
            />
          </label>
        )}
        {mode === "staff" && (
          <>
            <label className="block text-sm font-semibold text-ink">
              Staff role
              <select
                value={staffRole}
                onChange={(e) => setStaffRole(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:ring-2 focus:ring-sea"
              >
                <option value="inspector">Inspector</option>
                <option value="government">Government Officer</option>
              </select>
            </label>
            <p className="text-xs text-slate-500">
              Only `iiitsonepat.ac.in` email addresses are allowed for inspector/government access.
            </p>
          </>
        )}
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <button
          disabled={loading}
          className="w-full rounded-xl bg-ink py-3 font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Sending OTP..." : "Send OTP"}
        </button>
      </form>
    </div>
  );
}
