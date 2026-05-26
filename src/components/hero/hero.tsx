import './hero.css'

function DemandChart() {
  return (
    <svg viewBox="0 0 320 160" className="chart-svg" aria-label="Grid demand forecast">
      <defs>
        <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,.18)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>

      {[20, 50, 80, 110, 140].map((y) => (
        <line
          key={y}
          x1="0"
          y1={y}
          x2="320"
          y2={y}
          stroke="rgba(255,255,255,.06)"
          strokeWidth="1"
        />
      ))}

      <path
        d="M0 126 C40 118 78 110 120 92 C160 75 205 52 248 34 C275 23 298 18 320 14"
        fill="none"
        stroke="rgba(255,255,255,.92)"
        strokeWidth="2.2"
        strokeLinecap="round"
      />

      <path
        d="M0 126 C40 118 78 110 120 92 C160 75 205 52 248 34 C275 23 298 18 320 14 L320 160 L0 160 Z"
        fill="url(#forecastGradient)"
      />

      <circle cx="320" cy="14" r="4" fill="white" />
    </svg>
  )
}

function PieChart() {
  return (
    <svg viewBox="0 0 120 120" className="pie-svg" aria-label="Infrastructure allocation">
      <circle
        cx="60"
        cy="60"
        r="42"
        fill="none"
        stroke="rgba(255,255,255,.08)"
        strokeWidth="16"
      />

      <circle
        cx="60"
        cy="60"
        r="42"
        fill="none"
        stroke="rgba(255,255,255,.92)"
        strokeWidth="16"
        strokeDasharray="158 264"
        strokeLinecap="round"
        transform="rotate(-90 60 60)"
      />

      <circle
        cx="60"
        cy="60"
        r="42"
        fill="none"
        stroke="rgba(255,255,255,.42)"
        strokeWidth="16"
        strokeDasharray="62 264"
        strokeLinecap="round"
        transform="rotate(125 60 60)"
      />
    </svg>
  )
}

function OntarioMap() {
  return (
    <svg viewBox="0 0 400 260" className="map-svg" aria-label="Ontario energy demand map">
      <path
        d="M56 132L96 72L148 54L208 66L250 46L314 88L350 148L316 194L252 216L188 202L138 224L88 194Z"
        fill="rgba(255,255,255,.04)"
        stroke="rgba(255,255,255,.12)"
        strokeWidth="1.2"
      />

      <circle cx="142" cy="120" r="10" className="map-dot high" />
      <circle cx="210" cy="92" r="8" className="map-dot med" />
      <circle cx="262" cy="146" r="12" className="map-dot critical" />
      <circle cx="188" cy="174" r="7" className="map-dot low" />

      <path
        d="M142 120 C180 108 228 110 262 146"
        stroke="rgba(255,255,255,.22)"
        strokeWidth="1"
        strokeDasharray="4 5"
        fill="none"
      />

      <path
        d="M188 174 C198 150 206 120 210 92"
        stroke="rgba(255,255,255,.14)"
        strokeWidth="1"
        strokeDasharray="4 5"
        fill="none"
      />
    </svg>
  )
}

export default function Hero() {
  return (
    <section className="hero">

      <div className="hero-text">
        <div className="hero-badge">
          Predictive Grid Intelligence
        </div>

        <h1 className="hero-h1">
          Forecasting energy demand before the surge arrives.
        </h1>

        <p className="hero-sub">
          ZEUS models EV adoption, infrastructure strain, and regional energy demand
          across Ontario in real time.
        </p>

        <div className="hero-actions">
          <a href="#platform" className="btn-primary">
            Explore Platform
          </a>
        </div>
      </div>

      <div className="window-wrap">
        <div className="window">

          <div className="window-top">
            <div className="window-controls">
              <span className="wc red" />
              <span className="wc yellow" />
              <span className="wc green" />
            </div>

            <div className="window-nav">
              <span className="window-tab active">Overview</span>
              <span className="window-tab">Forecasting</span>
              <span className="window-tab">Infrastructure</span>
            </div>

            <div className="window-status">
              Live · Ontario
            </div>
          </div>

          <div className="window-body">

            <div className="window-left">
              <div className="panel large">
                <div className="panel-head">
                  <div>
                    <span className="panel-label">Regional Demand Map</span>
                    <h3>Ontario grid stress index</h3>
                  </div>

                  <span className="panel-pill">
                    2026–2031
                  </span>
                </div>

                <OntarioMap />
              </div>

              <div className="stats-row">
                <div className="stat-card">
                  <span className="stat-label">Projected EV Growth</span>
                  <strong>+214%</strong>
                </div>

                <div className="stat-card">
                  <span className="stat-label">Critical Feeders</span>
                  <strong>18</strong>
                </div>

                <div className="stat-card">
                  <span className="stat-label">Load Increase</span>
                  <strong>31%</strong>
                </div>
              </div>
            </div>

            <div className="window-right">

              <div className="panel">
                <div className="panel-head">
                  <div>
                    <span className="panel-label">Demand Forecast</span>
                    <h3>Provincial energy consumption</h3>
                  </div>
                </div>

                <DemandChart />
              </div>

              <div className="panel split">
                <div className="panel-copy">
                  <span className="panel-label">
                    Infrastructure Allocation
                  </span>

                  <h3>
                    Deployment readiness across high-growth regions.
                  </h3>

                  <p>
                    Forecasting transformer saturation and charging expansion
                    requirements before peak demand.
                  </p>
                </div>

                <PieChart />
              </div>

            </div>

          </div>
        </div>
      </div>

    </section>
  )
}