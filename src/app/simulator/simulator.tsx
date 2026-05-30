"use client";

import {
  useState,
  useCallback,
  useRef,
  useEffect,
  type ReactNode,
  type CSSProperties,
} from "react";
import Link from "next/link";
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
  critical: "#ff5c5c",
  high: "#f5b13d",
  moderate: "#5b9bd5",
  low: "#46c18c",
};
const LEVEL_GLOW: Record<Level, string> = {
  critical: "rgba(255,92,92,0.55)",
  high: "rgba(245,177,61,0.5)",
  moderate: "rgba(91,155,213,0.45)",
  low: "rgba(70,193,140,0.45)",
};
const LEVEL_SOFT: Record<Level, string> = {
  critical: "rgba(255,92,92,0.12)",
  high: "rgba(245,177,61,0.12)",
  moderate: "rgba(91,155,213,0.12)",
  low: "rgba(70,193,140,0.12)",
};
const LEVEL_LABEL: Record<Level, string> = {
  critical: "Critical",
  high: "High",
  moderate: "Moderate",
  low: "Low",
};
const LEVELS: Level[] = ["critical", "high", "moderate", "low"];

// Baseline metrics (PARAMS never change) — used for KPI deltas vs. baseline.
const BASELINE = (() => {
  const caps = FEEDERS.map((f) => simulate(f, PARAMS));
  return {
    critical: caps.filter((c) => getLevel(c) === "critical").length,
    high: caps.filter((c) => getLevel(c) === "high").length,
    avg: Math.round(caps.reduce((s, c) => s + c, 0) / caps.length),
  };
})();

/* ─────────────────────────────────────────────
   AI ASSISTANT
   ───────────────────────────────────────────── */

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "Summarize this scenario",
  "Which feeders are most at risk?",
  "What should the utility prioritize?",
];

const QUICK_ACTIONS: { label: string; prompt: string }[] = [
  { label: "↻ Summary", prompt: "Summarize this scenario" },
  { label: "⚠ Risks", prompt: "Which feeders are most at risk, and why?" },
  { label: "◎ Priorities", prompt: "What should the utility prioritize?" },
];

function scenarioSignature(params: Param[]): string {
  return params.map((p) => p.value).join("|");
}

const WARMUP = [
  "Reading your scenario…",
  "Crunching feeder projections…",
  "Weighing the risk thresholds…",
  "Composing the analysis…",
];

function parseThinking(text: string): { thinking: string; answer: string } {
  const open = text.indexOf("<think>");
  if (open === -1) return { thinking: "", answer: text };

  let answer = text.slice(0, open);
  const after = text.slice(open + "<think>".length);
  const close = after.indexOf("</think>");
  if (close === -1) {
    return { thinking: after, answer };
  }
  return {
    thinking: after.slice(0, close),
    answer: answer + after.slice(close + "</think>".length),
  };
}

/* ── Minimal markdown renderer (no dependency) ── */
function renderInline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\*\*(.+?)\*\*|\*(.+?)\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1] !== undefined) out.push(<strong key={k}>{m[1]}</strong>);
    else if (m[2] !== undefined) out.push(<em key={k}>{m[2]}</em>);
    else if (m[3] !== undefined) out.push(<code key={k}>{m[3]}</code>);
    else if (m[4] !== undefined)
      out.push(
        <a key={k} href={m[5]} target="_blank" rel="noreferrer">
          {m[4]}
        </a>,
      );
    last = re.lastIndex;
    k++;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function Markdown({ text }: { text: string }) {
  const lines = text.split("\n");
  const blocks: ReactNode[] = [];
  let para: string[] = [];
  let key = 0;

  const flush = () => {
    if (para.length) {
      blocks.push(<p key={key++}>{renderInline(para.join(" "))}</p>);
      para = [];
    }
  };

  for (let i = 0; i < lines.length; ) {
    const t = lines[i].trim();
    if (!t) {
      flush();
      i++;
      continue;
    }

    const h = /^(#{1,3})\s+(.*)$/.exec(t);
    if (h) {
      flush();
      blocks.push(
        <p key={key++} className={`md-h md-h${h[1].length}`}>
          {renderInline(h[2])}
        </p>,
      );
      i++;
      continue;
    }

    if (/^[-*]\s+/.test(t)) {
      flush();
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*]\s+/, ""));
        i++;
      }
      blocks.push(
        <ul key={key++} className="md-list">
          {items.map((it, j) => (
            <li key={j}>{renderInline(it)}</li>
          ))}
        </ul>,
      );
      continue;
    }

    if (/^\d+\.\s+/.test(t)) {
      flush();
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ""));
        i++;
      }
      blocks.push(
        <ol key={key++} className="md-list">
          {items.map((it, j) => (
            <li key={j}>{renderInline(it)}</li>
          ))}
        </ol>,
      );
      continue;
    }

    if (/^>\s?/.test(t)) {
      flush();
      const quote: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i].trim())) {
        quote.push(lines[i].trim().replace(/^>\s?/, ""));
        i++;
      }
      blocks.push(
        <blockquote key={key++} className="md-quote">
          {renderInline(quote.join(" "))}
        </blockquote>,
      );
      continue;
    }

    para.push(t);
    i++;
  }
  flush();

  return <>{blocks}</>;
}

