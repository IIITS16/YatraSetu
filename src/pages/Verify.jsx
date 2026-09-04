import { useState } from "react";
import {
  BadgeCheck,
  CheckCircle2,
  CircleAlert,
  Hotel,
  LocateFixed,
  MapPin,
  ScanLine,
  Search,
  ShoppingBag,
  Store,
  UtensilsCrossed,
  Users,
  Car,
  X,
} from "lucide-react";
import { businesses } from "../data";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet's default icon path issue in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const categories = [
  { key: "all", label: "All", icon: BadgeCheck },
  { key: "hotel", label: "Hotels", icon: Hotel },
  { key: "restaurant", label: "Restaurants", icon: UtensilsCrossed },
  { key: "guide", label: "Guides", icon: Users },
  { key: "transport", label: "Transport", icon: Car },
  { key: "shop", label: "Shops", icon: ShoppingBag },
];

const rangeOptions = [
  { km: 2, label: "2 km" },
  { km: 5, label: "5 km" },
  { km: 10, label: "10 km" },
  { km: 25, label: "25 km" },
];

// Haversine formula — distance in km between two GPS points
function getDistanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function Verify() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [viewMode, setViewMode] = useState("list"); // "list" or "map"

  // Near Me state
  const [userLocation, setUserLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [nearMeActive, setNearMeActive] = useState(false);
  const [rangeKm, setRangeKm] = useState(5);
  const [locationError, setLocationError] = useState("");

  function ChangeView({ center }) {
    const map = useMap();
    if (center) {
      map.setView(center, 13);
    }
    return null;
  }

  function handleNearMe() {
    if (nearMeActive) {
      // Turn off Near Me
      setNearMeActive(false);
      setUserLocation(null);
      setViewMode("list");
      return;
    }

    if (!navigator.geolocation) {
      setLocationError("Location is not supported by your browser.");
      return;
    }

    setLocating(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setNearMeActive(true);
        setLocating(false);
      },
      () => {
        setLocationError("Unable to get your location. Please allow location permission.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  // Build filtered + distance-annotated list
  let results = businesses
    .map((b) => {
      const distance =
        userLocation && nearMeActive
          ? getDistanceKm(userLocation.lat, userLocation.lng, b.lat, b.lng)
          : null;
      return { ...b, distance };
    })
    .filter((b) => {
      const matchesQuery =
        b.name.toLowerCase().includes(query.toLowerCase()) ||
        b.id.toLowerCase().includes(query.toLowerCase()) ||
        b.place.toLowerCase().includes(query.toLowerCase());
      const matchesCategory =
        activeCategory === "all" || b.category === activeCategory;
      const matchesRange =
        !nearMeActive || (b.distance !== null && b.distance <= rangeKm);
      return matchesQuery && matchesCategory && matchesRange;
    });

  // Sort by distance when Near Me is active
  if (nearMeActive) {
    results.sort((a, b) => (a.distance ?? 999) - (b.distance ?? 999));
  }

  const verifiedCount = results.filter((b) => b.status === "Verified").length;
  const unverifiedCount = results.filter((b) => b.status === "Unverified").length;

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

      {/* Near Me Button + Range Selector */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          onClick={handleNearMe}
          disabled={locating}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:opacity-60 ${
            nearMeActive
              ? "bg-sea text-white"
              : "border border-teal-200 bg-teal-50 text-sea hover:bg-teal-100"
          }`}
        >
          {locating ? (
            "Locating..."
          ) : nearMeActive ? (
            <>
              <LocateFixed size={16} /> Near Me On
              <X size={14} className="ml-1 opacity-70" />
            </>
          ) : (
            <>
              <LocateFixed size={16} /> Near Me
            </>
          )}
        </button>

        {nearMeActive && (
          <div className="flex items-center gap-1.5">
            {rangeOptions.map((opt) => (
              <button
                key={opt.km}
                onClick={() => setRangeKm(opt.km)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  rangeKm === opt.km
                    ? "bg-ink text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {locationError && (
        <p className="mt-2 text-sm text-rose-600">{locationError}</p>
      )}

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

      {/* Result Count & View Toggle */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex gap-3 text-xs text-slate-500">
          <span className="rounded-full bg-teal-50 px-2 py-0.5 font-semibold text-teal-700">
            {verifiedCount} verified
          </span>
          {unverifiedCount > 0 && (
            <span className="rounded-full bg-rose-50 px-2 py-0.5 font-semibold text-rose-700">
              {unverifiedCount} unverified
            </span>
          )}
          {nearMeActive && (
            <span className="rounded-full bg-blue-50 px-2 py-0.5 font-semibold text-blue-700">
              within {rangeKm} km
            </span>
          )}
        </div>

        {nearMeActive && (
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("list")}
              className={`rounded-md px-3 py-1 text-xs font-bold ${viewMode === "list" ? "bg-sea text-white" : "bg-slate-200 text-slate-600"}`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`rounded-md px-3 py-1 text-xs font-bold ${viewMode === "map" ? "bg-sea text-white" : "bg-slate-200 text-slate-600"}`}
            >
              Map
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="mt-4">
        {viewMode === "map" && nearMeActive && userLocation ? (
          <div className="h-[500px] w-full overflow-hidden rounded-2xl border bg-slate-100 shadow-sm relative z-0">
            <MapContainer center={[userLocation.lat, userLocation.lng]} zoom={13} style={{ height: "100%", width: "100%" }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
              <ChangeView center={[userLocation.lat, userLocation.lng]} />
              
              {/* User Location Marker */}
              <Marker position={[userLocation.lat, userLocation.lng]}>
                <Popup><span className="font-bold text-sea">You are here</span></Popup>
              </Marker>

              {/* Business Markers */}
              {results.map((b) => (
                <Marker key={b.id} position={[b.lat, b.lng]}>
                  <Popup>
                    <div className="p-1">
                      <h3 className="font-bold text-ink text-sm">{b.name}</h3>
                      <p className="text-xs text-slate-500 mb-2">{b.type}</p>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${b.color}`}>
                        {b.status === "Verified" ? <CheckCircle2 size={10} /> : <CircleAlert size={10} />}
                        {b.status === "Verified" ? "Govt Verified" : "Verification Required"}
                      </span>
                      {b.distance && <p className="mt-1 text-xs font-bold text-blue-600">{b.distance.toFixed(1)} km away</p>}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        ) : (
          <div className="space-y-3">
            {results.map((b) => (
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
                        {b.status === "Verified" ? "Govt Verified" : "Requires Verification"}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      {b.type} · {b.id}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      <p className="flex items-center gap-1 text-sm text-slate-600">
                        <MapPin size={15} />
                        {b.place}
                      </p>
                      {b.distance !== null && (
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700">
                          {b.distance < 1
                            ? `${Math.round(b.distance * 1000)} m away`
                            : `${b.distance.toFixed(1)} km away`}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))}
            {!results.length && (
              <p className="rounded-xl bg-white p-6 text-center text-slate-500">
                {nearMeActive
                  ? `No services found within ${rangeKm} km. Try increasing the range.`
                  : "No registered service found. Check the spelling or try a different category."}
              </p>
            )}
          </div>
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
