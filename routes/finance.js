const express = require('express');
const router = express.Router();
const { fetchCrypto, fetchMarkets } = require('../services/financeService');

// GET /api/finance — tout
router.get('/', async (req, res) => {
  const [crypto, markets] = await Promise.allSettled([fetchCrypto(), fetchMarkets()]);
  res.json({
    fetchedAt: new Date().toISOString(),
    crypto:  crypto.status  === 'fulfilled' ? crypto.value  : [],
    markets: markets.status === 'fulfilled' ? markets.value : []
  });
});

// GET /api/finance/crypto — CoinGecko native format
router.get('/crypto', async (req, res) => {
  try {
    const data = await fetchCrypto();
    res.json({ crypto: data });
  } catch(err) {
    res.status(500).json({ error: 'Erreur CoinGecko', detail: err.message });
  }
});

// GET /api/finance/markets — Yahoo Finance
router.get('/markets', async (req, res) => {
  try {
    const data = await fetchMarkets();
    res.json({ markets: data });
  } catch(err) {
    res.status(500).json({ error: 'Erreur Yahoo Finance', detail: err.message });
  }
});

module.exports = router;
