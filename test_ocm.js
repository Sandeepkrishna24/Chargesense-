const https = require('https');

const lat = 13.0827; // Chennai
const lng = 80.2707;
const url = `https://api.openchargemap.io/v3/poi?output=json&latitude=${lat}&longitude=${lng}&distance=50&distanceunit=KM&maxresults=50`;

https.get(url, {
  headers: {
    "User-Agent": "EV-Charge-Finder-App"
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const poi = JSON.parse(data);
    console.log(`Found ${poi.length} stations.`);
    if (poi.length > 0) {
      console.log(JSON.stringify(poi[0], null, 2));
    }
  });
}).on('error', err => {
  console.error(err);
});
