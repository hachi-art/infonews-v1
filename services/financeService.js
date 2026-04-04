// ============================================================
// services/financeService.js — CoinGecko (crypto) + Yahoo Finance (marchés)
// Gratuit, sans clé API
// ============================================================
const axios = require('axios');

// --- CRYPTO via CoinGecko (USD) ---
async function fetchCrypto() {
  const url = 'https://api.coingecko.com/api/v3/coins/markets';
  const params = {
    vs_currency: 'usd',
    ids: 'bitcoin,ethereum,solana,ripple,cardano,binancecoin,polkadot,chainlink,avalanche-2,dogecoin',
    order: 'market_cap_desc',
    per_page: 10,
    page: 1,
    sparkline: true,
    price_change_percentage: '24h,7d'
  };
  const res = await axios.get(url, { params, timeout: 10000 });
  return res.data; // retourne directement le format CoinGecko natif
}

// --- INDICES BOURSIERS via Yahoo Finance ---
async function fetchMarkets() {
  const symbols = [
    { symbol: '^GSPC',  name: 'S&P 500'   },
    { symbol: '^IXIC',  name: 'Nasdaq'    },
    { symbol: '^FTSE',  name: 'FTSE 100'  },
    { symbol: '^FCHI',  name: 'CAC 40'    },
    { symbol: '^IBEX',  name: 'IBEX 35'   },
    { symbol: '^GDAXI', name: 'DAX'       },
    { symbol: '^N225',  name: 'Nikkei'    },
    { symbol: '^HSI',   name: 'Hang Seng' },
  ];

  const results = await Promise.allSettled(
    symbols.map(async ({ symbol, name }) => {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}`;
      const res = await axios.get(url, {
        params: { interval: '1d', range: '5d' },
        timeout: 8000,
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      const meta = res.data.chart.result[0].meta;
      const prev = meta.previousClose || meta.chartPreviousClose || meta.regularMarketPrice;
      const curr = meta.regularMarketPrice;
      return {
        name,
        symbol,
        price: curr,
        change: curr - prev,
        changePercent: ((curr - prev) / prev) * 100,
        currency: meta.currency || 'USD'
      };
    })
  );

  return results
    .filter(r => r.status === 'fulfilled')
    .map(r => r.value);
}

module.exports = { fetchCrypto, fetchMarkets };
