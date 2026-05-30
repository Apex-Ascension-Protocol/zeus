"use client";

import { useState } from "react";
import "./ev-research.css";

/* ─────────────────────────────────────────────
   TYPES
   ───────────────────────────────────────────── */

type Scenario = "conservative" | "base" | "accelerated";
type Impact = "tailwind" | "headwind" | "neutral";
type Outlook = "tailwind" | "headwind" | "mixed";

interface Source {
  title: string;
  url: string;
}

interface Factor {
  id: string;
  headline: string;
  category: string;
  impact: Impact;
  magnitude: 1 | 2 | 3;
  horizon: string;
  summary: string;
  sources: Source[];
}

interface Research {
  asOf: string;
  region: string;
  netOutlook: Outlook;
  leansToward: Scenario;
  summary: string;
  factors: Factor[];
}

const IMPACT_META: Record<Impact | Outlook, { color: string; label: string; glyph: string }> = {
  tailwind: { color: "#4ade80", label: "Tailwind", glyph: "↑" },
  headwind: { color: "#f87171", label: "Headwind", glyph: "↓" },
  neutral: { color: "rgba(255,255,255,0.4)", label: "Neutral", glyph: "→" },
  mixed: { color: "#fbbf24", label: "Mixed", glyph: "↕" },
};

const SC_LABEL: Record<Scenario, string> = {
  conservative: "Conservative",
  base: "Base Case",
  accelerated: "Accelerated",
};

/* ─────────────────────────────────────────────
   COMPONENT
   ───────────────────────────────────────────── */

export default function EVResearch({ scenario }: { scenario: Scenario }) {
  const [data, setData] = useState<Research | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ev-research", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ scenario }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || `Request failed (${res.status})`);
      }
      setData(json as Research);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="etc-rs">
      {/* ── HEADER ── */}
      <div className="etc-rs-head">
        <div>
          <p className="etc-rs-eyebrow">Live News · Free Feed</p>
          <h3 className="etc-rs-title">News Factors &amp; Adoption Signals</h3>
        </div>
        <button
          type="button"
          className="etc-rs-run"
          onClick={run}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="etc-rs-spinner" />
              Analyzing…
            </>
          ) : data ? (
            "↻ Refresh"
          ) : (
            "Run live analysis"
          )}
        </button>
      </div>

      {/* ── EMPTY STATE ── */}
      {!data && !loading && !error && (
        <p className="etc-rs-empty">
          Pull recent geopolitical, trade, policy, and supply-chain headlines from a
          free live news feed, then score how each could nudge Ontario BEV adoption
          toward the conservative, base, or accelerated path.
        </p>
      )}

      {/* ── LOADING ── */}
      {loading && (
        <div className="etc-rs-loading">
          <div className="etc-rs-skel" />
          <div className="etc-rs-skel" />
          <div className="etc-rs-skel" />
          <p className="etc-rs-loading-txt">
            Fetching live headlines and scoring each signal…
          </p>
        </div>
      )}

      {/* ── ERROR ── */}
      {error && (
        <div className="etc-rs-error">
          <span className="etc-rs-error-tag">ERROR</span>
          {error}
        </div>
      )}

      {/* ── RESULTS ── */}
      {data && !loading && (
        <>
          {/* Outlook banner */}
          <div className="etc-rs-outlook">
            <div className="etc-rs-outlook-main">
              <span
                className="etc-rs-outlook-badge"
                style={{
                  color: IMPACT_META[data.netOutlook].color,
                  borderColor: IMPACT_META[data.netOutlook].color + "55",
                }}
              >
                {IMPACT_META[data.netOutlook].glyph} Net{" "}
                {IMPACT_META[data.netOutlook].label}
              </span>
              <span className="etc-rs-leans">
                Leans toward{" "}
                <strong>{SC_LABEL[data.leansToward] ?? data.leansToward}</strong>
              </span>
            </div>
            <p className="etc-rs-summary">{data.summary}</p>
            <p className="etc-rs-meta">
              {data.region} · as of {data.asOf}
            </p>
          </div>

          {/* Factor cards */}
          <div className="etc-rs-grid">
            {data.factors.map((f) => {
              const im = IMPACT_META[f.impact];
              return (
                <div
                  key={f.id}
                  className="etc-rs-card"
                  style={{ "--imp": im.color } as React.CSSProperties}
                >
                  <div className="etc-rs-card-top">
                    <span className="etc-rs-cat">{f.category}</span>
                    <span className="etc-rs-impact" style={{ color: im.color }}>
                      {im.glyph} {im.label}
                    </span>
                  </div>

                  <h4 className="etc-rs-card-title">{f.headline}</h4>
                  <p className="etc-rs-card-body">{f.summary}</p>

                  <div className="etc-rs-card-foot">
                    <span className="etc-rs-mag" title={`Magnitude ${f.magnitude}/3`}>
                      {[1, 2, 3].map((n) => (
                        <span
                          key={n}
                          className="etc-rs-dot"
                          style={{
                            background:
                              n <= f.magnitude ? im.color : "rgba(255,255,255,0.12)",
                          }}
                        />
                      ))}
                    </span>
                    <span className="etc-rs-horizon">{f.horizon}</span>
                  </div>

                  {f.sources?.length > 0 && (
                    <div className="etc-rs-sources">
                      {f.sources.map((s, i) => (
                        <a
                          key={i}
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="etc-rs-src"
                        >
                          ↗ {s.title}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <p className="etc-rs-disclaimer">
            Rule-based classification of live news headlines (Google News, free feed). A
            heuristic signal, not expert analysis — verify before use in planning.
          </p>
        </>
      )}
    </div>
  );
}
