import { useState } from "react";
import { ArrowRight, Sparkles, Upload, FileText, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

export function ScanBill() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleScan() {
    if (!file) return;
    setLoading(true);
    
    const formData = new FormData();
    formData.append("bill", file);

    try {
      const res = await fetch(`http://localhost:5000/api/scan-bill`, {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (json.success) {
        setResult(json.data);
      } else {
        alert(json.message || "Error analyzing bill");
      }
    } catch (err) {
      console.error(err);
      alert("Network Error while scanning bill");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-enter mx-auto max-w-2xl">
      <p className="text-sm font-semibold text-sea">AI BILL INTELLIGENCE</p>
      <h1 className="mt-1 text-3xl font-bold text-ink">Understand your bill</h1>
      <p className="mt-2 text-slate-600">
        Upload a clear photo. Our AI will extract details, check math consistency, and flag potential overcharging anomalies.
      </p>
      {!result ? (
        <>
          <label className="mt-7 flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed border-teal-200 bg-white p-10 text-center transition hover:bg-teal-50">
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0])}
            />
            <span className="grid h-14 w-14 place-items-center rounded-full bg-teal-100 text-sea">
              <Upload size={25} />
            </span>
            <span className="mt-4 font-semibold text-ink">
              {file ? file.name : "Upload bill photo (JPG/PNG)"}
            </span>
            <span className="mt-1 text-sm text-slate-500">
              Clear photos yield better AI accuracy.
            </span>
          </label>
          <button
            disabled={!file || loading}
            onClick={handleScan}
            className="mt-4 w-full rounded-xl bg-ink py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? "Analyzing via Google Gemini Vision..." : "Analyze bill"}
          </button>
        </>
      ) : (
        <div className="mt-7 rounded-2xl border bg-white p-6 shadow-soft">
          <div className="flex items-start justify-between">
            <div className="flex gap-3">
              <span className={`grid h-11 w-11 place-items-center rounded-full ${
                result.risk_level === 'High' ? 'bg-rose-100 text-rose-700' : 
                result.risk_level === 'Medium' ? 'bg-amber-100 text-amber-700' : 
                'bg-teal-100 text-teal-700'
              }`}>
                <Sparkles size={21} />
              </span>
              <div>
                <h2 className="font-bold text-ink">AI Analysis Complete</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Risk Score: {result.risk_score}/100 ({result.risk_level})
                </p>
            </div>
            </div>
            {result.requires_verification || result.price_anomalies.length > 0 ? (
              <span className="flex items-center gap-1 rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-800">
                <AlertTriangle size={14} /> Verification Required
              </span>
            ) : (
              <span className="flex items-center gap-1 rounded-full bg-teal-100 px-3 py-1 text-xs font-bold text-teal-800">
                <CheckCircle2 size={14} /> Looks Good
              </span>
            )}
          </div>
          <div className="my-6 h-px bg-slate-100" />
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-500">Merchant</p>
              <p className="mt-1 font-semibold text-ink">{result.merchant_name || "Unknown"}</p>
            </div>
            <div>
              <p className="text-slate-500">Bill Total</p>
              <p className="mt-1 font-semibold text-ink">₹{result.total_amount || "N/A"}</p>
            </div>
            <div>
              <p className="text-slate-500">GSTIN Detected</p>
              <p className="mt-1 font-semibold text-ink">{result.gstin_detected ? "Yes" : "No (Informal Merchant)"}</p>
            </div>
            <div>
              <p className="text-slate-500">Math Consistency</p>
              <p className={`mt-1 font-semibold ${result.math_is_correct ? "text-teal-600" : "text-rose-600"}`}>
                {result.math_is_correct ? "Valid" : "Mismatch Found"}
              </p>
            </div>
          </div>
          
          {result.detected_reasons && result.detected_reasons.length > 0 && result.risk_level !== 'Low' && (
            <div className={`mt-6 rounded-xl p-4 text-sm border ${
              result.risk_level === 'High' ? 'bg-rose-50 text-rose-900 border-rose-100' : 'bg-amber-50 text-amber-900 border-amber-100'
            }`}>
              <p className="font-bold flex items-center gap-1"><AlertTriangle size={16}/> Risk Factors Detected</p>
              <ul className="mt-2 list-disc pl-5 leading-6">
                {result.detected_reasons.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          )}

          {result.price_anomalies && result.price_anomalies.length > 0 && (
            <div className="mt-4 rounded-xl p-4 text-sm bg-amber-50 text-amber-900 border border-amber-100">
              <p className="font-bold flex items-center gap-1"><AlertTriangle size={16}/> Price Anomalies</p>
              <ul className="mt-2 list-disc pl-5 leading-6">
                {result.price_anomalies.map((a, i) => <li key={i}>{a}</li>)}
              </ul>
            </div>
          )}

          <Link
            to="/report"
            className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-3 font-semibold text-white transition ${
              result.requires_verification ? 'bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-200' : 'bg-ink hover:bg-slate-800'
            }`}
          >
            {result.requires_verification ? "Report Suspicious Bill Immediately" : "Report to Govt Dashboard"} <ArrowRight size={17} />
          </Link>
          <button onClick={() => {setResult(null); setFile(null);}} className="mt-3 w-full text-sm font-semibold text-slate-500 hover:text-ink">
            Scan another bill
          </button>
        </div>
      )}
    </div>
  );
}
