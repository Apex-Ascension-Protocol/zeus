"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import "./risk-register.css";

/* ─────────────────────────────────────────────
   RISK REGISTER  —  a peer page to /platform

   A standing watchlist of every grid system running at
   80% load or above. Each entry keeps a rolling record of
   what its usage has looked like (12 weeks), derives how
   rapidly that load is climbing, and projects the month it
   reaches 100%.

   All data is mock and deterministic (no Math.random /
   Date.now at render) so the page server-renders without
   hydration drift.
   ───────────────────────────────────────────── */

type StatusTier = "critical" | "high" | "elevated";
type GrowthTier = "rapid" | "steady" | "slow";
type SystemType = "Substation" | "Feeder" | "Transformer";
type SortKey = "usage" | "growth" | "breach";

interface RiskSystem {
  id: string;
  name: string;
  code: string;
  type: SystemType;
  region: string;
  usagePct: number;
  capacityMva: number;
  growthPerMonth: number;
  registered: string;
}

const THRESHOLD = 80;
const NOW = new Date(2026, 0, 1); // Jan 2026 — fixed for deterministic projections
const LAST_UPDATED = "Jan 2026  ·  09:00 EST";

const SYSTEMS: RiskSystem[] = [
  {
    id: "rsk-tecumseh",
    name: "Tecumseh TS",
    code: "TCM",
    type: "Substation",
    region: "Windsor",
    usagePct: 95,
    capacityMva: 720,
    growthPerMonth: 1.1,
    registered: "Aug 2025",
  },
  {
    id: "rsk-beck",
    name: "Sir Adam Beck",
    code: "BCK",
    type: "Substation",
    region: "Niagara",
    usagePct: 99,
    capacityMva: 1932,
    growthPerMonth: 0.4,
    registered: "Jun 2025",
  },
  {
    id: "rsk-bra07",
    name: "Feeder BRA-07",
    code: "BRA-07",
    type: "Feeder",
    region: "Brampton",
    usagePct: 96,
    capacityMva: 42,
    growthPerMonth: 3.4,
    registered: "Oct 2025",
  },
  {
    id: "rsk-burlington",
    name: "Burlington TS",
    code: "BUR",
    type: "Substation",
    region: "Hamilton",
    usagePct: 94,
    capacityMva: 1120,
    growthPerMonth: 2.6,
    registered: "Sep 2025",
  },
  {
    id: "rsk-cherrywood",
    name: "Cherrywood TS",
    code: "CHR",
    type: "Substation",
    region: "Toronto",
    usagePct: 92,
    capacityMva: 1280,
    growthPerMonth: 2.1,
    registered: "Sep 2025",
  },
  {
    id: "rsk-manby",
    name: "Manby TS",
    code: "MBY",
    type: "Substation",
    region: "Toronto",
    usagePct: 89,
    capacityMva: 1500,
    growthPerMonth: 1.6,
    registered: "Oct 2025",
  },
  {
    id: "rsk-detweiler",
    name: "Detweiler TS",
    code: "DTW",
    type: "Substation",
    region: "Kitchener",
    usagePct: 88,
    capacityMva: 720,
    growthPerMonth: 2.9,
    registered: "Nov 2025",
  },
  {
    id: "rsk-allanburg",
    name: "Allanburg TS",
    code: "ALB",
    type: "Substation",
    region: "Niagara",
    usagePct: 86,
    capacityMva: 680,
    growthPerMonth: 1.3,
    registered: "Oct 2025",
  },
  {
    id: "rsk-xfmr-union",
    name: "Union Stn Xfmr 3",
    code: "USX-3",
    type: "Transformer",
    region: "Toronto",
    usagePct: 91,
    capacityMva: 60,
    growthPerMonth: 3.8,
    registered: "Nov 2025",
  },
  {
    id: "rsk-horner",
    name: "Horner TS",
    code: "HRN",
    type: "Substation",
    region: "Toronto",
    usagePct: 82,
    capacityMva: 520,
    growthPerMonth: 1.9,
    registered: "Dec 2025",
  },
  {
    id: "rsk-essa",
    name: "Essa TS",
    code: "ESS",
    type: "Substation",
    region: "Barrie",
    usagePct: 81,
    capacityMva: 640,
    growthPerMonth: 2.4,
    registered: "Dec 2025",
  },
  {
    id: "rsk-bar12",
    name: "Feeder BAR-12",
    code: "BAR-12",
    type: "Feeder",
    region: "Barrie",
    usagePct: 84,
    capacityMva: 38,
    growthPerMonth: 1.0,
    registered: "Nov 2025",
  },
];