/* ── Renders one assistant turn: status → thinking → answer ── */
function AssistantMessage({
  raw,
  streaming,
}: {
  raw: string;
  streaming: boolean;
}) {
  const { thinking, answer } = parseThinking(raw);
  const hasThinking = thinking.trim().length > 0;
  const answerStarted = answer.trim().length > 0;

  const [open, setOpen] = useState(true);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (answerStarted) setOpen(false);
  }, [answerStarted]);

  const waiting = streaming && !raw;
  useEffect(() => {
    if (!waiting) return;
    const id = setInterval(() => setTick((t) => t + 1), 1800);
    return () => clearInterval(id);
  }, [waiting]);

  if (waiting) {
    return (
      <div className="ai-status">
        <span className="ai-spinner" />
        <span className="ai-status-text">{WARMUP[tick % WARMUP.length]}</span>
      </div>
    );
  }

  return (
    <div className="ai-assistant-wrap">
      {hasThinking && (
        <details
          className="ai-think"
          open={open}
          onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}
        >
          <summary className="ai-think-summary">
            <span
              className={`ai-think-dot ${!answerStarted ? "ai-think-live" : ""}`}
            />
            {answerStarted ? "Thought process" : "Thinking…"}
          </summary>
          <div className="ai-think-body">{thinking}</div>
        </details>
      )}
      {answerStarted ? (
        <div className="ai-answer">
          <Markdown text={answer} />
        </div>
      ) : !hasThinking && streaming ? (
        <span className="ai-typing">
          <span />
          <span />
          <span />
        </span>
      ) : null}
    </div>
  );
}

