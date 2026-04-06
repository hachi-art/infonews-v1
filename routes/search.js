// ============================================================
// routes/search.js — Recherche globale multi-sources
// GET /api/search?q=QUERY&limit=20
// Cherche dans : news actives (top sources), tendances, ArXiv, podcasts
// ============================================================

const express = require('express');
const router  = express.Router();
const Parser  = require('rss-parser');
const parser  = new Parser({ timeout: 8000, headers: { 'User-Agent': 'infonews.day/1.0' } });

// Sources RSS à interroger pour la recherche
const SEARCH_FEEDS = [
  { url: 'https://feeds.bbci.co.uk/news/rss.xml',                           source: 'BBC' },
  { url: 'https://www.theguardian.com/world/rss',                           source: 'The Guardian' },
  { url: 'https://feeds.reuters.com/reuters/topNews',                       source: 'Reuters' },
  { url: 'https://www.lemonde.fr/rss/une.xml',                              source: 'Le Monde' },
  { url: 'https://www.aljazeera.com/xml/rss/all.xml',                       source: 'Al Jazeera' },
  { url: 'https://techcrunch.com/feed/',                                    source: 'TechCrunch' },
  { url: 'https://www.who.int/rss-feeds/news-english.xml',                  source: 'WHO' },
  { url: 'https://www.amnesty.org/en/latest/news/feed/',                    source: 'Amnesty' },
  { url: 'https://www.greenpeace.org/international/feed/',                  source: 'Greenpeace' },
  { url: 'https://www.bleepingcomputer.com/feed/',                          source: 'BleepingComputer' },
  { url: 'https://rss.arxiv.org/rss/cs.AI',                                 source: 'ArXiv AI' },
];

router.get('/', async (req, res) => {
  try {
    const q     = (req.query.q || '').toLowerCase().trim();
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);

    if (!q || q.length < 2) {
      return res.status(400).json({ error: 'Requête trop courte (min 2 caractères)' });
    }

    const terms = q.split(/\s+/).filter(Boolean);

    const results = await Promise.allSettled(
      SEARCH_FEEDS.map(f =>
        parser.parseURL(f.url).then(feed =>
          feed.items
            .filter(item => {
              const haystack = `${item.title} ${item.contentSnippet || item.content || ''}`.toLowerCase();
              return terms.every(t => haystack.includes(t));
            })
            .slice(0, 5)
            .map(item => ({
              title:       item.title,
              url:         item.link,
              summary:     (item.contentSnippet || '').slice(0, 200),
              publishedAt: item.pubDate || item.isoDate,
              source:      f.source,
            }))
        )
      )
    );

    const articles = results
      .filter(r => r.status === 'fulfilled')
      .flatMap(r => r.value)
      .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
      .slice(0, limit);

    res.json({
      query:   q,
      total:   articles.length,
      sources: SEARCH_FEEDS.length,
      articles,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
