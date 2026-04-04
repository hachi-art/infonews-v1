// ============================================================
// routes/news.js — Routes API actualités
// GET /api/news?category=techno&source=guardian&limit=50
// ============================================================

const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');

router.get('/',           newsController.getAllNews);
router.get('/bbc',        newsController.getBBCNews);
router.get('/lemonde',    newsController.getLemondeNews);
router.get('/newsapi',    newsController.getNewsAPI);
router.get('/guardian',   newsController.getGuardianNews);
router.get('/aljazeera',  newsController.getAlJazeeraNews);
router.get('/techcrunch', newsController.getTechCrunchNews);
router.get('/hackernews', newsController.getHackerNews);
router.get('/dw',         newsController.getDWNews);
router.get('/euronews',   newsController.getEuronewsNews);

module.exports = router;
