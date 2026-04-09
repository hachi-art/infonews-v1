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

// Route racine : /api/society?source=imf|onu|wb|un|unicef...
router.get('/', async (req, res) => {
  const source = req.query.source || 'un';
  const limit  = parseInt(req.query.limit) || 8;
  const SOURCE_MAP = {
    imf:    'https://www.imf.org/en/News/rss?language=eng',
    fmi:    'https://www.imf.org/en/News/rss?language=eng',
    onu:    'https://news.un.org/feed/subscribe/en/news/all/rss.xml',
    un:     'https://news.un.org/feed/subscribe/en/news/all/rss.xml',
    wb:     'https://blogs.worldbank.org/en/rss.xml',
    unicef: 'https://www.unicef.org/press-releases/rss',
    fed:    'https://www.federalreserve.gov/feeds/press_all.xml',
    bce:    'https://www.ecb.europa.eu/rss/press.html',
    ocde:   'https://www.oecd.org/newsroom/rss.xml',
  };
  const url = SOURCE_MAP[source] || SOURCE_MAP['un'];
  try {
    const Parser = require('rss-parser');
    const p = new Parser({ timeout: 10000, headers: { 'User-Agent': 'infonews.day/1.0' } });
    const feed = await p.parseURL(url);
    const articles = feed.items.slice(0, limit).map(item => ({
      title:       item.title || '',
      url:         item.link  || '',
      description: item.contentSnippet || item.summary || '',
      publishedAt: item.pubDate || item.isoDate || '',
      source:      source.toUpperCase(),
      feed:        feed.title || source,
    }));
    res.json({ total: articles.length, source, articles });
  } catch(e) {
    res.status(500).json({ error: e.message, source });
  }
});

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
  try {
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
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
