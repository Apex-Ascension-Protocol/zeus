"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import "./oeb-brief.css";

/* ─────────────────────────────────────────────
   OEB BRIEF  —  auto-generated DSP filings

   Generates Ontario Energy Board Distribution System
   Plan (DSP) briefs directly from forecast scenario data.
   Every figure in a brief traces to an assumption that is
   logged with its basis, source and timestamp — an audit
   trail a regulator (or an internal reviewer) can follow.

   The library holds briefs that were generated earlier or
   uploaded to the site; opening one re-renders the scenario
   so you can see what it looked like. All data is mock.
   Seeded library entries use fixed strings (deterministic,
   SSR-safe); newly generated/uploaded briefs are created in
   click handlers, so live timestamps there are fine.
   ───────────────────────────────────────────── */

type Status = "Draft" | "In review" | "Filed";
type Source =
  | "Forecast model"
  | "Historical"
  | "OEB benchmark"
  | "Operator input";

interface Assumption {
  label: string;
  value: string;
  basis: string;
  source: Source;
  logged: string;
}

interface Need {
  system: string;
  driver: string;
  investM: number;
}

interface Brief {
  id: string;
  title: string;
  ref: string;
  region: string;
  scenario: string;
  status: Status;
  generated: string;
  origin: "Generated" | "Uploaded";
  horizonYears: number;
  peakGrowthPct: number;
  projectedPeakMw: number;
  investmentM: number;
  systemsFlagged: number;
  confidencePct: number;
  forecast: number[];
  summary: string;
  needs: Need[];
  assumptions: Assumption[];
}

const REGIONS = [
  "Toronto",
  "Brampton",
  "Hamilton",
  "Niagara",
  "Windsor",
  "Ottawa",
  "Kitchener",
];

const SCENARIOS = [
  "Base case",
  "High EV adoption",
  "Accelerated electrification",
] as const;
type Scenario = (typeof SCENARIOS)[number];

const HORIZONS = [5, 10] as const;

/* per-region base peak demand (MW) and a short code for the filing ref */
const REGION_META: Record<string, { peakMw: number; code: string }> = {
  Toronto: { peakMw: 4850, code: "TOR" },
  Brampton: { peakMw: 1320, code: "BRA" },
  Hamilton: { peakMw: 1180, code: "HAM" },
  Niagara: { peakMw: 740, code: "NFL" },
  Windsor: { peakMw: 960, code: "WIN" },
  Ottawa: { peakMw: 2150, code: "OTT" },
  Kitchener: { peakMw: 1410, code: "KIT" },
};

/* scenario → modelling inputs */
const SCENARIO_INPUTS: Record<
  Scenario,
  { adoption: number; cagr: number; confidence: number }
> = {
  "Base case": { adoption: 0.12, cagr: 2.4, confidence: 90 },
  "High EV adoption": { adoption: 0.28, cagr: 3.9, confidence: 82 },
  "Accelerated electrification": { adoption: 0.42, cagr: 5.6, confidence: 74 },
};

const UNIT_COST_M = 1.4; // $M per MVA of new capacity (OEB benchmark)

