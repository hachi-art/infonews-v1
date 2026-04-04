// ============================================================
// services/techCrunchRss.js — Flux RSS TechCrunch (sans clé API)
// Rubrique : techno · startups · IA · web3
// ============================================================

const Parser = require('rss-parser');

const parser = new Parser({
  timeout: 10000,
  headers: { 'User-Agent': 'infonews.day/2.0 (+https://infonews.day)' },
  customFields: {
    item: [['media:content', 'mediaContent', { keepArray: false }]]
  }
});

const TC_FEEDS = {
  top:        'https://techcrunch.com/feed/',
  startups:   'https://techcrunch.com/category/startups/feed/',
  ai:         'https://techcrunch.com/category/artificial-intelligence/feed/'
};

function normalizeItem(item) {
  const imageUrl =
    item.mediaContent?.$.url ||
    item.enclosure?.url ||
    extractImageFromContent(item['content:encoded'] || '') ||
    null;

  return {
    id: item.guid || item.link,
    title: item.title || 'Sans titre',
    summary: item.contentSnippet?.slice(0, 200) || '',
    url: item.link,
    source: 'TechCrunch',
    category: 'techno',
    publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
    imageUrl,
    lang: 'en',
    author: item.creator || null
  };
}

function extractImageFromContent(html) {
  const match = html.match(/src=["']([^"']+\.(jpg|jpeg|png|webp))/i);
  return match ? match[1] : null;
}

/**
 * Récupère les articles TechCrunch (top + AI par défaut).
 * @param {number} limit - Nombre max d'articles par feed (défaut : 8)
 * @returns {Promise<Array>} Articles normalisés
 */
async function fetchTechCrunchNews(limit = 8) {
  const feeds = ['top', 'ai'];
  const results = await Promise.allSettled(
    feeds.map(async key => {
      console.log(`[TechCrunch] Fetch RSS : ${TC_FEEDS[key]}`);
      const feedData = await parser.parseURL(TC_FEEDS[key]);
      return feedData.items.slice(0, limit).map(normalizeItem);
    })
  );

  const articles = [];
  results.forEach((r, i) => {
    if (r.status === 'fulfilled') articles.push(...r.value);
    else console.error(`[TechCrunch] Erreur ${feeds[i]}: ${r.reason?.message}`);
  });

  // Déduplication par URL
  const seen = new Set();
  const unique = articles.filter(a => {
    if (seen.has(a.url)) return false;
    seen.add(a.url);
    return true;
  });

  console.log(`[TechCrunch] ${unique.length} articles récupérés`);
  return unique;
}

module.exports = { fetchTechCrunchNews };
