// ============================================================
// services/varietyRss.js — Variety + Hollywood Reporter RSS
// Cinéma, séries, divertissement mondial
// ============================================================
const Parser = require('rss-parser');
const parser = new Parser({ timeout: 10000, headers: { 'User-Agent': 'infonews.day/2.0' } });

const FEEDS = [
  { url: 'https://variety.com/feed/',                   source: 'Variety',             category: 'culture' },
  { url: 'https://www.hollywoodreporter.com/feed/',     source: 'Hollywood Reporter',  category: 'culture' },
];

function normalize(item, category, source) {
  return {
    id:          item.guid || item.link,
    title:       item.title || 'Sans titre',
    summary:     item.contentSnippet || item.summary || '',
    url:         item.link,
    source,
    category,
    publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
    imageUrl:    item['media:content']?.$.url || item.enclosure?.url || null,
    lang:        'en'
  };
}

async function fetchVarietyNews(limit = 8) {
  const results = await Promise.allSettled(
    FEEDS.map(async f => {
      const data = await parser.parseURL(f.url);
      return data.items.slice(0, limit).map(i => normalize(i, f.category, f.source));
    })
  );
  return results.filter(r => r.status === 'fulfilled').flatMap(r => r.value);
}

module.exports = { fetchVarietyNews };
