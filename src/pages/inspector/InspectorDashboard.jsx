import { useEffect, useState } from "react";
import { useAuth } from "../../auth";
import { API_BASE } from "../../config";
import { Link } from "react-router-dom";
import { AlertTriangle, BadgeCheck, FileText, Map, ShieldAlert, ArrowRight, Building2 } from "lucide-react";

export function InspectorDashboard() {
  const { token, user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [statsRes, reportsRes] = await Promise.all([
          fetch(`${API_BASE}/inspector/stats`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`${API_BASE}/inspector/reports`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        const statsData = await statsRes.json();
        const reportsData = await reportsRes.json();

        if (statsData.success) setStats(statsData.stats);
        if (reportsData.success) setRecentReports(reportsData.reports);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  if (loading) {
    return <div className="py-20 text-center font-medium text-slate-500">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, {user?.name ? `Inspector ${user.name.split(" ")[0]}` : "Inspector"}
        </h1>
        <p className="text-slate-500">Here's the latest activity in your jurisdiction.</p>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
          <div className="flex items-center gap-2 text-rose-600">
            <AlertTriangle size={18} />
            <h3 className="text-xs font-bold uppercase tracking-wider">Pending</h3>
          </div>
          <p className="mt-2 text-3xl font-black text-rose-700">{stats?.pending_reports || 0}</p>
        </div>
        
        <div className="rounded-2xl border border-teal-200 bg-teal-50 p-5">
          <div className="flex items-center gap-2 text-teal-600">
            <BadgeCheck size={18} />
            <h3 className="text-xs font-bold uppercase tracking-wider">Resolved</h3>
          </div>
          <p className="mt-2 text-3xl font-black text-teal-700">{stats?.resolved_reports || 0}</p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-center gap-2 text-amber-600">
            <Building2 size={18} />
            <h3 className="text-xs font-bold uppercase tracking-wider">High Risk</h3>
          </div>
          <p className="mt-2 text-3xl font-black text-amber-700">0</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500">
            <FileText size={18} />
            <h3 className="text-xs font-bold uppercase tracking-wider">Total</h3>
          </div>
          <p className="mt-2 text-3xl font-black text-slate-800">{stats?.total_reports || 0}</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              Priority Action Queue <span className="text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">Sorted by Risk</span>
            </h2>
            <Link to="/inspector/reports" className="text-sm font-semibold text-teal-600 hover:text-teal-700 transition">
              View all
            </Link>
          </div>
          
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden min-h-[300px]">
            {loading ? (
              <div className="p-8 text-center text-slate-500">Loading feed...</div>
            ) : recentReports.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <div className="rounded-full bg-slate-50 p-4 mb-3">
                  <ShieldCheck className="text-slate-300" size={32} />
                </div>
                <p className="font-medium text-slate-500">No pending reports in your region.</p>
                <p className="text-sm text-slate-400 mt-1">You are fully caught up!</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {recentReports.slice(0, 5).map(report => (
                  <li key={report.id} className="p-4 hover:bg-slate-50 transition-colors group">
                    <div className="flex gap-4">
                      <div className="shrink-0 mt-1">
                        <div className={`grid h-10 w-10 place-items-center rounded-full ${
                          report.risk_score >= 80 ? 'bg-rose-100 text-rose-600' :
                          report.risk_score >= 50 ? 'bg-amber-100 text-amber-600' :
                          'bg-teal-100 text-teal-600'
                        }`}>
                          <AlertTriangle size={18} />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <p className="font-semibold text-slate-900 truncate">
                            {report.business_name || "Unknown Location"}
                          </p>
                          <span className="shrink-0 text-xs text-slate-500">
                            {new Date(report.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mb-2 truncate">
                          {report.concern_type}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                            Risk Score: {report.risk_score || 0}
                          </span>
                          <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 border border-amber-200/50">
                            {report.status}
                          </span>
                        </div>
                      </div>
                      <div className="shrink-0 flex items-center">
                        <Link 
                          to={`/inspector/case/${report.id}`}
                          className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 group-hover:border-teal-300 group-hover:text-teal-700"
                        >
                          Investigate
                        </Link>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Quick Actions & Threat Level */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">Threat Level</h2>
            <div className="mt-3 flex items-center gap-3">
              <div className="relative flex h-4 w-4">
                {stats?.pending_reports > 0 ? (
                  <>
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex h-4 w-4 rounded-full bg-amber-500"></span>
                  </>
                ) : (
                  <span className="relative inline-flex h-4 w-4 rounded-full bg-teal-500"></span>
                )}
              </div>
              <span className="font-semibold text-slate-800">
                {stats?.pending_reports > 5 ? "High Alert" : stats?.pending_reports > 0 ? "Elevated Activity" : "Normal (Clear)"}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Link to="/inspector/map" className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 font-medium text-slate-700 hover:bg-slate-100">
                <div className="flex items-center gap-3">
                  <Map size={18} className="text-teal-600" /> Map View
                </div>
                <ArrowRight size={16} className="text-slate-400" />
              </Link>
              <Link to="/inspector/businesses" className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 font-medium text-slate-700 hover:bg-slate-100">
                <div className="flex items-center gap-3">
                  <Building2 size={18} className="text-teal-600" /> Businesses
                </div>
                <ArrowRight size={16} className="text-slate-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
