import './sections.css'

/* ─── 6 core features from the Feature_detail doc ─── */
const SERVICES = [
  {
    num: '01',
    title: 'EV Adoption Forecasting Engine',
    body: 'An XGBoost cross-sectional model processes median income, housing type, and renter ratios per FSA to predict quarterly BEV counts through Q4 2031 — validated by ARIMA time-series and output in three confidence-interval scenarios.',
    /*
      IMAGE PLACEHOLDER 01
      Replace with: Close-up of a data scientist's screen showing forecast
      curves, or abstract data visualization photography.
      Unsplash: "data visualization screen" / "machine learning dashboard"
    */
    img: 'forecast.jpg',
    imgAlt: 'Data forecast visualization',
  },
  {
    num: '02',
    title: 'Feeder Capacity Risk Register',
    body: 'A Python physics model converts EV counts into peak kW demand using charging behaviour parameters — percentage of vehicles charging simultaneously 6–9 PM at 7.2 kW Level 2 load — then flags every feeder projected to cross 80% capacity within five years.',
    /*
      IMAGE PLACEHOLDER 02
      Replace with: High-voltage transmission line or transformer station.
      Unsplash: "power lines" / "electrical transformer" / "high voltage"
    */
    img: '/logo_zeus.png',
    imgAlt: 'Power transmission infrastructure',
  },
  {
    num: '03',
    title: 'Geospatial Feeder Stress Map',
    body: 'GeoPandas and Shapely execute spatial joins between census tracts, FSA boundaries, and OEB feeder GIS zones. The Next.js frontend renders the result as an interactive Leaflet choropleth map — demand overlaid on physical utility infrastructure.',
    /*
      IMAGE PLACEHOLDER 03
      Replace with: Satellite or aerial view of Ontario suburbs showing
      the density of communities the platform serves.
      Unsplash: "aerial Ontario suburbs" / "city grid aerial"
    */
    img: null,
    imgAlt: 'Aerial view of Ontario suburbs',
  },
  {
    num: '04',
    title: 'Interactive Scenario Simulator',
    body: 'Two algorithmic multipliers overlay the base forecast. Adjusting the gas price slider (e.g., sustained above $1.80/L) or the EV affordability toggle triggers a backend recalculation of household purchase thresholds — the spatial map and risk register update in real time.',
    /*
      IMAGE PLACEHOLDER 04
      Replace with: Engineer or planner at a control interface, or
      a close-up of dashboard sliders/controls.
      Unsplash: "control room engineer" / "utility planner dashboard"
    */
    img: null,
    imgAlt: 'Engineer at planning interface',
  },
  {
    num: '05',
    title: 'Public Charger Siting Optimizer',
    body: 'PuLP linear programming evaluates potential sites to minimise peak load on stressed feeders while applying equity constraints — ensuring underserved high-density communities are not left as charging deserts. Outputs a ranked list of 20 optimal locations.',
    /*
      IMAGE PLACEHOLDER 05
      Replace with: EV charging station in an urban/suburban setting,
      ideally showing multiple vehicles and the surrounding community.
      Unsplash: "EV charging station" / "electric vehicle charger urban"
    */
    img: null,
    imgAlt: 'EV charging station',
  },
  {
    num: '06',
    title: 'Automated OEB Brief Generator',
    body: 'python-docx and WeasyPrint auto-generate formatted planning briefs in Word and PDF directly from forecast data and risk maps. Every assumption and parameter is logged — producing audit-ready documentation for Ontario Energy Board DSP filings.',
    /*
      IMAGE PLACEHOLDER 06
      Replace with: Planning documents on a table, a regulatory filing
      context, or an office scene with utility planners.
      Unsplash: "planning documents" / "utility engineers meeting" / "regulatory filing"
    */
    img: null,
    imgAlt: 'Regulatory planning documents',
  },
]

const SOURCES = [
  'Ontario MTO · Quarterly EV Registrations',
  'OEB · Feeder GIS & Reliability Data',
  'IESO · Hourly Ontario Grid Demand',
  'Statistics Canada Census 2021',
  'Ontario Gas Prices · Weekly Series',
  'Transport Canada EVAP Model List',
  'NRCan · EV Charger Locations',
  'City Building Permit Pipelines',
  'Environment Canada Weather API',
  'IEA Middle East Energy Tracker',
]

