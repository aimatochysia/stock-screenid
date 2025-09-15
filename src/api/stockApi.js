// src/api/stockApi.js
// Cache TTL = 12 hours. Exposes getStockData({force}) and clearStockCache()

const INFO_URL = 'https://stock-results.vercel.app/api/info';
const TECH_URL = 'https://stock-results.vercel.app/api/technical/latest/';
const CACHE_KEY = 'stockDataCache_v1';
const CACHE_TTL = 12 * 60 * 60 * 1000; // 12 hours
let inflight = null;

function now() { return Date.now(); }

async function fetchRemote() {
  const [infoRes, techRes] = await Promise.all([
    fetch(INFO_URL),
    fetch(TECH_URL)
  ]);
  if (!infoRes.ok || !techRes.ok) {
    throw new Error('Failed to fetch one or both endpoints');
  }
  const infoJson = await infoRes.json();
  const techJson = await techRes.json();

  // merge -> map by symbol
  const map = {};

  // Put info keyed by symbol
  Object.keys(infoJson).forEach(symbol => {
    map[symbol] = { symbol, ...infoJson[symbol] };
  });

  // Add technical info; raw keys are like "EMDE.JK.json" -> remove .json
  Object.keys(techJson).forEach(rawKey => {
    const symbol = rawKey.replace(/\.json$/, '');
    const t = techJson[rawKey];

    const entry = map[symbol] || { symbol };

    // pick and flatten the technical keys we need
    Object.assign(entry, {
      // basic
      close: t.close,
      volume: t.volume,
      relativeVolume: t.relative_volume,
      priceVsSMA50Pct: t.price_vs_sma_50_pct,
      rsi14: t.rsi_14,
      atr14: t.atr_14,
      atrPct: t.atr_pct,
      marketStage: t.market_stage,
      // SMAs and diff percentages
      sma_5: t.sma_5,
      sma_5_diff_pct: t.sma_5_diff_pct,
      sma_10: t.sma_10,
      sma_10_diff_pct: t.sma_10_diff_pct,
      sma_20: t.sma_20,
      sma_20_diff_pct: t.sma_20_diff_pct,
      sma_50: t.sma_50,
      sma_50_diff_pct: t.sma_50_diff_pct,
      sma_100: t.sma_100,
      sma_100_diff_pct: t.sma_100_diff_pct,
      sma_200: t.sma_200,
      sma_200_diff_pct: t.sma_200_diff_pct
    });

    map[symbol] = entry;
  });

  // convert to array
  return Object.values(map);
}

export async function getStockData({ force = false } = {}) {
  if (!force) {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const cached = JSON.parse(raw);
        if (cached.timestamp && (now() - cached.timestamp) < CACHE_TTL && cached.data) {
          return cached.data;
        }
      }
    } catch (e) {
      // if parse error -> ignore and refetch
    }
  }

  // reuse inflight promise if present (avoid duplicate fetch)
  if (inflight) return inflight;

  inflight = (async () => {
    const data = await fetchRemote();
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: now(), data }));
    } catch (e) {
      // ignore storage errors
    }
    inflight = null;
    return data;
  })();

  return inflight;
}

export function clearStockCache() {
  try { localStorage.removeItem(CACHE_KEY); } catch(e){}
  inflight = null;
}
