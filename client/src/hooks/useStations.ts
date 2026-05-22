import { useState, useEffect, useCallback } from 'react';
import { Station } from '../lib/mockData';
import { fetchRealStations } from '../lib/api';
import { useLocation } from '../contexts/LocationContext';

export function useStations(radiusKm: number = 20, overrideLat?: number, overrideLng?: number) {
  const { latitude: contextLat, longitude: contextLng, loading: locationLoading } = useLocation();

  const latitude = overrideLat ?? contextLat;
  const longitude = overrideLng ?? contextLng;

  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStations = useCallback(async () => {
    // Wait for location to be available before fetching stations
    if (locationLoading || latitude === null || longitude === null) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const realStations = await fetchRealStations(latitude, longitude, radiusKm);
      setStations(realStations);
    } catch (err) {
      console.error('Error loading stations:', err);
      setError('Failed to load charging stations. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [latitude, longitude, radiusKm, locationLoading]);

  useEffect(() => {
    loadStations();
  }, [loadStations]);

  return {
    stations,
    loading: loading || locationLoading,
    error,
    refreshStations: loadStations
  };
}
