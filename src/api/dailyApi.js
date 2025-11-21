import { getMockDailyData } from './mockDailyData';

const CACHE_KEY_PREFIX = 'dailyDataCache_';
const CACHE_TTL = 12 * 60 * 60 * 1000; 

function now() { 
  return Date.now(); 
}


export async function getDailyData(ticker, db) {
  if (!ticker || !db) {
    throw new Error('Ticker and database name are required');
  }

  const cacheKey = `${CACHE_KEY_PREFIX}${ticker}`;

  
  try {
    const raw = localStorage.getItem(cacheKey);
    if (raw) {
      const cached = JSON.parse(raw);
      if (cached.timestamp && (now() - cached.timestamp) < CACHE_TTL && cached.data) {
        return cached.data;
      }
    }
  } catch {
    //
  }

  
  const url = `https://${db}.vercel.app/api/daily/${ticker}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch daily data: ${response.statusText}`);
    }
    
    const json = await response.json();
    const data = json.data || [];

    
    try {
      localStorage.setItem(cacheKey, JSON.stringify({ timestamp: now(), data }));
    } catch {
      //
    }

    return data;
  } catch (error) {
    console.warn('Error fetching daily data, using mock data:', error);
    
    const mockData = getMockDailyData(ticker);
    
    
    try {
      localStorage.setItem(cacheKey, JSON.stringify({ timestamp: now(), data: mockData }));
    } catch {
      //
    }
    
    return mockData;
  }
}

export function clearDailyCache(ticker) {
  if (!ticker) return;
  
  try {
    const cacheKey = `${CACHE_KEY_PREFIX}${ticker}`;
    localStorage.removeItem(cacheKey);
  } catch {
    //
  }
}


export function clearAllDailyCaches() {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(CACHE_KEY_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch {
    //
  }
}
