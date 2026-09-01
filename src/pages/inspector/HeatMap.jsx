import { useEffect, useState } from "react";
import { useAuth } from "../../auth";
import { API_BASE } from "../../config";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Map, AlertOctagon, TrendingUp, ShieldAlert } from "lucide-react";

// CSS for the glowing pulse animation
const glowStyles = `
  @keyframes pulse-red { 0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(225, 29, 72, 0.7); } 70% { transform: scale(1); box-shadow: 0 0 0 20px rgba(225, 29, 72, 0); } 100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(225, 29, 72, 0); } }
  @keyframes pulse-amber { 0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.7); } 70% { transform: scale(1); box-shadow: 0 0 0 20px rgba(245, 158, 11, 0); } 100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); } }
  @keyframes pulse-emerald { 0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); } 70% { transform: scale(1); box-shadow: 0 0 0 20px rgba(16, 185, 129, 0); } 100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); } }
  
  .glow-marker-red { animation: pulse-red 2s infinite; }
  .glow-marker-amber { animation: pulse-amber 2s infinite; }
  .glow-marker-emerald { animation: pulse-emerald 2s infinite; }
`;

// Realistic Demo Data for Jaipur SIH Demo
const JAIPUR_MOCK_HOTSPOTS = [
  { id: 'm1', latitude: 26.9239, longitude: 75.8267, concern_type: "Overcharging / Fake Guide", risk_score: 95, business_name: "Hawa Mahal Area" },
  { id: 'm2', latitude: 26.9855, longitude: 75.8513, concern_type: "Harassment", risk_score: 88, business_name: "Amer Fort Approach" },
  { id: 'm3', latitude: 26.9235, longitude: 75.7946, concern_type: "Misleading Service", risk_score: 82, business_name: "Sindhi Camp Bus Stand" },
  { id: 'm4', latitude: 26.9116, longitude: 75.8195, concern_type: "Safety Concern", risk_score: 65, business_name: "Albert Hall Museum" },
  { id: 'm5', latitude: 26.9535, longitude: 75.8462, concern_type: "Overcharging", risk_score: 55, business_name: "Jal Mahal Promenade" },
  { id: 'm6', latitude: 26.8631, longitude: 75.8118, concern_type: "Unverified Business", risk_score: 30, business_name: "Jawahar Circle" },
  { id: 'm7', latitude: 26.9258, longitude: 75.8236, concern_type: "Quality Issue", risk_score: 40, business_name: "City Palace Gates" },
];

function getGlowingIcon(risk) {
  const isHigh = risk > 80;
  const isMed = risk > 50;
  
  const hex = isHigh ? "#e11d48" : isMed ? "#f59e0b" : "#10b981";
  const pulseClass = isHigh ? "glow-marker-red" : isMed ? "glow-marker-amber" : "glow-marker-emerald";
  
  const iconHtml = `
    <div style="position: relative; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center;">
      <!-- Diffused background glow -->
      <div style="position: absolute; inset: 0; background: radial-gradient(circle, ${hex}88 0%, transparent 60%);"></div>
      
      <!-- Core animated pin -->
      <div class="${pulseClass}" style="
        position: relative;
        z-index: 10;
        width: 16px; height: 16px; 
        background: ${hex}; 
        border: 2px solid white; 
        border-radius: 50%;
        box-shadow: 0 0 10px ${hex};
      "></div>
    </div>
  `;

  return L.divIcon({
    className: "custom-div-icon",
    html: iconHtml,
    iconSize: [60, 60],
    iconAnchor: [30, 30],
  });
}

export function HeatMap() {
  const { token, user } = useAuth();
  const [points, setPoints] = useState(JAIPUR_MOCK_HOTSPOTS);
  const [loading, setLoading] = useState(true);

  // Jaipur coordinates
  const center = [26.9124, 75.8173];

  useEffect(() => {
    async function fetchHeatmap() {
      try {
        const res = await fetch(`${API_BASE}/inspector/heatmap`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.points)) {
          // Merge API data with Mock Data for a populated SIH Demo Map
          setPoints([...JAIPUR_MOCK_HOTSPOTS, ...data.points]);
        }
      } catch (err) {
        console.error("Failed to fetch heatmap", err);
      } finally {
        setLoading(false);
      }
    }
    fetchHeatmap();
  }, [token]);

  return (
    <div className="space-y-6">
      <style>{glowStyles}</style>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Government Heatmap Dashboard</h1>
          <p className="text-slate-500">Real-time risk visibility for {user?.region === "all" || user?.role === "government" ? "Jaipur Authority" : user?.region}</p>
        </div>
      </div>

      {/* Dark Theme Dashboard Container mimicking the image */}
      <div className="rounded-2xl border border-slate-800 bg-[#0b1121] shadow-xl overflow-hidden p-4 space-y-4">
        
        {/* Top KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">High Risk Areas</p>
            <div className="flex items-end gap-2">
              <p className="text-2xl font-black text-rose-500">128</p>
              <span className="text-emerald-400 text-xs font-bold mb-1">+12%</span>
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Complaints (7D)</p>
            <div className="flex items-end gap-2">
              <p className="text-2xl font-black text-white">1,482</p>
              <span className="text-emerald-400 text-xs font-bold mb-1">+18%</span>
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Unregistered Ops</p>
            <div className="flex items-end gap-2">
              <p className="text-2xl font-black text-amber-400">342</p>
              <span className="text-emerald-400 text-xs font-bold mb-1">+9%</span>
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Est. Leakage</p>
            <div className="flex items-end gap-2">
              <p className="text-2xl font-black text-teal-400">₹2.48 Cr</p>
            </div>
          </div>
        </div>

        {/* The Map itself */}
        <div className="h-[550px] w-full rounded-xl overflow-hidden border border-slate-700 relative z-0 shadow-inner">
          {loading && (
            <div className="absolute inset-0 bg-slate-900/80 z-10 flex items-center justify-center">
              <p className="text-teal-400 font-medium">Loading geospatial data...</p>
            </div>
          )}
          
          <MapContainer center={center} zoom={12} style={{ height: "100%", width: "100%", backgroundColor: '#0f172a' }}>
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
            
            {points.map((p, index) => {
              const risk = p.risk_score || 50;
              return (
                <Marker
                  key={p.id || `mock-${index}`}
                  position={[p.latitude, p.longitude]}
                  icon={getGlowingIcon(risk)}
                >
                  <Popup className="dark-popup">
                    <div className="p-1">
                      <h3 className="font-bold text-slate-900 text-sm mb-1">{p.business_name || "Unknown"}</h3>
                      <p className="text-xs text-slate-600 mb-2">{p.concern_type}</p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                        risk > 80 ? 'bg-rose-100 text-rose-700' :
                        risk > 50 ? 'bg-amber-100 text-amber-700' :
                        'bg-emerald-100 text-emerald-700'
                      }`}>
                        Risk Score: {risk}/100
                      </span>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>

          {/* Legend Overlay */}
          <div className="absolute top-4 right-4 z-[400] bg-slate-900/90 border border-slate-700 p-3 rounded-lg backdrop-blur-sm">
            <p className="text-xs font-bold text-slate-300 mb-2 tracking-wider">RISK LEVEL</p>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Low</div>
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Moderate</div>
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500"></span> High / Very High</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
