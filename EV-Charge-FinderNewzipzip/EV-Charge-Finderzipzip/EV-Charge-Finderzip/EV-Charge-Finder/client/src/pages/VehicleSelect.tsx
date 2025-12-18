import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Check, ChevronRight, Battery, Zap, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MOCK_VEHICLES, Vehicle } from "@/lib/mockData";
import { cn } from "@/lib/utils";

type VehicleType = 'all' | 'scooter' | 'bike' | 'car';

export default function VehicleSelect() {
  const [, setLocation] = useLocation();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<VehicleType>('all');

  const filteredVehicles = useMemo(() => {
    return MOCK_VEHICLES.filter(vehicle => {
      const matchesSearch = 
        vehicle.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        vehicle.brand.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = activeFilter === 'all' || vehicle.type === activeFilter;
      
      return matchesSearch && matchesType;
    });
  }, [searchQuery, activeFilter]);

  const handleContinue = () => {
    if (selectedId) {
      localStorage.setItem('selectedVehicleId', selectedId);
      setLocation("/my-vehicle");
    }
  };

  const categories: { id: VehicleType; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'scooter', label: 'Scooters' },
    { id: 'bike', label: 'Bikes' },
    { id: 'car', label: 'Cars' },
  ];

  return (
    <div className="min-h-screen p-6 flex flex-col bg-background">
      <header className="mb-4 mt-2">
        <h1 className="text-3xl font-bold mb-2">Select Vehicle</h1>
        <p className="text-muted-foreground text-sm">Choose your ride to get accurate charging recommendations.</p>
      </header>

      {/* Search & Filter */}
      <div className="space-y-4 mb-6 sticky top-0 bg-background z-20 py-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <Input 
            placeholder="Search by brand or model..." 
            className="pl-10 bg-zinc-900 border-zinc-800 focus-visible:ring-primary h-12"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveFilter(cat.id)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium border whitespace-nowrap transition-all",
                activeFilter === cat.id 
                  ? "bg-primary text-black border-primary" 
                  : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Vehicle Grid */}
      <div className="flex-1 overflow-y-auto pb-24 -mx-2 px-2">
        {filteredVehicles.length === 0 ? (
          <div className="text-center py-12 text-zinc-500">
            <p>No vehicles found.</p>
            <p className="text-xs mt-1">Try adjusting your search.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredVehicles.map((vehicle, index) => {
              const isSelected = selectedId === vehicle.id;
              return (
                <motion.div
                  key={vehicle.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index }} // Faster stagger
                  onClick={() => setSelectedId(vehicle.id)}
                  className={cn(
                    "relative overflow-hidden rounded-2xl border-2 transition-all duration-200 cursor-pointer group",
                    isSelected 
                      ? "border-primary bg-primary/5 shadow-[0_0_30px_-10px_rgba(255,128,0,0.2)]" 
                      : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700"
                  )}
                >
                  <div className="p-5 relative z-10 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                         <div className="text-xs text-primary font-bold uppercase tracking-wider mb-1">{vehicle.brand}</div>
                         <h3 className={cn("text-xl font-bold", isSelected ? "text-white" : "text-zinc-200")}>
                           {vehicle.name}
                         </h3>
                      </div>
                      <div className={cn(
                        "w-6 h-6 rounded-full border flex items-center justify-center transition-colors",
                        isSelected ? "bg-primary border-primary text-black" : "border-zinc-600"
                      )}>
                        {isSelected && <Check size={14} strokeWidth={3} />}
                      </div>
                    </div>

                    <div className="mt-auto grid grid-cols-2 gap-4 pt-4 relative z-20">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] uppercase tracking-wider">
                          <Battery size={10} /> Battery
                        </div>
                        <div className="text-sm font-mono font-medium text-zinc-300">{vehicle.battery_capacity_kwh} kWh</div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] uppercase tracking-wider">
                          <Zap size={10} /> Range
                        </div>
                        <div className="text-sm font-mono font-medium text-zinc-300">{vehicle.full_range_km} km</div>
                      </div>
                    </div>
                  </div>

                  {/* Image Background Effect */}
                  <div className="absolute -right-4 bottom-0 w-40 h-28 opacity-60 mix-blend-lighten transition-transform duration-500 group-hover:scale-105 pointer-events-none">
                    <img 
                      src={vehicle.image_url} 
                      alt={vehicle.name}
                      className="w-full h-full object-contain object-bottom"
                      loading="lazy"
                    />
                  </div>
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-transparent pointer-events-none" />
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background to-transparent pointer-events-none flex justify-center z-50">
        <div className="w-full max-w-md pointer-events-auto">
          <Button 
            size="lg" 
            className="w-full h-14 text-lg bg-primary text-primary-foreground hover:bg-orange-600 shadow-lg shadow-primary/20"
            disabled={!selectedId}
            onClick={handleContinue}
          >
            Continue <ChevronRight className="ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
