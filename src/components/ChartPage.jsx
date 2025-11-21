import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import StockChart from './StockChart';
import { getDailyData } from '../api/dailyApi';
import { getStockData } from '../api/stockApi';


export default function ChartPage() {
  const { ticker } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [stockInfo, setStockInfo] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!ticker) {
        setError('No ticker provided');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        
        const stockList = await getStockData();
        const stock = stockList.find(s => s.symbol === ticker);
        
        if (!stock || !stock.db) {
          setError(`Stock ${ticker} not found or database information missing`);
          setLoading(false);
          return;
        }

        setStockInfo(stock);

        
        const dailyData = await getDailyData(ticker, stock.db);
        setData(dailyData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [ticker]);

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
      <div className={`border-b ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                ← Back to Dashboard
              </button>
              <h1 className={`text-2xl font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                {ticker}
                {stockInfo && (
                  <span className={`ml-4 text-lg font-normal ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    IDR{stockInfo.close?.toFixed(2) || 'N/A'}
                  </span>
                )}
              </h1>
            </div>
            <Link
              to="/dashboard"
              className={`text-sm ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
            >
              View all stocks
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-8xl mx-auto px-4 sm:px-6 py-8">
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
            <button
              onClick={() => navigate('/dashboard')}
              className={`mt-4 px-4 py-2 rounded-lg ${
                isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              Return to Dashboard
            </button>
          </div>
        )}

        {!loading && !error && data && (
          <div className={`rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <StockChart data={data} ticker={ticker} />
          </div>
        )}

        {stockInfo && (
          <div className={`mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Market Cap</p>
              <p className={`text-lg font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                ${(stockInfo.marketCap / 1e12).toFixed(2)}T
              </p>
            </div>
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Volume</p>
              <p className={`text-lg font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                {(stockInfo.volume / 1e6).toFixed(2)}M
              </p>
            </div>
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>RSI (14)</p>
              <p className={`text-lg font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                {stockInfo.rsi14?.toFixed(2) || 'N/A'}
              </p>
            </div>
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Market Stage</p>
              <p className={`text-lg font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                {stockInfo.marketStage || 'N/A'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
