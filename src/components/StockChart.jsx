import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, CandlestickSeries, LineSeries, HistogramSeries } from 'lightweight-charts';
import { useTheme } from '../contexts/ThemeContext';

/**
 * StockChart component displays a candlestick chart with volume and moving averages
 * @param {Object} props
 * @param {Array} props.data - Daily OHLCV data [{date, open, high, low, close, volume}, ...]
 * @param {string} props.ticker - Stock ticker symbol
 */
export default function StockChart({ data, ticker }) {
  const { isDark } = useTheme();
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const candlestickSeriesRef = useRef(null);
  const volumeSeriesRef = useRef(null);
  const maSeriesRefs = useRef({});
  
  const [maSettings, setMaSettings] = useState({
    ma10: { enabled: true, color: '#2962FF' },
    ma20: { enabled: true, color: '#F23645' },
    ma50: { enabled: true, color: '#089981' },
    ma100: { enabled: false, color: '#FF6D00' },
    ma200: { enabled: false, color: '#7E57C2' },
  });
  
  const [showSettings, setShowSettings] = useState(false);

  // Calculate moving average
  const calculateMA = (data, period) => {
    const result = [];
    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        // Skip entries until we have enough data points
        continue;
      }
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += data[i - j].close;
      }
      result.push({ time: data[i].time, value: sum / period });
    }
    return result;
  };

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current || !data || data.length === 0) return;

    // Clear existing chart
    if (chartRef.current) {
      chartRef.current.remove();
      // Clear series references since chart is removed
      candlestickSeriesRef.current = null;
      volumeSeriesRef.current = null;
      maSeriesRefs.current = {};
    }

    // Get container dimensions
    const containerWidth = chartContainerRef.current.clientWidth;
    const containerHeight = 600; // Fixed height

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      width: containerWidth,
      height: containerHeight,
      layout: {
        background: { type: ColorType.Solid, color: isDark ? '#1f2937' : '#ffffff' },
        textColor: isDark ? '#d1d5db' : '#374151',
      },
      grid: {
        vertLines: { color: isDark ? '#374151' : '#e5e7eb' },
        horzLines: { color: isDark ? '#374151' : '#e5e7eb' },
      },
      crosshair: {
        mode: 1, // CrosshairMode.Normal
      },
      rightPriceScale: {
        borderColor: isDark ? '#4b5563' : '#d1d5db',
      },
      timeScale: {
        borderColor: isDark ? '#4b5563' : '#d1d5db',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;

    // Add candlestick series
    const candlestickSeriesInst = chart.addSeries(CandlestickSeries, {
      upColor: '#089981',
      downColor: '#F23645',
      borderVisible: false,
      wickUpColor: '#089981',
      wickDownColor: '#F23645',
    });
    candlestickSeriesRef.current = candlestickSeriesInst;

    // Prepare candlestick data
    const candleData = data.map(item => ({
      time: item.date,
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
    }));
    candlestickSeriesInst.setData(candleData);

    // Add volume series in a separate pane
    const volumeSeriesInst = chart.addSeries(HistogramSeries, {
      color: '#26a69a',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '',
      scaleMargins: {
        top: 0.7,
        bottom: 0,
      },
    });
    volumeSeriesRef.current = volumeSeriesInst;

    // Prepare volume data
    const volumeData = data.map(item => ({
      time: item.date,
      value: item.volume,
      color: item.close >= item.open ? '#26a69a80' : '#ef535080',
    }));
    volumeSeriesInst.setData(volumeData);

    // Add moving averages
    const maData = data.map(item => ({
      time: item.date,
      close: item.close,
    }));

    // Add enabled MA series (no need to clear since we already reset maSeriesRefs)
    Object.entries(maSettings).forEach(([key, settings]) => {
      if (settings.enabled) {
        const period = parseInt(key.replace('ma', ''));
        const maSeriesInst = chart.addSeries(LineSeries, {
          color: settings.color,
          lineWidth: 2,
          title: `MA${period}`,
        });
        const maValues = calculateMA(maData, period);
        maSeriesInst.setData(maValues);
        maSeriesRefs.current[key] = maSeriesInst;
      }
    });

    // Fit content
    chart.timeScale().fitContent();

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        const newWidth = chartContainerRef.current.clientWidth;
        chartRef.current.applyOptions({ width: newWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [data, maSettings, isDark]);

  const handleMAToggle = (key) => {
    setMaSettings(prev => ({
      ...prev,
      [key]: { ...prev[key], enabled: !prev[key].enabled }
    }));
  };

  const handleMAColorChange = (key, color) => {
    setMaSettings(prev => ({
      ...prev,
      [key]: { ...prev[key], color }
    }));
  };

  if (!data || data.length === 0) {
    return (
      <div className={`flex items-center justify-center h-64 rounded-lg ${isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-50 text-gray-600'}`}>
        <div className="text-center">
          <div className="text-4xl mb-2">📈</div>
          <p>No chart data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg p-4 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className={`text-xl font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
          {ticker} - Candlestick Chart
        </h3>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`px-4 py-2 rounded-lg transition-colors ${
            isDark ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          ⚙️ Settings
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className={`mb-4 p-4 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
          <h4 className={`text-sm font-semibold mb-3 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
            Moving Averages
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Object.entries(maSettings).map(([key, settings]) => {
              const period = key.replace('ma', '');
              return (
                <div key={key} className="flex flex-col gap-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.enabled}
                      onChange={() => handleMAToggle(key)}
                      className="w-4 h-4"
                    />
                    <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      MA {period}
                    </span>
                  </label>
                  {settings.enabled && (
                    <input
                      type="color"
                      value={settings.color}
                      onChange={(e) => handleMAColorChange(key, e.target.value)}
                      className="w-full h-8 rounded cursor-pointer"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Chart Container */}
      <div 
        ref={chartContainerRef} 
        className={`rounded-lg overflow-auto border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
        style={{ width: '100%', height: 'auto' }}
      />
      
      {/* Info */}
      <div className={`mt-4 text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        <p>💡 Tips: Scroll to zoom, drag to pan, crosshair shows values on hover</p>
      </div>
    </div>
  );
}
