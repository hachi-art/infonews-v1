// ============================================================
// services/exchangeService.js — Taux de change via Frankfurter
// API 100% gratuite, sans clé — https://www.frankfurter.app/
// Base EUR → USD, GBP, JPY, CHF, CNY, CAD, BRL
// ============================================================

const axios = require('axios');

const FRANKFURTER_URL = 'https://api.frankfurter.app/latest';

const CURRENCIES = {
  USD: { name: 'Dollar US',       flag: '🇺🇸' },
  GBP: { name: 'Livre sterling',  flag: '🇬🇧' },
  JPY: { name: 'Yen japonais',    flag: '🇯🇵' },
  CHF: { name: 'Franc suisse',    flag: '🇨🇭' },
  CNY: { name: 'Yuan chinois',    flag: '🇨🇳' },
  CAD: { name: 'Dollar canadien', flag: '🇨🇦' },
  BRL: { name: 'Réal brésilien',  flag: '🇧🇷' }
};

/**
 * Récupère les taux de change EUR → devises majeures.
 * @returns {Promise<Object>} { base, date, rates: [{code, name, flag, rate}] }
 */
async function fetchExchangeRates() {
  const symbols = Object.keys(CURRENCIES).join(',');
  const res = await axios.get(FRANKFURTER_URL, {
    params: { base: 'EUR', symbols },
    timeout: 8000
  });

  const { base, date, rates } = res.data;

  const formattedRates = Object.entries(rates).map(([code, rate]) => ({
    code,
    name: CURRENCIES[code]?.name || code,
    flag: CURRENCIES[code]?.flag || '🌍',
    rate: parseFloat(rate.toFixed(code === 'JPY' ? 2 : 4))
  }));

  console.log(`[Exchange] Taux récupérés (base ${base}, date ${date})`);
  return { base, date, rates: formattedRates };
}

module.exports = { fetchExchangeRates };
