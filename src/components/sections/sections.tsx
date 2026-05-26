import './sections.css'

/* ═══════════════════════════════════════════
   PROBLEM SECTION CHARTS  ·  real data viz
   ═══════════════════════════════════════════ */
function BevChart() {
  return (
    <svg viewBox="0 0 260 120" className="prob-chart-svg" aria-label="Ontario BEV Registrations 2022-2024">
      {[20,50,80].map(y => (
        <line key={y} x1="38" y1={y} x2="255" y2={y}
          stroke="rgba(255,255,255,.06)" strokeWidth="1" strokeDasharray="3 4"/>
      ))}
      <line x1="38" y1="100" x2="255" y2="100" stroke="rgba(255,255,255,.1)" strokeWidth="1"/>
      <line x1="38" y1="10"  x2="38"  y2="100" stroke="rgba(255,255,255,.1)" strokeWidth="1"/>
      {[['125K',20],['75K',50],['25K',80]].map(([l,y]) => (
        <text key={String(y)} x="34" y={Number(y)+3} fontSize="7.5"
          fill="rgba(255,255,255,.32)" textAnchor="end">{l}</text>
      ))}
      {[['Q2 22',38],['Q4 23',147],['Q4 24',255]].map(([l,x]) => (
        <text key={l} x={Number(x)} y="112" fontSize="7" fill="rgba(255,255,255,.3)" textAnchor="middle">{l}</text>
      ))}
      <defs>
        <linearGradient id="bevGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(212,160,23,.24)"/>
          <stop offset="100%" stopColor="rgba(212,160,23,0)"/>
        </linearGradient>
      </defs>
      <path d="M38,95 L60,91 L82,86 L104,82 L126,74 L148,65 L170,54 L192,42 L214,30 L236,20 L255,14"
        fill="none" stroke="rgba(212,160,23,.9)" strokeWidth="2.2" strokeLinecap="round"/>
      <path d="M38,95 L60,91 L82,86 L104,82 L126,74 L148,65 L170,54 L192,42 L214,30 L236,20 L255,14 L255,100 L38,100 Z"
        fill="url(#bevGrad)"/>
      <circle cx="255" cy="14" r="3.5" fill="rgba(212,160,23,.95)"/>
      <text x="245" y="10" fontSize="8" fill="rgba(212,160,23,.95)" textAnchor="middle" fontWeight="600">124K</text>
    </svg>
  )
}

function GasPriceChart() {
  return (
    <svg viewBox="0 0 260 120" className="prob-chart-svg" aria-label="Ontario Gas Price 2022-2026">
      {[25,55,85].map(y => (
        <line key={y} x1="38" y1={y} x2="255" y2={y}
          stroke="rgba(255,255,255,.06)" strokeWidth="1" strokeDasharray="3 4"/>
      ))}
      <line x1="38" y1="100" x2="255" y2="100" stroke="rgba(255,255,255,.1)" strokeWidth="1"/>
      <line x1="38" y1="10"  x2="38"  y2="100" stroke="rgba(255,255,255,.1)" strokeWidth="1"/>
      {[['$2.10',25],['$1.70',55],['$1.30',85]].map(([l,y]) => (
        <text key={String(y)} x="34" y={Number(y)+3} fontSize="7.5"
          fill="rgba(255,255,255,.32)" textAnchor="end">{l}</text>
      ))}
      {[['2022',38],['2024',147],['2026',255]].map(([l,x]) => (
        <text key={l} x={Number(x)} y="112" fontSize="7" fill="rgba(255,255,255,.3)" textAnchor="middle">{l}</text>
      ))}
      <defs>
        <linearGradient id="gasGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(239,68,68,.2)"/>
          <stop offset="100%" stopColor="rgba(239,68,68,0)"/>
        </linearGradient>
      </defs>
      <path d="M38,72 L65,60 L92,70 L119,55 L146,42 L173,50 L200,36 L227,25 L255,18"
        fill="none" stroke="rgba(239,68,68,.85)" strokeWidth="2.2" strokeLinecap="round"/>
      <path d="M38,72 L65,60 L92,70 L119,55 L146,42 L173,50 L200,36 L227,25 L255,18 L255,100 L38,100 Z"
        fill="url(#gasGrad)"/>
      <line x1="38" y1="42" x2="255" y2="42" stroke="rgba(255,255,255,.15)" strokeWidth="1" strokeDasharray="4 3"/>
      <text x="42" y="39" fontSize="7" fill="rgba(255,255,255,.34)">$1.80 threshold</text>
      <circle cx="255" cy="18" r="3.5" fill="rgba(239,68,68,.9)"/>
      <text x="246" y="14" fontSize="8" fill="rgba(239,68,68,.9)" textAnchor="middle" fontWeight="600">$2.01</text>
    </svg>
  )
}

