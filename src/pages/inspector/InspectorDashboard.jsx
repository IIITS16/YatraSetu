import { useEffect, useState } from "react";
import { useAuth } from "../../auth";
import { API_BASE } from "../../config";
import { Link } from "react-router-dom";
import { AlertTriangle, BadgeCheck, FileText, Map as MapIcon, ShieldAlert, ArrowRight, Building2, List } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, Polygon, Tooltip } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const JAIPUR_ZONES = [
  {
    name: "Jaipur North",
    positions: [[27.020, 75.650], [27.020, 75.850], [26.960, 75.850], [26.960, 75.650]],
    color: '#8b0000', fillColor: '#ffb6c1' // Dark Red border, Light Pink fill
  },
  {
    name: "Amer / Old City",
    positions: [[27.020, 75.850], [27.020, 75.920], [26.910, 75.920], [26.910, 75.850]],
    color: '#d2691e', fillColor: '#ffe4b5' // Solid Orange border, Light Gold fill
  },
  {
    name: "Jaipur West",
    positions: [[26.960, 75.650], [26.960, 75.750], [26.830, 75.750], [26.830, 75.650]],
    color: '#4b0082', fillColor: '#d8bfd8' // Dark Purple border, Light Purple fill
  },
  {
    name: "Jaipur East",
    positions: [[26.960, 75.750], [26.960, 75.850], [26.910, 75.850], [26.910, 75.920], [26.830, 75.920], [26.830, 75.750]],
    color: '#006400', fillColor: '#90ee90' // Dark Green border, Light Green fill
  },
  {
    name: "Jaipur South",
    positions: [[26.830, 75.650], [26.830, 75.920], [26.750, 75.920], [26.750, 75.650]],
    color: '#00008b', fillColor: '#add8e6' // Dark Blue border, Light Blue fill
  }
];

const center = [26.9124, 75.8173]; // Jaipur

export function InspectorDashboard() {
  const { token, user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("list");

  useEffect(() => {
    async function fetchDashboardData(isInitial = false) {
      try {
        const [statsRes, reportsRes] = await Promise.all([
          fetch(`${API_BASE}/inspector/stats`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`${API_BASE}/inspector/reports/recent`, { // Fetch recent instead of all for dashboard
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
        if (isInitial) setLoading(false);
      }
    }

    if (token) {
      fetchDashboardData(true);
      const interval = setInterval(() => fetchDashboardData(false), 3000); // Poll every 3s
      return () => clearInterval(interval);
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
              Action Queue 
              <span className="text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full ml-2">Sorted by Risk</span>
            </h2>
            
            <div className="flex bg-slate-100 p-1 rounded-xl shadow-inner">
              <button 
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition ${viewMode === 'list' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <List size={16} /> List
              </button>
              <button 
                onClick={() => setViewMode("map")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition ${viewMode === 'map' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <MapIcon size={16} /> Map
              </button>
            </div>
          </div>
          
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden min-h-[400px]">
            {viewMode === "map" ? (
              <div className="h-[450px] w-full z-0 relative">
                <MapContainer center={center} zoom={11} style={{ height: "100%", width: "100%", backgroundColor: '#ffffff' }}>
                  <TileLayer
                    url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                    attribution='&copy; Google Maps'
                  />
                  {JAIPUR_ZONES.map((zone, idx) => (
                    <Polygon 
                      key={idx}
                      positions={zone.positions}
                      pathOptions={{
                        fillColor: zone.fillColor,
                        fillOpacity: 0.35,
                        color: zone.color,
                        weight: 2
                      }}
                    >
                      <Tooltip sticky>
                        <span className="font-bold text-slate-800">{zone.name}</span>
                      </Tooltip>
                    </Polygon>
                  ))}
                  {recentReports.filter(r => r.latitude && r.longitude).map((report) => (
                    <Marker key={report.id} position={[report.latitude, report.longitude]}>
                      <Popup>
                        <strong>{report.business_name || "Unknown"}</strong><br/>
                        {report.concern_type}<br/>
                        Risk Score: {report.risk_score || 0}
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            ) : (
              loading ? (
                <div className="p-8 text-center text-slate-500">Loading feed...</div>
              ) : recentReports.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center h-[400px]">
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
              )
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
              <button onClick={() => setViewMode("map")} className="w-full flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 font-medium text-slate-700 hover:bg-slate-100">
                <div className="flex items-center gap-3">
                  <MapIcon size={18} className="text-teal-600" /> Map View
                </div>
                <ArrowRight size={16} className="text-slate-400" />
              </button>
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
