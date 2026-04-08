// ============================================================
// routes/news.js — Routes API actualités
// GET /api/news?category=techno&source=guardian&limit=50&group=west
// ============================================================

const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/newsController');

// Route principale (toutes sources, avec filtres)
router.get('/', ctrl.getAllNews);

// Sources Occident
router.get('/bbc',         ctrl.getBBCNews);
router.get('/lemonde',     ctrl.getLemondeNews);
router.get('/newsapi',     ctrl.getNewsAPI);
router.get('/guardian',    ctrl.getGuardianNews);
router.get('/dw',          ctrl.getDWNews);
router.get('/euronews',    ctrl.getEuronewsNews);
router.get('/reuters',     ctrl.getReutersNews);

// Sources Orient / État ⚠️
router.get('/aljazeera',   ctrl.getAlJazeeraNews);
router.get('/xinhua',      ctrl.getXinhuaNews);
router.get('/tass',        ctrl.getTASSNews);
router.get('/trtworld',    ctrl.getTRTWorldNews);
router.get('/nhk',         ctrl.getNHKNews);
router.get('/yonhap',      ctrl.getYonhapNews);
router.get('/anadolu',     ctrl.getAnadoluNews);

// Sources Afrique & Latam
router.get('/africanews',  ctrl.getAfricanewsNews);
router.get('/allafrica',   ctrl.getAllAfricaNews);
router.get('/telesur',     ctrl.getTelesurNews);

// Tech & Sciences
router.get('/techcrunch',  ctrl.getTechCrunchNews);
router.get('/hackernews',  ctrl.getHackerNews);
router.get('/bleeping',    ctrl.getBleepingNews);
router.get('/esa',         ctrl.getESANews);
router.get('/ai',          ctrl.getAIBlogNews);
router.get('/who',         ctrl.getWHONews);

// Culture & Screen
router.get('/variety',     ctrl.getVarietyNews);

// Indépendants
router.get('/independent', async (req, res) => {
  // Agrège plusieurs sources indépendantes
  const ctrl2 = require('../controllers/newsController');
  req.query.group = 'indep';
  return ctrl2.getAllNews(req, res);
});

module.exports = router;
