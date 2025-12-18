import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Zap, MapPin, AlertCircle, Locate } from "lucide-react";
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

        <div className="relative h-64 rounded-3xl overflow-hidden glass-card p-6 flex flex-col justify-between group">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-primary text-black">CONNECTED</span>
              <span className="text-xs text-zinc-400">{vehicle.name}</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-mono font-bold tracking-tighter text-white">{soc[0]}</span>
              <span className="text-xl font-medium text-zinc-400">%</span>
            </div>
            <p className="text-zinc-400 text-sm mt-1">~{estimatedRange} km range remaining</p>
          </div>

          <div className="relative z-10 w-full">
            <div className="flex justify-between text-xs text-zinc-500 mb-2 font-medium tracking-wide">
              <span>SET BATTERY LEVEL</span>
              <span>{soc[0]}%</span>
            </div>
            <Slider 
              defaultValue={[45]} 
              max={100} 
              step={1} 
              value={soc}
              onValueChange={setSoc}
              className="cursor-pointer"
            />
          </div>

          <img 
            src={vehicle.image_url} 
            alt="Vehicle" 
            className="absolute -right-8 top-8 w-48 h-auto opacity-90 transition-transform duration-700 group-hover:scale-105"
          />
          
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/90 via-zinc-900/50 to-primary/5 pointer-events-none" />
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <MapPin size={18} className="text-primary" /> 
              Range Radius
            </h3>
            <span className="font-mono text-primary bg-primary/10 px-2 py-1 rounded text-sm">{rangeRadius[0]} km</span>
          </div>
          
          <Slider 
            defaultValue={[20]} 
            max={100} 
            step={5} 
            value={rangeRadius}
            onValueChange={setRangeRadius}
          />
          <p className="text-xs text-zinc-500">
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
        </div>

        <div className="grid grid-cols-2 gap-4">
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
        </div>

      </div>
    </MobileLayout>
  );
}
