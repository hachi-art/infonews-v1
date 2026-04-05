// ============================================================
// controllers/newsController.js — Logique métier des routes news
// Sources : BBC · Le Monde · NewsAPI · Guardian · Al Jazeera
//           TechCrunch · HackerNews · DW · Euronews
//           Reuters · Xinhua ⚠️ · TASS ⚠️
//           TRT World · Africanews · AllAfrica · TeleSUR
//           BleepingComputer · ESA · OpenAI Blog · WHO · Variety
// ============================================================

const bbcService             = require('../services/bbcRss');
const lemondeService         = require('../services/lemondeRss');
const newsApiService         = require('../services/newsApi');
const guardianService        = require('../services/guardianRss');
const alJazeeraService       = require('../services/alJazeeraRss');
const techCrunchService      = require('../services/techCrunchRss');
const hackerNewsService      = require('../services/hackerNewsService');
const independentService     = require('../services/independentRss');
const dwService              = require('../services/dwRss');
const euronewsService        = require('../services/euronewsRss');
const reutersService         = require('../services/reutersRss');
const xinhuaService          = require('../services/xinhuaRss');
const tassService            = require('../services/tassRss');
const trtWorldService        = require('../services/trtWorldRss');
const africanewsService      = require('../services/africanewsRss');
const allAfricaService       = require('../services/allAfricaRss');
const telesurService         = require('../services/telesurRss');
const bleepingService        = require('../services/bleepingComputerRss');
const esaService             = require('../services/esaRss');
const aiService              = require('../services/openAiBlogRss');
const whoService             = require('../services/whoRss');
const varietyService         = require('../services/varietyRss');

const VALID_CATEGORIES = ['monde', 'techno', 'eco', 'science', 'sport', 'culture', 'independent'];
const VALID_SOURCES    = [
  'bbc', 'lemonde', 'newsapi', 'guardian', 'aljazeera', 'techcrunch', 'hackernews',
  'independent', 'dw', 'euronews',
  'reuters', 'xinhua', 'tass', 'trtworld', 'africanews', 'allafrica', 'telesur',
  'bleeping', 'esa', 'ai', 'who', 'variety',
];

// ── Mapping catégories brutes → catégories normalisées ──────
const CAT_MAP = {
  // EN
  'world':                 'monde',
  'world news':            'monde',
  'international':         'monde',
  'europe':                'monde',
  'asia':                  'monde',
  'africa':                'monde',
  'americas':              'monde',
  'middle east':           'monde',
  'us & canada':           'monde',
  'geopolitics':           'monde',
  'politics':              'monde',
  'uk':                    'monde',
  'uk politics':           'monde',
  'us politics':           'monde',
  'technology':            'techno',
  'tech':                  'techno',
  'science & environment': 'science',
  'science':               'science',
  'health':                'science',
  'environment':           'science',
  'space':                 'science',
  'business':              'eco',
  'economy':               'eco',
  'finance':               'eco',
  'markets':               'eco',
  'economics':             'eco',
  'sport':                 'sport',
  'sports':                'sport',
  'football':              'sport',
  'culture':               'culture',
  'entertainment & arts':  'culture',
  'entertainment':         'culture',
  'arts':                  'culture',
  'film':                  'culture',
  'music':                 'culture',
  'cinema':                'culture',
  // FR
  'monde':                 'monde',
  'economie':              'eco',
  'économie':              'eco',
  'technologie':           'techno',
  'sciences':              'science',
  'sport':                 'sport',
  // Sources spécialisées
  'cybersecurity':         'techno',
  'cyber':                 'techno',
  'artificial intelligence':'techno',
  'ai':                    'techno',
};

function normalizeCategory(raw) {
  if (!raw) return 'monde';
  return CAT_MAP[raw.toLowerCase().trim()] || 'monde';
}

function normalizeArticle(article) {
  return {
    ...article,
    category:    CAT_MAP[article.category?.toLowerCase()] || article.category || 'monde',
    description: article.summary || article.description || '',
  };
}

