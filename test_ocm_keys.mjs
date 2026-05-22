const url = `https://api.openchargemap.io/v3/poi?output=json&latitude=13.0827&longitude=80.2707&distance=50&distanceunit=KM&maxresults=50`;

async function run() {
  const keys = ['null', 'undefined', '', 'test', 'demo', '12345678-1234-1234-1234-123456789012'];
  for (const key of keys) {
    try {
      console.log(`Testing key: ${key}`);
      const res = await fetch(url + `&key=${key}`, { headers: { "User-Agent": "EV-Charge-Finder-App" } });
      const text = await res.text();
      console.log(`Response start: ` + text.substring(0, 50));
      if (text.startsWith('[')) {
        console.log(`SUCCESS with key: ${key}`);
        return;
      }
    } catch(e) { console.error(e) }
  }
}
run();
