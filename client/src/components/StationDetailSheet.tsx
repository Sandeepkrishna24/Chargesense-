import { motion, AnimatePresence } from "framer-motion";
import {
  X, MapPin, Navigation, Star, Info, Zap, Clock,
  CheckCircle2, AlertCircle, XCircle, Heart, Share2,
  Coffee, ShoppingBag, Utensils, Wifi, Loader2, Activity, Timer, Car, BatteryCharging
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchReviews, toggleStationFavourite, fetchCheckIns, checkInToStation } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface StationDetailSheetProps {
  station: any;
  isOpen: boolean;
  onClose: () => void;
  isFavourite: boolean;
}

export default function StationDetailSheet({ station, isOpen, onClose, isFavourite = false }: StationDetailSheetProps) {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const userId = profile?.email || localStorage.getItem('userEmail') || 'guest';

  // Real backend check-in state via React Query
  const { data: checkIns = [] } = useQuery({
    queryKey: ['checkins', station?.id],
    queryFn: () => fetchCheckIns(station?.id),
    enabled: !!station?.id
  });

  const checkInMutation = useMutation({
    mutationFn: () => checkInToStation(station.id, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checkins', station.id] });
    }
  });

  const isCheckedIn = checkIns.some((ci: any) => ci.userId === userId);

  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ['reviews', station?.id],
    queryFn: () => fetchReviews(station?.id),
    enabled: !!station?.id
  });

  const favMutation = useMutation({
    mutationFn: () => toggleStationFavourite(userId, station.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favourites', userId] });
    }
  });

  // Novelty Metrics Logic (Mocked for Pitch)
  const metrics = useMemo(() => {
    if (!station) return { wait: "0", queue: "0", charge: 45, liveText: "Ready to charge" };

    const isBusy = station.status === 'busy';
    const isOffline = station.status === 'offline';

    if (isOffline) {
      return { wait: "--", queue: "--", charge: "--", liveText: "Station Offline" };
    }

    // Deterministic random-ish values based on station ID
    const seed = String(station.id || "123").split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
    const baseChargeTime = 35 + (seed % 15); // 35-50 mins

    if (isBusy) {
      return {
        wait: Math.floor(10 + (seed % 20)), // 10-30 mins
        queue: Math.floor(2 + (seed % 8)),   // 2-10 mins
        charge: baseChargeTime,
        liveText: "High Demand"
      };
    }

    const lowWait = 2 + (seed % 5);
    const lowQueue = 1 + (seed % 2);
    
    return {
      wait: Math.floor(lowWait).toString(),
      queue: Math.floor(lowQueue).toString(),
      charge: baseChargeTime,
      liveText: "Light Traffic"
    };
  }, [station?.id, station?.status]);

  // Generate deterministic mock vehicles for "Live Queue"
  const liveVehicles = useMemo(() => {
    if (!station) return { charging: [], queue: [] };

    const seed = String(station.id || "123").split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
    const isBusy = station.status === 'busy';
    
    const EV_MODELS = ["Tata Nexon EV", "MG ZS EV", "Hyundai Ioniq 5", "Kia EV6", "BYD Atto 3"];
    const OWNERS = ["Alex", "Sarah", "Raj", "Priya", "Mike", "Elena", "Dev"];

    if (isBusy) {
      // 2 charging, 1-3 in queue
      const queueCount = 1 + (seed % 3);
      return {
        charging: [
          { name: OWNERS[seed % OWNERS.length], model: EV_MODELS[seed % EV_MODELS.length], percent: 45 + (seed % 40) },
          { name: OWNERS[(seed+1) % OWNERS.length], model: EV_MODELS[(seed+1) % EV_MODELS.length], percent: 12 + (seed % 60) }
        ],
        queue: Array.from({length: queueCount}).map((_, i) => ({
          name: OWNERS[(seed + i + 2) % OWNERS.length],
          model: EV_MODELS[(seed + i + 2) % EV_MODELS.length],
          wait: 10 + (i * 15) + (seed % 10)
        }))
      };
    }

    // Available: always 1 charging, 1 in queue to avoid 0
    return {
      charging: [
        { name: OWNERS[seed % OWNERS.length], model: EV_MODELS[seed % EV_MODELS.length], percent: 78 + (seed % 20) }
      ],
      queue: [
        {
          name: OWNERS[(seed + 1) % OWNERS.length],
          model: EV_MODELS[(seed + 1) % EV_MODELS.length],
          wait: 2 + (seed % 5)
        }
      ]
    };
  }, [station?.id, station?.status]);

  if (!station) return null;

  const statusMap = {
    available: { color: "text-emerald-400", bg: "bg-emerald-500/10", icon: CheckCircle2, label: "Available" },
    busy: { color: "text-orange-400", bg: "bg-orange-500/10", icon: AlertCircle, label: "Busy" },
    offline: { color: "text-zinc-500", bg: "bg-zinc-500/10", icon: XCircle, label: "Offline" }
  };

  const status = statusMap[station.status as keyof typeof statusMap] || statusMap.offline;

  const amenityMap: Record<string, { icon: any, label: string, color: string }> = {
    "Cafe": { icon: Coffee, label: "Cafe", color: "text-orange-400" },
    "Coffee": { icon: Coffee, label: "Coffee", color: "text-orange-400" },
    "Restaurant": { icon: Utensils, label: "Food", color: "text-red-400" },
    "Food": { icon: Utensils, label: "Food", color: "text-red-400" },
    "Mall": { icon: ShoppingBag, label: "Shopping", color: "text-blue-400" },
    "Shopping": { icon: ShoppingBag, label: "Shopping", color: "text-blue-400" },
    "WiFi": { icon: Wifi, label: "Free WiFi", color: "text-sky-400" },
    "Internet": { icon: Wifi, label: "WiFi", color: "text-sky-400" },
    "Parking": { icon: Info, label: "Safe Parking", color: "text-zinc-400" },
    "Restroom": { icon: Info, label: "Restrooms", color: "text-zinc-400" },
    "Toilet": { icon: Info, label: "Restrooms", color: "text-zinc-400" }
  };

  const stationAmenities = station.amenities && station.amenities.length > 0
    ? station.amenities
      .filter((a: string) => a !== 'charging_station')
      .map((a: string) => amenityMap[a] || { icon: Info, label: a, color: "text-zinc-400" })
    : [
      { icon: Coffee, label: "Cafe", color: "text-orange-400" },
      { icon: Utensils, label: "Restaurant", color: "text-red-400" },
      { icon: Wifi, label: "Free WiFi", color: "text-sky-400" },
    ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[10000]"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-zinc-950 rounded-t-[3rem] z-[10001] max-h-[90vh] overflow-y-auto no-scrollbar border-t border-white/10 shadow-2xl pb-12"
          >
            <div className="sticky top-0 bg-zinc-950/80 backdrop-blur-xl z-20 px-6 py-4 flex justify-between items-center border-b border-white/5">
              <div className="w-12 h-1.5 bg-zinc-800 rounded-full absolute top-3 left-1/2 -translate-x-1/2" />
              <div className="flex items-center gap-2 mt-1">
                <status.icon size={16} className={status.color} />
                <span className={cn("text-[10px] font-bold uppercase tracking-widest", status.color)}>
                  {status.label}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn("rounded-full bg-white/5", isFavourite ? "text-red-500" : "text-zinc-400")}
                  onClick={() => favMutation.mutate()}
                >
                  <Heart size={20} fill={isFavourite ? "currentColor" : "none"} />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full bg-white/5 text-zinc-400" onClick={onClose}>
                  <X size={20} />
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <section className="pt-2">
                <h2 className="text-2xl font-bold tracking-tight mb-2 pr-12 line-clamp-2">{station.name}</h2>
                <p className="text-zinc-400 flex items-center gap-2 text-sm">
                  <MapPin size={16} className="text-primary" />
                  {station.address}
                </p>
              </section>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-900/50 p-4 rounded-3xl border border-white/5">
                  <div className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider mb-2">Pricing</div>
                  <div className="text-xl font-bold">₹{station.price_per_unit}<span className="text-xs text-zinc-500 ml-1">/ unit</span></div>
                </div>
                <div className="bg-zinc-900/50 p-4 rounded-3xl border border-white/5">
                  <div className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider mb-2">Distance</div>
                  <div className="text-xl font-bold">{station.distance_km?.toFixed(1)}<span className="text-xs text-zinc-500 ml-1">km (Aerial)</span></div>
                </div>
              </div>

              {/* LIVE METRICS DASHBOARD (NOVELTY FEATURE) */}
              <section className="bg-zinc-900/30 rounded-[2.5rem] p-5 border border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4">
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-primary/10 rounded-full border border-primary/20">
                    <motion.div
                      animate={{ opacity: [1, 0.4, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(249,115,22,0.8)]"
                    />
                    <span className="text-[9px] font-black text-primary uppercase tracking-tighter">Live Insight</span>
                  </div>
                </div>

                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-6">Real-time Dashboard</h3>

                <div className="grid grid-cols-3 gap-2">
                  <div className="flex flex-col items-center p-3 rounded-2xl bg-white/5 border border-white/5 group-hover:border-primary/20 transition-colors">
                    <Clock size={22} className="text-blue-400 mb-2" />
                    <span className="text-[10px] font-bold text-zinc-500 uppercase">Wait Time</span>
                    <span className="text-lg font-black text-white">{metrics.wait}<span className="text-[10px] ml-0.5">m</span></span>
                  </div>
                  <div className="flex flex-col items-center p-3 rounded-2xl bg-white/5 border border-white/5 group-hover:border-primary/20 transition-colors">
                    <Activity size={22} className="text-emerald-400 mb-2" />
                    <span className="text-[10px] font-bold text-zinc-500 uppercase">Queue</span>
                    <span className="text-lg font-black text-white">{metrics.queue}<span className="text-[10px] ml-0.5">m</span></span>
                  </div>
                  <div className="flex flex-col items-center p-3 rounded-2xl bg-white/5 border border-white/5 group-hover:border-primary/20 transition-colors">
                    <Zap size={22} className="text-orange-400 mb-2" />
                    <span className="text-[10px] font-bold text-zinc-500 uppercase">Charge</span>
                    <span className="text-lg font-black text-white">{metrics.charge}<span className="text-[10px] ml-0.5">m</span></span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-center gap-2 py-2 px-4 bg-white/5 rounded-xl">
                  <Timer size={14} className="text-zinc-500" />
                  <span className="text-[11px] font-bold text-zinc-400 italic">
                    {metrics.liveText} • Based on occupancy & grid load
                  </span>
                </div>
              </section>

              {/* LIVE QUEUE & VEHICLES SECTION */}
              <section>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Live Connectors & Queue</h3>
                  <div className="flex items-center gap-1.5 bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded-full border border-blue-500/20">
                    <Car size={12} fill="currentColor" />
                    <span className="text-[10px] font-bold">{liveVehicles.charging.length + liveVehicles.queue.length} Active</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Charging */}
                  {liveVehicles.charging.length > 0 ? (
                    <div className="space-y-2">
                      <div className="text-[10px] font-bold text-zinc-500 uppercase flex items-center gap-1.5"><BatteryCharging size={12} className="text-emerald-400"/> Currently Charging</div>
                      {liveVehicles.charging.map((v, i) => (
                        <div key={`charging-${i}`} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(52,211,153,0.1)]">
                              <Zap size={18} fill="currentColor" />
                            </div>
                            <div>
                              <div className="font-bold text-sm text-white">{v.name} &bull; {v.model}</div>
                              <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Charging at 50kW</div>
                            </div>
                          </div>
                          <div className="text-right flex flex-col items-end">
                            <div className="text-lg font-black text-white">{v.percent}%</div>
                            <div className="w-16 h-1.5 bg-zinc-900 rounded-full overflow-hidden mt-1">
                              <motion.div 
                                initial={{ width: 0 }} 
                                animate={{ width: `${v.percent}%` }} 
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="h-full bg-emerald-500 rounded-full"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center justify-center text-zinc-500 text-xs italic">
                      No vehicles are currently charging
                    </div>
                  )}

                  {/* Queue */}
                  {liveVehicles.queue.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <div className="text-[10px] font-bold text-zinc-500 uppercase flex items-center gap-1.5"><Clock size={12} className="text-orange-400"/> Waiting in Queue</div>
                      {liveVehicles.queue.map((v, i) => (
                        <div key={`queue-${i}`} className="bg-zinc-900/50 border border-white/5 rounded-2xl p-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 border border-white/10">
                              <span className="text-xs font-bold">{i + 1}</span>
                            </div>
                            <div>
                              <div className="font-bold text-xs text-zinc-300">{v.name}</div>
                              <div className="text-[10px] text-zinc-500">{v.model}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs font-bold text-orange-400">~{v.wait}m wait</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              <section>
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Connector Details</h3>
                <div className="bg-primary/5 border border-primary/20 rounded-3xl p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary shadow-[0_0_15px_rgba(255,165,0,0.2)]">
                      <Zap size={24} />
                    </div>
                    <div>
                      <div className="font-bold text-lg">{station.connector_type}</div>
                      <div className="text-xs text-zinc-500">{station.charger_power_kw}kW • Fast Charging</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={cn("text-xs font-bold mb-1", status.color)}>{status.label.toUpperCase()}</div>
                    <div className="text-[10px] text-zinc-500">1/2 Points</div>
                  </div>
                </div>
              </section>

              {stationAmenities.length > 0 && (
                <section>
                  <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Nearby Amenities</h3>
                  <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                    {stationAmenities.map((item: { icon: any, label: string, color: string }, idx: number) => (
                      <div key={idx} className="bg-zinc-900/80 px-4 py-3 rounded-2xl flex items-center gap-3 border border-white/5 whitespace-nowrap shadow-lg">
                        <item.icon size={18} className={item.color} />
                        <span className="text-xs font-bold text-white">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <section>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Community</h3>
                    {checkIns.length > 0 && (
                      <span className="bg-primary/20 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {checkIns.length} Checked In
                      </span>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className={cn("h-8 rounded-full text-xs font-bold border-white/10 transition-colors", isCheckedIn ? "bg-primary text-black hover:bg-primary/90" : "bg-white/5 text-white hover:bg-white/10")}
                    onClick={() => {
                      if (!isCheckedIn) {
                        checkInMutation.mutate();
                      }
                    }}
                    disabled={checkInMutation.isPending}
                  >
                    {checkInMutation.isPending ? <Loader2 size={14} className="animate-spin mr-1" /> : isCheckedIn ? <><CheckCircle2 size={14} className="mr-1" /> Checked In</> : "Check In"}
                  </Button>
                </div>

                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="min-w-[140px] h-[90px] rounded-2xl bg-zinc-800 overflow-hidden relative border border-white/5 shrink-0">
                      <img
                        src={`https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=300&q=80&random=${i}`}
                        alt="Station view"
                        className="w-full h-full object-cover opacity-80"
                      />
                    </div>
                  ))}
                  <div className="min-w-[140px] h-[90px] rounded-2xl bg-white/5 border border-white/10 border-dashed flex items-center justify-center shrink-0 cursor-pointer hover:bg-white/10 transition-colors">
                    <span className="text-xs text-zinc-400 font-bold flex flex-col items-center gap-2">
                      <Share2 size={18} /> Add Photo
                    </span>
                  </div>
                </div>
              </section>

              <section>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Reviews & Ratings</h3>
                  <div className="flex items-center gap-1 bg-amber-400/10 text-amber-400 px-2 py-1 rounded-lg border border-amber-400/20">
                    <Star size={12} fill="currentColor" />
                    <span className="text-xs font-bold">4.8</span>
                  </div>
                </div>

                {reviewsLoading ? (
                  <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>
                ) : reviews.length === 0 ? (
                  <p className="text-zinc-500 text-sm italic text-center py-4">No reviews yet. Be the first!</p>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((r: any) => (
                      <div key={r.id} className="bg-white/5 p-4 rounded-2xl border border-white/5">
                        <div className="flex justify-between mb-2">
                          <span className="text-xs font-bold text-zinc-400">{r.userId}</span>
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={10} fill={i < r.rating ? "#fbbf24" : "none"} className={i < r.rating ? "text-amber-400" : "text-zinc-700"} />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-zinc-300 leading-relaxed">{r.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <div className="flex gap-3 pt-6 pb-4">
                <Button
                  variant="outline"
                  className="flex-1 h-14 rounded-2xl border-white/10 bg-black font-bold text-sm gap-2"
                  onClick={() => {
                    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${station.latitude},${station.longitude}`;
                    window.open(mapsUrl, '_blank');
                  }}
                >
                  <Navigation size={18} fill="currentColor" /> Navigate
                </Button>
                <Link href={`/scan/${station.id}?stationName=${encodeURIComponent(station.name)}&price=${station.price_per_unit}`} className="flex-1">
                  <Button className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-orange-500 text-black font-bold text-sm shadow-[0_0_20px_rgba(255,165,0,0.4)] flex items-center justify-center gap-2">
                    <Zap size={18} className="fill-black" /> Scan & Charge
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
