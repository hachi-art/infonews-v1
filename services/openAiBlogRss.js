// ============================================================
// services/openAiBlogRss.js — OpenAI + Anthropic + DeepMind RSS
// Blog officiel OpenAI + sources IA majeures
// ============================================================
const Parser = require('rss-parser');
const parser = new Parser({ timeout: 10000, headers: { 'User-Agent': 'infonews.day/2.0' } });

const AI_FEEDS = [
  { url: 'https://openai.com/blog/rss.xml',                                source: 'OpenAI',    category: 'techno' },
  { url: 'https://www.deepmind.com/blog/rss.xml',                          source: 'DeepMind',  category: 'techno' },
  { url: 'https://bair.berkeley.edu/blog/feed.xml',                        source: 'BAIR',      category: 'science' },
  { url: 'https://blogs.microsoft.com/ai/feed/',                           source: 'Microsoft AI', category: 'techno' },
];

function normalize(item, source, category) {
  return {
    id:          item.guid || item.link,
    title:       item.title || 'Sans titre',
    summary:     item.contentSnippet || item.summary || '',
    url:         item.link,
    source,
    category,
    publishedAt: item.pubDate || item.isoDate ? new Date(item.pubDate || item.isoDate).toISOString() : new Date().toISOString(),
    imageUrl:    item['media:content']?.$.url || item.enclosure?.url || null,
    lang:        'en'
  };
}

async function fetchAIBlogNews(limit = 8) {
  const results = await Promise.allSettled(
    AI_FEEDS.map(async f => {
      const data = await parser.parseURL(f.url);
      return data.items.slice(0, limit).map(i => normalize(i, f.source, f.category));
    })
  );
  return results.filter(r => r.status === 'fulfilled').flatMap(r => r.value);
}

module.exports = { fetchAIBlogNews };
