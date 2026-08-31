import { useState } from "react";
import {
  BadgeCheck,
  CheckCircle2,
  CircleAlert,
  Hotel,
  MapPin,
  ScanLine,
  Search,
  ShoppingBag,
  Store,
  UtensilsCrossed,
  Users,
  Car,
} from "lucide-react";
import { businesses } from "../data";

const categories = [
  { key: "all", label: "All", icon: BadgeCheck },
  { key: "hotel", label: "Hotels", icon: Hotel },
  { key: "restaurant", label: "Restaurants", icon: UtensilsCrossed },
  { key: "guide", label: "Guides", icon: Users },
  { key: "transport", label: "Transport", icon: Car },
  { key: "shop", label: "Shops", icon: ShoppingBag },
];

export function Verify() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const filtered = businesses.filter((b) => {
    const matchesQuery =
      b.name.toLowerCase().includes(query.toLowerCase()) ||
      b.id.toLowerCase().includes(query.toLowerCase()) ||
      b.place.toLowerCase().includes(query.toLowerCase());
    const matchesCategory =
      activeCategory === "all" || b.category === activeCategory;
    return matchesQuery && matchesCategory;
  });

  const verifiedCount = filtered.filter((b) => b.status === "Verified").length;
  const unverifiedCount = filtered.filter((b) => b.status === "Unverified").length;

  return (
    <div className="page-enter mx-auto max-w-3xl">
      <p className="text-sm font-semibold text-sea">SERVICE VERIFICATION</p>
      <h1 className="mt-1 text-3xl font-bold text-ink">Verify before you book</h1>
      <p className="mt-2 text-slate-600">
        Search a business name or registration ID to check its official status.
      </p>

      {/* Search Bar */}
      <div className="relative mt-7">
        <Search size={20} className="absolute left-4 top-4 text-slate-400" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, ID, or location"
          className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-12 pr-4 outline-none ring-sea transition focus:ring-2"
        />
      </div>

      {/* Category Filters */}
      <div className="mt-4 flex flex-wrap gap-2">
        {categories.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveCategory(key)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              activeCategory === key
                ? "bg-ink text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Result Count */}
      <div className="mt-4 flex gap-3 text-xs text-slate-500">
        <span className="rounded-full bg-teal-50 px-2 py-0.5 font-semibold text-teal-700">
          {verifiedCount} verified
        </span>
        {unverifiedCount > 0 && (
          <span className="rounded-full bg-rose-50 px-2 py-0.5 font-semibold text-rose-700">
            {unverifiedCount} unverified
          </span>
        )}
      </div>

      {/* Results */}
      <div className="mt-4 space-y-3">
        {filtered.map((b) => (
          <article key={b.id} className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="flex gap-4">
              <div
                className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${
                  b.status === "Verified" ? "bg-teal-50 text-sea" : "bg-rose-50 text-rose-600"
                }`}
              >
                <Store size={23} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold text-ink">{b.name}</h2>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${b.color}`}
                  >
                    {b.status === "Verified" ? (
                      <CheckCircle2 size={13} />
                    ) : (
                      <CircleAlert size={13} />
                    )}
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
            No registered service found. Check the spelling or try a different category.
          </p>
        )}
      </div>

      {/* Scan QR */}
      <button className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-sea">
        <ScanLine size={17} /> Scan provider QR instead
      </button>

      {/* Disclaimer */}
      <div className="mt-4 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <CircleAlert className="shrink-0" size={19} />
        <p>
          Not finding a provider does not prove wrongdoing. Use caution and
          report suspicious activity with evidence.
        </p>
      </div>
    </div>
  );
}
