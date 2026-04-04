// ============================================================
// services/hackerNewsService.js — API HackerNews (sans clé API)
// Source : news.ycombinator.com (Y Combinator)
// Articles tech/startup/IA les plus populaires du moment
// Doc : https://github.com/HackerNews/API
// ============================================================

const axios = require('axios');

const HN_BASE = 'https://hacker-news.firebaseio.com/v0';

/**
 * Récupère les top stories HackerNews normalisées pour infonews.day.
 * @param {number} limit - Nombre d'articles à retourner (défaut : 10)
 * @returns {Promise<Array>} Articles normalisés
 */
async function fetchHackerNews(limit = 10) {
  // 1. Récupérer les IDs des top stories
  const idsRes = await axios.get(`${HN_BASE}/topstories.json`, { timeout: 8000 });
  const ids = idsRes.data.slice(0, limit * 3); // on prend 3x pour filtrer les Ask HN / sans URL

  // 2. Récupérer chaque story en parallèle
  const storyResults = await Promise.allSettled(
    ids.map(id =>
      axios.get(`${HN_BASE}/item/${id}.json`, { timeout: 5000 }).then(r => r.data)
    )
  );

  const articles = [];
  for (const result of storyResults) {
    if (result.status !== 'fulfilled') continue;
    const item = result.value;

    // Filtrer : on ne garde que les articles avec une URL externe
    if (!item || !item.url || item.type !== 'story') continue;

    articles.push({
      id: `hn-${item.id}`,
      title: item.title || 'Sans titre',
      summary: item.text
        ? item.text.replace(/<[^>]+>/g, '').slice(0, 200)
        : `${item.score || 0} points · ${item.descendants || 0} commentaires`,
      url: item.url,
      source: 'HackerNews',
      category: 'techno',
      publishedAt: item.time
        ? new Date(item.time * 1000).toISOString()
        : new Date().toISOString(),
      imageUrl: null,
      lang: 'en',
      author: item.by || null,
      score: item.score || 0
    });

    if (articles.length >= limit) break;
  }

  console.log(`[HackerNews] ${articles.length} articles récupérés`);
  return articles;
}

module.exports = { fetchHackerNews };
