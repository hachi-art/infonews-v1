// ============================================================
// services/weatherService.js — Open-Meteo (gratuit, sans clé)
// ============================================================
const axios = require('axios');

async function fetchWeather(lat = 41.3888, lon = 2.159, city = 'Barcelone') {
  const url = 'https://api.open-meteo.com/v1/forecast';
  const params = {
    latitude: lat,
    longitude: lon,
    current: 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,apparent_temperature',
    hourly: 'temperature_2m,weather_code',
    daily: 'temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum',
    timezone: 'Europe/Madrid',
    forecast_days: 5
  };

  const res = await axios.get(url, { params, timeout: 8000 });
  const c = res.data.current;
  const daily = res.data.daily;

  const codeToDesc = (code) => {
    if (code === 0) return { label: 'Ciel dégagé', icon: '☀️' };
    if (code <= 3) return { label: 'Partiellement nuageux', icon: '⛅' };
    if (code <= 48) return { label: 'Brouillard', icon: '🌫️' };
    if (code <= 67) return { label: 'Pluie', icon: '🌧️' };
    if (code <= 77) return { label: 'Neige', icon: '❄️' };
    if (code <= 82) return { label: 'Averses', icon: '🌦️' };
    if (code <= 99) return { label: 'Orage', icon: '⛈️' };
    return { label: 'Inconnu', icon: '🌡️' };
  };

  return {
    city,
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

module.exports = { fetchWeather };
