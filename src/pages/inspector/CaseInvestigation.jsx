import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth";
import { API_BASE } from "../../config";
import { ArrowLeft, Clock, ShieldAlert, CheckCircle, MapPin, Building, Phone, User as UserIcon, XCircle } from "lucide-react";

export function CaseInvestigation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [report, setReport] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id, token]);

  async function fetchData() {
    try {
      const res = await fetch(`${API_BASE}/inspector/reports/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setReport(data.report);
        setHistory(data.history);
      } else {
        alert("Failed to load case");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(newStatus) {
    setSubmitting(true);
    try {
      const defaultNotes = 
        newStatus === 'invalid' 
          ? "Case investigated and rejected as false/invalid report."
          : newStatus === 'resolved'
          ? "Case investigated and marked as verified/resolved."
          : null;

      const res = await fetch(`${API_BASE}/inspector/reports/${id}/review`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          status: newStatus, 
          reviewer_notes: notes.trim() || defaultNotes 
        })
      });
      const data = await res.json();
      if (data.success) {
        setNotes("");
        fetchData(); // reload
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="p-10 text-center">Loading case details...</div>;
  if (!report) return <div className="p-10 text-center">Case not found.</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition">
        <ArrowLeft size={16} /> Back to Queue
      </button>

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            Case #{report.id}
            <span className={`text-xs uppercase tracking-wider font-bold px-3 py-1 rounded-full border ${
              report.status === 'invalid' || report.status === 'discarded'
                ? 'bg-rose-100 text-rose-700 border-rose-200'
                : report.status === 'resolved' || report.status === 'valid'
                ? 'bg-teal-100 text-teal-700 border-teal-200'
                : report.status === 'investigating'
                ? 'bg-amber-100 text-amber-700 border-amber-200'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}>
              {report.status === 'invalid' || report.status === 'discarded' ? 'Rejected (False)' : report.status}
            </span>
          </h1>
          <p className="text-slate-500 mt-1">Reported on {new Date(report.created_at).toLocaleString()}</p>
        </div>
        <div className="text-right">
          <div className="inline-flex items-center gap-1.5 rounded-xl bg-rose-50 px-3 py-1.5 border border-rose-100">
            <ShieldAlert size={16} className="text-rose-600" />
            <span className="text-sm font-bold text-rose-700">Risk Score: {report.risk_score || 0}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Details Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Incident Details</h2>
            
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Business</p>
                <div className="flex items-center gap-2 text-slate-900 font-medium">
                  <Building size={16} className="text-slate-400" />
                  {report.business_name || "Unknown"}
                </div>
              </div>
              
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Location</p>
                <div className="flex items-center gap-2 text-slate-900">
                  <MapPin size={16} className="text-slate-400" />
                  {report.region}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Issue Type</p>
                <p className="text-slate-900 font-medium">{report.concern_type}</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Description</p>
                <p className="text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100">{report.description}</p>
              </div>
            </div>
          </div>

          {/* Action History */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-6">Action Timeline</h2>
            
            {history.length === 0 ? (
              <p className="text-sm text-slate-500">No actions recorded yet.</p>
            ) : (
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-slate-200">
                {history.map((item) => (
                  <div key={item.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-teal-100 text-teal-600 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10">
                      <Clock size={16} />
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-900 text-sm">{item.action_type}</span>
                        <span className="text-xs font-medium text-slate-500">{new Date(item.created_at).toLocaleDateString()}</span>
                      </div>
                      {item.notes && <p className="text-sm text-slate-600 mt-2">{item.notes}</p>}
                      <p className="text-xs text-slate-400 mt-2 font-medium">By {item.actor_name || "System"}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Reporter Info</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <UserIcon size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{report.reporter_name || "Tourist"}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <Phone size={12} /> {report.reporter_phone || "No phone"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl p-6 shadow-sm text-white">
            <h2 className="text-lg font-bold mb-4">Take Action</h2>
            <textarea
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-teal-500 mb-4"
              rows="3"
              placeholder="Investigation notes..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
            
            <div className="space-y-2">
              <button 
                disabled={submitting || report.status === 'investigating'}
                onClick={() => updateStatus('investigating')}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold text-sm transition disabled:opacity-50"
              >
                Start Investigation
              </button>
              <button 
                disabled={submitting}
                onClick={() => updateStatus('escalated')}
                className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm transition disabled:opacity-50"
              >
                Escalate to Government
              </button>
              <button 
                disabled={submitting || report.status === 'resolved'}
                onClick={() => updateStatus('resolved')}
                className="w-full py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-teal-950 font-bold text-sm transition disabled:opacity-50 flex justify-center items-center gap-2"
              >
                <CheckCircle size={16} /> Mark Resolved
              </button>
              <button 
                disabled={submitting || report.status === 'invalid' || report.status === 'discarded'}
                onClick={() => updateStatus('invalid')}
                className="w-full py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-sm transition disabled:opacity-50 flex justify-center items-center gap-2 shadow-sm"
              >
                <XCircle size={16} /> Reject Request (Mark False)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
