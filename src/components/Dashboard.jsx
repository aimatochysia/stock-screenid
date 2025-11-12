import React, { useState, useMemo } from 'react';
import Tabs from './Tabs';
import DataTable from './DataTable';
import StockHeatmap from './StockHeatmap';
import SummaryCards from './SummaryCards';
import { useStockData } from '../hooks/useStockData';
import { useTheme } from '../contexts/ThemeContext';
import { downloadCSV, downloadLatestDataCSV } from '../utils/csvExport';

// Column definitions - moved outside component to avoid re-creation
const overviewColumns = [
  { key: 'symbol', label: 'Symbol', type: 'string' },
  { key: 'close', label: 'Close', type: 'number' },
  { key: 'marketCap', label: 'Market Cap', type: 'number' },
  { key: 'volume', label: 'Volume', type: 'number' },
  { key: 'relativeVolume', label: 'Rel. Vol', type: 'number' },
  { key: 'priceVsSMA50Pct', label: 'Price vs SMA50 %', type: 'number' },
  { key: 'marketStage', label: 'Market Stage', type: 'category' },
];

const financialColumns = [
  { key: 'symbol', label: 'Symbol', type: 'string' },
  { key: 'forwardPE', label: 'Forward P/E', type: 'number' },
  { key: 'dividendYield', label: 'Div Yield (%)', type: 'number' },
  { key: 'payoutRatio', label: 'Payout Ratio', type: 'number' },
  { key: 'profitMargins', label: 'Profit Margin', type: 'number' },
  { key: 'returnOnEquity', label: 'ROE', type: 'number' },
  { key: 'priceToBook', label: 'P/Book', type: 'number' },
  { key: 'earningsGrowth', label: 'Earnings Growth', type: 'number' },
  { key: 'totalDebt', label: 'Total Debt', type: 'number' },
  { key: 'totalCash', label: 'Total Cash', type: 'number' },
  { key: 'marketCap', label: 'Market Cap', type: 'number' },
];

const technicalColumns = [
  { key: 'symbol', label: 'Symbol', type: 'string' },
  { key: 'close', label: 'Close', type: 'number' },
  { key: 'rsi14', label: 'RSI (14)', type: 'number' },
  { key: 'atr14', label: 'ATR (14)', type: 'number' },
  { key: 'atrPct', label: 'ATR %', type: 'number' },
  { key: 'sma_5', label: 'SMA 5', type: 'number' },
  { key: 'sma_5_diff_pct', label: 'SMA5 diff %', type: 'number' },
  { key: 'sma_20', label: 'SMA 20', type: 'number' },
  { key: 'sma_50', label: 'SMA 50', type: 'number' },
  { key: 'sma_100', label: 'SMA 100', type: 'number' },
  { key: 'sma_200', label: 'SMA 200', type: 'number' },
  { key: 'marketStage', label: 'Market Stage', type: 'category' },
];

