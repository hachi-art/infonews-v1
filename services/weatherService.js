// ============================================================
// services/weatherService.js — Open-Meteo (gratuit, sans clé)
// Météo mondiale : 25 villes
// ============================================================
const axios = require('axios');

const CITIES = [
  // ── Europe ───────────────────────────────────────
  { name: 'Barcelone',    lat: 41.3888,  lon: 2.1590,    flag: '🇪🇸', region: 'Europe' },
  { name: 'Paris',        lat: 48.8566,  lon: 2.3522,    flag: '🇫🇷', region: 'Europe' },
  { name: 'Londres',      lat: 51.5074,  lon: -0.1278,   flag: '🇬🇧', region: 'Europe' },
  { name: 'Berlin',       lat: 52.5200,  lon: 13.4050,   flag: '🇩🇪', region: 'Europe' },
  { name: 'Rome',         lat: 41.9028,  lon: 12.4964,   flag: '🇮🇹', region: 'Europe' },
  { name: 'Madrid',       lat: 40.4168,  lon: -3.7038,   flag: '🇪🇸', region: 'Europe' },
  { name: 'Amsterdam',    lat: 52.3676,  lon: 4.9041,    flag: '🇳🇱', region: 'Europe' },
  { name: 'Bruxelles',    lat: 50.8503,  lon: 4.3517,    flag: '🇧🇪', region: 'Europe' },
  { name: 'Lisbonne',     lat: 38.7169,  lon: -9.1395,   flag: '🇵🇹', region: 'Europe' },
  { name: 'Vienne',       lat: 48.2082,  lon: 16.3738,   flag: '🇦🇹', region: 'Europe' },
  { name: 'Zurich',       lat: 47.3769,  lon: 8.5417,    flag: '🇨🇭', region: 'Europe' },
  { name: 'Stockholm',    lat: 59.3293,  lon: 18.0686,   flag: '🇸🇪', region: 'Europe' },
  { name: 'Oslo',         lat: 59.9139,  lon: 10.7522,   flag: '🇳🇴', region: 'Europe' },
  { name: 'Helsinki',     lat: 60.1699,  lon: 24.9384,   flag: '🇫🇮', region: 'Europe' },
  { name: 'Prague',       lat: 50.0755,  lon: 14.4378,   flag: '🇨🇿', region: 'Europe' },
  { name: 'Varsovie',     lat: 52.2297,  lon: 21.0122,   flag: '🇵🇱', region: 'Europe' },
  { name: 'Budapest',     lat: 47.4979,  lon: 19.0402,   flag: '🇭🇺', region: 'Europe' },
  { name: 'Athènes',      lat: 37.9838,  lon: 23.7275,   flag: '🇬🇷', region: 'Europe' },
  { name: 'Istanbul',     lat: 41.0082,  lon: 28.9784,   flag: '🇹🇷', region: 'Europe' },
  { name: 'Moscou',       lat: 55.7558,  lon: 37.6173,   flag: '🇷🇺', region: 'Europe' },
  { name: 'Kiev',         lat: 50.4501,  lon: 30.5234,   flag: '🇺🇦', region: 'Europe' },
  // ── Amériques ────────────────────────────────────
  { name: 'New York',     lat: 40.7128,  lon: -74.0060,  flag: '🇺🇸', region: 'Amériques' },
  { name: 'Los Angeles',  lat: 34.0522,  lon: -118.2437, flag: '🇺🇸', region: 'Amériques' },
  { name: 'Chicago',      lat: 41.8781,  lon: -87.6298,  flag: '🇺🇸', region: 'Amériques' },
  { name: 'Miami',        lat: 25.7617,  lon: -80.1918,  flag: '🇺🇸', region: 'Amériques' },
  { name: 'Montréal',     lat: 45.5017,  lon: -73.5673,  flag: '🇨🇦', region: 'Amériques' },
  { name: 'Vancouver',    lat: 49.2827,  lon: -123.1207, flag: '🇨🇦', region: 'Amériques' },
  { name: 'Mexico',       lat: 19.4326,  lon: -99.1332,  flag: '🇲🇽', region: 'Amériques' },
  { name: 'São Paulo',    lat: -23.5505, lon: -46.6333,  flag: '🇧🇷', region: 'Amériques' },
  { name: 'Rio',          lat: -22.9068, lon: -43.1729,  flag: '🇧🇷', region: 'Amériques' },
  { name: 'Buenos Aires', lat: -34.6037, lon: -58.3816,  flag: '🇦🇷', region: 'Amériques' },
  { name: 'Bogotá',       lat: 4.7110,   lon: -74.0721,  flag: '🇨🇴', region: 'Amériques' },
  { name: 'Lima',         lat: -12.0464, lon: -77.0428,  flag: '🇵🇪', region: 'Amériques' },
  { name: 'Santiago',     lat: -33.4489, lon: -70.6693,  flag: '🇨🇱', region: 'Amériques' },
  // ── Asie / Océanie ───────────────────────────────
  { name: 'Tokyo',        lat: 35.6762,  lon: 139.6503,  flag: '🇯🇵', region: 'Asie' },
  { name: 'Séoul',        lat: 37.5665,  lon: 126.9780,  flag: '🇰🇷', region: 'Asie' },
  { name: 'Pékin',        lat: 39.9042,  lon: 116.4074,  flag: '🇨🇳', region: 'Asie' },
  { name: 'Shanghai',     lat: 31.2304,  lon: 121.4737,  flag: '🇨🇳', region: 'Asie' },
  { name: 'Hong Kong',    lat: 22.3193,  lon: 114.1694,  flag: '🇭🇰', region: 'Asie' },
  { name: 'Taipei',       lat: 25.0330,  lon: 121.5654,  flag: '🇹🇼', region: 'Asie' },
  { name: 'Singapour',    lat: 1.3521,   lon: 103.8198,  flag: '🇸🇬', region: 'Asie' },
  { name: 'Bangkok',      lat: 13.7563,  lon: 100.5018,  flag: '🇹🇭', region: 'Asie' },
  { name: 'Jakarta',      lat: -6.2088,  lon: 106.8456,  flag: '🇮🇩', region: 'Asie' },
  { name: 'Manila',       lat: 14.5995,  lon: 120.9842,  flag: '🇵🇭', region: 'Asie' },
  { name: 'Mumbai',       lat: 19.0760,  lon: 72.8777,   flag: '🇮🇳', region: 'Asie' },
  { name: 'Delhi',        lat: 28.6139,  lon: 77.2090,   flag: '🇮🇳', region: 'Asie' },
  { name: 'Karachi',      lat: 24.8607,  lon: 67.0011,   flag: '🇵🇰', region: 'Asie' },
  { name: 'Dacca',        lat: 23.8103,  lon: 90.4125,   flag: '🇧🇩', region: 'Asie' },
  { name: 'Sydney',       lat: -33.8688, lon: 151.2093,  flag: '🇦🇺', region: 'Asie' },
  { name: 'Melbourne',    lat: -37.8136, lon: 144.9631,  flag: '🇦🇺', region: 'Asie' },
  { name: 'Auckland',     lat: -36.8485, lon: 174.7633,  flag: '🇳🇿', region: 'Asie' },
  // ── Moyen-Orient ─────────────────────────────────
  { name: 'Dubai',        lat: 25.2048,  lon: 55.2708,   flag: '🇦🇪', region: 'Moyen-Orient' },
  { name: 'Riyad',        lat: 24.6877,  lon: 46.7219,   flag: '🇸🇦', region: 'Moyen-Orient' },
  { name: 'Tel Aviv',     lat: 32.0853,  lon: 34.7818,   flag: '🇮🇱', region: 'Moyen-Orient' },
  { name: 'Téhéran',      lat: 35.6892,  lon: 51.3890,   flag: '🇮🇷', region: 'Moyen-Orient' },
  { name: 'Bagdad',       lat: 33.3152,  lon: 44.3661,   flag: '🇮🇶', region: 'Moyen-Orient' },
  { name: 'Beyrouth',     lat: 33.8938,  lon: 35.5018,   flag: '🇱🇧', region: 'Moyen-Orient' },
  { name: 'Doha',         lat: 25.2854,  lon: 51.5310,   flag: '🇶🇦', region: 'Moyen-Orient' },
  { name: 'Koweït',       lat: 29.3759,  lon: 47.9774,   flag: '🇰🇼', region: 'Moyen-Orient' },
  // ── Afrique ──────────────────────────────────────
  { name: 'Le Caire',     lat: 30.0444,  lon: 31.2357,   flag: '🇪🇬', region: 'Afrique' },
  { name: 'Lagos',        lat: 6.5244,   lon: 3.3792,    flag: '🇳🇬', region: 'Afrique' },
  { name: 'Kinshasa',     lat: -4.3217,  lon: 15.3222,   flag: '🇨🇩', region: 'Afrique' },
  { name: 'Nairobi',      lat: -1.2921,  lon: 36.8219,   flag: '🇰🇪', region: 'Afrique' },
  { name: 'Johannesburg', lat: -26.2041, lon: 28.0473,   flag: '🇿🇦', region: 'Afrique' },
  { name: 'Le Cap',       lat: -33.9249, lon: 18.4241,   flag: '🇿🇦', region: 'Afrique' },
  { name: 'Casablanca',   lat: 33.5731,  lon: -7.5898,   flag: '🇲🇦', region: 'Afrique' },
  { name: 'Tunis',        lat: 36.8065,  lon: 10.1815,   flag: '🇹🇳', region: 'Afrique' },
  { name: 'Alger',        lat: 36.7538,  lon: 3.0588,    flag: '🇩🇿', region: 'Afrique' },
  { name: 'Accra',        lat: 5.6037,   lon: -0.1870,   flag: '🇬🇭', region: 'Afrique' },
  { name: 'Addis-Abeba',  lat: 9.0320,   lon: 38.7469,   flag: '🇪🇹', region: 'Afrique' },
  { name: 'Antananarivo', lat: -18.9137, lon: 47.5361,   flag: '🇲🇬', region: 'Afrique' },
  { name: 'Dakar',        lat: 14.7167,  lon: -17.4677,  flag: '🇸🇳', region: 'Afrique' },
  { name: 'Abidjan',      lat: 5.3544,   lon: -4.0020,   flag: '🇨🇮', region: 'Afrique' },
];

