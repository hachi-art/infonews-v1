// ============================================================
// services/arxivService.js — ArXiv RSS (gratuit, sans clé)
// Preprints sciences : IA, physique, astronomie, biologie…
// ============================================================
const Parser = require('rss-parser');
const parser = new Parser({ timeout: 10000, headers: { 'User-Agent': 'infonews.day/3.1' } });

const ARXIV_FEEDS = [
  { id: 'cs.AI',   label: 'IA & Machine Learning',  cat: 'ia'      },
  { id: 'cs.LG',   label: 'Deep Learning',           cat: 'ia'      },
  { id: 'astro-ph',label: 'Astrophysique',            cat: 'espace'  },
  { id: 'physics', label: 'Physique',                 cat: 'science' },
  { id: 'q-bio',   label: 'Biologie quantitative',   cat: 'science' },
  { id: 'cs.CV',   label: 'Vision par ordinateur',   cat: 'ia'      },
  { id: 'cs.RO',   label: 'Robotique',               cat: 'ia'      },
];

const BASE = 'https://rss.arxiv.org/rss/';

function normalize(item, cat, feedLabel) {
  return {
    id:          item.guid || item.link,
    title:       (item.title || '').replace(/\[.*?\]\s*/,'').trim(),
    summary:     (item.contentSnippet || item.description || '').slice(0, 300),
    url:         item.link,
    source:      `ArXiv — ${feedLabel}`,
    category:    cat,
    publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
    imageUrl:    null,
    type:        'paper',
  };
}

async function fetchArxiv(feedId, limit = 8) {
  const feed = ARXIV_FEEDS.find(f => f.id === feedId) || ARXIV_FEEDS[0];
  const data = await parser.parseURL(`${BASE}${feedId}`);
  return data.items.slice(0, limit).map(i => normalize(i, feed.cat, feed.label));
}

async function fetchArxivIA(limit = 10) {
  const results = await Promise.allSettled([
    fetchArxiv('cs.AI', limit),
    fetchArxiv('cs.LG', Math.ceil(limit / 2)),
  ]);
  return results.filter(r => r.status === 'fulfilled').flatMap(r => r.value).slice(0, limit);
}

async function fetchArxivSpace(limit = 8) {
  return fetchArxiv('astro-ph', limit);
}

async function fetchArxivScience(limit = 8) {
  const results = await Promise.allSettled([
    fetchArxiv('physics', limit),
    fetchArxiv('q-bio', Math.ceil(limit / 2)),
  ]);
  return results.filter(r => r.status === 'fulfilled').flatMap(r => r.value).slice(0, limit);
}

module.exports = { fetchArxivIA, fetchArxivSpace, fetchArxivScience, fetchArxiv, ARXIV_FEEDS };
