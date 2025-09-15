import { useState, useEffect, useCallback } from 'react';
import { getStockData, clearStockCache } from '../api/stockApi';

export function useStockData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      const d = await getStockData({ force });
      setData(d);
    } catch (err) {
      setError(err.message || 'Failed to load stock data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(false);
  }, [load]);

  const refresh = useCallback(() => load(true), [load]);
  const clearCacheAndReload = useCallback(() => {
    clearStockCache();
    load(true);
  }, [load]);

  return {
    data,
    loading,
    error,
    refresh,
    clearCacheAndReload
  };
}
