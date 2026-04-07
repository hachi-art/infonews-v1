// ============================================================
// routes/tech.js — Tech & Science & IA & Cybersécurité
// GET /api/tech/arxiv-ia     → ArXiv cs.AI + cs.LG
// GET /api/tech/arxiv-sci    → ArXiv physics + q-bio
// GET /api/tech/feargreed    → Fear & Greed crypto (alternative.me)
// GET /api/tech/cyber        → BleepingComputer + CISA RSS
// ============================================================
const express = require('express');
const router  = express.Router();
const axios   = require('axios');
const Parser  = require('rss-parser');
const rssParser = new Parser({ timeout: 10000, headers: { 'User-Agent': 'infonews.day/1.0' } });
const { fetchArxivIA, fetchArxivScience } = require('../services/arxivService');

// Route racine : /api/tech?q=<query>&limit=N — recherche RSS multi-sources
router.get('/', async (req, res) => {
  const q     = (req.query.q || '').toLowerCase();
  const limit = parseInt(req.query.limit) || 10;
  const FEEDS = [
    { url: 'https://www.techcrunch.com/feed/', source: 'TechCrunch' },
    { url: 'https://feeds.arstechnica.com/arstechnica/index', source: 'Ars Technica' },
    { url: 'https://www.wired.com/feed/rss', source: 'Wired' },
    { url: 'https://www.theguardian.com/technology/rss', source: 'Guardian Tech' },
  ];
  try {
    const results = await Promise.allSettled(FEEDS.map(f => rssParser.parseURL(f.url).then(feed => ({ feed, source: f.source }))));
    let articles = [];
    for (const r of results) {
      if (r.status !== 'fulfilled') continue;
      const { feed, source } = r.value;
      const items = feed.items
        .filter(i => !q || (i.title || '').toLowerCase().includes(q) || (i.contentSnippet || '').toLowerCase().includes(q))
        .slice(0, limit)
        .map(i => ({
          title:       i.title || '',
          url:         i.link  || '',
          description: (i.contentSnippet || '').slice(0, 200),
          publishedAt: i.pubDate || i.isoDate || '',
          source,
        }));
      articles.push(...items);
    }
    articles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    res.json({ total: articles.length, query: q, articles: articles.slice(0, limit) });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/arxiv-ia', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const data  = await fetchArxivIA(limit);
    res.json({ total: data.length, source: 'ArXiv — cs.AI / cs.LG', papers: data });
  } catch (e) { res.status(500).json({ error: 'Erreur ArXiv IA', detail: e.message }); }
});

router.get('/arxiv-sci', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const data  = await fetchArxivScience(limit);
    res.json({ total: data.length, source: 'ArXiv — Physics / q-bio', papers: data });
  } catch (e) { res.status(500).json({ error: 'Erreur ArXiv Science', detail: e.message }); }
});

router.get('/feargreed', async (req, res) => {
  try {
    const r = await axios.get('https://api.alternative.me/fng/?limit=7', { timeout: 8000 });
    const data = r.data?.data || [];
    res.json({
      source: 'Alternative.me Fear & Greed Index',
      current: data[0] || null,
      history: data.slice(0, 7),
    });
  } catch (e) { res.status(500).json({ error: 'Erreur Fear & Greed', detail: e.message }); }
});

router.get('/cyber', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 16;
    const [bcR, cisaR] = await Promise.allSettled([
      rssParser.parseURL('https://www.bleepingcomputer.com/feed/'),
      rssParser.parseURL('https://www.cisa.gov/news.xml'),
    ]);
    const mapItems = (feed, source) =>
      (feed?.items || []).slice(0, limit).map(i => ({
        title:       i.title,
        url:         i.link,
        summary:     (i.contentSnippet || '').slice(0, 200),
        publishedAt: i.pubDate || i.isoDate,
        source,
        category:    i.categories?.[0] || 'Cybersécurité',
      }));
    const articles = [
      ...(bcR.status   === 'fulfilled' ? mapItems(bcR.value,   'BleepingComputer') : []),
      ...(cisaR.status === 'fulfilled' ? mapItems(cisaR.value, 'CISA')             : []),
    ].sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)).slice(0, limit);
    res.json({ total: articles.length, sources: ['BleepingComputer','CISA'], articles });
  } catch (e) { res.status(500).json({ error: 'Erreur Cyber', detail: e.message }); }
});

module.exports = router;
