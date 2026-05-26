"use client";

import { useState, useCallback } from "react";
import "./simulator.css";

/* ─────────────────────────────────────────────
   TYPES & DATA
   ───────────────────────────────────────────── */

interface Param {
  id: string;
  label: string;
  unit: string;
  unitPos: "pre" | "post";
  min: number;
  max: number;
  step: number;
  baseline: number;
  value: number;
}

interface Feeder {
  id: string;
  name: string;
  region: string;
  baseCapacity: number;
  baseEvLoad: number;
  purchaseIdx: number;
}

const PARAMS: Param[] = [
  {
    id: "gas_price",
    label: "Gas Price",
    unit: "$",
    unitPos: "pre",
    min: 0.9,
    max: 2.8,
    step: 0.01,
    baseline: 1.65,
    value: 1.65,
  },
  {
    id: "ev_msrp",
    label: "Affordable EV Price",
    unit: "K",
    unitPos: "post",
    min: 22,
    max: 65,
    step: 0.5,
    baseline: 42,
    value: 42,
  },
  {
    id: "adoption_rate",
    label: "Adoption Velocity",
    unit: "%",
    unitPos: "post",
    min: 5,
    max: 55,
    step: 1,
    baseline: 22,
    value: 22,
  },
  {
    id: "carbon_tax",
    label: "Carbon Levy",
    unit: "$",
    unitPos: "pre",
    min: 0,
    max: 270,
    step: 5,
    baseline: 80,
    value: 80,
  },
  {
    id: "charging_infra",
    label: "Charging Ports / 1K EV",
    unit: "",
    unitPos: "post",
    min: 4,
    max: 40,
    step: 1,
    baseline: 12,
    value: 12,
  },
];

const FEEDERS: Feeder[] = [
  {
    id: "tor-east",
    name: "Toronto East",
    region: "GTA",
    baseCapacity: 87,
    baseEvLoad: 3240,
    purchaseIdx: 72,
  },
  {
    id: "tor-west",
    name: "Toronto West",
    region: "GTA",
    baseCapacity: 81,
    baseEvLoad: 2980,
    purchaseIdx: 69,
  },
  {
    id: "mississauga",
    name: "Mississauga Central",
    region: "GTA",
    baseCapacity: 79,
    baseEvLoad: 2640,
    purchaseIdx: 74,
  },
  {
    id: "brampton",
    name: "Brampton North",
    region: "GTA",
    baseCapacity: 76,
    baseEvLoad: 2290,
    purchaseIdx: 71,
  },
  {
    id: "hamilton",
    name: "Hamilton Industrial",
    region: "Golden Horseshoe",
    baseCapacity: 83,
    baseEvLoad: 2870,
    purchaseIdx: 58,
  },
  {
    id: "niagara",
    name: "Niagara Peninsula",
    region: "Golden Horseshoe",
    baseCapacity: 74,
    baseEvLoad: 1840,
    purchaseIdx: 55,
  },
  {
    id: "kitchener",
    name: "Kitchener-Waterloo",
    region: "SW Ontario",
    baseCapacity: 71,
    baseEvLoad: 1920,
    purchaseIdx: 62,
  },
  {
    id: "london",
    name: "London Metro",
    region: "SW Ontario",
    baseCapacity: 68,
    baseEvLoad: 1610,
    purchaseIdx: 59,
  },
  {
    id: "windsor",
    name: "Windsor Industrial",
    region: "SW Ontario",
    baseCapacity: 82,
    baseEvLoad: 2340,
    purchaseIdx: 52,
  },
  {
    id: "ottawa-core",
    name: "Ottawa Core",
    region: "Eastern",
    baseCapacity: 65,
    baseEvLoad: 1540,
    purchaseIdx: 77,
  },
  {
    id: "kingston",
    name: "Kingston District",
    region: "Eastern",
    baseCapacity: 58,
    baseEvLoad: 980,
    purchaseIdx: 64,
  },
  {
    id: "barrie",
    name: "Barrie-Simcoe",
    region: "Northern",
    baseCapacity: 62,
    baseEvLoad: 1120,
    purchaseIdx: 60,
  },
  {
    id: "sudbury",
    name: "Sudbury Basin",
    region: "Northern",
    baseCapacity: 55,
    baseEvLoad: 760,
    purchaseIdx: 44,
  },
];

/* ─────────────────────────────────────────────
   SIMULATION
   ───────────────────────────────────────────── */

function fmt(v: number, p: Param): string {
  const n = v.toFixed(p.step < 1 ? 2 : 0);
  if (p.id === "ev_msrp") return `$${n}K`;
  return p.unitPos === "pre" ? `${p.unit}${n}` : `${n}${p.unit}`;
}

function simulate(f: Feeder, params: Param[]): number {
  const p = Object.fromEntries(params.map((p) => [p.id, p.value]));
  const pressure =
    ((p.gas_price - 0.9) / 1.9) * 0.32 +
    (1 - (p.ev_msrp - 22) / 43) * 0.28 +
    (p.adoption_rate / 55) * 0.22 +
    (p.carbon_tax / 270) * 0.1 +
    ((p.charging_infra - 4) / 36) * 0.08;
  const mult = 0.7 + (f.purchaseIdx / 100) * 0.6;
  return Math.min(
    99,
    Math.round((f.baseCapacity + pressure * mult * 14) * 10) / 10,
  );
}

type Level = "critical" | "high" | "moderate" | "low";

