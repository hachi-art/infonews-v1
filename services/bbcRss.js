// ============================================================
// services/bbcRss.js — Fetch & parse du flux RSS BBC
// URL : https://feeds.bbci.co.uk/news/rss.xml
// ============================================================

const Parser = require('rss-parser');

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'infonews.day/1.0 (+https://infonews.day)'
  }
});

// Flux RSS BBC disponibles
const BBC_FEEDS = {
  top:       'https://feeds.bbci.co.uk/news/rss.xml',
  world:     'https://feeds.bbci.co.uk/news/world/rss.xml',
  tech:      'https://feeds.bbci.co.uk/news/technology/rss.xml',
  business:  'https://feeds.bbci.co.uk/news/business/rss.xml'
};

/**
 * Normalise un item RSS BBC vers le format unifié infonews.
 * @param {Object} item - Item brut du parser RSS
 * @returns {Object} Article normalisé
 */
function normalizeItem(item) {
  return {
    id: item.guid || item.link,
    title: item.title || 'Sans titre',
    summary: item.contentSnippet || item.content || '',
    url: item.link,
    source: 'BBC',
    category: item.categories?.[0] || 'general',
    publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
    imageUrl: item.enclosure?.url || null,
    lang: 'en'
  };
}

/**
 * Récupère les articles du flux RSS BBC (section principale par défaut).
 * @param {string} feed - Clé du flux (top | world | tech | business)
 * @returns {Promise<Array>} Articles normalisés
 */
async function fetchBBCNews(feed = 'top') {
  const url = BBC_FEEDS[feed] || BBC_FEEDS.top;

  try {
    console.log(`[BBC] Fetch RSS : ${url}`);
    const feedData = await parser.parseURL(url);
    const articles = feedData.items.map(normalizeItem);
    console.log(`[BBC] ${articles.length} articles récupérés`);
    return articles;
  } catch (err) {
    console.error(`[BBC] Erreur fetch RSS : ${err.message}`);
    throw new Error(`BBC RSS fetch failed: ${err.message}`);
  }
}

module.exports = { fetchBBCNews, BBC_FEEDS };
