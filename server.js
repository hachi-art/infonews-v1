// ============================================================
// infonews.day — Serveur principal Express v3.0
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

// ── Health check ──────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status:    'ok',
    project:   'infonews.day',
    version:   '3.0.0',
    timestamp: new Date().toISOString(),
    sources: {
      occident: ['BBC', 'Le Monde', 'Guardian', 'DW', 'Euronews', 'Reuters', 'NewsAPI'],
      orient:   ['Al Jazeera', 'TRT World', 'Xinhua ⚠️', 'TASS ⚠️', 'RT ⚠️'],
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
    }
  });
});

// ── /sources-legales ──────────────────────────────────────────
app.get('/sources-legales', (req, res) => {
  res.json({
    page: 'Sources légales — infonews.day',
    description: 'Toutes les sources utilisées sont librement accessibles et redistributibles.',
    categories: {
      rss_public: ['BBC', 'Le Monde', 'Guardian', 'Al Jazeera', 'DW', 'Euronews', 'Reuters', 'Xinhua', 'TASS', 'RT', 'TRT World', 'Africanews', 'TeleSUR', 'TechCrunch', 'HackerNews', 'BleepingComputer', 'ESA', 'OpenAI Blog', 'WHO', 'Variety'],
      apis_gratuites: ['NewsAPI (free tier)', 'Open-Meteo', 'CoinGecko', 'Frankfurter', 'USGS', 'GDACS', 'NASA APOD', 'wheretheiss.at', 'OpenSky Network', 'Met Museum Open Access'],
      note_sources_etat: 'RT, TASS, Xinhua sont signalés comme médias d\'État. Les contenus sont affichés avec un avertissement visible.',
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
  console.log(`[infonews.day v3] Port ${PORT}`);
  console.log(`[Sources] 23 sources actives — BBC·LeMonde·Reuters·Xinhua·TASS·RT·Al Jazeera·TRT·Africanews·AllAfrica·TeleSUR·DW·Euronews·TechCrunch·HN·Bleeping·ESA·OpenAI·WHO·Variety·Guardian·NewsAPI·Independent`);
  console.log(`[APIs] Weather·Finance·CoinGecko·USGS·GDACS·NASA·OpenSky`);
  console.log(`[NewsAPI] ${process.env.NEWS_API_KEY ? '✅' : '❌ MANQUANTE'}`);
});

module.exports = app;
