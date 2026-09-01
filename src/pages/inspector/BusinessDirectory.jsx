import { useEffect, useState } from "react";
import { useAuth } from "../../auth";
import { API_BASE } from "../../config";
import { Building2, Search, AlertTriangle, ShieldCheck } from "lucide-react";

export function BusinessDirectory() {
  const { token, user } = useAuth();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchBusinesses() {
      try {
        const res = await fetch(`${API_BASE}/inspector/businesses`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setBusinesses(data.businesses);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchBusinesses();
  }, [token]);

  const filtered = businesses.filter(b => b.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Business Risk Profiles</h1>
          <p className="text-slate-500">Track and monitor high-risk entities in your region.</p>
        </div>
      </div>

      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input 
          type="text" 
          placeholder="Search businesses..." 
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-teal-500 shadow-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full p-10 text-center text-slate-500">Loading directory...</div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full p-10 text-center text-slate-500">No businesses found.</div>
        ) : (
          filtered.map(b => (
            <div key={b.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-teal-300 transition group cursor-pointer">
              <div className="flex justify-between items-start mb-4">
                <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-teal-50 group-hover:text-teal-600 transition">
                  <Building2 size={20} />
                </div>
                {b.base_risk_score > 50 ? (
                  <span className="flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-lg border border-rose-100">
                    <AlertTriangle size={12} /> High Risk
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded-lg border border-teal-100">
                    <ShieldCheck size={12} /> Standard
                  </span>
                )}
              </div>
              
              <h3 className="font-bold text-slate-900 text-lg truncate">{b.name}</h3>
              <p className="text-sm text-slate-500 mb-4">{b.region}</p>
              
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400">Total Reports</p>
                  <p className="font-bold text-slate-700">{b.report_count}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold uppercase text-slate-400">Risk Score</p>
                  <p className={`font-bold ${b.base_risk_score > 50 ? 'text-rose-600' : 'text-slate-700'}`}>
                    {b.base_risk_score}/100
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
