// ============================================================
// services/alJazeeraRss.js — Flux RSS Al Jazeera (sans clé API)
// Couverture mondiale, perspective internationale
// ============================================================

const Parser = require('rss-parser');

const parser = new Parser({
  timeout: 10000,
  headers: { 'User-Agent': 'infonews.day/2.0 (+https://infonews.day)' },
  customFields: {
    item: [['media:content', 'mediaContent', { keepArray: false }]]
  }
});

const AJ_FEEDS = {
  top:   'https://www.aljazeera.com/xml/rss/all.xml',
  monde: 'https://www.aljazeera.com/xml/rss/all.xml'
};

function normalizeItem(item) {
  const imageUrl =
    item.mediaContent?.$.url ||
    item.enclosure?.url ||
    null;

  return {
    id: item.guid || item.link,
    title: (item.title || 'Sans titre').replace(/\s*\|.*$/, '').trim(),
    summary: item.contentSnippet || '',
    url: item.link,
    source: 'Al Jazeera',
    category: 'monde',
    publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
    imageUrl,
    lang: 'en',
    author: null
  };
}

/**
 * Récupère les articles Al Jazeera.
 * @param {number} limit - Nombre max d'articles (défaut : 12)
 * @returns {Promise<Array>} Articles normalisés
 */
async function fetchAlJazeeraNews(limit = 12) {
  try {
    console.log('[Al Jazeera] Fetch RSS...');
    const feedData = await parser.parseURL(AJ_FEEDS.top);
    const articles = feedData.items.slice(0, limit).map(normalizeItem);
    console.log(`[Al Jazeera] ${articles.length} articles récupérés`);
    return articles;
  } catch (err) {
    console.error(`[Al Jazeera] Erreur fetch : ${err.message}`);
    throw new Error(`Al Jazeera RSS fetch failed: ${err.message}`);
  }
}

module.exports = { fetchAlJazeeraNews };
