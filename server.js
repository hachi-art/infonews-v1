// ============================================================
// infonews.day — Serveur principal Express v9.0
// Auteur : Sébastien Marquetoux | hachi-art/infonews-v1
// ============================================================

require('dotenv').config();

const express    = require('express');
const cors       = require('cors');
const path       = require('path');
const compression = require('compression');

const { apiLimiter, heavyLimiter } = require('./middleware/rateLimiter');
const { cacheMiddleware }          = require('./middleware/cache');

const newsRouter      = require('./routes/news');
const weatherRouter   = require('./routes/weather');
const financeRouter   = require('./routes/finance');
const exchangeRouter  = require('./routes/exchange');
const alertsRouter    = require('./routes/alerts');
const spaceRouter     = require('./routes/space');
const openskyRouter   = require('./routes/opensky');
const sportRouter     = require('./routes/sport');
const musicRouter     = require('./routes/music');
const trendsRouter    = require('./routes/trends');
const cinemaRouter    = require('./routes/cinema');
const youtubeRouter   = require('./routes/youtube');
const techRouter      = require('./routes/tech');
const redditRouter    = require('./routes/reddit');
const worldbankRouter = require('./routes/worldbank');
const societyRouter   = require('./routes/society');
const podcastsRouter  = require('./routes/podcasts');
const histRouter      = require('./routes/hist');
const searchRouter    = require('./routes/search');
const eventsRouter    = require('./routes/events');
const chatRouter      = require('./routes/chat');
const sitemapRouter   = require('./routes/sitemap');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ────────────────────────────────────────────────
app.use(compression());                          // gzip toutes les réponses
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ── Rate limiting global sur /api ──────────────────────────────
app.use('/api/', apiLimiter);

// ── Routes API (avec cache 10min sur les endpoints RSS lourds) ──
app.use('/api/news',      cacheMiddleware(600),  newsRouter);
app.use('/api/weather',   cacheMiddleware(300),  weatherRouter);
app.use('/api/finance',   cacheMiddleware(120),  financeRouter);
app.use('/api/exchange',  cacheMiddleware(300),  exchangeRouter);
app.use('/api/alerts',    cacheMiddleware(180),  alertsRouter);
app.use('/api/space',     cacheMiddleware(600),  spaceRouter);
app.use('/api/opensky',   cacheMiddleware(60),   openskyRouter);
app.use('/api/sport',     cacheMiddleware(300),  sportRouter);
app.use('/api/music',     cacheMiddleware(600),  musicRouter);
app.use('/api/trends',    cacheMiddleware(900),  trendsRouter);
app.use('/api/cinema',    cacheMiddleware(600),  cinemaRouter);
app.use('/api/youtube',   cacheMiddleware(600),  youtubeRouter);
app.use('/api/tech',      cacheMiddleware(600),  techRouter);
app.use('/api/reddit',    cacheMiddleware(300),  redditRouter);
app.use('/api/worldbank', heavyLimiter, cacheMiddleware(3600), worldbankRouter);
app.use('/api/society',   cacheMiddleware(600),  societyRouter);
app.use('/api/podcasts',  cacheMiddleware(1800), podcastsRouter);
app.use('/api/hist',      heavyLimiter, cacheMiddleware(3600), histRouter);
app.use('/api/search',    cacheMiddleware(120),  searchRouter);
app.use('/api/events',    cacheMiddleware(3600), eventsRouter);
// ── Globe-Guide IA (pas de cache — streaming SSE) ─────────────
app.use('/api/chat',      chatRouter);
// ── Sitemap XML dynamique ──────────────────────────────────────
app.use('/sitemap.xml',   sitemapRouter);

// ── Health check ──────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status:    'ok',
    project:   'infonews.day',
    version:   '9.0.0',
    timestamp: new Date().toISOString(),
    poles: 7,
    pages: 25,
    features: ['cache','rate-limiting','gzip','PWA','i18n-FR-EN-ES','globe-guide-ai','sitemap-25p','seo-og','bloomberg-terminal'],
    sources: {
      occident:    ['BBC', 'Le Monde', 'Guardian', 'DW', 'Euronews', 'Reuters', 'NewsAPI'],
      orient:      ['Al Jazeera', 'TRT World', 'Xinhua ⚠️', 'TASS ⚠️'],
      africa:      ['Africanews', 'AllAfrica'],
      latam:       ['TeleSUR'],
      tech:        ['TechCrunch', 'HackerNews', 'BleepingComputer', 'OpenAI Blog', 'ESA'],
      culture:     ['Variety', 'Hollywood Reporter'],
      health:      ['WHO/OMS'],
      droits:      ['Amnesty International', 'Human Rights Watch', 'UNHCR'],
      environnement:['Greenpeace', 'UNEP'],
      podcasts:    ['BBC Global', 'RFI', 'FT News', 'Radiolab', '99PI', 'Freakonomics', 'Darknet Diaries', 'Huberman Lab'],
    },
  });
});

// ── /sources-legales ──────────────────────────────────────────
app.get('/sources-legales', (req, res) => {
  res.json({
    page: 'Sources légales — infonews.day',
    note_sources_etat: 'TASS, Xinhua sont signalés comme médias d\'État. RT supprimé (banni UE, Règlement 2022/350).',
    rgpd: 'Aucun cookie, aucun tracker. Votes et pseudonymes en localStorage uniquement.',
  });
});


// ── robots.txt ─────────────────────────────────────────────────
app.get('/robots.txt', (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  res.send(`User-agent: *\nAllow: /\nSitemap: https://infonews.day/sitemap.xml\n`);
});

// ── Racine → index.html ────────────────────────────────────────
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── 404 ──────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route introuvable', path: req.path });
});

// ── Erreurs globales ──────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.message);
  res.status(500).json({ error: 'Erreur interne', detail: err.message });
});

// ── Démarrage ─────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[infonews.day v8.3] Port ${PORT} | Cache ✅ | Rate limit ✅ | Gzip ✅ | SEO ✅`);
  console.log(`[Pôles] 8 pôles actifs | [TMDB] ${process.env.TMDB_API_KEY ? '✅' : '⚠️'}`);
});

module.exports = app;
