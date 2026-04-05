// ============================================================
// services/beatportRss.js — Beatport Top 100 RSS (gratuit, sans clé)
// Charts électro par genre
// ============================================================
const Parser = require('rss-parser');
const parser = new Parser({ timeout: 12000, headers: { 'User-Agent': 'infonews.day/2.0' } });

const BEATPORT_FEEDS = [
  { url: 'https://www.beatport.com/genre/techno-(peak-time-driving)/6/top-100?format=rss', genre: 'Techno' },
  { url: 'https://www.beatport.com/genre/house/5/top-100?format=rss',                      genre: 'House' },
  { url: 'https://www.beatport.com/genre/deep-house/12/top-100?format=rss',                genre: 'Deep House' },
  { url: 'https://www.beatport.com/genre/melodic-house-techno/90/top-100?format=rss',     genre: 'Melodic House & Techno' },
  { url: 'https://www.beatport.com/genre/drum-bass/1/top-100?format=rss',                  genre: 'Drum & Bass' },
  { url: 'https://www.beatport.com/genre/afro-house/89/top-100?format=rss',                genre: 'Afro House' },
];

function normalize(item, genre) {
  // Beatport RSS: "Artist - Title (Original Mix)" dans le titre
  const title = item.title || 'Sans titre';
  return {
    id:          item.guid || item.link,
    title,
    genre,
    url:         item.link,
    source:      'Beatport',
    category:    'culture',
    publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
    imageUrl:    item['media:content']?.$.url || item.enclosure?.url || null,
    lang:        'en'
  };
}

async function fetchBeatportCharts(genres = ['Techno', 'House'], limit = 10) {
  const feeds = BEATPORT_FEEDS.filter(f => genres.includes(f.genre));
  const results = await Promise.allSettled(
    feeds.map(async f => {
      const data = await parser.parseURL(f.url);
      return data.items.slice(0, limit).map(i => normalize(i, f.genre));
    })
  );
  return results.filter(r => r.status === 'fulfilled').flatMap(r => r.value);
}

async function fetchAllBeatportCharts(limit = 5) {
  const results = await Promise.allSettled(
    BEATPORT_FEEDS.map(async f => {
      const data = await parser.parseURL(f.url);
      return data.items.slice(0, limit).map(i => normalize(i, f.genre));
    })
  );
  return results.filter(r => r.status === 'fulfilled').flatMap(r => r.value);
}

module.exports = { fetchBeatportCharts, fetchAllBeatportCharts, BEATPORT_FEEDS };