const codeToDesc = (code) => {
  if (code === 0)  return { label: 'Ensoleillé',   icon: '☀️' };
  if (code <= 2)   return { label: 'Peu nuageux',  icon: '🌤️' };
  if (code <= 3)   return { label: 'Nuageux',      icon: '☁️' };
  if (code <= 48)  return { label: 'Brouillard',   icon: '🌫️' };
  if (code <= 57)  return { label: 'Bruine',       icon: '🌦️' };
  if (code <= 67)  return { label: 'Pluie',        icon: '🌧️' };
  if (code <= 77)  return { label: 'Neige',        icon: '❄️' };
  if (code <= 82)  return { label: 'Averses',      icon: '🌦️' };
  if (code <= 99)  return { label: 'Orage',        icon: '⛈️' };
  return { label: 'Inconnu', icon: '🌡️' };
};

async function fetchWeatherForCity(city) {
  const url = 'https://api.open-meteo.com/v1/forecast';
  const params = {
    latitude:  city.lat,
    longitude: city.lon,
    current:   'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,apparent_temperature',
    daily:     'temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum',
    timezone:  'auto',
    forecast_days: 5
  };
  const res = await axios.get(url, { params, timeout: 8000 });
  const c = res.data.current;
  const daily = res.data.daily;

  return {
    city:    city.name,
    flag:    city.flag,
    current: {
      temp:      Math.round(c.temperature_2m),
      feelsLike: Math.round(c.apparent_temperature),
      humidity:  c.relative_humidity_2m,
      wind:      Math.round(c.wind_speed_10m),
      ...codeToDesc(c.weather_code)
    },
    forecast: daily.time.slice(0, 5).map((date, i) => ({
      date,
      max:    Math.round(daily.temperature_2m_max[i]),
      min:    Math.round(daily.temperature_2m_min[i]),
      precip: daily.precipitation_sum[i],
      ...codeToDesc(daily.weather_code[i])
    }))
  };
}

async function fetchWeather() {
  const results = await Promise.allSettled(CITIES.map(fetchWeatherForCity));
  return results
    .filter(r => r.status === 'fulfilled')
    .map(r => r.value);
}

module.exports = { fetchWeather };
