// ============================================================
// controllers/newsController.js — Logique métier des routes news
// Sources : BBC · Le Monde · NewsAPI · The Guardian · Al Jazeera
//           TechCrunch · HackerNews · Indépendants · DW · Euronews
// ============================================================

const bbcService          = require('../services/bbcRss');
const lemondeService      = require('../services/lemondeRss');
const newsApiService      = require('../services/newsApi');
const guardianService     = require('../services/guardianRss');
const alJazeeraService    = require('../services/alJazeeraRss');
const techCrunchService   = require('../services/techCrunchRss');
const hackerNewsService   = require('../services/hackerNewsService');
const independentService  = require('../services/independentRss');
const dwService           = require('../services/dwRss');
const euronewsService     = require('../services/euronewsRss');

const VALID_CATEGORIES = ['monde', 'techno', 'eco', 'science', 'sport', 'culture', 'independent'];
const VALID_SOURCES    = ['bbc', 'lemonde', 'newsapi', 'guardian', 'aljazeera', 'techcrunch', 'hackernews', 'independent', 'dw', 'euronews'];

// ── Mapping catégories brutes → catégories normalisées ──────
const CAT_MAP = {
  // EN
  'world':                 'monde',
  'world news':            'monde',
  'international':         'monde',
  'europe':                'monde',
  'asia':                  'monde',
  'africa':                'monde',
  'americas':              'monde',
  'middle east':           'monde',
  'us & canada':           'monde',
  'geopolitics':           'monde',
  'politics':              'monde',
  'uk':                    'monde',
  'uk politics':           'monde',
  'us politics':           'monde',
  'technology':            'techno',
  'tech':                  'techno',
  'science & environment': 'science',
  'science':               'science',
  'health':                'science',
  'environment':           'science',
  'business':              'eco',
  'economy':               'eco',
  'finance':               'eco',
  'markets':               'eco',
  'economics':             'eco',
  'sport':                 'sport',
  'sports':                'sport',
  'football':              'sport',
  'culture':               'culture',
  'entertainment & arts':  'culture',
  'entertainment':         'culture',
  'arts':                  'culture',
  'film':                  'culture',
  'music':                 'culture',
  // FR
  'monde':                 'monde',
  'international':         'monde',
  'economie':              'eco',
  'économie':              'eco',
  'technologie':           'techno',
  'sciences':              'science',
  'culture':               'culture',
  'sport':                 'sport',
};

function normalizeCategory(raw) {
  if (!raw) return 'monde';
  const lower = raw.toLowerCase().trim();
  return CAT_MAP[lower] || 'monde';
}

function normalizeArticle(article) {
  return {
    ...article,
    category: CAT_MAP[article.category] || article.category || 'monde',
    description: article.summary || article.description || '',
  };
}

