import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Zap, MapPin, AlertCircle, Locate, Plug } from "lucide-react";
import { motion } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MOCK_VEHICLES, Vehicle } from "@/lib/mockData";
import MobileLayout from "@/components/layout/MobileLayout";
import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useLocation as useUserLocation, DEFAULT_LOCATION } from "@/contexts/LocationContext";

const userIcon = new L.DivIcon({
  className: 'custom-marker',
  html: `<div style="width: 20px; height: 20px; background: #f97316; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;"><div style="width: 6px; height: 6px; background: white; border-radius: 50%;"></div></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function MyVehicle() {
  const { latitude, longitude, loading: locationLoading, error: locationError, refreshLocation } = useUserLocation();
  const userLat = latitude ?? DEFAULT_LOCATION.lat;
  const userLng = longitude ?? DEFAULT_LOCATION.lng;

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [soc, setSoc] = useState([45]); 
  const [rangeRadius, setRangeRadius] = useState([20]); 
  const [userProfile, setUserProfile] = useState({ name: '', email: '' });

  useEffect(() => {
    const vId = localStorage.getItem('selectedVehicleId') || 'v1';
    const v = MOCK_VEHICLES.find(x => x.id === vId) || MOCK_VEHICLES[0];
    setVehicle(v);
    
    const savedRange = localStorage.getItem('userRange');
    if (savedRange) {
      setRangeRadius([parseInt(savedRange)]);
    }

    const name = localStorage.getItem('userName') || '';
    const email = localStorage.getItem('userEmail') || '';
    setUserProfile({ name, email });
  }, []);

  useEffect(() => {
    localStorage.setItem('userRange', rangeRadius[0].toString());
  }, [rangeRadius]);

  if (!vehicle) return null;

  const estimatedRange = Math.floor((vehicle.full_range_km * soc[0]) / 100);
  
  const displayName = userProfile.name || userProfile.email || "Driver";
  const displayInitial = displayName.charAt(0).toUpperCase();

  return (
    <MobileLayout>
      <div className="p-6 space-y-6">
        
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-zinc-400 text-sm font-medium">Welcome back,</h2>
            <h1 className="text-2xl font-bold truncate max-w-[200px]">{displayName}</h1>
          </div>
          <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
            <span className="font-bold text-primary">{displayInitial}</span>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative h-72 rounded-3xl overflow-hidden glass-card p-8 flex flex-col justify-between group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-zinc-900/80 to-zinc-900 pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-gradient-to-r from-primary to-orange-500 text-black flex items-center gap-1">
                <Plug size={14} />
                CONNECTED
              </span>
              <span className="text-xs text-zinc-400 font-medium">{vehicle.name}</span>
            </div>
            <div className="flex items-baseline gap-1 mb-2">
              <motion.span 
                key={soc[0]}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-6xl font-mono font-bold tracking-tighter text-white"
              >
                {soc[0]}
              </motion.span>
              <span className="text-2xl font-medium text-primary">%</span>
            </div>
            <p className="text-zinc-400 text-sm font-medium">~{estimatedRange} km range available</p>
          </div>

          <div className="relative z-10 w-full">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs text-zinc-400 font-semibold tracking-widest">SET BATTERY LEVEL</span>
              <span className="text-sm font-bold text-primary bg-primary/15 px-3 py-1 rounded-full">{soc[0]}%</span>
            </div>
            <Slider 
              defaultValue={[45]} 
              max={100} 
              step={1} 
              value={soc}
              onValueChange={setSoc}
              className="cursor-pointer"
            />
            <div className="flex justify-between text-xs text-zinc-500 mt-2 px-1">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          <img 
            src={vehicle.image_url} 
            alt="Vehicle" 
            className="absolute -right-12 -top-4 w-56 h-auto opacity-70 transition-transform duration-700 group-hover:scale-110 group-hover:opacity-80"
          />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              >
                <MapPin size={20} className="text-primary" />
              </motion.div>
              Range Radius
            </h3>
            <motion.span 
              key={rangeRadius[0]}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="font-mono text-primary bg-primary/20 px-3 py-1 rounded-lg text-sm font-bold"
            >
              {rangeRadius[0]} km
            </motion.span>
          </div>
          
          <div className="space-y-3">
            <Slider 
              defaultValue={[20]} 
              max={50} 
              step={1} 
              value={rangeRadius}
              onValueChange={setRangeRadius}
              className="cursor-pointer"
            />
            <div className="flex justify-between text-xs text-zinc-500 px-1">
              <span>1 km</span>
              <span>25 km</span>
              <span>50 km</span>
            </div>
          </div>

          <p className="text-xs text-zinc-500 leading-relaxed">
            Searching for compatible {vehicle.charger_type_supported.join('/')} stations within {rangeRadius[0]}km of your current location.
          </p>

          {locationLoading && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-2 text-center">
              <p className="text-xs text-primary">Getting your location...</p>
            </div>
          )}

          {locationError && !locationLoading && (
            <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-2 flex items-center justify-between">
              <p className="text-xs text-zinc-400">{locationError}</p>
              <Button size="sm" variant="ghost" onClick={refreshLocation} className="h-6 px-2">
                <Locate size={14} />
              </Button>
            </div>
          )}

          <div className="h-40 rounded-xl overflow-hidden border border-zinc-800 relative">
            <MapContainer
              center={[userLat, userLng]}
              zoom={12}
              style={{ width: '100%', height: '100%' }}
              zoomControl={false}
              attributionControl={false}
              dragging={false}
              scrollWheelZoom={false}
              doubleClickZoom={false}
              touchZoom={false}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />
              <MapUpdater center={[userLat, userLng]} />
              <Marker position={[userLat, userLng]} icon={userIcon} />
              <Circle 
                center={[userLat, userLng]} 
                radius={rangeRadius[0] * 1000}
                pathOptions={{ color: '#f97316', fillColor: '#f97316', fillOpacity: 0.1, weight: 2 }}
              />
            </MapContainer>
            <Link href="/map">
              <div className="absolute bottom-3 right-3 z-[400]">
                <Button size="sm" className="bg-white text-black hover:bg-zinc-200 h-8 text-xs">
                  Expand Map
                </Button>
              </div>
            </Link>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 gap-4"
        >
          <Link href={`/recommendations?range=${rangeRadius[0]}&soc=${soc[0]}`}>
            <Card className="p-4 bg-zinc-900/50 border-zinc-800 hover:border-primary/50 transition-colors cursor-pointer group">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3 group-hover:scale-110 transition-transform">
                <Zap size={20} />
              </div>
              <div className="font-bold text-lg">Find Charger</div>
              <div className="text-xs text-zinc-500 mt-1">Based on your location</div>
            </Card>
          </Link>

          <Link href="/analytics">
            <Card className="p-4 bg-zinc-900/50 border-zinc-800 hover:border-secondary/50 transition-colors cursor-pointer group">
              <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary mb-3 group-hover:scale-110 transition-transform">
                <AlertCircle size={20} />
              </div>
              <div className="font-bold text-lg">Diagnostics</div>
              <div className="text-xs text-zinc-500 mt-1">Health check</div>
            </Card>
          </Link>
        </motion.div>

      </div>
    </MobileLayout>
  );
}
