// ============================================================
// routes/news.js — Routes API pour les news
// ============================================================

const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');

// GET /api/news
// Retourne toutes les news agrégées (BBC + Le Monde + NewsAPI)
router.get('/', newsController.getAllNews);

// GET /api/news/bbc
// Retourne uniquement les news BBC
router.get('/bbc', newsController.getBBCNews);

// GET /api/news/lemonde
// Retourne uniquement les news Le Monde
router.get('/lemonde', newsController.getLemondeNews);

// GET /api/news/newsapi
// Retourne uniquement les news NewsAPI
// Query params : ?q=<terme>&lang=fr|en&pageSize=10
router.get('/newsapi', newsController.getNewsAPI);

module.exports = router;