function getLevel(cap: number): Level {
  if (cap >= 85) return "critical";
  if (cap >= 75) return "high";
  if (cap >= 65) return "moderate";
  return "low";
}

const LEVEL_COLOR: Record<Level, string> = {
  critical: "#FF4D4D",
  high: "#F4C040",
  moderate: "#BA7517",
  low: "#4ADE80",
};

/* ─────────────────────────────────────────────
   PAGE
   ───────────────────────────────────────────── */

export default function SimulatorPage() {
  const [params, setParams] = useState<Param[]>(PARAMS);

  const onChange = useCallback((id: string, val: number) => {
    setParams((prev) =>
      prev.map((p) => (p.id === id ? { ...p, value: val } : p)),
    );
  }, []);

  const reset = useCallback(() => setParams(PARAMS), []);
  const dirty = params.some((p) => p.value !== p.baseline);

  const results = FEEDERS.map((f) => ({
    feeder: f,
    cap: simulate(f, params),
  })).sort((a, b) => b.cap - a.cap);

  const critical = results.filter((r) => getLevel(r.cap) === "critical").length;
  const high = results.filter((r) => getLevel(r.cap) === "high").length;
  const avgCap = Math.round(
    results.reduce((s, r) => s + r.cap, 0) / results.length,
  );
  const totalLoad =
    Math.round(
      (results.reduce(
        (s, r) => s + r.feeder.baseEvLoad * (r.cap / r.feeder.baseCapacity),
        0,
      ) /
        1000) *
        10,
    ) / 10;

  return (
    <div className="sim">
      {/* ── LEFT: SLIDERS ── */}
      <aside className="sim-left">
        <div className="sim-head">
          <div>
            <p className="sim-eyebrow">Macro Shock Simulator</p>
            <h1 className="sim-title">
              Adjust variables.
              <br />
              See the impact.
            </h1>
          </div>
          {dirty && (
            <button className="sim-reset" onClick={reset} type="button">
              ↺ Reset
            </button>
          )}
        </div>

        <div className="sim-sliders">
          {params.map((p) => {
            const pct = ((p.value - p.min) / (p.max - p.min)) * 100;
            const basePct = ((p.baseline - p.min) / (p.max - p.min)) * 100;
            const delta = p.value - p.baseline;
            return (
              <div key={p.id} className="sl-row">
                <div className="sl-meta">
                  <span className="sl-label">{p.label}</span>
                  <div className="sl-right">
                    <span className="sl-val">{fmt(p.value, p)}</span>
                    {delta !== 0 && (
                      <span
                        className={`sl-delta ${delta > 0 ? "sl-up" : "sl-dn"}`}
                      >
                        {delta > 0 ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </div>
                <div className="sl-track">
                  <div className="sl-fill" style={{ width: `${pct}%` }} />
                  <div className="sl-base" style={{ left: `${basePct}%` }} />
                  <input
                    type="range"
                    min={p.min}
                    max={p.max}
                    step={p.step}
                    value={p.value}
                    onChange={(e) => onChange(p.id, parseFloat(e.target.value))}
                    aria-label={p.label}
                  />
                </div>
                <div className="sl-bounds">
                  <span>{fmt(p.min, p)}</span>
                  <span>{fmt(p.max, p)}</span>
                </div>
              </div>
            );
          })}
        </div>

        <p className="sim-note">
          XGBoost demand model · ARIMA adoption curve · OEB feeder data · 5-year
          horizon
        </p>
      </aside>

      {/* ── RIGHT: RESULTS ── */}
      <main className="sim-right">
        {/* KPIs */}
        <div className="sim-kpis">
          <div className="kpi">
            <span
              className="kpi-val"
              style={{ color: critical > 0 ? "#FF4D4D" : "#4ADE80" }}
            >
              {critical}
            </span>
            <span className="kpi-label">Critical feeders</span>
          </div>
          <div className="kpi-sep" />
          <div className="kpi">
            <span
              className="kpi-val"
              style={{ color: high > 2 ? "#F4C040" : "inherit" }}
            >
              {high}
            </span>
            <span className="kpi-label">High load</span>
          </div>
          <div className="kpi-sep" />
          <div className="kpi">
            <span className="kpi-val">
              {totalLoad}
              <span className="kpi-unit">GW</span>
            </span>
            <span className="kpi-label">Projected EV load</span>
          </div>
          <div className="kpi-sep" />
          <div className="kpi">
            <span className="kpi-val">
              {avgCap}
              <span className="kpi-unit">%</span>
            </span>
            <span className="kpi-label">Avg capacity</span>
          </div>
        </div>

        {/* Feeder list */}
        <div className="feeder-list">
          <div className="feeder-list-head">
            <span>FEEDER</span>
            <span>CAPACITY UTILISATION</span>
            <span>5-YR</span>
          </div>
          {results.map(({ feeder, cap }) => {
            const lv = getLevel(cap);
            const color = LEVEL_COLOR[lv];
            return (
              <div key={feeder.id} className="feeder-row">
                <div className="feeder-info">
                  <span className="feeder-dot" style={{ background: color }} />
                  <div className="feeder-text">
                    <span className="feeder-name">{feeder.name}</span>
                    <span className="feeder-region">{feeder.region}</span>
                  </div>
                </div>
                <div className="feeder-bar-track">
                  <div
                    className="feeder-bar-fill"
                    style={{ width: `${cap}%`, background: color }}
                  />
                  <div className="feeder-threshold" />
                </div>
                <span className="feeder-cap" style={{ color }}>
                  {cap}%
                </span>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