/* ── derivation helpers ── */

const WIGGLE = [0, 0.7, -0.5, 0.4, -0.8, 0.6, -0.3, 0.5, -0.6, 0.3, -0.4, 0.2];

/** Rebuild the 12-week usage record the register has stored. */
function usageHistory(current: number, gpm: number, points = 12): number[] {
  const perWeek = gpm / 4.345;
  const out: number[] = [];
  for (let i = points - 1; i >= 0; i--) {
    const base = current - perWeek * i;
    const w = WIGGLE[(points - 1 - i) % WIGGLE.length];
    out.push(Math.max(40, Math.min(100, Math.round((base + w) * 10) / 10)));
  }
  return out;
}

function statusTier(usage: number): StatusTier {
  return usage >= 95 ? "critical" : usage >= 88 ? "high" : "elevated";
}
function growthTier(gpm: number): GrowthTier {
  return gpm >= 2.5 ? "rapid" : gpm >= 1.2 ? "steady" : "slow";
}
function monthsToBreach(usage: number, gpm: number): number | null {
  if (gpm <= 0) return null;
  return (100 - usage) / gpm;
}
function breachLabel(usage: number, gpm: number): string {
  const m = monthsToBreach(usage, gpm);
  if (m === null) return "Stable";
  if (m <= 0) return "At limit";
  const d = new Date(NOW.getFullYear(), NOW.getMonth() + Math.round(m), 1);
  return d.toLocaleString("en-US", { month: "short", year: "numeric" });
}

const statusLabel: Record<StatusTier, string> = {
  critical: "Critical",
  high: "High",
  elevated: "Elevated",
};
const growthLabel: Record<GrowthTier, string> = {
  rapid: "Rapid",
  steady: "Steady",
  slow: "Slow",
};

const fmt = (n: number) => n.toLocaleString("en-US");

/* ── tiny inline sparkline ── */
function Spark({ data, tier }: { data: number[]; tier: StatusTier }) {
  const w = 64;
  const h = 22;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = w / (data.length - 1);
  const pts = data
    .map((v, i) => `${i * step},${h - ((v - min) / range) * (h - 4) - 2}`)
    .join(" ");
  return (
    <svg
      className="rr-spark"
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      data-tier={tier}
      aria-hidden
    >
      <polyline points={pts} />
    </svg>
  );
}

/* ─────────────────────────────────────────────
   PAGE
   ───────────────────────────────────────────── */

