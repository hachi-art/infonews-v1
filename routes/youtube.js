// ============================================================
// routes/youtube.js — YouTube RSS (gratuit, sans clé)
// GET /api/youtube            → toutes chaînes
// GET /api/youtube?category=eco → filtré par catégorie
// GET /api/youtube/channels   → liste des chaînes disponibles
// ============================================================
const express = require('express');
const router  = express.Router();
const { fetchYouTubeNews, YT_CHANNELS } = require('../services/youtubeRssService');

router.get('/', async (req, res) => {
  try {
    const limit    = parseInt(req.query.limit) || 5;
    const category = req.query.category || null;
    const channelIds = category
      ? YT_CHANNELS.filter(c => c.category === category).map(c => c.id)
      : null;
    const data = await fetchYouTubeNews(channelIds, limit);
    // Sort by publishedAt desc
    data.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    res.json({ total: data.length, source: 'YouTube RSS', videos: data });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/channels', (req, res) => {
  res.json({ channels: YT_CHANNELS });
});

module.exports = router;
