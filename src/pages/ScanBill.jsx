import { useState } from "react";
import { ArrowRight, Sparkles, Upload } from "lucide-react";
import { Link } from "react-router-dom";

export function ScanBill() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(false);

  return (
    <div className="page-enter mx-auto max-w-2xl">
      <p className="text-sm font-semibold text-sea">BILL CHECK</p>
      <h1 className="mt-1 text-3xl font-bold text-ink">Understand your bill</h1>
      <p className="mt-2 text-slate-600">
        Upload a clear photo. We’ll simulate an item and tax-detail check for this prototype.
      </p>
      {!result ? (
        <>
          <label className="mt-7 flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed border-teal-200 bg-white p-10 text-center transition hover:bg-teal-50">
            <input
              type="file"
              className="hidden"
              accept="image/*,.pdf"
              onChange={(e) => setFile(e.target.files?.[0])}
            />
            <span className="grid h-14 w-14 place-items-center rounded-full bg-teal-100 text-sea">
              <Upload size={25} />
            </span>
            <span className="mt-4 font-semibold text-ink">
              {file ? file.name : "Upload bill photo or PDF"}
            </span>
            <span className="mt-1 text-sm text-slate-500">
              JPG, PNG or PDF · max 10 MB
            </span>
          </label>
          <button
            disabled={!file}
            onClick={() => setResult(true)}
            className="mt-4 w-full rounded-xl bg-ink py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Analyze bill
          </button>
        </>
      ) : (
        <div className="mt-7 rounded-2xl border bg-white p-6 shadow-soft">
          <div className="flex items-start justify-between">
            <div className="flex gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-amber-100 text-amber-700">
                <Sparkles size={21} />
              </span>
              <div>
                <h2 className="font-bold text-ink">Bill check complete</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Simulated analysis · please verify details manually
                </p>
              </div>
            </div>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
              Needs attention
            </span>
          </div>
          <div className="my-6 h-px bg-slate-100" />
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-500">Merchant</p>
              <p className="mt-1 font-semibold text-ink">Saffron Courtyard</p>
            </div>
            <div>
              <p className="text-slate-500">Bill total</p>
              <p className="mt-1 font-semibold text-ink">₹2,840.00</p>
            </div>
            <div>
              <p className="text-slate-500">GSTIN</p>
              <p className="mt-1 font-semibold text-ink">Partially detected</p>
            </div>
            <div>
              <p className="text-slate-500">Date</p>
              <p className="mt-1 font-semibold text-ink">31 Aug 2026</p>
            </div>
          </div>
          <div className="mt-6 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-bold">Potential concern detected</p>
            <p className="mt-1 leading-6">
              A service charge is listed but its description is unclear. Ask the
              establishment for an itemised explanation before paying.
            </p>
          </div>
          <Link
            to="/report"
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-ink py-3 font-semibold text-white"
          >
            Report this concern <ArrowRight size={17} />
          </Link>
        </div>
      )}
    </div>
  );
}
