// ============================================================
// routes/hist.js — Archives historiques
// GET /api/hist/onthisday          → Wikipedia "En ce jour" (événements)
// GET /api/hist/onthisday/:mm/:dd  → Date précise
// GET /api/hist/search?q=QUERY     → Chronicling America (presse historique)
// ============================================================

const express = require('express');
const router  = express.Router();
const axios   = require('axios');

// GET /api/hist/onthisday?month=MM&day=DD
router.get('/onthisday', async (req, res) => {
  try {
    const now   = new Date();
    const month = String(req.query.month || now.getMonth() + 1).padStart(2, '0');
    const day   = String(req.query.day   || now.getDate()).padStart(2, '0');
    const lang  = req.query.lang || 'fr';

    const wikiLang = lang === 'fr' ? 'fr' : lang === 'es' ? 'es' : 'en';
    const url = `https://${wikiLang}.wikipedia.org/api/rest_v1/feed/onthisday/all/${month}/${day}`;
    const { data } = await axios.get(url, {
      timeout: 8000,
      headers: { 'User-Agent': 'infonews.day/1.0' },
    });

    const mapEvent = e => ({
      year:    e.year,
      text:    e.text,
      pages:   (e.pages || []).slice(0, 2).map(p => ({
        title:     p.titles?.normalized || p.title,
        url:       p.content_urls?.desktop?.page || '',
        thumbnail: p.thumbnail?.source || null,
      })),
    });

    res.json({
      month, day,
      fetchedAt:  new Date().toISOString(),
      events:     (data.events     || []).slice(0, 20).map(mapEvent),
      births:     (data.births     || []).slice(0, 10).map(mapEvent),
      deaths:     (data.deaths     || []).slice(0, 10).map(mapEvent),
      holidays:   (data.holidays   || []).slice(0, 5).map(mapEvent),
      selected:   (data.selected   || []).slice(0, 5).map(mapEvent),
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/hist/search?q=QUERY&year=YYYY
router.get('/search', async (req, res) => {
  try {
    const q    = req.query.q || 'world news';
    const year = req.query.year || '';
    const page = parseInt(req.query.page) || 1;

    // Chronicling America — Library of Congress (domaine public)
    const params = new URLSearchParams({
      format:     'json',
      proxtext:    q,
      rows:        20,
      page:        page,
      sort:        'relevance',
      ...(year ? { date1: year, date2: year, dateFilterType: 'yearRange' } : {}),
    });
    const url = `https://chroniclingamerica.loc.gov/search/pages/results/?${params}`;
    const { data } = await axios.get(url, { timeout: 10000 });

    const items = (data.items || []).map(item => ({
      title:     item.title || item.place_of_publication?.[0] || 'Archive',
      date:      item.date,
      url:       `https://chroniclingamerica.loc.gov${item.url}`,
      newspaper: Array.isArray(item.title_normal) ? item.title_normal[0] : item.title_normal || '',
      state:     item.state?.[0] || '',
      subject:   item.subject?.[0] || '',
      ocr:       (item.ocr_eng || '').slice(0, 300),
    }));

    res.json({
      query:      q,
      total:      data.totalItems || 0,
      page,
      items,
      source:     'Chronicling America — Library of Congress',
      license:    'Domaine public',
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
