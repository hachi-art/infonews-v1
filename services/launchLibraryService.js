// ============================================================
// services/launchLibraryService.js — Launch Library 2 (gratuit, sans clé)
// Prochains lancements spatiaux — SpaceX, NASA, ESA, Roscosmos…
// API : https://ll.thespacedevs.com/2.2.0/
// ============================================================
const axios = require('axios');

const BASE = 'https://ll.thespacedevs.com/2.2.0';

async function fetchUpcomingLaunches(limit = 6) {
  try {
    const r = await axios.get(`${BASE}/launch/upcoming/`, {
      params: { limit, format: 'json', mode: 'list' },
      timeout: 10000,
      headers: { 'User-Agent': 'infonews.day/3.1' },
    });
    return (r.data?.results || []).map(l => ({
      id:          l.id,
      name:        l.name,
      status:      l.status?.name || 'À confirmer',
      statusAbbr:  l.status?.abbrev || '?',
      net:         l.net,           // Net Estimated Time
      windowStart: l.window_start,
      windowEnd:   l.window_end,
      rocket:      l.rocket?.configuration?.name || 'Inconnue',
      provider:    l.launch_service_provider?.name || '',
      location:    l.pad?.location?.name || '',
      missionName: l.mission?.name || l.name,
      missionType: l.mission?.type || '',
      missionDesc: l.mission?.description || '',
      imageUrl:    l.image || null,
      url:         l.url,
      infographic: l.infographic || null,
    }));
  } catch (e) {
    console.warn('[LaunchLibrary]', e.message);
    return [];
  }
}

async function fetchPreviousLaunches(limit = 5) {
  try {
    const r = await axios.get(`${BASE}/launch/previous/`, {
      params: { limit, format: 'json', mode: 'list', ordering: '-net' },
      timeout: 10000,
      headers: { 'User-Agent': 'infonews.day/3.1' },
    });
    return (r.data?.results || []).map(l => ({
      id:       l.id,
      name:     l.name,
      status:   l.status?.name || '?',
      net:      l.net,
      rocket:   l.rocket?.configuration?.name || 'Inconnue',
      provider: l.launch_service_provider?.name || '',
      location: l.pad?.location?.name || '',
      success:  l.status?.abbrev === 'Success',
      imageUrl: l.image || null,
    }));
  } catch (e) {
    console.warn('[LaunchLibrary previous]', e.message);
    return [];
  }
}

module.exports = { fetchUpcomingLaunches, fetchPreviousLaunches };
