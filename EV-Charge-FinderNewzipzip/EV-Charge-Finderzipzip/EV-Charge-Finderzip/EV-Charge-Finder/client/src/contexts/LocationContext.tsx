import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  loading: boolean;
  error: string | null;
}

interface LocationContextType extends LocationState {
  refreshLocation: () => void;
  setManualLocation: (lat: number, lng: number) => void;
}

const DEFAULT_LAT = 13.0067;
const DEFAULT_LNG = 80.2206;

const LocationContext = createContext<LocationContextType | null>(null);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<LocationState>({
    latitude: null,
    longitude: null,
    loading: true,
    error: null,
  });

  const fetchLocation = () => {
    setLocation(prev => ({ ...prev, loading: true, error: null }));

    if (!navigator.geolocation) {
      setLocation({
        latitude: DEFAULT_LAT,
        longitude: DEFAULT_LNG,
        loading: false,
        error: 'Geolocation not supported. Using default location.',
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          loading: false,
          error: null,
        });
      },
      (error) => {
        let errorMessage = 'Unable to get location.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Using default location.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location unavailable. Using default location.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Using default location.';
            break;
        }
        setLocation({
          latitude: DEFAULT_LAT,
          longitude: DEFAULT_LNG,
          loading: false,
          error: errorMessage,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  useEffect(() => {
    fetchLocation();
  }, []);

  const setManualLocation = (lat: number, lng: number) => {
    setLocation({
      latitude: lat,
      longitude: lng,
      loading: false,
      error: null,
    });
  };

  return (
    <LocationContext.Provider
      value={{
        ...location,
        refreshLocation: fetchLocation,
        setManualLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}

export const DEFAULT_LOCATION = { lat: DEFAULT_LAT, lng: DEFAULT_LNG };
