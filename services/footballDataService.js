// ============================================================
// services/footballDataService.js — football-data.org API
// Gratuit avec clé (inscription en 1 min sur football-data.org)
// Variable d'env : FOOTBALL_DATA_KEY
// Sans clé : fallback vers TheSportsDB
// ============================================================
const axios = require('axios');
const { fetchAllLeagues } = require('./theSportsDbService');

const BASE    = 'https://api.football-data.org/v4';
const API_KEY = process.env.FOOTBALL_DATA_KEY || null;

// Codes ligues football-data.org
const COMPETITIONS = [
  { code: 'PL',    name: 'Premier League',   flag: '🇬🇧' },
  { code: 'PD',    name: 'La Liga',           flag: '🇪🇸' },
  { code: 'BL1',   name: 'Bundesliga',        flag: '🇩🇪' },
  { code: 'SA',    name: 'Serie A',           flag: '🇮🇹' },
  { code: 'FL1',   name: 'Ligue 1',           flag: '🇫🇷' },
  { code: 'CL',    name: 'Champions League',  flag: '🌍' },
];

/**
 * Classement d'une compétition
 */
async function fetchStandings(competitionCode = 'PL') {
  if (!API_KEY) {
    // Fallback TheSportsDB sans clé
    return { source: 'TheSportsDB', standings: [] };
  }
  try {
    const r = await axios.get(`${BASE}/competitions/${competitionCode}/standings`, {
      headers: { 'X-Auth-Token': API_KEY },
      timeout: 8000,
    });
    const table = r.data?.standings?.[0]?.table || [];
    return {
      source:      'football-data.org',
      competition: r.data?.competition?.name || competitionCode,
      season:      r.data?.season?.currentMatchday,
      standings:   table.slice(0, 10).map(t => ({
        position:   t.position,
        team:       t.team?.name,
        crest:      t.team?.crest,
        played:     t.playedGames,
        won:        t.won,
        draw:       t.draw,
        lost:       t.lost,
        goalsFor:   t.goalsFor,
        goalsAgainst: t.goalsAgainst,
        points:     t.points,
      })),
    };
  } catch (e) {
    console.warn('[football-data]', e.message);
    return { source: 'error', standings: [] };
  }
}

/**
 * Prochains matchs multi-compétitions (fallback TheSportsDB sans clé)
 */
async function fetchLiveScores() {
  if (!API_KEY) {
    // Fallback gratuit TheSportsDB
    return fetchAllLeagues();
  }
  try {
    const r = await axios.get(`${BASE}/matches`, {
      headers: { 'X-Auth-Token': API_KEY },
      params: { status: 'LIVE,IN_PLAY,PAUSED' },
      timeout: 8000,
    });
    return (r.data?.matches || []).map(m => ({
      id:        m.id,
      homeTeam:  m.homeTeam?.name,
      awayTeam:  m.awayTeam?.name,
      homeScore: m.score?.fullTime?.home ?? m.score?.halfTime?.home ?? '-',
      awayScore: m.score?.fullTime?.away ?? m.score?.halfTime?.away ?? '-',
      status:    m.status,
      league:    m.competition?.name,
      minute:    m.minute,
    }));
  } catch (e) {
    console.warn('[football-data live]', e.message);
    return [];
  }
}

module.exports = { fetchStandings, fetchLiveScores, COMPETITIONS };
