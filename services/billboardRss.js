// ============================================================
// services/billboardRss.js — Billboard RSS + news (gratuit, sans clé)
// Charts + actualités musicales
// ============================================================
const Parser = require('rss-parser');
const parser = new Parser({ timeout: 10000, headers: { 'User-Agent': 'infonews.day/2.0' } });

const FEEDS = [
  { url: 'https://www.billboard.com/feed/',              source: 'Billboard',       category: 'culture' },
  { url: 'https://pitchfork.com/rss/news/feed/r.xml',   source: 'Pitchfork',       category: 'culture' },
  { url: 'https://www.nme.com/feed',                     source: 'NME',             category: 'culture' },
  { url: 'https://loudwire.com/feed/',                   source: 'Loudwire',        category: 'culture' },
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

async function fetchMusicNews(limit = 8) {
  const results = await Promise.allSettled(
    FEEDS.map(async f => {
      const data = await parser.parseURL(f.url);
      return data.items.slice(0, limit).map(i => normalize(i, f.source, f.category));
    })
  );
  return results.filter(r => r.status === 'fulfilled').flatMap(r => r.value);
}

module.exports = { fetchMusicNews };
