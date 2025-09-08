import React, { useEffect, useMemo, useRef, useState } from "react";
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams } from "react-router-dom";
import { createChart, LineStyle } from "lightweight-charts";


const HOUR = 60 * 60 * 1000;
const TTL_MS = 12 * HOUR;
const LATEST_URL = "https://stock-results.vercel.app/api/technical/latest";

const cache = {
  get(key) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const { t, ttl, data } = JSON.parse(raw);
      if (Date.now() - t < ttl) return data;
      return null;
    } catch (_) {
      return null;
    }
  },
  set(key, data, ttl = TTL_MS) {
    try {
      localStorage.setItem(key, JSON.stringify({ t: Date.now(), ttl, data }));
    } catch (_) {}
  },
};

async function fetchWithCache(url, key = url, ttl = TTL_MS) {
  const cached = cache.get(key);
  if (cached) return cached;
  const res = await fetch(url, { headers: { "cache-control": "no-cache" } });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  const data = await res.json();
  cache.set(key, data, ttl);
  return data;
}

function stripJsonSuffix(s) {
  return s.replace(/\.json$/i, "");
}

function maAlignmentNumbers(ma) {
  if (!ma || typeof ma !== "object") return [];
  const ranks = Object.keys(ma)
    .filter((k) => /^rank\d+$/i.test(k))
    .sort((a, b) => Number(a.replace(/\D/g, "")) - Number(b.replace(/\D/g, "")));
  return ranks.map((r) => {
    const v = ma[r];
    const m = /sma_(\d+)/i.exec(String(v));
    return m ? Number(m[1]) : -Infinity;
  });
}

function maAlignmentPretty(ma) {
  const arr = maAlignmentNumbers(ma);
  if (!arr.length) return "-";
  return arr.join(" › ");
}

function toUnix(dateStr) {
  const d = new Date(dateStr.replace(/ /g, "T") + (dateStr.includes("T") ? "" : "T00:00:00Z"));
  return Math.floor(d.getTime() / 1000);
}

function fmt(n, digits = 2) {
  if (n === null || n === undefined || Number.isNaN(Number(n))) return "-";
  if (Math.abs(n) >= 1000 && Number.isInteger(n)) return n.toLocaleString();
  return Number(n).toFixed(digits);
}

