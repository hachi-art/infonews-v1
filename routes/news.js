// ============================================================
// routes/news.js — Routes API actualités
// GET /api/news?category=techno&source=guardian&limit=50
// ============================================================

const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');

// GET /api/news — toutes sources, filtrage possible par category & source
router.get('/',            newsController.getAllNews);

// Routes par source individuelle
router.get('/bbc',         newsController.getBBCNews);
router.get('/lemonde',     newsController.getLemondeNews);
router.get('/newsapi',     newsController.getNewsAPI);
router.get('/guardian',    newsController.getGuardianNews);
router.get('/aljazeera',   newsController.getAlJazeeraNews);
router.get('/techcrunch',  newsController.getTechCrunchNews);
router.get('/hackernews',  newsController.getHackerNews);

module.exports = router;
