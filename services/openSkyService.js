// ============================================================
// services/openSkyService.js — OpenSky Network API
// Vols en direct (sans clé API pour les données publiques)
// Doc : https://openskynetwork.github.io/opensky-api/
// ============================================================
const axios = require('axios');

const OPENSKY_URL = 'https://openapi.opensky-network.org/api/states/all';

// Aéroports majeurs avec leurs bounding boxes [lat_min, lon_min, lat_max, lon_max]
const MAJOR_REGIONS = {
  europe:    { lamin: 36, lomin: -10, lamax: 71, lomax: 40  },
  north_am:  { lamin: 25, lomin:-130, lamax: 72, lomax: -60 },
  asia:      { lamin: 10, lomin:  60, lamax: 55, lomax: 145 },
};

/**
 * Récupère les aéronefs en vol dans une région
 * @param {string} region - 'europe' | 'north_am' | 'asia'
 * @param {number} limit
 */
async function fetchFlights(region = 'europe', limit = 20) {
  const bounds = MAJOR_REGIONS[region] || MAJOR_REGIONS.europe;
  try {
    const res = await axios.get(OPENSKY_URL, {
      params: bounds,
      timeout: 8000,
    });
    const states = res.data?.states || [];
    return states
      .filter(s => s[8] === false) // on_ground = false
      .slice(0, limit)
      .map(s => ({
        icao24:    s[0],
        callsign:  (s[1] || '').trim() || 'N/A',
        country:   s[2] || 'Inconnu',
        lat:       s[6],
        lon:       s[5],
        altitude:  s[7] ? Math.round(s[7]) : null,     // altitude géométrique (m)
        velocity:  s[9] ? Math.round(s[9] * 3.6) : null, // m/s → km/h
        heading:   s[10] ? Math.round(s[10]) : null,
        vertRate:  s[11],
        onGround:  s[8],
      }));
  } catch (e) {
    console.warn('[OpenSky]', e.message);
    return [];
  }
}

/**
 * Statistiques trafic global (nombre d'avions dans les 3 régions)
 */
async function fetchFlightStats() {
  try {
    const res = await axios.get(OPENSKY_URL, {
      params: { lamin: -90, lomin: -180, lamax: 90, lomax: 180 },
      timeout: 10000,
    });
    const all = res.data?.states || [];
    const flying = all.filter(s => s[8] === false);
    return {
      total:     all.length,
      inFlight:  flying.length,
      timestamp: new Date().toISOString(),
    };
  } catch (e) {
    console.warn('[OpenSky stats]', e.message);
    return { total: 0, inFlight: 0, timestamp: new Date().toISOString() };
  }
}

module.exports = { fetchFlights, fetchFlightStats };
