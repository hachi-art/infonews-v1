const express = require('express');
const router = express.Router();
const axios = require('axios');

router.get('/', async (req, res) => {
  try {
    const { base = 'EUR' } = req.query;
    const r = await axios.get(`https://api.frankfurter.app/latest?from=${base}`, { timeout: 6000 });
    res.json({ base, rates: r.data.rates, date: r.data.date });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
