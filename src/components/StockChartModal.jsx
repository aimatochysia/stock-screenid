import React, { useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import StockChart from './StockChart';
import { getDailyData } from '../api/dailyApi';

/**
 * StockChartModal displays a modal with stock chart
 * @param {Object} props
 * @param {string} props.ticker - Stock ticker symbol
 * @param {string} props.db - Database name for fetching data
 * @param {Function} props.onClose - Close handler
 */
export default function StockChartModal({ ticker, db, onClose }) {
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!ticker || !db) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const dailyData = await getDailyData(ticker, db);
        setData(dailyData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [ticker, db]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div 
        className={`relative w-full max-w-7xl max-h-[90vh] overflow-auto rounded-xl shadow-2xl ${
          isDark ? 'bg-gray-800' : 'bg-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 z-10 px-3 py-1 rounded-lg transition-colors ${
            isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
          }`}
        >
          ✕ Close
        </button>

        {/* Content */}
        <div className="p-6">
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className={`animate-spin rounded-full h-12 w-12 border-b-2 mb-4 ${isDark ? 'border-blue-400' : 'border-blue-500'}`}></div>
              <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>Loading chart data...</p>
            </div>
          )}

          {error && (
            <div className={`border rounded-lg p-6 text-center ${isDark ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200'}`}>
              <span className="text-4xl mb-2 block">⚠️</span>
              <p className={`font-semibold ${isDark ? 'text-red-400' : 'text-red-700'}`}>Error Loading Chart</p>
              <p className={`text-sm mt-2 ${isDark ? 'text-red-300' : 'text-red-600'}`}>{error}</p>
            </div>
          )}

          {!loading && !error && data && (
            <StockChart data={data} ticker={ticker} />
          )}
        </div>
      </div>
    </div>
  );
}
