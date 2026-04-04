// ============================================================
// controllers/newsController.js — Logique métier des routes
// ============================================================

const bbcService = require('../services/bbcRss');
const lemondeService = require('../services/lemondeRss');
const newsApiService = require('../services/newsApi');

/**
 * Agrège et dédoublonne un tableau d'articles.
 * Critère de déduplication : même titre (insensible à la casse).
 */
function deduplicateArticles(articles) {
  const seen = new Set();
  return articles.filter(article => {
    const key = article.title.toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * GET /api/news
 * Retourne toutes les sources fusionnées, dédoublonnées et triées par date décroissante.
 */
exports.getAllNews = async (req, res) => {
  try {
    const [bbc, lemonde, newsapi] = await Promise.allSettled([
      bbcService.fetchBBCNews(),
      lemondeService.fetchLemondeNews(),
      newsApiService.fetchNewsAPI()
    ]);

    let articles = [];

    if (bbc.status === 'fulfilled') articles.push(...bbc.value);
    else console.error('[BBC] Erreur fetch:', bbc.reason?.message);

    if (lemonde.status === 'fulfilled') articles.push(...lemonde.value);
    else console.error('[Le Monde] Erreur fetch:', lemonde.reason?.message);

    if (newsapi.status === 'fulfilled') articles.push(...newsapi.value);
    else console.error('[NewsAPI] Erreur fetch:', newsapi.reason?.message);

    // Déduplication et tri chronologique inversé
    const unique = deduplicateArticles(articles);
    unique.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

    res.json({
      total: unique.length,
      fetchedAt: new Date().toISOString(),
      articles: unique
    });
  } catch (err) {
    console.error('[getAllNews] Erreur critique:', err.message);
    res.status(500).json({ error: 'Impossible de récupérer les news', detail: err.message });
  }
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