function Screener() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [stage, setStage] = useState("all");
  const [minRelVol, setMinRelVol] = useState("");
  const [rsiMin, setRsiMin] = useState("");
  const [rsiMax, setRsiMax] = useState("");
  const [sort, setSort] = useState({ key: "volume", dir: "desc" });
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const latest = await fetchWithCache(LATEST_URL, "latest_technicals", TTL_MS);
        const parsed = Object.entries(latest).map(([k, v]) => ({ ticker: stripJsonSuffix(k), ...v }));
        setRows(parsed);
      } catch (e) {
        setError(e.message || String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const stages = useMemo(() => {
    const set = new Set(rows.map((r) => r.market_stage).filter(Boolean));
    return ["all", ...Array.from(set).sort()];
  }, [rows]);

  const filtered = useMemo(() => {
    const s = search.trim().toUpperCase();
    const minRV = minRelVol === "" ? -Infinity : Number(minRelVol);
    const rsiLo = rsiMin === "" ? -Infinity : Number(rsiMin);
    const rsiHi = rsiMax === "" ? Infinity : Number(rsiMax);
    return rows.filter((r) => {
      if (s && !r.ticker.toUpperCase().includes(s)) return false;
      if (stage !== "all" && r.market_stage !== stage) return false;
      if (Number(r.relative_volume ?? -Infinity) < minRV) return false;
      const rsi = Number(r.rsi_14 ?? NaN);
      if (rsi < rsiLo || rsi > rsiHi) return false;
      return true;
    });
  }, [rows, search, stage, minRelVol, rsiMin, rsiMax]);

  const sorted = useMemo(() => {
    const { key, dir } = sort;
    const dirMul = dir === "asc" ? 1 : -1;
    const arr = [...filtered];
    arr.sort((a, b) => {
      if (key === "ma_alignment") {
        const A = maAlignmentNumbers(a.ma_alignment);
        const B = maAlignmentNumbers(b.ma_alignment);
        const len = Math.max(A.length, B.length);
        for (let i = 0; i < len; i++) {
          const av = A[i] ?? -Infinity;
          const bv = B[i] ?? -Infinity;
          if (av !== bv) return dir === "asc" ? av - bv : bv - av;
        }
        return 0;
      }
      if (key === "market_stage") return dirMul * String(a.market_stage).localeCompare(String(b.market_stage));
      const av = Number(a[key] ?? -Infinity);
      const bv = Number(b[key] ?? -Infinity);
      if (av === bv) return 0;
      return dirMul * (av - bv);
    });
    return arr;
  }, [filtered, sort]);

  const cols = [
    { key: "ticker", label: "Ticker" },
    { key: "close", label: "Close" },
    { key: "volume", label: "Volume" },
    { key: "relative_volume", label: "Rel Vol" },
    { key: "price_vs_sma_50_pct", label: "% vs SMA50" },
    { key: "rsi_14", label: "RSI(14)" },
    { key: "rsi_overbought", label: "RSI OB" },
    { key: "rsi_oversold", label: "RSI OS" },
    { key: "atr_14", label: "ATR(14)" },
    { key: "atr_pct", label: "ATR %" },
    { key: "market_stage", label: "Stage" },
    { key: "sma_5", label: "SMA5" },
    { key: "sma_5_diff_pct", label: "Δ% SMA5" },
    { key: "sma_10", label: "SMA10" },
    { key: "sma_10_diff_pct", label: "Δ% SMA10" },
    { key: "sma_20", label: "SMA20" },
    { key: "sma_20_diff_pct", label: "Δ% SMA20" },
    { key: "sma_50", label: "SMA50" },
    { key: "sma_50_diff_pct", label: "Δ% SMA50" },
    { key: "sma_100", label: "SMA100" },
    { key: "sma_100_diff_pct", label: "Δ% SMA100" },
    { key: "sma_200", label: "SMA200" },
    { key: "sma_200_diff_pct", label: "Δ% SMA200" },
    { key: "ma_alignment", label: "MA Alignment" },
  ];

  function toggleSort(key) {
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "desc" }));
  }

  if (loading) return <div className="p-6">Loading screener…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Stock Screener</h1>
          <p className="text-sm text-slate-500">Live data cached for 12 hours. Click a row to open the viewer.</p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <div className="flex flex-col">
            <label className="text-xs text-slate-500">Find ticker</label>
            <input
              className="px-3 py-2 rounded-xl border border-slate-200 shadow-sm focus:outline-none"
              placeholder="e.g. BBNI.JK"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-slate-500">Market stage</label>
            <select
              className="px-3 py-2 rounded-xl border border-slate-200 shadow-sm"
              value={stage}
              onChange={(e) => setStage(e.target.value)}
            >
              {stages.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col w-28">
            <label className="text-xs text-slate-500">Min Rel Vol</label>
            <input
              type="number"
              className="px-3 py-2 rounded-xl border border-slate-200 shadow-sm"
              placeholder="e.g. 1.5"
              value={minRelVol}
              onChange={(e) => setMinRelVol(e.target.value)}
            />
          </div>
          <div className="flex flex-col w-24">
            <label className="text-xs text-slate-500">RSI min</label>
            <input
              type="number"
              className="px-3 py-2 rounded-xl border border-slate-200 shadow-sm"
              placeholder="0"
              value={rsiMin}
              onChange={(e) => setRsiMin(e.target.value)}
            />
          </div>
          <div className="flex flex-col w-24">
            <label className="text-xs text-slate-500">RSI max</label>
            <input
              type="number"
              className="px-3 py-2 rounded-xl border border-slate-200 shadow-sm"
              placeholder="100"
              value={rsiMax}
              onChange={(e) => setRsiMax(e.target.value)}
            />
          </div>
          <button
            className="px-3 py-2 rounded-xl border border-slate-200 shadow-sm bg-white hover:bg-slate-50"
            onClick={() => {
              setSearch("");
              setStage("all");
              setMinRelVol("");
              setRsiMin("");
              setRsiMax("");
            }}
          >
            Reset
          </button>
        </div>
      </div>

      <div className="overflow-auto rounded-2xl border border-slate-200 shadow-sm">
        <table className="min-w-[900px] w-full">
          <thead className="bg-slate-50 sticky top-0 z-10">
            <tr>
              {cols.map((c) => (
                <th
                  key={c.key}
                  onClick={() => toggleSort(c.key)}
                  className={`text-left text-xs font-semibold text-slate-600 px-3 py-2 cursor-pointer select-none whitespace-nowrap ${
                    sort.key === c.key ? "underline underline-offset-4" : ""
                  }`}
                  title={`Sort by ${c.label}`}
                >
                  {c.label}
                  {sort.key === c.key ? (sort.dir === "asc" ? " ▲" : " ▼") : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <tr
                key={r.ticker}
                onClick={() => navigate(`/stock/${r.ticker}`)}
                className="hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <td className="px-3 py-2 font-medium text-slate-800 sticky left-0 bg-white/90 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-slate-100 text-slate-700 text-sm">
                      {r.ticker.split(".")[0].slice(0, 3)}
                    </span>
                    <span>{r.ticker}</span>
                  </div>
                </td>
                <td className="px-3 py-2">{fmt(r.close)}</td>
                <td className="px-3 py-2">{Number(r.volume ?? 0).toLocaleString()}</td>
                <td className="px-3 py-2">{fmt(r.relative_volume)}</td>
                <td className="px-3 py-2">{fmt(r.price_vs_sma_50_pct)}</td>
                <td className="px-3 py-2">{fmt(r.rsi_14)}</td>
                <td className="px-3 py-2">{fmt(r.rsi_overbought, 0)}</td>
                <td className="px-3 py-2">{fmt(r.rsi_oversold, 0)}</td>
                <td className="px-3 py-2">{fmt(r.atr_14)}</td>
                <td className="px-3 py-2">{fmt(r.atr_pct)}</td>
                <td className="px-3 py-2 capitalize">{r.market_stage || "-"}</td>
                <td className="px-3 py-2">{fmt(r.sma_5)}</td>
                <td className="px-3 py-2">{fmt(r.sma_5_diff_pct)}</td>
                <td className="px-3 py-2">{fmt(r.sma_10)}</td>
                <td className="px-3 py-2">{fmt(r.sma_10_diff_pct)}</td>
                <td className="px-3 py-2">{fmt(r.sma_20)}</td>
                <td className="px-3 py-2">{fmt(r.sma_20_diff_pct)}</td>
                <td className="px-3 py-2">{fmt(r.sma_50)}</td>
                <td className="px-3 py-2">{fmt(r.sma_50_diff_pct)}</td>
                <td className="px-3 py-2">{fmt(r.sma_100)}</td>
                <td className="px-3 py-2">{fmt(r.sma_100_diff_pct)}</td>
                <td className="px-3 py-2">{fmt(r.sma_200)}</td>
                <td className="px-3 py-2">{fmt(r.sma_200_diff_pct)}</td>
                <td className="px-3 py-2">
                  <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700">
                    {maAlignmentPretty(r.ma_alignment)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-xs text-slate-500">
        Tip: Click a column header to sort. Sorting “MA Alignment” compares ranks from biggest to smallest SMA (e.g., 200 › 5 › 10 …).
      </div>
    </div>
  );
}

function StockViewer() {
  const { ticker } = useParams();
  const [daily, setDaily] = useState(null);
  const [lc, setLc] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const latest = await fetchWithCache(LATEST_URL, "latest_technicals", TTL_MS);
        let dbStr = null;
        for (const [k, v] of Object.entries(latest)) {
          const t = stripJsonSuffix(k);
          if (t === ticker) {
            dbStr = v.db;
            break;
          }
        }
        if (!dbStr) throw new Error("DB not found for ticker (from latest cache)");
        const m = /stock-db-(\d+)/.exec(String(dbStr));
        if (!m) throw new Error(`Unexpected db value: ${dbStr}`);
        const dbIndex = m[1];
        const dailyURL = `https://stock-db-${dbIndex}.vercel.app/api/daily/${ticker}`;

        const [lcJson, dailyJson] = await Promise.all([
          fetchWithCache(`https://stock-results.vercel.app/api/l_and_c/${ticker}`, `l_and_c_${ticker}`, TTL_MS),
          fetchWithCache(dailyURL, `daily_${ticker}_db${dbIndex}`, TTL_MS),
        ]);
        setLc(lcJson);
        setDaily(dailyJson);
      } catch (e) {
        setError(e.message || String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [ticker]);

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{ticker}</h1>
          <p className="text-sm text-slate-500">Candles + Volume with toggles for Levels & Channel</p>
        </div>
        <Link className="px-3 py-2 rounded-xl border border-slate-200 shadow-sm bg-white hover:bg-slate-50" to="/">
          ← Back to Screener
        </Link>
      </div>

      {loading && <div>Loading chart…</div>}
      {error && <div className="text-red-600">{error}</div>}

      {daily && (
        <CandlesWithVolume daily={daily} lc={lc} />
      )}
    </div>
  );
}

function CandlesWithVolume({ daily, lc }) {
  const containerRef = useRef(null);
  const [showLevels, setShowLevels] = useState(true);
  const [showChannel, setShowChannel] = useState(true);
  const [barWidth, setBarWidth] = useState(6);

  useEffect(() => {
    if (!daily?.data?.length) return;
    const container = containerRef.current;
    const chart = createChart(container, {
      autoSize: true,
      layout: {
        background: { color: "transparent" },
        textColor: getComputedStyle(document.documentElement).color || "#0f172a",
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { color: "rgba(0,0,0,0.06)" },
      },
      rightPriceScale: { scaleMargins: { top: 0.05, bottom: 0.25 } },
      crosshair: { mode: 1 },
      timeScale: {
        rightOffset: 6,
        timeVisible: true,
        secondsVisible: false,
        fixLeftEdge: false,
        fixRightEdge: false,
        barSpacing: barWidth,
      },
    });

    const candles = chart.addCandlestickSeries({});
    const vols = chart.addHistogramSeries({
      priceScaleId: "volume",
      priceFormat: { type: "volume" },
      scaleMargins: { top: 0.8, bottom: 0 },
    });
    chart.priceScale("volume").applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } });

    const candleData = daily.data.map((d) => ({
      time: toUnix(d.date),
      open: Number(d.open),
      high: Number(d.high),
      low: Number(d.low),
      close: Number(d.close),
    }));
    const volData = daily.data.map((d) => ({ time: toUnix(d.date), value: Number(d.volume || 0) }));

    candles.setData(candleData);
    vols.setData(volData);
    chart.timeScale().fitContent();

    const firstT = candleData[0]?.time;
    const lastT = candleData[candleData.length - 1]?.time;

    let levelSeries = [];
    let chanSeries = [];

    function paintLevels() {
      levelSeries.forEach((s) => chart.removeSeries(s));
      levelSeries = [];
      if (!showLevels || !lc?.latest_levels) return;
      lc.latest_levels.forEach((lvl) => {
        const s = chart.addLineSeries({
          lineStyle: LineStyle.Dotted,
          lineWidth: 1,
          lastValueVisible: false,
          priceLineVisible: false,
        });
        s.setData([
          { time: firstT, value: Number(lvl) },
          { time: lastT, value: Number(lvl) },
        ]);
        levelSeries.push(s);
      });
    }

    function paintChannel() {
      chanSeries.forEach((s) => chart.removeSeries(s));
      chanSeries = [];
      if (!showChannel || !lc?.channel) return;
      const ch = lc.channel;
      const start = toUnix(ch.start_date);
      const end = toUnix(ch.end_date);
      const upper = chart.addLineSeries({ lineWidth: 2, lastValueVisible: false, priceLineVisible: false });
      upper.setData([
        { time: start, value: Number(ch.start_upper) },
        { time: end, value: Number(ch.end_upper) },
      ]);
      const lower = chart.addLineSeries({ lineWidth: 2, lastValueVisible: false, priceLineVisible: false });
      lower.setData([
        { time: start, value: Number(ch.start_lower) },
        { time: end, value: Number(ch.end_lower) },
      ]);
      chanSeries.push(upper, lower);
    }

    paintLevels();
    paintChannel();

    const ro = new ResizeObserver(() => chart.applyOptions({ width: container.clientWidth, height: container.clientHeight }));
    ro.observe(container);

    return () => {
      ro.disconnect();
      chart.remove();
    };
  }, [daily, lc, showLevels, showChannel, barWidth]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={showLevels} onChange={(e) => setShowLevels(e.target.checked)} />
          Show dotted latest levels
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={showChannel} onChange={(e) => setShowChannel(e.target.checked)} />
          Show channel (2 lines)
        </label>
        <div className="flex items-center gap-2 text-sm">
          <span>Candle width</span>
          <input
            type="range"
            min={2}
            max={20}
            value={barWidth}
            onChange={(e) => setBarWidth(Number(e.target.value))}
          />
        </div>
        <div className="text-xs text-slate-500">Scroll to zoom, drag to pan.</div>
      </div>
      <div ref={containerRef} className="w-full h-[520px] rounded-2xl border border-slate-200 shadow-sm bg-white" />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 text-slate-800">
        <header className="sticky top-0 z-20 backdrop-blur supports-[backdrop-filter]:bg-white/60 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link to="/" className="font-semibold">Jakarta Stocks</Link>
            <nav className="text-sm">
              <a className="opacity-60 hover:opacity-100" href="https://stock-results.vercel.app" target="_blank" rel="noreferrer">API</a>
            </nav>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-2 sm:px-4 py-4">
          <Routes>
            <Route path="/" element={<Screener />} />
            <Route path="/stock/:ticker" element={<StockViewer />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
