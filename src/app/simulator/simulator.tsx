"use client";

import { useState, useCallback, useRef, useEffect, type ReactNode } from "react";
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
  critical: "#FF4D4D",
  high: "#F4C040",
  moderate: "#BA7517",
  low: "#4ADE80",
};

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

// Always-available actions (persistent toolbar). `label` is the short button
// text; `prompt` is what actually gets sent to the model.
const QUICK_ACTIONS: { label: string; prompt: string }[] = [
  { label: "↻ Summary", prompt: "Summarize this scenario" },
  { label: "⚠ Risks", prompt: "Which feeders are most at risk, and why?" },
  { label: "◎ Priorities", prompt: "What should the utility prioritize?" },
];

// Signature of the current scenario — changes whenever any slider moves.
function scenarioSignature(params: Param[]): string {
  return params.map((p) => p.value).join("|");
}

// Rotating messages shown before the first token arrives.
const WARMUP = [
  "Reading your scenario…",
  "Crunching feeder projections…",
  "Weighing the risk thresholds…",
  "Composing the analysis…",
];

// Split a streamed assistant string into reasoning (<think>…</think>) and answer.
// Handles the in-progress case where </think> hasn't arrived yet.
function parseThinking(text: string): { thinking: string; answer: string } {
  const open = text.indexOf("<think>");
  if (open === -1) return { thinking: "", answer: text };

  let answer = text.slice(0, open);
  const after = text.slice(open + "<think>".length);
  const close = after.indexOf("</think>");
  if (close === -1) {
    return { thinking: after, answer }; // still thinking
  }
  return { thinking: after.slice(0, close), answer: answer + after.slice(close + "</think>".length) };
}

/* ── Minimal markdown renderer (no dependency) ──
   Handles: **bold**, *italic*, `code`, [links](url), #/##/### headings,
   - / * bullet lists, 1. numbered lists, > quotes. Underscore-emphasis is
   intentionally ignored so identifiers like gas_price don't turn italic. */

function renderInline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re =
    /\*\*(.+?)\*\*|\*(.+?)\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\)/g;
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

  // Collapse the thought process once the real answer starts.
  useEffect(() => {
    if (answerStarted) setOpen(false);
  }, [answerStarted]);

  // Cycle warmup copy while we wait for the very first token.
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
            <span className={`ai-think-dot ${!answerStarted ? "ai-think-live" : ""}`} />
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
  // Scenario signature captured the last time we sent a request to the model.
  const [lastSentSig, setLastSentSig] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentSig = scenarioSignature(params);
  // True when sliders have moved since the model last saw the data.
  const staleContext =
    messages.length > 0 && !loading && lastSentSig !== currentSig;

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  // Compact, model-friendly snapshot of the live scenario.
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
    setLastSentSig(currentSig); // remember the data the model is seeing
    const history: ChatMessage[] = [...messages, { role: "user", content: q }];
    // Render user msg + an empty assistant bubble to stream into.
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
      // Drop the empty/partial assistant bubble.
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

  // Re-run the most recent question (or a summary) against the latest data.
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
    <>
      <Link href="/" className="sim-home-link">
        ← Home
      </Link>
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
                      onChange={(e) =>
                        onChange(p.id, parseFloat(e.target.value))
                      }
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
            XGBoost demand model · ARIMA adoption curve · OEB feeder data ·
            5-year horizon
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
                    <span
                      className="feeder-dot"
                      style={{ background: color }}
                    />
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

      {/* ── AI: LAUNCH BUTTON ── */}
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

      {/* ── AI: PANEL ── */}
      <div className={`ai-panel ${aiOpen ? "ai-open" : ""}`} role="dialog" aria-label="ZEUS Analyst">
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
    </>
  );
}
