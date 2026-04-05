// ============================================================
// services/theSportsDbService.js — TheSportsDB API (gratuit, sans clé)
// Tous sports — matchs, équipes, ligues, scores
// Doc : https://www.thesportsdb.com/api.php (clé "1" = accès gratuit)
// ============================================================
const axios = require('axios');

const BASE = 'https://www.thesportsdb.com/api/v1/json/3';

// Ligues majeures (IDs TheSportsDB)
const LEAGUES = [
  { id: 4328, name: 'Premier League',  country: '🇬🇧' },
  { id: 4335, name: 'La Liga',         country: '🇪🇸' },
  { id: 4331, name: 'Bundesliga',      country: '🇩🇪' },
  { id: 4332, name: 'Serie A',         country: '🇮🇹' },
  { id: 4334, name: 'Ligue 1',         country: '🇫🇷' },
  { id: 4480, name: 'Champions League',country: '🌍' },
];

/**
 * Derniers matchs d'une ligue
 */
async function fetchRecentMatches(leagueId = 4328, limit = 5) {
  try {
    const r = await axios.get(`${BASE}/eventspastleague.php`, {
      params: { id: leagueId },
      timeout: 8000,
    });
    const events = r.data?.events || [];
    return events.slice(-limit).reverse().map(e => ({
      id:           e.idEvent,
      homeTeam:     e.strHomeTeam,
      awayTeam:     e.strAwayTeam,
      homeScore:    e.intHomeScore,
      awayScore:    e.intAwayScore,
      date:         e.dateEvent,
      time:         e.strTime,
      league:       e.strLeague,
      season:       e.strSeason,
      stadium:      e.strVenue,
      homeThumb:    e.strThumb || null,
      url:          `https://www.thesportsdb.com/event/${e.idEvent}`,
      status:       'finished',
    }));
  } catch (e) {
    console.warn('[TheSportsDB recent]', e.message);
    return [];
  }
}

/**
 * Prochains matchs d'une ligue
 */
async function fetchUpcomingMatches(leagueId = 4328, limit = 5) {
  try {
    const r = await axios.get(`${BASE}/eventsnextleague.php`, {
      params: { id: leagueId },
      timeout: 8000,
    });
    const events = r.data?.events || [];
    return events.slice(0, limit).map(e => ({
      id:        e.idEvent,
      homeTeam:  e.strHomeTeam,
      awayTeam:  e.strAwayTeam,
      date:      e.dateEvent,
      time:      e.strTime,
      league:    e.strLeague,
      season:    e.strSeason,
      stadium:   e.strVenue,
      url:       `https://www.thesportsdb.com/event/${e.idEvent}`,
      status:    'upcoming',
    }));
  } catch (e) {
    console.warn('[TheSportsDB upcoming]', e.message);
    return [];
  }
}

/**
 * Récupère résultats + prochains matchs de toutes les ligues majeures
 */
async function fetchAllLeagues() {
  const results = await Promise.allSettled(
    LEAGUES.map(async l => {
      const [recent, upcoming] = await Promise.allSettled([
        fetchRecentMatches(l.id, 3),
        fetchUpcomingMatches(l.id, 3),
      ]);
      return {
        leagueId: l.id,
        name:     l.name,
        country:  l.country,
        recent:   recent.status === 'fulfilled' ? recent.value : [],
        upcoming: upcoming.status === 'fulfilled' ? upcoming.value : [],
      };
    })
  );
  return results.filter(r => r.status === 'fulfilled').map(r => r.value);
}

module.exports = { fetchRecentMatches, fetchUpcomingMatches, fetchAllLeagues, LEAGUES };
