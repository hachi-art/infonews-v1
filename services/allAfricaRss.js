// ============================================================
// services/allAfricaRss.js — AllAfrica + Africanews RSS
// Couverture panafricaine — 55 pays
// ============================================================
const Parser = require('rss-parser');
const parser = new Parser({ timeout: 10000, headers: { 'User-Agent': 'infonews.day/2.0' } });

const AFRICA_FEEDS = [
  { url: 'https://allafrica.com/tools/headlines/rdf/latest/headlines.rdf', source: 'AllAfrica',   category: 'monde' },
  { url: 'https://www.africanews.com/feed/',                                source: 'Africanews', category: 'monde' },
];

function normalize(item, source, category) {
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

async function fetchAllAfricaNews(limit = 10) {
  const results = await Promise.allSettled(
    AFRICA_FEEDS.map(async f => {
      const data = await parser.parseURL(f.url);
      return data.items.slice(0, limit).map(i => normalize(i, f.source, f.category));
    })
  );
  return results.filter(r => r.status === 'fulfilled').flatMap(r => r.value);
}

module.exports = { fetchAllAfricaNews };
