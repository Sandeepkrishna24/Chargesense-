import { useState, useEffect, useMemo } from "react";
import { Link } from "wouter";
import { Zap, MapPin, Locate, Plug, BatteryCharging, BarChart3, Car, ChevronRight, Navigation, Bike } from "lucide-react";
import { motion } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import MobileLayout from "@/components/layout/MobileLayout";
import { MapContainer, TileLayer, Marker, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useQuery } from "@tanstack/react-query";
import {
  useLocation as useUserLocation,
  DEFAULT_LOCATION,
} from "@/contexts/LocationContext";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const userIcon = new L.DivIcon({
  className: "custom-marker",
  html: `<div style="width:24px;height:24px;background:#f97316;border-radius:50%;border:3px solid white;box-shadow:0 0 12px rgba(249,115,22,0.7);display:flex;align-items:center;justify-content:center;"><div style="width:7px;height:7px;background:white;border-radius:50%;"></div></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function MyVehicle() {
  const { profile } = useAuth();
  const { latitude, longitude, loading: locationLoading, refreshLocation } = useUserLocation();

  const userLat = latitude ?? DEFAULT_LOCATION.lat;
  const userLng = longitude ?? DEFAULT_LOCATION.lng;

  const [soc, setSoc] = useState([45]);
  const [rangeRadius, setRangeRadius] = useState([20]);

  const { data: vehicleData, isLoading: vehicleLoading } = useQuery({
    queryKey: ["vehicles"],
    queryFn: async () => {
      const res = await fetch("/api/vehicles");
      if (!res.ok) throw new Error("Failed to fetch vehicles");
      return res.json();
    },
  });

  const vehicleId = localStorage.getItem("selectedVehicleId") || "v1";

  const vehicle = useMemo(() => {
    if (!vehicleData) return null;
    return vehicleData.find((x: any) => x.id === vehicleId) || vehicleData[0];
  }, [vehicleData, vehicleId]);

  useEffect(() => {
    const savedRange = localStorage.getItem("userRange");
    if (savedRange) setRangeRadius([parseInt(savedRange)]);
  }, []);

  useEffect(() => {
    localStorage.setItem("userRange", rangeRadius[0].toString());
  }, [rangeRadius]);

  if (vehicleLoading) {
    return (
      <MobileLayout>
        <div className="flex h-screen items-center justify-center bg-black">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <div className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Loading vehicle...</div>
          </div>
        </div>
      </MobileLayout>
    );
  }

  if (!vehicle) return null;

  const estimatedRange = Math.floor((vehicle.full_range_km * soc[0]) / 100);
  const socColor = soc[0] > 60 ? "text-emerald-400" : soc[0] > 25 ? "text-amber-400" : "text-red-400";
  const socGlow = soc[0] > 60 ? "from-emerald-500/20" : soc[0] > 25 ? "from-amber-500/20" : "from-red-500/20";
  const VehicleIcon = vehicle.type === "car" ? Car : Bike;

  return (
    <MobileLayout>
      <div className="min-h-screen bg-black relative overflow-hidden">
        {/* Background grid */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA0KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20 pointer-events-none" />
        <div className="absolute top-0 left-0 w-[70vw] h-[70vw] bg-gradient-to-br from-primary/15 to-transparent rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[60vw] h-[60vw] bg-gradient-to-tl from-orange-500/8 to-transparent rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 p-5 pb-28 space-y-5">

          {/* ── HEADER ── */}
          <div className="flex justify-between items-center pt-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-0.5">My Vehicle</p>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                {profile?.name?.split(" ")[0] || "Driver"}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/vehicles">
                <button className="text-[10px] font-bold uppercase tracking-wider px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:border-primary/40 hover:text-primary transition-all">
                  Change
                </button>
              </Link>
              <Link href="/profile">
                <div className="w-11 h-11 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center overflow-hidden shadow-[0_0_15px_rgba(255,165,0,0.15)] cursor-pointer active:scale-95 transition-transform">
                  {profile?.photoUrl ? (
                    <img src={profile.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-bold text-base text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">
                      {(profile?.name || "D")[0].toUpperCase()}
                    </span>
                  )}
                </div>
              </Link>
            </div>
          </div>

          {/* ── HERO BATTERY CARD ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "relative rounded-[2.5rem] overflow-hidden bg-zinc-900/50 backdrop-blur-xl border border-white/8 shadow-2xl",
            )}
            style={{ minHeight: 260 }}
          >
            {/* Dynamic glow based on SOC */}
            <div className={cn("absolute inset-0 bg-gradient-to-br to-transparent pointer-events-none", socGlow)} />
            
            {/* Vehicle image — right side */}
            <div className="absolute right-0 top-0 bottom-0 w-[55%] pointer-events-none">
              <img
                src={vehicle.image_url}
                alt={vehicle.name}
                className="w-full h-full object-cover object-center opacity-30"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-zinc-900 via-zinc-900/60 to-transparent" />
            </div>

            {/* Content */}
            <div className="relative z-10 p-7 flex flex-col justify-between h-full" style={{ minHeight: 260 }}>
              {/* Top: brand + type badge */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-white backdrop-blur-sm">
                  <VehicleIcon size={11} />
                  {vehicle.brand}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  {vehicle.name}
                </span>
              </div>

              {/* SOC display */}
              <div className="mt-4 flex items-center gap-5">
                {/* Animated battery icon */}
                <div className="flex flex-col items-center gap-1.5">
                  {/* Battery body */}
                  <div className="relative w-10 h-20 rounded-lg border-2 border-white/20 bg-black/40 overflow-hidden flex flex-col justify-end">
                    {/* Battery fill — animates with soc */}
                    <motion.div
                      className="w-full rounded-sm"
                      animate={{
                        height: `${soc[0]}%`,
                        backgroundColor:
                          soc[0] > 60 ? "#34d399"   // emerald
                          : soc[0] > 25 ? "#fbbf24"  // amber
                          : "#f87171",               // red
                        boxShadow:
                          soc[0] > 60 ? "0 0 10px rgba(52,211,153,0.6)"
                          : soc[0] > 25 ? "0 0 10px rgba(251,191,36,0.6)"
                          : "0 0 10px rgba(248,113,113,0.6)",
                      }}
                      transition={{ type: "spring", stiffness: 80, damping: 14 }}
                    />
                  </div>
                  {/* Battery tip */}
                  <div className="w-4 h-1.5 rounded-sm bg-white/20 -mt-2.5 z-10 relative" />
                </div>

                {/* Percentage + range */}
                <div>
                  <div className="flex items-baseline gap-0.5">
                    <motion.span
                      key={soc[0]}
                      initial={{ scale: 1.15, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className={cn("text-7xl font-mono font-bold tracking-tighter", socColor)}
                    >
                      {soc[0]}
                    </motion.span>
                    <span className="text-3xl font-bold text-white/60 ml-0.5">%</span>
                  </div>
                  <p className="text-xs text-zinc-400 font-bold tracking-widest uppercase mt-1">
                    ~{estimatedRange} km range
                  </p>
                </div>
              </div>

              {/* Battery slider */}
              <div className="mt-5">
                <div className="flex justify-between items-center mb-2.5">
                  <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-[0.2em]">Battery Level</span>
                  <span className={cn("text-[10px] font-black", socColor)}>
                    {soc[0] > 60 ? "Good" : soc[0] > 25 ? "Moderate" : "Low — Charge Soon"}
                  </span>
                </div>
                <Slider
                  max={100}
                  step={1}
                  value={soc}
                  onValueChange={setSoc}
                  className="cursor-pointer"
                />
              </div>
            </div>
          </motion.div>

          {/* ── VEHICLE SPEC GRID ── */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="grid grid-cols-3 gap-3"
          >
            {[
              { label: "Battery", value: `${vehicle.battery_capacity_kwh}`, unit: "kWh", icon: BatteryCharging, color: "text-emerald-400" },
              { label: "Power", value: `${vehicle.charging_speed_kw}`, unit: "kW", icon: Zap, color: "text-primary" },
              { label: "Connector", value: vehicle.connector_type?.replace(" ", "\n") || "—", unit: "", icon: Plug, color: "text-blue-400" },
            ].map((stat) => (
              <div key={stat.label} className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-3.5 flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <stat.icon size={12} className={stat.color} />
                  <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">{stat.label}</span>
                </div>
                <div className="flex items-baseline gap-0.5 mt-0.5">
                  <span className="text-base font-mono font-bold text-white leading-tight">{stat.value}</span>
                  {stat.unit && <span className="text-[9px] text-zinc-500 font-bold">{stat.unit}</span>}
                </div>
              </div>
            ))}
          </motion.div>

          {/* ── RANGE RADIUS + MAP ── */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14 }}
            className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[2rem] overflow-hidden shadow-xl"
          >
            <div className="p-5 pb-4">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                    <MapPin size={16} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Search Radius</p>
                    <p className="text-xs text-zinc-300 font-medium">
                      {vehicle.charger_type_supported.join(" / ")} charging
                    </p>
                  </div>
                </div>
                <motion.span
                  key={rangeRadius[0]}
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="font-mono text-primary bg-primary/15 border border-primary/20 px-3 py-1 rounded-lg text-sm font-black"
                >
                  {rangeRadius[0]} km
                </motion.span>
              </div>
              <Slider
                max={50}
                step={1}
                value={rangeRadius}
                onValueChange={setRangeRadius}
                className="cursor-pointer"
              />
            </div>

            {/* Map */}
            <div className="h-48 relative">
              <MapContainer
                center={[userLat, userLng]}
                zoom={12}
                style={{ width: "100%", height: "100%" }}
                zoomControl={false}
                attributionControl={false}
                dragging={false}
                scrollWheelZoom={false}
                doubleClickZoom={false}
                touchZoom={false}
              >
                <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                <MapUpdater center={[userLat, userLng]} />
                <Marker position={[userLat, userLng]} icon={userIcon} />
                <Circle
                  center={[userLat, userLng]}
                  radius={rangeRadius[0] * 1000}
                  pathOptions={{ color: "#f97316", fillColor: "#f97316", fillOpacity: 0.08, weight: 2 }}
                />
              </MapContainer>

              {/* Top fade overlay */}
              <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-zinc-900/60 to-transparent z-[400] pointer-events-none" />

              {/* Expand Map button */}
              <Link href="/map">
                <div className="absolute bottom-3 right-3 z-[400]">
                  <button className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-3 py-2 rounded-xl bg-black/70 backdrop-blur-md border border-white/15 text-white hover:border-primary/40 hover:text-primary transition-all">
                    <Navigation size={12} />
                    Full Map
                  </button>
                </div>
              </Link>

              {/* Location refresh pill */}
              <div className="absolute bottom-3 left-3 z-[400]">
                <button
                  onClick={refreshLocation}
                  className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-3 py-2 rounded-xl bg-black/70 backdrop-blur-md border border-white/15 text-white hover:border-primary/40 hover:text-primary transition-all"
                >
                  <Locate size={12} />
                  Locate
                </button>
              </div>
            </div>
          </motion.div>

          {/* ── CTA GRID ── */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 gap-3"
          >
            <Link href={`/recommendations?range=${rangeRadius[0]}&soc=${soc[0]}`} className="block">
              <div className="group relative rounded-[2rem] overflow-hidden bg-gradient-to-br from-primary/20 to-orange-600/10 border border-primary/20 p-5 cursor-pointer hover:border-primary/50 transition-all shadow-xl hover:shadow-[0_0_25px_rgba(255,165,0,0.15)] active:scale-[0.98]">
                <div className="w-11 h-11 rounded-2xl bg-primary/20 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(255,165,0,0.4)] transition-all">
                  <Zap size={22} className="text-primary" fill="currentColor" />
                </div>
                <p className="font-bold text-base text-white mb-0.5 tracking-tight">Find Chargers</p>
                <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Scan {rangeRadius[0]}km radius</p>
                <ChevronRight size={16} className="absolute top-4 right-4 text-zinc-600 group-hover:text-primary transition-colors" />
              </div>
            </Link>

            <Link href="/analytics" className="block">
              <div className="group relative rounded-[2rem] overflow-hidden bg-gradient-to-br from-blue-500/15 to-cyan-600/5 border border-blue-500/20 p-5 cursor-pointer hover:border-blue-400/50 transition-all shadow-xl hover:shadow-[0_0_25px_rgba(59,130,246,0.1)] active:scale-[0.98]">
                <div className="w-11 h-11 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all">
                  <BarChart3 size={22} className="text-blue-400" />
                </div>
                <p className="font-bold text-base text-white mb-0.5 tracking-tight">Analytics</p>
                <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Usage & health</p>
                <ChevronRight size={16} className="absolute top-4 right-4 text-zinc-600 group-hover:text-blue-400 transition-colors" />
              </div>
            </Link>
          </motion.div>

        </div>
      </div>
    </MobileLayout>
  );
}