function StressProjectionChart() {
  return (
    <svg viewBox="0 0 260 120" className="prob-chart-svg" aria-label="Feeder Stress Projection 2026-2031">
      {[20,46,72].map(y => (
        <line key={y} x1="38" y1={y} x2="255" y2={y}
          stroke="rgba(255,255,255,.06)" strokeWidth="1" strokeDasharray="3 4"/>
      ))}
      <line x1="38" y1="98" x2="255" y2="98" stroke="rgba(255,255,255,.1)" strokeWidth="1"/>
      <line x1="38" y1="10" x2="38" y2="98" stroke="rgba(255,255,255,.1)" strokeWidth="1"/>
      {[['100%',20],['80%',46],['60%',72]].map(([l,y]) => (
        <text key={String(y)} x="34" y={Number(y)+3} fontSize="7.5"
          fill="rgba(255,255,255,.32)" textAnchor="end">{l}</text>
      ))}
      {[['2026',38],['2028',147],['2031',255]].map(([l,x]) => (
        <text key={l} x={Number(x)} y="110" fontSize="7" fill="rgba(255,255,255,.3)" textAnchor="middle">{l}</text>
      ))}
      <line x1="38" y1="46" x2="255" y2="46"
        stroke="rgba(239,68,68,.4)" strokeWidth="1.2" strokeDasharray="4 3"/>
      <text x="42" y="43" fontSize="7" fill="rgba(239,68,68,.55)">80% critical threshold</text>
      <path d="M38,82 L93,72 L148,57 L203,38 L255,22"
        fill="none" stroke="rgba(239,68,68,.8)" strokeWidth="2" strokeLinecap="round"/>
      <path d="M38,85 L93,76 L148,63 L203,47 L255,33"
        fill="none" stroke="rgba(251,146,60,.7)" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M38,88 L93,81 L148,73 L203,64 L255,55"
        fill="none" stroke="rgba(234,179,8,.6)" strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M38,92 L93,87 L148,82 L203,77 L255,72"
        fill="none" stroke="rgba(52,211,153,.45)" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

/* ═══════════════════════════════════════════
   FEATURE FIGURES  ·  small iconographic tiles
   ═══════════════════════════════════════════ */

function ForecastFig() {
  return (
    <svg viewBox="0 0 100 60" className="feat-fig-svg" aria-hidden="true">
      <rect x="4"  y="38" width="11" height="18" rx="1.6" fill="rgba(10,10,10,.55)"/>
      <rect x="20" y="28" width="11" height="28" rx="1.6" fill="rgba(10,10,10,.65)"/>
      <rect x="36" y="20" width="11" height="36" rx="1.6" fill="rgba(10,10,10,.75)"/>
      <rect x="52" y="12" width="11" height="44" rx="1.6" fill="rgba(10,10,10,.85)"/>
      <rect x="68" y="4"  width="11" height="52" rx="1.6" fill="rgba(10,10,10,.95)"/>
      <rect x="84" y="22" width="11" height="34" rx="1.6" fill="rgba(10,10,10,.6)"/>
    </svg>
  )
}

function RiskFig() {
  return (
    <div className="feat-fig-pct" aria-hidden="true">
      <span className="feat-fig-pct-n">94</span>
      <span className="feat-fig-pct-s">%</span>
    </div>
  )
}

function MapFig() {
  return (
    <svg viewBox="0 0 120 70" className="feat-fig-svg" aria-hidden="true">
      <path d="M10 38 L22 16 L46 10 L74 12 L98 6 L112 30 L108 56 L78 64 L48 60 L22 60 Z"
        fill="rgba(10,10,10,.08)" stroke="rgba(10,10,10,.62)" strokeWidth="1.4" strokeLinejoin="round"/>
      <circle cx="44" cy="32" r="4"   fill="rgba(10,10,10,.95)"/>
      <circle cx="72" cy="40" r="5.5" fill="rgba(10,10,10,.95)"/>
      <circle cx="95" cy="44" r="3"   fill="rgba(10,10,10,.65)"/>
    </svg>
  )
}

function SliderFig() {
  return (
    <svg viewBox="0 0 120 32" className="feat-fig-svg" aria-hidden="true">
      <rect x="4"  y="14" width="112" height="4" rx="2" fill="rgba(10,10,10,.18)"/>
      <rect x="4"  y="14" width="78"  height="4" rx="2" fill="rgba(10,10,10,.85)"/>
      <circle cx="82" cy="16" r="8" fill="rgba(10,10,10,.95)"/>
      <circle cx="82" cy="16" r="3" fill="white"/>
    </svg>
  )
}

function SitingFig() {
  return (
    <div className="feat-fig-rank" aria-hidden="true">
      <span className="feat-fig-rank-n">01</span>
      <svg viewBox="0 0 24 24" className="feat-fig-pin">
        <path d="M12 2 C7.5 2 4 5.5 4 10 C4 16 12 22 12 22 C12 22 20 16 20 10 C20 5.5 16.5 2 12 2 Z"
          fill="rgba(10,10,10,.95)"/>
        <circle cx="12" cy="10" r="3.2" fill="white"/>
      </svg>
    </div>
  )
}

function DocFig() {
  return (
    <svg viewBox="0 0 76 88" className="feat-fig-svg" aria-hidden="true">
      <rect x="4" y="4" width="68" height="80" rx="4"
        fill="white" stroke="rgba(10,10,10,.18)" strokeWidth="1"/>
      <rect x="12" y="14" width="44" height="3" rx="1" fill="rgba(10,10,10,.78)"/>
      <rect x="12" y="22" width="36" height="2" rx="1" fill="rgba(10,10,10,.32)"/>
      <rect x="12" y="28" width="46" height="2" rx="1" fill="rgba(10,10,10,.32)"/>
      <rect x="12" y="38" width="52" height="14" rx="2" fill="rgba(186,117,23,.2)"
        stroke="rgba(186,117,23,.42)" strokeWidth=".6"/>
      <rect x="12" y="58" width="40" height="2" rx="1" fill="rgba(10,10,10,.32)"/>
      <rect x="12" y="64" width="48" height="2" rx="1" fill="rgba(10,10,10,.32)"/>
      <rect x="12" y="70" width="32" height="2" rx="1" fill="rgba(10,10,10,.32)"/>
    </svg>
  )
}

/* ═══════════════════════════════════════════
   PROBLEM
   ═══════════════════════════════════════════ */
function ProblemSection() {
  return (
    <section id="problem" className="sec problem-sec">
      <div className="sec-inner">
        <div className="prob-head">
          <div className="prob-head-left">
            <p className="sec-label prob-lbl">The Problem</p>
            <h2 className="prob-h2">
              Ontario&apos;s grid wasn&apos;t built<br/>
              for what&apos;s <span className="serif-i prob-serif-i">coming</span>.
            </h2>
          </div>
          <div className="prob-head-right">
            <p className="prob-intro">
              EV adoption is outpacing every utility model — and the macro tailwinds
              keep compounding. Iran-region tensions have pushed Ontario gas past
              $2/L, while any softening of Canada&apos;s 100% tariff on Chinese-built EVs
              would release a wave of sub-$25K models into the market. Without
              proactive forecasting, distribution networks face feeder overloads,
              reactive capital spending, and systematically inequitable infrastructure.
            </p>
            <div className="prob-kpis">
              <div className="prob-kpi">
                <span className="pkn">49%</span>
                <span className="pkl">YoY BEV growth · Ontario 2024</span>
              </div>
              <div className="prob-kpi">
                <span className="pkn">$2.01/L</span>
                <span className="pkl">Ontario gas peak · geopolitical shock</span>
              </div>
              <div className="prob-kpi">
                <span className="pkn">18 mo.</span>
                <span className="pkl">Typical utility upgrade backlog</span>
              </div>
              <div className="prob-kpi">
                <span className="pkn">$300M/yr</span>
                <span className="pkl">Alectra annual capital programme</span>
              </div>
            </div>
          </div>
        </div>

        <div className="prob-charts">
          <div className="prob-chart-card">
            <span className="pcc-title">Ontario BEV Registrations</span>
            <BevChart/>
            <p className="pcc-caption">Quarterly BEV registrations · Ontario MTO · Q2 2022–Q4 2024</p>
          </div>
          <div className="prob-chart-card">
            <span className="pcc-title">Gas Price · Ontario Weekly</span>
            <GasPriceChart/>
            <p className="pcc-caption">$/L weekly avg with EV adoption threshold marker · 2022–2026</p>
          </div>
          <div className="prob-chart-card">
            <span className="pcc-title">Feeder Stress Projection</span>
            <StressProjectionChart/>
            <p className="pcc-caption">Capacity utilisation per feeder · ZEUS base scenario · 2026–2031</p>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════
   FEATURE CARD  ·  OpenAI-style square w/ gradient
   ═══════════════════════════════════════════ */
type FeatureCardProps = {
  tone: 'v1' | 'v2' | 'v3' | 'v4' | 'v5' | 'v6'
  tile: string
  caption: string
  metaCat: string
  metaVal: string
  figure: React.ReactNode
}

function FeatureCard({ tone, tile, caption, metaCat, metaVal, figure }: FeatureCardProps) {
  return (
    <article className="feat-card">
      <div className={`feat-card-img feat-${tone}`}>
        <div className="feat-tile">
          <span className="feat-tile-name">{tile}</span>
        </div>
        <div className="feat-figure">{figure}</div>
      </div>
      <p className="feat-caption">{caption}</p>
      <p className="feat-meta">
        <span className="feat-meta-cat">{metaCat}</span>
        <span className="feat-meta-sep">·</span>
        <span className="feat-meta-val">{metaVal}</span>
      </p>
    </article>
  )
}

/* ═══════════════════════════════════════════
   SOLUTION  ·  Six tools, one platform
   ═══════════════════════════════════════════ */
function SolutionSection() {
  return (
    <section id="platform" className="sec sol-sec">
      <span id="how-it-works" className="anchor-offset" aria-hidden="true"/>

      <div className="sec-inner">
        <div className="sol-head">
          <p className="sec-label sol-lbl">The Platform</p>
          <h2 className="sec-h2 sol-h2">
            Six tools.<br/>
            One <span className="serif-i sol-serif-i">intelligence</span> layer.
          </h2>
          <p className="sol-intro">
            ZEUS operates as a cohesive pipeline — automated data ingestion, machine
            learning, spatial analysis, and dashboard visualisation — delivering six
            capabilities that distribution planners act on directly.
          </p>
        </div>

        <div className="sol-grid">
          <FeatureCard
            tone="v1"
            tile="Forecasting"
            caption="EV adoption forecasts per FSA, validated by ARIMA in three confidence scenarios."
            metaCat="EV Intelligence"
            metaVal="XGBoost"
            figure={<ForecastFig/>}
          />
          <FeatureCard
            tone="v2"
            tile="Risk Register"
            caption="Every feeder projected to cross 80% capacity within five years, with the date it happens."
            metaCat="Grid Risk"
            metaVal="11 flagged"
            figure={<RiskFig/>}
          />
          <FeatureCard
            tone="v3"
            tile="Stress Map"
            caption="Census demand spatially joined to OEB feeder zones as an interactive choropleth."
            metaCat="Spatial"
            metaVal="247 feeders"
            figure={<MapFig/>}
          />
          <FeatureCard
            tone="v4"
            tile="Simulator"
            caption="Sliders for gas price and affordable-EV recalculate purchase thresholds in real time."
            metaCat="Macro Shock"
            metaVal="Live"
            figure={<SliderFig/>}
          />
          <FeatureCard
            tone="v5"
            tile="Siting"
            caption="Linear programming ranks 20 optimal charger sites, balancing load relief with equity."
            metaCat="Planning"
            metaVal="LP optimised"
            figure={<SitingFig/>}
          />
          <FeatureCard
            tone="v6"
            tile="OEB Brief"
            caption="DSP filings auto-generated from forecast data, with every assumption logged for audit."
            metaCat="Regulatory"
            metaVal="PDF · DOCX"
            figure={<DocFig/>}
          />
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════
   CTA  ·  Glasswing cream
   ═══════════════════════════════════════════ */
function CTASection() {
  return (
    <section id="contact" className="sec cta-sec">
      <div className="cta-glow" aria-hidden="true"/>

      <div className="sec-inner cta-inner">
        <p className="sec-label cta-lbl">For Enterprise</p>
        <h2 className="cta-h2">
          Built to forecast the surge<br/>
          <span className="serif-i">before</span> it arrives.
        </h2>
        <p className="cta-sub">
          ZEUS gives utility planners a neighbourhood-level, 5-year forecast of where
          demand will spike — built on every macro signal conventional models miss.
          Move your capital programme from reactive to proactive.
        </p>

        <div className="cta-actions">
          <a href="#platform" className="cta-btn-p">
            Explore Platform
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
          <a href="mailto:hello@zeusplatform.ca" className="cta-btn-g">Get in Touch</a>
        </div>

        <div className="cta-dividers">
          <div className="cta-stat"><span className="cs-n">11</span><span className="cs-l">Feeders at Risk</span></div>
          <div className="cta-sep"/>
          <div className="cta-stat"><span className="cs-n">$180M+</span><span className="cs-l">Deferral Potential</span></div>
          <div className="cta-sep"/>
          <div className="cta-stat"><span className="cs-n">5yr</span><span className="cs-l">Planning Horizon</span></div>
          <div className="cta-sep"/>
          <div className="cta-stat"><span className="cs-n">100%</span><span className="cs-l">Open Data</span></div>
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════
   FOOTER  ·  cream minimal
   ═══════════════════════════════════════════ */
function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="sec-inner footer-inner">
        <div className="footer-left">
          <span className="footer-tag">Grid Demand Intelligence Platform</span>
        </div>
        <div className="footer-mid">
          <span className="footer-brand">ZEUS</span>
        </div>
        <span className="footer-copy">© 2026 ZEUS</span>
      </div>
    </footer>
  )
}

/* ═══════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════ */
export default function Sections() {
  return (
    <>
      <ProblemSection/>
      <SolutionSection/>
      <CTASection/>
      <SiteFooter/>
    </>
  )
}
