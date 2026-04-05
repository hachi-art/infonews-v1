// ============================================================
// services/youtubeRssService.js — YouTube RSS (gratuit, sans clé)
// Flux RSS natif YouTube : youtube.com/feeds/videos.xml?channel_id=XXX
// Aucune clé API requise
// ============================================================
const Parser = require('rss-parser');
const parser = new Parser({ timeout: 10000, headers: { 'User-Agent': 'infonews.day/2.0' } });

// Chaînes YouTube majeures (ID de chaîne)
const YT_CHANNELS = [
  { id: 'UCknLrEdhRCp1aegoMqRaCZg', name: 'Al Jazeera English',  category: 'monde' },
  { id: 'UCIALMKvObZNtJ6AmdCLP7Lg', name: 'Bloomberg TV',       category: 'eco'   },
  { id: 'UCeY0bbntWzzVIaj2z3QigXg', name: 'NBC News',           category: 'monde' },
  { id: 'UCYfdidRxbB8Qhf0Nx7ioOYw', name: 'Vice News',          category: 'monde' },
  { id: 'UCBcRF18a7Qf58cCRy5xuWwQ', name: 'PBS NewsHour',       category: 'monde' },
  { id: 'UChqUTb7kYRX8-EiaN3XFrSQ', name: 'Reuters',            category: 'monde' },
  { id: 'UCddiUEpeqJcYeBxX1IVBKvQ', name: 'The Economist',      category: 'eco'   },
  { id: 'UCWX3yGbODI3HLEHMbMsQgMg', name: 'DW Documentary',    category: 'monde' },
  { id: 'UCZGkMagXXHzJKoGUk9YJE8g', name: 'Euronews',          category: 'monde' },
  { id: 'UCnUYZLuoy1rq1aVMwx4aTzw', name: 'TED',               category: 'science'},
  { id: 'UCVTyTA7-g9nopHeHbeuvpRA', name: 'Lex Fridman',        category: 'techno' },
  { id: 'UCoxcjq-8xIDTYp3uz647V5A', name: 'Numberphile',        category: 'science'},
];

const YT_RSS_BASE = 'https://www.youtube.com/feeds/videos.xml?channel_id=';

function normalize(item, channelName, category) {
  return {
    id:          item.guid || item.link,
    title:       item.title || 'Sans titre',
    summary:     item.contentSnippet || item.summary || '',
    url:         item.link,
    source:      `YouTube — ${channelName}`,
    category,
    publishedAt: item.pubDate || item.isoDate ? new Date(item.pubDate || item.isoDate).toISOString() : new Date().toISOString(),
    imageUrl:    item['media:group']?.['media:thumbnail']?.[0]?.$.url
                 || item['media:thumbnail']?.$.url
                 || null,
    lang:        'en',
    type:        'video',
    videoId:     item.id?.split(':').pop() || null,
  };
}

async function fetchYouTubeChannel(channelId, channelName, category, limit = 5) {
  const data = await parser.parseURL(`${YT_RSS_BASE}${channelId}`);
  return data.items.slice(0, limit).map(i => normalize(i, channelName, category));
}

async function fetchYouTubeNews(channelIds = null, limit = 5) {
  const channels = channelIds
    ? YT_CHANNELS.filter(c => channelIds.includes(c.id))
    : YT_CHANNELS;

  const results = await Promise.allSettled(
    channels.map(c => fetchYouTubeChannel(c.id, c.name, c.category, limit))
  );
  return results.filter(r => r.status === 'fulfilled').flatMap(r => r.value);
}

module.exports = { fetchYouTubeNews, fetchYouTubeChannel, YT_CHANNELS };
