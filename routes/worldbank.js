// ============================================================
// routes/worldbank.js — World Bank Open Data
// GET /api/worldbank/gdp              → top 15 PIB mondial
// GET /api/worldbank/indicator/:key   → indicateur spécifique
// GET /api/worldbank/dashboard        → GDP + pop + CO2 + espérance
// ============================================================

const express = require('express');
const router  = express.Router();
const { fetchTopGDP, fetchIndicator, fetchDashboard, INDICATORS } = require('../services/worldbankService');

router.get('/gdp', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 15;
    const data  = await fetchTopGDP(limit);
    res.json({ indicator: 'GDP', unit: 'USD', source: 'World Bank', total: data.length, data });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/indicator/:key', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const data  = await fetchIndicator(req.params.key, limit);
    const meta  = INDICATORS[req.params.key] || {};
    res.json({ indicator: req.params.key, label: meta.label, unit: meta.unit, source: 'World Bank', data });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/dashboard', async (req, res) => {
  try {
    const data = await fetchDashboard();
    res.json({ source: 'World Bank', fetchedAt: new Date().toISOString(), ...data });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
