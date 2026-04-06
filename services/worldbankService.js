// ============================================================
// services/worldbankService.js — World Bank Open Data API
// Docs: https://datahelpdesk.worldbank.org/knowledgebase/articles/898581
// ============================================================

const axios = require('axios');
const BASE  = 'https://api.worldbank.org/v2';

const INDICATORS = {
  gdp:      { id: 'NY.GDP.MKTP.CD',   label: 'PIB (USD)',            unit: 'USD' },
  pop:      { id: 'SP.POP.TOTL',      label: 'Population',           unit: 'hab' },
  poverty:  { id: 'SI.POV.DDAY',      label: 'Pauvreté extrême (%)', unit: '%' },
  co2:      { id: 'EN.ATM.CO2E.PC',   label: 'CO₂ per capita (t)',   unit: 't' },
  life:     { id: 'SP.DYN.LE00.IN',   label: 'Espérance de vie',     unit: 'ans' },
  literacy: { id: 'SE.ADT.LITR.ZS',   label: 'Alphabétisation (%)',  unit: '%' },
  internet: { id: 'IT.NET.USER.ZS',   label: 'Internautes (%)',      unit: '%' },
  gini:     { id: 'SI.POV.GINI',      label: 'Indice Gini',          unit: '' },
};

async function fetchIndicator(indicatorKey, limit = 15) {
  const ind = INDICATORS[indicatorKey];
  if (!ind) throw new Error(`Indicateur inconnu : ${indicatorKey}`);
  const url = `${BASE}/country/all/indicator/${ind.id}?format=json&per_page=${limit}&mrv=1`;
  const { data } = await axios.get(url, { timeout: 12000 });
  if (!data || !data[1]) return [];
  return data[1]
    .filter(d => d.value !== null && d.countryiso3code && d.country?.value)
    .sort((a, b) => (b.value || 0) - (a.value || 0))
    .slice(0, limit)
    .map(d => ({
      country:  d.country.value,
      iso3:     d.countryiso3code,
      value:    d.value,
      year:     d.date,
      label:    ind.label,
      unit:     ind.unit,
    }));
}

async function fetchTopGDP(limit = 15) {
  return fetchIndicator('gdp', limit);
}

async function fetchDashboard() {
  const keys = ['gdp', 'pop', 'co2', 'life', 'internet'];
  const results = await Promise.allSettled(keys.map(k => fetchIndicator(k, 10)));
  const out = {};
  keys.forEach((k, i) => {
    out[k] = results[i].status === 'fulfilled' ? results[i].value : [];
  });
  return out;
}

module.exports = { fetchIndicator, fetchTopGDP, fetchDashboard, INDICATORS };
