import { useState } from "react";
import { ArrowRight, Sparkles, Upload, Loader2, AlertTriangle, ShieldCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE } from "../config";

export function ScanBill() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleScan = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append("bill", file);

    try {
      const response = await fetch(`${API_BASE}/scan-bill`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.message || "Failed to scan bill");
      
      setResult(data.data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReport = () => {
    // Pass the AI data and the original image file to the report form
    navigate('/report', { state: { scannedBillData: result, billFile: file } });
  };

  return (
    <div className="page-enter mx-auto max-w-2xl">
      <p className="text-sm font-semibold text-sea">BILL CHECK</p>
      <h1 className="mt-1 text-3xl font-bold text-ink">Understand your bill</h1>
      <p className="mt-2 text-slate-600">
        Upload a clear photo. Our AI will analyze the math, taxes, and authenticity.
      </p>
      
      {!result ? (
        <>
          <label className={`mt-7 flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed ${error ? 'border-rose-300 bg-rose-50' : 'border-teal-200 bg-white'} p-10 text-center transition hover:bg-teal-50`}>
            <input
              type="file"
              className="hidden"
              accept="image/*,.pdf"
              onChange={(e) => {
                setFile(e.target.files?.[0]);
                setError(null);
              }}
            />
            <span className={`grid h-14 w-14 place-items-center rounded-full ${error ? 'bg-rose-100 text-rose-600' : 'bg-teal-100 text-sea'}`}>
              <Upload size={25} />
            </span>
            <span className="mt-4 font-semibold text-ink">
              {file ? file.name : "Upload bill photo or PDF"}
            </span>
            <span className="mt-1 text-sm text-slate-500">
              JPG, PNG or PDF – max 10 MB
            </span>
          </label>
          
          {error && <p className="mt-3 text-center text-sm font-semibold text-rose-600">{error}</p>}

          <button
            disabled={!file || loading}
            onClick={handleScan}
            className="mt-4 flex w-full justify-center items-center gap-2 rounded-xl bg-ink py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40 transition"
          >
            {loading ? <><Loader2 className="animate-spin" size={18}/> Analyzing with Gemini AI...</> : "Analyze bill"}
          </button>
        </>
      ) : (
        <div className="mt-7 rounded-2xl border bg-white p-6 shadow-soft">
          <div className="flex items-start justify-between">
            <div className="flex gap-3">
              <span className={`grid h-11 w-11 place-items-center rounded-full ${result.risk_score > 50 ? 'bg-rose-100 text-rose-700' : result.risk_score > 20 ? 'bg-amber-100 text-amber-700' : 'bg-teal-100 text-teal-700'}`}>
                <Sparkles size={21} />
              </span>
              <div>
                <h2 className="font-bold text-ink">AI Analysis Complete</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Risk Score: <span className="font-bold text-slate-700">{result.risk_score}/100</span>
                </p>
              </div>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${result.risk_score > 50 ? 'bg-rose-100 text-rose-800' : result.risk_score > 20 ? 'bg-amber-100 text-amber-800' : 'bg-teal-100 text-teal-800'}`}>
              {result.risk_level} Risk
            </span>
          </div>
          
          <div className="my-6 h-px bg-slate-100" />
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-500">Merchant</p>
              <p className="mt-1 font-semibold text-ink">{result.merchant_name || "Not detected"}</p>
            </div>
            <div>
              <p className="text-slate-500">Bill total</p>
              <p className="mt-1 font-semibold text-ink">₹{result.total_amount}</p>
            </div>
            <div>
              <p className="text-slate-500">GSTIN / Identity</p>
              <p className="mt-1 font-semibold text-ink">{result.gstin_detected ? "Detected" : "Missing / Unregistered"}</p>
            </div>
            <div>
              <p className="text-slate-500">Tax Math</p>
              <p className="mt-1 font-semibold text-ink flex items-center gap-1">
                {result.math_is_correct ? <span className="text-teal-600 flex items-center gap-1"><ShieldCheck size={14}/> Correct</span> : <span className="text-rose-600 flex items-center gap-1"><AlertTriangle size={14}/> Errors Found</span>}
              </p>
            </div>
          </div>

          {(result.detected_reasons?.length > 0 || result.price_anomalies?.length > 0) && (
            <div className={`mt-6 rounded-xl p-4 text-sm ${result.risk_score > 50 ? 'bg-rose-50 text-rose-900' : 'bg-amber-50 text-amber-900'}`}>
              <p className="font-bold flex items-center gap-1"><AlertTriangle size={16}/> Anomalies Detected</p>
              <ul className="mt-2 list-disc pl-5 space-y-1">
                {result.detected_reasons?.map((reason, i) => <li key={`r-${i}`}>{reason}</li>)}
                {result.price_anomalies?.map((anomaly, i) => <li key={`a-${i}`}>{anomaly}</li>)}
              </ul>
            </div>
          )}

          {result.risk_score <= 20 && result.detected_reasons?.length === 0 && (
            <div className="mt-6 rounded-xl bg-teal-50 p-4 text-sm text-teal-900 flex items-start gap-2">
              <ShieldCheck size={18} className="mt-0.5 shrink-0" />
              <p>This bill appears legitimate. The math aligns and no obvious tampering was found.</p>
            </div>
          )}

          <div className="mt-5 flex gap-3">
            <button
              onClick={() => setResult(null)}
              className="flex-1 rounded-xl bg-slate-100 py-3 font-semibold text-slate-700 transition hover:bg-slate-200"
            >
              Scan Another
            </button>
            {(result.risk_score > 20 || result.requires_verification) && (
              <button
                onClick={handleReport}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-rose-600 py-3 font-semibold text-white transition hover:bg-rose-700"
              >
                Report <ArrowRight size={17} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
