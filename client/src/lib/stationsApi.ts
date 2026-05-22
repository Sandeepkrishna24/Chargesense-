// client/src/api/stationsApi.ts

export type RealStation = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  operator?: string;
};

export async function fetchNearbyChargingStations(
  lat: number,
  lng: number,
  radiusMeters = 2000
): Promise<RealStation[]> {
  const query = `
    [out:json];
    node["amenity"="charging_station"](around:${radiusMeters},${lat},${lng});
    out;
  `;

  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(
    query
  )}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to fetch charging stations");
  }

  const data = await res.json();

  return (data.elements || []).map((el: any) => ({
    id: String(el.id),
    name: el.tags?.name || "EV Charging Station",
    latitude: el.lat,
    longitude: el.lon,
    operator: el.tags?.operator,
  }));
}
