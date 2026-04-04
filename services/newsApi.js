// ============================================================
// services/newsApi.js — Fetch NewsAPI REST
// Doc : https://newsapi.org/docs
// Limite plan gratuit : 100 requêtes/jour, articles < 30 jours
// ============================================================

const axios = require('axios');

const NEWSAPI_BASE_URL = 'https://newsapi.org/v2';

/**
 * Normalise un article NewsAPI vers le format unifié infonews.
 * @param {Object} article - Article brut de l'API
 * @returns {Object} Article normalisé
 */
function normalizeArticle(article) {
  return {
    id: article.url,
    title: article.title || 'Sans titre',
    summary: article.description || '',
    url: article.url,
    source: article.source?.name || 'NewsAPI',
    category: 'general',
    publishedAt: article.publishedAt ? new Date(article.publishedAt).toISOString() : new Date().toISOString(),
    imageUrl: article.urlToImage || null,
    lang: 'en',
    author: article.author || null
  };
}

/**
 * Récupère les actualités via NewsAPI.
 *
 * @param {Object} options
 * @param {string} options.q        - Terme de recherche (défaut : 'world')
 * @param {string} options.lang     - Langue : 'fr' | 'en' (défaut : 'en')
 * @param {number} options.pageSize - Nombre d'articles (max 100, défaut : 10)
 * @param {string} options.endpoint - 'everything' | 'top-headlines' (défaut : 'top-headlines')
 * @returns {Promise<Array>} Articles normalisés
 */
async function fetchNewsAPI({ q = 'world', lang = 'en', pageSize = 10, endpoint = 'top-headlines' } = {}) {
  const apiKey = process.env.NEWS_API_KEY;

  if (!apiKey) {
    console.warn('[NewsAPI] Clé API manquante — vérifie .env (NEWS_API_KEY)');
    return [];
  }

  const params = {
    apiKey,
    language: lang,
    pageSize: Math.min(pageSize, 100)
  };

  // top-headlines accepte "sources" ou "country", pas q obligatoire
  // everything nécessite q ou sources
  if (endpoint === 'top-headlines') {
    params.q = q;
  } else {
    params.q = q;
    params.sortBy = 'publishedAt';
  }

  try {
    console.log(`[NewsAPI] Fetch ${endpoint} — q="${q}" lang=${lang} pageSize=${pageSize}`);
    const response = await axios.get(`${NEWSAPI_BASE_URL}/${endpoint}`, {
      params,
      timeout: 10000
    });

    if (response.data.status !== 'ok') {
      throw new Error(`NewsAPI status: ${response.data.status} — ${response.data.message}`);
    }

    const articles = response.data.articles
      .filter(a => a.title && a.title !== '[Removed]')
      .map(normalizeArticle);

    console.log(`[NewsAPI] ${articles.length} articles récupérés`);
    return articles;
  } catch (err) {
    console.error(`[NewsAPI] Erreur fetch : ${err.message}`);
    throw new Error(`NewsAPI fetch failed: ${err.message}`);
  }
}

module.exports = { fetchNewsAPI };
