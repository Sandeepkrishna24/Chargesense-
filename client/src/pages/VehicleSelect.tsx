// React hooks
import { useState, useMemo, useEffect } from "react";

// Routing
import { useLocation } from "wouter";

// Animation
import { motion, AnimatePresence } from "framer-motion";

// Icons
import { Check, ChevronRight, Battery, Zap, Search, Plus, Trash2, Car } from "lucide-react";

// UI components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Utility
import { cn } from "@/lib/utils";
import MobileLayout from "@/components/layout/MobileLayout";
import { useQuery } from "@tanstack/react-query";

// Vehicle type
type VehicleType = "all" | "scooter" | "bike" | "car";
type TabType = "garage" | "add";

export default function VehicleSelect() {
  const [, setLocation] = useLocation();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<VehicleType>("all");
  
  // Garage state
  const [savedVehicleIds, setSavedVehicleIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("add");

  const { data: vehicleData, isLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: async () => {
      const res = await fetch('/api/vehicles');
      if (!res.ok) throw new Error('Failed to fetch vehicles');
      return res.json();
    }
  });

  // Init garage data
  useEffect(() => {
    const saved = localStorage.getItem("savedVehicles");
    const activeId = localStorage.getItem("selectedVehicleId");
    
    let parsedSaved: string[] = [];
    if (saved) {
      try {
        parsedSaved = JSON.parse(saved);
        setSavedVehicleIds(parsedSaved);
      } catch (e) {
        console.error("Failed to parse savedVehicles");
      }
    }
    
    // If they have an active ID but it's not in the saved list yet (legacy migration), add it
    if (activeId && !parsedSaved.includes(activeId)) {
      parsedSaved = [activeId, ...parsedSaved];
      setSavedVehicleIds(parsedSaved);
      localStorage.setItem("savedVehicles", JSON.stringify(parsedSaved));
    }

    if (activeId) setSelectedId(activeId);
    
    // Default to garage if they have saved vehicles
    if (parsedSaved.length > 0) {
      setActiveTab("garage");
    }
  }, []);

  useEffect(() => {
    if (vehicleData) {
      setVehicles(vehicleData);
    }
  }, [vehicleData]);

  const garageVehicles = useMemo(() => {
    return vehicles.filter(v => savedVehicleIds.includes(v.id));
  }, [vehicles, savedVehicleIds]);

  const addVehiclesList = useMemo(() => {
    return vehicles.filter((vehicle) => {
      const matchesSearch =
        vehicle.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle.brand?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType =
        activeFilter === "all" || vehicle.type === activeFilter;

      return matchesSearch && matchesType;
    });
  }, [vehicles, searchQuery, activeFilter]);

  const handleSelectGarageVehicle = (id: string) => {
    localStorage.setItem("selectedVehicleId", id);
    setLocation("/my-vehicle");
  };

  const handleRemoveFromGarage = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent selecting the vehicle
    const updated = savedVehicleIds.filter(vId => vId !== id);
    setSavedVehicleIds(updated);
    localStorage.setItem("savedVehicles", JSON.stringify(updated));
    
    // If we removed the currently active vehicle, clear it from active
    if (selectedId === id) {
      const remainingId = updated.length > 0 ? updated[0] : null;
      if (remainingId) {
        setSelectedId(remainingId);
        localStorage.setItem("selectedVehicleId", remainingId);
      } else {
        setSelectedId(null);
        localStorage.removeItem("selectedVehicleId");
        setActiveTab("add");
      }
    }
  };

  const handleConfirmAddVehicle = () => {
    if (selectedId) {
      // Add to garage array if not present
      if (!savedVehicleIds.includes(selectedId)) {
        const newGarage = [selectedId, ...savedVehicleIds];
        setSavedVehicleIds(newGarage);
        localStorage.setItem("savedVehicles", JSON.stringify(newGarage));
      }
      
      localStorage.setItem("selectedVehicleId", selectedId);
      setLocation("/my-vehicle");
    }
  };

  const categories: { id: VehicleType; label: string }[] = [
    { id: "all", label: "All" },
    { id: "scooter", label: "Scooters" },
    { id: "bike", label: "Bikes" },
    { id: "car", label: "Cars" },
  ];

  // Reusable Vehicle Card Component
  const VehicleCard = ({ vehicle, isSelected, inGarage, onClick }: any) => (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-3xl cursor-pointer h-60 transition-all duration-300",
        isSelected
          ? "ring-2 ring-primary shadow-[0_0_20px_-5px_rgba(255,165,0,0.4)]"
          : "ring-1 ring-white/8 hover:ring-white/20"
      )}
    >
      <img
        src={vehicle.image_url}
        alt={vehicle.name}
        className="absolute inset-0 w-full h-full object-cover brightness-75 bg-zinc-900"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/10" />
      
      {isSelected && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-orange-400 to-amber-500" />
      )}

      <div className="absolute inset-0 p-4 flex flex-col justify-between z-10">
        <div className="flex justify-between items-start">
          <span className="text-[9px] font-black uppercase tracking-widest text-zinc-100 bg-black/60 px-2.5 py-1.5 rounded-xl backdrop-blur-md border border-white/10">
            {vehicle.brand}
          </span>
          <div className="flex items-center gap-2">
            {inGarage && (
              <button 
                onClick={(e) => handleRemoveFromGarage(e, vehicle.id)}
                className="w-7 h-7 rounded-full bg-black/50 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-red-400 hover:border-red-500/50 hover:bg-red-500/10 transition-all backdrop-blur-sm"
              >
                <Trash2 size={12} />
              </button>
            )}
            <div className={cn(
              "w-7 h-7 rounded-full flex items-center justify-center transition-all backdrop-blur-sm",
              isSelected
                ? "bg-primary text-black shadow-[0_0_15px_rgba(255,165,0,0.4)]"
                : "bg-black/50 border border-white/10"
            )}>
              {isSelected && <Check size={14} strokeWidth={4} />}
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-[13px] font-bold text-white leading-tight mb-2.5 line-clamp-2">
            {vehicle.name}
          </h3>
          <div className="flex gap-2">
            <div className="flex-1 bg-black/60 backdrop-blur-sm rounded-xl p-2 border border-white/10">
              <div className="flex items-center gap-1 text-zinc-100 text-[7px] uppercase tracking-widest font-black mb-0.5">
                <Battery size={9} className={isSelected ? "text-primary" : ""} /> Capacity
              </div>
              <div className="text-xs font-mono font-bold text-white">{vehicle.battery_capacity_kwh}kWh</div>
            </div>
            <div className="flex-1 bg-black/60 backdrop-blur-sm rounded-xl p-2 border border-white/10">
              <div className="flex items-center gap-1 text-zinc-100 text-[7px] uppercase tracking-widest font-black mb-0.5">
                <Zap size={9} className={isSelected ? "text-orange-400" : ""} /> Range
              </div>
              <div className="text-xs font-mono font-bold text-white">{vehicle.full_range_km}km</div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <MobileLayout showNav={false}>
      <div className="min-h-screen pt-10 px-6 pb-6 flex flex-col bg-black text-white relative overflow-hidden">
        {/* Visual Background Filters */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmczPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20 pointer-events-none" />
        <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-[20%] right-[-10%] w-[60vw] h-[60vw] bg-gradient-to-tl from-orange-500/10 to-transparent rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 w-full h-full flex flex-col">
          
          {/* Header */}
          <header className="mb-5 mt-2">
            <h1 className="text-3xl font-bold mb-2 tracking-tight">Select <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">Vehicle</span></h1>
            <p className="text-zinc-400 text-sm">
              Manage your garage to get accurate charging recommendations mapped directly from OpenStreetMap.
            </p>
          </header>

          {/* Top Level Tabs: Garage vs Add */}
          <div className="flex bg-zinc-900/50 backdrop-blur-xl p-1.5 rounded-2xl border border-white/5 mb-6 shadow-inner">
            <button
              onClick={() => setActiveTab("garage")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all",
                activeTab === "garage" 
                  ? "bg-white/10 text-white shadow-md border border-white/10" 
                  : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <Car size={14} /> My Garage
              {savedVehicleIds.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] ml-1">
                  {savedVehicleIds.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("add")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all",
                activeTab === "add" 
                  ? "bg-white/10 text-white shadow-md border border-white/10" 
                  : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <Plus size={14} /> Add Vehicle
            </button>
          </div>

          {/* View Content */}
          <div className="flex-1 overflow-y-auto pb-24 -mx-2 px-2 no-scrollbar">
            {isLoading ? (
              <div className="h-40 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <div className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Loading vehicles...</div>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                {activeTab === "garage" && (
                  <motion.div
                    key="garage-view"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    {garageVehicles.length === 0 ? (
                      <div className="text-center py-16 text-zinc-500 flex flex-col items-center border border-dashed border-zinc-800 rounded-3xl bg-zinc-900/20 backdrop-blur-sm">
                        <Car size={32} className="text-zinc-700 mb-3" />
                        <p className="font-bold text-white">Your garage is empty</p>
                        <p className="text-xs mt-1 mb-5">Switch to the "Add Vehicle" tab to add your first EV.</p>
                        <Button 
                          onClick={() => setActiveTab("add")}
                          className="bg-primary/20 hover:bg-primary/30 text-primary hover:text-primary border border-primary/20 text-xs font-bold uppercase tracking-wider h-10 px-6 rounded-xl"
                        >
                          Find Vehicles
                        </Button>
                      </div>
                    ) : (
                      garageVehicles.map((vehicle, index) => (
                        <div key={vehicle.id} style={{ animationDelay: `${index * 0.05}s` }} className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both">
                          <VehicleCard
                            vehicle={vehicle}
                            isSelected={selectedId === vehicle.id}
                            inGarage={true}
                            onClick={() => handleSelectGarageVehicle(vehicle.id)}
                          />
                        </div>
                      ))
                    )}
                  </motion.div>
                )}

                {activeTab === "add" && (
                  <motion.div
                    key="add-view"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex flex-col h-full"
                  >
                    {/* Add Vehicle Search & Filters */}
                    <div className="space-y-4 mb-6 sticky top-0 z-20 py-2 bg-black/60 backdrop-blur-2xl border-b border-white/5 pb-4">
                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                        <Input
                          placeholder="Search database..."
                          className="pl-12 bg-zinc-900/50 backdrop-blur-md border border-white/5 focus-visible:ring-primary h-14 rounded-2xl text-white placeholder:text-zinc-600 shadow-inner"
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
                              "px-5 py-2.5 rounded-2xl text-[11px] uppercase tracking-widest font-bold border whitespace-nowrap transition-all",
                              activeFilter === cat.id
                                ? "bg-gradient-to-r from-primary to-orange-500 text-black border-transparent shadow-[0_0_20px_rgba(255,165,0,0.3)]"
                                : "bg-black/30 backdrop-blur-md border-white/10 text-zinc-500 hover:border-white/20 hover:text-white hover:bg-white/5"
                            )}
                          >
                            {cat.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Add Vehicle Grid */}
                    {addVehiclesList.length === 0 ? (
                       <div className="text-center py-12 text-zinc-500">
                         <p>No vehicles found.</p>
                         <p className="text-xs mt-1">Try adjusting your search.</p>
                       </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3 pb-8">
                        {addVehiclesList.map((vehicle, index) => (
                          <div key={vehicle.id} style={{ animationDelay: `${index * 0.05}s` }} className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both">
                            <VehicleCard
                              vehicle={vehicle}
                              isSelected={selectedId === vehicle.id}
                              inGarage={false}
                              onClick={() => setSelectedId(vehicle.id)}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* Floating Confirm Button (Only shown in "Add" tab when a vehicle is selected) */}
        {activeTab === "add" && selectedId && (
          <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/90 to-transparent flex justify-center z-50 pointer-events-none animate-in slide-in-from-bottom-10 fade-in duration-300">
            <div className="w-full max-w-md pointer-events-auto">
              <Button
                size="lg"
                className="w-full h-14 text-base font-bold rounded-2xl bg-gradient-to-r from-primary to-orange-500 text-black shadow-[0_0_30px_rgba(255,165,0,0.3)] hover:shadow-[0_0_40px_rgba(255,165,0,0.5)] transform hover:scale-[1.02] flex items-center justify-center gap-2 transition-all"
                onClick={handleConfirmAddVehicle}
              >
                Add to Garage
                <ChevronRight className="w-5 h-5 translate-x-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
