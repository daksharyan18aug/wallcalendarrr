/**
 * WallCalendar – Interactive Wall Calendar Component
 * 
 * Features:
 *  - Wall calendar aesthetic with hero gradient landscape + spiral binding
 *  - Day range selector: click start → click end, with hover preview
 *  - Notes section: per-month + per-selected-range notes, lined-paper style
 *  - Holiday markers with tooltips (US holidays)
 *  - 12 month-specific color themes
 *  - Today indicator
 *  - Weekend coloring (Sat = accent, Sun = red)
 *  - Responsive: 2-column desktop, stacked mobile
 *  - Animated chevron/wave hero cut
 */

import { useState, useMemo } from "react";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];
const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

/** Per-month color themes: gradient stops + accent + light accent */
const THEMES = [
  { g1:"#0d2b5e",g2:"#1a5fa0",g3:"#3a8fd4",accent:"#2196F3",aL:"#e3f2fd",mtn:"#0a2248" }, // Jan
  { g1:"#2e0854",g2:"#6a2090",g3:"#a050c8",accent:"#ab47bc",aL:"#f3e5f5",mtn:"#1a0430" }, // Feb
  { g1:"#064020",g2:"#0d7040",g3:"#1aaa60",accent:"#43a047",aL:"#e8f5e9",mtn:"#042810" }, // Mar
  { g1:"#1e3c08",g2:"#3a7010",g3:"#5aa820",accent:"#7cb342",aL:"#f1f8e9",mtn:"#102004" }, // Apr
  { g1:"#043c40",g2:"#087070",g3:"#10aaa8",accent:"#00897b",aL:"#e0f2f1",mtn:"#022428" }, // May
  { g1:"#3c2004",g2:"#7a4810",g3:"#c07820",accent:"#fb8c00",aL:"#fff3e0",mtn:"#201004" }, // Jun
  { g1:"#3c0804",g2:"#7a1810",g3:"#c03020",accent:"#e53935",aL:"#ffebee",mtn:"#200404" }, // Jul
  { g1:"#3c1804",g2:"#7a3a10",g3:"#c06030",accent:"#f4511e",aL:"#fbe9e7",mtn:"#201004" }, // Aug
  { g1:"#281404",g2:"#5a3010",g3:"#9a5828",accent:"#8d6e63",aL:"#efebe9",mtn:"#180c04" }, // Sep
  { g1:"#3c0808",g2:"#7a1818",g3:"#c03a3a",accent:"#d32f2f",aL:"#ffebee",mtn:"#200404" }, // Oct
  { g1:"#18083c",g2:"#3c1878",g3:"#6838b8",accent:"#8e24aa",aL:"#f3e5f5",mtn:"#0c0420" }, // Nov
  { g1:"#04183c",g2:"#0c3878",g3:"#1860b8",accent:"#1e88e5",aL:"#e3f2fd",mtn:"#020c20" }, // Dec
];