export default function RiskRegisterPage() {
  const [sortKey, setSortKey] = useState<SortKey>("usage");
  const [openId, setOpenId] = useState<string | null>(null);

  const rows = useMemo(() => {
    const enriched = SYSTEMS.filter((s) => s.usagePct >= THRESHOLD).map(
      (s) => ({
        ...s,
        history: usageHistory(s.usagePct, s.growthPerMonth),
        status: statusTier(s.usagePct),
        gTier: growthTier(s.growthPerMonth),
        breach: breachLabel(s.usagePct, s.growthPerMonth),
        months: monthsToBreach(s.usagePct, s.growthPerMonth),
      }),
    );
    const sorted = [...enriched];
    if (sortKey === "usage") sorted.sort((a, b) => b.usagePct - a.usagePct);
    if (sortKey === "growth")
      sorted.sort((a, b) => b.growthPerMonth - a.growthPerMonth);
    if (sortKey === "breach")
      sorted.sort(
        (a, b) =>
          (a.months ?? Infinity) - (b.months ?? Infinity) ||
          b.usagePct - a.usagePct,
      );
    return sorted;
  }, [sortKey]);

  const summary = useMemo(() => {
    const count = rows.length;
    const critical = rows.filter((r) => r.usagePct >= 95).length;
    const avg = Math.round(
      rows.reduce((a, r) => a + r.usagePct, 0) / (count || 1),
    );
    const fastest = rows.reduce(
      (a, r) => (r.growthPerMonth > a.growthPerMonth ? r : a),
      rows[0],
    );
    const nearest = rows
      .filter((r) => r.months !== null)
      .reduce(
        (a, r) => ((r.months ?? Infinity) < (a.months ?? Infinity) ? r : a),
        rows[0],
      );
    return { count, critical, avg, fastest, nearest };
  }, [rows]);

  const sortBtn = (key: SortKey, label: string) => (
    <button
      type="button"
      className={`rr-sort ${sortKey === key ? "is-active" : ""}`}
      onClick={() => setSortKey(key)}
      aria-pressed={sortKey === key}
    >
      {label}
    </button>
  );

  return (
    <main className="rr-page">
      {/* atmosphere */}
      <div className="rr-backdrop" aria-hidden />
      <div className="rr-vignette" aria-hidden />

      {/* ── TOP BAR (mirrors /platform) ── */}
      <header className="topbar">
        <Link href="/platform" className="topbar-back" aria-label="Back">
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
          <span>Platform</span>
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
          <span className="topbar-status-sub">{LAST_UPDATED}</span>
        </div>
      </header>

      {/* ── REGISTER (shown immediately) ── */}
      <div className="rr-stage">
        <div className="rr-register">
          <header className="rr-head">
            <div className="rr-head-titles">
              <span className="rr-eyebrow">GRID RISK REGISTER</span>
              <h2 className="rr-title">
                Systems at <span className="rr-title-em">capacity</span>
              </h2>
              <p className="rr-sub">
                Every monitored system at {THRESHOLD}% load or above, with a
                rolling 12-week usage record and projected time to limit.
              </p>
            </div>

            <div className="rr-metrics">
              <div className="rr-metric">
                <span className="rr-metric-val">{summary.count}</span>
                <span className="rr-metric-lbl">On register</span>
              </div>
              <div className="rr-metric">
                <span className="rr-metric-val rr-metric-crit">
                  {summary.critical}
                </span>
                <span className="rr-metric-lbl">Critical ≥95%</span>
              </div>
              <div className="rr-metric">
                <span className="rr-metric-val">{summary.avg}%</span>
                <span className="rr-metric-lbl">Avg load</span>
              </div>
              <div className="rr-metric">
                <span className="rr-metric-val">{summary.fastest.code}</span>
                <span className="rr-metric-lbl">
                  Fastest · +{summary.fastest.growthPerMonth}%/mo
                </span>
              </div>
              <div className="rr-metric">
                <span className="rr-metric-val">{summary.nearest.breach}</span>
                <span className="rr-metric-lbl">Nearest limit</span>
              </div>
            </div>
          </header>

          <div className="rr-controls">
            <span className="rr-controls-lbl">SORT BY</span>
            {sortBtn("usage", "Load")}
            {sortBtn("growth", "Growth rate")}
            {sortBtn("breach", "Time to limit")}
          </div>

          <div className="rr-table" role="table">
            <div className="rr-row rr-row-head" role="row">
              <span className="rr-c-system">System</span>
              <span className="rr-c-region">Region</span>
              <span className="rr-c-usage">Load</span>
              <span className="rr-c-trend">12-wk trend</span>
              <span className="rr-c-growth">Growth</span>
              <span className="rr-c-breach">Time to limit</span>
              <span className="rr-c-status">Status</span>
              <span className="rr-c-toggle" aria-hidden />
            </div>

            {rows.map((r) => {
              const open = openId === r.id;
              const peak = Math.max(...r.history);
              const first = r.history[0];
              return (
                <div key={r.id} className={`rr-entry ${open ? "is-open" : ""}`}>
                  <button
                    type="button"
                    className="rr-row rr-row-body"
                    role="row"
                    onClick={() => setOpenId(open ? null : r.id)}
                    aria-expanded={open}
                  >
                    <span className="rr-c-system">
                      <span className="rr-sys-name">{r.name}</span>
                      <span className="rr-sys-meta">
                        {r.code} · {r.type}
                      </span>
                    </span>

                    <span className="rr-c-region">{r.region}</span>

                    <span className="rr-c-usage">
                      <span className="rr-usage-row">
                        <span className="rr-usage-pct" data-tier={r.status}>
                          {r.usagePct}%
                        </span>
                      </span>
                      <span className="rr-usage-bar">
                        <span
                          className="rr-usage-fill"
                          data-tier={r.status}
                          style={{ width: `${r.usagePct}%` }}
                        />
                      </span>
                    </span>

                    <span className="rr-c-trend">
                      <Spark data={r.history} tier={r.status} />
                    </span>

                    <span className="rr-c-growth">
                      <span className="rr-growth-val" data-tier={r.gTier}>
                        +{r.growthPerMonth}%
                      </span>
                      <span className="rr-growth-tag" data-tier={r.gTier}>
                        {growthLabel[r.gTier]}
                      </span>
                    </span>

                    <span className="rr-c-breach">{r.breach}</span>

                    <span className="rr-c-status">
                      <span className="rr-badge" data-tier={r.status}>
                        {statusLabel[r.status]}
                      </span>
                    </span>

                    <span className="rr-c-toggle" aria-hidden>
                      <svg viewBox="0 0 24 24" width="14" height="14">
                        <path
                          d="M7 10 L12 15 L17 10"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </button>

                  {open && (
                    <div className="rr-detail" role="row">
                      <div className="rr-detail-stats">
                        <div className="rr-detail-stat">
                          <span className="rr-detail-lbl">Capacity</span>
                          <span className="rr-detail-val">
                            {fmt(r.capacityMva)} MVA
                          </span>
                        </div>
                        <div className="rr-detail-stat">
                          <span className="rr-detail-lbl">12-wk ago</span>
                          <span className="rr-detail-val">{first}%</span>
                        </div>
                        <div className="rr-detail-stat">
                          <span className="rr-detail-lbl">12-wk peak</span>
                          <span className="rr-detail-val">{peak}%</span>
                        </div>
                        <div className="rr-detail-stat">
                          <span className="rr-detail-lbl">Net rise</span>
                          <span className="rr-detail-val" data-tier={r.gTier}>
                            +{Math.round((r.usagePct - first) * 10) / 10} pts
                          </span>
                        </div>
                        <div className="rr-detail-stat">
                          <span className="rr-detail-lbl">Registered</span>
                          <span className="rr-detail-val">{r.registered}</span>
                        </div>
                      </div>

                      <div className="rr-detail-history">
                        <span className="rr-detail-lbl">
                          STORED USAGE RECORD · weekly load %
                        </span>
                        <div className="rr-history-bars">
                          {r.history.map((v, i) => (
                            <span key={i} className="rr-history-col">
                              <span
                                className="rr-history-bar"
                                data-tier={statusTier(v)}
                                style={{ height: `${v}%` }}
                                title={`Week -${r.history.length - 1 - i}: ${v}%`}
                              />
                            </span>
                          ))}
                        </div>
                        <div className="rr-history-axis">
                          <span>-12 wk</span>
                          <span>now</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <footer className="rr-foot">
            <span>
              {rows.length} systems · threshold {THRESHOLD}% load
            </span>
            <span>Mock data · modelled to Jan 2026</span>
          </footer>
        </div>
      </div>
    </main>
  );
}
