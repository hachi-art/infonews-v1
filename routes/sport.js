// ============================================================
// routes/sport.js — Sport en direct
// GET /api/sport/matches         → TheSportsDB toutes ligues
// GET /api/sport/matches/:league → matchs d'une ligue
// GET /api/sport/news            → BBC Sport + ESPN
// GET /api/sport/standings/:code → classement football-data.org
// ============================================================
const express  = require('express');
const router   = express.Router();
const { fetchAllLeagues, fetchRecentMatches, fetchUpcomingMatches, LEAGUES } = require('../services/theSportsDbService');
const { fetchStandings, fetchLiveScores, COMPETITIONS }                      = require('../services/footballDataService');
const { fetchBBCSportNews }                                                  = require('../services/bbcSportRss');
const { fetchESPNNews }                                                      = require('../services/espnRss');

// GET /api/sport/matches — toutes ligues (TheSportsDB, sans clé)
router.get('/matches', async (req, res) => {
  try {
    const data = await fetchAllLeagues();
    res.json({ total: data.length, leagues: data });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/sport/live — scores live (football-data.org si clé, sinon TheSportsDB)
router.get('/live', async (req, res) => {
  try {
    const data = await fetchLiveScores();
    res.json({ matches: data, timestamp: new Date().toISOString() });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/sport/standings/:code — classement ligue (ex: PL, FL1, PD)
router.get('/standings/:code', async (req, res) => {
  try {
    const data = await fetchStandings(req.params.code.toUpperCase());
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/sport/news — BBC Sport + ESPN agrégés
router.get('/news', async (req, res) => {
  try {
    const [bbcR, espnR] = await Promise.allSettled([
      fetchBBCSportNews(8),
      fetchESPNNews(8),
    ]);
    let articles = [];
    if (bbcR.status === 'fulfilled')  articles.push(...bbcR.value);
    if (espnR.status === 'fulfilled') articles.push(...espnR.value);
    articles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    res.json({ total: articles.length, articles });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/sport/leagues — liste des ligues disponibles
router.get('/leagues', (req, res) => {
  res.json({ leagues: LEAGUES, competitions: COMPETITIONS });
});

module.exports = router;