/* ── deterministic brief builder ── */
function buildBrief(opts: {
  id: string;
  region: string;
  scenario: Scenario;
  horizon: number;
  origin: "Generated" | "Uploaded";
  generated: string;
  logged: string;
  status: Status;
  sourceName?: string;
}): Brief {
  const { region, scenario, horizon } = opts;
  const meta = REGION_META[region] ?? { peakMw: 1000, code: "GEN" };
  const inp = SCENARIO_INPUTS[scenario];

  const factor = Math.pow(1 + inp.cagr / 100, horizon);
  const peakGrowthPct = Math.round((factor - 1) * 1000) / 10;
  const projectedPeakMw = Math.round(meta.peakMw * factor);
  const addedMw = projectedPeakMw - meta.peakMw;
  const systemsFlagged = Math.round(inp.adoption * 34 + horizon * 1.5);
  const investmentM = Math.round(addedMw * UNIT_COST_M * (0.9 + inp.adoption));

  const forecast = Array.from(
    { length: horizon + 1 },
    (_, y) => Math.round(100 * Math.pow(1 + inp.cagr / 100, y) * 10) / 10,
  );

  const summary =
    `Under the ${scenario.toLowerCase()} scenario, ${region}'s coincident peak ` +
    `is forecast to grow ${peakGrowthPct}% over ${horizon} years, reaching ` +
    `${projectedPeakMw.toLocaleString("en-US")} MW. ${systemsFlagged} distribution ` +
    `systems are projected to exceed planning limits within the horizon, driving an ` +
    `estimated $${investmentM}M in capacity investment. All figures below trace to the ` +
    `logged assumptions; confidence is ${inp.confidence}% (±${Math.round((100 - inp.confidence) / 3)}%).`;

  const needs: Need[] = [
    {
      system: `${meta.code} core feeders`,
      driver: "EV charging + base load growth",
      investM: Math.round(investmentM * 0.42),
    },
    {
      system: `${meta.code} transformer stations`,
      driver: "Coincident peak exceedance",
      investM: Math.round(investmentM * 0.31),
    },
    {
      system: `${meta.code} sub-transmission`,
      driver: "Thermal limit / N-1 contingency",
      investM: Math.round(investmentM * 0.18),
    },
    {
      system: `${meta.code} protection upgrades`,
      driver: "DER / bidirectional flow",
      investM: Math.round(investmentM * 0.09),
    },
  ];

  const assumptions: Assumption[] = [
    {
      label: "Planning horizon",
      value: `${horizon} years`,
      basis: "Filing scope selected by planner",
      source: "Operator input",
      logged: opts.logged,
    },
    {
      label: "Base coincident peak",
      value: `${meta.peakMw.toLocaleString("en-US")} MW`,
      basis: "2025 actuals, weather-normalised",
      source: "Historical",
      logged: opts.logged,
    },
    {
      label: "EV adoption rate",
      value: `${Math.round(inp.adoption * 100)}%/yr`,
      basis: `Scenario: ${scenario}`,
      source: "Forecast model",
      logged: opts.logged,
    },
    {
      label: "Peak load CAGR",
      value: `${inp.cagr}%`,
      basis: "Derived from adoption + electrification curve",
      source: "Forecast model",
      logged: opts.logged,
    },
    {
      label: "Weather normalisation",
      value: "+2.1%",
      basis: "30-year degree-day regression",
      source: "Historical",
      logged: opts.logged,
    },
    {
      label: "Capacity unit cost",
      value: `$${UNIT_COST_M}M / MVA`,
      basis: "OEB distribution cost benchmark",
      source: "OEB benchmark",
      logged: opts.logged,
    },
    {
      label: "Forecast confidence",
      value: `${inp.confidence}%`,
      basis: "Back-tested against 5-yr actuals",
      source: "Forecast model",
      logged: opts.logged,
    },
  ];

  if (opts.sourceName) {
    assumptions.unshift({
      label: "Source document",
      value: opts.sourceName,
      basis: "Uploaded to OEB Brief and parsed",
      source: "Operator input",
      logged: opts.logged,
    });
  }

  return {
    id: opts.id,
    title: `${region} Distribution System Plan`,
    ref: `DSP-2026-${meta.code}-${String(horizon).padStart(2, "0")}`,
    region,
    scenario,
    status: opts.status,
    generated: opts.generated,
    origin: opts.origin,
    horizonYears: horizon,
    peakGrowthPct,
    projectedPeakMw,
    investmentM,
    systemsFlagged,
    confidencePct: inp.confidence,
    forecast,
    summary,
    needs,
    assumptions,
  };
}

/* seeded library (deterministic) */
const SEED: Brief[] = [
  buildBrief({
    id: "brief-tor-10",
    region: "Toronto",
    scenario: "High EV adoption",
    horizon: 10,
    origin: "Generated",
    generated: "Jan 14, 2026",
    logged: "2026-01-14 09:22 EST",
    status: "Filed",
  }),
  buildBrief({
    id: "brief-bra-10",
    region: "Brampton",
    scenario: "Accelerated electrification",
    horizon: 10,
    origin: "Generated",
    generated: "Jan 11, 2026",
    logged: "2026-01-11 14:05 EST",
    status: "In review",
  }),
  buildBrief({
    id: "brief-ott-05",
    region: "Ottawa",
    scenario: "Base case",
    horizon: 5,
    origin: "Uploaded",
    generated: "Dec 2025",
    logged: "2025-12-19 11:40 EST",
    status: "Filed",
    sourceName: "hydro-ottawa-dsp-2025.pdf",
  }),
  buildBrief({
    id: "brief-nfl-05",
    region: "Niagara",
    scenario: "High EV adoption",
    horizon: 5,
    origin: "Uploaded",
    generated: "Dec 2025",
    logged: "2025-12-02 16:18 EST",
    status: "Draft",
    sourceName: "niagara-peaking-study.docx",
  }),
];

