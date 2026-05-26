import Image from "next/image";
import "./hero.css";

/* ─────────────────────────────────────────────
   IMAGE PLACEHOLDER  ·  drop in real screenshots later
   ───────────────────────────────────────────── */
function ImgPlaceholder({
  label,
  hint,
  className = "",
}: {
  label: string;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={`img-ph ${className}`}>
      <svg
        viewBox="0 0 24 24"
        className="img-ph-icon"
        fill="none"
        aria-hidden="true"
      >
        <rect
          x="3"
          y="3"
          width="18"
          height="18"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.2"
        />
        <circle
          cx="8.5"
          cy="9"
          r="1.5"
          stroke="currentColor"
          strokeWidth="1.2"
        />
        <path
          d="M21 15l-5-5L5 21"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="img-ph-label">{label}</span>
      {hint && <span className="img-ph-hint">{hint}</span>}
    </div>
  );
}

/* ─────────────────────────────────────────────
   HERO
   ───────────────────────────────────────────── */
export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-text">
        <div className="hero-badge">Predictive Grid Intelligence</div>

        <h1 className="hero-h1">
          Forecasting the <span className="hero-h1-accent">grid</span>
          <br />
          before the surge arrives.
        </h1>

        <p className="hero-sub">
          ZEUS models EV adoption, infrastructure strain, and regional energy
          demand across Ontario five years ahead of the crisis.
        </p>

        <div className="hero-actions">
          <a href="platform" className="btn-primary">
            Explore Platform
          </a>
          <a href="#problem" className="btn-secondary">
            See the Problem
          </a>
        </div>
      </div>

      <div className="window-wrap">
        <div className="window">
          {/* ─── Window chrome: traffic-lights left, logo centered, empty right ─── */}
          <div className="window-top">
            <div className="window-controls" aria-hidden="true">
              <span className="wc red" />
              <span className="wc yellow" />
              <span className="wc green" />
            </div>

            <div className="window-logo">
              <Image
                src="/logo_zeus.png"
                alt="ZEUS"
                width={72}
                height={22}
                className="window-logo-img"
                priority
              />
            </div>

            {/* spacer to keep logo perfectly centered */}
            <div className="window-spacer" aria-hidden="true" />
          </div>

          {/* ─── Window body: all panels are image placeholders ─── */}
          <div className="window-body">
            {/* MAP */}
            <div className="panel panel-map">
              <div className="panel-head">
                <div>
                  <span className="panel-label">Regional Demand</span>
                  <h3>Ontario stress index</h3>
                </div>
                <span className="panel-pill">2026 — 2031</span>
              </div>
              <Image
                src="/stress.jpeg"
                alt="Ontario stress map"
                width={1600}
                height={100}
                className="ph-map"
              />
            </div>

            {/* PIE */}
            <div className="panel panel-pie">
              <div className="panel-head">
                <div>
                  <span className="panel-label">Consumption Mix</span>
                  <h3>Electricity by sector</h3>
                </div>
              </div>
              <Image
                src="/pie2.jpeg"
                alt="Ontario stress map"
                width={700}
                height={200}
                className="ph-map"
              />
            </div>

            {/* BAR */}
            <div className="panel panel-bar">
              <div className="panel-head">
                <div>
                  <span className="panel-label">FSA Growth</span>
                  <h3>BEV adoption forecast</h3>
                </div>
                <span className="panel-pill">+214% avg</span>
              </div>
              <Image
                src="/growth.jpeg"
                alt="Ontario stress map"
                width={500}
                height={200}
                className="ph-map"
              />
            </div>

            {/* LINE */}
            <div className="panel panel-line">
              <div className="panel-head">
                <div>
                  <span className="panel-label">Provincial Demand</span>
                  <h3>Energy consumption curve</h3>
                </div>
                <span className="panel-pill">live</span>
              </div>
              <Image
                src="/residential.jpeg"
                alt="Ontario stress map"
                width={900}
                height={300}
                className="ph-map"
              />
            </div>

            {/* TABLE */}
            <div className="panel panel-table">
              <div className="panel-head">
                <div>
                  <span className="panel-label">Feeder Risk Register</span>
                  <h3>Capacity overload schedule</h3>
                </div>
                <span className="panel-pill">11 flagged</span>
              </div>
              <Image
                src="/chart.jpeg"
                alt="Ontario stress map"
                width={1260}
                height={500}
                className="ph-map"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
