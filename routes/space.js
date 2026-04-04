// ============================================================
// routes/space.js — NASA APOD + Space data
// ============================================================
const express = require('express');
const router = express.Router();
const { fetchAPOD } = require('../services/nasaApodService');

// GET /api/space/apod
router.get('/apod', async (req, res) => {
  try {
    const data = await fetchAPOD();
    res.json(data);
  } catch(err) {
    res.status(500).json({ error: 'Erreur NASA APOD', detail: err.message });
  }
});

module.exports = router;
