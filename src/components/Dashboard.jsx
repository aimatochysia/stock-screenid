import React, { useState, useMemo } from 'react';
import Tabs from './Tabs';
import DataTable from './DataTable';
import StockHeatmap from './StockHeatmap';
import SummaryCards from './SummaryCards';
import { useStockData } from '../hooks/useStockData';

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
  const [activeTab, setActiveTab] = useState('Overview');
  const [showHeatmap, setShowHeatmap] = useState(true);

  const tabs = ['Overview', 'Financial', 'Technical', 'Heatmap'];

  const rows = data ?? [];

  //easy selection for column set
  const columns = useMemo(() => {
    if (activeTab === 'Overview') return overviewColumns;
    if (activeTab === 'Financial') return financialColumns;
    return technicalColumns;
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Stock Screener Dashboard
              </h1>
              <p className="text-sm text-gray-600 mt-2">
                Real-time market insights with 12-hour caching for optimal performance
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button 
                onClick={refresh} 
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm flex items-center gap-2"
                disabled={loading}
              >
                <span>🔄</span>
                <span>Refresh</span>
              </button>
              <button 
                onClick={clearCacheAndReload} 
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-sm flex items-center gap-2"
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
          <SummaryCards data={data} />
        )}

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
          
          <div className="mt-6">
            {loading && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                <p className="text-gray-600">Loading stock data...</p>
              </div>
            )}
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <span className="text-4xl mb-2 block">⚠️</span>
                <p className="text-red-700 font-semibold">Error Loading Data</p>
                <p className="text-red-600 text-sm mt-2">{error}</p>
              </div>
            )}
            
            {!loading && !error && data && (
              <>
                {activeTab === 'Heatmap' ? (
                  <StockHeatmap data={data} metric="priceVsSMA50Pct" />
                ) : (
                  <>
                    {activeTab === 'Overview' && showHeatmap && (
                      <div className="mb-6">
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="text-lg font-semibold text-gray-800">Quick View</h3>
                          <button
                            onClick={() => setShowHeatmap(!showHeatmap)}
                            className="text-sm text-blue-600 hover:text-blue-700"
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
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Footer Tips */}
        <div className="mt-6 text-xs text-gray-500 bg-white rounded-lg p-4 shadow-sm">
          <p className="font-semibold mb-2">💡 Tips:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Click any column header to sort (click again to reverse order)</li>
            <li>Use the filter icon (⚲) next to headers to filter data</li>
            <li>Hover over heatmap boxes for detailed information</li>
            <li>Data is cached for 12 hours to minimize API calls</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
