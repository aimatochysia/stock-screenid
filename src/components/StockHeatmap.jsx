import React, { useMemo } from 'react';

// StockHeatmap: displays stocks as colored boxes based on performance
// Size represents market cap, color represents price change percentage
export default function StockHeatmap({ data = [], metric = 'priceVsSMA50Pct' }) {
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
    if (value == null) return 'bg-gray-200';
    
    // Normalize value between -1 and 1
    const normalized = Math.max(-1, Math.min(1, value / Math.max(Math.abs(minValue), Math.abs(maxValue))));
    
    if (normalized > 0) {
      // Green for positive
      const intensity = Math.floor(normalized * 255);
      return `rgb(${255 - intensity}, 255, ${255 - intensity})`;
    } else {
      // Red for negative
      const intensity = Math.floor(Math.abs(normalized) * 255);
      return `rgb(255, ${255 - intensity}, ${255 - intensity})`;
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
      <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg">
        No data available for heat map
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Stock Performance Heat Map</h3>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span>Color: {metric === 'priceVsSMA50Pct' ? 'Price vs SMA50' : metric} (%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Size: Market Cap</span>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2 text-xs">
          <span className="text-gray-600">Legend:</span>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgb(255, 100, 100)' }}></div>
            <span>Negative</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-gray-200"></div>
            <span>Neutral</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgb(100, 255, 100)' }}></div>
            <span>Positive</span>
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
              className="relative group cursor-pointer transition-transform hover:scale-105 hover:z-10 rounded shadow-sm"
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
                <span className="font-bold text-xs text-gray-800 break-all text-center leading-tight">
                  {stock.symbol}
                </span>
                <span className="text-xs font-semibold text-gray-700 mt-0.5">
                  {value?.toFixed(1)}%
                </span>
              </div>
              
              {/* Tooltip on hover */}
              <div className="absolute hidden group-hover:block z-20 bg-gray-900 text-white text-xs rounded p-2 -top-24 left-1/2 transform -translate-x-1/2 w-48 shadow-lg">
                <div className="font-bold mb-1">{stock.symbol}</div>
                <div>Close: ${stock.close?.toFixed(2)}</div>
                <div>Market Cap: {formatMarketCap(stock.marketCap)}</div>
                <div>{metric}: {value?.toFixed(2)}%</div>
                <div>Stage: {stock.marketStage || 'N/A'}</div>
                <div className="absolute w-2 h-2 bg-gray-900 transform rotate-45 -bottom-1 left-1/2 -translate-x-1/2"></div>
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
