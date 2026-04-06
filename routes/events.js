// ============================================================
// routes/events.js — Agenda culturel & événements
// GET /api/events/onthisday   → Wikipedia "En ce jour"
// GET /api/events/upcoming    → Wikipedia événements à venir (mois courant)
// ============================================================

const express = require('express');
const router  = express.Router();
const axios   = require('axios');
const Parser  = require('rss-parser');
const parser  = new Parser({ timeout: 10000, headers: { 'User-Agent': 'infonews.day/1.0' } });

// GET /api/events/onthisday
router.get('/onthisday', async (req, res) => {
  try {
    const now   = new Date();
    const month = String(req.query.month || now.getMonth() + 1).padStart(2, '0');
    const day   = String(req.query.day   || now.getDate()).padStart(2, '0');
    const url   = `https://en.wikipedia.org/api/rest_v1/feed/onthisday/events/${month}/${day}`;
    const { data } = await axios.get(url, { timeout: 8000, headers: { 'User-Agent': 'infonews.day/1.0' } });
    const events = (data.events || []).slice(0, 12).map(e => ({
      year:  e.year,
      text:  e.text,
      url:   e.pages?.[0]?.content_urls?.desktop?.page || '',
      img:   e.pages?.[0]?.thumbnail?.source || null,
    }));
    res.json({ month, day, events });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/events/culture — Actualités culturelles via RSS publics
router.get('/culture', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 16;
    const FEEDS = [
      { url: 'https://www.theguardian.com/culture/rss',            label: 'The Guardian — Culture' },
      { url: 'https://www.lemonde.fr/culture/rss_full.xml',        label: 'Le Monde — Culture' },
      { url: 'https://pitchfork.com/rss/news/feed/r.xml',          label: 'Pitchfork' },
      { url: 'https://variety.com/feed/',                          label: 'Variety' },
    ];
    const results = await Promise.allSettled(FEEDS.map(f =>
      parser.parseURL(f.url).then(feed =>
        feed.items.slice(0, limit).map(i => ({
          title:       i.title,
          url:         i.link,
          summary:     (i.contentSnippet || '').slice(0, 180),
          publishedAt: i.pubDate || i.isoDate,
          source:      f.label,
        }))
      )
    ));
    const articles = results
      .filter(r => r.status === 'fulfilled')
      .flatMap(r => r.value)
      .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
      .slice(0, limit);
    res.json({ total: articles.length, articles });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
