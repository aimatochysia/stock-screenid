import React, { useState, useMemo } from 'react';


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
    <div className="w-full overflow-x-auto">
      <div className="text-sm text-gray-600 mb-2">
        <strong>Active sort:</strong> {sortKey ? `${sortKey} (${sortDir})` : 'none'} ·
        <strong> Active filters:</strong> {Object.keys(filters).length === 0 ? ' none' : ` ${Object.keys(filters).join(', ')}`}
      </div>

      <table className="min-w-full bg-white border">
        <thead className="bg-gray-50">
          <tr>
            {columns.map(col => (
              <th key={col.key} className="px-3 py-2 text-left align-top border-b">
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleSort(col.key)} className="flex items-center gap-1">
                    <span className="font-medium">{col.label}</span>
                    <small className="text-gray-500">
                      {sortKey === col.key ? (sortDir === 'asc' ? '▲' : '▼') : '↕'}
                    </small>
                  </button>

                  <div className="relative">
                    <button
                      onClick={() => setOpenFilter(openFilter === col.key ? null : col.key)}
                      className={`ml-1 px-1 py-0.5 rounded ${filters[col.key] ? 'bg-blue-100 text-blue-700' : 'text-gray-400'}`}
                      title="Filter"
                    >
                      ⚲
                    </button>

                    {openFilter === col.key && (
                      <div className="absolute z-10 mt-2 p-3 bg-white border rounded shadow w-64">
                        <div className="flex justify-between items-center mb-2">
                          <strong className="text-sm">{col.label} filter</strong>
                          <button className="text-xs text-gray-500" onClick={() => { clearFilter(col.key); setOpenFilter(null); }}>Clear</button>
                        </div>

                        {col.type === 'number' && (
                          <div className="flex flex-col gap-2">
                            <label className="text-xs text-gray-600">Min</label>
                            <input
                              type="number"
                              onChange={(e) => {
                                const current = filters[col.key] || {};
                                setRangeFilter(col.key, e.target.value, current.max ?? '');
                              }}
                              defaultValue={filters[col.key]?.min ?? ''}
                              className="border rounded px-2 py-1"
                            />
                            <label className="text-xs text-gray-600">Max</label>
                            <input
                              type="number"
                              onChange={(e) => {
                                const current = filters[col.key] || {};
                                setRangeFilter(col.key, current.min ?? '', e.target.value);
                              }}
                              defaultValue={filters[col.key]?.max ?? ''}
                              className="border rounded px-2 py-1"
                            />
                          </div>
                        )}

                        {col.type === 'category' && (
                          <div className="max-h-48 overflow-auto">
                            { (uniqueValues[col.key] || []).map((val) => (
                              <label key={String(val)} className="flex items-center gap-2 text-sm">
                                <input
                                  type="checkbox"
                                  checked={filters[col.key]?.set?.has(val) ?? false}
                                  onChange={(e) => setSetFilter(col.key, val, e.target.checked)}
                                />
                                <span>{String(val)}</span>
                              </label>
                            ))}
                            {(!uniqueValues[col.key] || uniqueValues[col.key].length === 0) && <div className="text-xs text-gray-500">No values</div>}
                          </div>
                        )}

                        {col.type === 'string' && (
                          <div>
                            <label className="text-xs text-gray-600">Contains</label>
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
                              className="border rounded px-2 py-1 w-full"
                            />
                          </div>
                        )}

                        <div className="flex justify-end gap-2 mt-3">
                          <button onClick={() => setOpenFilter(null)} className="text-sm px-3 py-1 rounded border">Done</button>
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
              <td className="p-4 text-center text-gray-500" colSpan={columns.length}>No rows</td>
            </tr>
          )}

          {filteredAndSorted.map((row, i) => (
            <tr key={row.symbol ?? i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              {columns.map(col => (
                <td key={col.key} className="px-3 py-2 align-top border-b text-sm">
                  {renderCell(row, col)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  function renderCell(row, col) {
    const v = row[col.key];
    if (v == null || v === '') return <span className="text-gray-400">—</span>;
    if (col.type === 'number') {
      if (Number.isInteger(v) && Math.abs(v) > 999) return formatNumber(v);
      return typeof v === 'number' ? round(v) : String(v);
    }
    return String(v);
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
