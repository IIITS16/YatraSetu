import { useEffect, useState } from "react";
import { useAuth } from "../../auth";
import { API_BASE } from "../../config";
import { TrendingDown, IndianRupee, AlertOctagon, Building2, Info, AlertTriangle, BarChart3, ShieldCheck } from "lucide-react";

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
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center">
        <ShieldCheck size={48} className="text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-900">Access Restricted</h2>
        <p className="text-slate-500 mt-2">This module contains sensitive economic intelligence and is restricted to Government Authority roles.</p>
      </div>
    );
  }

  // Calculate dynamic metrics from DB, but apply a baseline for the SIH Demo to always look impressive
  const dbReports = data.reduce((acc, curr) => acc + parseInt(curr.total_reports), 0);
  const dbTaxFlags = data.reduce((acc, curr) => acc + parseInt(curr.tax_evasion_flags), 0);
  
  // Base Demo values requested by user
  const estimatedSuspiciousTx = Math.max(480000, dbTaxFlags * 15000); 
  const estimatedGstLeakage = Math.max(86000, estimatedSuspiciousTx * 0.18); // Approx 18% GST
  const highRiskBusinesses = Math.max(7, data.filter(d => d.tax_evasion_flags > 5).length);

  // Format currency helper
  const formatCurrency = (val) => {
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(0)}K`;
    return `₹${val}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <BarChart3 className="text-indigo-600" /> B2G Economic Intelligence
          </h1>
          <p className="text-slate-500 mt-1">Real-time revenue leakage and compliance monitoring for authorities.</p>
        </div>
      </div>

      {/* Main Feature Highlight: Revenue Leakage */}
      <div className="bg-[#0b1121] rounded-3xl overflow-hidden shadow-2xl border border-slate-800 relative">
        {/* Glow effect in background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>

        <div className="relative p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                📊 Revenue Leakage Estimate
              </h2>
              <p className="text-slate-400 text-sm mt-1">Aggregated anomalies detected via tourist reports</p>
            </div>
            
            {/* Disclaimer Badge */}
            <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 max-w-sm">
              <Info size={16} className="text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-200/80 leading-relaxed font-medium">
                <strong className="text-amber-400">Disclaimer:</strong> Clearly labeled as AI-driven estimates based on unverified tourist anomaly reports. This does not represent legally confirmed tax evasion.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Suspicious TX Card */}
            <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700/50 p-6 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 text-indigo-400">
                  <AlertOctagon size={20} />
                </div>
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Estimated Suspicious Tx</h3>
              </div>
              <p className="text-4xl font-black text-white">{formatCurrency(estimatedSuspiciousTx)}</p>
              <p className="text-xs text-indigo-300/70 mt-2 font-medium">Flagged across reported locations</p>
            </div>

            {/* GST Leakage Card (Highlighted) */}
            <div className="bg-gradient-to-br from-rose-950/80 to-rose-900/40 backdrop-blur-md rounded-2xl border border-rose-500/30 p-6 flex flex-col justify-center shadow-[0_0_30px_rgba(225,29,72,0.15)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/20 rounded-full blur-2xl -mr-10 -mt-10"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-rose-500/20 flex items-center justify-center border border-rose-500/30 text-rose-400">
                      <IndianRupee size={20} />
                    </div>
                    <h3 className="text-sm font-semibold text-rose-200 uppercase tracking-wider">Potential GST Leakage</h3>
                  </div>
                  <span className="flex items-center text-xs font-bold text-rose-200 bg-rose-500/20 px-2 py-1 rounded-full">
                    <TrendingDown size={14} className="mr-1" /> Loss
                  </span>
                </div>
                <p className="text-5xl font-black text-rose-400">{formatCurrency(estimatedGstLeakage)}</p>
                <div className="mt-3 flex items-center gap-1.5 text-xs text-rose-200/70">
                  <AlertTriangle size={12} />
                  <p>Critical metric for B2G compliance action</p>
                </div>
              </div>
            </div>

            {/* High-risk businesses Card */}
            <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700/50 p-6 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/30 text-amber-400">
                  <Building2 size={20} />
                </div>
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">High-Risk Businesses</h3>
              </div>
              <p className="text-4xl font-black text-white">{highRiskBusinesses}</p>
              <p className="text-xs text-amber-300/70 mt-2 font-medium">Entities requiring immediate audit</p>
            </div>

          </div>
        </div>
      </div>

      {/* Regional Breakdown Data */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mt-8">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50">
          <h2 className="text-lg font-bold text-slate-900">Regional Threat Distribution</h2>
          <p className="text-sm text-slate-500">Breakdown of reported compliance violations by jurisdiction.</p>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="py-10 text-center">
              <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-slate-500 font-medium">Crunching macroeconomic data...</p>
            </div>
          ) : data.length === 0 ? (
            <p className="text-slate-500 text-center py-10">No regional data available yet.</p>
          ) : (
            <div className="space-y-4">
              {data.map((row, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white rounded-2xl border border-slate-100 hover:border-indigo-100 hover:shadow-md transition duration-200">
                  <div className="flex items-center gap-4 mb-4 sm:mb-0">
                    <div className="h-12 w-12 bg-indigo-50 rounded-xl flex items-center justify-center font-black text-indigo-600 shadow-sm border border-indigo-100">
                      #{idx + 1}
                    </div>
                    <div>
                      <p className="font-bold text-lg text-slate-900">{row.region}</p>
                      <p className="text-sm font-medium text-slate-500">{row.total_reports} total complaints filed</p>
                    </div>
                  </div>
                  <div className="sm:text-right bg-rose-50 sm:bg-transparent p-3 sm:p-0 rounded-xl">
                    <p className="font-black text-lg text-rose-600 flex items-center sm:justify-end gap-1.5">
                      <AlertOctagon size={16} /> {row.tax_evasion_flags} Anomaly Flags
                    </p>
                    <p className="text-xs font-semibold uppercase tracking-wide text-rose-400 mt-1">Suspected Non-Compliance</p>
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
