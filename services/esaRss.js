// ============================================================
// services/esaRss.js — ESA (European Space Agency) RSS
// Actualités spatiales européennes
// ============================================================
const Parser = require('rss-parser');
const parser = new Parser({ timeout: 10000, headers: { 'User-Agent': 'infonews.day/2.0' } });

const FEEDS = [
  { url: 'https://www.esa.int/rssfeed/Our_Activities/Space_Science',    category: 'science' },
  { url: 'https://www.esa.int/rssfeed/Our_Activities/Observing_the_Earth', category: 'science' },
];

function normalize(item, category) {
  return {
    id:          item.guid || item.link,
    title:       item.title || 'Sans titre',
    summary:     item.contentSnippet || item.summary || '',
    url:         item.link,
    source:      'ESA',
    category,
    publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
    imageUrl:    item['media:content']?.$.url || item.enclosure?.url || null,
    lang:        'en'
  };
}

async function fetchESANews(limit = 8) {
  const results = await Promise.allSettled(
    FEEDS.map(async f => {
      const data = await parser.parseURL(f.url);
      return data.items.slice(0, limit).map(i => normalize(i, f.category));
    })
  );
  return results.filter(r => r.status === 'fulfilled').flatMap(r => r.value);
}

module.exports = { fetchESANews };
