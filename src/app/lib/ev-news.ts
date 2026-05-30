/**
 * ────────────────────────────────────────────────────────────
 *  ZEUS · EV NEWS ENGINE  (free, no API key, no per-call fees)
 *
 *  Pulls recent headlines from Google News RSS (a free, keyless
 *  feed) and classifies each story with a transparent rule-based
 *  scorer to estimate whether it is a tailwind / headwind /
 *  neutral for Ontario BEV adoption.
 *
 *  This is NOT an LLM. It trades nuance for $0 cost and zero
 *  setup. The functions here are pure/deterministic and unit-
 *  testable; route.ts just calls buildResearch().
 * ────────────────────────────────────────────────────────────
 */

export type Scenario = "conservative" | "base" | "accelerated";
export type Impact = "tailwind" | "headwind" | "neutral";
export type Outlook = "tailwind" | "headwind" | "mixed";

export interface Source {
  title: string;
  url: string;
}
export interface Factor {
  id: string;
  headline: string;
  category: string;
  impact: Impact;
  magnitude: 1 | 2 | 3;
  horizon: string;
  summary: string;
  sources: Source[];
}
export interface Research {
  asOf: string;
  region: string;
  netOutlook: Outlook;
  leansToward: Scenario;
  summary: string;
  factors: Factor[];
}

interface RawItem {
  title: string;
  url: string;
  source: string;
  date: number; // epoch ms, 0 if unknown
}

/* ── FREE NEWS QUERIES (Google News RSS, no key required) ── */
const QUERIES = [
  "Ontario electric vehicle adoption",
  "Canada EV tariff",
  "Canada EV rebate incentive",
  "EV battery plant Ontario",
  "Canada ZEV mandate",
  "electric vehicle sales Canada",
];

/* ── LEXICONS ── */
const POS: Record<string, number> = {
  rebate: 2, incentive: 2, subsid: 2, "tax credit": 2, mandate: 2,
  invest: 2, expansion: 1, expand: 1, gigafactory: 2, "new plant": 2,
  factory: 1, record: 2, surge: 2, soar: 2, boost: 1, growth: 1,
  charging: 1, charger: 1, cheaper: 2, "price cut": 2, "lower price": 2,
  jump: 1, "ramp up": 1, launch: 1, milestone: 1, accelerate: 1,
};
const NEG: Record<string, number> = {
  tariff: 2, duty: 2, duties: 2, "trade war": 2, scrap: 2, repeal: 2,
  rollback: 2, delay: 2, delayed: 2, slump: 2, slowdown: 1, decline: 1,
  drop: 1, plunge: 2, layoff: 2, "job cut": 2, closure: 2, "shut down": 2,
  recession: 2, "weak demand": 2, weak: 1, expensive: 1, pause: 2,
  halt: 2, uncertainty: 1, headwind: 1, cancel: 2, cut: 1,
};
const CATS: Record<string, string[]> = {
  "Trade & Tariffs": ["tariff", "duty", "duties", "trade", "import", "export", "levy", "surtax"],
  Policy: ["rebate", "incentive", "subsid", "mandate", "zev", "regulation", "credit", "ban", "policy", "government"],
  "Supply Chain": ["battery", "lithium", "cobalt", "nickel", "mineral", "gigafactory", "plant", "factory", "graphite", "supply"],
  Geopolitics: ["china", "russia", "war", "conflict", "sanction", "election", "geopolit", "trade war"],
  Economy: ["rate", "inflation", "recession", "gas price", "fuel", "demand", "economy", "consumer"],
  Technology: ["charging", "charger", "range", "solid-state", "fast charge", "infrastructure", "software"],
};

/* ── HTML ENTITY DECODE ── */
export function decodeEntities(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
    .replace(/&nbsp;/g, " ")
    .trim();
}

/* ── RSS PARSER (Google News flavour) ── */
export function parseRss(xml: string): RawItem[] {
  const items: RawItem[] = [];
  const blocks = xml.match(/<item>([\s\S]*?)<\/item>/g) ?? [];
  for (const block of blocks) {
    const rawTitle = (block.match(/<title>([\s\S]*?)<\/title>/) ?? [])[1] ?? "";
    const link = (block.match(/<link>([\s\S]*?)<\/link>/) ?? [])[1] ?? "";
    const pub = (block.match(/<pubDate>([\s\S]*?)<\/pubDate>/) ?? [])[1] ?? "";
    const srcTag = block.match(/<source[^>]*>([\s\S]*?)<\/source>/);
    let title = decodeEntities(rawTitle);
    let source = srcTag ? decodeEntities(srcTag[1]) : "";

    // Google News titles are "Headline - Source"; split off the source.
    if (!source && / - [^-]+$/.test(title)) {
      const idx = title.lastIndexOf(" - ");
      source = title.slice(idx + 3).trim();
      title = title.slice(0, idx).trim();
    } else if (source && title.endsWith(` - ${source}`)) {
      title = title.slice(0, title.length - source.length - 3).trim();
    }

    const date = pub ? Date.parse(pub) || 0 : 0;
    if (title && link) items.push({ title, url: decodeEntities(link), source, date });
  }
  return items;
}

