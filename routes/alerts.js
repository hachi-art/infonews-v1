const express = require('express');
const router = express.Router();
const axios = require('axios');

router.get('/', async (req, res) => {
  try {
    const r = await axios.get('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_week.geojson', { timeout: 8000 });
    const quakes = r.data.features.slice(0, 10).map(f => ({
      id: f.id,
      magnitude: f.properties.mag,
      place: f.properties.place,
      time: new Date(f.properties.time).toISOString(),
      url: f.properties.url,
      lat: f.geometry.coordinates[1],
      lon: f.geometry.coordinates[0]
    }));
    res.json({ total: quakes.length, quakes });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
