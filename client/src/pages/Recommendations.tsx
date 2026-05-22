import { useState, useMemo, useRef, useEffect } from "react";
import { useLocation as useRouterLocation, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Filter, Navigation, Star, MapPin, Wrench, MapPinIcon, 
  ExternalLink, ChevronDown, ChevronUp, Loader2, Heart, Search, 
  Info, CheckCircle2, AlertCircle, XCircle, Zap 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSwipe } from "@/hooks/use-swipe";
import MobileLayout from "@/components/layout/MobileLayout";
import { calculateChargeTime, haversineDistance, getQueueWaitTime, calculateStationScore, computeEffectiveRange, getStationLabel } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { useLocation as useUserLocation, DEFAULT_LOCATION } from "@/contexts/LocationContext";
import { useStations } from "@/hooks/useStations";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toggleStationFavourite, fetchFavourites, searchStationLocation } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";


import StationDetailSheet from "@/components/StationDetailSheet";

export default function Recommendations() {
  const [, setRouterLocation] = useRouterLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { latitude, longitude, loading: locationLoading, error: locationError } = useUserLocation();
  
  const [filterType, setFilterType] = useState<'all' | 'fast' | 'available' | 'cheapest' | 'tata' | 'zeon' | 'ather' | 'ola'>('all');
  const [visibleStationIndex, setVisibleStationIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [customPosition, setCustomPosition] = useState<{lat: number, lng: number} | null>(null);
  const [selectedStation, setSelectedStation] = useState<any>(null);
  
  const stationsContainerRef = useRef<HTMLDivElement>(null);

  const { profile } = useAuth();
  const userId = profile?.email || localStorage.getItem('userEmail') || 'guest';


  // Favourites Query
  const { data: favourites = [] } = useQuery({
    queryKey: ['favourites', userId],
    queryFn: () => fetchFavourites(userId)
  });

  const favMutation = useMutation({
    mutationFn: (stationId: string) => toggleStationFavourite(userId, stationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favourites', userId] });
    }
  });

  const handleBack = () => {
    setRouterLocation("/my-vehicle");
  };

  const currentLat = customPosition?.lat ?? latitude ?? DEFAULT_LOCATION.lat;
  const currentLng = customPosition?.lng ?? longitude ?? DEFAULT_LOCATION.lng;

  const searchParams = new URLSearchParams(window.location.search);
  const rangeLimit = Number(searchParams.get('range') || localStorage.getItem('userRange') || 20);
  const currentSoc = Number(searchParams.get('soc') || 45);


  const vehicleId = localStorage.getItem('selectedVehicleId') || 'v1';

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
    return vehicleData.find((x: any) => x.id === vehicleId) || vehicleData[0];
  }, [vehicleData, vehicleId]);

  // CSRA Step 1: Adaptive effective range (battery-aware with degradation factor)
  const effectiveRange = useMemo(() => {
    if (!vehicle) return rangeLimit;
    return computeEffectiveRange(vehicle.full_range_km, currentSoc);
  }, [vehicle, currentSoc, rangeLimit]);

  const { stations: allStations, loading: stationsLoading, error: stationsError, refreshStations } = useStations(rangeLimit, customPosition?.lat, customPosition?.lng);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const pos = await searchStationLocation(searchQuery);
      if (pos) {
        setCustomPosition(pos);
        toast({ title: "Location updated", description: `Showing chargers near ${searchQuery}` });
      } else {
        toast({ title: "Search failed", description: "Could not find that location", variant: "destructive" });
      }
    } finally {
      setIsSearching(false);
    }
  };

  const recommendedStations = useMemo(() => {
    if (!vehicle) return [];
    
    let stations = allStations
      .map(station => {
        const dist = haversineDistance(currentLat, currentLng, station.latitude, station.longitude);
        const chargeTime = calculateChargeTime(currentSoc, 80, vehicle.battery_capacity_kwh, station.charger_power_kw);
        const rawQueueWait = station.queue_wait_minutes ?? getQueueWaitTime(station.id, chargeTime);
        const seed = String(station.id || "123").split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
        const queueWait = rawQueueWait === 0 ? (2 + (seed % 5)) : rawQueueWait;
        
        const totalTime = chargeTime + queueWait;
        // CSRA v2.0 composite score — 5 weights, all novelty metrics included
        const score = calculateStationScore(
          dist,
          station.charger_power_kw,
          station.reliability_score || 80,
          queueWait,
          chargeTime,
          station.status === 'available'
        );

        return { 
          ...station, 
          distance_km: dist, 
          estimated_charge_time: chargeTime, 
          queue_wait_minutes: queueWait,
          total_time: totalTime, 
          score,
          isFavourite: favourites.includes(station.id)
        };
      })
      .filter(s => s.distance_km <= Math.max(effectiveRange, rangeLimit))
      .filter(s => {
        const sConn = s.connector_type as string;
        const vConn = vehicle.connector_type as string;
        if (!sConn || sConn === "Multiple") return true;
        return sConn === vConn || (vehicle.type === 'car' && (sConn === 'CCS2' || sConn === 'Type 2'));
      });

    switch (filterType) {
      case 'fast': stations = stations.filter(s => s.charger_power_kw >= 50); break;
      case 'available': stations = stations.filter(s => s.status === 'available'); break;
      case 'cheapest': stations = stations.sort((a, b) => a.price_per_unit - b.price_per_unit); break;
      case 'ola': stations = stations.filter(s => s.id.toLowerCase().includes('ola') || s.name.toLowerCase().includes('ola')); break;
      case 'tata': stations = stations.filter(s => s.id.toLowerCase().includes('tata') || s.name.toLowerCase().includes('tata')); break;
      case 'zeon': stations = stations.filter(s => s.id.toLowerCase().includes('zeon') || s.name.toLowerCase().includes('zeon')); break;
      case 'ather': stations = stations.filter(s => s.id.toLowerCase().includes('ather') || s.name.toLowerCase().includes('ather')); break;
      default: stations = stations.sort((a, b) => b.score - a.score);
    }

    return stations;
  }, [rangeLimit, currentSoc, vehicle, currentLat, currentLng, filterType, allStations, favourites]);

  const filterOptions = ['all', 'fast', 'available', 'cheapest', 'tata', 'zeon', 'ather', 'ola'] as const;

  const getStatusUI = (status: string) => {
    switch (status) {
      case 'available': return { color: "text-emerald-400", bg: "bg-emerald-500/10", icon: CheckCircle2, label: "Available" };
      case 'busy': return { color: "text-orange-400", bg: "bg-orange-500/10", icon: AlertCircle, label: "Busy" };
      default: return { color: "text-zinc-500", bg: "bg-zinc-500/10", icon: XCircle, label: "Offline" };
    }
  };

  return (
    <MobileLayout>
      <div className="p-4 min-h-screen bg-black relative overflow-hidden flex flex-col pb-24">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmczPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20 pointer-events-none" />
        
        <header className="sticky top-0 z-50 -mx-4 px-4 pt-2 pb-4 bg-black/60 backdrop-blur-xl border-b border-white/5">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="icon" className="rounded-full" onClick={handleBack}>
              <ArrowLeft />
            </Button>
            <h1 className="text-lg font-bold tracking-tight text-white">Search Chargers</h1>
            {customPosition ? (
              <Button variant="ghost" size="icon" className="text-primary" onClick={() => { setCustomPosition(null); setSearchQuery(""); }}>
                <MapPinIcon size={20} />
              </Button>
            ) : (
              <Button variant="ghost" size="icon" className="rounded-full" onClick={() => refreshStations()}>
                <Navigation size={20} className="text-primary" />
              </Button>
            )}
          </div>

          <form onSubmit={handleSearch} className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-primary transition-colors" size={18} />
            <Input 
              placeholder="Search city, area or station..." 
              className="bg-zinc-900/50 border-white/10 pl-10 h-11 rounded-2xl focus-visible:ring-primary/50 text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {isSearching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-primary" size={16} />}
          </form>
        </header>

        <div className="flex gap-2 my-4 overflow-x-auto no-scrollbar pb-2 relative z-10 px-1">
          {filterOptions.map((f) => (
            <button
              key={f}
              onClick={() => setFilterType(f)}
              className={cn(
                "px-6 py-3 rounded-2xl text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-all border shrink-0",
                filterType === f 
                  ? "bg-primary text-black border-transparent shadow-[0_0_20px_rgba(255,165,0,0.4)]"
                  : "bg-zinc-900/60 backdrop-blur-md border-white/10 text-zinc-400 hover:border-white/20"
              )}
            >
              {f}
            </button>
          ))}
        </div>

        {(locationLoading || stationsLoading || vehicleLoading || isSearching) && (
          <div className="flex flex-col items-center justify-center py-10 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-zinc-500 font-medium">Updating station data...</p>
          </div>
        )}

        {!locationLoading && !stationsLoading && !vehicleLoading && !isSearching && recommendedStations.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center relative z-10">
            <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center mb-6 shadow-xl border border-white/5">
              <MapPinIcon size={32} className="text-zinc-600" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">No chargers found</h3>
            <p className="text-zinc-500 max-w-[200px] mb-8 text-sm leading-relaxed">We couldn't find any chargers matching your criteria nearby.</p>
            <Button 
              className="bg-white text-black hover:bg-zinc-200 rounded-xl font-bold px-8 h-12 shadow-xl"
              onClick={() => { setFilterType('all'); setSearchQuery(""); setCustomPosition(null); }}
            >
              Clear Filters
            </Button>
          </div>
        )}

        <div className="space-y-4 relative z-10">
          {recommendedStations.map((station: any, idx: number) => {
            const status = getStatusUI(station.status);
            return (
              <motion.div
                key={station.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl relative group pb-4"
                onClick={() => setSelectedStation(station)}
              >
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <status.icon size={14} className={status.color} />
                        <span className={cn("text-[10px] font-bold uppercase tracking-wider", status.color)}>
                          {status.label}
                        </span>
                      </div>
                      <h3 className="font-bold text-xl leading-snug group-hover:text-primary transition-colors pr-8 text-white">
                        {station.name}
                      </h3>
                      <p className="text-[11px] text-zinc-500 flex items-center gap-1 mt-1">
                        <MapPinIcon size={12} className="text-zinc-600" />
                        {station.address}
                      </p>
                    </div>
                    {/* CSRA Smart Label */}
                    {(() => {
                      const lbl = getStationLabel(idx, station, recommendedStations);
                      if (!lbl) return null;
                      return (
                        <div className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-lg bg-white/5 border border-white/10 whitespace-nowrap shrink-0 self-start ${lbl.color}`}>
                          {lbl.label}
                        </div>
                      );
                    })()}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className={cn("rounded-full h-10 w-10 bg-white/5", station.isFavourite ? "text-red-500" : "text-zinc-400")}
                      onClick={(e) => {
                        e.stopPropagation();
                        favMutation.mutate(station.id);
                      }}
                    >
                      <Heart size={20} fill={station.isFavourite ? "currentColor" : "none"} />
                    </Button>
                  </div>

                  <div className="flex gap-4 mb-5">
                    <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-lg">
                      <Star size={14} fill="#fbbf24" className="text-amber-400" />
                      <span className="text-xs font-bold text-white">4.8</span>
                    </div>
                    <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-lg">
                      <Zap size={14} className="text-primary" />
                      <span className="text-xs font-bold text-white">₹{station.price_per_unit}/unit</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-5">
                    <div className="bg-black/30 p-3 rounded-2xl flex flex-col border border-white/5">
                      <span className="text-[10px] font-bold text-zinc-600 uppercase mb-1">Queue</span>
                      <span className={cn("text-base font-bold", station.queue_wait_minutes > 10 ? "text-orange-400" : "text-emerald-400")}>
                        {station.queue_wait_minutes}m
                      </span>
                    </div>
                    <div className="bg-black/30 p-3 rounded-2xl flex flex-col border border-white/5">
                      <span className="text-[10px] font-bold text-zinc-600 uppercase mb-1">Power</span>
                      <span className="text-base font-bold text-primary">{station.charger_power_kw}kW</span>
                    </div>
                    <div className="bg-black/30 p-3 rounded-2xl flex flex-col border border-white/5">
                      <span className="text-[10px] font-bold text-zinc-600 uppercase mb-1">Time</span>
                      <span className="text-base font-bold text-white">~{station.estimated_charge_time}m</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      className="flex-1 bg-white text-black hover:bg-zinc-200 h-12 rounded-2xl font-bold gap-2 text-sm shadow-xl"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(`https://www.google.com/maps/dir/?api=1&destination=${station.latitude},${station.longitude}`, '_blank');
                      }}
                    >
                      <Navigation size={18} fill="currentColor" /> Navigate
                    </Button>
                    <Button 
                      className="flex-1 bg-primary text-black hover:bg-orange-600 h-12 rounded-2xl font-bold text-sm shadow-[0_0_20px_rgba(255,165,0,0.4)]"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedStation(station);
                      }}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
      <StationDetailSheet 
        station={selectedStation} 
        isOpen={!!selectedStation} 
        onClose={() => setSelectedStation(null)} 
        isFavourite={selectedStation ? favourites.includes(selectedStation.id) : false}
      />
    </MobileLayout>
  );
}