/** US holiday map: month (0-indexed) → day → label */
const HOLIDAYS = {
  0: { 1:"New Year's Day", 15:"MLK Day" },
  1: { 14:"Valentine's Day" },
  2: { 17:"St. Patrick's Day" },
  3: { 22:"Earth Day" },
  5: { 19:"Juneteenth", 21:"Summer Solstice" },
  6: { 4:"Independence Day" },
  8: { 22:"Autumn Equinox" },
  9: { 31:"Halloween" },
  10: { 11:"Veterans Day", 27:"Thanksgiving" },
  11: { 24:"Christmas Eve", 25:"Christmas Day", 31:"New Year's Eve" },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function daysInMonth(y, m) { return new Date(y, m + 1, 0).getDate(); }
function firstDow(y, m) { return (new Date(y, m, 1).getDay() + 6) % 7; }
function toDS(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function HeroSVG({ theme }) {
  const { g1, g2, g3, mtn } = theme;
  return (
    <svg
      viewBox="0 0 860 200"
      preserveAspectRatio="xMidYMid slice"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}
    >
      <defs>
        <linearGradient id="skyG" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={g1} />
          <stop offset="50%" stopColor={g2} />
          <stop offset="100%" stopColor={g3} />
        </linearGradient>
      </defs>
      <rect width="860" height="200" fill="url(#skyG)" />
      {/* Stars */}
      {[...Array(22)].map((_, i) => (
        <circle
          key={i}
          cx={20 + i * 38}
          cy={12 + Math.sin(i * 1.4) * 18}
          r={1.2}
          fill="rgba(255,255,255,0.4)"
        />
      ))}
      {/* Mountain layers */}
      <polygon
        points="0,200 0,140 80,100 160,135 260,70 380,120 480,55 580,115 680,65 780,110 860,80 860,200"
        fill={mtn}
        opacity="0.7"
      />
      <polygon
        points="0,200 0,165 120,138 230,158 350,108 470,148 580,95 700,130 800,100 860,118 860,200"
        fill="rgba(0,0,0,0.18)"
      />
    </svg>
  );
}

function ChevronCut({ accent }) {
  return (
    <svg
      viewBox="0 0 860 64"
      preserveAspectRatio="none"
      style={{ position: "absolute", bottom: 0, left: 0, right: 0, width: "100%", height: 64, display: "block" }}
    >
      <path
        d="M0,32 C160,62 300,8 430,38 C560,68 700,8 860,32 L860,64 L0,64 Z"
        fill={accent}
        opacity="0.92"
      />
      <path d="M0,64 C160,62 300,8 430,38 C560,68 700,8 860,64 Z" fill="white" />
    </svg>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function WallCalendar() {
  const now = new Date();
  const [yr, setYr] = useState(now.getFullYear());
  const [mo, setMo] = useState(now.getMonth());
  const [selA, setSelA] = useState(null);
  const [selB, setSelB] = useState(null);
  const [hov, setHov] = useState(null);
  const [notes, setNotes] = useState({});
  const [sliding, setSliding] = useState(false);

  const theme = THEMES[mo];
  const todayS = toDS(now.getFullYear(), now.getMonth(), now.getDate());
  const dim = daysInMonth(yr, mo);
  const fdow = firstDow(yr, mo);
  const holiMap = HOLIDAYS[mo] || {};

  // Build calendar grid cells including prev/next month overflow
  const cells = useMemo(() => {
    const out = [];
    const prev = daysInMonth(yr, mo === 0 ? 11 : mo - 1);
    for (let i = 0; i < fdow; i++) out.push({ t: "p", d: prev - fdow + i + 1 });
    for (let d = 1; d <= dim; d++) out.push({ t: "c", d });
    for (let d = 1; out.length % 7; d++) out.push({ t: "n", d });
    return out;
  }, [yr, mo, fdow, dim]);

  const goMonth = (dir) => {
    if (sliding) return;
    setSliding(true);
    setTimeout(() => {
      setMo((m) => {
        const nm = m + dir;
        if (nm > 11) { setYr((y) => y + 1); return 0; }
        if (nm < 0) { setYr((y) => y - 1); return 11; }
        return nm;
      });
      setSliding(false);
    }, 220);
  };

  const onDay = (cell) => {
    if (cell.t !== "c") return;
    const d = toDS(yr, mo, cell.d);
    if (!selA || (selA && selB)) {
      setSelA(d);
      setSelB(null);
    } else {
      if (d === selA) { setSelA(null); return; }
      const s = [selA, d].sort();
      setSelA(s[0]);
      setSelB(s[1]);
    }
  };

  const getState = (cell) => {
    if (cell.t !== "c") return "outside";
    const d = toDS(yr, mo, cell.d);
    const eff = selA && !selB && hov ? hov : selB;
    if (selA && eff) {
      const lo = selA < eff ? selA : eff;
      const hi = selA < eff ? eff : selA;
      if (d === lo) return "start";
      if (d === hi) return "end";
      if (d > lo && d < hi) return "range";
    } else if (selA && !selB && d === selA) {
      return "start";
    }
    if (d === todayS) return "today";
    return "normal";
  };

  const noteKey = selA && selB ? `${selA}:${selB}` : `${yr}-${mo}`;
  const noteVal = notes[noteKey] || "";
  const setNote = (v) => setNotes((n) => ({ ...n, [noteKey]: v }));

  const rangeLabel =
    selA && selB
      ? `${selA.slice(5)} → ${selB.slice(5)} · ${
          Math.round((new Date(selB) - new Date(selA)) / 86400000) + 1
        }d`
      : selA
      ? `From ${selA.slice(5)} — pick end date`
      : "Click a date to start";

  const rangeDays =
    selA && selB
      ? Math.round((new Date(selB) - new Date(selA)) / 86400000) + 1
      : null;

  // Range fill bar behind day cells
  const renderRangeFill = (cell, i) => {
    if (cell.t !== "c") return null;
    const d = toDS(yr, mo, cell.d);
    const eff = selA && !selB && hov ? hov : selB;
    if (!selA || !eff) return null;
    const lo = selA < eff ? selA : eff;
    const hi = selA < eff ? eff : selA;
    if (d < lo || d > hi) return null;
    const isFirst = d === lo;
    const isLast = d === hi;
    return (
      <div
        style={{
          position: "absolute",
          top: 3,
          height: 30,
          zIndex: 0,
          background: theme.aL,
          left: isFirst ? "50%" : 0,
          right: isLast ? "50%" : 0,
          borderRadius: isFirst && isLast ? 0 : isFirst ? "15px 0 0 15px" : isLast ? "0 15px 15px 0" : 0,
        }}
      />
    );
  };

  // ─── Styles ─────────────────────────────────────────────────────────────────

  const S = {
    wrap: {
      maxWidth: 860,
      margin: "0 auto",
      borderRadius: 16,
      overflow: "hidden",
      boxShadow: "0 12px 48px rgba(0,0,0,0.18)",
      background: "#fff",
      border: "1px solid #e0e0e0",
      opacity: sliding ? 0.7 : 1,
      transition: "opacity 0.22s",
      fontFamily: "sans-serif",
    },
    spiralBar: {
      height: 28,
      background: "#e8e8e8",
      display: "flex",
      alignItems: "center",
      padding: "0 20px",
      gap: 18,
      borderBottom: "1px solid #d0d0d0",
    },
    coil: {
      width: 14,
      height: 14,
      borderRadius: "50%",
      border: "2.5px solid #aaa",
      background: "#c8c8c8",
      boxShadow: "inset 0 1px 2px rgba(0,0,0,0.2)",
      flexShrink: 0,
    },
    hero: { position: "relative", overflow: "hidden", height: 200 },
    navBtn: (pos) => ({
      position: "absolute",
      top: 14,
      [pos]: 14,
      background: "rgba(255,255,255,0.18)",
      border: "1px solid rgba(255,255,255,0.35)",
      borderRadius: 8,
      color: "white",
      width: 38,
      height: 38,
      cursor: "pointer",
      fontSize: 20,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }),
    monthLabel: {
      position: "absolute",
      right: 32,
      bottom: 32,
      textAlign: "right",
      color: "white",
      pointerEvents: "none",
    },
    bodyGrid: {
      display: "grid",
      gridTemplateColumns: "200px 1fr",
    },
    notesPanel: {
      padding: "22px 18px 22px 22px",
      borderRight: "1px solid #f0f0f0",
      background: "#fafafa",
      display: "flex",
      flexDirection: "column",
    },
    gridPanel: { padding: "20px 22px 18px" },
  };

  return (
    <div style={S.wrap}>
      {/* ── Spiral binding ── */}
      <div style={S.spiralBar}>
        {[...Array(16)].map((_, i) => (
          <div key={i} style={S.coil} />
        ))}
      </div>

      {/* ── Hero image section ── */}
      
<div style={S.hero}>
  <img
    src="/hero-nepal-everest-base-camp-trek-2018.jpg"
    alt="calendar background"
    style={{
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      objectFit: "cover"
    }}
  />

  {/* overlay */}
  <div
    style={{
      position: "absolute",
      inset: 0,
      background: "rgba(0,0,0,0.45)"
    }}
  />

  <ChevronCut accent={theme.accent} />

  <button style={S.navBtn("left")} onClick={() => goMonth(-1)}>‹</button>
  <button style={{ ...S.navBtn("left"), left: 58 }} onClick={() => goMonth(1)}>›</button>

  <div style={S.monthLabel}>
    <div style={{ 
      fontSize: 15,
      letterSpacing: 4,
      textTransform: "uppercase",
      opacity: 0.9,
      fontWeight: 300,
      marginBottom: 2,
      color: "white",
      textShadow: "0 2px 10px rgba(0,0,0,0.8)"
    }}>
      {yr}
    </div>

    <div style={{ 
      fontSize: 46,
      fontWeight: 700,
      letterSpacing: -1,
      lineHeight: 1,
      fontFamily: "Georgia, serif",
      color: "white",
      textShadow: "0 6px 25px rgba(0,0,0,0.9)"
    }}>
      {MONTHS[mo]}
    </div>
  </div>
  </div>
      {/* ── Body: Notes + Grid ── */}
      <div style={S.bodyGrid}>
        {/* Notes panel */}
        <div style={S.notesPanel}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color:"#aaa", marginBottom: 10 }}>
            notes
          </div>
          <div style={{ fontSize: 10, fontFamily: "monospace", padding: "4px 8px", borderRadius: 6, marginBottom: 10, background: theme.aL, color: theme.accent, wordBreak: "break-all", transition: "background 0.3s" }}>
            {rangeLabel}
          </div>
          {rangeDays && (
            <div style={{ fontSize: 10, color: "#bbb", marginBottom: 8 }}>
              {rangeDays} day{rangeDays !== 1 ? "s" : ""} selected
            </div>
          )}
          <div style={{ flex: 1, position: "relative" }}>
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: "repeating-linear-gradient(to bottom,transparent,transparent 27px,#e8e8e8 27px,#e8e8e8 28px)",
                pointerEvents: "none",
              }}
            />
            <textarea
              value={noteVal}
              onChange={(e) => setNote(e.target.value)}
              placeholder={selA && selB ? "Notes for selected range…" : "Monthly notes…"}
              style={{
                width: "100%",
                height: 190,
                resize: "none",
                border: "none",
                background: "transparent",
                fontFamily: "Georgia, serif",
                fontSize: 13,
                lineHeight: "28px",
                color: "#444",
                outline: "none",
                position: "relative",
                zIndex: 1,
              }}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
            <span style={{ fontSize: 10, color: "#bbb" }}>{noteVal.length} chars</span>
            {selA && (
              <button
                onClick={() => { setSelA(null); setSelB(null); }}
                style={{ fontSize: 10, color: "#aaa", background: "none", border: "1px solid #e0e0e0", borderRadius: 4, padding: "3px 8px", cursor: "pointer" }}
              >
                ✕ Clear
              </button>
            )}
          </div>
        </div>

        {/* Calendar grid */}
        <div style={S.gridPanel}>
          {/* Day-of-week headers */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", marginBottom: 6 }}>
            {DAYS.map((d, i) => (
              <div
                key={d}
                style={{
                  textAlign: "center",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                  padding: "3px 0",
                  color: i === 5 ? theme.accent : i === 6 ? "#e53935" : "#bbb",
                }}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", rowGap: 1 }}>
            {cells.map((cell, i) => {
              const state = getState(cell);
              const isSat = i % 7 === 5;
              const isSun = i % 7 === 6;
              const isHoli = cell.t === "c" && holiMap[cell.d];
              const isToday = cell.t === "c" && toDS(yr, mo, cell.d) === todayS;

              const circleBg =
                state === "start" || state === "end" ? theme.accent : "transparent";
              const circleColor =
                state === "start" || state === "end"
                  ? "white"
                  : cell.t !== "c"
                  ? "#ccc"
                  : isSat
                  ? theme.accent
                  : isSun
                  ? "#e53935"
                  : "#333";
              const circleBorder =
                isToday && state !== "start" && state !== "end"
                  ? `2px solid ${theme.accent}`
                  : "none";

              return (
                <div
                  key={i}
                  onClick={() => onDay(cell)}
                  onMouseEnter={() =>
                    cell.t === "c" && selA && !selB && setHov(toDS(yr, mo, cell.d))
                  }
                  onMouseLeave={() => setHov(null)}
                  title={isHoli ? holiMap[cell.d] : undefined}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding: "3px 1px",
                    position: "relative",
                    cursor: cell.t === "c" ? "pointer" : "default",
                  }}
                >
                  {renderRangeFill(cell, i)}
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      background: circleBg,
                      color: circleColor,
                      border: circleBorder,
                      fontWeight: state === "start" || state === "end" || isToday ? 600 : 400,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 13,
                      position: "relative",
                      zIndex: 1,
                      transition: "background 0.12s, color 0.12s",
                    }}
                  >
                    {cell.d}
                  </div>
                  {isHoli && (
                    <div style={{ width: 4, height: 4, borderRadius: "50%", background: theme.accent, marginTop: 1 }} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{ marginTop: 10, fontSize: 10, color: "#ccc", display: "flex", gap: 16, alignItems: "center" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: theme.accent, display: "inline-block" }} />
              Start / End
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: theme.aL, display: "inline-block", border: `1px solid ${theme.accent}` }} />
              In range
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 4, height: 4, borderRadius: "50%", background: theme.accent, display: "inline-block" }} />
              Holiday
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
