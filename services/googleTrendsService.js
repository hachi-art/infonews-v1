// ============================================================
// services/googleTrendsService.js — Google Trends RSS (gratuit, sans clé)
// RSS officiel Google — tendances par pays
// ============================================================
const Parser = require('rss-parser');
const parser = new Parser({ timeout: 10000, headers: { 'User-Agent': 'infonews.day/2.0' } });

const SUPPORTED_GEOS = [
  { geo: 'FR', country: 'France',     flag: '🇫🇷' },
  { geo: 'ES', country: 'Espagne',    flag: '🇪🇸' },
  { geo: 'GB', country: 'UK',         flag: '🇬🇧' },
  { geo: 'US', country: 'USA',        flag: '🇺🇸' },
  { geo: 'DE', country: 'Allemagne',  flag: '🇩🇪' },
  { geo: 'IT', country: 'Italie',     flag: '🇮🇹' },
  { geo: 'BR', country: 'Brésil',     flag: '🇧🇷' },
  { geo: 'IN', country: 'Inde',       flag: '🇮🇳' },
];

const GEO_MAP = Object.fromEntries(SUPPORTED_GEOS.map(g => [g.geo, g]));
const BASE_URL = 'https://trends.google.com/trends/trendingsearches/daily/rss?geo=';

function normalize(item, geo, country) {
  return {
    id:            item.guid || item.link || item.title,
    title:         item.title || 'Tendance',
    query:         item.title || '',
    summary:       item.contentSnippet || item.description || '',
    newsUrl:       item.link || `https://www.google.com/search?q=${encodeURIComponent(item.title)}`,
    source:        `Google Trends — ${country}`,
    category:      'monde',
    publishedAt:   item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
    imageUrl:      item['ht:picture'] || null,
    trafficVolume: item['ht:approx_traffic'] || null,
    geo,
    country,
    lang:          geo === 'FR' || geo === 'BE' ? 'fr' : 'en',
  };
}

async function fetchGoogleTrends(geo = 'FR', limit = 20) {
  const info = GEO_MAP[geo] || { country: geo };
  const data = await parser.parseURL(`${BASE_URL}${geo}`);
  return data.items.slice(0, limit).map(i => normalize(i, geo, info.country));
}

async function fetchMultiGeoTrends(geos = ['FR', 'ES', 'GB'], limit = 10) {
  const results = await Promise.allSettled(
    geos.map(geo => fetchGoogleTrends(geo, limit))
  );
  return results.filter(r => r.status === 'fulfilled').flatMap(r => r.value);
}

module.exports = { fetchGoogleTrends, fetchMultiGeoTrends, SUPPORTED_GEOS };
