// ============================================================
// services/euronewsRss.js — Euronews RSS
// Couverture européenne et internationale
// ============================================================
const Parser = require('rss-parser');

const parser = new Parser({
  timeout: 10000,
  headers: { 'User-Agent': 'infonews.day/2.0 (+https://infonews.day)' }
});

const EURONEWS_FEEDS = [
  { url: 'https://www.euronews.com/rss?format=mrss&level=theme&name=news', category: 'monde'   },
  { url: 'https://www.euronews.com/rss?format=mrss&level=theme&name=business', category: 'eco' },
  { url: 'https://www.euronews.com/rss?format=mrss&level=theme&name=tech', category: 'techno'  },
];

function normalize(item, category) {
  return {
    id:          item.guid || item.link,
    title:       item.title || 'Sans titre',
    summary:     item.contentSnippet || item.summary || '',
    url:         item.link,
    source:      'Euronews',
    category,
    publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
    imageUrl:    item['media:content']?.$.url || item.enclosure?.url || null,
    lang:        'en'
  };
}

async function fetchEuronewsNews(limit = 8) {
  const results = await Promise.allSettled(
    EURONEWS_FEEDS.map(async f => {
      const data = await parser.parseURL(f.url);
      return data.items.slice(0, limit).map(i => normalize(i, f.category));
    })
  );
  return results
    .filter(r => r.status === 'fulfilled')
    .flatMap(r => r.value);
}

module.exports = { fetchEuronewsNews };
