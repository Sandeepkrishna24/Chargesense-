const lat = 13.0827; // Chennai
const lng = 80.2707;
const url = `https://api.openchargemap.io/v3/poi?output=json&latitude=${lat}&longitude=${lng}&distance=50&distanceunit=KM&maxresults=50`;

async function run() {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://map.openchargemap.io/",
        "Origin": "https://map.openchargemap.io"
      }
    });
    const text = await res.text();
    console.log(`Response start: ` + text.substring(0, 50));
    if (text.startsWith('[')) {
      console.log(`SUCCESS, found ${JSON.parse(text).length} stations`);
      return;
    }
  } catch(e) { console.error(e) }
}
run();
