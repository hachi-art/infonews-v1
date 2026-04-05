// ============================================================
// routes/trends.js — Google Trends RSS (gratuit, sans clé)
// GET /api/trends           → FR par défaut
// GET /api/trends?geos=FR,ES,GB,US → multi-pays
// ============================================================
const express = require('express');
const router  = express.Router();
const { fetchGoogleTrends, fetchMultiGeoTrends, SUPPORTED_GEOS } = require('../services/googleTrendsService');

router.get('/', async (req, res) => {
  try {
    const geo   = (req.query.geo || 'FR').toUpperCase();
    const limit = parseInt(req.query.limit) || 20;
    const data  = await fetchGoogleTrends(geo, limit);
    res.json({ total: data.length, geo, source: 'Google Trends', trends: data });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/multi', async (req, res) => {
  try {
    const geos  = req.query.geos ? req.query.geos.split(',').map(g => g.trim().toUpperCase()) : ['FR', 'ES', 'GB'];
    const limit = parseInt(req.query.limit) || 10;
    const data  = await fetchMultiGeoTrends(geos, limit);
    res.json({ total: data.length, geos, source: 'Google Trends', trends: data });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/geos', (req, res) => {
  res.json({ supported: SUPPORTED_GEOS });
});

module.exports = router;
