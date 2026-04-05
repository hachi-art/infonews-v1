// ============================================================
// services/xinhuaRss.js — Xinhua News Agency RSS ⚠️ ÉTAT
// Source d'information officielle de la RPC
// ============================================================
const Parser = require('rss-parser');
const parser = new Parser({ timeout: 10000, headers: { 'User-Agent': 'infonews.day/2.0' } });

const XINHUA_FEEDS = [
  { url: 'https://english.news.cn/rss/world.xml',    category: 'monde' },
  { url: 'https://english.news.cn/rss/business.xml', category: 'eco'   },
];

function normalize(item, category) {
  return {
    id:          item.guid || item.link,
    title:       item.title || 'Sans titre',
    summary:     item.contentSnippet || item.summary || '',
    url:         item.link,
    source:      'Xinhua',
    category,
    publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
    imageUrl:    item['media:content']?.$.url || null,
    lang:        'en',
    stateMedia:  true
  };
}

async function fetchXinhuaNews(limit = 10) {
  const results = await Promise.allSettled(
    XINHUA_FEEDS.map(async f => {
      const data = await parser.parseURL(f.url);
      return data.items.slice(0, limit).map(i => normalize(i, f.category));
    })
  );
  return results.filter(r => r.status === 'fulfilled').flatMap(r => r.value);
}

module.exports = { fetchXinhuaNews };
