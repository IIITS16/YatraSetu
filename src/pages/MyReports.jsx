import { useEffect, useState } from "react";
import { API_BASE } from "../config";

export function MyReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadReports() {
      try {
        const response = await fetch(`${API_BASE}/reports`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load reports");
        }

        if (active) {
          setReports(data.reports || []);
        }
      } catch (err) {
        if (active) {
          setError(err.message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadReports();

    return () => {
      active = false;
    };
  }, []);

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
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                  {report.status}
                </span>
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
