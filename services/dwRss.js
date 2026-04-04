// ============================================================
// services/dwRss.js — Deutsche Welle (DW) RSS
// Média international allemand, couverture mondiale
// ============================================================
const Parser = require('rss-parser');

const parser = new Parser({
  timeout: 10000,
  headers: { 'User-Agent': 'infonews.day/2.0 (+https://infonews.day)' }
});

const DW_FEEDS = [
  { url: 'https://rss.dw.com/rdf/rss-en-world', category: 'monde'   },
  { url: 'https://rss.dw.com/rdf/rss-en-eu',    category: 'monde'   },
  { url: 'https://rss.dw.com/rdf/rss-en-sci',   category: 'science' },
  { url: 'https://rss.dw.com/rdf/rss-en-bus',   category: 'eco'     },
];

function normalize(item, category) {
  return {
    id:          item.guid || item.link,
    title:       item.title || 'Sans titre',
    summary:     item.contentSnippet || item.summary || '',
    url:         item.link,
    source:      'DW',
    category,
    publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
    imageUrl:    item.enclosure?.url || null,
    lang:        'en'
  };
}

async function fetchDWNews(limit = 8) {
  const results = await Promise.allSettled(
    DW_FEEDS.map(async f => {
      const data = await parser.parseURL(f.url);
      return data.items.slice(0, limit).map(i => normalize(i, f.category));
    })
  );
  return results
    .filter(r => r.status === 'fulfilled')
    .flatMap(r => r.value);
}

module.exports = { fetchDWNews };
