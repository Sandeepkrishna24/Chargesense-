const lat = 13.0067; // Chennai Default
const lng = 80.2206;
const radius = 50000; // 50km
const query = `
[out:json][timeout:25];
(
  node["amenity"="charging_station"](around:${radius},${lat},${lng});
  way["amenity"="charging_station"](around:${radius},${lat},${lng});
  relation["amenity"="charging_station"](around:${radius},${lat},${lng});
);
out center;
`;

const url = `https://overpass-api.de/api/interpreter`;

async function run() {
  try {
    const res = await fetch(url, {
      method: 'POST',
      body: "data=" + encodeURIComponent(query),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    const data = await res.json();
    console.log(`Overpass returned ${data.elements?.length || 0} stations.`);
    if (data.elements && data.elements.length > 0) {
      console.log(JSON.stringify(data.elements[0], null, 2));
    }
  } catch(e) { console.error(e) }
}
run();
