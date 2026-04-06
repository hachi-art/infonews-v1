// ============================================================
// infonews.day — Serveur principal Express v3.1
// Auteur : Sébastien Marquetoux | hachi-art/infonews-v1
// ============================================================

require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const path    = require('path');

const newsRouter    = require('./routes/news');
const weatherRouter = require('./routes/weather');
const financeRouter = require('./routes/finance');
const exchangeRouter= require('./routes/exchange');
const alertsRouter  = require('./routes/alerts');
const spaceRouter   = require('./routes/space');
const openskyRouter = require('./routes/opensky');
const sportRouter   = require('./routes/sport');
const musicRouter   = require('./routes/music');
const trendsRouter  = require('./routes/trends');
const cinemaRouter  = require('./routes/cinema');
const youtubeRouter = require('./routes/youtube');
const techRouter    = require('./routes/tech');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ── Routes API ────────────────────────────────────────────────
app.use('/api/news',     newsRouter);
app.use('/api/weather',  weatherRouter);
app.use('/api/finance',  financeRouter);
app.use('/api/exchange', exchangeRouter);
app.use('/api/alerts',   alertsRouter);
app.use('/api/space',    spaceRouter);
app.use('/api/opensky',  openskyRouter);
app.use('/api/sport',    sportRouter);
app.use('/api/music',    musicRouter);
app.use('/api/trends',   trendsRouter);
app.use('/api/cinema',   cinemaRouter);
app.use('/api/youtube',  youtubeRouter);
app.use('/api/tech',     techRouter);

// ── Health check ──────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status:    'ok',
    project:   'infonews.day',
    version:   '3.1.0',
    timestamp: new Date().toISOString(),
    sources: {
      occident: ['BBC', 'Le Monde', 'Guardian', 'DW', 'Euronews', 'Reuters', 'NewsAPI'],
      orient:   ['Al Jazeera', 'TRT World', 'Xinhua ⚠️', 'TASS ⚠️'],
      africa:   ['Africanews', 'AllAfrica'],
      latam:    ['TeleSUR'],
      tech:     ['TechCrunch', 'HackerNews', 'BleepingComputer', 'OpenAI Blog', 'DeepMind', 'ESA'],
      culture:  ['Variety', 'Hollywood Reporter'],
      health:   ['WHO/OMS', 'ONU'],
      independ: ['The Intercept', 'Mr Mondialisation', 'Global Voices'],
    },
    apis: {
      weather:    'Open-Meteo (gratuit)',
      finance:    'CoinGecko + Yahoo Finance (gratuit)',
      exchange:   'Frankfurter (gratuit)',
      alerts:     'USGS + GDACS (gratuit)',
      space:      'NASA APOD + ISS Tracker (gratuit)',
      aviation:   'OpenSky Network (gratuit)',
      sport:      'TheSportsDB + BBC Sport + ESPN (gratuit)',
      music:      'Deezer Charts + Beatport RSS + Billboard RSS (gratuit)',
      trends:     'Google Trends RSS (gratuit)',
      cinema:     'TMDB (clé gratuite) + Variety RSS',
      youtube:    'YouTube RSS natif (gratuit, sans clé)',
    }
  });
});

// ── /sources-legales ──────────────────────────────────────────
app.get('/sources-legales', (req, res) => {
  res.json({
    page: 'Sources légales — infonews.day',
    description: 'Toutes les sources utilisées sont librement accessibles et redistributibles.',
    categories: {
      rss_public: [
        'BBC', 'Le Monde', 'Guardian', 'Al Jazeera', 'DW', 'Euronews', 'Reuters',
        'Xinhua', 'TASS', 'TRT World', 'Africanews', 'TeleSUR',
        'TechCrunch', 'HackerNews', 'BleepingComputer', 'ESA', 'OpenAI Blog', 'WHO', 'Variety',
        'BBC Sport', 'ESPN', 'Billboard', 'Pitchfork', 'NME', 'Beatport',
        'Google Trends RSS', 'YouTube RSS',
      ],
      apis_gratuites: [
        'NewsAPI (free tier)', 'Open-Meteo', 'CoinGecko', 'Frankfurter',
        'USGS', 'GDACS', 'NASA APOD', 'wheretheiss.at', 'OpenSky Network',
        'Met Museum Open Access', 'Deezer Charts', 'TheSportsDB',
        'TMDB (clé gratuite)', 'football-data.org (clé gratuite)',
      ],
      note_sources_etat: 'TASS, Xinhua sont signalés comme médias d\'État. RT supprimé (banni UE, Règlement 2022/350).',
      rgpd: 'Aucun cookie, aucun tracker, aucune donnée personnelle collectée. Votes et pseudonymes stockés en localStorage uniquement.',
    }
  });
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
  res.status(500).json({ error: 'Erreur interne du serveur', detail: err.message });
});

// ── Démarrage ─────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[infonews.day v3.1] Port ${PORT}`);
  console.log(`[Sources] 22 sources actives — BBC·LeMonde·Reuters·Xinhua·TASS·AlJazeera·TRT·Africanews·AllAfrica·TeleSUR·DW·Euronews·TechCrunch·HN·Bleeping·ESA·OpenAI·WHO·Variety·Guardian·NewsAPI·Independent`);
  console.log(`[APIs] Weather·Finance·CoinGecko·USGS·GDACS·NASA·OpenSky·TheSportsDB·Deezer·GoogleTrends·TMDB·YouTube`);
  console.log(`[NewsAPI] ${process.env.NEWS_API_KEY ? '✅' : '❌ MANQUANTE'}`);
  console.log(`[TMDB]    ${process.env.TMDB_API_KEY ? '✅' : '⚠️ MANQUANTE (facultatif)'}`);
  console.log(`[FootballData] ${process.env.FOOTBALL_DATA_KEY ? '✅' : '⚠️ MANQUANTE (facultatif)'}`);
});

module.exports = app;