/* ─── Problem section charts ─── */
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
          fill="rgba(255,255,255,.28)" textAnchor="end">{l}</text>
      ))}
      {[['Q2 22',38],['Q4 23',147],['Q4 24',255]].map(([l,x]) => (
        <text key={l} x={Number(x)} y="112" fontSize="7" fill="rgba(255,255,255,.28)" textAnchor="middle">{l}</text>
      ))}
      <defs>
        <linearGradient id="bevGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(212,160,23,.22)"/>
          <stop offset="100%" stopColor="rgba(212,160,23,0)"/>
        </linearGradient>
      </defs>
      <path d="M38,95 L60,91 L82,86 L104,82 L126,74 L148,65 L170,54 L192,42 L214,30 L236,20 L255,14"
        fill="none" stroke="rgba(212,160,23,.85)" strokeWidth="2.2" strokeLinecap="round"/>
      <path d="M38,95 L60,91 L82,86 L104,82 L126,74 L148,65 L170,54 L192,42 L214,30 L236,20 L255,14 L255,100 L38,100 Z"
        fill="url(#bevGrad)"/>
      <circle cx="255" cy="14" r="3.5" fill="rgba(212,160,23,.9)"/>
      <text x="245" y="10" fontSize="8" fill="rgba(212,160,23,.9)" textAnchor="middle" fontWeight="600">124K</text>
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
          fill="rgba(255,255,255,.28)" textAnchor="end">{l}</text>
      ))}
      {[['2022',38],['2024',147],['2026',255]].map(([l,x]) => (
        <text key={l} x={Number(x)} y="112" fontSize="7" fill="rgba(255,255,255,.28)" textAnchor="middle">{l}</text>
      ))}
      <defs>
        <linearGradient id="gasGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(239,68,68,.18)"/>
          <stop offset="100%" stopColor="rgba(239,68,68,0)"/>
        </linearGradient>
      </defs>
      <path d="M38,72 L65,60 L92,70 L119,55 L146,42 L173,50 L200,36 L227,25 L255,18"
        fill="none" stroke="rgba(239,68,68,.8)" strokeWidth="2.2" strokeLinecap="round"/>
      <path d="M38,72 L65,60 L92,70 L119,55 L146,42 L173,50 L200,36 L227,25 L255,18 L255,100 L38,100 Z"
        fill="url(#gasGrad)"/>
      <line x1="38" y1="42" x2="255" y2="42" stroke="rgba(255,255,255,.15)" strokeWidth="1" strokeDasharray="4 3"/>
      <text x="42" y="39" fontSize="7" fill="rgba(255,255,255,.3)">$1.80 threshold</text>
      <circle cx="255" cy="18" r="3.5" fill="rgba(239,68,68,.85)"/>
      <text x="246" y="14" fontSize="8" fill="rgba(239,68,68,.85)" textAnchor="middle" fontWeight="600">$2.01</text>
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
          fill="rgba(255,255,255,.28)" textAnchor="end">{l}</text>
      ))}
      {[['2026',38],['2028',147],['2031',255]].map(([l,x]) => (
        <text key={l} x={Number(x)} y="110" fontSize="7" fill="rgba(255,255,255,.28)" textAnchor="middle">{l}</text>
      ))}
      <line x1="38" y1="46" x2="255" y2="46"
        stroke="rgba(239,68,68,.35)" strokeWidth="1.2" strokeDasharray="4 3"/>
      <text x="42" y="43" fontSize="7" fill="rgba(239,68,68,.5)">80% critical threshold</text>
      <path d="M38,82 L93,72 L148,57 L203,38 L255,22"
        fill="none" stroke="rgba(239,68,68,.75)" strokeWidth="2" strokeLinecap="round"/>
      <path d="M38,85 L93,76 L148,63 L203,47 L255,33"
        fill="none" stroke="rgba(251,146,60,.65)" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M38,88 L93,81 L148,73 L203,64 L255,55"
        fill="none" stroke="rgba(234,179,8,.55)" strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M38,92 L93,87 L148,82 L203,77 L255,72"
        fill="none" stroke="rgba(52,211,153,.4)" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

