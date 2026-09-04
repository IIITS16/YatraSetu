import { useEffect, useState } from "react";
import { API_BASE } from "../config";
import { useAuth } from "../auth";

export function MyReports() {
  const { token } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadReports(isBackground = false) {
      try {
        if (!isBackground) setLoading(true);
        const response = await fetch(`${API_BASE}/reports`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load reports");
        }

        if (active) {
          setReports(data.reports || []);
        }
      } catch (err) {
        if (active && !isBackground) {
          setError(err.message);
        }
      } finally {
        if (active && !isBackground) {
          setLoading(false);
        }
      }
    }

    loadReports(false);

    // 3-second background polling
    const interval = setInterval(() => {
      loadReports(true);
    }, 3000);

    // Window focus revalidation
    const handleFocus = () => loadReports(true);
    window.addEventListener("focus", handleFocus);

    return () => {
      active = false;
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, [token]);

  function renderStatusBadge(status) {
    const s = (status || "").toLowerCase();
    if (s === "invalid" || s === "discarded") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 border border-rose-200 px-3 py-1 text-xs font-bold text-rose-700">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
          Verified False
        </span>
      );
    }
    if (s === "resolved" || s === "valid") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 border border-teal-200 px-3 py-1 text-xs font-bold text-teal-700">
          <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
          Verified True
        </span>
      );
    }
    if (s === "investigating") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-bold text-amber-700">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          Investigating
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-bold text-blue-700 capitalize">
        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
        {status || "Pending Review"}
      </span>
    );
  }

  return (
    <div className="page-enter mx-auto max-w-3xl">
      <p className="text-sm font-semibold text-sea">MY REPORTS</p>
      <h1 className="mt-1 text-3xl font-bold text-ink">Your submitted reports</h1>
      {loading ? (
        <div className="mt-7 rounded-2xl border bg-white p-5 text-slate-500">
          Loading saved reports...
        </div>
      ) : error ? (
        <div className="mt-7 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-800">
          {error}
        </div>
      ) : reports.length ? (
        <div className="mt-7 space-y-4">
          {reports.map((report) => (
            <article key={report.id} className="rounded-2xl border bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-ink">
                    YS-{String(report.id).padStart(6, "0")}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {report.concern_type} · {report.business_name || "Unknown location"}
                  </p>
                </div>
                {renderStatusBadge(report.status)}
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                {report.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500">
                <span>Lat: {report.latitude ?? "N/A"}</span>
                <span>Lng: {report.longitude ?? "N/A"}</span>
                <span>{report.created_at ? new Date(report.created_at).toLocaleString() : ""}</span>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-7 rounded-2xl border bg-white p-5 text-slate-500">
          No reports saved yet.
        </div>
      )}
      <div className="mt-5 rounded-xl border border-teal-100 bg-teal-50 p-4 text-sm text-teal-900">
        For safety and fairness, report status is shared at a high level. Protected risk assessments are accessible only to authorised government teams.
      </div>
    </div>
  );
}
