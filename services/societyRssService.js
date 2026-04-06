// ============================================================
// services/societyRssService.js — Droits, Santé, Environnement, Orgs
// ============================================================

const Parser = require('rss-parser');
const parser = new Parser({
  timeout: 10000,
  headers: { 'User-Agent': 'infonews.day/1.0' },
});

const FEEDS = {
  // Droits humains
  amnesty:    'https://www.amnesty.org/en/latest/news/feed/',
  hrw:        'https://www.hrw.org/news/rss',
  unhcr:      'https://news.un.org/feed/subscribe/en/news/topic/refugees/rss.xml',
  // Environnement
  greenpeace: 'https://www.greenpeace.org/international/feed/',
  unep:       'https://www.unep.org/news-and-stories/news/rss.xml',
  // Santé
  who:        'https://www.who.int/rss-feeds/news-english.xml',
  // Orgs internationales
  un:         'https://news.un.org/feed/subscribe/en/news/all/rss.xml',
  unicef:     'https://www.unicef.org/press-releases/rss',
  msf:        'https://www.msf.fr/rss/actualites',
  wb:         'https://blogs.worldbank.org/en/rss.xml',
};

function normalise(item, sourceName) {
  return {
    title:       item.title,
    url:         item.link,
    summary:     (item.contentSnippet || item.content || '').slice(0, 200),
    publishedAt: item.pubDate || item.isoDate,
    source:      sourceName,
  };
}

async function fetchFeed(key, limit = 8) {
  const url = FEEDS[key];
  if (!url) throw new Error(`Feed inconnu : ${key}`);
  const feed = await parser.parseURL(url);
  return feed.items.slice(0, limit).map(i => normalise(i, feed.title || key));
}

async function fetchMerged(keys, limit = 16) {
  const results = await Promise.allSettled(keys.map(k => fetchFeed(k, limit)));
  return results
    .filter(r => r.status === 'fulfilled')
    .flatMap(r => r.value)
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
    .slice(0, limit);
}

// Droits humains — Amnesty + HRW + UNHCR
async function fetchRightsNews(limit = 16)      { return fetchMerged(['amnesty','hrw','unhcr'], limit); }
// Environnement — Greenpeace + UNEP
async function fetchEnvironmentNews(limit = 16)  { return fetchMerged(['greenpeace','unep'], limit); }
// Santé — WHO
async function fetchHealthNews(limit = 16)        { return fetchFeed('who', limit); }

// Toutes les orgs (pour s-orgs)
async function fetchAllOrgs(limit = 4) {
  const keys = ['un','who','wb','unicef','msf','unep'];
  const results = await Promise.allSettled(keys.map(k => fetchFeed(k, limit)));
  const out = {};
  keys.forEach((k, i) => {
    out[k] = results[i].status === 'fulfilled' ? results[i].value : [];
  });
  return out;
}

module.exports = { fetchRightsNews, fetchEnvironmentNews, fetchHealthNews, fetchAllOrgs, fetchFeed };