/* ─── Three-tool visuals (keep from before) ─── */
function ForecastVisual() {
  const bars = [
    {fsa:'L6T',h:88,hot:true},{fsa:'L4K',h:62,hot:false},
    {fsa:'L3R',h:94,hot:true},{fsa:'L5N',h:51,hot:false},
    {fsa:'L6A',h:79,hot:true},{fsa:'L4Z',h:44,hot:false},
    {fsa:'L7A',h:71,hot:true},{fsa:'L5V',h:58,hot:false},
  ]
  return (
    <div className="vis vis-forecast">
      <div className="vis-header">
        <span className="vis-label">FSA Adoption Forecast · Q4 2031</span>
        <span className="vis-chip">XGBoost</span>
      </div>
      <div className="forecast-bars">
        {bars.map(b => (
          <div key={b.fsa} className="bar-col">
            <div className="bar-track">
              <div className={`bar-fill ${b.hot?'bar-hot':'bar-dim'}`} style={{height:`${b.h}%`}}/>
            </div>
            <span className="bar-lbl">{b.fsa}</span>
          </div>
        ))}
      </div>
      <div className="forecast-lines">
        <span className="fline fline-c"/><span className="fline fline-b"/><span className="fline fline-a"/>
      </div>
      <div className="forecast-leg">
        <span className="fleg fleg-dim">Conservative</span>
        <span className="fleg fleg-mid">Base</span>
        <span className="fleg fleg-hot">Accelerated</span>
      </div>
    </div>
  )
}

function FeederVisual() {
  const rows = [
    {name:'Brampton North',code:'F-204',pct:94,date:'Q2 2028',r:'critical'},
    {name:'Vaughan Central',code:'F-118',pct:87,date:'Q3 2028',r:'critical'},
    {name:'Mississauga East',code:'F-307',pct:82,date:'Q1 2029',r:'high'},
    {name:'Markham West',code:'F-092',pct:79,date:'Q4 2029',r:'high'},
  ]
  return (
    <div className="vis vis-feeder">
      <div className="vis-header">
        <span className="vis-label">Feeder Risk Register · 2031 Horizon</span>
        <span className="vis-chip vis-chip-red">11 flagged</span>
      </div>
      <div className="feeder-vis-list">
        {rows.map(r => (
          <div key={r.code} className="fv-row">
            <div className="fv-meta">
              <span className="fv-name">{r.name}</span>
              <span className="fv-code">{r.code}</span>
            </div>
            <div className="fv-bar-wrap">
              <div className="fv-track"><div className={`fv-fill fv-${r.r}`} style={{width:`${r.pct}%`}}/></div>
              <span className={`fv-pct fv-${r.r}`}>{r.pct}%</span>
            </div>
            <span className={`fv-date fv-${r.r}`}>{r.date}</span>
          </div>
        ))}
      </div>
      <div className="feeder-vis-stats">
        <div className="fvs"><span className="fvs-n">$180M+</span><span className="fvs-l">Deferral potential</span></div>
        <div className="fvs"><span className="fvs-n">2028</span><span className="fvs-l">First critical year</span></div>
        <div className="fvs"><span className="fvs-n">80%</span><span className="fvs-l">Capacity threshold</span></div>
      </div>
    </div>
  )
}

