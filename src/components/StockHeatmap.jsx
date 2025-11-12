import React, { useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';

// StockHeatmap: displays stocks as colored boxes based on performance
// Size represents market cap, color represents price change percentage
export default function StockHeatmap({ data = [], metric = 'priceVsSMA50Pct' }) {
  const { isDark } = useTheme();
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // Filter out stocks without required data
    const filtered = data.filter(stock => 
      stock.symbol && 
      stock[metric] != null && 
      stock.marketCap != null
    );
    
    // Sort by market cap descending
    return filtered
      .sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0))
      .slice(0, 50); // Show top 50 stocks
  }, [data, metric]);

  const { minValue, maxValue } = useMemo(() => {
    if (processedData.length === 0) return { minValue: 0, maxValue: 0 };
    const values = processedData.map(s => s[metric]).filter(v => v != null);
    return {
      minValue: Math.min(...values),
      maxValue: Math.max(...values)
    };
  }, [processedData, metric]);

  const getColor = (value) => {
    if (value == null) return isDark ? 'rgb(55, 65, 81)' : 'rgb(229, 231, 235)';
    
    // Normalize value between -1 and 1
    const maxAbs = Math.max(Math.abs(minValue), Math.abs(maxValue));
    const normalized = Math.max(-1, Math.min(1, value / (maxAbs || 1)));
    
    if (normalized > 0) {
      // Green shades for positive - improved gradient
      const intensity = Math.abs(normalized);
      if (isDark) {
        // Dark mode: deeper greens
        const r = Math.floor(0 + (34 * (1 - intensity)));
        const g = Math.floor(100 + (155 * intensity));
        const b = Math.floor(0 + (34 * (1 - intensity)));
        return `rgb(${r}, ${g}, ${b})`;
      } else {
        // Light mode: brighter greens
        const r = Math.floor(220 - (120 * intensity));
        const g = Math.floor(255);
        const b = Math.floor(220 - (120 * intensity));
        return `rgb(${r}, ${g}, ${b})`;
      }
    } else {
      // Red shades for negative - improved gradient
      const intensity = Math.abs(normalized);
      if (isDark) {
        // Dark mode: deeper reds
        const r = Math.floor(139 + (116 * intensity));
        const g = Math.floor(0 + (34 * (1 - intensity)));
        const b = Math.floor(0 + (34 * (1 - intensity)));
        return `rgb(${r}, ${g}, ${b})`;
      } else {
        // Light mode: brighter reds
        const r = Math.floor(255);
        const g = Math.floor(220 - (120 * intensity));
        const b = Math.floor(220 - (120 * intensity));
        return `rgb(${r}, ${g}, ${b})`;
      }
    }
  };

  const getSize = (marketCap, allStocks) => {
    if (!marketCap || allStocks.length === 0) return 80;
    const maxCap = Math.max(...allStocks.map(s => s.marketCap || 0));
    const minCap = Math.min(...allStocks.filter(s => s.marketCap > 0).map(s => s.marketCap || 0));
    
    // Size between 60 and 200 pixels
    const ratio = (marketCap - minCap) / (maxCap - minCap || 1);
    return 60 + Math.floor(ratio * 140);
  };

  if (processedData.length === 0) {
    return (
      <div className={`p-8 text-center rounded-lg ${isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-50 text-gray-500'}`}>
        No data available for heat map
      </div>
    );
  }

  return (
    <div className={`rounded-lg border p-4 transition-colors duration-300 ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="mb-4">
        <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Stock Performance Heat Map</h3>
        <div className={`flex items-center gap-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          <div className="flex items-center gap-2">
            <span>Color: {metric === 'priceVsSMA50Pct' ? 'Price vs SMA50' : metric} (%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Size: Market Cap</span>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2 text-xs">
          <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Legend:</span>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: isDark ? 'rgb(255, 100, 100)' : 'rgb(255, 150, 150)' }}></div>
            <span className={isDark ? 'text-gray-400' : 'text-gray-700'}>Negative</span>
          </div>
          <div className="flex items-center gap-1">
            <div className={`w-4 h-4 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
            <span className={isDark ? 'text-gray-400' : 'text-gray-700'}>Neutral</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: isDark ? 'rgb(100, 255, 100)' : 'rgb(150, 255, 150)' }}></div>
            <span className={isDark ? 'text-gray-400' : 'text-gray-700'}>Positive</span>
          </div>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 justify-center">
        {processedData.map((stock) => {
          const size = getSize(stock.marketCap, processedData);
          const color = getColor(stock[metric]);
          const value = stock[metric];
          
          return (
            <div
              key={stock.symbol}
              className="relative group cursor-pointer transition-all duration-300 hover:scale-110 hover:z-10 rounded-lg shadow-md hover:shadow-2xl"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                backgroundColor: color,
                minWidth: '60px',
                minHeight: '60px'
              }}
              title={`${stock.symbol}: ${value?.toFixed(2)}%`}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center p-1">
                <span className={`font-bold text-xs break-all text-center leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {stock.symbol}
                </span>
                <span className={`text-xs font-semibold mt-0.5 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                  {value?.toFixed(1)}%
                </span>
              </div>
              
              {/* Tooltip on hover */}
              <div className={`absolute hidden group-hover:block z-20 text-xs rounded-lg p-3 -top-28 left-1/2 transform -translate-x-1/2 w-52 shadow-2xl border ${
                isDark ? 'bg-gray-900 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-300'
              }`}>
                <div className="font-bold mb-2 text-sm">{stock.symbol}</div>
                <div className="space-y-1">
                  <div>Close: ${stock.close?.toFixed(2)}</div>
                  <div>Market Cap: {formatMarketCap(stock.marketCap)}</div>
                  <div>{metric}: {value?.toFixed(2)}%</div>
                  <div>Stage: {stock.marketStage || 'N/A'}</div>
                </div>
                <div className={`absolute w-3 h-3 transform rotate-45 -bottom-1.5 left-1/2 -translate-x-1/2 ${
                  isDark ? 'bg-gray-900 border-r border-b border-gray-700' : 'bg-white border-r border-b border-gray-300'
                }`}></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formatMarketCap(cap) {
  if (!cap) return 'N/A';
  if (cap >= 1e12) return `$${(cap / 1e12).toFixed(2)}T`;
  if (cap >= 1e9) return `$${(cap / 1e9).toFixed(2)}B`;
  if (cap >= 1e6) return `$${(cap / 1e6).toFixed(2)}M`;
  if (cap >= 1e3) return `$${(cap / 1e3).toFixed(2)}K`;
  return `$${cap}`;
}
