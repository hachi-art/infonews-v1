// ============================================================
// services/weatherService.js — Open-Meteo (gratuit, sans clé)
// Météo mondiale : plusieurs villes
// ============================================================
const axios = require('axios');

const CITIES = [
  { name: 'Barcelone',    lat: 41.3888, lon: 2.1590,   flag: '🇪🇸' },
  { name: 'Paris',        lat: 48.8566, lon: 2.3522,   flag: '🇫🇷' },
  { name: 'New York',     lat: 40.7128, lon: -74.0060, flag: '🇺🇸' },
  { name: 'Tokyo',        lat: 35.6762, lon: 139.6503, flag: '🇯🇵' },
  { name: 'Londres',      lat: 51.5074, lon: -0.1278,  flag: '🇬🇧' },
  { name: 'Dubai',        lat: 25.2048, lon: 55.2708,  flag: '🇦🇪' },
  { name: 'São Paulo',    lat: -23.5505, lon: -46.6333, flag: '🇧🇷' },
  { name: 'Sydney',       lat: -33.8688, lon: 151.2093, flag: '🇦🇺' },
  { name: 'Nairobi',      lat: -1.2921, lon: 36.8219,  flag: '🇰🇪' },
  { name: 'Antananarivo', lat: -18.9137, lon: 47.5361, flag: '🇲🇬' },
];

const codeToDesc = (code) => {
  if (code === 0)  return { label: 'Ensoleillé',          icon: '☀️' };
  if (code <= 2)   return { label: 'Peu nuageux',         icon: '🌤️' };
  if (code <= 3)   return { label: 'Nuageux',             icon: '☁️' };
  if (code <= 48)  return { label: 'Brouillard',          icon: '🌫️' };
  if (code <= 57)  return { label: 'Bruine',              icon: '🌦️' };
  if (code <= 67)  return { label: 'Pluie',               icon: '🌧️' };
  if (code <= 77)  return { label: 'Neige',               icon: '❄️' };
  if (code <= 82)  return { label: 'Averses',             icon: '🌦️' };
  if (code <= 99)  return { label: 'Orage',               icon: '⛈️' };
  return { label: 'Inconnu', icon: '🌡️' };
};

async function fetchWeatherForCity(city) {
  const url = 'https://api.open-meteo.com/v1/forecast';
  const params = {
    latitude: city.lat,
    longitude: city.lon,
    current: 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,apparent_temperature',
    daily: 'temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum',
    timezone: 'auto',
    forecast_days: 5
  };
  const res = await axios.get(url, { params, timeout: 8000 });
  const c = res.data.current;
  const daily = res.data.daily;

  return {
    city: city.name,
    flag: city.flag,
    current: {
      temp: Math.round(c.temperature_2m),
      feelsLike: Math.round(c.apparent_temperature),
      humidity: c.relative_humidity_2m,
      wind: Math.round(c.wind_speed_10m),
      ...codeToDesc(c.weather_code)
    },
    forecast: daily.time.slice(0, 5).map((date, i) => ({
      date,
      max: Math.round(daily.temperature_2m_max[i]),
      min: Math.round(daily.temperature_2m_min[i]),
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
