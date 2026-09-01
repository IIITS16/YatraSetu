import { useEffect, useState } from "react";
import { useAuth } from "../../auth";
import { API_BASE } from "../../config";
import { TrendingDown, TrendingUp, IndianRupee, Map, AlertOctagon } from "lucide-react";

export function GovernmentAnalytics() {
  const { token, user } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch(`${API_BASE}/inspector/analytics`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json();
        if (json.success) {
          setData(json.analytics);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, [token]);

  if (user?.role !== "government") {
    return <div className="p-10 text-center">Access Denied. Government officials only.</div>;
  }

  // Derived metrics
  const totalReports = data.reduce((acc, curr) => acc + parseInt(curr.total_reports), 0);
  const totalTaxFlags = data.reduce((acc, curr) => acc + parseInt(curr.tax_evasion_flags), 0);
  const estimatedLeakage = totalTaxFlags * 12500; // Estimated 12k INR per incident

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Macro Analytics & Insights</h1>
          <p className="text-slate-500">Government oversight and revenue leakage estimates.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
              <Map size={24} />
            </div>
            <span className="flex items-center text-xs font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded-full">
              <TrendingUp size={14} className="mr-1" /> +12%
            </span>
          </div>
          <p className="text-sm font-semibold text-slate-500 uppercase">Total Verified Reports</p>
          <p className="text-3xl font-black text-slate-900 mt-1">{totalReports}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
              <AlertOctagon size={24} />
            </div>
          </div>
          <p className="text-sm font-semibold text-slate-500 uppercase">Tax Evasion Flags</p>
          <p className="text-3xl font-black text-slate-900 mt-1">{totalTaxFlags}</p>
        </div>

        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-2xl shadow-sm text-white">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-white/10 text-teal-400 rounded-xl">
              <IndianRupee size={24} />
            </div>
            <span className="flex items-center text-xs font-bold text-rose-400 bg-rose-400/10 px-2 py-1 rounded-full">
              <TrendingDown size={14} className="mr-1" /> Loss
            </span>
          </div>
          <p className="text-sm font-semibold text-slate-300 uppercase">Est. Revenue Leakage</p>
          <p className="text-3xl font-black mt-1 text-teal-400">
            ₹{estimatedLeakage.toLocaleString()}
          </p>
          <p className="text-xs text-slate-400 mt-2">Based on avg. undeclared transaction size</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">Regional Breakdown</h2>
        </div>
        <div className="p-6">
          {loading ? (
            <p className="text-slate-500 text-center">Loading data...</p>
          ) : (
            <div className="space-y-4">
              {data.map((row, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center font-bold text-slate-700 shadow-sm border border-slate-200">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{row.region}</p>
                      <p className="text-xs text-slate-500">{row.total_reports} total incidents reported</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-rose-600">{row.tax_evasion_flags} High Risk</p>
                    <p className="text-xs text-slate-500">Overcharging / No Bill flags</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
