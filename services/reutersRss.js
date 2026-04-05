// ============================================================
// services/reutersRss.js — Reuters World News RSS
// ============================================================
const Parser = require('rss-parser');
const parser = new Parser({ timeout: 10000, headers: { 'User-Agent': 'infonews.day/2.0' } });

const REUTERS_FEEDS = [
  { url: 'https://feeds.reuters.com/reuters/worldNews',     category: 'monde' },
  { url: 'https://feeds.reuters.com/reuters/businessNews',  category: 'eco'   },
  { url: 'https://feeds.reuters.com/reuters/technologyNews',category: 'techno'},
];

function normalize(item, category) {
  return {
    id:          item.guid || item.link,
    title:       item.title || 'Sans titre',
    summary:     item.contentSnippet || item.summary || '',
    url:         item.link,
    source:      'Reuters',
    category,
    publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
    imageUrl:    item['media:content']?.$.url || item.enclosure?.url || null,
    lang:        'en'
  };
}

async function fetchReutersNews(limit = 10) {
  const results = await Promise.allSettled(
    REUTERS_FEEDS.map(async f => {
      const data = await parser.parseURL(f.url);
      return data.items.slice(0, limit).map(i => normalize(i, f.category));
    })
  );
  return results.filter(r => r.status === 'fulfilled').flatMap(r => r.value);
}

module.exports = { fetchReutersNews };
