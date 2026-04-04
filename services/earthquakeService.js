// ============================================================
// services/earthquakeService.js — Séismes via USGS (sans clé)
// API publique du US Geological Survey — temps réel
// Doc : https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php
// ============================================================

const axios = require('axios');

// Flux disponibles USGS (magnitude 4.5+ sur les 7 derniers jours)
const USGS_FEEDS = {
  significant_week: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_week.geojson',
  m45_day:          'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson',
  m25_day:          'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson'
};

/**
 * Récupère les séismes récents significatifs.
 * @param {number} limit - Nombre max de séismes (défaut : 8)
 * @returns {Promise<Array>} Séismes normalisés
 */
async function fetchEarthquakes(limit = 8) {
  // Essayer d'abord le feed "significant_week", sinon "m45_day"
  let data;
  for (const feedUrl of [USGS_FEEDS.significant_week, USGS_FEEDS.m45_day]) {
    try {
      const res = await axios.get(feedUrl, { timeout: 8000 });
      data = res.data;
      if (data.features?.length > 0) break;
    } catch (err) {
      console.warn(`[USGS] Feed inaccessible : ${feedUrl}`);
    }
  }

  if (!data?.features?.length) {
    console.warn('[USGS] Aucun séisme récupéré');
    return [];
  }

  const earthquakes = data.features
    .slice(0, limit)
    .map(f => {
      const p = f.properties;
      const coords = f.geometry?.coordinates || [];
      const mag = parseFloat((p.mag || 0).toFixed(1));

      return {
        id: f.id,
        magnitude: mag,
        place: p.place || 'Lieu inconnu',
        time: new Date(p.time).toISOString(),
        url: p.url || null,
        depth: coords[2] ? Math.round(coords[2]) : null,
        lat: coords[1] || null,
        lon: coords[0] || null,
        severity: mag >= 7 ? 'critical' : mag >= 6 ? 'high' : mag >= 5 ? 'medium' : 'low'
      };
    })
    .sort((a, b) => new Date(b.time) - new Date(a.time));

  console.log(`[USGS] ${earthquakes.length} séismes récupérés`);
  return earthquakes;
}

module.exports = { fetchEarthquakes };