export default function Dashboard() {
  const { data, loading, error, refresh, clearCacheAndReload } = useStockData();
  const { isDark, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('Overview');
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const tabs = ['Overview', 'Financial', 'Technical'];

  const rows = data ?? [];

  const handleDownloadCSV = async () => {
    if (downloading) return;
    
    setDownloading(true);
    try {
      // Try to download from API first
      await downloadLatestDataCSV();
    } catch {
      // Fallback to current data
      console.warn('Failed to fetch from API, using current data');
      if (data && data.length > 0) {
        const timestamp = new Date().toISOString().split('T')[0];
        downloadCSV(data, `stock-data-${timestamp}.csv`);
      } else {
        alert('No data available to download');
      }
    } finally {
      setDownloading(false);
    }
  };

  //easy selection for column set
  const columns = useMemo(() => {
    if (activeTab === 'Overview') return overviewColumns;
    if (activeTab === 'Financial') return financialColumns;
    return technicalColumns;
  }, [activeTab]);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-gray-50 to-gray-100'}`}>
      <div className="p-4 sm:p-6 max-w-7xl mx-auto animate-fade-in">
        {/* Header Section */}
        <div className={`rounded-xl shadow-lg p-6 mb-6 transition-colors duration-300 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className={`text-3xl font-bold bg-gradient-to-r ${isDark ? 'from-blue-400 to-purple-400' : 'from-blue-600 to-purple-600'} bg-clip-text text-transparent`}>
                Stock Screener Dashboard
              </h1>
              <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Real-time market insights with 12-hour caching for optimal performance
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button 
                onClick={toggleTheme} 
                className={`px-4 py-2 rounded-lg transition-all duration-300 shadow-sm flex items-center gap-2 ${
                  isDark 
                    ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' 
                    : 'bg-gray-800 text-yellow-300 hover:bg-gray-700'
                }`}
                title="Toggle theme"
              >
                <span className="text-xl">{isDark ? '☀️' : '🌙'}</span>
              </button>
              <button 
                onClick={handleDownloadCSV} 
                className={`px-4 py-2 rounded-lg transition-all duration-300 shadow-sm flex items-center gap-2 ${
                  downloading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : isDark
                      ? 'bg-green-600 text-white hover:bg-green-500'
                      : 'bg-green-500 text-white hover:bg-green-600'
                }`}
                disabled={downloading || loading}
                title="Download data as CSV"
              >
                <span>{downloading ? '⏳' : '⬇️'}</span>
                <span>{downloading ? 'Downloading...' : 'CSV'}</span>
              </button>
              <button 
                onClick={refresh} 
                className={`px-4 py-2 rounded-lg transition-all duration-300 shadow-sm flex items-center gap-2 ${
                  isDark 
                    ? 'bg-blue-600 text-white hover:bg-blue-500' 
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
                disabled={loading}
              >
                <span>🔄</span>
                <span>Refresh</span>
              </button>
              <button 
                onClick={clearCacheAndReload} 
                className={`px-4 py-2 rounded-lg transition-all duration-300 shadow-sm flex items-center gap-2 ${
                  isDark 
                    ? 'bg-red-600 text-white hover:bg-red-500' 
                    : 'bg-red-500 text-white hover:bg-red-600'
                }`}
                disabled={loading}
              >
                <span>🗑️</span>
                <span>Clear Cache</span>
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        {!loading && !error && data && (
          <div className="animate-slide-up">
            <SummaryCards data={data} />
          </div>
        )}

        {/* Main Content */}
        <div className={`rounded-xl shadow-lg p-6 transition-colors duration-300 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
          <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
          
          <div className="mt-6">
            {loading && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className={`animate-spin rounded-full h-12 w-12 border-b-2 mb-4 ${isDark ? 'border-blue-400' : 'border-blue-500'}`}></div>
                <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>Loading stock data...</p>
              </div>
            )}
            
            {error && (
              <div className={`border rounded-lg p-6 text-center ${isDark ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200'}`}>
                <span className="text-4xl mb-2 block">⚠️</span>
                <p className={`font-semibold ${isDark ? 'text-red-400' : 'text-red-700'}`}>Error Loading Data</p>
                <p className={`text-sm mt-2 ${isDark ? 'text-red-300' : 'text-red-600'}`}>{error}</p>
              </div>
            )}
            
            {!loading && !error && data && (
              <div className="animate-fade-in">
                {activeTab === 'Overview' && showHeatmap && (
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className={`text-lg font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Quick View</h3>
                      <button
                        onClick={() => setShowHeatmap(!showHeatmap)}
                        className={`text-sm ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
                      >
                        {showHeatmap ? 'Hide' : 'Show'} Heatmap
                      </button>
                    </div>
                    <StockHeatmap data={data} metric="priceVsSMA50Pct" />
                  </div>
                )}
                <DataTable
                  columns={columns}
                  rows={rows}
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer Tips */}
        <div className={`mt-6 text-xs p-4 rounded-lg shadow-sm transition-colors duration-300 ${isDark ? 'bg-gray-800 text-gray-400 border border-gray-700' : 'bg-white text-gray-500'}`}>
          <p className="font-semibold mb-2">💡 Tips:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Click any column header to sort (click again to reverse order)</li>
            <li>Use the filter icon (⚲) next to headers to filter data</li>
            <li>Hover over heatmap boxes for detailed information</li>
            <li>Data is cached for 12 hours to minimize API calls</li>
            <li>Download data as CSV for offline analysis</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
