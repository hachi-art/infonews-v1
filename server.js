// ============================================================
// infonews.day — Serveur principal Express v2.0
// Auteur : Sébastien Marquetoux | hachi-art/infonews-v1
// ============================================================

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const newsRouter     = require('./routes/news');
const weatherRouter  = require('./routes/weather');
const financeRouter  = require('./routes/finance');
const exchangeRouter = require('./routes/exchange');
const alertsRouter   = require('./routes/alerts');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// --- Routes ---
app.use('/api/news',     newsRouter);
app.use('/api/weather',  weatherRouter);
app.use('/api/finance',  financeRouter);
app.use('/api/exchange', exchangeRouter);
app.use('/api/alerts',   alertsRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    project: 'infonews.day',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    apis: {
      news: ['BBC', 'Le Monde', 'NewsAPI', 'The Guardian', 'Al Jazeera', 'TechCrunch', 'HackerNews'],
      weather: 'Open-Meteo (gratuit)',
      finance: 'CoinGecko + Yahoo Finance (gratuit)',
      exchange: 'Frankfurter (gratuit)',
      alerts: 'USGS Earthquakes (gratuit)'
    }
  });
});

// Route racine → index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route introuvable', path: req.path });
});

// Erreurs globales
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.message);
  res.status(500).json({ error: 'Erreur interne du serveur', detail: err.message });
});

// --- Démarrage ---
app.listen(PORT, () => {
  console.log(`[infonews.day v2] Serveur démarré sur http://localhost:${PORT}`);
  console.log(`[infonews.day] Environnement : ${process.env.NODE_ENV || 'development'}`);
  console.log(`[infonews.day] NewsAPI : ${process.env.NEWS_API_KEY ? '✅' : '❌ MANQUANTE'}`);
  console.log(`[infonews.day] Sources actives : BBC · Le Monde · NewsAPI · Guardian · Al Jazeera · TechCrunch · HackerNews`);
});

module.exports = app;
