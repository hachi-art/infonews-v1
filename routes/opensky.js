// ============================================================
// routes/opensky.js — Trafic aérien OpenSky Network
// GET /api/opensky/flights?region=europe
// GET /api/opensky/stats
// ============================================================

const express  = require('express');
const router   = express.Router();
const { fetchFlights, fetchFlightStats } = require('../services/openSkyService');

// GET /api/opensky/flights?region=europe|north_am|asia
router.get('/flights', async (req, res) => {
  const { region = 'europe', limit = 20 } = req.query;
  try {
    const flights = await fetchFlights(region, parseInt(limit));
    res.json({ total: flights.length, region, flights });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/opensky/stats — nombre d'avions en vol mondial
router.get('/stats', async (req, res) => {
  try {
    const stats = await fetchFlightStats();
    res.json(stats);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