const statusTone: Record<Status, string> = {
  Draft: "var(--ink-3)",
  "In review": "var(--elevated)",
  Filed: "var(--slow)",
};

/* ── inline forecast chart ── */
function ForecastMini({ data }: { data: number[] }) {
  const w = 520;
  const h = 150;
  const padL = 30;
  const padR = 14;
  const padT = 14;
  const padB = 24;
  const iW = w - padL - padR;
  const iH = h - padT - padB;
  const min = 100;
  const max = Math.max(...data, 110);
  const range = max - min || 1;
  const x = (i: number) => padL + (i / (data.length - 1)) * iW;
  const y = (v: number) => padT + iH - ((v - min) / range) * iH;
  const line = data.map((v, i) => `${i ? "L" : "M"} ${x(i)} ${y(v)}`).join(" ");
  const area =
    `M ${x(0)} ${y(data[0])} ` +
    data.map((v, i) => `L ${x(i)} ${y(v)}`).join(" ") +
    ` L ${x(data.length - 1)} ${padT + iH} L ${x(0)} ${padT + iH} Z`;
  return (
    <svg className="oeb-chart" viewBox={`0 0 ${w} ${h}`} role="img">
      {[min, (min + max) / 2, max].map((g, i) => (
        <g key={i}>
          <line
            x1={padL}
            y1={y(g)}
            x2={w - padR}
            y2={y(g)}
            className="oeb-grid"
          />
          <text x={padL - 5} y={y(g) + 3} className="oeb-axis">
            {Math.round(g)}
          </text>
        </g>
      ))}
      <path d={area} className="oeb-area" />
      <path d={line} className="oeb-line" />
      {data.map((v, i) =>
        i === 0 || i === data.length - 1 ? (
          <circle key={i} cx={x(i)} cy={y(v)} r="2.6" className="oeb-dot" />
        ) : null,
      )}
      <text x={padL} y={h - 6} className="oeb-axis-x" textAnchor="start">
        Yr 0
      </text>
      <text x={w - padR} y={h - 6} className="oeb-axis-x" textAnchor="end">
        Yr {data.length - 1}
      </text>
    </svg>
  );
}

/* ─────────────────────────────────────────────
   CUSTOM DROPDOWN
   A styled listbox to replace the native <select>:
   click-outside to close, full keyboard support
   (arrows / home / end / enter / esc), animated panel.
   ───────────────────────────────────────────── */