function ScenarioVisual() {
  return (
    <div className="vis vis-scenario">
      <div className="vis-header">
        <span className="vis-label">Scenario Simulation · Live Model</span>
        <span className="vis-chip">Real-time</span>
      </div>
      <div className="sc-sliders">
        <div className="sc-slider-row">
          <div className="sc-slider-top">
            <span className="sc-slider-label">Gas Price Threshold</span>
            <span className="sc-slider-val">$1.90/L</span>
          </div>
          <div className="sc-track">
            <div className="sc-fill" style={{width:'72%'}}/>
            <div className="sc-thumb" style={{left:'72%'}}/>
          </div>
          <div className="sc-ticks"><span>$1.60</span><span>$1.80</span><span>$2.00</span></div>
        </div>
        <div className="sc-slider-row">
          <div className="sc-slider-top">
            <span className="sc-slider-label">Affordable EV Entry</span>
            <span className="sc-slider-val sc-active-val">sub-$35K active</span>
          </div>
          <div className="sc-toggle-row">
            <span className="sc-tog">None</span>
            <span className="sc-tog sc-tog-active">sub-$35K</span>
            <span className="sc-tog">sub-$25K</span>
          </div>
        </div>
      </div>
      <div className="sc-output">
        <span className="sc-out-n">+8</span>
        <div className="sc-out-text">
          <span className="sc-out-main">additional feeders critical by 2029</span>
          <span className="sc-out-sub">vs. 3 in the base case — 11 total</span>
        </div>
      </div>
    </div>
  )
}

/* ─── Page ─────────────────────────────── */
export default function Sections() {
  return (
    <>
      <ProblemSection />
      <ServicesSection />
      <UseCasesSection />
      <CTASection />
      <SiteFooter />
    </>
  )
}

function ProblemSection() {
  return (
    <section id="problem" className="sec problem-sec">
      <div className="sec-inner">
        <div className="prob-head">
          <div className="prob-head-left">
            <p className="sec-label prob-lbl">The Problem</p>
            <h2 className="prob-h2">
              Ontario&apos;s grid wasn&apos;t built
              <br/>for what&apos;s coming.
            </h2>
          </div>
          <div className="prob-head-right">
            <p className="prob-intro">
              EV adoption is accelerating faster than any utility anticipated. Without proactive
              forecasting, distribution networks face feeder overloads, reactive capital spending,
              and systematically inequitable infrastructure. Distribution upgrades already account
              for 30–60% of total EV charging project costs in constrained areas.
            </p>
            <div className="prob-kpis">
              <div className="prob-kpi">
                <span className="pkn">49%</span>
                <span className="pkl">YoY BEV growth, Ontario 2024</span>
              </div>
              <div className="prob-kpi">
                <span className="pkn">18 mo.</span>
                <span className="pkl">Typical connection backlog after constraint discovered</span>
              </div>
              <div className="prob-kpi">
                <span className="pkn">$3.1B</span>
                <span className="pkl">Alectra&apos;s infrastructure renewal program at stake</span>
              </div>
            </div>
          </div>
        </div>
        <div className="prob-charts">
          <div className="prob-chart-card">
            <h4 className="pcc-title">Ontario BEV Registrations</h4>
            <BevChart/>
            <p className="pcc-caption">Quarterly BEV registrations · Ontario MTO · Q2 2022–Q4 2024</p>
          </div>
          <div className="prob-chart-card">
            <h4 className="pcc-title">Gas Price · Ontario Weekly</h4>
            <GasPriceChart/>
            <p className="pcc-caption">$/L weekly avg with EV adoption threshold marker · 2022–2026</p>
          </div>
          <div className="prob-chart-card">
            <h4 className="pcc-title">Feeder Stress Projection</h4>
            <StressProjectionChart/>
            <p className="pcc-caption">Capacity utilisation per feeder · ZEUS base scenario · 2026–2031</p>
          </div>
        </div>
      </div>
    </section>
  )
}

