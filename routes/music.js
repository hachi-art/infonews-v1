// ============================================================
// routes/music.js — Musique & Charts
// GET /api/music/tracks      → Deezer Top 20 tracks
// GET /api/music/artists     → Deezer Top 20 artists
// GET /api/music/albums      → Deezer Top 10 albums
// GET /api/music/beatport    → Beatport RSS top genres
// GET /api/music/news        → Billboard + Pitchfork + NME
// ============================================================
const express  = require('express');
const router   = express.Router();
const { fetchDeezerTopTracks, fetchDeezerTopArtists, fetchDeezerTopAlbums } = require('../services/deezerService');
const { fetchAllBeatportCharts }  = require('../services/beatportRss');
const { fetchMusicNews }          = require('../services/billboardRss');

router.get('/tracks',  async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const data  = await fetchDeezerTopTracks(limit);
    res.json({ total: data.length, source: 'Deezer', tracks: data });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/artists', async (req, res) => {
  try {
    const data = await fetchDeezerTopArtists(parseInt(req.query.limit) || 20);
    res.json({ total: data.length, source: 'Deezer', artists: data });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/albums', async (req, res) => {
  try {
    const data = await fetchDeezerTopAlbums(parseInt(req.query.limit) || 10);
    res.json({ total: data.length, source: 'Deezer', albums: data });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/beatport', async (req, res) => {
  try {
    const data = await fetchAllBeatportCharts(parseInt(req.query.limit) || 5);
    res.json({ total: data.length, source: 'Beatport', tracks: data });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/news', async (req, res) => {
  try {
    const data = await fetchMusicNews(parseInt(req.query.limit) || 8);
    res.json({ total: data.length, articles: data });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
