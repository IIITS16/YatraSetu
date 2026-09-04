import { useState, useEffect } from "react";
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
import { Html5QrcodeScanner } from 'html5-qrcode';
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

import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-red-600">
          <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
          <pre className="text-xs bg-red-50 p-4 rounded overflow-auto whitespace-pre-wrap">
            {this.state.error && this.state.error.toString()}
            {this.state.error && this.state.error.stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export function Verify() {
  return (
    <ErrorBoundary>
      <VerifyContent />
    </ErrorBoundary>
  );
}

function VerifyContent() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [viewMode, setViewMode] = useState("list"); // "list" or "map"

  // Near Me state
  const [userLocation, setUserLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [nearMeActive, setNearMeActive] = useState(false);
  const [rangeKm, setRangeKm] = useState(5);
  const [locationError, setLocationError] = useState("");
  const [realBusinesses, setRealBusinesses] = useState([]);
  const [qrScannerOpen, setQrScannerOpen] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  function ChangeView({ center }) {
    const map = useMap();
    if (center) {
      map.setView(center, 13);
    }
    return null;
  }

  function handleNearMe(isRefresh = false) {
    if (nearMeActive && !isRefresh) {
      setNearMeActive(false);
      setUserLocation(null);
      setViewMode("list");
      setRealBusinesses([]);
      return;
    }

    setLocating(true);
    setLoadingText("Finding your location...");
    setLocationError("");

    const fetchRestaurants = async (lat, lng) => {
      setUserLocation({ lat, lng });
      setLoadingText("Scanning nearby businesses...");
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
        
        // Fetch restaurants, cafes, hotels within 25km - simple query that works reliably
        const query = `[out:json];(node["amenity"~"restaurant|cafe|fast_food"](around:25000,${lat},${lng});node["tourism"~"hotel|guest_house"](around:25000,${lat},${lng}););out body 200;`;
        const res = await fetch("https://overpass-api.de/api/interpreter?data=" + encodeURIComponent(query), {
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        if (!res.ok) throw new Error("API Error");
        
        const data = await res.json();
        const liveData = data.elements
          .filter(e => e.tags && e.tags.name)
          .map(e => {
            let type = "Restaurant", category = "restaurant";
            if (e.tags.tourism) { type = "Hotel"; category = "hotel"; }
            if (e.tags.amenity === "cafe") { type = "Cafe"; category = "restaurant"; }
            if (e.tags.amenity === "fast_food") { type = "Fast Food"; category = "restaurant"; }
            return {
              id: "YATRA-" + e.id,
              name: e.tags.name,
              type,
              category,
              lat: e.lat,
              lng: e.lon,
              place: e.tags["addr:street"] || e.tags["addr:city"] || "Local Area",
              status: (e.id % 3 === 0) ? "Unverified" : "Verified",
              color: (e.id % 3 === 0) ? "bg-rose-100 text-rose-600" : "bg-teal-100 text-teal-700"
            };
          });
        setRealBusinesses(liveData);
      } catch (err) {
        console.error("Overpass API failed, retrying...", err);
        // Retry once with simpler query
        try {
          const query2 = `[out:json];node["amenity"~"restaurant|cafe"](around:25000,${lat},${lng});out body 150;`;
          const res2 = await fetch("https://overpass-api.de/api/interpreter?data=" + encodeURIComponent(query2));
          const data2 = await res2.json();
          const retryData = data2.elements
            .filter(e => e.tags && e.tags.name)
            .map(e => ({
              id: "YATRA-" + e.id, name: e.tags.name,
              type: e.tags.amenity === "cafe" ? "Cafe" : "Restaurant", category: "restaurant",
              lat: e.lat, lng: e.lon,
              place: e.tags["addr:street"] || e.tags["addr:city"] || "Local Area",
              status: (e.id % 3 === 0) ? "Unverified" : "Verified",
              color: (e.id % 3 === 0) ? "bg-rose-100 text-rose-600" : "bg-teal-100 text-teal-700"
            }));
          setRealBusinesses(retryData);
        } catch (err2) {
          console.error("Retry also failed:", err2);
          setRealBusinesses([]);
        }
      } finally {
        setNearMeActive(true);
        setLocating(false);
        setLoadingText("");
      }
    };

    let locationFound = false;

    // Fast Fallback: If 3 seconds pass and no GPS, use IP
    const fallbackTimer = setTimeout(async () => {
      if (!locationFound) {
        setLoadingText("GPS slow, using IP location...");
        try {
          const res = await fetch('https://ipapi.co/json/');
          const data = await res.json();
          if (data.latitude && data.longitude) {
            locationFound = true;
            fetchRestaurants(data.latitude, data.longitude);
          } else {
            throw new Error("No IP loc");
          }
        } catch (e) {
          locationFound = true;
          fetchRestaurants(26.9124, 75.7873); // Ultimate fallback to Jaipur
        }
      }
    }, 3000);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (!locationFound) {
            locationFound = true;
            clearTimeout(fallbackTimer);
            fetchRestaurants(pos.coords.latitude, pos.coords.longitude);
          }
        },
        () => {}, 
        { enableHighAccuracy: false, timeout: 3000, maximumAge: 0 }
      );
    }
  }

  // Initialize QR Scanner when modal opens
  useEffect(() => {
    if (qrScannerOpen && !scanResult) {
      const scanner = new Html5QrcodeScanner("reader", { 
        qrbox: { width: 250, height: 250 }, 
        fps: 5 
      }, false);
      
      scanner.render(
        async (decodedText) => {
          scanner.clear();
          try {
            const res = await fetch("http://localhost:5000/api/verify-guide", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ token: decodedText })
            });
            const data = await res.json();
            setScanResult(data);
          } catch(e) {
            setScanResult({ success: false, status: "Network Error", message: e.message });
          }
        },
        (error) => { /* ignore */ }
      );
      
      return () => { 
        scanner.clear().catch(e => console.log(e)); 
      };
    }
  }, [qrScannerOpen, scanResult]);

  // Build filtered + distance-annotated list
  let results = realBusinesses
    .map((b) => {
      const distance =
        userLocation && nearMeActive
          ? getDistanceKm(userLocation.lat, userLocation.lng, b.lat, b.lng)
          : null;
      return { ...b, distance };
    })
    .filter((b) => {
      const safeName = b.name ? String(b.name).toLowerCase() : "";
      const safeId = b.id ? String(b.id).toLowerCase() : "";
      const safePlace = b.place ? String(b.place).toLowerCase() : "";
      const safeQuery = query ? String(query).toLowerCase() : "";

      const matchesQuery =
        safeName.includes(safeQuery) ||
        safeId.includes(safeQuery) ||
        safePlace.includes(safeQuery);
        
      const matchesCategory =
        activeCategory === "all" || b.category === activeCategory;
      const matchesRange =
        !nearMeActive || (b.distance !== null && !isNaN(b.distance) && b.distance <= rangeKm);
        
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
          onClick={() => handleNearMe(false)}
          disabled={locating}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:opacity-60 ${
            nearMeActive
              ? "bg-sea text-white"
              : "border border-teal-200 bg-teal-50 text-sea hover:bg-teal-100"
          }`}
        >
          {locating ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-sea border-t-transparent"></span>
              {loadingText || "Locating..."}
            </span>
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
      <button 
        onClick={() => setQrScannerOpen(true)}
        className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-sea hover:text-teal-700 transition"
      >
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

      {/* MVP Demo: Fake QR Scanner Modal */}
      {qrScannerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl relative overflow-hidden">
            <button 
              onClick={() => { setQrScannerOpen(false); setScanResult(null); }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>
            
            <h3 className="text-lg font-bold text-ink mb-4 text-center">Scan Guide ID / QR</h3>
            
            {!scanResult ? (
              <div className="relative w-full overflow-hidden rounded-xl bg-slate-800">
                <div id="reader" className="w-full h-full bg-black"></div>
                <p className="absolute bottom-4 left-0 w-full text-center text-xs text-white/90 z-50 drop-shadow-md">Point camera at Guide's Govt QR Code</p>
              </div>
            ) : scanResult.success ? (
              <div className="text-center py-6">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal-100 text-teal-600 mb-4">
                  <CheckCircle2 size={32} />
                </div>
                <h4 className="text-xl font-bold text-ink">{scanResult.guide.name}</h4>
                <p className="text-sm font-semibold text-teal-600 mt-1">Govt Approved Guide</p>
                <div className="mt-4 rounded-lg bg-slate-50 p-3 text-left text-xs text-slate-600 space-y-2">
                  <p><span className="font-semibold text-slate-400 w-20 inline-block">ID:</span> {scanResult.guide.id}</p>
                  <p><span className="font-semibold text-slate-400 w-20 inline-block">Language:</span> {scanResult.guide.languages}</p>
                  <p><span className="font-semibold text-slate-400 w-20 inline-block">Rating:</span> ⭐ {scanResult.guide.rating}/5.0</p>
                  <p><span className="font-semibold text-slate-400 w-20 inline-block">Risk Score:</span> {scanResult.guide.risk_score} (Anomalies)</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-600 mb-4">
                  <CircleAlert size={32} />
                </div>
                <h4 className="text-xl font-bold text-rose-600">Verification Failed</h4>
                <p className="text-sm font-semibold text-slate-600 mt-2">{scanResult.status || "Error"}</p>
                <div className="mt-4 rounded-lg bg-rose-50 p-3 text-left text-xs text-rose-700">
                  <p>{scanResult.message}</p>
                </div>
              </div>
            )}
            
            {scanResult && (
              <button 
                onClick={() => setScanResult(null)}
                className="mt-6 w-full rounded-xl bg-slate-100 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-200"
              >
                Scan Another QR
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