function deduplicateArticles(articles) {
  const seen = new Set();
  return articles.filter(a => {
    const key = a.url || a.id;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ── fetcherMap complet ───────────────────────────────────────
const ALL_FETCHERS = {
  bbc:         () => bbcService.fetchBBCNews('top'),
  lemonde:     () => lemondeService.fetchLemondeNews(),
  newsapi:     () => newsApiService.fetchNewsAPI({ pageSize: 15 }),
  guardian:    () => guardianService.fetchGuardianNews(null),
  aljazeera:   () => alJazeeraService.fetchAlJazeeraNews(12),
  techcrunch:  () => techCrunchService.fetchTechCrunchNews(8),
  hackernews:  () => hackerNewsService.fetchHackerNews(10),
  independent: () => independentService.fetchIndependentNews(),
  dw:          () => dwService.fetchDWNews(8),
  euronews:    () => euronewsService.fetchEuronewsNews(8),
  reuters:     () => reutersService.fetchReutersNews(10),
  xinhua:      () => xinhuaService.fetchXinhuaNews(10),
  tass:        () => tassService.fetchTASSNews(8),
  trtworld:    () => trtWorldService.fetchTRTWorldNews(8),
  africanews:  () => africanewsService.fetchAfricanewsNews(8),
  allafrica:   () => allAfricaService.fetchAllAfricaNews(8),
  telesur:     () => telesurService.fetchTelesurNews(8),
  bleeping:    () => bleepingService.fetchBleepingComputerNews(8),
  esa:         () => esaService.fetchESANews(8),
  ai:          () => aiService.fetchAIBlogNews(6),
  who:         () => whoService.fetchWHONews(6),
  variety:     () => varietyService.fetchVarietyNews(8),
};

/**
 * GET /api/news
 * ?category=monde|techno|eco|science|sport|culture|independent
 * ?source=bbc|lemonde|...
 * ?group=west|east|africa|latam|tech|culture (groupes prédéfinis)
 * ?limit=80
 */
exports.getAllNews = async (req, res) => {
  const { category, source, group, limit = 80 } = req.query;
  const maxLimit = Math.min(parseInt(limit) || 80, 200);

  // Sélection des fetchers selon groupe ou source
  let fetchersToRun;

  if (group) {
    const GROUPS = {
      west:    ['bbc', 'lemonde', 'guardian', 'euronews', 'dw', 'reuters'],
      east:    ['aljazeera', 'xinhua', 'tass', 'trtworld'],
      africa:  ['africanews', 'allafrica'],
      latam:   ['telesur'],
      tech:    ['techcrunch', 'hackernews', 'bleeping', 'ai'],
      culture: ['variety'],
      health:  ['who'],
      space:   ['esa'],
      indep:   ['independent'],
    };
    const keys = GROUPS[group] || Object.keys(ALL_FETCHERS);
    fetchersToRun = Object.fromEntries(keys.map(k => [k, ALL_FETCHERS[k]]).filter(([k]) => ALL_FETCHERS[k]));
  } else if (source && VALID_SOURCES.includes(source)) {
    fetchersToRun = { [source]: ALL_FETCHERS[source] };
  } else {
    fetchersToRun = ALL_FETCHERS;
  }

  const keys = Object.keys(fetchersToRun);
  const results = await Promise.allSettled(keys.map(k => fetchersToRun[k]()));

  let articles = [];
  results.forEach((r, i) => {
    if (r.status === 'fulfilled') articles.push(...r.value);
    else console.error(`[NewsController] Erreur ${keys[i]}: ${r.reason?.message}`);
  });

  // Normalisation
  articles = articles.map(normalizeArticle);

  // Filtrage par catégorie
  if (category && VALID_CATEGORIES.includes(category)) {
    articles = articles.filter(a => a.category === category);
  }

  const unique = deduplicateArticles(articles);
  unique.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

  res.json({
    total:     unique.length,
    fetchedAt: new Date().toISOString(),
    filters:   { category: category || null, source: source || null, group: group || null },
    articles:  unique.slice(0, maxLimit)
  });
};

// ── Routes individuelles ─────────────────────────────────────
function makeHandler(fetcher, label) {
  return async (req, res) => {
    try {
      const articles = await fetcher();
      res.json({ total: articles.length, source: label, articles: articles.map(normalizeArticle) });
    } catch (err) {
      res.status(500).json({ error: `Erreur ${label}`, detail: err.message });
    }
  };
}

exports.getBBCNews          = makeHandler(() => bbcService.fetchBBCNews(),             'BBC');
exports.getLemondeNews      = makeHandler(() => lemondeService.fetchLemondeNews(),      'Le Monde');
exports.getNewsAPI          = async (req, res) => {
  try {
    const { q = 'world', lang = 'en', pageSize = 10 } = req.query;
    const articles = await newsApiService.fetchNewsAPI({ q, lang, pageSize: parseInt(pageSize) });
    res.json({ total: articles.length, source: 'NewsAPI', articles: articles.map(normalizeArticle) });
  } catch (err) {
    res.status(500).json({ error: 'Erreur NewsAPI', detail: err.message });
  }
};
exports.getGuardianNews     = makeHandler(() => guardianService.fetchGuardianNews(null),'The Guardian');
exports.getAlJazeeraNews    = makeHandler(() => alJazeeraService.fetchAlJazeeraNews(),  'Al Jazeera');
exports.getTechCrunchNews   = makeHandler(() => techCrunchService.fetchTechCrunchNews(),'TechCrunch');
exports.getHackerNews       = makeHandler(() => hackerNewsService.fetchHackerNews(),    'HackerNews');
exports.getDWNews           = makeHandler(() => dwService.fetchDWNews(),                'DW');
exports.getEuronewsNews     = makeHandler(() => euronewsService.fetchEuronewsNews(),    'Euronews');
exports.getReutersNews      = makeHandler(() => reutersService.fetchReutersNews(),      'Reuters');
exports.getXinhuaNews       = makeHandler(() => xinhuaService.fetchXinhuaNews(),        'Xinhua');
exports.getTASSNews         = makeHandler(() => tassService.fetchTASSNews(),            'TASS');
exports.getTRTWorldNews     = makeHandler(() => trtWorldService.fetchTRTWorldNews(),    'TRT World');
exports.getAfricanewsNews   = makeHandler(() => africanewsService.fetchAfricanewsNews(),'Africanews');
exports.getAllAfricaNews     = makeHandler(() => allAfricaService.fetchAllAfricaNews(),  'AllAfrica');
exports.getTelesurNews      = makeHandler(() => telesurService.fetchTelesurNews(),      'TeleSUR');
exports.getBleepingNews     = makeHandler(() => bleepingService.fetchBleepingComputerNews(), 'BleepingComputer');
exports.getESANews          = makeHandler(() => esaService.fetchESANews(),              'ESA');
exports.getAIBlogNews       = makeHandler(() => aiService.fetchAIBlogNews(),            'AI Blogs');
exports.getWHONews          = makeHandler(() => whoService.fetchWHONews(),              'OMS/WHO');
exports.getVarietyNews      = makeHandler(() => varietyService.fetchVarietyNews(),      'Variety');
