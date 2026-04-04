const express = require('express');
const router = express.Router();
const { fetchCrypto, fetchMarkets } = require('../services/financeService');

router.get('/', async (req, res) => {
  const [crypto, markets] = await Promise.allSettled([fetchCrypto(), fetchMarkets()]);
  res.json({
    fetchedAt: new Date().toISOString(),
    crypto: crypto.status === 'fulfilled' ? crypto.value : [],
    markets: markets.status === 'fulfilled' ? markets.value : []
  });
});

module.exports = router;
