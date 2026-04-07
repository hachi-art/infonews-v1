// ============================================================
// middleware/rateLimiter.js — Rate limiting Express
// ============================================================

const rateLimit = require('express-rate-limit');

// Fix Vercel : X-Forwarded-For peut contenir plusieurs IPs séparées par virgule
// express-rate-limit v7+ exige un trustProxy explicite sur Vercel
const vercelProxy = (req) => {
  const xff = req.headers['x-forwarded-for'];
  if (!xff) return req.ip;
  return xff.split(',')[0].trim();
};

// API générale : 200 req / 15 min par IP
const apiLimiter = rateLimit({
  windowMs:        15 * 60 * 1000,
  max:             200,
  standardHeaders: true,
  legacyHeaders:   false,
  keyGenerator:    vercelProxy,
  message:         { error: 'Trop de requêtes — réessayez dans quelques minutes.' },
});

// Endpoints lourds (World Bank, Reddit, ArXiv) : 30 req / 15 min
const heavyLimiter = rateLimit({
  windowMs:        15 * 60 * 1000,
  max:             30,
  standardHeaders: true,
  legacyHeaders:   false,
  keyGenerator:    vercelProxy,
  message:         { error: 'Limite atteinte pour cette ressource.' },
});

module.exports = { apiLimiter, heavyLimiter };
