// src/api/dailyApi.js
// Fetches daily OHLCV data for a specific stock ticker

import { getMockDailyData } from './mockDailyData';

const CACHE_KEY_PREFIX = 'dailyDataCache_';
const CACHE_TTL = 12 * 60 * 60 * 1000; // 12 hours

function now() { 
  return Date.now(); 
}

/**
 * Fetch daily OHLCV data for a ticker from the appropriate database
 * @param {string} ticker - Stock ticker symbol (e.g., "KSIX.JK")
 * @param {string} db - Database name (e.g., "stock-db-4")
 * @returns {Promise<Array>} Array of daily data objects
 */
export async function getDailyData(ticker, db) {
  if (!ticker || !db) {
    throw new Error('Ticker and database name are required');
  }

  const cacheKey = `${CACHE_KEY_PREFIX}${ticker}`;

  // Check cache first
  try {
    const raw = localStorage.getItem(cacheKey);
    if (raw) {
      const cached = JSON.parse(raw);
      if (cached.timestamp && (now() - cached.timestamp) < CACHE_TTL && cached.data) {
        return cached.data;
      }
    }
  } catch {
    // ignore cache errors
  }

  // Fetch from API
  const url = `https://${db}.vercel.app/api/daily/${ticker}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch daily data: ${response.statusText}`);
    }
    
    const json = await response.json();
    const data = json.data || [];

    // Cache the result
    try {
      localStorage.setItem(cacheKey, JSON.stringify({ timestamp: now(), data }));
    } catch {
      // ignore storage errors
    }

    return data;
  } catch (error) {
    console.warn('Error fetching daily data, using mock data:', error);
    // Fallback to mock data
    const mockData = getMockDailyData(ticker);
    
    // Cache the mock data
    try {
      localStorage.setItem(cacheKey, JSON.stringify({ timestamp: now(), data: mockData }));
    } catch {
      // ignore storage errors
    }
    
    return mockData;
  }
}

/**
 * Clear cache for a specific ticker
 * @param {string} ticker - Stock ticker symbol
 */
export function clearDailyCache(ticker) {
  if (!ticker) return;
  
  try {
    const cacheKey = `${CACHE_KEY_PREFIX}${ticker}`;
    localStorage.removeItem(cacheKey);
  } catch {
    // ignore storage errors
  }
}

/**
 * Clear all daily data caches
 */
export function clearAllDailyCaches() {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(CACHE_KEY_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch {
    // ignore storage errors
  }
}
