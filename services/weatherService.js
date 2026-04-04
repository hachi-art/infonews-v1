// ============================================================
// services/weatherService.js — Open-Meteo (gratuit, sans clé)
// Météo mondiale : 25 villes
// ============================================================
const axios = require('axios');

const CITIES = [
  // Europe
  { name: 'Barcelone',    lat: 41.3888,  lon: 2.1590,   flag: '🇪🇸' },
  { name: 'Paris',        lat: 48.8566,  lon: 2.3522,   flag: '🇫🇷' },
  { name: 'Londres',      lat: 51.5074,  lon: -0.1278,  flag: '🇬🇧' },
  { name: 'Berlin',       lat: 52.5200,  lon: 13.4050,  flag: '🇩🇪' },
  { name: 'Rome',         lat: 41.9028,  lon: 12.4964,  flag: '🇮🇹' },
  { name: 'Amsterdam',    lat: 52.3676,  lon: 4.9041,   flag: '🇳🇱' },
  { name: 'Madrid',       lat: 40.4168,  lon: -3.7038,  flag: '🇪🇸' },
  { name: 'Lisbonne',     lat: 38.7169,  lon: -9.1395,  flag: '🇵🇹' },
  // Amériques
  { name: 'New York',     lat: 40.7128,  lon: -74.0060, flag: '🇺🇸' },
  { name: 'Los Angeles',  lat: 34.0522,  lon: -118.2437,flag: '🇺🇸' },
  { name: 'Montréal',     lat: 45.5017,  lon: -73.5673, flag: '🇨🇦' },
  { name: 'São Paulo',    lat: -23.5505, lon: -46.6333, flag: '🇧🇷' },
  { name: 'Buenos Aires', lat: -34.6037, lon: -58.3816, flag: '🇦🇷' },
  { name: 'Mexico',       lat: 19.4326,  lon: -99.1332, flag: '🇲🇽' },
  // Asie / Océanie
  { name: 'Tokyo',        lat: 35.6762,  lon: 139.6503, flag: '🇯🇵' },
  { name: 'Pékin',        lat: 39.9042,  lon: 116.4074, flag: '🇨🇳' },
  { name: 'Mumbai',       lat: 19.0760,  lon: 72.8777,  flag: '🇮🇳' },
  { name: 'Séoul',        lat: 37.5665,  lon: 126.9780, flag: '🇰🇷' },
  { name: 'Singapour',    lat: 1.3521,   lon: 103.8198, flag: '🇸🇬' },
  { name: 'Sydney',       lat: -33.8688, lon: 151.2093, flag: '🇦🇺' },
  { name: 'Bangkok',      lat: 13.7563,  lon: 100.5018, flag: '🇹🇭' },
  // Afrique / Moyen-Orient
  { name: 'Dubai',        lat: 25.2048,  lon: 55.2708,  flag: '🇦🇪' },
  { name: 'Le Caire',     lat: 30.0444,  lon: 31.2357,  flag: '🇪🇬' },
  { name: 'Nairobi',      lat: -1.2921,  lon: 36.8219,  flag: '🇰🇪' },
  { name: 'Antananarivo', lat: -18.9137, lon: 47.5361,  flag: '🇲🇬' },
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
