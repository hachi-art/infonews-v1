// ============================================================
// routes/trends.js — Wikipedia Trending Pages
// GET /api/trends           → FR par défaut
// GET /api/trends?geo=ES    → pays spécifique
// GET /api/trends/multi?geos=FR,EN,ES → multi-pays
// GET /api/trends/geos      → liste pays supportés
// ============================================================
const express = require('express');
const router  = express.Router();
const { fetchWikiTrending, fetchMultiGeoTrending, SUPPORTED_GEOS } = require('../services/wikiTrendingService');

router.get('/', async (req, res) => {
  try {
    const geo   = (req.query.geo || 'FR').toUpperCase();
    const limit = parseInt(req.query.limit) || 20;
    const data  = await fetchWikiTrending(geo, limit);
    res.json({
      total:  data.length,
      geo,
      source: 'Wikipedia Trending (Wikimedia API)',
      date:   data[0]?.publishedAt?.slice(0, 10) || new Date().toISOString().slice(0, 10),
      trends: data,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/multi', async (req, res) => {
  try {
    const geos  = req.query.geos
      ? req.query.geos.split(',').map(g => g.trim().toUpperCase())
      : ['FR', 'EN', 'ES'];
    const limit = parseInt(req.query.limit) || 10;
    const data  = await fetchMultiGeoTrending(geos, limit);
    res.json({
      total:  data.length,
      geos,
      source: 'Wikipedia Trending (Wikimedia API)',
      trends: data,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/geos', (req, res) => {
  res.json({ supported: SUPPORTED_GEOS });
});

module.exports = router;
