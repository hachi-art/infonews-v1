// ============================================================
// routes/society.js — Santé, Droits humains, Environnement, Alertes
// GET /api/society/rights       → Amnesty + HRW + UNHCR
// GET /api/society/environment  → Greenpeace + UNEP
// GET /api/society/health       → WHO
// GET /api/society/orgs         → Toutes les orgs (pour s-orgs)
// GET /api/society/org/:id      → Org spécifique
// GET /api/society/alerts       → USGS + GDACS
// ============================================================

const express = require('express');
const router  = express.Router();
const {
  fetchRightsNews, fetchEnvironmentNews,
  fetchHealthNews, fetchAllOrgs, fetchFeed,
} = require('../services/societyRssService');
const { fetchEarthquakes } = require('../services/earthquakeService');
const { fetchGDACS }       = require('../services/gdacsService');

router.get('/rights', async (req, res) => {
  try {
    const limit    = parseInt(req.query.limit) || 16;
    const articles = await fetchRightsNews(limit);
    res.json({ total: articles.length, sources: ['Amnesty International','Human Rights Watch','UNHCR'], articles });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/environment', async (req, res) => {
  try {
    const limit    = parseInt(req.query.limit) || 16;
    const articles = await fetchEnvironmentNews(limit);
    res.json({ total: articles.length, sources: ['Greenpeace','UNEP'], articles });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/health', async (req, res) => {
  try {
    const limit    = parseInt(req.query.limit) || 16;
    const articles = await fetchHealthNews(limit);
    res.json({ total: articles.length, source: 'WHO', articles });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/orgs', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 4;
    const orgs  = await fetchAllOrgs(limit);
    res.json({ fetchedAt: new Date().toISOString(), orgs });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/org/:id', async (req, res) => {
  try {
    const limit    = parseInt(req.query.limit) || 5;
    const articles = await fetchFeed(req.params.id, limit);
    res.json({ org: req.params.id, total: articles.length, articles });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/alerts', async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const [quakesR, gdacsR] = await Promise.allSettled([
    fetchEarthquakes(limit),
    fetchGDACS(limit),
  ]);
  res.json({
    fetchedAt:   new Date().toISOString(),
    earthquakes: quakesR.status === 'fulfilled' ? quakesR.value : [],
    disasters:   gdacsR.status === 'fulfilled'  ? gdacsR.value  : [],
  });
});

module.exports = router;
