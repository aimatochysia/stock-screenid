import React, { useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';

export default function SummaryCards({ data = [] }) {
  const { isDark } = useTheme();
  const stats = useMemo(() => {
    if (!data || data.length === 0) return null;
    
    const stocks = data.filter(s => s.close != null);
    const validPriceChanges = stocks.filter(s => s.priceVsSMA50Pct != null);
    
    // Calculate statistics
    const totalStocks = stocks.length;
    const gainers = validPriceChanges.filter(s => s.priceVsSMA50Pct > 0).length;
    const losers = validPriceChanges.filter(s => s.priceVsSMA50Pct < 0).length;
    
    const avgVolume = stocks.reduce((sum, s) => sum + (s.volume || 0), 0) / totalStocks || 0;
    const totalMarketCap = stocks.reduce((sum, s) => sum + (s.marketCap || 0), 0);
    
    const rsiValues = stocks.filter(s => s.rsi14 != null).map(s => s.rsi14);
    const avgRSI = rsiValues.length > 0 
      ? rsiValues.reduce((sum, v) => sum + v, 0) / rsiValues.length 
      : 0;
    
    const overbought = stocks.filter(s => s.rsi14 > 70).length;
    const oversold = stocks.filter(s => s.rsi14 < 30).length;
    
    return {
      totalStocks,
      gainers,
      losers,
      avgVolume,
      totalMarketCap,
      avgRSI,
      overbought,
      oversold
    };
  }, [data]);

  if (!stats) {
    return null;
  }

  const cards = [
    {
      title: 'Total Stocks',
      value: stats.totalStocks,
      icon: '📊',
      color: isDark ? 'bg-blue-900/30 border-blue-700' : 'bg-blue-50 border-blue-200',
      textColor: isDark ? 'text-blue-400' : 'text-blue-700'
    },
    {
      title: 'Gainers / Losers',
      value: `${stats.gainers} / ${stats.losers}`,
      icon: '📈',
      color: isDark ? 'bg-green-900/30 border-green-700' : 'bg-green-50 border-green-200',
      textColor: isDark ? 'text-green-400' : 'text-green-700',
      subtitle: `${((stats.gainers / (stats.gainers + stats.losers || 1)) * 100).toFixed(0)}% positive`
    },
    {
      title: 'Total Market Cap',
      value: formatMarketCap(stats.totalMarketCap),
      icon: '💰',
      color: isDark ? 'bg-purple-900/30 border-purple-700' : 'bg-purple-50 border-purple-200',
      textColor: isDark ? 'text-purple-400' : 'text-purple-700'
    },
    {
      title: 'Avg RSI (14)',
      value: stats.avgRSI.toFixed(1),
      icon: '📉',
      color: stats.avgRSI > 70 
        ? (isDark ? 'bg-red-900/30 border-red-700' : 'bg-red-50 border-red-200')
        : stats.avgRSI < 30 
          ? (isDark ? 'bg-yellow-900/30 border-yellow-700' : 'bg-yellow-50 border-yellow-200')
          : (isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'),
      textColor: stats.avgRSI > 70 
        ? (isDark ? 'text-red-400' : 'text-red-700')
        : stats.avgRSI < 30 
          ? (isDark ? 'text-yellow-400' : 'text-yellow-700')
          : (isDark ? 'text-gray-400' : 'text-gray-700'),
      subtitle: `${stats.overbought} overbought, ${stats.oversold} oversold`
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className={`${card.color} border rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className={`text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{card.title}</p>
              <p className={`text-2xl font-bold ${card.textColor}`}>{card.value}</p>
              {card.subtitle && (
                <p className="text-gray-500 text-xs mt-1">{card.subtitle}</p>
              )}
            </div>
            <div className="text-3xl ml-2">{card.icon}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function formatMarketCap(cap) {
  if (!cap) return '$0';
  if (cap >= 1e12) return `$${(cap / 1e12).toFixed(2)}T`;
  if (cap >= 1e9) return `$${(cap / 1e9).toFixed(2)}B`;
  if (cap >= 1e6) return `$${(cap / 1e6).toFixed(2)}M`;
  return `$${(cap / 1e3).toFixed(2)}K`;
}
