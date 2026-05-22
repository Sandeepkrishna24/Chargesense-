const query = `
[out:json][timeout:25];
area["ISO3166-1"="IN"][admin_level=2]->.india;
(
  node["amenity"="charging_station"](area.india);
);
out count;
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
    const text = await res.text();
    console.log(`Overpass returned: ` + text);
  } catch(e) { console.error(e) }
}
run();
