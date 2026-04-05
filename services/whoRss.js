// ============================================================
// services/whoRss.js — WHO / OMS RSS + UN News
// Organisation Mondiale de la Santé + Nations Unies
// ============================================================
const Parser = require('rss-parser');
const parser = new Parser({ timeout: 10000, headers: { 'User-Agent': 'infonews.day/2.0' } });

const HEALTH_FEEDS = [
  { url: 'https://www.who.int/rss-feeds/news-english.xml',                              source: 'OMS',    category: 'science' },
  { url: 'https://news.un.org/feed/subscribe/fr/news/topic/health/feed/rss.xml',        source: 'ONU',    category: 'science' },
  { url: 'https://www.paho.org/en/rss.xml',                                             source: 'PAHO',   category: 'science' },
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

async function fetchWHONews(limit = 8) {
  const results = await Promise.allSettled(
    HEALTH_FEEDS.map(async f => {
      const data = await parser.parseURL(f.url);
      return data.items.slice(0, limit).map(i => normalize(i, f.source, f.category));
    })
  );
  return results.filter(r => r.status === 'fulfilled').flatMap(r => r.value);
}

module.exports = { fetchWHONews };
