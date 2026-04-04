// ============================================================
// infonews.day — Serveur principal Express
// Auteur : Sébastien Marquetoux | hachi-art/infonews-v1
// ============================================================

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const newsRouter = require('./routes/news');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers statiques du dossier public/
app.use(express.static(path.join(__dirname, 'public')));

// --- Routes ---
app.use('/api/news', newsRouter);

// Route de santé (health check pour Render / Railway / Vercel)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    project: 'infonews.day',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Route racine → sert index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Gestion des routes inconnues
app.use((req, res) => {
  res.status(404).json({ error: 'Route introuvable', path: req.path });
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.message);
  res.status(500).json({ error: 'Erreur interne du serveur', detail: err.message });
});

// --- Démarrage ---
app.listen(PORT, () => {
  console.log(`[infonews.day] Serveur démarré sur http://localhost:${PORT}`);
  console.log(`[infonews.day] Environnement : ${process.env.NODE_ENV || 'development'}`);
  console.log(`[infonews.day] API NewsAPI : ${process.env.NEWS_API_KEY ? 'configurée' : 'MANQUANTE — vérifie .env'}`);
});

module.exports = app;
