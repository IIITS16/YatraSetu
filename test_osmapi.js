
const https = require("https");
const query = `[out:json];node["amenity"="restaurant"](around:2000, 26.9124, 75.7873);out body 5;`;
https.get("https://overpass-api.de/api/interpreter?data=" + encodeURIComponent(query), (res) => {
  let data = "";
  res.on("data", (chunk) => data += chunk);
  res.on("end", () => console.log(data));
});

