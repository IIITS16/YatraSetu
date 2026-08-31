import { useState } from "react";
import {
  BadgeCheck,
  CheckCircle2,
  CircleAlert,
  MapPin,
  ScanLine,
  Search,
  Store,
} from "lucide-react";
import { businesses } from "../data";

export function Verify() {
  const [query, setQuery] = useState("");
  const filtered = businesses.filter(
    (b) =>
      b.name.toLowerCase().includes(query.toLowerCase()) ||
      b.id.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="page-enter mx-auto max-w-3xl">
      <p className="text-sm font-semibold text-sea">SERVICE VERIFICATION</p>
      <h1 className="mt-1 text-3xl font-bold text-ink">Verify before you book</h1>
      <p className="mt-2 text-slate-600">
        Search a business name or registration ID to check its official status.
      </p>
      <div className="relative mt-7">
        <Search size={20} className="absolute left-4 top-4 text-slate-400" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name or registration ID"
          className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-12 pr-4 outline-none ring-sea transition focus:ring-2"
        />
      </div>
      <button className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-sea">
        <ScanLine size={17} /> Scan provider QR instead
      </button>
      <div className="mt-6 space-y-3">
        {filtered.map((b) => (
          <article key={b.id} className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="flex gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-teal-50 text-sea">
                <Store size={23} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold text-ink">{b.name}</h2>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${b.color}`}
                  >
                    <CheckCircle2 size={13} />
                    {b.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  {b.type} · {b.id}
                </p>
                <p className="mt-2 flex items-center gap-1 text-sm text-slate-600">
                  <MapPin size={15} />
                  {b.place}
                </p>
              </div>
            </div>
          </article>
        ))}
        {!filtered.length && (
          <p className="rounded-xl bg-white p-6 text-center text-slate-500">
            No registered service found. Check the spelling or scan a provider QR.
          </p>
        )}
      </div>
      <div className="mt-6 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <CircleAlert className="shrink-0" size={19} />
        <p>
          Not finding a provider does not prove wrongdoing. Use caution and
          report suspicious activity with evidence.
        </p>
      </div>
    </div>
  );
}