function ServicesSection() {
  return (
    <section id="platform" className="sec services-sec">
      <div className="sec-inner">
        <div className="svc-head">
          <p className="sec-label">The Solution</p>
          <h2 className="sec-h2 svc-h2">Six capabilities.<br />One intelligence platform.</h2>
          <p className="svc-intro">
            ZEUS operates as a cohesive pipeline — automated data ingestion, machine learning,
            spatial analysis, and frontend visualisation — delivering six distinct functionalities
            that planners act on directly.
          </p>
        </div>

        <div className="svc-grid">
          {SERVICES.map(s => (
            <div key={s.num} className="svc-card">
              {/*
                IMAGE AREA — see comment above each SERVICES entry for specific image suggestions.
                Replace the .svc-img-placeholder div with a Next.js <Image> component:
                  <Image src="/images/service-{n}.jpg" alt={s.imgAlt}
                    fill style={{ objectFit:'cover' }} />
                Wrap in a relative-positioned div with overflow:hidden.
              */}
              <div className="svc-img-area" role="img" aria-label={s.imgAlt}>
                <div className="svc-img-placeholder">
                  <span className="svc-img-label">Photo · {s.imgAlt}</span>
                </div>
              </div>
              <div className="svc-card-body">
                <span className="svc-num">{s.num}</span>
                <h3 className="svc-title">{s.title}</h3>
                <p className="svc-body">{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function UseCasesSection() {
  return (
    <section id="how-it-works" className="sec uc-sec">
      <div className="sec-inner">
        <p className="sec-label uc-lbl">Key Workflows</p>
        <h2 className="sec-h2 uc-h2">Three tools.<br />One intelligence platform.</h2>
      </div>
      <div className="sec-inner">
        <div className="uc3-grid">
          <div className="uc3-card">
            <div className="uc3-visual uc3-v1">
              <div className="uc3-ui-float"><ForecastVisual/></div>
            </div>
            <div className="uc3-text">
              <span className="uc3-cat">EV Demand Intelligence</span>
              <h3 className="uc3-title">EV Adoption Forecast by Zone</h3>
              <p className="uc3-body">XGBoost model trained on MTO registration data + StatCan income profiles per FSA predicts neighbourhood-level BEV count through 2031 — three scenarios, confidence intervals, live macro shock multipliers.</p>
            </div>
          </div>
          <div className="uc3-card">
            <div className="uc3-visual uc3-v2">
              <div className="uc3-ui-float"><FeederVisual/></div>
            </div>
            <div className="uc3-text">
              <span className="uc3-cat">Grid Risk Intelligence</span>
              <h3 className="uc3-title">Feeder Capacity Risk Register</h3>
              <p className="uc3-body">A physics model converts EV counts into peak kW demand and flags every feeder projected to cross 80% capacity — the ranked, date-specific action list a distribution planner acts on directly.</p>
            </div>
          </div>
          <div className="uc3-card">
            <div className="uc3-visual uc3-v3">
              <div className="uc3-ui-float"><ScenarioVisual/></div>
            </div>
            <div className="uc3-text">
              <span className="uc3-cat">Macro Shock Simulation</span>
              <h3 className="uc3-title">Interactive Scenario Simulator</h3>
              <p className="uc3-body">Gas price threshold and affordable EV entry sliders trigger a backend recalculation of household purchase thresholds — updating the spatial map and risk register in real time.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function CTASection() {
  return (
    <section id="contact" className="sec cta-sec">
      {/*
        CTA SECTION BACKGROUND IMAGE
        Replace .cta-img-bg with a full-bleed photo overlay:
        Recommended: utility planning meeting room, Ontario city skyline at night,
        or a wide-angle substation/infrastructure shot.
        Add:  background-image: url('/images/cta-bg.jpg');
              background-size: cover; background-position: center;
        And adjust .cta-overlay opacity to maintain text readability.
      */}
      <div className="cta-img-bg" aria-hidden="true">
        <div className="cta-overlay"/>
      </div>
      <div className="sec-inner cta-inner">
        <p className="sec-label cta-lbl">For Enterprise</p>
        <h2 className="cta-h2">
          Grid demand intelligence
          <br />built for utilities at scale.
        </h2>
        <p className="cta-sub">
          ZEUS gives distribution utilities a neighbourhood-level, 5-year forecast of
          where electricity demand will spike — incorporating every signal that conventional
          models miss. Move your capital programme from reactive to proactive.
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

function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="sec-inner footer-inner">
        <div className="footer-left">
          <span className="footer-brand">ZEUS</span>
          <span className="footer-tag">Grid Demand Intelligence Platform</span>
        </div>
        <div className="footer-mid">
          <span>Built for Ontario utilities</span><span className="fdot">·</span>
          <span>Hackathon 2025</span><span className="fdot">·</span>
          <span>Challenge 2 · Problem Statement 03</span>
        </div>
        <span className="footer-copy">© 2026 ZEUS</span>
      </div>
    </footer>
  )
}