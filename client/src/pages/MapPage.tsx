import { useMemo, useState, useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft, Locate, Navigation, Car, Plus, X, Loader2, Search, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { contributeStation } from "@/lib/api";
import { Button } from "@/components/ui/button";
import MobileLayout from "@/components/layout/MobileLayout";
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  useMap,
  Tooltip,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { haversineDistance } from "@/lib/mockData";
import {
  useLocation as useUserLocation,
  DEFAULT_LOCATION,
} from "@/contexts/LocationContext";
import { useStations } from "@/hooks/useStations";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import StationDetailSheet from "@/components/StationDetailSheet";

/* ---------------- USER ICON ---------------- */

const userIcon = new L.DivIcon({
  className: "custom-marker",
  html: `
    <div style="
      width: 40px;
      height: 40px;
      background: rgba(239, 68, 68, 0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 20px rgba(239, 68, 68, 0.4);
    ">
      <div style="
        width: 24px;
        height: 24px;
        background: #ef4444;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
      ">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
      </div>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

/* ---------------- STATION ICON FACTORY ---------------- */

const createStationIcon = (status: string, isOlaCenter = false) => {
  const s = (status || "").toLowerCase();
  const color = isOlaCenter
    ? "#8b5cf6"
    : s === "available"
      ? "#22c55e"
      : s === "busy"
        ? "#f97316"
        : "#ef4444";

  const glow = s === "available" 
    ? `box-shadow: 0 0 12px rgba(34, 197, 94, 0.4), 0 0 4px rgba(255, 255, 255, 0.2) inset;` 
    : s === "busy"
      ? `box-shadow: 0 0 10px rgba(249, 115, 22, 0.3);`
      : `box-shadow: 0 0 8px rgba(0,0,0,0.3);`;

  return new L.DivIcon({
    className: "station-marker",
    html: `
      <div style="
        width: 44px;
        height: 44px;
        background: ${color};
        border-radius: 50%;
        border: 3.5px solid white;
        ${glow}
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      ">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
        </svg>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 44],
  });
};

/* ---------------- MAP CONTROLLER ---------------- */

function MapController({
  center,
  zoom,
}: {
  center: [number, number];
  zoom: number;
}) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, {
      animate: true,
      duration: 1.5
    });
  }, [center, zoom, map]);
  return null;
}

/* =================== MAIN COMPONENT =================== */

