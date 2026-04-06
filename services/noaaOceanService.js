// ============================================================
// services/noaaOceanService.js — NOAA Ocean / Bouées maritimes (gratuit)
// Données bouées NOAA : températures, vagues, vents en mer
// API : https://www.ndbc.noaa.gov/
// ============================================================
const axios = require('axios');
const Parser = require('rss-parser');
const parser = new Parser({ timeout: 10000 });

// Bouées NOAA majeurs (Atlantic, Pacific, Med)
const BUOYS = [
  { id: '41048', name: 'Atlantic NE',  lat: 31.8,   lon: -69.6,  ocean: 'Atlantique Nord' },
  { id: '46059', name: 'Pacific NW',   lat: 37.9,   lon: -129.9, ocean: 'Pacifique Nord' },
  { id: '32012', name: 'South Pacific',lat: -19.3,  lon: -85.1,  ocean: 'Pacifique Sud' },
  { id: '41049', name: 'Atlantic SE',  lat: 27.5,   lon: -62.9,  ocean: 'Atlantique' },
  { id: '21004', name: 'Pacific W',    lat: 28.0,   lon: 135.0,  ocean: 'Pacifique Ouest' },
];

// Statistiques globales océans (données statiques enrichies)
const OCEAN_STATS = {
  coverage:    '70.9%',  // Couverture de la Terre
  volume:      '1.335 milliard km³',
  avgDepth:    '3 688 m',
  deepest:     'Fosse des Mariannes — 11 034 m',
  avgTemp:     '17°C',
  acidLevel:   'pH 8.1 (acidification +0.1 depuis 1850)',
  plasticTons: '8 Mt/an',
  species:     '230 000+ espèces connues',
};

async function fetchBuoyData(buoyId) {
  try {
    // NOAA NDBC realtime data (txt format)
    const r = await axios.get(`https://www.ndbc.noaa.gov/data/realtime2/${buoyId}.txt`, {
      timeout: 8000,
      responseType: 'text',
    });
    const lines = r.data.split('\n');
    const header = lines[0].split(/\s+/);
    const units  = lines[1].split(/\s+/);
    const data   = lines[2]?.split(/\s+/) || [];

    const idx = (name) => header.indexOf(name);
    return {
      id:        buoyId,
      buoy:      BUOYS.find(b => b.id === buoyId) || { name: buoyId },
      waveHeight: data[idx('WVHT')] !== 'MM' ? `${data[idx('WVHT')]} m` : null,
      wavePeriod: data[idx('DPD')]  !== 'MM' ? `${data[idx('DPD')]} s`  : null,
      windSpeed:  data[idx('WSPD')] !== 'MM' ? `${data[idx('WSPD')]} m/s` : null,
      waterTemp:  data[idx('WTMP')] !== 'MM' ? `${data[idx('WTMP')]} °C` : null,
      airTemp:    data[idx('ATMP')] !== 'MM' ? `${data[idx('ATMP')]} °C` : null,
      pressure:   data[idx('PRES')] !== 'MM' ? `${data[idx('PRES')]} hPa` : null,
      updatedAt:  new Date().toISOString(),
    };
  } catch (e) {
    console.warn(`[NOAA buoy ${buoyId}]`, e.message);
    return null;
  }
}

async function fetchAllBuoys() {
  const results = await Promise.allSettled(
    BUOYS.slice(0, 4).map(b => fetchBuoyData(b.id))
  );
  return results
    .filter(r => r.status === 'fulfilled' && r.value)
    .map(r => r.value);
}

async function fetchOceanStats() {
  return {
    stats: OCEAN_STATS,
    buoys: await fetchAllBuoys(),
    source: 'NOAA NDBC',
    updatedAt: new Date().toISOString(),
  };
}

module.exports = { fetchOceanStats, fetchAllBuoys, OCEAN_STATS, BUOYS };
