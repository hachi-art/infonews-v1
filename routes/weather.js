const express = require('express');
const router = express.Router();
const { fetchWeather } = require('../services/weatherService');

router.get('/', async (req, res) => {
  try {
    const data = await fetchWeather();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
