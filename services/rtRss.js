// ============================================================
// services/rtRss.js — RT News RSS ⚠️ ÉTAT / SANCTIONNÉ EU
// Media russe sanctionné dans l'UE depuis 2022
// Affiché avec badge d'avertissement obligatoire
// ============================================================
const Parser = require('rss-parser');
const parser = new Parser({ timeout: 10000, headers: { 'User-Agent': 'infonews.day/2.0' } });

const RT_FEEDS = [
  { url: 'https://www.rt.com/rss/', category: 'monde' },
];

function normalize(item, category) {
  return {
    id:          item.guid || item.link,
    title:       item.title || 'Sans titre',
    summary:     item.contentSnippet || item.summary || '',
    url:         item.link,
    source:      'RT',
    category,
    publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
    imageUrl:    item['media:content']?.$.url || null,
    lang:        'en',
    stateMedia:  true,
    sanctioned:  true
  };
}

async function fetchRTNews(limit = 8) {
  const results = await Promise.allSettled(
    RT_FEEDS.map(async f => {
      const data = await parser.parseURL(f.url);
      return data.items.slice(0, limit).map(i => normalize(i, f.category));
    })
  );
  return results.filter(r => r.status === 'fulfilled').flatMap(r => r.value);
}

module.exports = { fetchRTNews };
