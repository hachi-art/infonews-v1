// ============================================================
// routes/alerts.js — Routes alertes mondiales
// GET /api/alerts          → Séismes USGS significatifs
// GET /api/alerts/gdacs    → Alertes GDACS (catastrophes)
// GET /api/alerts/all      → USGS + GDACS combinés
// ============================================================

const express    = require('express');
const router     = express.Router();
const axios      = require('axios');
const { fetchGDACS }       = require('../services/gdacsService');
const { fetchEarthquakes } = require('../services/earthquakeService');

// GET /api/alerts — séismes USGS
router.get('/', async (req, res) => {
  try {
    const limit  = parseInt(req.query.limit) || 10;
    const quakes = await fetchEarthquakes(limit);
    res.json({ total: quakes.length, type: 'earthquakes', source: 'USGS', quakes });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/alerts/gdacs — catastrophes mondiales
router.get('/gdacs', async (req, res) => {
  try {
    const limit  = parseInt(req.query.limit) || 15;
    const alerts = await fetchGDACS(limit);
    res.json({ total: alerts.length, type: 'disasters', source: 'GDACS', alerts });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/alerts/all — USGS + GDACS
router.get('/all', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const [quakesR, gdacsR] = await Promise.allSettled([
      fetchEarthquakes(limit),
      fetchGDACS(limit),
    ]);
    res.json({
      fetchedAt:  new Date().toISOString(),
      earthquakes: quakesR.status === 'fulfilled' ? quakesR.value : [],
      disasters:   gdacsR.status === 'fulfilled'  ? gdacsR.value  : [],
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
