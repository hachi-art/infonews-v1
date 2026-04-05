// ============================================================
// services/tassRss.js — TASS Russian News Agency ⚠️ ÉTAT
// Agence de presse officielle russe
// ============================================================
const Parser = require('rss-parser');
const parser = new Parser({ timeout: 10000, headers: { 'User-Agent': 'infonews.day/2.0' } });

const TASS_FEEDS = [
  { url: 'https://tass.com/rss/v2.xml', category: 'monde' },
];

function normalize(item, category) {
  return {
    id:          item.guid || item.link,
    title:       item.title || 'Sans titre',
    summary:     item.contentSnippet || item.summary || '',
    url:         item.link,
    source:      'TASS',
    category,
    publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
    imageUrl:    item['media:content']?.$.url || null,
    lang:        'en',
    stateMedia:  true
  };
}

async function fetchTASSNews(limit = 10) {
  const results = await Promise.allSettled(
    TASS_FEEDS.map(async f => {
      const data = await parser.parseURL(f.url);
      return data.items.slice(0, limit).map(i => normalize(i, f.category));
    })
  );
  return results.filter(r => r.status === 'fulfilled').flatMap(r => r.value);
}

module.exports = { fetchTASSNews };
