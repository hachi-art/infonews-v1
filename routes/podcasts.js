// ============================================================
// routes/podcasts.js — Podcasts RSS publics
// GET /api/podcasts           → épisodes récents de tous les podcasts
// GET /api/podcasts/list      → liste des podcasts disponibles
// GET /api/podcasts/:id       → épisodes d'un podcast spécifique
// ============================================================

const express = require('express');
const router  = express.Router();
const Parser  = require('rss-parser');
const parser  = new Parser({
  timeout: 10000,
  headers: { 'User-Agent': 'infonews.day/1.0' },
  customFields: { item: [['itunes:duration', 'duration'], ['itunes:image', 'image']] },
});

const PODCASTS = [
  { id: 'bbc_global',  label: 'BBC Global News',         lang: 'en', cat: 'monde',    url: 'https://podcasts.files.bbci.co.uk/p02nq0gn.rss' },
  { id: 'rfi',         label: 'RFI — Le Journal',        lang: 'fr', cat: 'monde',    url: 'https://www.rfi.fr/fr/podcasts/journal-en-francais-facile/podcast' },
  { id: 'ft_news',     label: 'FT News Briefing',        lang: 'en', cat: 'éco',      url: 'https://feeds.acast.com/public/shows/ft-news-briefing' },
  { id: 'radiolab',    label: 'Radiolab',                lang: 'en', cat: 'science',  url: 'https://feeds.simplecast.com/EmVW7VGp' },
  { id: '99pi',        label: '99% Invisible',           lang: 'en', cat: 'design',   url: 'https://feeds.simplecast.com/BqbsxVfO' },
  { id: 'freakonomics',label: 'Freakonomics Radio',      lang: 'en', cat: 'société',  url: 'https://feeds.simplecast.com/Y6wno_aR' },
  { id: 'darknet',     label: 'Darknet Diaries',         lang: 'en', cat: 'cyber',    url: 'https://feeds.megaphone.fm/darknetdiaries' },
  { id: 'huberman',    label: 'Huberman Lab',            lang: 'en', cat: 'santé',    url: 'https://feeds.megaphone.fm/hubermanlab' },
];

function mapEpisode(item, podcast) {
  return {
    title:       item.title,
    url:         item.link || item.enclosure?.url,
    audio:       item.enclosure?.url || null,
    duration:    item.duration || null,
    summary:     (item.contentSnippet || item.content || '').slice(0, 250),
    publishedAt: item.pubDate || item.isoDate,
    podcast:     podcast.label,
    podcastId:   podcast.id,
    lang:        podcast.lang,
    cat:         podcast.cat,
    image:       item.image?.$ ? item.image.$['href'] : (item.image?.url || item.image || null),
  };
}

router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 3;
    const results = await Promise.allSettled(
      PODCASTS.map(p => parser.parseURL(p.url).then(f =>
        f.items.slice(0, limit).map(i => mapEpisode(i, p))
      ))
    );
    const episodes = results
      .filter(r => r.status === 'fulfilled')
      .flatMap(r => r.value)
      .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
      .slice(0, 30);
    res.json({ total: episodes.length, episodes });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/list', (req, res) => {
  res.json({ podcasts: PODCASTS.map(({ id, label, lang, cat }) => ({ id, label, lang, cat })) });
});

router.get('/:id', async (req, res) => {
  try {
    const p     = PODCASTS.find(p => p.id === req.params.id);
    if (!p) return res.status(404).json({ error: 'Podcast non trouvé' });
    const limit = parseInt(req.query.limit) || 10;
    const feed  = await parser.parseURL(p.url);
    const episodes = feed.items.slice(0, limit).map(i => mapEpisode(i, p));
    res.json({ podcast: p.label, total: episodes.length, episodes });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
