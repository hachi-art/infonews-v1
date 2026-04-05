// ============================================================
// services/deezerService.js — Deezer Charts API (gratuit, sans clé)
// Charts officiels par pays + genres musicaux
// Doc : https://developers.deezer.com/api
// ============================================================
const axios = require('axios');

const DEEZER_CHART_URL = 'https://api.deezer.com/chart';
const EDITORIAL_LISTS = {
  france:     'https://api.deezer.com/editorial/0/charts',  // Global
  france_top: 'https://api.deezer.com/chart/0/tracks',
};

// Charts par genre (IDs Deezer genres)
const GENRE_CHARTS = [
  { id: 132, name: 'Pop'       },
  { id: 116, name: 'Rap/Hip-Hop' },
  { id: 152, name: 'Rock'     },
  { id: 113, name: 'Dance'    },
  { id: 165, name: 'R&B'      },
  { id: 106, name: 'Électro'  },
];

/**
 * Top 20 tracks mondial (chart global Deezer)
 */
async function fetchDeezerTopTracks(limit = 20) {
  try {
    const r = await axios.get(`${DEEZER_CHART_URL}/0/tracks`, {
      params: { limit },
      timeout: 8000,
    });
    return (r.data?.data || []).map((t, i) => ({
      rank:      i + 1,
      id:        t.id,
      title:     t.title,
      artist:    t.artist?.name || 'Inconnu',
      album:     t.album?.title || '',
      cover:     t.album?.cover_medium || null,
      preview:   t.preview || null,
      url:       t.link,
      duration:  t.duration,
    }));
  } catch (e) {
    console.warn('[Deezer tracks]', e.message);
    return [];
  }
}

/**
 * Top 20 artistes mondial
 */
async function fetchDeezerTopArtists(limit = 20) {
  try {
    const r = await axios.get(`${DEEZER_CHART_URL}/0/artists`, {
      params: { limit },
      timeout: 8000,
    });
    return (r.data?.data || []).map((a, i) => ({
      rank:   i + 1,
      id:     a.id,
      name:   a.name,
      image:  a.picture_medium || null,
      url:    a.link,
      fans:   a.nb_fan,
    }));
  } catch (e) {
    console.warn('[Deezer artists]', e.message);
    return [];
  }
}

/**
 * Top albums mondial
 */
async function fetchDeezerTopAlbums(limit = 10) {
  try {
    const r = await axios.get(`${DEEZER_CHART_URL}/0/albums`, {
      params: { limit },
      timeout: 8000,
    });
    return (r.data?.data || []).map((a, i) => ({
      rank:   i + 1,
      id:     a.id,
      title:  a.title,
      artist: a.artist?.name || 'Inconnu',
      cover:  a.cover_medium || null,
      url:    a.link,
    }));
  } catch (e) {
    console.warn('[Deezer albums]', e.message);
    return [];
  }
}

module.exports = { fetchDeezerTopTracks, fetchDeezerTopArtists, fetchDeezerTopAlbums };
