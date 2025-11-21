import React, { useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';


const TREEMAP_WIDTH = 1000;
const TREEMAP_HEIGHT = 600;


const calculateWorstAspectRatio = (items, rowHeight) => {
  return Math.max(
    ...items.map(item => {
      const itemWidth = item.area / rowHeight;
      return Math.max(itemWidth / rowHeight, rowHeight / itemWidth);
    })
  );
};

export default function StockHeatmap({ data = [], metric = 'priceVsSMA50Pct' }) {
  const { isDark } = useTheme();
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    
    const filtered = data.filter(stock => 
      stock.symbol && 
      stock[metric] != null && 
      stock.marketCap != null
    );
    
    
    const sorted = filtered.sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0));
    
    if (sorted.length === 0) return [];
    
    
    const totalMarketCap = sorted.reduce((sum, stock) => sum + (stock.marketCap || 0), 0);
    
    
    const targetMarketCap = totalMarketCap * 0.8;
    let cumulativeMarketCap = 0;
    const result = [];
    
    for (const stock of sorted) {
      result.push(stock);
      cumulativeMarketCap += stock.marketCap || 0;
      
      if (cumulativeMarketCap >= targetMarketCap) {
        break;
      }
    }
    
    return result;
  }, [data, metric]);

  const { minValue, maxValue } = useMemo(() => {
    if (processedData.length === 0) return { minValue: 0, maxValue: 0 };
    const values = processedData.map(s => s[metric]).filter(v => v != null);
    return {
      minValue: Math.min(...values),
      maxValue: Math.max(...values)
    };
  }, [processedData, metric]);

  
  const treemapLayout = useMemo(() => {
    if (processedData.length === 0) return [];
    
    const totalMarketCap = processedData.reduce((sum, s) => sum + (s.marketCap || 0), 0);
    
    
    const items = processedData.map(stock => ({
      ...stock,
      area: ((stock.marketCap || 0) / totalMarketCap) * TREEMAP_WIDTH * TREEMAP_HEIGHT
    }));
    
    
    const layout = [];
    let x = 0, y = 0;
    let remainingWidth = TREEMAP_WIDTH;
    let currentRow = [];
    let currentRowArea = 0;
    
    const addRow = () => {
      if (currentRow.length === 0) return;
      
      const rowHeight = currentRowArea / remainingWidth;
      let rowX = x;
      
      currentRow.forEach(item => {
        const itemWidth = item.area / rowHeight;
        layout.push({
          ...item,
          x: rowX,
          y: y,
          width: itemWidth,
          height: rowHeight
        });
        rowX += itemWidth;
      });
      
      y += rowHeight;
      currentRow = [];
      currentRowArea = 0;
    };
    
    items.forEach((item, idx) => {
      currentRow.push(item);
      currentRowArea += item.area;
      
      
      const rowHeight = currentRowArea / remainingWidth;
      const worstAspectRatio = calculateWorstAspectRatio(currentRow, rowHeight);
      
      
      if (idx < items.length - 1) {
        const nextArea = currentRowArea + items[idx + 1].area;
        const nextRowHeight = nextArea / remainingWidth;
        const nextRowItems = [...currentRow, items[idx + 1]];
        const nextWorstAspectRatio = calculateWorstAspectRatio(nextRowItems, nextRowHeight);
        
        if (nextWorstAspectRatio > worstAspectRatio && currentRow.length > 0) {
          addRow();
        }
      }
    });
    
    
    addRow();
    
    return layout;
  }, [processedData]);

  const getColor = (value) => {
    if (value == null) return isDark ? 'rgb(55, 65, 81)' : 'rgb(229, 231, 235)';
    
    
    const maxAbs = Math.max(Math.abs(minValue), Math.abs(maxValue));
    const normalized = Math.max(-1, Math.min(1, value / (maxAbs || 1)));
    
    if (normalized > 0) {
      
      const intensity = Math.abs(normalized);
      if (isDark) {
        
        const r = Math.floor(0 + (34 * (1 - intensity)));
        const g = Math.floor(100 + (155 * intensity));
        const b = Math.floor(0 + (34 * (1 - intensity)));
        return `rgb(${r}, ${g}, ${b})`;
      } else {
        
        const r = Math.floor(220 - (120 * intensity));
        const g = Math.floor(255);
        const b = Math.floor(220 - (120 * intensity));
        return `rgb(${r}, ${g}, ${b})`;
      }
    } else {
      
      const intensity = Math.abs(normalized);
      if (isDark) {
        
        const r = Math.floor(139 + (116 * intensity));
        const g = Math.floor(0 + (34 * (1 - intensity)));
        const b = Math.floor(0 + (34 * (1 - intensity)));
        return `rgb(${r}, ${g}, ${b})`;
      } else {
        
        const r = Math.floor(255);
        const g = Math.floor(220 - (120 * intensity));
        const b = Math.floor(220 - (120 * intensity));
        return `rgb(${r}, ${g}, ${b})`;
      }
    }
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
        <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Stock Performance Treemap</h3>
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
      
      <div className="w-full" style={{ paddingBottom: '60%', position: 'relative' }}>
        <svg
          viewBox="0 0 1000 600"
          className="absolute inset-0 w-full h-full"
          style={{ maxHeight: '600px' }}
        >
          {treemapLayout.map((stock) => {
            const color = getColor(stock[metric]);
            const value = stock[metric];
            
            return (
              <g key={stock.symbol}>
                <rect
                  x={stock.x}
                  y={stock.y}
                  width={stock.width}
                  height={stock.height}
                  fill={color}
                  stroke={isDark ? '#374151' : '#e5e7eb'}
                  strokeWidth="2"
                  className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                  style={{ filter: 'url(#shadow)' }}
                />
                {stock.width > 60 && stock.height > 30 && (
                  <text
                    x={stock.x + stock.width / 2}
                    y={stock.y + stock.height / 2 - 8}
                    textAnchor="middle"
                    className={`font-bold text-sm ${isDark ? 'fill-white' : 'fill-gray-900'}`}
                    style={{ fontSize: Math.min(stock.width / 5, stock.height / 3, 18) }}
                  >
                    {stock.symbol}
                  </text>
                )}
                {stock.width > 60 && stock.height > 50 && (
                  <text
                    x={stock.x + stock.width / 2}
                    y={stock.y + stock.height / 2 + 12}
                    textAnchor="middle"
                    className={`font-semibold ${isDark ? 'fill-gray-200' : 'fill-gray-800'}`}
                    style={{ fontSize: Math.min(stock.width / 6, stock.height / 4, 14) }}
                  >
                    {value?.toFixed(1)}%
                  </text>
                )}
                <title>
                  {`${stock.symbol}\nClose: $${stock.close?.toFixed(2)}\nMarket Cap: ${formatMarketCap(stock.marketCap)}\n${metric}: ${value?.toFixed(2)}%\nStage: ${stock.marketStage || 'N/A'}`}
                </title>
              </g>
            );
          })}
          <defs>
            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.3"/>
            </filter>
          </defs>
        </svg>
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