/* ── SCORE A SINGLE HEADLINE ── */
function tally(text: string, lex: Record<string, number>): number {
  let score = 0;
  for (const k in lex) if (text.includes(k)) score += lex[k];
  return score;
}

export function classify(item: RawItem): Factor {
  const t = item.title.toLowerCase();
  const pos = tally(t, POS);
  const neg = tally(t, NEG);

  // Policy-reversal override: "scrap/repeal/cut/end ... mandate/rebate/incentive"
  // is unambiguously a headwind even though "mandate"/"rebate" score positive.
  const reversal =
    /(scrap|repeal|end|ends|ended|cut|cuts|cancel|cancels|kill|axe|weaken|roll ?back|delay|delays|phase out|pause)\s+\w*\s*(mandate|rebate|incentive|subsid|zev|credit|target|program)/.test(
      t,
    );

  let impact: Impact = "neutral";
  let magnitude: 1 | 2 | 3;
  if (reversal) {
    impact = "headwind";
    magnitude = Math.max(2, neg >= 4 ? 3 : 2) as 2 | 3;
  } else {
    if (pos - neg >= 1) impact = "tailwind";
    else if (neg - pos >= 1) impact = "headwind";
    const dominant = Math.max(pos, neg);
    magnitude = dominant >= 4 ? 3 : dominant >= 2 ? 2 : 1;
  }

  // Category: highest-scoring lexicon, default Policy.
  let category = "Policy";
  let best = 0;
  for (const c in CATS) {
    const hits = CATS[c].reduce((n, w) => (t.includes(w) ? n + 1 : n), 0);
    if (hits > best) { best = hits; category = c; }
  }

  // Horizon: crude inference.
  let horizon = "near-term";
  if (/20(3[0-9])|by 20|long[- ]term|decade/.test(t)) horizon = "long-term";
  else if (/plan|propose|target|will |future|upcoming/.test(t)) horizon = "mid-term";

  const lean =
    impact === "tailwind"
      ? "pull demand toward the accelerated path"
      : impact === "headwind"
      ? "drag demand toward the conservative path"
      : "leave the base-case trajectory roughly intact";
  const summary = `${item.source ? item.source + " reports a" : "A"} ${category.toLowerCase()} development. Stories like this tend to ${lean} for Ontario BEV uptake.`;

  return {
    id: item.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48),
    headline: item.title,
    category,
    impact,
    magnitude,
    horizon,
    summary,
    sources: [{ title: item.source || "Google News", url: item.url }],
  };
}

/* ── BUILD THE FULL RESEARCH OBJECT FROM RAW XML FEEDS ── */
export function synthesize(
  rawItems: RawItem[],
  scenario: Scenario,
  today: string,
  limit = 6,
): Research {
  // Dedupe by normalized title.
  const seen = new Set<string>();
  const unique = rawItems.filter((i) => {
    const key = i.title.toLowerCase().replace(/\s+/g, " ").trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const scored = unique.map(classify);

  // Prefer signal-bearing, recent stories.
  scored.sort((a, b) => {
    const w = (f: Factor) => (f.impact === "neutral" ? 0 : f.magnitude);
    return w(b) - w(a);
  });
  const factors = scored.slice(0, limit);

  const tail = factors.filter((f) => f.impact === "tailwind");
  const head = factors.filter((f) => f.impact === "headwind");
  const neu = factors.filter((f) => f.impact === "neutral");

  const net =
    tail.reduce((s, f) => s + f.magnitude, 0) -
    head.reduce((s, f) => s + f.magnitude, 0);

  let netOutlook: Outlook = "mixed";
  let leansToward: Scenario = "base";
  if (net >= 2) { netOutlook = "tailwind"; leansToward = "accelerated"; }
  else if (net <= -2) { netOutlook = "headwind"; leansToward = "conservative"; }

  const summary = `Scanned ${factors.length} live headlines: ${tail.length} tailwind, ${head.length} headwind, ${neu.length} neutral. The current news flow looks ${netOutlook} for Ontario BEV adoption (you have "${scenario}" selected).`;

  return {
    asOf: today,
    region: "Ontario, Canada",
    netOutlook,
    leansToward,
    summary,
    factors,
  };
}

/* ── FETCH FREE FEEDS ── */
async function fetchOne(query: string, signal: AbortSignal): Promise<RawItem[]> {
  const url =
    "https://news.google.com/rss/search?q=" +
    encodeURIComponent(query + " when:90d") +
    "&hl=en-CA&gl=CA&ceid=CA:en";
  const res = await fetch(url, {
    signal,
    headers: { "user-agent": "Mozilla/5.0 (compatible; ZEUS-EVResearch/1.0)" },
  });
  if (!res.ok) return [];
  const xml = await res.text();
  return parseRss(xml);
}

export async function buildResearch(scenario: Scenario): Promise<Research> {
  const today = new Date().toISOString().slice(0, 10);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 9000);
  try {
    const batches = await Promise.allSettled(
      QUERIES.map((q) => fetchOne(q, controller.signal)),
    );
    const all: RawItem[] = [];
    for (const b of batches) if (b.status === "fulfilled") all.push(...b.value);
    if (all.length === 0) {
      throw new Error("No headlines returned from the news feed.");
    }
    return synthesize(all, scenario, today);
  } finally {
    clearTimeout(timer);
  }
}
