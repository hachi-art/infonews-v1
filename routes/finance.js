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

// GET /api/finance/crypto
router.get('/crypto', async (req, res) => {
  try {
    const data = await fetchCrypto();
    // Map to CoinGecko-style keys expected by the frontend
    res.json({ crypto: data.map(c => ({
      name: c.name,
      symbol: c.symbol,
      current_price: c.price,
      price_change_percentage_24h: c.change24h,
      price_change_percentage_7d_in_currency: c.change7d,
      market_cap: c.marketCap,
      sparkline_in_7d: { price: c.sparkline }
    })) });
  } catch(err) {
    res.status(500).json({ error: 'Erreur CoinGecko', detail: err.message });
  }
});

// GET /api/finance/markets
router.get('/markets', async (req, res) => {
  try {
    const data = await fetchMarkets();
    res.json({ markets: data.map(m => ({
      name: m.name,
      symbol: m.symbol,
      price: m.price,
      change: m.change,
      changePercent: m.changePct,
      currency: m.currency
    })) });
  } catch(err) {
    res.status(500).json({ error: 'Erreur Yahoo Finance', detail: err.message });
  }
});

module.exports = router;
