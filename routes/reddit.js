// ============================================================
// routes/reddit.js — Reddit RSS feeds (server-side)
// GET /api/reddit            → top posts worldnews
// GET /api/reddit?sub=europe → subreddit spécifique
// GET /api/reddit/multi      → top posts des 3 principaux subs mélangés
// GET /api/reddit/subs       → liste des subreddits disponibles
// ============================================================

const express = require('express');
const router  = express.Router();
const { fetchSubreddit, fetchMulti, SUBREDDITS } = require('../services/redditService');

router.get('/', async (req, res) => {
  try {
    const sub   = req.query.sub || 'worldnews';
    const limit = parseInt(req.query.limit) || 15;
    const data  = await fetchSubreddit(sub, limit);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/multi', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const posts = await fetchMulti(limit);
    res.json({ total: posts.length, posts });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/subs', (req, res) => {
  res.json({ subreddits: SUBREDDITS.map(s => ({ id: s.id, label: s.label })) });
});

module.exports = router;
