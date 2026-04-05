// ============================================================
// services/gdacsService.js — GDACS RSS (Global Disaster Alert)
// Alertes mondiales : séismes, cyclones, inondations, sécheresses
// Doc : https://www.gdacs.org/xml/rss.xml
// ============================================================
const Parser = require('rss-parser');
const parser = new Parser({ timeout: 10000, headers: { 'User-Agent': 'infonews.day/2.0' } });

const GDACS_URL = 'https://www.gdacs.org/xml/rss.xml';

const SEVERITY_MAP = {
  'Green':  'low',
  'Orange': 'medium',
  'Red':    'critical',
};

function normalize(item) {
  const title = item.title || 'Alerte inconnue';
  const type = title.match(/^([A-Z]+)/)?.[1] || 'ALERT';
  const severity = item['gdacs:alertlevel'] || 'Green';
  return {
    id:          item.guid || item.link,
    title,
    type,
    severity:    SEVERITY_MAP[severity] || 'low',
    alertLevel:  severity,
    place:       item['gdacs:country'] || item.description || '',
    url:         item.link,
    publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
    lat:         parseFloat(item['georss:point']?.split(' ')[0]) || null,
    lon:         parseFloat(item['georss:point']?.split(' ')[1]) || null,
    source:      'GDACS'
  };
}

async function fetchGDACS(limit = 15) {
  try {
    const data = await parser.parseURL(GDACS_URL);
    const items = (data.items || []).slice(0, limit).map(normalize);
    console.log(`[GDACS] ${items.length} alertes récupérées`);
    return items;
  } catch (e) {
    console.warn('[GDACS] Erreur:', e.message);
    return [];
  }
}

module.exports = { fetchGDACS };
