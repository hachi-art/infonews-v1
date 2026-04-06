// ============================================================
// services/redditService.js — Reddit RSS (server-side, no CORS)
// ============================================================

const Parser = require('rss-parser');
const parser = new Parser({
  timeout: 10000,
  headers: { 'User-Agent': 'infonews.day/1.0 (news aggregator)' },
});

const SUBREDDITS = [
  { id: 'worldnews',  label: 'World News',  url: 'https://www.reddit.com/r/worldnews/.rss' },
  { id: 'europe',     label: 'Europe',       url: 'https://www.reddit.com/r/europe/.rss' },
  { id: 'science',    label: 'Science',      url: 'https://www.reddit.com/r/science/.rss' },
  { id: 'technology', label: 'Technology',   url: 'https://www.reddit.com/r/technology/.rss' },
  { id: 'geopolitics',label: 'Geopolitics',  url: 'https://www.reddit.com/r/geopolitics/.rss' },
];

async function fetchSubreddit(subId = 'worldnews', limit = 15) {
  const sub = SUBREDDITS.find(s => s.id === subId) || SUBREDDITS[0];
  const feed = await parser.parseURL(sub.url);
  return {
    subreddit: sub.id,
    label: sub.label,
    posts: feed.items.slice(0, limit).map(item => ({
      title: item.title?.replace(/^\/r\/\w+ on Reddit: /, ''),
      url:   item.link,
      publishedAt: item.pubDate || item.isoDate,
      source: `r/${sub.id}`,
    })),
  };
}

async function fetchMulti(limit = 10) {
  const results = await Promise.allSettled(
    SUBREDDITS.slice(0, 3).map(s => fetchSubreddit(s.id, limit))
  );
  const posts = results
    .filter(r => r.status === 'fulfilled')
    .flatMap(r => r.value.posts)
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
    .slice(0, limit);
  return posts;
}

module.exports = { fetchSubreddit, fetchMulti, SUBREDDITS };
