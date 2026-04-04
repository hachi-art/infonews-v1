// ============================================================
// controllers/newsController.js — Logique métier des routes news
// Sources : BBC · Le Monde · NewsAPI · The Guardian · Al Jazeera · TechCrunch · HackerNews
// ============================================================

const bbcService       = require('../services/bbcRss');
const lemondeService   = require('../services/lemondeRss');
const newsApiService   = require('../services/newsApi');
const guardianService  = require('../services/guardianRss');
const alJazeeraService = require('../services/alJazeeraRss');
const techCrunchService = require('../services/techCrunchRss');
const hackerNewsService = require('../services/hackerNewsService');

// Mapping de catégories normalisées
const VALID_CATEGORIES = ['monde', 'techno', 'eco', 'science', 'sport', 'culture'];
const VALID_SOURCES    = ['bbc', 'lemonde', 'newsapi', 'guardian', 'aljazeera', 'techcrunch', 'hackernews'];

/**
 * Dédoublonne par URL (plus fiable que le titre).
 */
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
 * Query params :
 *   ?category=monde|techno|eco|science|sport|culture
 *   ?source=bbc|lemonde|newsapi|guardian|aljazeera|techcrunch|hackernews
 *   ?limit=50
 */
exports.getAllNews = async (req, res) => {
  const { category, source, limit = 80 } = req.query;
  const maxLimit = Math.min(parseInt(limit) || 80, 200);

  // Sélectionner les fetchers selon filtres
  const fetcherMap = {
    bbc:        () => bbcService.fetchBBCNews('top'),
    lemonde:    () => lemondeService.fetchLemondeNews(),
    newsapi:    () => newsApiService.fetchNewsAPI({ pageSize: 15 }),
    guardian:   () => guardianService.fetchGuardianNews(VALID_CATEGORIES.includes(category) ? category : null),
    aljazeera:  () => alJazeeraService.fetchAlJazeeraNews(12),
    techcrunch: () => techCrunchService.fetchTechCrunchNews(8),
    hackernews: () => hackerNewsService.fetchHackerNews(10)
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

  // Filtrage par catégorie si demandé
  if (category && VALID_CATEGORIES.includes(category)) {
    articles = articles.filter(a => a.category === category);
  }

  // Déduplication + tri chronologique
  const unique = deduplicateArticles(articles);
  unique.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

  res.json({
    total: unique.length,
    fetchedAt: new Date().toISOString(),
    filters: { category: category || null, source: source || null },
    articles: unique.slice(0, maxLimit)
  });
};

/**
 * GET /api/news/bbc
 */
exports.getBBCNews = async (req, res) => {
  try {
    const articles = await bbcService.fetchBBCNews();
    res.json({ total: articles.length, source: 'BBC', articles });
  } catch (err) {
    res.status(500).json({ error: 'Erreur BBC RSS', detail: err.message });
  }
};

/**
 * GET /api/news/lemonde
 */
exports.getLemondeNews = async (req, res) => {
  try {
    const articles = await lemondeService.fetchLemondeNews();
    res.json({ total: articles.length, source: 'Le Monde', articles });
  } catch (err) {
    res.status(500).json({ error: 'Erreur Le Monde RSS', detail: err.message });
  }
};

/**
 * GET /api/news/newsapi?q=france&lang=fr&pageSize=10
 */
exports.getNewsAPI = async (req, res) => {
  try {
    const { q = 'world', lang = 'en', pageSize = 10 } = req.query;
    const articles = await newsApiService.fetchNewsAPI({ q, lang, pageSize: parseInt(pageSize) });
    res.json({ total: articles.length, source: 'NewsAPI', articles });
  } catch (err) {
    res.status(500).json({ error: 'Erreur NewsAPI', detail: err.message });
  }
};

/**
 * GET /api/news/guardian?feed=techno
 */
exports.getGuardianNews = async (req, res) => {
  try {
    const { feed } = req.query;
    const articles = await guardianService.fetchGuardianNews(feed || null);
    res.json({ total: articles.length, source: 'The Guardian', articles });
  } catch (err) {
    res.status(500).json({ error: 'Erreur Guardian RSS', detail: err.message });
  }
};

/**
 * GET /api/news/aljazeera
 */
exports.getAlJazeeraNews = async (req, res) => {
  try {
    const articles = await alJazeeraService.fetchAlJazeeraNews();
    res.json({ total: articles.length, source: 'Al Jazeera', articles });
  } catch (err) {
    res.status(500).json({ error: 'Erreur Al Jazeera RSS', detail: err.message });
  }
};

/**
 * GET /api/news/techcrunch
 */
exports.getTechCrunchNews = async (req, res) => {
  try {
    const articles = await techCrunchService.fetchTechCrunchNews();
    res.json({ total: articles.length, source: 'TechCrunch', articles });
  } catch (err) {
    res.status(500).json({ error: 'Erreur TechCrunch RSS', detail: err.message });
  }
};

/**
 * GET /api/news/hackernews
 */
exports.getHackerNews = async (req, res) => {
  try {
    const articles = await hackerNewsService.fetchHackerNews();
    res.json({ total: articles.length, source: 'HackerNews', articles });
  } catch (err) {
    res.status(500).json({ error: 'Erreur HackerNews API', detail: err.message });
  }
};
