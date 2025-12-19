import { useState, useEffect } from "react";
import { useLocation as useRouterLocation } from "wouter";
import { motion } from "framer-motion";
import { MapPin, Locate, Loader2, CheckCircle, AlertCircle, ChevronRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation as useUserLocation } from "@/contexts/LocationContext";

export default function LocationEntry() {
  const [, setRouterLocation] = useRouterLocation();
  const { latitude, longitude, loading, error, refreshLocation, setManualLocation } = useUserLocation();
  const [locationStatus, setLocationStatus] = useState<'idle' | 'fetching' | 'success' | 'error'>('idle');
  const [locationName, setLocationName] = useState<string>('');
  const [autoStarted, setAutoStarted] = useState(false);
  const [showManualSearch, setShowManualSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);

  // Auto-start location fetch on mount
  useEffect(() => {
    if (!autoStarted && !loading) {
      setAutoStarted(true);
      setLocationStatus('fetching');
      refreshLocation();
    }
  }, []);

  // Update status based on location state
  useEffect(() => {
    if (loading) {
      setLocationStatus('fetching');
    } else if (latitude && longitude) {
      setLocationStatus('success');
      fetchLocationName(latitude, longitude);
    } else if (error) {
      setLocationStatus('error');
    }
  }, [loading, latitude, longitude, error]);

  const fetchLocationName = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14`
      );
      const data = await response.json();
      if (data.display_name) {
        const parts = data.display_name.split(',');
        setLocationName(parts.slice(0, 3).join(',').trim());
      }
    } catch (err) {
      setLocationName(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    }
  };

  const handleGetLocation = () => {
    setLocationStatus('fetching');
    refreshLocation();
  };

  const handleSearchLocation = async () => {
    if (!searchQuery.trim()) return;
    
    setSearchLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
      );
      const data = await response.json();
      
      if (data && data[0]) {
        const { lat, lon, display_name } = data[0];
        setManualLocation(parseFloat(lat), parseFloat(lon));
        setLocationStatus('success');
        setLocationName(display_name.split(',').slice(0, 3).join(',').trim());
        setShowManualSearch(false);
        setSearchQuery('');
      } else {
        alert('Location not found. Please try a different search.');
      }
    } catch (err) {
      alert('Failed to search location. Please try again.');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleContinue = () => {
    if (latitude && longitude) {
      setRouterLocation('/home');
    }
  };

  // Auto-continue when location is successfully obtained
  useEffect(() => {
    if (locationStatus === 'success' && latitude && longitude) {
      const timer = setTimeout(() => {
        setRouterLocation('/home');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [locationStatus, latitude, longitude, setRouterLocation]);

  return (
    <div className="min-h-screen bg-background flex flex-col p-6">
      <header className="mb-8 mt-4">
        <h1 className="text-3xl font-bold mb-2">Enter Location</h1>
        <p className="text-muted-foreground text-sm">
          We need your location to find nearby charging stations.
        </p>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center -mt-20">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-sm"
        >
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 text-center">
            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 transition-colors ${
              locationStatus === 'success' ? 'bg-green-500/20' :
              locationStatus === 'error' ? 'bg-red-500/20' :
              locationStatus === 'fetching' ? 'bg-primary/20' :
              'bg-zinc-800'
            }`}>
              {locationStatus === 'fetching' ? (
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
              ) : locationStatus === 'success' ? (
                <CheckCircle className="w-10 h-10 text-green-500" />
              ) : locationStatus === 'error' ? (
                <AlertCircle className="w-10 h-10 text-red-500" />
              ) : (
                <MapPin className="w-10 h-10 text-zinc-500" />
              )}
            </div>

            {locationStatus === 'idle' && (
              <>
                <h2 className="text-xl font-bold mb-2">Share Your Location</h2>
                <p className="text-zinc-400 text-sm mb-6">
                  Tap the button below to allow location access and find charging stations near you.
                </p>
              </>
            )}

            {locationStatus === 'fetching' && (
              <>
                <h2 className="text-xl font-bold mb-2">Getting Location...</h2>
                <p className="text-zinc-400 text-sm mb-6">
                  Please wait while we determine your current location using GPS.
                </p>
              </>
            )}

            {locationStatus === 'success' && (
              <>
                <h2 className="text-xl font-bold mb-2 text-green-500">Location Found!</h2>
                <p className="text-zinc-400 text-sm mb-2">Your current location:</p>
                <p className="text-white text-sm font-medium mb-6 px-4">{locationName || 'Loading...'}</p>
              </>
            )}

            {locationStatus === 'error' && (
              <>
                <h2 className="text-xl font-bold mb-2 text-red-500">Location Error</h2>
                <p className="text-zinc-400 text-sm mb-6">
                  {error || 'Unable to get your location. Please try again or enable location services.'}
                </p>
              </>
            )}

            {locationStatus === 'idle' || locationStatus === 'error' ? (
              <Button
                size="lg"
                className="w-full h-14 text-base px-4 bg-primary text-primary-foreground hover:bg-orange-600"
                onClick={handleGetLocation}
              >
                <Locate className="mr-2" />
                Get Current Location
              </Button>
            ) : locationStatus === 'fetching' ? (
              <Button
                size="lg"
                className="w-full h-14 text-lg bg-zinc-800 text-zinc-400"
                disabled
              >
                <Loader2 className="mr-2 animate-spin" />
                Fetching Location...
              </Button>
            ) : (
              <Button
                size="lg"
                className="w-full h-14 text-lg bg-green-600 hover:bg-green-700 text-white"
                onClick={handleContinue}
              >
                Continue to Home
                <ChevronRight className="ml-2" />
              </Button>
            )}
          </div>

          {locationStatus === 'success' && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 text-sm text-zinc-500 hover:text-zinc-300 transition-colors w-full text-center"
              onClick={handleGetLocation}
            >
              Refresh Location
            </motion.button>
          )}

          {!showManualSearch && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-2 text-sm text-primary hover:text-orange-500 transition-colors w-full text-center"
              onClick={() => setShowManualSearch(true)}
            >
              Search for a different location
            </motion.button>
          )}

          {showManualSearch && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-zinc-800 rounded-2xl border border-zinc-700"
            >
              <label className="block text-sm font-medium text-zinc-300 mb-2">Enter City or Address</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearchLocation()}
                  placeholder="e.g., Mumbai, Bangalore"
                  className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-primary"
                  autoFocus
                />
                <Button
                  size="sm"
                  onClick={handleSearchLocation}
                  disabled={searchLoading || !searchQuery.trim()}
                  className="bg-primary text-black hover:bg-orange-600"
                >
                  <Search size={16} />
                </Button>
              </div>
              <button
                onClick={() => {
                  setShowManualSearch(false);
                  setSearchQuery('');
                }}
                className="mt-3 text-xs text-zinc-500 hover:text-zinc-300 w-full text-center"
              >
                Cancel
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>

      <div className="text-center text-xs text-zinc-600 mt-8">
        <p>Your location data is only used to find nearby stations.</p>
        <p>We don't store or share your location.</p>
      </div>
    </div>
  );
}
