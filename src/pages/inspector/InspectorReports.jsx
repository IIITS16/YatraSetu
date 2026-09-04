import { useEffect, useState } from "react";
import { useAuth } from "../../auth";
import { API_BASE } from "../../config";
import { AlertCircle, CheckCircle2, Filter, Search, X } from "lucide-react";

export function InspectorReports() {
  const { token, user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [filterArea, setFilterArea] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterRisk, setFilterRisk] = useState("all");
  
  // Modal state
  const [selectedReport, setSelectedReport] = useState(null);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function fetchReports(isBackground = false) {
    try {
      if (!isBackground) setLoading(true);
      const res = await fetch(`${API_BASE}/inspector/reports`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setReports(data.reports);
      }
    } catch (err) {
      console.error("Failed to fetch reports", err);
    } finally {
      if (!isBackground) setLoading(false);
    }
  }

  useEffect(() => {
    if (!token) return;

    fetchReports(false);

    // Resilient background polling every 3 seconds
    const interval = setInterval(() => {
      fetchReports(true);
    }, 3000);

    // Window focus revalidation
    const handleFocus = () => fetchReports(true);
    window.addEventListener("focus", handleFocus);

    // Realtime SSE EventSource
    let eventSource = null;
    try {
      eventSource = new EventSource(`${API_BASE}/inspector/stream?token=${encodeURIComponent(token)}`);
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data?.type === "NEW_REPORT" || data?.type === "REPORT_REVIEWED") {
            fetchReports(true);
          }
        } catch {}
      };
    } catch (e) {
      console.error("SSE connection error:", e);
    }

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
      if (eventSource) eventSource.close();
    };
  }, [token]);

  const filteredReports = reports.filter(r => {
    // 1. Search term (matches Business or Description)
    const matchesSearch = 
      (r.business_name || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
      (r.description || "").toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    
    // 2. Status filter
    if (filterStatus !== "all") {
      if (filterStatus === "pending") {
        const pendingStatuses = ["pending", "Under review", "new", "review", "investigating"];
        if (!pendingStatuses.includes(r.status)) return false;
      } else if (r.status !== filterStatus) {
        return false;
      }
    }

    // 3. Date From / To
    if (dateFrom && new Date(r.created_at) < new Date(dateFrom)) return false;
    if (dateTo && new Date(r.created_at) > new Date(dateTo + "T23:59:59")) return false;

    // 4. Area
    if (filterArea !== "all" && r.region !== filterArea) return false;

    // 5. Complaint Type
    if (filterType !== "all" && r.concern_type !== filterType) return false;

    // 6. Risk Level
    if (filterRisk !== "all") {
      const highRisk = ["Safety concern", "Harassment or misbehavior"];
      const isHigh = highRisk.includes(r.concern_type);
      if (filterRisk === "high" && !isHigh) return false;
      if (filterRisk === "low" && isHigh) return false;
    }

    return true;
  });

  async function handleReview(status) {
    if (!selectedReport) return;
    setSubmitting(true);
    
    try {
      const res = await fetch(`${API_BASE}/inspector/reports/${selectedReport.id}/review`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ status, reviewer_notes: notes })
      });
      
      const data = await res.json();
      if (data.success) {
        // Update local state
        setReports(prev => prev.map(r => r.id === selectedReport.id ? {
          ...r, 
          status, 
          reviewer_notes: notes,
          reviewed_at: new Date().toISOString(),
          reviewer_name: user.name
        } : r));
        closeModal();
      } else {
        alert(data.message || "Failed to update report");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating report");
    } finally {
      setSubmitting(false);
    }
  }

  function openModal(report) {
    setSelectedReport(report);
    setNotes(report.reviewer_notes || "");
  }

  function closeModal() {
    setSelectedReport(null);
    setNotes("");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reports Directory</h1>
          <p className="text-slate-500">Manage and review all reports in {user?.region}</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search business or description..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2 outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center justify-center gap-2 rounded-xl border px-5 py-2 text-sm font-medium transition-colors ${
            showFilters ? "bg-teal-50 border-teal-200 text-teal-700" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
        >
          <Filter size={16} /> Advanced Filters
        </button>
      </div>
      
      {/* Quick Status Filters */}
      {!showFilters && (
        <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
          {['all', 'pending', 'valid', 'invalid'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`shrink-0 rounded-xl px-4 py-2 text-sm font-medium capitalize transition-colors ${
                filterStatus === status 
                  ? "bg-slate-900 text-white" 
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      )}

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Date From</label>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-teal-500 bg-white" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Date To</label>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-teal-500 bg-white" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Area</label>
            <select value={filterArea} onChange={e => setFilterArea(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-teal-500 bg-white">
              <option value="all">All Regions</option>
              <option value="Jaipur South">Jaipur South</option>
              <option value="Jaipur North">Jaipur North</option>
              <option value="Jaipur East">Jaipur East</option>
              <option value="Jaipur West">Jaipur West</option>
              <option value="Amer">Amer</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Complaint Type</label>
            <select value={filterType} onChange={e => setFilterType(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-teal-500 bg-white">
              <option value="all">All Types</option>
              <option value="Overcharging or unclear bill">Overcharging / Unclear bill</option>
              <option value="Unverified guide or business">Unverified guide / business</option>
              <option value="Safety concern">Safety concern</option>
              <option value="Harassment or misbehavior">Harassment / Misbehavior</option>
              <option value="Misleading service">Misleading service</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Risk Level</label>
            <select value={filterRisk} onChange={e => setFilterRisk(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-teal-500 bg-white">
              <option value="all">All Levels</option>
              <option value="high">High Risk</option>
              <option value="low">Standard Risk</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Status</label>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-teal-500 bg-white">
              <option value="all">All Statuses</option>
              <option value="pending">Pending Review</option>
              <option value="valid">Valid (Verified)</option>
              <option value="invalid">Invalid (Rejected)</option>
            </select>
          </div>
        </div>
      )}

      {/* Reports List */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-slate-500">Loading reports...</div>
        ) : filteredReports.length === 0 ? (
          <div className="p-10 text-center text-slate-500">No reports found.</div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {filteredReports.map(report => (
              <li 
                key={report.id} 
                className="p-4 hover:bg-slate-50 transition-colors cursor-pointer group"
                onClick={() => window.location.href = `/inspector/case/${report.id}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${report.risk_score >= 80 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'}`}>
                        {report.concern_type}
                      </span>
                      <span className="text-xs text-slate-500">
                        {new Date(report.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="font-semibold text-slate-900 group-hover:text-teal-600 transition-colors">
                      {report.business_name || "Unknown Location"}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600 line-clamp-2">{report.description}</p>
                  </div>
                  <div className="shrink-0 flex flex-col items-end gap-2">
                    {report.status === 'valid' && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-700 ring-1 ring-inset ring-teal-600/20">
                        <CheckCircle2 size={12} /> Valid
                      </span>
                    )}
                    {report.status === 'invalid' && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700 ring-1 ring-inset ring-rose-600/20">
                        <AlertCircle size={12} /> Invalid
                      </span>
                    )}
                    {(report.status === 'pending' || report.status === 'Under review' || report.status === 'new' || report.status === 'review') && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
                        Pending
                      </span>
                    )}
                    {(report.status === 'investigating' || report.status === 'escalated') && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20">
                        {report.status}
                      </span>
                    )}
                    {(report.status === 'resolved') && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-700 ring-1 ring-inset ring-teal-600/20">
                        <CheckCircle2 size={12} /> Resolved
                      </span>
                    )}
                    {report.risk_score > 0 && (
                      <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 rounded">
                        Risk: {report.risk_score}
                      </span>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
