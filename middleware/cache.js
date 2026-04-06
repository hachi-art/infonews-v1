// ============================================================
// middleware/cache.js — Cache serveur en mémoire (node-cache)
// TTL par défaut : 10 minutes
// ============================================================

const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

// Middleware Express : cache les réponses JSON
function cacheMiddleware(ttlSeconds = 600) {
  return (req, res, next) => {
    const key = `route:${req.originalUrl}`;
    const cached = cache.get(key);
    if (cached !== undefined) {
      return res.json(cached);
    }
    // Intercept res.json
    const originalJson = res.json.bind(res);
    res.json = (data) => {
      if (res.statusCode === 200) cache.set(key, data, ttlSeconds);
      return originalJson(data);
    };
    next();
  };
}

// Helpers directs pour les services
function get(key)             { return cache.get(key); }
function set(key, val, ttl)   { return cache.set(key, val, ttl ?? 600); }
function del(key)             { return cache.del(key); }
function flush()              { return cache.flushAll(); }

module.exports = { cacheMiddleware, get, set, del, flush };
