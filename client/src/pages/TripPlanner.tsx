import { useState, useEffect, useMemo, useRef } from "react";
import { Link } from "wouter";
import { ArrowLeft, Navigation, MapPin, Search, Loader2, Zap, X, Clock, Route } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MobileLayout from "@/components/layout/MobileLayout";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMap,
  Tooltip,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { haversineDistance } from "@/lib/mockData";
import { useLocation as useUserLocation, DEFAULT_LOCATION } from "@/contexts/LocationContext";
import { useStations } from "@/hooks/useStations";
import StationDetailSheet from "@/components/StationDetailSheet";

/* ---------------- ICONS ---------------- */
const userIcon = new L.DivIcon({
  className: "custom-marker",
  html: `
    <div style="
      width: 24px;
      height: 24px;
      background: #3b82f6;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const destIcon = new L.DivIcon({
  className: "custom-marker",
  html: `
    <div style="
      width: 28px;
      height: 28px;
      background: #ef4444;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="width: 10px; height: 10px; background: white; border-radius: 50%;"></div>
    </div>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const createStationIcon = (status: string, isOlaCenter = false) =>
  new L.DivIcon({
    className: "station-marker",
    html: `
      <div style="
        width: 36px;
        height: 36px;
        background: ${isOlaCenter
        ? "#8b5cf6"
        : status === "available"
          ? "#22c55e"
          : status === "busy"
            ? "#f97316"
            : "#ef4444"
      };
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 0 10px rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
        </svg>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
  });

/* ---------------- MAP CONTROLLER ---------------- */
function MapController({
  routeNodes,
}: {
  routeNodes: [number, number][];
}) {
  const map = useMap();
  useEffect(() => {
    if (routeNodes.length > 0) {
      const bounds = L.latLngBounds(routeNodes);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [routeNodes, map]);
  return null;
}

export default function TripPlanner() {
  const { latitude, longitude } = useUserLocation();
  const userLat = latitude ?? DEFAULT_LOCATION.lat;
  const userLng = longitude ?? DEFAULT_LOCATION.lng;

  const [destinationStr, setDestinationStr] = useState("");
  const [destCoords, setDestCoords] = useState<[number, number] | null>(null);
  const [routePolyline, setRoutePolyline] = useState<[number, number][]>([]);
  const [routeDetails, setRouteDetails] = useState<{ distance: string, duration: string } | null>(null);
  const [isRouting, setIsRouting] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isPlanning, setIsPlanning] = useState(true); // Default to search mode
  const [recentTrips, setRecentTrips] = useState<{name: string, lat: number, lng: number}[]>([]);

  // Load history from localStorage
  useEffect(() => {
    const history = localStorage.getItem("trip_history");
    if (history) {
      try {
        setRecentTrips(JSON.parse(history).slice(0, 4));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  const saveToHistory = (name: string, lat: number, lng: number) => {
    if (!name) return;
    const current = [...recentTrips];
    // Remove if already exists (same name)
    const filtered = current.filter(t => t.name !== name);
    const updated = [{ name, lat, lng }, ...filtered].slice(0, 4);
    setRecentTrips(updated);
    localStorage.setItem("trip_history", JSON.stringify(updated));
  };

  const clearHistory = () => {
    setRecentTrips([]);
    localStorage.removeItem("trip_history");
  };

  // Autocomplete fetcher
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (destinationStr.trim().length > 1) {
        try {
          const res = await fetch(`/api/location/autocomplete?q=${encodeURIComponent(destinationStr)}`);
          if (!res.ok) throw new Error("Autocomplete failed");
          const data = await res.json();
          setSuggestions(data || []);
          setShowSuggestions(true);
        } catch (e) {
          console.error("Autocomplete error:", e);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };
    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [destinationStr]);

  const fetchRoute = async (destPoint: [number, number], displayName: string) => {
    setIsRouting(true);
    setRoutePolyline([]);
    setDestCoords(destPoint);
    setShowSuggestions(false);
    setDestinationStr(displayName);
    setIsPlanning(false); // Switch to map mode

    try {
      const routeRes = await fetch(`https://router.project-osrm.org/route/v1/driving/${userLng},${userLat};${destPoint[1]},${destPoint[0]}?overview=full&geometries=geojson`);
      const routeData = await routeRes.json();

      if (routeData.code === "Ok" && routeData.routes.length > 0) {
        const route = routeData.routes[0];
        const coords = route.geometry.coordinates;
        const leafletCoords: [number, number][] = coords.map((c: [number, number]) => [c[1], c[0]]);
        setRoutePolyline(leafletCoords);
        setRouteDetails({
          distance: (route.distance / 1000).toFixed(1) + ' km',
          duration: Math.ceil(route.duration / 60) + ' min'
        });
        
        // Save to real history
        saveToHistory(displayName.split(',')[0], destPoint[0], destPoint[1]);
      } else {
        alert("Could not find a driving route.");
      }
    } catch (err) {
      console.error(err);
      alert("Error calculating route");
    } finally {
      setIsRouting(false);
    }
  };

  const { stations: allStations, loading: stationsLoading } = useStations(100); 
  const [selectedStationForSheet, setSelectedStationForSheet] = useState<any>(null);

  const mapCenter: [number, number] = destCoords || [userLat, userLng];

  const clearRoute = () => {
    setRoutePolyline([]);
    setDestCoords(null);
    setRouteDetails(null);
    setDestinationStr("");
    setIsPlanning(true);
  };

  const handleSearch = async () => {
    if (!destinationStr.trim()) return;
    setIsRouting(true);
    setShowSuggestions(false);

    try {
      const geoRes = await fetch(`/api/stations/search?q=${encodeURIComponent(destinationStr)}`);

      if (!geoRes.ok) {
        alert("Destination not found. Try a different search.");
        setIsRouting(false);
        return;
      }
      const geoData = await geoRes.json();
      if (!geoData || !geoData.lat) {
        alert("Destination not found. Try a different search.");
        setIsRouting(false);
        return;
      }

      const destPoint: [number, number] = [geoData.lat, geoData.lng];
      await fetchRoute(destPoint, geoData.display_name);
    } catch (err) {
      console.error(err);
      alert("Error finding destination");
      setIsRouting(false);
    }
  };

  // Smart Charging Stop Suggestions (filter stations near the route)
  const stationsNearRoute = useMemo(() => {
    if (routePolyline.length === 0) return [];
    const downsampledRoute = routePolyline.filter((_, i) => i % 20 === 0);

    return allStations.filter(station => {
      for (const point of downsampledRoute) {
        const dist = haversineDistance(station.latitude, station.longitude, point[0], point[1]);
        if (dist <= 5) return true; 
      }
      return false;
    });
  }, [allStations, routePolyline]);

  return (
    <MobileLayout showNav={isPlanning}>
      <div className="h-screen w-full relative bg-zinc-950 flex flex-col overflow-hidden">
        
        {/* MODE 1: SEARCH / PLANNING (Dedicated Full Screen) */}
        <AnimatePresence mode="wait">
          {isPlanning && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="absolute inset-0 z-[2000] bg-zinc-950 px-6 pt-12 pb-24 overflow-y-auto no-scrollbar"
            >
              <div className="flex items-center justify-between mb-8">
                <Link href="/map">
                  <Button variant="ghost" size="icon" className="rounded-full bg-white/5 border border-white/10 text-zinc-400">
                    <ArrowLeft size={18} />
                  </Button>
                </Link>
                <div className="flex flex-col items-center">
                  <h1 className="text-xl font-black uppercase tracking-tighter">Plan Trip</h1>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Route Studio</span>
                  </div>
                </div>
                <div className="w-10" /> {/* Spacer */}
              </div>

              <div className="space-y-6 max-w-sm mx-auto">
                <div className="relative pl-8 h-40">
                  <div className="absolute left-2 top-2 bottom-2 w-[1px] bg-gradient-to-b from-primary/50 via-zinc-800 to-red-500/50" />
                  
                  {/* Current Location Input */}
                  <div className="relative mb-6">
                    <div className="absolute -left-[31px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-zinc-950 border-2 border-primary flex items-center justify-center p-0.5">
                      <div className="w-full h-full rounded-full bg-primary" />
                    </div>
                    <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-black tracking-widest text-zinc-600 mb-0.5">Starting From</span>
                        <span className="text-sm font-bold text-white">Current Location</span>
                      </div>
                      <MapPin size={18} className="text-primary opacity-50" />
                    </div>
                  </div>

                  {/* Destination Input */}
                  <div className="relative">
                    <div className="absolute -left-[31px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-zinc-950 border-2 border-red-500 flex items-center justify-center p-0.5">
                      <div className="w-full h-full rounded-full bg-red-500 animate-pulse" />
                    </div>
                    <div className="relative">
                      <Input 
                        value={destinationStr}
                        autoFocus
                        onChange={(e) => setDestinationStr(e.target.value)}
                        placeholder="Where to?"
                        className="w-full bg-white text-black border-0 rounded-2xl h-14 pl-5 pr-12 text-base font-bold shadow-[0_10px_30px_-5px_rgba(0,0,0,0.3)] focus-visible:ring-primary placeholder:text-zinc-400"
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      />
                      {destinationStr && (
                        <button 
                          onClick={() => { setDestinationStr(""); setSuggestions([]); }}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black"
                        >
                          <X size={20} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Suggestions List */}
                <div className="space-y-2 pt-4">
                  <AnimatePresence>
                    {suggestions.map((s, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={() => {
                          setDestinationStr(s.display_name);
                          if (s.lat && s.lng) {
                            fetchRoute([Number(s.lat), Number(s.lng)], s.display_name);
                          }
                        }}
                        className="group flex items-center gap-4 p-4 rounded-2xl bg-zinc-900/30 border border-white/5 hover:bg-primary hover:border-primary/20 cursor-pointer transition-all active:scale-[0.98]"
                      >
                        <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0 group-hover:bg-black/20 transition-colors">
                          <Navigation size={18} className="text-zinc-500 group-hover:text-black" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-bold text-white group-hover:text-black truncate">
                            {s.display_name.split(',')[0]}
                          </span>
                          <span className="text-[10px] font-medium text-zinc-500 group-hover:text-black/60 truncate uppercase tracking-tight">
                            {s.display_name.split(',').slice(1).join(',').trim() || "Nearby location"}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {destinationStr.length > 2 && suggestions.length === 0 && (
                    <div className="py-12 flex flex-col items-center justify-center text-zinc-600 gap-3 grayscale opacity-40">
                      <Search size={32} />
                      <span className="text-xs font-bold uppercase tracking-widest">Searching map...</span>
                    </div>
                  )}

                  {!destinationStr && (
                    <div className="pt-8 space-y-4">
                      <div className="flex items-center justify-between px-2">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-700">Recent Trips</h3>
                        {recentTrips.length > 0 && (
                          <button 
                            onClick={clearHistory}
                            className="text-[9px] font-black uppercase tracking-tighter text-zinc-500 hover:text-red-500 transition-colors"
                          >
                            Clear All
                          </button>
                        )}
                      </div>
                      
                      {recentTrips.length > 0 ? (
                        <div className="grid grid-cols-2 gap-3">
                          {recentTrips.map(trip => (
                            <div 
                              key={trip.name} 
                              onClick={() => fetchRoute([trip.lat, trip.lng], trip.name)}
                              className="p-4 rounded-2xl bg-zinc-900/40 border border-white/5 flex flex-col gap-2 cursor-pointer hover:bg-primary/20 hover:border-primary/30 transition-all active:scale-95"
                            >
                              <Clock size={16} className="text-zinc-500" />
                              <span className="text-xs font-bold text-white truncate">{trip.name}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 rounded-3xl border border-white/5 bg-zinc-900/20 flex flex-col items-center justify-center gap-3 grayscale opacity-30">
                          <Route size={24} className="text-zinc-500" />
                          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">No recent history</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MODE 2: MAP VIEW / ROUTE ACTIVE */}
        {!isPlanning && (
          <>
            {/* Minimal Top Header */}
            <div className="absolute top-0 left-0 right-0 z-[1000] p-4 bg-gradient-to-b from-black/80 to-transparent pt-6 pointer-events-none">
              <div className="flex items-center gap-3 pointer-events-auto">
                <Button 
                  size="icon" 
                  onClick={() => setIsPlanning(true)}
                  className="rounded-full bg-black/60 text-white backdrop-blur-md border border-white/10 shrink-0 h-12 w-12"
                >
                  <ArrowLeft size={20} />
                </Button>
                
                {routePolyline.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex-1 bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-2xl h-12 flex items-center px-4 gap-3 shadow-2xl overflow-hidden"
                  >
                    <div className="p-1.5 rounded-lg bg-primary/10">
                      <Zap size={16} className="text-primary" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Destination</span>
                      <span className="text-xs font-black truncate max-w-[150px] leading-tight uppercase tracking-tight">
                        {destinationStr.split(',')[0]}
                      </span>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Bottom Summary Card (Statiq Style) */}
            <AnimatePresence>
              {routeDetails && (
                <motion.div
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-sm z-[2000] pointer-events-none"
                >
                  <div className="p-[1px] rounded-[2rem] bg-gradient-to-t from-primary/20 to-white/10 pointer-events-auto">
                    <div className="bg-zinc-950 rounded-[1.95rem] p-5 shadow-2xl border border-white/5 flex flex-col gap-6">
                      <div className="flex items-center justify-between">
                        <div className="flex gap-4">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1">Time</span>
                            <span className="text-xl font-black text-white">{routeDetails.duration}</span>
                          </div>
                          <div className="w-[1px] h-8 bg-white/5 mt-2" />
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1">Distance</span>
                            <span className="text-xl font-black text-white">{routeDetails.distance}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <div className="px-2 py-1 rounded-lg bg-primary/20 border border-primary/20 flex items-center gap-1.5 mb-1">
                            <Zap size={10} className="text-primary" />
                            <span className="text-[10px] font-black text-primary uppercase">{stationsNearRoute.length} Stations</span>
                          </div>
                          <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-tighter">Along Route</span>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Button 
                          onClick={() => {
                            if (destCoords) {
                              const [lat, lng] = destCoords;
                              // Explicitly pass origin to match our app's current location
                              window.open(`https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${lat},${lng}&travelmode=driving`, '_blank');
                            }
                          }}
                          className="flex-1 bg-primary hover:bg-primary/90 text-black font-black uppercase text-xs h-12 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
                        >
                          Start Navigation
                        </Button>
                        <Button 
                          onClick={clearRoute}
                          variant="ghost" 
                          className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 text-zinc-400 hover:text-white"
                        >
                          <X size={20} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        {/* Map Payload */}
        <div className="flex-1 w-full relative z-0 pb-[80px]">
          <MapContainer
            center={mapCenter}
            zoom={12}
            style={{ width: "100%", height: "100%" }}
            zoomControl={false}
          >
            <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />

            <MapController routeNodes={routePolyline.length > 0 ? routePolyline : [[userLat, userLng]]} />

            {/* Polyline Route */}
            {routePolyline.length > 0 && (
              <Polyline 
                positions={routePolyline} 
                pathOptions={{ 
                  color: "#ef4444", // statiqq-ish red route
                  weight: 5, 
                  opacity: 0.8,
                  lineCap: "round",
                  lineJoin: "round"
                }} 
              />
            )}

            {/* Start Marker */}
            <Marker position={[userLat, userLng]} icon={userIcon}>
              <Tooltip direction="top" offset={[0, -12]} permanent={false} className="custom-tooltip">Current Location</Tooltip>
            </Marker>

            {/* Destination Marker */}
            {destCoords && (
              <Marker position={destCoords} icon={destIcon}>
                <Tooltip direction="top" offset={[0, -14]} permanent={true} className="custom-tooltip">Destination</Tooltip>
              </Marker>
            )}

            {/* Charging Stations along route */}
            {stationsNearRoute.map((s) => {
              const isOla = s.id.startsWith("ola_");
              return (
                <Marker
                  key={s.id}
                  position={[s.latitude, s.longitude]}
                  icon={createStationIcon(s.status, isOla)}
                  eventHandlers={{
                    click: (e) => {
                      L.DomEvent.stopPropagation(e);
                      setSelectedStationForSheet(s);
                    },
                  }}
                >
                  <Tooltip direction="top" offset={[0, -36]} opacity={1} permanent={false}>
                    <div className="bg-zinc-900 border border-white/20 px-3 py-1.5 rounded-xl text-[11px] font-bold text-white shadow-2xl backdrop-blur-md">
                      {s.name}
                    </div>
                  </Tooltip>
                </Marker>
              );
            })}
          </MapContainer>
        </div>

        <StationDetailSheet
          station={selectedStationForSheet}
          isOpen={!!selectedStationForSheet}
          isFavourite={false}
          onClose={() => setSelectedStationForSheet(null)}
        />
      </div>

      {/* Global overrides for leaflet tooltips to make them dark mode compatible */}
      <style dangerouslySetInnerHTML={{__html: `
        .leaflet-tooltip.custom-tooltip {
          background-color: #18181b !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
          color: white !important;
          font-weight: bold !important;
          border-radius: 8px !important;
          font-size: 11px !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.5) !important;
        }
        .leaflet-tooltip-top:before {
          border-top-color: #18181b !important;
        }
      `}} />
    </MobileLayout>
  );
}