function deduplicateArticles(articles) {
  const seen = new Set();
  return articles.filter(a => {
    const key = a.url || a.id;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * GET /api/news
 * ?category=monde|techno|eco|science|sport|culture|independent
 * ?source=bbc|lemonde|newsapi|guardian|aljazeera|techcrunch|hackernews|independent|dw|euronews
 * ?limit=80
 */
exports.getAllNews = async (req, res) => {
  const { category, source, limit = 80 } = req.query;
  const maxLimit = Math.min(parseInt(limit) || 80, 200);

  const fetcherMap = {
    bbc:         () => bbcService.fetchBBCNews('top'),
    lemonde:     () => lemondeService.fetchLemondeNews(),
    newsapi:     () => newsApiService.fetchNewsAPI({ pageSize: 15 }),
    guardian:    () => guardianService.fetchGuardianNews(VALID_CATEGORIES.includes(category) ? category : null),
    aljazeera:   () => alJazeeraService.fetchAlJazeeraNews(12),
    techcrunch:  () => techCrunchService.fetchTechCrunchNews(8),
    hackernews:  () => hackerNewsService.fetchHackerNews(10),
    independent: () => independentService.fetchIndependentNews(),
    dw:          () => dwService.fetchDWNews(8),
    euronews:    () => euronewsService.fetchEuronewsNews(8),
  };

  const fetchersToRun = source && VALID_SOURCES.includes(source)
    ? { [source]: fetcherMap[source] }
    : fetcherMap;

  const keys = Object.keys(fetchersToRun);
  const results = await Promise.allSettled(keys.map(k => fetchersToRun[k]()));

  let articles = [];
  results.forEach((r, i) => {
    if (r.status === 'fulfilled') articles.push(...r.value);
    else console.error(`[NewsController] Erreur ${keys[i]}: ${r.reason?.message}`);
  });

  // Normalisation des catégories + champ description
  articles = articles.map(normalizeArticle);

  // Filtrage par catégorie si demandé
  if (category && VALID_CATEGORIES.includes(category)) {
    articles = articles.filter(a => a.category === category);
  }

  const unique = deduplicateArticles(articles);
  unique.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

  res.json({
    total:     unique.length,
    fetchedAt: new Date().toISOString(),
    filters:   { category: category || null, source: source || null },
    articles:  unique.slice(0, maxLimit)
  });
};

exports.getBBCNews = async (req, res) => {
  try {
    const articles = await bbcService.fetchBBCNews();
    res.json({ total: articles.length, source: 'BBC', articles: articles.map(normalizeArticle) });
  } catch (err) {
    res.status(500).json({ error: 'Erreur BBC RSS', detail: err.message });
  }
};

exports.getLemondeNews = async (req, res) => {
  try {
    const articles = await lemondeService.fetchLemondeNews();
    res.json({ total: articles.length, source: 'Le Monde', articles: articles.map(normalizeArticle) });
  } catch (err) {
    res.status(500).json({ error: 'Erreur Le Monde RSS', detail: err.message });
  }
};

exports.getNewsAPI = async (req, res) => {
  try {
    const { q = 'world', lang = 'en', pageSize = 10 } = req.query;
    const articles = await newsApiService.fetchNewsAPI({ q, lang, pageSize: parseInt(pageSize) });
    res.json({ total: articles.length, source: 'NewsAPI', articles: articles.map(normalizeArticle) });
  } catch (err) {
    res.status(500).json({ error: 'Erreur NewsAPI', detail: err.message });
  }
};

exports.getGuardianNews = async (req, res) => {
  try {
    const { feed } = req.query;
    const articles = await guardianService.fetchGuardianNews(feed || null);
    res.json({ total: articles.length, source: 'The Guardian', articles: articles.map(normalizeArticle) });
  } catch (err) {
    res.status(500).json({ error: 'Erreur Guardian RSS', detail: err.message });
  }
};

exports.getAlJazeeraNews = async (req, res) => {
  try {
    const articles = await alJazeeraService.fetchAlJazeeraNews();
    res.json({ total: articles.length, source: 'Al Jazeera', articles: articles.map(normalizeArticle) });
  } catch (err) {
    res.status(500).json({ error: 'Erreur Al Jazeera RSS', detail: err.message });
  }
};

exports.getTechCrunchNews = async (req, res) => {
  try {
    const articles = await techCrunchService.fetchTechCrunchNews();
    res.json({ total: articles.length, source: 'TechCrunch', articles: articles.map(normalizeArticle) });
  } catch (err) {
    res.status(500).json({ error: 'Erreur TechCrunch RSS', detail: err.message });
  }
};

exports.getHackerNews = async (req, res) => {
  try {
    const articles = await hackerNewsService.fetchHackerNews();
    res.json({ total: articles.length, source: 'HackerNews', articles: articles.map(normalizeArticle) });
  } catch (err) {
    res.status(500).json({ error: 'Erreur HackerNews API', detail: err.message });
  }
};

exports.getDWNews = async (req, res) => {
  try {
    const articles = await dwService.fetchDWNews();
    res.json({ total: articles.length, source: 'DW', articles: articles.map(normalizeArticle) });
  } catch (err) {
    res.status(500).json({ error: 'Erreur DW RSS', detail: err.message });
  }
};

exports.getEuronewsNews = async (req, res) => {
  try {
    const articles = await euronewsService.fetchEuronewsNews();
    res.json({ total: articles.length, source: 'Euronews', articles: articles.map(normalizeArticle) });
  } catch (err) {
    res.status(500).json({ error: 'Erreur Euronews RSS', detail: err.message });
  }
};
