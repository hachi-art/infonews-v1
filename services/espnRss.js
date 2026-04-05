// ============================================================
// services/espnRss.js — ESPN RSS (gratuit, sans clé)
// ============================================================
const Parser = require('rss-parser');
const parser = new Parser({ timeout: 10000, headers: { 'User-Agent': 'infonews.day/2.0' } });

const FEEDS = [
  { url: 'https://www.espn.com/espn/rss/news',         category: 'sport' },
  { url: 'https://www.espn.com/espn/rss/soccer/news',  category: 'sport' },
  { url: 'https://www.espn.com/espn/rss/tennis/news',  category: 'sport' },
  { url: 'https://www.espn.com/espn/rss/nba/news',     category: 'sport' },
];

function normalize(item, category) {
  return {
    id:          item.guid || item.link,
    title:       item.title || 'Sans titre',
    summary:     item.contentSnippet || item.summary || '',
    url:         item.link,
    source:      'ESPN',
    category,
    publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
    imageUrl:    item['media:content']?.$.url || item.enclosure?.url || null,
    lang:        'en'
  };
}

async function fetchESPNNews(limit = 8) {
  const results = await Promise.allSettled(
    FEEDS.map(async f => {
      const data = await parser.parseURL(f.url);
      return data.items.slice(0, limit).map(i => normalize(i, f.category));
    })
  );
  return results.filter(r => r.status === 'fulfilled').flatMap(r => r.value);
}

module.exports = { fetchESPNNews };
