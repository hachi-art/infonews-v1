// ============================================================
// routes/sitemap.js — Sitemap XML dynamique 25 pages
// GET /sitemap.xml
// ============================================================
const express = require('express');
const router  = express.Router();

const BASE_URL = process.env.BASE_URL || 'https://infonews.day';

const PAGES = [
  // Pôle 1 — World Pulse
  { path: '/#world-pulse',      title: 'World Pulse — Accueil Dashboard Mondial',         freq: 'always',  prio: '1.0' },
  { path: '/#globe-satellite',  title: 'Globe Satellite — Vue 3D NASA en temps réel',     freq: 'hourly',  prio: '0.9' },
  // Pôle 2 — Éco & Pouvoir
  { path: '/#marches',          title: 'Marchés Mondiaux — S&P500, Nikkei, JSE, Tadawul', freq: 'always',  prio: '0.9' },
  { path: '/#matieres',         title: 'Matières Premières — Or, Pétrole, Lithium, Blé',  freq: 'always',  prio: '0.8' },
  { path: '/#institutions',     title: 'Institutions — FED, BCE, FMI, Banque Mondiale',   freq: 'daily',   prio: '0.8' },
  { path: '/#geopolitique',     title: 'Rapports Géopolitiques — CIA, ONU, OMS, UNESCO',  freq: 'daily',   prio: '0.8' },
  // Pôle 3 — Newsroom
  { path: '/#occident',         title: 'Agences Occidentales — Reuters, AP, AFP, BBC',    freq: 'always',  prio: '0.9' },
  { path: '/#orient',           title: 'Orient & Asie — Xinhua, TASS, NHK, Yonhap',      freq: 'hourly',  prio: '0.8' },
  { path: '/#moyen-orient',     title: 'Moyen-Orient — Al Jazeera, TRT, Anadolu Agency',  freq: 'hourly',  prio: '0.8' },
  { path: '/#afrique-latam',    title: 'Afrique & LatAm — Africanews, Telesur, MercoPress',freq: 'hourly', prio: '0.8' },
  { path: '/#editorial',        title: 'Éditorial & Synthèse IA — Journalisme Citoyen',   freq: 'daily',   prio: '0.7' },
  // Pôle 4 — Screen & Stream
  { path: '/#cinema',           title: 'Cinéma & Séries — TMDB, Netflix, HBO, Variety',   freq: 'daily',   prio: '0.7' },
  { path: '/#sport',            title: 'Sports & Diffusion — DAZN, beIN, Sky Sports',     freq: 'always',  prio: '0.8' },
  { path: '/#culture',          title: 'Culture & Événements — Dice, RA, Fever',           freq: 'daily',   prio: '0.7' },
  // Pôle 5 — Tech & Terre
  { path: '/#ia-gafam',         title: 'GAFAM & IA — OpenAI, DeepMind, Apple, Microsoft', freq: 'hourly',  prio: '0.8' },
  { path: '/#cyber',            title: 'Cybersécurité — BleepingComputer, Alertes CVE',   freq: 'hourly',  prio: '0.8' },
  { path: '/#espace',           title: 'Espace & Océans — NASA, ESA, CNSA, NOAA',         freq: 'daily',   prio: '0.7' },
  { path: '/#gaming',           title: 'Geek & Gaming — Actu Hardware, Jeux Vidéo',       freq: 'daily',   prio: '0.7' },
  // Pôle 6 — Music Pro
  { path: '/#streaming',        title: 'Streaming Public — Spotify, SoundCloud, Deezer',  freq: 'daily',   prio: '0.7' },
  { path: '/#dj-pro',           title: 'Espace DJ Pro — Beatport, Traxsource, Junodownload', freq: 'daily', prio: '0.7' },
  { path: '/#radios',           title: 'Radios du Monde — Radio Garden Live',              freq: 'always',  prio: '0.7' },
  { path: '/#droits-musique',   title: 'Droits & Industrie Musicale — SACEM, BMI, ASCAP', freq: 'weekly',  prio: '0.6' },
  { path: '/#litterature',      title: 'Littérature & Manga — Glénat, Marvel, Arte',      freq: 'weekly',  prio: '0.6' },
  // Pôle 7 — Social & Lab
  { path: '/#social-pulse',     title: 'Social Pulse — X, Instagram, TikTok, Reddit Trends', freq: 'always', prio: '0.8' },
  { path: '/#transparence',     title: 'Transparence & Contact — 100+ APIs, Manifeste Éthique', freq: 'monthly', prio: '0.5' },
];

router.get('/', (req, res) => {
  const now = new Date().toISOString().split('T')[0];

  const urlsXml = PAGES.map(p => `  <url>
    <loc>${BASE_URL}${p.path}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${p.freq}</changefreq>
    <priority>${p.prio}</priority>
  </url>`).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urlsXml}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.send(xml);
});

module.exports = router;
