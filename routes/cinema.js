// ============================================================
// routes/cinema.js — Cinéma & Séries
// GET /api/cinema/now-playing  → TMDB films en salle
// GET /api/cinema/trending     → TMDB films tendances
// GET /api/cinema/series       → TMDB séries populaires
// GET /api/cinema/news         → Variety + Hollywood Reporter
// ============================================================
const express = require('express');
const router  = express.Router();
const { fetchNowPlaying, fetchTrendingMovies, fetchTrendingSeries } = require('../services/tmdbService');
const { fetchVarietyNews } = require('../services/varietyRss');

router.get('/now-playing', async (req, res) => {
  try {
    const lang  = req.query.lang || 'fr-FR';
    const limit = parseInt(req.query.limit) || 12;
    const data  = await fetchNowPlaying(lang, limit);
    res.json({ source: 'TMDB', ...data });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/trending', async (req, res) => {
  try {
    const lang  = req.query.lang || 'fr-FR';
    const limit = parseInt(req.query.limit) || 12;
    const data  = await fetchTrendingMovies(lang, limit);
    res.json({ source: 'TMDB', ...data });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/series', async (req, res) => {
  try {
    const lang  = req.query.lang || 'fr-FR';
    const limit = parseInt(req.query.limit) || 12;
    const data  = await fetchTrendingSeries(lang, limit);
    res.json({ source: 'TMDB', ...data });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/news', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const data  = await fetchVarietyNews(limit);
    res.json({ total: data.length, source: 'Variety + Hollywood Reporter', articles: data });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
