import { mockStockData } from './mockData';

const INFO_URL = 'https://stock-results.vercel.app/api/info';
const TECH_URL = 'https://stock-results.vercel.app/api/technical/latest/';
const CACHE_KEY = 'stockDataCache_v1';
const CACHE_TTL = 12 * 60 * 60 * 1000; 
let inflight = null;
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true' || false;
function now() { return Date.now(); }
async function fetchRemote() {
  
  if (USE_MOCK_DATA) {
    return new Promise(resolve => setTimeout(() => resolve(mockStockData), 500));
  }

  try {
    const [infoRes, techRes] = await Promise.all([
      fetch(INFO_URL),
      fetch(TECH_URL)
    ]);
    if (!infoRes.ok || !techRes.ok) {
      throw new Error('Failed to fetch one or both endpoints');
    }
    const infoJson = await infoRes.json();
    const techJson = await techRes.json();

    
    const map = {};

    
    Object.keys(infoJson).forEach(symbol => {
      map[symbol] = { symbol, ...infoJson[symbol] };
    });

    
    Object.keys(techJson).forEach(rawKey => {
      const symbol = rawKey.replace(/\.json$/, '');
      const t = techJson[rawKey];

      const entry = map[symbol] || { symbol };

      
      Object.assign(entry, {
        
        db: t.db,
        
        close: t.close,
        volume: t.volume,
        relativeVolume: t.relative_volume,
        priceVsSMA50Pct: t.price_vs_sma_50_pct,
        rsi14: t.rsi_14,
        atr14: t.atr_14,
        atrPct: t.atr_pct,
        marketStage: t.market_stage,
        
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

    
    return Object.values(map);
  } catch (error) {
    
    console.warn('API fetch failed, using mock data:', error.message);
    return mockStockData;
  }
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
    } catch {
      //
    }
  }

  
  if (inflight) return inflight;

  inflight = (async () => {
    const data = await fetchRemote();
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: now(), data }));
    } catch {
      //
    }
    inflight = null;
    return data;
  })();

  return inflight;
}

export function clearStockCache() {
  try { 
    localStorage.removeItem(CACHE_KEY); 
  } catch {
    //
  }
  inflight = null;
}
