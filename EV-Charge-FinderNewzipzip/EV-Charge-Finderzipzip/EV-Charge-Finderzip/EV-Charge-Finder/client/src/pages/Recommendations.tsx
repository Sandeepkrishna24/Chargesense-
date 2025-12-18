import { useState, useMemo } from "react";
import { useLocation as useRouterLocation, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Filter, Navigation, Star, MapPin, Wrench, MapPinIcon, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import MobileLayout from "@/components/layout/MobileLayout";
import { MOCK_STATIONS, MOCK_VEHICLES, calculateChargeTime, haversineDistance, getOlaServiceCenters, getQueueWaitTime } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { useLocation as useUserLocation, DEFAULT_LOCATION } from "@/contexts/LocationContext";

export default function Recommendations() {
  const [, setRouterLocation] = useRouterLocation();
  const { latitude, longitude, loading: locationLoading, error: locationError } = useUserLocation();
  const [filterType, setFilterType] = useState<'all' | 'fast' | 'available' | 'cheapest' | 'ola'>('all');

  const handleBack = () => {
    setRouterLocation("/my-vehicle");
  };

  const userLat = latitude ?? DEFAULT_LOCATION.lat;
  const userLng = longitude ?? DEFAULT_LOCATION.lng;

  const searchParams = new URLSearchParams(window.location.search);
  const rangeLimit = Number(searchParams.get('range') || localStorage.getItem('userRange') || 20);
  const currentSoc = Number(searchParams.get('soc') || 45);

  const vehicleId = localStorage.getItem('selectedVehicleId') || 'v1';
  const vehicle = MOCK_VEHICLES.find(x => x.id === vehicleId) || MOCK_VEHICLES[0];
  const isOlaVehicle = vehicle.brand.toLowerCase() === 'ola';

  const recommendedStations = useMemo(() => {
    let allStations = [...MOCK_STATIONS];
    
    if (isOlaVehicle) {
      const olaCenters = getOlaServiceCenters(userLat, userLng);
      allStations = [...allStations, ...olaCenters];
    }
    
    let stations = allStations
      .map(station => {
        const dist = haversineDistance(userLat, userLng, station.latitude, station.longitude);
        const chargeTime = calculateChargeTime(currentSoc, 80, vehicle.battery_capacity_kwh, station.charger_power_kw);
        const queueWait = getQueueWaitTime(station.id, chargeTime);
        const totalTime = chargeTime + queueWait;
        const score = (100 - (totalTime + dist)) + (station.reliability_score / 10);

        return { ...station, distance_km: dist, estimated_charge_time: chargeTime, total_time: totalTime, score, queue_wait_minutes: queueWait };
      })
      .filter(s => s.distance_km <= rangeLimit)
      .filter(s => vehicle.charger_type_supported.includes(s.charger_type))
      .filter(s => s.connector_type === vehicle.connector_type || (vehicle.type === 'car' && (s.connector_type === 'CCS2' || s.connector_type === 'Type 2')))
      .filter(s => {
        // Ather Grid stations only available for Ather brand vehicles
        if (s.id.includes('ather-grid') || s.connector_type === 'Ather Grid') {
          return vehicle.brand.toLowerCase() === 'ather';
        }
        return true;
      });

    switch (filterType) {
      case 'fast':
        stations = stations.filter(s => s.charger_power_kw >= 50);
        break;
      case 'available':
        stations = stations.filter(s => s.status === 'available');
        break;
      case 'cheapest':
        stations = stations.sort((a, b) => a.price_per_unit - b.price_per_unit);
        break;
      case 'ola':
        stations = stations.filter(s => s.id.startsWith('ola_'));
        break;
      default:
        stations = stations.sort((a, b) => b.score - a.score);
    }

    return filterType === 'cheapest' ? stations : stations.sort((a, b) => b.score - a.score);
  }, [rangeLimit, currentSoc, vehicle, userLat, userLng, filterType, isOlaVehicle]);

  const filterOptions = isOlaVehicle 
    ? (['all', 'ola', 'fast', 'available', 'cheapest'] as const)
    : (['all', 'fast', 'available', 'cheapest'] as const);

  const getFilterLabel = (f: string) => {
    switch (f) {
      case 'all': return 'All';
      case 'fast': return 'Fast (50kW+)';
      case 'available': return 'Available';
      case 'cheapest': return 'Cheapest';
      case 'ola': return 'Ola Centers';
      default: return f;
    }
  };

  return (
    <MobileLayout>
      <div className="p-4 min-h-screen bg-black">
        
        <header className="flex items-center justify-between mb-6 sticky top-0 bg-black/80 backdrop-blur-md z-50 py-2">
          <Button variant="ghost" size="icon" className="rounded-full" onClick={handleBack}>
            <ArrowLeft className="text-white" />
          </Button>
          <h1 className="text-lg font-bold">Nearby Chargers</h1>
          <Link href={`/map?stationId=${recommendedStations[0]?.id || ''}`}>
            <Button variant="ghost" size="icon" className="rounded-full">
              <MapPin className="text-primary" size={20} />
            </Button>
          </Link>
        </header>

        {locationLoading && (
          <div className="mb-4 bg-primary/10 border border-primary/20 rounded-lg p-3 text-center">
            <p className="text-sm text-primary">Getting your current location...</p>
          </div>
        )}

        {locationError && (
          <div className="mb-4 bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-center">
            <p className="text-xs text-zinc-400">{locationError}</p>
          </div>
        )}

        <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-2">
          {filterOptions.map((f) => (
            <button
              key={f}
              onClick={() => setFilterType(f)}
              className={cn(
                "px-4 py-2 rounded-full text-xs font-medium border whitespace-nowrap transition-all flex items-center gap-1",
                filterType === f 
                  ? f === 'ola' ? "bg-purple-500 text-white border-purple-500" : "bg-primary text-black border-primary" 
                  : "bg-zinc-900 border-zinc-800 text-zinc-400"
              )}
            >
              {f === 'ola' && <Wrench size={12} />}
              {getFilterLabel(f)}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <AnimatePresence>
            {recommendedStations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-500 mb-2">
                  <Filter size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold">No chargers found</h3>
                  <p className="text-zinc-500 text-sm mt-1 max-w-[250px]">
                    We couldn't find compatible stations within {rangeLimit}km of your current location.
                  </p>
                </div>
                <div className="flex flex-col gap-2 w-full max-w-xs pt-4">
                  <Link href="/home">
                    <Button variant="outline" className="w-full border-zinc-700 hover:bg-zinc-800">
                      Increase Range
                    </Button>
                  </Link>
                  <Button variant="ghost" className="text-zinc-500" onClick={() => setFilterType('all')}>
                    Clear Filters
                  </Button>
                </div>
              </div>
            ) : (
              recommendedStations.map((station, idx) => {
                const isOlaCenter = station.id.startsWith('ola_');
                return (
                  <motion.div
                    key={station.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <div className="glass-card p-0 overflow-hidden group">
                      {isOlaCenter ? (
                        <div className="bg-purple-500 text-white text-[10px] font-bold px-3 py-1 inline-flex items-center gap-1">
                          <Wrench size={10} /> OLA SERVICE CENTER
                        </div>
                      ) : idx === 0 && filterType === 'all' && (
                        <div className="bg-primary text-black text-[10px] font-bold px-3 py-1 inline-flex items-center gap-1">
                          <Star size={10} fill="black" /> TOP RECOMMENDATION
                        </div>
                      )}

                      <div className="p-5">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-bold text-lg leading-tight mb-1 group-hover:text-primary transition-colors">{station.name}</h3>
                            <p className="text-xs text-zinc-400 truncate max-w-[200px]">{station.address}</p>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-2xl font-mono font-bold">{station.distance_km}<span className="text-sm text-zinc-500 font-sans">km</span></span>
                            <span className="text-[10px] text-zinc-500">from you</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 py-4 border-t border-white/5 border-b mb-4 mt-2">
                          <div className="text-center border-r border-white/5">
                            <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Queue</div>
                            <div className={cn("font-bold", station.queue_wait_minutes > 0 ? "text-orange-500" : "text-green-500")}>
                              {station.queue_wait_minutes}m
                            </div>
                          </div>
                          <div className="text-center border-r border-white/5">
                            <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Charge</div>
                            <div className="font-bold text-white">~{station.estimated_charge_time}m</div>
                          </div>
                          <div className="text-center">
                            <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Power</div>
                            <div className="font-bold text-primary">{station.charger_power_kw}kW</div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="text-xs text-zinc-400">
                            {isOlaCenter ? (
                              <span className="text-purple-400 font-bold">FREE Charging</span>
                            ) : (
                              <><span className="text-white font-bold">₹{station.price_per_unit}</span> /unit</>
                            )}
                          </div>
                          <div className="flex gap-2 flex-1">
                            <Link href={`/map?stationId=${station.id}`} className="flex-1">
                              <Button size="sm" variant="outline" className="rounded-full h-9 w-full border-zinc-700 justify-center"
                              >
                                <ExternalLink size={14} />
                              </Button>
                            </Link>
                            <Button size="sm" className={cn(
                              "rounded-full h-9 px-5 font-bold flex-1",
                              isOlaCenter ? "bg-purple-500 hover:bg-purple-600 text-white" : "bg-primary text-black hover:bg-primary/90"
                            )}
                              onClick={() => {
                                const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${station.latitude},${station.longitude}`;
                                window.open(mapsUrl, '_blank');
                              }} 
                            >
                              Navigate
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className={cn(
                        "h-1 w-full",
                        isOlaCenter ? "bg-purple-500" :
                        station.status === 'available' ? "bg-green-500" : 
                        station.status === 'busy' ? "bg-orange-500" : "bg-red-500"
                      )} />
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </div>
    </MobileLayout>
  );
}
