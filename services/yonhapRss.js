// ============================================================
// services/yonhapRss.js — Yonhap News Agency RSS (Corée du Sud)
// ============================================================
const Parser = require('rss-parser');
const parser = new Parser({ timeout: 10000, headers: { 'User-Agent': 'infonews.day/2.0' } });

const YONHAP_FEEDS = [
  { url: 'https://en.yna.co.kr/RSS/news.xml', category: 'monde' },
];

function normalize(item, category) {
  return {
    id:          item.guid || item.link,
    title:       item.title || 'Sans titre',
    summary:     item.contentSnippet || item.summary || '',
    url:         item.link,
    source:      'Yonhap',
    category,
    publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
    imageUrl:    item['media:content']?.$.url || null,
    lang:        'en',
  };
}

async function fetchYonhapNews(limit = 10) {
  const results = await Promise.allSettled(
    YONHAP_FEEDS.map(async f => {
      const data = await parser.parseURL(f.url);
      return data.items.slice(0, limit).map(i => normalize(i, f.category));
    })
  );
  return results.filter(r => r.status === 'fulfilled').flatMap(r => r.value);
}

module.exports = { fetchYonhapNews };
