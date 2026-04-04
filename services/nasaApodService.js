// ============================================================
// services/nasaApodService.js — NASA Astronomy Picture of the Day
// Clé API : NASA_API_KEY (optionnel — DEMO_KEY sinon, 30 req/h)
// ============================================================
const axios = require('axios');

async function fetchAPOD() {
  const apiKey = process.env.NASA_API_KEY || 'DEMO_KEY';
  const url = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}`;
  const res = await axios.get(url, { timeout: 10000 });
  return res.data;
}

module.exports = { fetchAPOD };
