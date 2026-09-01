import { useState } from "react";
import { CheckCircle2, LocateFixed, Upload } from "lucide-react";
import { Link } from "react-router-dom";
import { API_BASE } from "../config";
import { useAuth } from "../auth";

export function Report() {
  const { token } = useAuth();
  const [location, setLocation] = useState(null);
  const [concern, setConcern] = useState("");
  const [business, setBusiness] = useState("");
  const [region, setRegion] = useState("");
  const [details, setDetails] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function capture() {
    setLoading(true);

    if (!navigator.geolocation) {
      alert("Location is not supported by your browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLoading(false);
      },
      (error) => {
        console.error("Location error:", error);
        alert("Unable to get your location. Please allow location permission and try again.");
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }

  async function submitReport(e) {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);

    try {
      const response = await fetch(`${API_BASE}/reports`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          concern_type: concern,
          business_name: business,
          region: region,
          description: details,
          latitude: location?.latitude ?? null,
          longitude: location?.longitude ?? null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit report");
      }

      console.log("Report saved successfully:", data);
      setSent(true);
    } catch (error) {
      console.error("Report submission error:", error);
      alert(`Could not submit report.\n\n${error.message}`);
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div className="page-enter mx-auto max-w-xl rounded-3xl bg-white p-8 text-center shadow-soft">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-teal-100 text-teal-700">
          <CheckCircle2 size={35} />
        </span>
        <h1 className="mt-5 text-2xl font-bold text-ink">Report submitted</h1>
        <p className="mt-3 leading-6 text-slate-600">
          Your report has been successfully submitted and will be reviewed by the authorised team.
        </p>
        <Link
          to="/my-reports"
          className="mt-6 inline-flex rounded-xl bg-ink px-4 py-3 text-sm font-semibold text-white"
        >
          Track my report
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submitReport} className="page-enter mx-auto max-w-2xl">
      <p className="text-sm font-semibold text-sea">REPORT A CONCERN</p>
      <h1 className="mt-1 text-3xl font-bold text-ink">Help improve this destination</h1>
      <p className="mt-2 text-slate-600">
        Share only what you experienced. Evidence helps the right authority review your report.
      </p>

      <div className="mt-7 space-y-5 rounded-2xl bg-white p-5 shadow-soft sm:p-7">
        <label className="block text-sm font-semibold text-ink">
          What happened?
          <select
            required
            value={concern}
            onChange={(e) => setConcern(e.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-slate-700 outline-none focus:ring-2 focus:ring-sea"
          >
            <option value="">Choose a concern</option>
            <option value="Overcharging or unclear bill">Overcharging or unclear bill</option>
            <option value="Unverified guide or business">Unverified guide or business</option>
            <option value="Safety concern">Safety concern</option>
            <option value="Misleading service">Misleading service</option>
          </select>
        </label>

        <label className="block text-sm font-semibold text-ink">
          Business or location
          <input
            required
            value={business}
            onChange={(e) => setBusiness(e.target.value)}
            placeholder="e.g. Saffron Courtyard, Bapu Bazaar"
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 font-normal outline-none focus:ring-2 focus:ring-sea"
          />
        </label>

        <label className="block text-sm font-semibold text-ink">
          Region / Area
          <select
            required
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 font-normal text-slate-700 outline-none focus:ring-2 focus:ring-sea"
          >
            <option value="">Select the region where this occurred</option>
            <option value="Jaipur South">Jaipur South</option>
            <option value="Jaipur North">Jaipur North</option>
            <option value="Jaipur East">Jaipur East</option>
            <option value="Jaipur West">Jaipur West</option>
            <option value="Amer">Amer / Old City</option>
          </select>
        </label>

        <label className="block text-sm font-semibold text-ink">
          Describe what you observed
          <textarea
            required
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows="4"
            placeholder="Include useful details, not personal information about others."
            className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-3 py-3 font-normal outline-none focus:ring-2 focus:ring-sea"
          />
        </label>

        <div>
          <p className="text-sm font-semibold text-ink">
            Location <span className="font-normal text-slate-400">(optional)</span>
          </p>
          <button
            type="button"
            onClick={capture}
            disabled={loading}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-3 py-3 text-sm font-semibold text-sea disabled:opacity-60"
          >
            {loading ? (
              "Locating..."
            ) : (
              <>
                <LocateFixed size={18} />
                {location
                  ? `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`
                  : "Use my current location"}
              </>
            )}
          </button>
          <p className="mt-2 text-xs text-slate-500">
            Your approximate location is used only for this report.
          </p>
        </div>

        <label className="block text-sm font-semibold text-ink">
          Evidence <span className="font-normal text-slate-400">(optional)</span>
          <span className="mt-2 flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-slate-300 px-3 py-3 font-normal text-slate-600">
            <Upload size={18} />
            Attach bill or photo
            <input type="file" accept="image/*,.pdf" className="hidden" />
          </span>
        </label>

        <div className="rounded-lg bg-slate-50 p-3 text-xs leading-5 text-slate-500">
          Reports are assessed for credibility and may be reviewed by authorised officials. Do not use this form for emergencies.
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-ink py-3.5 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Submitting..." : "Submit protected report"}
        </button>
      </div>
    </form>
  );
}
