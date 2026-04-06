// ============================================================
// routes/tech.js — Tech & Science & IA
// GET /api/tech/arxiv-ia     → ArXiv cs.AI + cs.LG
// GET /api/tech/arxiv-sci    → ArXiv physics + q-bio
// GET /api/tech/feargreed    → Fear & Greed crypto (alternative.me)
// ============================================================
const express = require('express');
const router  = express.Router();
const axios   = require('axios');
const { fetchArxivIA, fetchArxivScience } = require('../services/arxivService');

router.get('/arxiv-ia', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const data  = await fetchArxivIA(limit);
    res.json({ total: data.length, source: 'ArXiv — cs.AI / cs.LG', papers: data });
  } catch (e) { res.status(500).json({ error: 'Erreur ArXiv IA', detail: e.message }); }
});

router.get('/arxiv-sci', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const data  = await fetchArxivScience(limit);
    res.json({ total: data.length, source: 'ArXiv — Physics / q-bio', papers: data });
  } catch (e) { res.status(500).json({ error: 'Erreur ArXiv Science', detail: e.message }); }
});

router.get('/feargreed', async (req, res) => {
  try {
    const r = await axios.get('https://api.alternative.me/fng/?limit=7', { timeout: 8000 });
    const data = r.data?.data || [];
    res.json({
      source: 'Alternative.me Fear & Greed Index',
      current: data[0] || null,
      history: data.slice(0, 7),
    });
  } catch (e) { res.status(500).json({ error: 'Erreur Fear & Greed', detail: e.message }); }
});

module.exports = router;