/* ── KPI card ── */
function KpiCard({
  label,
  value,
  unit,
  sub,
  accent,
  valueColor,
  delta,
  invert,
}: {
  label: string;
  value: number | string;
  unit?: string;
  sub: string;
  accent: string;
  valueColor?: string;
  delta?: number;
  invert?: boolean;
}) {
  const showDelta = typeof delta === "number" && delta !== 0;
  const bad = invert ? (delta ?? 0) > 0 : (delta ?? 0) < 0;
  return (
    <div
      className="kpi-card"
      style={{ "--kpi-accent": accent } as CSSProperties}
    >
      <div className="kpi-top">
        <span className="kpi-label">{label}</span>
        {showDelta && (
          <span
            className="kpi-delta"
            style={{
              color: bad ? "var(--high)" : "var(--low)",
              background: bad
                ? "rgba(245,177,61,0.12)"
                : "rgba(70,193,140,0.12)",
            }}
          >
            {(delta ?? 0) > 0 ? "+" : "−"}
            {Math.abs(delta ?? 0)}
          </span>
        )}
      </div>
      <div className="kpi-figure">
        <span
          className="kpi-val"
          style={{ color: valueColor ?? "var(--ink-1)" }}
        >
          {value}
        </span>
        {unit && <span className="kpi-unit">{unit}</span>}
      </div>
      <p className="kpi-sub">{sub}</p>
    </div>
  );
}

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

  /* ── AI state ── */
  const [aiOpen, setAiOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSentSig, setLastSentSig] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentSig = scenarioSignature(params);
  const staleContext =
    messages.length > 0 && !loading && lastSentSig !== currentSig;

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  function buildContext(): string {
    const inputs = params
      .map((p) => {
        const d = p.value - p.baseline;
        const tag =
          d === 0
            ? "(at baseline)"
            : `(${d > 0 ? "up" : "down"} from baseline ${fmt(p.baseline, p)})`;
        return `- ${p.label}: ${fmt(p.value, p)} ${tag}`;
      })
      .join("\n");

    const feeders = results
      .map(
        (r) =>
          `- ${r.feeder.name} (${r.feeder.region}): ${r.cap}% — ${getLevel(
            r.cap,
          )}`,
      )
      .join("\n");

    return `SCENARIO INPUTS:
${inputs}

HEADLINE METRICS:
- Critical feeders (>=85%): ${critical}
- High-load feeders (75-84%): ${high}
- Projected EV load: ${totalLoad} GW
- Average capacity utilisation: ${avgCap}%

FEEDER PROJECTIONS (5-year, sorted high → low):
${feeders}`;
  }

  async function send(text: string) {
    const q = text.trim();
    if (!q || loading) return;

    setError(null);
    setInput("");
    setLastSentSig(currentSig);
    const history: ChatMessage[] = [...messages, { role: "user", content: q }];
    setMessages([...history, { role: "assistant", content: "" }]);
    setLoading(true);

    try {
      const res = await fetch("/api/zeus-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, context: buildContext() }),
      });

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Request failed (${res.status}).`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: "assistant", content: acc };
          return copy;
        });
      }

      if (!acc.trim()) {
        throw new Error("Empty response from the model. Try again.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setMessages((m) => {
        const copy = [...m];
        const last = copy[copy.length - 1];
        if (last?.role === "assistant" && !last.content.trim()) copy.pop();
        return copy;
      });
    } finally {
      setLoading(false);
    }
  }

  function rerun() {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    send(lastUser?.content ?? "Summarize this scenario");
  }

  function clearChat() {
    setMessages([]);
    setError(null);
    setLastSentSig(null);
  }

  return (
    <div className="sim">
      <div className="sim-bg" aria-hidden="true" />

      {/* ════ TOP BAR ════ */}
      <header className="topbar">
        <div className="topbar-left">
          <Link href="/" className="brand">
            <span className="brand-mark">⚡</span>
            <span className="brand-name">ZEUS</span>
            <span className="brand-tag">Grid Intelligence</span>
          </Link>
          <span className="topbar-divider" />
          <nav className="crumb">
            <span className="crumb-muted">Simulators</span>
            <span className="crumb-sep">/</span>
            <span>Macro Shock</span>
          </nav>
        </div>
        <div className="topbar-right">
          <div className={`scenario-pill ${dirty ? "pill-modified" : ""}`}>
            <span className="pill-dot" />
            {dirty ? "Modified scenario" : "Baseline scenario"}
          </div>
          {dirty && (
            <button className="btn-ghost" onClick={reset} type="button">
              ↺ Reset
            </button>
          )}
        </div>
      </header>

      {/* ════ WORKSPACE ════ */}
      <div className="workspace">
        {/* LEFT · CONFIG */}
        <aside className="config">
          <div className="panel">
            <div className="panel-head">
              <div>
                <p className="panel-eyebrow">Inputs</p>
                <h2 className="panel-title">Scenario Variables</h2>
              </div>
            </div>
            <div className="panel-body sliders">
              {params.map((p) => {
                const pct = ((p.value - p.min) / (p.max - p.min)) * 100;
                const basePct = ((p.baseline - p.min) / (p.max - p.min)) * 100;
                const delta = p.value - p.baseline;
                return (
                  <div key={p.id} className="field">
                    <div className="field-top">
                      <span className="field-label">{p.label}</span>
                      <div className="field-val">
                        <span className="field-num">{fmt(p.value, p)}</span>
                        {delta !== 0 && (
                          <span
                            className={`field-chip ${delta > 0 ? "chip-up" : "chip-dn"}`}
                          >
                            {delta > 0 ? "▲" : "▼"}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="track">
                      <div
                        className="track-fill"
                        style={{ width: `${pct}%` }}
                      />
                      <div
                        className="track-base"
                        style={{ left: `${basePct}%` }}
                      />
                      <input
                        type="range"
                        min={p.min}
                        max={p.max}
                        step={p.step}
                        value={p.value}
                        onChange={(e) =>
                          onChange(p.id, parseFloat(e.target.value))
                        }
                        aria-label={p.label}
                      />
                    </div>
                    <div className="bounds">
                      <span>{fmt(p.min, p)}</span>
                      <span className="bounds-base">
                        base {fmt(p.baseline, p)}
                      </span>
                      <span>{fmt(p.max, p)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="provenance">
            <span className="prov-label">Methodology</span>
            <p>
              XGBoost demand model · ARIMA adoption curve · OEB feeder data ·
              5-year horizon
            </p>
          </div>
        </aside>

        {/* RIGHT · RESULTS */}
        <main className="results">
          {/* KPI cards */}
          <section className="kpi-grid">
            <KpiCard
              label="Critical Feeders"
              value={critical}
              sub="≥ 85% utilisation"
              accent={critical > 0 ? "var(--crit)" : "var(--low)"}
              valueColor={critical > 0 ? "var(--crit)" : "var(--low)"}
              delta={critical - BASELINE.critical}
              invert
            />
            <KpiCard
              label="High Load"
              value={high}
              sub="75–84% utilisation"
              accent="var(--high)"
              valueColor={high > 2 ? "var(--high)" : "var(--ink-1)"}
              delta={high - BASELINE.high}
              invert
            />
            <KpiCard
              label="Projected EV Load"
              value={totalLoad}
              unit="GW"
              sub="5-year network peak"
              accent="var(--accent)"
            />
            <KpiCard
              label="Avg Capacity"
              value={avgCap}
              unit="%"
              sub="network mean utilisation"
              accent="var(--mod)"
              delta={avgCap - BASELINE.avg}
              invert
            />
          </section>

          {/* Feeder table */}
          <section className="panel feeder-panel">
            <div className="panel-head">
              <div>
                <p className="panel-eyebrow">Distribution Network</p>
                <h2 className="panel-title">Feeder Capacity Outlook</h2>
              </div>
              <div className="legend">
                {LEVELS.map((lv) => (
                  <span key={lv} className="legend-item">
                    <span
                      className="legend-dot"
                      style={{ background: LEVEL_COLOR[lv] }}
                    />
                    {LEVEL_LABEL[lv]}
                  </span>
                ))}
              </div>
            </div>

            <div className="table">
              <div className="thead">
                <span>#</span>
                <span>Feeder</span>
                <span>Capacity utilisation · 80% limit</span>
                <span>Status</span>
                <span className="t-right">5-yr</span>
              </div>
              {results.map(({ feeder, cap }, i) => {
                const lv = getLevel(cap);
                const color = LEVEL_COLOR[lv];
                return (
                  <div key={feeder.id} className="trow">
                    <span className="t-rank">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="t-feeder">
                      <span
                        className="t-dot"
                        style={
                          {
                            background: color,
                            "--dot-glow": LEVEL_GLOW[lv],
                          } as CSSProperties
                        }
                      />
                      <div className="t-text">
                        <span className="t-name">{feeder.name}</span>
                        <span className="t-region">{feeder.region}</span>
                      </div>
                    </div>
                    <div className="t-bar">
                      <div
                        className="t-bar-fill"
                        style={{ width: `${cap}%`, background: color }}
                      />
                      <div className="t-threshold" />
                    </div>
                    <span
                      className="t-badge"
                      style={{ color, background: LEVEL_SOFT[lv] }}
                    >
                      {LEVEL_LABEL[lv]}
                    </span>
                    <span className="t-cap" style={{ color }}>
                      {cap}%
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        </main>
      </div>

      {/* ════ AI: LAUNCH BUTTON ════ */}
      {!aiOpen && (
        <button
          className="ai-fab"
          onClick={() => setAiOpen(true)}
          type="button"
          aria-label="Open ZEUS Analyst"
        >
          <span className="ai-fab-dot" />
          Ask ZEUS
        </button>
      )}

      {/* ════ AI: PANEL ════ */}
      <div
        className={`ai-panel ${aiOpen ? "ai-open" : ""}`}
        role="dialog"
        aria-label="ZEUS Analyst"
      >
        <div className="ai-head">
          <div>
            <p className="ai-eyebrow">ZEUS Analyst</p>
            <p className="ai-sub">Grounded in your live scenario</p>
          </div>
          <div className="ai-head-actions">
            {messages.length > 0 && (
              <button
                className="ai-clear"
                onClick={clearChat}
                type="button"
                disabled={loading}
              >
                ↺ New
              </button>
            )}
            <button
              className="ai-close"
              onClick={() => setAiOpen(false)}
              type="button"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="ai-body" ref={scrollRef}>
          {messages.length === 0 && (
            <div className="ai-empty">
              <p className="ai-empty-title">
                Ask about the current projection.
              </p>
              <p className="ai-empty-text">
                I can read every slider and feeder result. Try one of these:
              </p>
              <div className="ai-chips">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    className="ai-chip"
                    type="button"
                    onClick={() => send(s)}
                    disabled={loading}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) =>
            m.role === "assistant" ? (
              <div key={i} className="ai-msg ai-assistant">
                <AssistantMessage
                  raw={m.content}
                  streaming={loading && i === messages.length - 1}
                />
              </div>
            ) : (
              <div key={i} className="ai-msg ai-user">
                {m.content}
              </div>
            ),
          )}

          {staleContext && (
            <div className="ai-stale">
              <span>Sliders changed since the last answer.</span>
              <button type="button" onClick={rerun} disabled={loading}>
                ↻ Re-analyze on latest
              </button>
            </div>
          )}

          {error && <div className="ai-error">{error}</div>}
        </div>

        <div className="ai-actions">
          {QUICK_ACTIONS.map((a) => (
            <button
              key={a.label}
              type="button"
              className={`ai-action ${staleContext ? "ai-action-hot" : ""}`}
              onClick={() => send(a.prompt)}
              disabled={loading}
              title={a.prompt}
            >
              {a.label}
            </button>
          ))}
        </div>

        <form
          className="ai-input-bar"
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
        >
          <input
            className="ai-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about this scenario…"
            disabled={loading}
            aria-label="Message ZEUS Analyst"
          />
          <button
            className="ai-send"
            type="submit"
            disabled={loading || !input.trim()}
            aria-label="Send"
          >
            {loading ? "…" : "↑"}
          </button>
        </form>
      </div>
    </div>
  );
}
