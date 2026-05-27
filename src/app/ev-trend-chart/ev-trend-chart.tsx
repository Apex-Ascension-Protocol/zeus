"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import "./ev-trend-chart.css";

/* ─────────────────────────────────────────────
   TYPES & MOCK DATA
   ───────────────────────────────────────────── */

type Scenario = "conservative" | "base" | "accelerated";
type View = "annual" | "cumulative";

interface Point {
  year: number;
  units: number;
  share: number;
}

const RAW: Record<Scenario, Point[]> = {
  conservative: [
    { year: 2026, units: 9, share: 8.0 },
    { year: 2027, units: 14, share: 15.0 },
    { year: 2028, units: 18, share: 18.0 },
    { year: 2029, units: 20, share: 20.0 },
    { year: 2030, units: 22, share: 22.0 },
    { year: 2031, units: 25, share: 25.0 },
  ],
  base: [
    { year: 2026, units: 12, share: 11.0 },
    { year: 2027, units: 20, share: 21.0 },
    { year: 2028, units: 25, share: 25.0 },
    { year: 2029, units: 28, share: 27.0 },
    { year: 2030, units: 30, share: 30.0 },
    { year: 2031, units: 35, share: 35.0 },
  ],
  accelerated: [
    { year: 2026, units: 16, share: 15.0 },
    { year: 2027, units: 27, share: 28.0 },
    { year: 2028, units: 34, share: 34.0 },
    { year: 2029, units: 38, share: 37.0 },
    { year: 2030, units: 41, share: 40.0 },
    { year: 2031, units: 48, share: 47.0 },
  ],
};

const SC_META: Record<
  Scenario,
  { label: string; bar: string; line: string; desc: string }
> = {
  conservative: {
    label: "Conservative",
    bar: "#94a3b8",
    line: "#64748b",
    desc: "Slow policy rollout, high EV prices persist",
  },
  base: {
    label: "Base Case",
    bar: "#f97316",
    line: "#a855f7",
    desc: "Ontario MTO trajectory, current incentives",
  },
  accelerated: {
    label: "Accelerated",
    bar: "#22d3ee",
    line: "#f59e0b",
    desc: "Federal ZEV mandate + infrastructure surge",
  },
};

const peakMW = (units: number) => Math.round(units * 7.2);

/* ─────────────────────────────────────────────
   PAGE
   ───────────────────────────────────────────── */

