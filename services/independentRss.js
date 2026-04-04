// ============================================================
// services/independentRss.js — Médias indépendants mondiaux
// ============================================================
const Parser = require('rss-parser');

const parser = new Parser({
  timeout: 10000,
  headers: { 'User-Agent': 'infonews.day/2.0 (+https://infonews.day)' }
});

const INDEPENDENT_FEEDS = [
  { name: 'Mr Mondialisation', url: 'https://mrmondialisation.org/feed/',                  lang: 'fr', badge: 'MrM' },
  { name: 'Global Voices',     url: 'https://globalvoices.org/feeds/',                      lang: 'en', badge: 'GV'  },
  { name: 'The Intercept',     url: 'https://theintercept.com/feeds/',                      lang: 'en', badge: 'INT' },
  { name: 'Rest of World',     url: 'https://restofworld.org/feed/latest',                  lang: 'en', badge: 'ROW' },
  { name: 'Bellingcat',        url: 'https://www.bellingcat.com/rss/',                      lang: 'en', badge: 'BEL' },
  { name: 'Basta!',            url: 'https://basta.media/spip.php?page=backend',            lang: 'fr', badge: 'BASTA' },
  { name: 'The Conversation',  url: 'https://theconversation.com/fr/articles.atom',         lang: 'fr', badge: 'CONV' },
  { name: 'Common Dreams',     url: 'https://commondreams.org/rss.xml',                     lang: 'en', badge: 'CD'  },
];

function normalize(item, source) {
  return {
    id: item.guid || item.link,
    title: item.title || 'Sans titre',
    summary: item.contentSnippet || item.summary || '',
    url: item.link,
    source: source.name,
    badge: source.badge,
    category: 'independent',
    publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
    imageUrl: item.enclosure?.url || null,
    lang: source.lang
  };
}

async function fetchIndependentNews() {
  const results = await Promise.allSettled(
    INDEPENDENT_FEEDS.map(async feed => {
      const data = await parser.parseURL(feed.url);
      return data.items.slice(0, 8).map(item => normalize(item, feed));
    })
  );

  return results
    .filter(r => r.status === 'fulfilled')
    .flatMap(r => r.value);
}

module.exports = { fetchIndependentNews };
