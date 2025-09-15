import React, { useState, useMemo } from 'react';
import Tabs from './Tabs';
import DataTable from './DataTable';
import { useStockData } from '../hooks/useStockData';

export default function Dashboard() {
  const { data, loading, error, refresh, clearCacheAndReload } = useStockData();
  const [activeTab, setActiveTab] = useState('Overview');

  const tabs = ['Overview', 'Financial', 'Technical'];

  // columns definitions
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

  const rows = data ?? [];

  //easy selection for column set
  const columns = useMemo(() => {
    if (activeTab === 'Overview') return overviewColumns;
    if (activeTab === 'Financial') return financialColumns;
    return technicalColumns;
  }, [activeTab]);

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="flex justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold">Stock Screener — Dashboard</h1>
          <p className="text-sm text-gray-600">Tabs: overview, financial, technical. Cached 12h. Clear cache to force refresh.</p>
        </div>

        <div className="flex gap-2">
          <button onClick={refresh} className="px-3 py-1 border rounded hover:bg-gray-50">Refresh (force)</button>
          <button onClick={clearCacheAndReload} className="px-3 py-1 border rounded bg-red-50 text-red-700">Clear Cache & Reload</button>
        </div>
      </div>

      <div className="mt-4">
        <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
        <div className="mt-4">
          {loading && <div className="text-gray-600">Loading data…</div>}
          {error && <div className="text-red-600">Error: {error}</div>}
          {!loading && !error && (
            <DataTable
              columns={columns}
              rows={rows}
            />
          )}
        </div>
      </div>

      <div className="mt-6 text-xs text-gray-500">
        Tip: click any column header to sort (click again to flip). Click the filter icon next to a header to filter that column. Numeric columns accept min/max; categorical columns show available values to select.
      </div>
    </div>
  );
}
