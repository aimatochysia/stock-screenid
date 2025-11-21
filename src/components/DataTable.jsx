import React, { useState, useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';


// Props:
//  - columns: [{ key, label, type: 'number'|'string'|'category', width? }]
//  - rows: array of objects (each row must have key columns)

function compare(a, b, type, dir) {
  if (a == null && b == null) return 0;
  if (a == null) return dir === 'asc' ? 1 : -1;
  if (b == null) return dir === 'asc' ? -1 : 1;

  if (type === 'number') {
    return (a - b) * (dir === 'asc' ? 1 : -1);
  } else {
    // string fallback
    return String(a).localeCompare(String(b)) * (dir === 'asc' ? 1 : -1);
  }
}

export default function DataTable({ columns = [], rows = [] }) {
  const { isDark } = useTheme();
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc'); // 'asc' | 'desc'
  const [filters, setFilters] = useState({}); // { colKey: { type: 'range'|'set', min, max, set: Set(...) } }
  const [openFilter, setOpenFilter] = useState(null);

  const uniqueValues = useMemo(() => {
    const map = {};
    columns.forEach(col => {
      if (col.type === 'category') {
        map[col.key] = Array.from(new Set(rows.map(r => r[col.key]).filter(v => v != null)));
      }
    });
    return map;
  }, [columns, rows]);

  const filteredAndSorted = useMemo(() => {
    let list = rows.slice();

    //filter
    Object.keys(filters).forEach(colKey => {
      const cfg = filters[colKey];
      if (!cfg) return;
      if (cfg.type === 'range') {
        list = list.filter(r => {
          const val = r[colKey];
          if (val == null) return false;
          if (cfg.min != null && val < cfg.min) return false;
          if (cfg.max != null && val > cfg.max) return false;
          return true;
        });
      } else if (cfg.type === 'set') {
        const set = cfg.set;
        if (set && set.size > 0) {
          list = list.filter(r => set.has(r[colKey]));
        }
      }
    });

    //sort
    if (sortKey) {
      const col = columns.find(c => c.key === sortKey);
      const type = col?.type === 'number' ? 'number' : 'string';
      list.sort((a, b) => compare(a[sortKey], b[sortKey], type, sortDir));
    }

    return list;
  }, [rows, filters, sortKey, sortDir, columns]);

  function toggleSort(colKey) {
    if (sortKey !== colKey) {
      setSortKey(colKey);
      setSortDir('asc');
    } else {
      setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'));
    }
  }

  function setRangeFilter(colKey, min, max) {
    setFilters(prev => ({
      ...prev,
      [colKey]: { type: 'range', min: (min === '' ? null : Number(min)), max: (max === '' ? null : Number(max)) }
    }));
  }

  function setSetFilter(colKey, value, checked) {
    setFilters(prev => {
      const existing = (prev[colKey] && prev[colKey].set) ? new Set(prev[colKey].set) : new Set();
      if (checked) existing.add(value);
      else existing.delete(value);
      return { ...prev, [colKey]: { type: 'set', set: existing } };
    });
  }

  function clearFilter(colKey) {
    setFilters(prev => {
      const copy = { ...prev };
      delete copy[colKey];
      return copy;
    });
  }

  return (
    <div className="w-full">
      <div className={`text-sm mb-4 flex flex-wrap items-center gap-4 p-3 rounded-lg transition-colors duration-300 ${
        isDark ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-50 text-gray-600'
      }`}>
        <div className="flex items-center gap-2">
          <span className="font-semibold">Sort:</span>
          <span className={isDark ? 'text-gray-200' : 'text-gray-700'}>{sortKey ? `${sortKey} (${sortDir})` : 'none'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold">Filters:</span>
          <span className={isDark ? 'text-gray-200' : 'text-gray-700'}>
            {Object.keys(filters).length === 0 ? 'none' : Object.keys(filters).join(', ')}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold">Showing:</span>
          <span className={isDark ? 'text-gray-200' : 'text-gray-700'}>{filteredAndSorted.length} stocks</span>
        </div>
      </div>

      <div className={`rounded-lg overflow-x-auto border shadow-sm transition-colors duration-300 ${
        isDark ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <table className={`min-w-full ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <thead className={`${isDark ? 'bg-gradient-to-r from-gray-700 to-gray-800' : 'bg-gradient-to-r from-gray-100 to-gray-200'}`}>
            <tr>
              {columns.map(col => (
                <th key={col.key} className={`px-4 py-3 text-left align-top border-b-2 ${
                  isDark ? 'border-gray-600' : 'border-gray-300'
                }`}>
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleSort(col.key)} className={`flex items-center gap-1 transition-colors ${
                      isDark ? 'hover:text-blue-400' : 'hover:text-blue-600'
                    }`}>
                      <span className={`font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{col.label}</span>
                      <small className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                        {sortKey === col.key ? (sortDir === 'asc' ? '▲' : '▼') : '↕'}
                      </small>
                    </button>

                    <div className="relative">
                      <button
                        onClick={() => setOpenFilter(openFilter === col.key ? null : col.key)}
                        className={`ml-1 px-2 py-1 rounded transition-colors ${
                          filters[col.key] 
                            ? (isDark ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white')
                            : (isDark ? 'text-gray-400 hover:bg-gray-600' : 'text-gray-400 hover:bg-gray-200')
                        }`}
                        title="Filter"
                      >
                        ⚲
                      </button>

                      {openFilter === col.key && (
                        <div className={`absolute z-10 mt-2 p-4 border-2 rounded-lg shadow-xl w-64 transition-colors duration-300 ${
                          isDark 
                            ? 'bg-gray-800 border-blue-600' 
                            : 'bg-white border-blue-300'
                        }`}>
                          <div className="flex justify-between items-center mb-3">
                            <strong className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{col.label} filter</strong>
                            <button className={`text-xs font-medium ${
                              isDark ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-700'
                            }`} onClick={() => { clearFilter(col.key); setOpenFilter(null); }}>Clear</button>
                          </div>

                          {col.type === 'number' && (
                            <div className="flex flex-col gap-3">
                              <div>
                                <label className={`text-xs font-medium block mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Min</label>
                                <input
                                  type="number"
                                  onChange={(e) => {
                                    const current = filters[col.key] || {};
                                    setRangeFilter(col.key, e.target.value, current.max ?? '');
                                  }}
                                  defaultValue={filters[col.key]?.min ?? ''}
                                  className={`border-2 rounded-lg px-3 py-2 w-full focus:outline-none transition-colors ${
                                    isDark 
                                      ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                                      : 'border-gray-300 focus:border-blue-500'
                                  }`}
                                />
                              </div>
                              <div>
                                <label className={`text-xs font-medium block mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Max</label>
                                <input
                                  type="number"
                                  onChange={(e) => {
                                    const current = filters[col.key] || {};
                                    setRangeFilter(col.key, current.min ?? '', e.target.value);
                                  }}
                                  defaultValue={filters[col.key]?.max ?? ''}
                                  className={`border-2 rounded-lg px-3 py-2 w-full focus:outline-none transition-colors ${
                                    isDark 
                                      ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                                      : 'border-gray-300 focus:border-blue-500'
                                  }`}
                                />
                              </div>
                            </div>
                          )}

                          {col.type === 'category' && (
                            <div className="max-h-48 overflow-auto">
                              { (uniqueValues[col.key] || []).map((val) => (
                                <label key={String(val)} className={`flex items-center gap-2 text-sm py-1 cursor-pointer ${
                                  isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                                }`}>
                                  <input
                                    type="checkbox"
                                    checked={filters[col.key]?.set?.has(val) ?? false}
                                    onChange={(e) => setSetFilter(col.key, val, e.target.checked)}
                                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                  />
                                  <span className={isDark ? 'text-gray-200' : 'text-gray-800'}>{String(val)}</span>
                                </label>
                              ))}
                              {(!uniqueValues[col.key] || uniqueValues[col.key].length === 0) && <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>No values</div>}
                            </div>
                          )}

                          {col.type === 'string' && (
                            <div>
                              <label className={`text-xs font-medium block mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Contains</label>
                              <input
                                type="text"
                                onChange={(e) => {
                                  const v = e.target.value;
                                  if (!v) {
                                    clearFilter(col.key);
                                  } else {
                                    setFilters(prev => ({
                                      ...prev,
                                      [col.key]: { type: 'range',
                                        contains: v.toLowerCase()
                                      }
                                    }));
                                  }
                                }}
                                placeholder="substring..."
                                defaultValue={filters[col.key]?.contains ?? ''}
                                className={`border-2 rounded-lg px-3 py-2 w-full focus:outline-none transition-colors ${
                                  isDark 
                                    ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                                    : 'border-gray-300 focus:border-blue-500'
                                }`}
                              />
                            </div>
                          )}

                          <div className="flex justify-end gap-2 mt-4">
                            <button onClick={() => setOpenFilter(null)} className={`text-sm px-4 py-2 rounded-lg border-2 font-medium transition-colors ${
                              isDark 
                                ? 'border-gray-600 hover:bg-gray-700 text-gray-200' 
                                : 'border-gray-300 hover:bg-gray-50'
                            }`}>Done</button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {filteredAndSorted.length === 0 && (
              <tr>
                <td className={`p-8 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`} colSpan={columns.length}>
                  <div className="text-4xl mb-2">📭</div>
                  <div>No stocks match your filters</div>
                </td>
              </tr>
            )}

            {filteredAndSorted.map((row, i) => (
              <tr key={row.symbol ?? i} className={`transition-colors ${
                i % 2 === 0 
                  ? (isDark ? 'bg-gray-800' : 'bg-white')
                  : (isDark ? 'bg-gray-750' : 'bg-gray-50')
              } ${isDark ? 'hover:bg-gray-700' : 'hover:bg-blue-50'}`}>
                {columns.map(col => (
                  <td key={col.key} className={`px-4 py-3 align-top border-b text-sm ${
                    isDark ? 'border-gray-700' : 'border-gray-200'
                  }`}>
                    {renderCell(row, col)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  function renderCell(row, col) {
    const v = row[col.key];
    if (v == null || v === '') return <span className={isDark ? 'text-gray-600' : 'text-gray-400'}>—</span>;
    
    if (col.type === 'number') {
      // Format large numbers
      const formattedValue = Number.isInteger(v) && Math.abs(v) > 999 
        ? formatNumber(v) 
        : (typeof v === 'number' ? round(v) : String(v));
      
      // Color code based on context
      let colorClass = isDark ? 'text-gray-300' : 'text-gray-700';
      
      // Percentage fields - color based on positive/negative
      if (col.key.includes('Pct') || col.key.includes('pct') || col.key.includes('Growth') || col.key.includes('Margin') || col.key.includes('Yield')) {
        if (v > 0) colorClass = isDark ? 'text-green-400 font-semibold' : 'text-green-600 font-semibold';
        else if (v < 0) colorClass = isDark ? 'text-red-400 font-semibold' : 'text-red-600 font-semibold';
      }
      
      // RSI - overbought/oversold
      if (col.key === 'rsi14') {
        if (v > 70) colorClass = isDark ? 'text-red-400 font-semibold' : 'text-red-600 font-semibold';
        else if (v < 30) colorClass = isDark ? 'text-green-400 font-semibold' : 'text-green-600 font-semibold';
      }
      
      return <span className={colorClass}>{formattedValue}</span>;
    }
    
    // Category - add badge styling for market stage
    if (col.key === 'marketStage') {
      const stageColors = isDark ? {
        'Stage 1': 'bg-yellow-900/40 text-yellow-400 border border-yellow-700',
        'Stage 2': 'bg-green-900/40 text-green-400 border border-green-700',
        'Stage 3': 'bg-orange-900/40 text-orange-400 border border-orange-700',
        'Stage 4': 'bg-red-900/40 text-red-400 border border-red-700',
      } : {
        'Stage 1': 'bg-yellow-100 text-yellow-800',
        'Stage 2': 'bg-green-100 text-green-800',
        'Stage 3': 'bg-orange-100 text-orange-800',
        'Stage 4': 'bg-red-100 text-red-800',
      };
      const colorClass = stageColors[v] || (isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800');
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
          {String(v)}
        </span>
      );
    }
    
    // Symbol - make it bold and prominent
    if (col.key === 'symbol') {
      return <span className={`font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{String(v)}</span>;
    }
    
    return <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{String(v)}</span>;
  }

  function formatNumber(n) {
    const abs = Math.abs(n);
    if (abs >= 1e12) return (n / 1e12).toFixed(2) + 'T';
    if (abs >= 1e9) return (n / 1e9).toFixed(2) + 'B';
    if (abs >= 1e6) return (n / 1e6).toFixed(2) + 'M';
    if (abs >= 1e3) return (n / 1e3).toFixed(2) + 'K';
    return String(n);
  }
  function round(x) {
    if (Math.abs(x) < 1 && x !== 0) return x.toFixed(2);
    return Number.isInteger(x) ? x : x.toFixed(2);
  }
}
