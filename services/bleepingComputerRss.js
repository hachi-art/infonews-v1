// ============================================================
// services/bleepingComputerRss.js — BleepingComputer RSS
// Cybersécurité, malwares, vulnérabilités
// ============================================================
const Parser = require('rss-parser');
const parser = new Parser({ timeout: 10000, headers: { 'User-Agent': 'infonews.day/2.0' } });

const FEEDS = [
  { url: 'https://www.bleepingcomputer.com/feed/', category: 'techno' },
];

function normalize(item, category) {
  return {
    id:          item.guid || item.link,
    title:       item.title || 'Sans titre',
    summary:     item.contentSnippet || item.summary || '',
    url:         item.link,
    source:      'BleepingComputer',
    category,
    publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
    imageUrl:    null,
    lang:        'en'
  };
}

async function fetchBleepingComputerNews(limit = 10) {
  const results = await Promise.allSettled(
    FEEDS.map(async f => {
      const data = await parser.parseURL(f.url);
      return data.items.slice(0, limit).map(i => normalize(i, f.category));
    })
  );
  return results.filter(r => r.status === 'fulfilled').flatMap(r => r.value);
}

module.exports = { fetchBleepingComputerNews };