function Dropdown({
  value,
  options,
  onChange,
  label,
}: {
  value: string;
  options: readonly string[];
  onChange: (v: string) => void;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const openMenu = () => {
    setActive(Math.max(0, options.indexOf(value)));
    setOpen(true);
  };
  const choose = (v: string) => {
    onChange(v);
    setOpen(false);
  };

  const onKey = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (!open) return openMenu();
        setActive((a) => (a + 1) % options.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        if (!open) return openMenu();
        setActive((a) => (a - 1 + options.length) % options.length);
        break;
      case "Home":
        if (open) {
          e.preventDefault();
          setActive(0);
        }
        break;
      case "End":
        if (open) {
          e.preventDefault();
          setActive(options.length - 1);
        }
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (open) choose(options[active]);
        else openMenu();
        break;
      case "Escape":
        setOpen(false);
        break;
      case "Tab":
        setOpen(false);
        break;
    }
  };

  return (
    <div className={`oeb-select ${open ? "is-open" : ""}`} ref={ref}>
      <button
        type="button"
        className="oeb-select-trigger"
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={onKey}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${label}: ${value}`}
      >
        <span className="oeb-select-value">{value}</span>
        <svg
          className="oeb-select-chevron"
          viewBox="0 0 24 24"
          width="13"
          height="13"
          aria-hidden
        >
          <path
            d="M7 10 L12 15 L17 10"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <ul className="oeb-select-menu" role="listbox" aria-label={label}>
          {options.map((opt, i) => (
            <li
              key={opt}
              role="option"
              aria-selected={opt === value}
              className={`oeb-select-option ${
                opt === value ? "is-selected" : ""
              } ${i === active ? "is-active" : ""}`}
              style={{ "--i": i } as React.CSSProperties}
              onClick={() => choose(opt)}
              onMouseEnter={() => setActive(i)}
            >
              <span>{opt}</span>
              <svg
                className="oeb-select-check"
                viewBox="0 0 24 24"
                width="13"
                height="13"
                aria-hidden
              >
                <path
                  d="M5 12.5 L10 17.5 L19 7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   ANIMATED FIGURE
   Counts up from zero whenever its value changes.
   SSR-safe (first render is 0, matching the server),
   and honours prefers-reduced-motion.
   ───────────────────────────────────────────── */
function AnimatedNumber({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  separator = false,
  duration = 950,
}: {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  separator?: boolean;
  duration?: number;
}) {
  const [display, setDisplay] = useState(0);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setDisplay(value);
      return;
    }
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(value * eased);
      if (t < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [value, duration]);

  const text = separator
    ? display.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })
    : display.toFixed(decimals);

  return (
    <>
      {prefix}
      {text}
      {suffix}
    </>
  );
}

/* ─────────────────────────────────────────────
   PAGE
   ───────────────────────────────────────────── */

export default function OebBriefPage() {
  const [library, setLibrary] = useState<Brief[]>(SEED);
  const [activeId, setActiveId] = useState<string>(SEED[0].id);
  const [genRegion, setGenRegion] = useState<string>("Toronto");
  const [genScenario, setGenScenario] = useState<Scenario>("High EV adoption");
  const [genHorizon, setGenHorizon] = useState<number>(10);
  const fileRef = useRef<HTMLInputElement>(null);
  const [newId, setNewId] = useState<string | null>(null);

  /* briefly highlight a freshly added library entry */
  const flash = (id: string) => {
    setNewId(id);
    window.setTimeout(() => setNewId((c) => (c === id ? null : c)), 1400);
  };

  /* cursor-following light on the document (writes CSS vars, no re-render) */
  const onDocMove = (e: React.PointerEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
    el.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
  };

  const active = useMemo(
    () => library.find((b) => b.id === activeId) ?? library[0],
    [library, activeId],
  );

  const stamp = () => {
    const d = new Date();
    const date = d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const log = `${d.toISOString().slice(0, 16).replace("T", " ")} EST`;
    return { date, log };
  };

  const generate = () => {
    const { date, log } = stamp();
    const brief = buildBrief({
      id: `brief-${Date.now()}`,
      region: genRegion,
      scenario: genScenario,
      horizon: genHorizon,
      origin: "Generated",
      generated: date,
      logged: log,
      status: "Draft",
    });
    setLibrary((prev) => [brief, ...prev]);
    setActiveId(brief.id);
    flash(brief.id);
  };

  const onUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { date, log } = stamp();
    /* Real DSP parsing is out of scope — we synthesise a scenario from the
       upload so the user can see how a filed document gets visualised. */
    const brief = buildBrief({
      id: `brief-${Date.now()}`,
      region: genRegion,
      scenario: genScenario,
      horizon: genHorizon,
      origin: "Uploaded",
      generated: date,
      logged: log,
      status: "In review",
      sourceName: file.name,
    });
    setLibrary((prev) => [brief, ...prev]);
    setActiveId(brief.id);
    flash(brief.id);
    e.target.value = "";
  };

  return (
    <main className="oeb-page">
      <div className="oeb-backdrop" aria-hidden />
      <div className="oeb-vignette" aria-hidden />

      {/* ── TOP BAR ── */}
      <header className="topbar">
        <Link href="/" className="topbar-back" aria-label="Back">
          <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden>
            <path
              d="M15 6 L9 12 L15 18"
              stroke="currentColor"
              strokeWidth="1.6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>Home</span>
        </Link>

        <div className="topbar-logo">
          <Image
            src="/logo_zeus.png"
            alt="ZEUS"
            width={72}
            height={22}
            priority
            className="topbar-logo-img"
          />
        </div>

        <div className="topbar-status">
          <span className="topbar-pulse" />
          <span className="topbar-status-text">LIVE</span>
          <span className="topbar-status-sub">OEB DSP · Jan 2026</span>
        </div>
      </header>

      {/* ── CONTENT ── */}
      <div className="oeb-stage">
        <div className="oeb-shell">
          {/* SIDEBAR — generator + library */}
          <aside className="oeb-side">
            <div className="oeb-card oeb-gen">
              <span className="oeb-card-title">GENERATE BRIEF</span>

              <div className="oeb-field">
                <span className="oeb-field-lbl">Region</span>
                <Dropdown
                  label="Region"
                  value={genRegion}
                  options={REGIONS}
                  onChange={setGenRegion}
                />
              </div>

              <div className="oeb-field">
                <span className="oeb-field-lbl">Scenario</span>
                <Dropdown
                  label="Scenario"
                  value={genScenario}
                  options={SCENARIOS}
                  onChange={(v) => setGenScenario(v as Scenario)}
                />
              </div>

              <div className="oeb-field">
                <span className="oeb-field-lbl">Horizon</span>
                <div className="oeb-seg">
                  {HORIZONS.map((h) => (
                    <button
                      key={h}
                      type="button"
                      className={`oeb-seg-btn ${genHorizon === h ? "is-active" : ""}`}
                      onClick={() => setGenHorizon(h)}
                    >
                      {h} yr
                    </button>
                  ))}
                </div>
              </div>

              <button type="button" className="oeb-gen-btn" onClick={generate}>
                Generate DSP brief
                <span aria-hidden>→</span>
              </button>

              <button
                type="button"
                className="oeb-upload-btn"
                onClick={() => fileRef.current?.click()}
              >
                <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden>
                  <path
                    d="M12 16 V5 M8 9 L12 5 L16 9 M5 17 V19 H19 V17"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Upload existing brief
              </button>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.doc,.docx"
                className="oeb-file-hidden"
                onChange={onUpload}
              />
            </div>

            <div className="oeb-card oeb-lib">
              <span className="oeb-card-title">
                BRIEF LIBRARY{" "}
                <span className="oeb-card-sub">({library.length})</span>
              </span>
              <ul className="oeb-lib-list">
                {library.map((b) => (
                  <li key={b.id}>
                    <button
                      type="button"
                      className={`oeb-lib-item ${
                        b.id === active.id ? "is-active" : ""
                      } ${b.id === newId ? "is-new" : ""}`}
                      onClick={() => setActiveId(b.id)}
                    >
                      <span className="oeb-lib-top">
                        <span className="oeb-lib-ref">{b.ref}</span>
                        <span
                          className="oeb-lib-status"
                          style={{ color: statusTone[b.status] }}
                        >
                          {b.status}
                        </span>
                      </span>
                      <span className="oeb-lib-name">{b.title}</span>
                      <span className="oeb-lib-meta">
                        {b.origin} · {b.scenario} · {b.generated}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* DOCUMENT */}
          <article
            key={active.id}
            className="oeb-doc"
            aria-label="DSP brief document"
            onPointerMove={onDocMove}
          >
            <div className="oeb-doc-head">
              <div className="oeb-doc-head-l">
                <span className="oeb-doc-eyebrow">
                  ONTARIO ENERGY BOARD · DISTRIBUTION SYSTEM PLAN
                </span>
                <h1 className="oeb-doc-title">
                  {active.region}{" "}
                  <span className="oeb-title-em">Distribution System Plan</span>
                </h1>
                <div className="oeb-doc-meta">
                  <span>{active.ref}</span>
                  <span className="oeb-dot">·</span>
                  <span>{active.scenario}</span>
                  <span className="oeb-dot">·</span>
                  <span>{active.horizonYears}-yr horizon</span>
                  <span className="oeb-dot">·</span>
                  <span>{active.origin}</span>
                </div>
              </div>
              <div className="oeb-doc-head-r">
                <span
                  className="oeb-doc-status"
                  style={{
                    color: statusTone[active.status],
                    borderColor: statusTone[active.status],
                  }}
                >
                  {active.status}
                </span>
                <span className="oeb-doc-date">
                  Generated {active.generated}
                </span>
              </div>
            </div>

            {/* headline figures */}
            <div className="oeb-kpis">
              <div className="oeb-kpi">
                <span className="oeb-kpi-val">
                  <AnimatedNumber
                    value={active.peakGrowthPct}
                    decimals={1}
                    prefix="+"
                    suffix="%"
                  />
                </span>
                <span className="oeb-kpi-lbl">Peak demand growth</span>
              </div>
              <div className="oeb-kpi">
                <span className="oeb-kpi-val">
                  <AnimatedNumber value={active.projectedPeakMw} separator />
                </span>
                <span className="oeb-kpi-lbl">Projected peak (MW)</span>
              </div>
              <div className="oeb-kpi">
                <span className="oeb-kpi-val">
                  <AnimatedNumber
                    value={active.investmentM}
                    prefix="$"
                    suffix="M"
                  />
                </span>
                <span className="oeb-kpi-lbl">Capacity investment</span>
              </div>
              <div className="oeb-kpi">
                <span className="oeb-kpi-val">
                  <AnimatedNumber value={active.systemsFlagged} />
                </span>
                <span className="oeb-kpi-lbl">Systems flagged</span>
              </div>
            </div>

            {/* 1. Executive summary */}
            <section className="oeb-section">
              <h2 className="oeb-h2">1 · Executive summary</h2>
              <p className="oeb-prose">{active.summary}</p>
            </section>

            {/* 2. Demand forecast */}
            <section className="oeb-section">
              <h2 className="oeb-h2">2 · Demand forecast</h2>
              <p className="oeb-prose">
                Indexed coincident peak (Year 0 = 100) across the planning
                horizon under the selected scenario.
              </p>
              <ForecastMini data={active.forecast} />
            </section>

            {/* 3. System needs */}
            <section className="oeb-section">
              <h2 className="oeb-h2">
                3 · System needs &amp; investment drivers
              </h2>
              <ul className="oeb-needs">
                {active.needs.map((n) => {
                  const max = Math.max(...active.needs.map((x) => x.investM));
                  return (
                    <li key={n.system} className="oeb-need">
                      <span className="oeb-need-system">{n.system}</span>
                      <span className="oeb-need-driver">{n.driver}</span>
                      <span className="oeb-need-bar">
                        <span
                          className="oeb-need-fill"
                          style={{ width: `${(n.investM / max) * 100}%` }}
                        />
                      </span>
                      <span className="oeb-need-val">${n.investM}M</span>
                    </li>
                  );
                })}
              </ul>
            </section>

            {/* 4. Assumptions & audit log */}
            <section className="oeb-section">
              <h2 className="oeb-h2">4 · Assumptions &amp; audit log</h2>
              <p className="oeb-prose oeb-prose-mute">
                Every figure above derives from the assumptions below. Each is
                logged with its basis, source and time of record.
              </p>
              <div className="oeb-audit" role="table">
                <div className="oeb-audit-row oeb-audit-head" role="row">
                  <span>Assumption</span>
                  <span>Value</span>
                  <span>Basis</span>
                  <span>Source</span>
                  <span>Logged</span>
                </div>
                {active.assumptions.map((a) => (
                  <div key={a.label} className="oeb-audit-row" role="row">
                    <span className="oeb-audit-label">{a.label}</span>
                    <span className="oeb-audit-value">{a.value}</span>
                    <span className="oeb-audit-basis">{a.basis}</span>
                    <span className="oeb-audit-source">
                      <span className="oeb-source-tag">{a.source}</span>
                    </span>
                    <span className="oeb-audit-logged">{a.logged}</span>
                  </div>
                ))}
              </div>
            </section>

            <footer className="oeb-doc-foot">
              <span>
                {active.ref} · confidence {active.confidencePct}% ·{" "}
                {active.assumptions.length} assumptions logged
              </span>
              <span>Auto-generated · mock data</span>
            </footer>
          </article>
        </div>
      </div>
    </main>
  );
}
