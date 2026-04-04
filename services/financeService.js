// ============================================================
// services/financeService.js — CoinGecko (crypto) + Yahoo Finance (marchés)
// Gratuit, sans clé API
// ============================================================
const axios = require('axios');

// --- CRYPTO via CoinGecko ---
async function fetchCrypto() {
  const url = 'https://api.coingecko.com/api/v3/coins/markets';
  const params = {
    vs_currency: 'eur',
    ids: 'bitcoin,ethereum,solana,ripple,cardano',
    order: 'market_cap_desc',
    sparkline: true,
    price_change_percentage: '1h,24h,7d'
  };
  const res = await axios.get(url, { params, timeout: 8000 });
  return res.data.map(c => ({
    id: c.id,
    name: c.name,
    symbol: c.symbol.toUpperCase(),
    price: c.current_price,
    change24h: c.price_change_percentage_24h,
    change7d: c.price_change_percentage_7d_in_currency,
    marketCap: c.market_cap,
    volume: c.total_volume,
    high24h: c.high_24h,
    low24h: c.low_24h,
    image: c.image,
    sparkline: c.sparkline_in_7d?.price || []
  }));
}

// --- INDICES BOURSIERS via Yahoo Finance ---
async function fetchMarkets() {
  const symbols = [
    { symbol: '^GSPC', name: 'S&P 500' },
    { symbol: '^IXIC', name: 'Nasdaq' },
    { symbol: '^FTSE', name: 'FTSE 100' },
    { symbol: '^FCHI', name: 'CAC 40' },
    { symbol: '^IBEX', name: 'IBEX 35' }
  ];

  const results = await Promise.allSettled(
    symbols.map(async ({ symbol, name }) => {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}`;
      const params = { interval: '1d', range: '5d' };
      const res = await axios.get(url, { params, timeout: 8000, headers: { 'User-Agent': 'Mozilla/5.0' } });
      const meta = res.data.chart.result[0].meta;
      return {
        name,
        symbol,
        price: meta.regularMarketPrice,
        previousClose: meta.previousClose || meta.chartPreviousClose,
        change: meta.regularMarketPrice - (meta.previousClose || meta.chartPreviousClose),
        changePct: ((meta.regularMarketPrice - (meta.previousClose || meta.chartPreviousClose)) / (meta.previousClose || meta.chartPreviousClose)) * 100,
        currency: meta.currency
      };
    })
  );

  return results
    .filter(r => r.status === 'fulfilled')
    .map(r => r.value);
}

module.exports = { fetchCrypto, fetchMarkets };
