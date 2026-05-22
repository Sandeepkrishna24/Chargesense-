import { Station } from "./mockData"; // Import the type

const OVERPASS_API_URL = "https://overpass-api.de/api/interpreter";

// Basic parsing for OpenStreetMap socket types to our app format
const mapOsmSocketToConnector = (tags: any): Station['connector_type'] => {
  if (tags['socket:type2'] || tags['socket:type2_combo']) return "Type 2";
  if (tags['socket:chademo']) return "Type 2"; // closest fallback
  if (tags['socket:ccs2'] || tags['socket:ccs']) return "CCS2";
  if (tags['socket:type3']) return "Bharat AC001";
  return "Type 2"; // Default fallback
};

export const fetchRealStations = async (
  lat: number,
  lng: number,
  radiusKm: number = 20
): Promise<Station[]> => {
  try {
    const response = await fetch(`/api/stations?lat=${lat}&lng=${lng}&distance=${radiusKm}`);
    if (!response.ok) throw new Error("Failed to fetch stations");
    const data = await response.json();
    return data; // Backend now provides formatted Station objects
  } catch (error) {
    console.error("Error fetching real API stations:", error);
    return [];
  }
};

export const searchStationLocation = async (query: string): Promise<{lat: number, lng: number} | null> => {
  try {
    const response = await fetch(`/api/stations/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) return null;
    return await response.json();
  } catch (err) {
    return null;
  }
};

export const fetchReviews = async (stationId: string) => {
  const res = await fetch(`/api/reviews/${stationId}`);
  return res.json();
};

export const addReview = async (review: any) => {
  const res = await fetch('/api/reviews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(review)
  });
  return res.json();
};

export const fetchActiveSession = async (userId: string) => {
  const res = await fetch(`/api/sessions/active/${userId}`);
  return res.json();
};

export const startChargingSession = async (sessionData: any) => {
  const res = await fetch('/api/sessions/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sessionData)
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to start session");
  }
  return res.json();
};

export const endChargingSession = async (sessionData: any) => {
  const res = await fetch('/api/sessions/end', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sessionData)
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to end session");
  }
  return res.json();
};

export const toggleStationFavourite = async (userId: string, stationId: string) => {
  const res = await fetch('/api/favourites/toggle', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, stationId })
  });
  if (!res.ok) throw new Error("Failed to toggle favourite");
  return res.json();
};

/* =======================
   COMMUNITY CHECK-INS
======================= */
export const fetchCheckIns = async (stationId: string): Promise<any[]> => {
  const res = await fetch(`/api/checkins/${stationId}`);
  return res.json();
};

export const checkInToStation = async (stationId: string, userId: string): Promise<any> => {
  const res = await fetch('/api/checkins', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stationId, userId })
  });
  if (!res.ok) throw new Error("Failed to check in");
  return res.json();
};

/* =======================
   CONTRIBUTE STATION
======================= */
export const contributeStation = async (payload: {
  name: string;
  address?: string;
  latitude: number;
  longitude: number;
  charger_power_kw: number;
  connector_type: string;
}): Promise<any> => {
  const res = await fetch('/api/stations/contribute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Failed to contribute station");
  return res.json();
};

export const fetchFavourites = async (userId: string) => {
  const res = await fetch(`/api/favourites/${userId}`);
  return res.json();
};
export const fetchSessions = async (userId: string) => {
  const res = await fetch(`/api/sessions/${userId}`);
  return res.json();
};
