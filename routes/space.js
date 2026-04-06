// ============================================================
// routes/space.js — NASA APOD + Launch Library + ArXiv Espace
// GET /api/space/apod       → NASA Astronomy Picture of the Day
// GET /api/space/launches   → Prochains lancements (Launch Library 2)
// GET /api/space/previous   → Derniers lancements
// GET /api/space/arxiv      → ArXiv astrophysique
// GET /api/space/ocean      → NOAA océans + bouées
// ============================================================
const express = require('express');
const router  = express.Router();
const { fetchAPOD }                           = require('../services/nasaApodService');
const { fetchUpcomingLaunches, fetchPreviousLaunches } = require('../services/launchLibraryService');
const { fetchArxivSpace }                     = require('../services/arxivService');
const { fetchOceanStats }                     = require('../services/noaaOceanService');

router.get('/apod', async (req, res) => {
  try {
    const data = await fetchAPOD();
    res.json(data);
  } catch (e) { res.status(500).json({ error: 'Erreur NASA APOD', detail: e.message }); }
});

router.get('/launches', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;
    const data  = await fetchUpcomingLaunches(limit);
    res.json({ total: data.length, source: 'Launch Library 2', launches: data });
  } catch (e) { res.status(500).json({ error: 'Erreur Launch Library', detail: e.message }); }
});

router.get('/previous', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const data  = await fetchPreviousLaunches(limit);
    res.json({ total: data.length, source: 'Launch Library 2', launches: data });
  } catch (e) { res.status(500).json({ error: 'Erreur Launch Library', detail: e.message }); }
});

router.get('/arxiv', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const data  = await fetchArxivSpace(limit);
    res.json({ total: data.length, source: 'ArXiv — Astrophysique', papers: data });
  } catch (e) { res.status(500).json({ error: 'Erreur ArXiv', detail: e.message }); }
});

router.get('/ocean', async (req, res) => {
  try {
    const data = await fetchOceanStats();
    res.json(data);
  } catch (e) { res.status(500).json({ error: 'Erreur NOAA Ocean', detail: e.message }); }
});

module.exports = router;
