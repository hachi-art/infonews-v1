// ============================================================
// services/bbcSportRss.js — BBC Sport RSS (gratuit, sans clé)
// ============================================================
const Parser = require('rss-parser');
const parser = new Parser({ timeout: 10000, headers: { 'User-Agent': 'infonews.day/2.0' } });

const FEEDS = [
  { url: 'https://feeds.bbci.co.uk/sport/rss.xml',             category: 'sport' },
  { url: 'https://feeds.bbci.co.uk/sport/football/rss.xml',    category: 'sport' },
  { url: 'https://feeds.bbci.co.uk/sport/tennis/rss.xml',      category: 'sport' },
  { url: 'https://feeds.bbci.co.uk/sport/formula1/rss.xml',    category: 'sport' },
];

function normalize(item, category) {
  return {
    id:          item.guid || item.link,
    title:       item.title || 'Sans titre',
    summary:     item.contentSnippet || item.summary || '',
    url:         item.link,
    source:      'BBC Sport',
    category,
    publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
    imageUrl:    item['media:content']?.$.url || item.enclosure?.url || null,
    lang:        'en'
  };
}

async function fetchBBCSportNews(limit = 10) {
  const results = await Promise.allSettled(
    FEEDS.map(async f => {
      const data = await parser.parseURL(f.url);
      return data.items.slice(0, limit).map(i => normalize(i, f.category));
    })
  );
  return results.filter(r => r.status === 'fulfilled').flatMap(r => r.value);
}

module.exports = { fetchBBCSportNews };