export default function EVTrendChart() {
  const [scenario, setScenario] = useState<Scenario>("base");
  const [view, setView] = useState<View>("annual");
  const [hovered, setHovered] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  // Re-trigger bar entrance on scenario change
  const switchScenario = (s: Scenario) => {
    setMounted(false);
    setScenario(s);
    setAnimKey((k) => k + 1);
    setTimeout(() => setMounted(true), 80);
  };

  const raw = RAW[scenario];
  const meta = SC_META[scenario];

  const data: Point[] =
    view === "cumulative"
      ? raw.map((d, i) => ({
          ...d,
          units: raw.slice(0, i + 1).reduce((s, r) => s + r.units, 0),
        }))
      : raw;

  /* ── SVG maths ── */
  const W = 800,
    H = 340;
  const M = { top: 28, right: 68, bottom: 46, left: 60 };
  const PW = W - M.left - M.right;
  const PH = H - M.top - M.bottom;

  const maxU = Math.max(...data.map((d) => d.units));
  const yMaxU = Math.ceil((maxU * 1.2) / 10) * 10;
  const yMaxS = 55;
  const step = PW / data.length;
  const bw = step * 0.5;

  const xOf = (i: number) => M.left + step * i + step / 2;
  const yU = (v: number) => M.top + PH - (v / yMaxU) * PH;
  const yS = (v: number) => M.top + PH - (v / yMaxS) * PH;

  const linePath = data
    .map(
      (d, i) =>
        `${i === 0 ? "M" : "L"}${xOf(i).toFixed(1)},${yS(d.share).toFixed(1)}`,
    )
    .join(" ");

  const uTicks = Array.from({ length: 5 }, (_, i) =>
    Math.round((yMaxU * i) / 4),
  );
  const sTicks = [0, 10, 20, 30, 40, 50];

  /* ── Hover data ── */
  const hovIdx =
    hovered !== null ? data.findIndex((d) => d.year === hovered) : -1;
  const hovD = hovIdx >= 0 ? data[hovIdx] : null;
  const hovPrev = hovIdx > 0 ? data[hovIdx - 1] : null;

  // Tooltip flip: if bar is in right half, show tooltip on left
  const tooltipRight = hovIdx >= data.length / 2;

  return (
    <div className="etc-wrap">
      {/* ── HEADER ── */}
      <div className="etc-header">
        <div className="etc-header-text">
          <Link href="/" className="etc-back">
            ← Home
          </Link>
          <p className="etc-eyebrow">Ontario MTO · StatCan · Mock Scenarios</p>
          <h2 className="etc-title">BEV Adoption Forecast · 2026–2031</h2>
        </div>
        <div className="etc-view-toggle">
          {(["annual", "cumulative"] as View[]).map((v) => (
            <button
              key={v}
              type="button"
              className={`etc-toggle-btn${view === v ? " etc-toggle-on" : ""}`}
              onClick={() => setView(v)}
            >
              {v === "annual" ? "Annual" : "Cumulative"}
            </button>
          ))}
        </div>
      </div>

      {/* ── SCENARIO TABS ── */}
      <div className="etc-scenarios">
        {(Object.keys(RAW) as Scenario[]).map((s) => (
          <button
            key={s}
            type="button"
            className={`etc-sc-btn${scenario === s ? " etc-sc-on" : ""}`}
            style={{ "--sc-bar": SC_META[s].bar } as React.CSSProperties}
            onClick={() => switchScenario(s)}
          >
            <span className="etc-sc-dot" />
            <span className="etc-sc-label">{SC_META[s].label}</span>
          </button>
        ))}
        <p className="etc-sc-desc">{meta.desc}</p>
      </div>

      {/* ── LEGEND ── */}
      <div className="etc-legend">
        <span className="etc-leg-item">
          <span className="etc-leg-swatch" style={{ background: meta.bar }} />
          Units (Thousands)
        </span>
        <span className="etc-leg-item">
          <span
            className="etc-leg-swatch etc-leg-line-swatch"
            style={{ background: meta.line }}
          />
          Adoption Rate (%)
        </span>
      </div>

      {/* ── CHART AREA ── */}
      <div className="etc-chart-wrap" key={animKey}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="etc-svg"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Gridlines */}
          {uTicks.map((t) => (
            <line
              key={t}
              x1={M.left}
              y1={yU(t)}
              x2={W - M.right}
              y2={yU(t)}
              stroke="rgba(255,255,255,0.05)"
              strokeWidth={1}
            />
          ))}

          {/* Left Y axis */}
          {uTicks.map((t) => (
            <text
              key={t}
              x={M.left - 10}
              y={yU(t) + 4}
              textAnchor="end"
              fontSize={9}
              fontFamily="JetBrains Mono, monospace"
              fill="rgba(255,255,255,0.28)"
            >
              {t}
            </text>
          ))}
          <text
            x={-(M.top + PH / 2)}
            y={14}
            textAnchor="middle"
            fontSize={7.5}
            fontFamily="JetBrains Mono, monospace"
            fill="rgba(255,255,255,0.18)"
            letterSpacing="0.12em"
            transform="rotate(-90)"
          >
            UNITS (THOUSANDS)
          </text>

          {/* Right Y axis */}
          {sTicks.map((t) => (
            <text
              key={t}
              x={W - M.right + 10}
              y={yS(t) + 4}
              textAnchor="start"
              fontSize={9}
              fontFamily="JetBrains Mono, monospace"
              fill={`${meta.line}99`}
            >
              {t}%
            </text>
          ))}
          <text
            x={M.top + PH / 2}
            y={-(W - 13)}
            textAnchor="middle"
            fontSize={7.5}
            fontFamily="JetBrains Mono, monospace"
            fill={`${meta.line}66`}
            letterSpacing="0.12em"
            transform="rotate(90)"
          >
            SHARE (%)
          </text>

          {/* Bars */}
          {data.map((d, i) => {
            const bh = mounted ? (d.units / yMaxU) * PH : 0;
            const bx = xOf(i) - bw / 2;
            const by = M.top + PH - bh;
            const isH = d.year === hovered;

            return (
              <g
                key={`${d.year}-${scenario}`}
                style={{ cursor: "pointer" }}
                onMouseEnter={() => setHovered(d.year)}
                onMouseLeave={() => setHovered(null)}
              >
                {/* Column hover bg */}
                {isH && (
                  <rect
                    x={xOf(i) - step / 2 + 2}
                    y={M.top}
                    width={step - 4}
                    height={PH}
                    fill="rgba(255,255,255,0.03)"
                    rx={4}
                  />
                )}
                {/* Bar */}
                <rect
                  x={bx}
                  y={by}
                  width={bw}
                  height={bh}
                  fill={isH ? meta.bar : meta.bar + "bb"}
                  rx={3}
                  style={{
                    transition:
                      "y 0.55s cubic-bezier(0.16,1,0.3,1), height 0.55s cubic-bezier(0.16,1,0.3,1), fill 0.15s",
                    transitionDelay: `${i * 0.055}s`,
                  }}
                />
                {/* Value label above bar on hover */}
                {isH && mounted && (
                  <g>
                    <rect
                      x={xOf(i) - 22}
                      y={by - 26}
                      width={44}
                      height={20}
                      rx={4}
                      fill="rgba(14,14,18,0.92)"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth={1}
                    />
                    <text
                      x={xOf(i)}
                      y={by - 11}
                      textAnchor="middle"
                      fontSize={10.5}
                      fontFamily="JetBrains Mono, monospace"
                      fontWeight="600"
                      fill={meta.bar}
                    >
                      {d.units}K
                    </text>
                  </g>
                )}
                {/* X label */}
                <text
                  x={xOf(i)}
                  y={H - 10}
                  textAnchor="middle"
                  fontSize={10}
                  fontFamily="JetBrains Mono, monospace"
                  fill={
                    isH ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.28)"
                  }
                  style={{ transition: "fill 0.15s" }}
                >
                  {d.year}
                </text>
              </g>
            );
          })}

          {/* Line glow */}
          <path
            d={linePath}
            fill="none"
            stroke={`${meta.line}30`}
            strokeWidth={8}
            strokeLinejoin="round"
            strokeLinecap="round"
            style={{ transition: "d 0.5s cubic-bezier(0.16,1,0.3,1)" }}
          />
          {/* Line */}
          <path
            d={linePath}
            fill="none"
            stroke={meta.line}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
            style={{ transition: "d 0.5s cubic-bezier(0.16,1,0.3,1)" }}
          />
          {/* Line dots */}
          {data.map((d, i) => (
            <circle
              key={d.year}
              cx={xOf(i)}
              cy={yS(d.share)}
              r={d.year === hovered ? 6 : 4}
              fill="#0a0a0c"
              stroke={meta.line}
              strokeWidth={2}
              style={{
                transition:
                  "r 0.15s, cx 0.5s cubic-bezier(0.16,1,0.3,1), cy 0.5s cubic-bezier(0.16,1,0.3,1)",
              }}
              onMouseEnter={() => setHovered(d.year)}
              onMouseLeave={() => setHovered(null)}
            />
          ))}
        </svg>

        {/* Rich tooltip */}
        {hovD && (
          <div
            className={`etc-tooltip${tooltipRight ? " etc-tt-left" : ""}`}
            style={{
              left: tooltipRight ? "auto" : `${(xOf(hovIdx) / W) * 100}%`,
              right: tooltipRight
                ? `${((W - xOf(hovIdx)) / W) * 100}%`
                : "auto",
            }}
          >
            <div className="etc-tt-head">
              <span className="etc-tt-year">{hovD.year}</span>
              <span className="etc-tt-sc" style={{ color: meta.bar }}>
                {meta.label}
              </span>
            </div>
            <div className="etc-tt-divider" />
            <div className="etc-tt-row">
              <span className="etc-tt-key">Units</span>
              <span className="etc-tt-v" style={{ color: meta.bar }}>
                {hovD.units}K
              </span>
            </div>
            {hovPrev && (
              <div className="etc-tt-row">
                <span className="etc-tt-key">YoY Δ</span>
                <span className="etc-tt-v" style={{ color: "#4ade80" }}>
                  +{hovD.units - hovPrev.units}K
                </span>
              </div>
            )}
            <div className="etc-tt-row">
              <span className="etc-tt-key">Market share</span>
              <span className="etc-tt-v" style={{ color: meta.line }}>
                {hovD.share}%
              </span>
            </div>
            <div className="etc-tt-row">
              <span className="etc-tt-key">Peak load est.</span>
              <span className="etc-tt-v">+{peakMW(hovD.units)} MW</span>
            </div>
          </div>
        )}
      </div>

      {/* ── KPI STRIP ── */}
      <div className="etc-kpis">
        {[
          {
            label: "2031 Forecast",
            val: `${data[data.length - 1].units}K`,
            unit: "units",
          },
          {
            label: "Total 2026–31",
            val: `${raw.reduce((s, d) => s + d.units, 0)}K`,
            unit: "cumulative",
          },
          {
            label: "2031 Market Share",
            val: `${data[data.length - 1].share}%`,
            unit: "",
          },
          {
            label: "2031 Peak Load Est.",
            val: `+${peakMW(data[data.length - 1].units)}`,
            unit: "MW",
          },
        ].map((k) => (
          <div key={k.label} className="etc-kpi">
            <span className="etc-kpi-val" style={{ color: meta.bar }}>
              {k.val}
              {k.unit && <span className="etc-kpi-unit">{k.unit}</span>}
            </span>
            <span className="etc-kpi-label">{k.label}</span>
          </div>
        ))}
      </div>

      {/* ── TABLE ── */}
      <div className="etc-table">
        <div className="etc-table-head">
          <span>YEAR</span>
          <span>UNITS (K)</span>
          <span>YoY Δ</span>
          <span>SHARE</span>
          <span>PEAK LOAD</span>
        </div>
        {data.map((d, i) => {
          const prev = i > 0 ? data[i - 1] : null;
          const delta = prev ? d.units - prev.units : null;
          return (
            <div
              key={d.year}
              className={`etc-table-row${hovered === d.year ? " etc-tr-hov" : ""}`}
              onMouseEnter={() => setHovered(d.year)}
              onMouseLeave={() => setHovered(null)}
            >
              <span className="etc-tc-year">{d.year}</span>
              <span style={{ color: meta.bar, fontWeight: 600 }}>
                {d.units}
              </span>
              <span className="etc-tc-delta">
                {delta !== null ? `+${delta}K` : "—"}
              </span>
              <span style={{ color: meta.line }}>{d.share.toFixed(1)}%</span>
              <span className="etc-tc-peak">+{peakMW(d.units)} MW</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
