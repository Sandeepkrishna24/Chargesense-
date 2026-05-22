// Debug helper to log location issues
export function debugLocation(lat: number | null, lng: number | null, isDefault: boolean) {
  if (!lat || !lng) return;
  
  const info = {
    latitude: lat,
    longitude: lng,
    isUsingDefaultLocation: isDefault,
    timestamp: new Date().toISOString(),
  };
  
  console.log('📍 Location Info:', info);
}
