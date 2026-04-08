// ============================================================
// services/wikiTrendingService.js — Wikipedia Trending Pages
// API Wikimedia officielle — gratuit, sans clé, pas de blocage
// Endpoint : https://wikimedia.org/api/rest_v1/metrics/pageviews/top/
// ============================================================
const axios = require('axios');

const PROJECTS = {
  FR: { project: 'fr.wikipedia', lang: 'fr', country: 'France',     flag: '🇫🇷' },
  EN: { project: 'en.wikipedia', lang: 'en', country: 'USA / UK',   flag: '🇺🇸' },
  ES: { project: 'es.wikipedia', lang: 'es', country: 'Espagne',    flag: '🇪🇸' },
  DE: { project: 'de.wikipedia', lang: 'de', country: 'Allemagne',  flag: '🇩🇪' },
  IT: { project: 'it.wikipedia', lang: 'it', country: 'Italie',     flag: '🇮🇹' },
  PT: { project: 'pt.wikipedia', lang: 'pt', country: 'Brésil',     flag: '🇧🇷' },
};

// Pages techniques à exclure (UI Wikipedia)
const BLACKLIST = new Set([
  'Wikipédia:Accueil_principal', 'Wikipedia:Main_Page', 'Special:Search',
  'Main_Page', 'Accueil', 'Wikipedia', 'Wikipédia', '-',
  'Special:Statistics', 'Special:RecentChanges', 'Portail:Accueil',
]);

// Préfixes à exclure (toutes langues)
const BLACKLIST_PREFIXES = [
  'Special:', 'Spécial:', 'Wikipedia:', 'Wikipédia:', 'Portail:',
  'Aide:', 'Help:', 'User:', 'Utilisateur:', 'Discussione:', 'Benutzer:',
  'Talk:', 'File:', 'Fichier:', 'Template:', 'Modèle:', 'Category:',
  'Catégorie:', 'Project:', 'WP:',
];

function isBlacklisted(title) {
  if (!title || title === '-') return true;
  if (BLACKLIST.has(title)) return true;
  return BLACKLIST_PREFIXES.some(p => title.startsWith(p));
}

/**
 * Récupère les pages les plus vues hier pour un pays donné
 * @param {string} geo — code pays (FR, EN, ES, DE…)
 * @param {number} limit — nombre de résultats
 */
async function fetchWikiTrending(geo = 'FR', limit = 20) {
  const cfg = PROJECTS[geo.toUpperCase()] || PROJECTS.FR;

  // Date d'hier (données dispo dès 00h UTC)
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const year  = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day   = String(d.getDate()).padStart(2, '0');

  const url = `https://wikimedia.org/api/rest_v1/metrics/pageviews/top/${cfg.project}/all-access/${year}/${month}/${day}`;

  const r = await axios.get(url, {
    timeout: 8000,
    headers: { 'User-Agent': 'infonews.day/2.0 (contact@infonews.day)' },
  });

  const articles = r.data?.items?.[0]?.articles || [];

  return articles
    .filter(a => !isBlacklisted(a.article))
    .slice(0, limit)
    .map((a, i) => {
      const title   = decodeURIComponent(a.article.replace(/_/g, ' '));
      const wikiUrl = `https://${cfg.lang}.wikipedia.org/wiki/${encodeURIComponent(a.article)}`;
      return {
        id:            `wiki-${geo}-${a.article}`,
        title,
        query:         title,
        rank:          i + 1,
        views:         a.views,
        viewsLabel:    a.views >= 1_000_000
                         ? `${(a.views / 1_000_000).toFixed(1)}M vues`
                         : a.views >= 1_000
                         ? `${Math.round(a.views / 1_000)}k vues`
                         : `${a.views} vues`,
        newsUrl:       wikiUrl,
        source:        `Wikipedia ${cfg.flag} — ${cfg.country}`,
        category:      'monde',
        publishedAt:   `${year}-${month}-${day}T00:00:00.000Z`,
        geo:           geo.toUpperCase(),
        country:       cfg.country,
        flag:          cfg.flag,
        lang:          cfg.lang,
      };
    });
}

/**
 * Multi-pays — récupère les tendances de plusieurs pays en parallèle
 */
async function fetchMultiGeoTrending(geos = ['FR', 'EN', 'ES'], limit = 10) {
  const results = await Promise.allSettled(
    geos.map(geo => fetchWikiTrending(geo, limit))
  );
  return results
    .filter(r => r.status === 'fulfilled')
    .flatMap(r => r.value);
}

const SUPPORTED_GEOS = Object.entries(PROJECTS).map(([geo, cfg]) => ({
  geo, country: cfg.country, flag: cfg.flag, lang: cfg.lang,
}));

module.exports = { fetchWikiTrending, fetchMultiGeoTrending, SUPPORTED_GEOS };
