// ============================================================
// services/guardianRss.js — Flux RSS The Guardian (sans clé API)
// 6 rubriques : monde · techno · éco · science · sport · culture
// ============================================================

const Parser = require('rss-parser');

const parser = new Parser({
  timeout: 10000,
  headers: { 'User-Agent': 'infonews.day/2.0 (+https://infonews.day)' }
});

const GUARDIAN_FEEDS = {
  monde:   { url: 'https://www.theguardian.com/world/rss',       category: 'monde'   },
  techno:  { url: 'https://www.theguardian.com/technology/rss',  category: 'techno'  },
  eco:     { url: 'https://www.theguardian.com/business/rss',    category: 'eco'     },
  science: { url: 'https://www.theguardian.com/science/rss',     category: 'science' },
  sport:   { url: 'https://www.theguardian.com/sport/rss',       category: 'sport'   },
  culture: { url: 'https://www.theguardian.com/culture/rss',     category: 'culture' }
};

function normalizeItem(item, category) {
  const imageUrl =
    item['media:content']?.$.url ||
    item.enclosure?.url ||
    extractImageFromContent(item['content:encoded'] || item.content || '') ||
    null;

  return {
    id: item.guid || item.link,
    title: item.title || 'Sans titre',
    summary: item.contentSnippet || '',
    url: item.link,
    source: 'The Guardian',
    category,
    publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
    imageUrl,
    lang: 'en',
    author: item.creator || null
  };
}

function extractImageFromContent(html) {
  const match = html.match(/src=["']([^"']+\.(jpg|jpeg|png|webp))/i);
  return match ? match[1] : null;
}

/**
 * Récupère les articles Guardian pour une ou toutes les rubriques.
 * @param {string|null} feed - Clé de rubrique (monde|techno|eco|science|sport|culture) ou null pour tout
 * @returns {Promise<Array>} Articles normalisés
 */
async function fetchGuardianNews(feed = null) {
  const feeds = feed && GUARDIAN_FEEDS[feed]
    ? [{ key: feed, ...GUARDIAN_FEEDS[feed] }]
    : Object.entries(GUARDIAN_FEEDS).map(([key, val]) => ({ key, ...val }));

  const results = await Promise.allSettled(
    feeds.map(async ({ url, category }) => {
      console.log(`[Guardian] Fetch RSS : ${url}`);
      const feedData = await parser.parseURL(url);
      return feedData.items.slice(0, 8).map(item => normalizeItem(item, category));
    })
  );

  const articles = [];
  results.forEach((r, i) => {
    if (r.status === 'fulfilled') articles.push(...r.value);
    else console.error(`[Guardian] Erreur ${feeds[i].key}: ${r.reason?.message}`);
  });

  console.log(`[Guardian] ${articles.length} articles récupérés`);
  return articles;
}

module.exports = { fetchGuardianNews, GUARDIAN_FEEDS };