export default function MapPage() {
  const { latitude, longitude, loading, refreshLocation } = useUserLocation();

  const userLat = latitude ?? DEFAULT_LOCATION.lat;
  const userLng = longitude ?? DEFAULT_LOCATION.lng;

  const queryClient = useQueryClient();
  const [isAddChargerOpen, setIsAddChargerOpen] = useState(false);
  const [newChargerName, setNewChargerName] = useState("");
  const [newChargerPower, setNewChargerPower] = useState("22");
  
  // Search state
  const [searchStr, setSearchStr] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Search autocomplete
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchStr.trim().length > 2) {
        try {
          const res = await fetch(`/api/location/autocomplete?q=${encodeURIComponent(searchStr)}`);
          if (res.ok) {
            const data = await res.json();
            setSuggestions(data || []);
            setShowSuggestions(true);
          }
        } catch (e) {
          console.error("Autocomplete error:", e);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };
    const timer = setTimeout(fetchSuggestions, 400);
    return () => clearTimeout(timer);
  }, [searchStr]);

  const handleSearchSubmit = async () => {
    if (!searchStr.trim()) return;
    setIsSearching(true);
    setShowSuggestions(false);
    try {
      const geoRes = await fetch(`/api/stations/search?q=${encodeURIComponent(searchStr)}`);
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        setMapCenter([geoData.lat, geoData.lng]);
        setMapZoom(15);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const contributeMutation = useMutation({
    mutationFn: () => contributeStation({
      name: newChargerName,
      latitude: userLat,
      longitude: userLng,
      charger_power_kw: Number(newChargerPower) || 22,
      connector_type: "Type 2"
    }),
    onSuccess: () => {
      setIsAddChargerOpen(false);
      setNewChargerName("");
      alert("Charger added to the map successfully!");
      window.location.reload();
    }
  });

  const [rangeLimit, setRangeLimit] = useState(20);
  const [filterAvailable, setFilterAvailable] = useState(false);
  const [filterFastCharging, setFilterFastCharging] = useState(false);
  const [selectedStationId, setSelectedStationId] = useState<string | null>(
    null
  );
  const [selectedStationForSheet, setSelectedStationForSheet] = useState<any>(null);

  const [mapCenter, setMapCenter] = useState<[number, number]>([
    userLat,
    userLng,
  ]);
  const [mapZoom, setMapZoom] = useState(12);

  const searchParams = new URLSearchParams(window.location.search);
  const stationIdParam = searchParams.get("stationId");

  /* -------- SAFE RANGE LOAD (OPTIONAL FIX) -------- */
  useEffect(() => {
    const savedRange = localStorage.getItem("userRange");
    const parsed = Number(savedRange);
    if (!isNaN(parsed) && parsed > 0) {
      setRangeLimit(parsed);
    } else {
      setRangeLimit(20);
    }

    if (stationIdParam) setSelectedStationId(stationIdParam);
  }, [stationIdParam]);

  /* -------- PREVENT UNNECESSARY RECENTER -------- */
  useEffect(() => {
    if (!selectedStationId) {
      setMapCenter([userLat, userLng]);
    }
  }, [userLat, userLng, selectedStationId]);

  const vehicleId = localStorage.getItem("selectedVehicleId") || "v1";

  const { data: vehicleData, isLoading: vehicleLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: async () => {
      const res = await fetch('/api/vehicles');
      if (!res.ok) throw new Error('Failed to fetch vehicles');
      return res.json();
    }
  });

  const vehicle = useMemo(() => {
    if (!vehicleData) return null;
    return vehicleData.find((v: any) => v.id === vehicleId) || vehicleData[0];
  }, [vehicleData, vehicleId]);


  const { stations: allStations, loading: stationsLoading } = useStations(rangeLimit);

  /* -------- STATION FILTERING -------- */

  const visibleStations = useMemo(() => {
    if (!vehicle) return [];
    let stations = [...allStations];

    return stations
      .map((s) => ({
        ...s,
        distance_km: haversineDistance(
          userLat,
          userLng,
          s.latitude,
          s.longitude
        ),
      }))
      .filter((s) => {
        if (stationIdParam && s.id === stationIdParam) return true;
        if (s.distance_km > rangeLimit) return false;

        // Match Recommendations.tsx connection filtering
        const sConn = s.connector_type as string;
        const vConn = vehicle?.connector_type as string;

        let connectorMatch = true;
        if (sConn && sConn !== "Multiple") {
          connectorMatch = sConn === vConn || (vehicle?.type === 'car' && (sConn === 'CCS2' || sConn === 'Type 2'));
        }

        if (!connectorMatch) return false;

        // Ather Grid logic
        if (
          (s.id.includes("ather-grid") ||
            s.connector_type === "Ather Grid") &&
          vehicle.brand.toLowerCase() !== "ather"
        )
          return false;

        // Active Quick Filters
        if (filterAvailable && s.status !== 'available') return false;
        if (filterFastCharging && s.charger_power_kw < 50) return false;

        return true;
      });
  }, [rangeLimit, vehicle, stationIdParam, userLat, userLng, allStations, filterAvailable, filterFastCharging]);

  const selectedStationFromUrl = useMemo(
    () =>
      selectedStationId
        ? visibleStations.find((s) => s.id === selectedStationId)
        : null,
    [selectedStationId, visibleStations]
  );

  useEffect(() => {
    if (selectedStationFromUrl) {
      setMapCenter([
        selectedStationFromUrl.latitude,
        selectedStationFromUrl.longitude,
      ]);
      setMapZoom(15);
      setSelectedStationForSheet(selectedStationFromUrl);
    }
  }, [selectedStationFromUrl]);

  const handleCenterOnUser = () => {
    setMapCenter([userLat, userLng]);
    setMapZoom(12);
    refreshLocation();
  };

  const backHref = stationIdParam ? "/recommendations" : "/my-vehicle";

  /* =================== RENDER =================== */

  return (
    <MobileLayout>
      <div className="h-screen w-full relative">
        {/* Top overlays */}
        <div className="absolute top-0 left-0 right-0 z-[1000] p-4 bg-gradient-to-b from-black/80 to-transparent pt-10">
          <div className="flex items-center gap-3">
            {stationIdParam && (
              <Link href={backHref}>
                <Button size="icon" className="rounded-full bg-black/50 text-white backdrop-blur-md border border-white/10 shrink-0 h-10 w-10">
                  <ArrowLeft size={18} />
                </Button>
              </Link>
            )}
            <div className="relative flex-1">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                <Search size={16} />
              </div>
              <Input
                value={searchStr}
                onChange={(e) => setSearchStr(e.target.value)}
                placeholder="Search location..."
                className="w-full bg-black/60 border-white/10 text-white placeholder:text-zinc-500 rounded-2xl h-11 pl-10 pr-10 backdrop-blur-xl shadow-2xl focus-visible:ring-primary/50"
                onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
              />
              {searchStr && (
                <button 
                  onClick={() => setSearchStr("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                >
                  <X size={14} />
                </button>
              )}

              {/* Autocomplete dropdown */}
              <AnimatePresence>
                {showSuggestions && suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-14 left-0 right-0 bg-zinc-900/95 border border-white/10 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-2xl"
                  >
                    <div className="max-h-60 overflow-y-auto no-scrollbar">
                      {suggestions.map((s, idx) => (
                        <div
                          key={idx}
                          className="px-4 py-3 hover:bg-white/5 border-b border-white/5 last:border-0 cursor-pointer flex items-start gap-3"
                          onClick={() => {
                            setSearchStr(s.display_name);
                            setShowSuggestions(false);
                            if (s.lat && s.lng) {
                              setMapCenter([s.lat, s.lng]);
                              setMapZoom(15);
                            }
                          }}
                        >
                          <MapPin size={16} className="text-zinc-500 mt-0.5 shrink-0" />
                          <div className="flex flex-col">
                            <span className="text-white text-sm font-bold line-clamp-1">{s.display_name.split(',')[0]}</span>
                            <span className="text-zinc-500 text-[10px] line-clamp-1">{s.display_name.split(',').slice(1).join(',').trim()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <Button size="icon" className="rounded-full shadow-lg bg-black/50 text-white backdrop-blur-md border border-white/10 w-10 h-10 shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
            </Button>
          </div>
        </div>

        {/* Floating actions and filters bottom */}
        <div className="absolute bottom-36 left-4 right-4 z-[1001] flex flex-col gap-4">
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
            <Link href="/my-vehicle" className="shrink-0">
              <div className="bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 cursor-pointer hover:bg-white/10 transition-colors">
                <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center text-black">
                  <Car size={12} fill="currentColor" />
                </div>
                <span className="text-xs font-bold text-white truncate max-w-[100px]">
                  {vehicleLoading ? "..." : vehicle?.name || "Vehicle"}
                </span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </Link>
            
            <button 
              onClick={() => setFilterAvailable(!filterAvailable)}
              className={`px-3 py-2 rounded-full shadow-2xl border whitespace-nowrap text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                filterAvailable 
                  ? "bg-primary text-black border-primary shadow-[0_0_15px_rgba(249,115,22,0.4)]" 
                  : "bg-black/60 backdrop-blur-md text-white border-white/10"
              }`}
            >
              Available
            </button>
            <button 
              onClick={() => setFilterFastCharging(!filterFastCharging)}
              className={`px-3 py-2 rounded-full shadow-2xl border whitespace-nowrap text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                filterFastCharging 
                  ? "bg-primary text-black border-primary shadow-[0_0_15px_rgba(249,115,22,0.4)]" 
                  : "bg-black/60 backdrop-blur-md text-white border-white/10"
              }`}
            >
              Fast
            </button>
          </div>
        </div>

        {/* Floating actions right */}
        <div className="absolute top-28 right-4 z-[1000] flex flex-col gap-3">
          <Button 
            size="icon" 
            className="rounded-full shadow-xl bg-black/60 text-white backdrop-blur-md border border-white/10 w-10 h-10 hover:bg-primary hover:text-black transition-colors" 
            onClick={handleCenterOnUser}
          >
            <Locate size={18} />
          </Button>
        </div>

        {/* Bottom right FAB for Add Charger (StatiqConnect) */}
        <div className="absolute bottom-24 right-4 z-[1000] flex flex-col gap-3 items-end">
          <Button size="icon" className="rounded-2xl shadow-2xl bg-white text-black w-12 h-12 border border-zinc-200 hover:scale-105 transition-transform" onClick={() => setIsAddChargerOpen(true)}>
            <Plus size={24} />
          </Button>
        </div>

        {/* Bottom Center Plan Trip Button */}
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-[200px]">
          <Link href="/trip-planner">
            <Button className="w-full rounded-2xl shadow-[0_4px_30px_rgba(249,115,22,0.4)] bg-primary text-black font-bold h-12 border-2 border-white/20 hover:scale-105 transition-transform">
              <Navigation className="mr-2" size={18} /> Plan Trip
            </Button>
          </Link>
        </div>

        {(loading || stationsLoading || vehicleLoading) && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[1000] bg-primary text-black text-xs font-bold px-4 py-1.5 rounded-full shadow-[0_0_15px_rgba(255,165,0,0.3)]">
            Loading real stations...
          </div>
        )}

        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ width: "100%", height: "100%" }}
          zoomControl={false}
        >
          <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />

          <MapController center={mapCenter} zoom={mapZoom} />

          <Circle
            center={[userLat, userLng]}
            radius={rangeLimit * 1000}
            pathOptions={{
              color: "#ef4444",
              fillColor: "#ef4444",
              fillOpacity: 0.05,
              weight: 1,
            }}
          />

          <Marker position={[userLat, userLng]} icon={userIcon} />

          {/* The provided snippet for filters seems to be intended for a different location or component.
              Applying it directly here would cause syntax errors and incorrect rendering.
              Assuming the intent was to add a filter UI, but without context on `filterOptions`, `filterType`, `setFilterType`, `cn`,
              and its correct placement, I cannot integrate it syntactically correctly into this file.
              The original `visibleStations.map` rendering logic is preserved. */}

          {visibleStations.map((s) => {
            const isOla = s.id.startsWith("ola_");
            return (
              <Marker
                key={s.id}
                position={[s.latitude, s.longitude]}
                icon={createStationIcon(s.status, isOla)}
                riseOnHover={true}
                eventHandlers={{
                  click: (e) => {
                    L.DomEvent.stopPropagation(e);
                    setSelectedStationForSheet(s);
                  },
                }}
              >
                <Tooltip direction="top" offset={[0, -44]} opacity={1} permanent={false}>
                  <div className="bg-zinc-900 border border-white/20 px-3 py-1.5 rounded-xl text-[11px] font-bold text-white shadow-2xl backdrop-blur-md">
                    {s.name}
                  </div>
                </Tooltip>
              </Marker>
            );
          })}
        </MapContainer>

        <StationDetailSheet
          station={selectedStationForSheet}
          isOpen={!!selectedStationForSheet}
          isFavourite={false}
          onClose={() => setSelectedStationForSheet(null)}
        />

        {/* Add Charger Modal */}
        <AnimatePresence>
          {isAddChargerOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => !contributeMutation.isPending && setIsAddChargerOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[10000]"
              />
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: "-50%", x: "-50%" }}
                animate={{ scale: 1, opacity: 1, y: "-50%", x: "-50%" }}
                exit={{ scale: 0.95, opacity: 0, y: "-50%", x: "-50%" }}
                className="fixed top-1/2 left-1/2 w-[90%] max-w-sm bg-zinc-950 rounded-3xl z-[10001] border border-white/10 shadow-2xl p-6"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold tracking-tight">Add Missing Charger</h2>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-white/5 text-zinc-400" onClick={() => setIsAddChargerOpen(false)} disabled={contributeMutation.isPending}>
                    <X size={16} />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block">Station Name / Location</label>
                    <Input
                      value={newChargerName}
                      onChange={(e) => setNewChargerName(e.target.value)}
                      placeholder="e.g. Nexus Mall Basement"
                      className="bg-zinc-900 border-white/10 text-white rounded-xl h-12"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block">Power (kW)</label>
                    <Input
                      type="number"
                      value={newChargerPower}
                      onChange={(e) => setNewChargerPower(e.target.value)}
                      placeholder="e.g. 22"
                      className="bg-zinc-900 border-white/10 text-white rounded-xl h-12"
                    />
                  </div>
                  <div className="text-xs text-zinc-500 text-center italic mt-2">
                    Station will be added at your current location.
                  </div>
                  <Button
                    className="w-full bg-primary text-black font-bold h-12 rounded-xl mt-2 shadow-[0_4px_20px_rgba(249,115,22,0.3)]"
                    onClick={() => contributeMutation.mutate()}
                    disabled={!newChargerName.trim() || contributeMutation.isPending}
                  >
                    {contributeMutation.isPending ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
                    Submit Charger
                  </Button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </MobileLayout>
  );
}
