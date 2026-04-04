// ============================================================
// services/lemondeRss.js — Fetch & parse du flux RSS Le Monde
// URL : https://www.lemonde.fr/rss/une.xml
// ============================================================

const Parser = require('rss-parser');

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'infonews.day/1.0 (+https://infonews.day)'
  },
  customFields: {
    item: ['media:thumbnail', 'media:content']
  }
});

// Flux RSS Le Monde disponibles
const LEMONDE_FEEDS = {
  une:           'https://www.lemonde.fr/rss/une.xml',
  international: 'https://www.lemonde.fr/international/rss_full.xml',
  economie:      'https://www.lemonde.fr/economie/rss_full.xml',
  tech:          'https://www.lemonde.fr/pixels/rss_full.xml',
  culture:       'https://www.lemonde.fr/culture/rss_full.xml'
};

/**
 * Normalise un item RSS Le Monde vers le format unifié infonews.
 * @param {Object} item - Item brut du parser RSS
 * @returns {Object} Article normalisé
 */
function normalizeItem(item) {
  // Extraction de l'image (plusieurs formats possibles dans le RSS Le Monde)
  let imageUrl = null;
  if (item['media:thumbnail']?.$ ?.url) imageUrl = item['media:thumbnail'].$.url;
  else if (item['media:content']?.$ ?.url) imageUrl = item['media:content'].$.url;
  else if (item.enclosure?.url) imageUrl = item.enclosure.url;

  return {
    id: item.guid || item.link,
    title: item.title || 'Sans titre',
    summary: item.contentSnippet || item.content || '',
    url: item.link,
    source: 'Le Monde',
    category: item.categories?.[0] || 'general',
    publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
    imageUrl,
    lang: 'fr'
  };
}

/**
 * Récupère les articles du flux RSS Le Monde (une principale par défaut).
 * @param {string} feed - Clé du flux (une | international | economie | tech | culture)
 * @returns {Promise<Array>} Articles normalisés
 */
async function fetchLemondeNews(feed = 'une') {
  const url = LEMONDE_FEEDS[feed] || LEMONDE_FEEDS.une;

  try {
    console.log(`[Le Monde] Fetch RSS : ${url}`);
    const feedData = await parser.parseURL(url);
    const articles = feedData.items.map(normalizeItem);
    console.log(`[Le Monde] ${articles.length} articles récupérés`);
    return articles;
  } catch (err) {
    console.error(`[Le Monde] Erreur fetch RSS : ${err.message}`);
    throw new Error(`Le Monde RSS fetch failed: ${err.message}`);
  }
}

module.exports = { fetchLemondeNews, LEMONDE_FEEDS };
