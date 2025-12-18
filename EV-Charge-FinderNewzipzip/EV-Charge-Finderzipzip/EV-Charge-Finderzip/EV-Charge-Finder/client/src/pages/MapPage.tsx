import { useMemo, useState, useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft, Locate, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import MobileLayout from "@/components/layout/MobileLayout";
import { MapContainer, TileLayer, Marker, Circle, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MOCK_STATIONS, MOCK_VEHICLES, haversineDistance, getOlaServiceCenters } from "@/lib/mockData";
import { useLocation as useUserLocation, DEFAULT_LOCATION } from "@/contexts/LocationContext";

const userIcon = new L.DivIcon({
  className: 'custom-marker',
  html: `<div style="width: 24px; height: 24px; background: #f97316; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;"><div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const createStationIcon = (status: string, isOlaCenter: boolean = false) => new L.DivIcon({
  className: 'station-marker',
  html: `<div style="width: 44px; height: 44px; background: ${isOlaCenter ? '#8b5cf6' : status === 'available' ? '#22c55e' : status === 'busy' ? '#f97316' : '#ef4444'}; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 12px rgba(0,0,0,0.5), 0 0 8px rgba(255,255,255,0.3); display: flex; align-items: center; justify-content: center; position: relative;">
    <div style="width: 8px; height: 8px; background: white; border-radius: 50%; position: absolute; top: 2px; right: 2px; box-shadow: 0 0 4px rgba(0,0,0,0.3);"></div>
    <svg width="22" height="22" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="1.5">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
    </svg>
  </div>`,
  iconSize: [44, 44],
  iconAnchor: [22, 44],
});

function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function MapPage() {
  const { latitude, longitude, loading: locationLoading, refreshLocation } = useUserLocation();
  const userLat = latitude ?? DEFAULT_LOCATION.lat;
  const userLng = longitude ?? DEFAULT_LOCATION.lng;
  
  const [rangeLimit, setRangeLimit] = useState(20);
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([userLat, userLng]);
  const [mapZoom, setMapZoom] = useState(12);

  const searchParams = new URLSearchParams(window.location.search);
  const stationIdParam = searchParams.get('stationId');

  useEffect(() => {
    const savedRange = localStorage.getItem('userRange');
    if (savedRange) {
      setRangeLimit(Number(savedRange));
    }
    if (stationIdParam) {
      setSelectedStationId(stationIdParam);
    }
  }, [stationIdParam]);

  useEffect(() => {
    setMapCenter([userLat, userLng]);
  }, [userLat, userLng]);

  const vehicleId = localStorage.getItem('selectedVehicleId') || 'v1';
  const vehicle = MOCK_VEHICLES.find(x => x.id === vehicleId) || MOCK_VEHICLES[0];
  const isOlaVehicle = vehicle.brand.toLowerCase() === 'ola';

  const visibleStations = useMemo(() => {
    let allStations = [...MOCK_STATIONS];
    
    if (isOlaVehicle) {
      const olaCenters = getOlaServiceCenters(userLat, userLng);
      allStations = [...allStations, ...olaCenters];
    }
    
    return allStations.map(station => {
      const dist = haversineDistance(userLat, userLng, station.latitude, station.longitude);
      return { ...station, distance_km: dist };
    }).filter(station => {
      if (stationIdParam && station.id === stationIdParam) return true;
      if (station.distance_km > rangeLimit) return false;
      if (!vehicle.charger_type_supported.includes(station.charger_type)) return false;
      return true;
    });
  }, [rangeLimit, vehicle, stationIdParam, userLat, userLng, isOlaVehicle]);

  const selectedStation = useMemo(() => 
    selectedStationId ? visibleStations.find(s => s.id === selectedStationId) : null
  , [selectedStationId, visibleStations]);

  useEffect(() => {
    if (selectedStation) {
      setMapCenter([selectedStation.latitude, selectedStation.longitude]);
      setMapZoom(15);
    }
  }, [selectedStation]);

  const handleCenterOnUser = () => {
    setMapCenter([userLat, userLng]);
    setMapZoom(12);
    refreshLocation();
  };

  const backHref = stationIdParam ? "/recommendations" : "/my-vehicle";

  return (
    <MobileLayout>
      <div className="h-screen w-full relative">
        <div className="absolute top-4 left-4 z-[1000]">
          <Link href={backHref}>
            <Button variant="secondary" size="icon" className="rounded-full shadow-xl bg-white text-black hover:bg-zinc-200">
              <ArrowLeft size={20} />
            </Button>
          </Link>
        </div>

        <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2 items-end">
          <div className="bg-black/80 backdrop-blur px-3 py-1 rounded-full text-xs font-mono text-primary border border-primary/20">
            Radius: {rangeLimit}km
          </div>
          <Button 
            variant="secondary" 
            size="icon" 
            className="rounded-full shadow-xl bg-white text-black hover:bg-zinc-200"
            onClick={handleCenterOnUser}
          >
            <Locate size={18} />
          </Button>
        </div>

        {locationLoading && (
          <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-[1000] bg-primary/90 text-black text-xs px-3 py-1 rounded-full">
            Getting your location...
          </div>
        )}

        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ width: '100%', height: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <MapController center={mapCenter} zoom={mapZoom} />
          
          <Circle 
            center={[userLat, userLng]} 
            radius={rangeLimit * 1000}
            pathOptions={{ color: '#f97316', fillColor: '#f97316', fillOpacity: 0.1, weight: 2 }}
          />
          
          <Marker position={[userLat, userLng]} icon={userIcon}>
            <Popup>
              <div className="text-center">
                <p className="font-bold text-sm">Your Location</p>
              </div>
            </Popup>
          </Marker>

          {visibleStations.map(station => {
            const isOlaCenter = station.id.startsWith('ola_');
            return (
              <Marker
                key={station.id}
                position={[station.latitude, station.longitude]}
                icon={createStationIcon(station.status, isOlaCenter)}
                eventHandlers={{
                  click: () => setSelectedStationId(station.id),
                }}
              >
                <Popup>
                  <div className="min-w-[200px]">
                    {isOlaCenter && (
                      <div className="bg-purple-500 text-white text-[10px] font-bold px-2 py-0.5 rounded mb-2 inline-block">
                        OLA SERVICE CENTER
                      </div>
                    )}
                    <h3 className="font-bold text-sm mb-1">{station.name}</h3>
                    <p className="text-xs text-gray-600 mb-2">{station.distance_km} km away</p>
                    <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
                      <span>{station.charger_type} {station.charger_power_kw}kW</span>
                      <span className={station.status === 'available' ? 'text-green-600 font-medium' : 'text-orange-600 font-medium'}>
                        {station.status}
                      </span>
                    </div>
                    <button
                      className="w-full py-2 px-3 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 flex items-center justify-center gap-2"
                      onClick={() => {
                        window.open(`https://www.google.com/maps/dir/?api=1&destination=${station.latitude},${station.longitude}`, '_blank');
                      }}
                    >
                      <Navigation size={14} /> Navigate
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        <div className="absolute bottom-6 left-4 right-4 z-[1000]">
          <div className="bg-black/90 backdrop-blur rounded-xl p-4 border border-zinc-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500">Showing</p>
                <p className="text-lg font-bold text-white">{visibleStations.length} stations</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-zinc-500">Within</p>
                <p className="text-lg font-bold text-primary">{rangeLimit} km</p>
              </div>
            </div>
            {isOlaVehicle && (
              <p className="text-xs text-purple-400 mt-2 text-center">Includes Ola Service Centers</p>
            )}
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
