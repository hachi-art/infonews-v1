// ============================================================
// services/tmdbService.js — The Movie Database API
// Gratuit avec clé (inscription en 2 min sur themoviedb.org)
// Variable d'env : TMDB_API_KEY
// Sans clé : retourne données statiques
// ============================================================
const axios = require('axios');

const BASE    = 'https://api.themoviedb.org/3';
const IMG     = 'https://image.tmdb.org/t/p/w500';
const API_KEY = process.env.TMDB_API_KEY || null;

function noKeyFallback() {
  return {
    error: 'TMDB_API_KEY manquante',
    note:  'Inscription gratuite sur https://www.themoviedb.org/settings/api',
    data:  []
  };
}

/**
 * Films actuellement en salle
 */
async function fetchNowPlaying(lang = 'fr-FR', limit = 12) {
  if (!API_KEY) return noKeyFallback();
  try {
    const r = await axios.get(`${BASE}/movie/now_playing`, {
      params: { api_key: API_KEY, language: lang, page: 1 },
      timeout: 8000,
    });
    return {
      data: (r.data?.results || []).slice(0, limit).map(m => ({
        id:          m.id,
        title:       m.title,
        originalTitle: m.original_title,
        overview:    m.overview?.slice(0, 200),
        poster:      m.poster_path ? `${IMG}${m.poster_path}` : null,
        backdrop:    m.backdrop_path ? `https://image.tmdb.org/t/p/w780${m.backdrop_path}` : null,
        rating:      m.vote_average?.toFixed(1),
        voteCount:   m.vote_count,
        releaseDate: m.release_date,
        genres:      m.genre_ids || [],
        url:         `https://www.themoviedb.org/movie/${m.id}`,
        type:        'movie',
      }))
    };
  } catch (e) {
    console.warn('[TMDB nowPlaying]', e.message);
    return { data: [] };
  }
}

/**
 * Séries populaires
 */
async function fetchTrendingSeries(lang = 'fr-FR', limit = 12) {
  if (!API_KEY) return noKeyFallback();
  try {
    const r = await axios.get(`${BASE}/trending/tv/week`, {
      params: { api_key: API_KEY, language: lang },
      timeout: 8000,
    });
    return {
      data: (r.data?.results || []).slice(0, limit).map(s => ({
        id:          s.id,
        title:       s.name || s.original_name,
        overview:    s.overview?.slice(0, 200),
        poster:      s.poster_path ? `${IMG}${s.poster_path}` : null,
        rating:      s.vote_average?.toFixed(1),
        firstAirDate:s.first_air_date,
        url:         `https://www.themoviedb.org/tv/${s.id}`,
        type:        'tv',
      }))
    };
  } catch (e) {
    console.warn('[TMDB trending TV]', e.message);
    return { data: [] };
  }
}

/**
 * Films tendances de la semaine
 */
async function fetchTrendingMovies(lang = 'fr-FR', limit = 12) {
  if (!API_KEY) return noKeyFallback();
  try {
    const r = await axios.get(`${BASE}/trending/movie/week`, {
      params: { api_key: API_KEY, language: lang },
      timeout: 8000,
    });
    return {
      data: (r.data?.results || []).slice(0, limit).map(m => ({
        id:          m.id,
        title:       m.title,
        overview:    m.overview?.slice(0, 200),
        poster:      m.poster_path ? `${IMG}${m.poster_path}` : null,
        rating:      m.vote_average?.toFixed(1),
        releaseDate: m.release_date,
        url:         `https://www.themoviedb.org/movie/${m.id}`,
        type:        'movie',
      }))
    };
  } catch (e) {
    console.warn('[TMDB trending movies]', e.message);
    return { data: [] };
  }
}

module.exports = { fetchNowPlaying, fetchTrendingSeries, fetchTrendingMovies };
