import Link from "next/link";
import "@/components/sections/sections.css";
import "./data-sources.css";

/* ═══════════════════════════════════════════
   MINI FIGURES  ·  inline SVG stats per source
   ═══════════════════════════════════════════ */

function ZonesFig() {
  return (
    <div className="feat-fig-rank">
      <span className="feat-fig-rank-n">247</span>
      <svg
        viewBox="0 0 26 26"
        className="feat-fig-pin"
        aria-hidden="true"
        fill="none"
      >
        <rect
          x="3"
          y="3"
          width="9"
          height="9"
          rx="2"
          fill="rgba(10,10,10,.18)"
        />
        <rect
          x="14"
          y="3"
          width="9"
          height="9"
          rx="2"
          fill="rgba(10,10,10,.32)"
        />
        <rect
          x="3"
          y="14"
          width="9"
          height="9"
          rx="2"
          fill="rgba(10,10,10,.32)"
        />
        <rect
          x="14"
          y="14"
          width="9"
          height="9"
          rx="2"
          fill="rgba(10,10,10,.18)"
        />
      </svg>
    </div>
  );
}

function BevRegFig() {
  return (
    <div className="feat-fig-pct">
      <span className="feat-fig-pct-n">124</span>
      <span className="feat-fig-pct-s">K BEVs</span>
    </div>
  );
}

function StatCanFig() {
  return (
    <div className="feat-fig-pct">
      <span className="feat-fig-pct-n">6.7</span>
      <span className="feat-fig-pct-s">M HH</span>
    </div>
  );
}

function OebFig() {
  return (
    <div className="feat-fig-rank">
      <span className="feat-fig-rank-n">11</span>
      <svg
        viewBox="0 0 26 26"
        className="feat-fig-pin"
        aria-hidden="true"
        fill="none"
      >
        <path
          d="M13 3 L23 8 L23 18 L13 23 L3 18 L3 8 Z"
          stroke="rgba(10,10,10,.35)"
          strokeWidth="1.5"
          fill="rgba(10,10,10,.08)"
        />
        <circle cx="13" cy="13" r="3" fill="rgba(10,10,10,.3)" />
      </svg>
    </div>
  );
}

function NrCanFig() {
  return (
    <div className="feat-fig-pct">
      <span className="feat-fig-pct-n">14</span>
      <span className="feat-fig-pct-s">K ports</span>
    </div>
  );
}

function GasFig() {
  return (
    <div className="feat-fig-pct">
      <span className="feat-fig-pct-n" style={{ fontSize: 30 }}>
        $1.65
      </span>
      <span className="feat-fig-pct-s">/L</span>
    </div>
  );
}

function AlectraFig() {
  return (
    <div className="feat-fig-pct">
      <span className="feat-fig-pct-n">300</span>
      <span className="feat-fig-pct-s">MW cap</span>
    </div>
  );
}

function CensusGeoFig() {
  return (
    <div className="feat-fig-rank">
      <span className="feat-fig-rank-n">521</span>
      <svg
        viewBox="0 0 26 26"
        className="feat-fig-pin"
        aria-hidden="true"
        fill="none"
      >
        <circle
          cx="13"
          cy="10"
          r="6"
          stroke="rgba(10,10,10,.3)"
          strokeWidth="1.5"
          fill="rgba(10,10,10,.08)"
        />
        <path
          d="M7 22 Q13 16 19 22"
          stroke="rgba(10,10,10,.3)"
          strokeWidth="1.5"
          fill="none"
        />
      </svg>
    </div>
  );
}

/* ═══════════════════════════════════════════
   SOURCE CARD  ·  reuses feat-card pattern
   ═══════════════════════════════════════════ */
type Tone = "v1" | "v2" | "v3" | "v4" | "v5" | "v6";

interface SourceCardProps {
  tone: Tone;
  name: string;
  org: string;
  caption: string;
  metaCat: string;
  metaVal: string;
  figure: React.ReactNode;
  href: string;
  update: string;
}

function SourceCard({
  tone,
  name,
  org,
  caption,
  metaCat,
  metaVal,
  figure,
  href,
  update,
}: SourceCardProps) {
  return (
    <article className="feat-card ds-card">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="feat-card-img-link"
      >
        <div className={`feat-card-img feat-${tone}`}>
          {/* org badge top-left */}
          <div className="feat-tile ds-org-tile">
            <span className="ds-org-name">{org}</span>
            <span className="ds-dataset-name">{name}</span>
          </div>
          {/* figure bottom-right */}
          <div className="feat-figure">{figure}</div>
          {/* external link indicator */}
          <div className="ds-ext-badge">
            <svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M1 9L9 1M9 1H4M9 1V6"
                stroke="rgba(10,10,10,.45)"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </a>
      <p className="feat-caption">{caption}</p>
      <p className="feat-meta">
        <span className="feat-meta-cat">{metaCat}</span>
        <span className="feat-meta-sep">·</span>
        <span className="feat-meta-val">{metaVal}</span>
        <span className="feat-meta-sep">·</span>
        <span className="feat-meta-val ds-update">{update}</span>
      </p>
    </article>
  );
}

/* ═══════════════════════════════════════════
   DATA SOURCES CONTENT
   ═══════════════════════════════════════════ */
const SOURCES: SourceCardProps[] = [
  {
    tone: "v1",
    org: "Ontario GeoHub",
    name: "Feeder Zones & Land Use",
    caption:
      "Geospatial polygons for Ontario's distribution feeder boundaries, land-use classifications, and FSA-level planning layers — the geographic backbone of every ZEUS map.",
    metaCat: "Geospatial",
    metaVal: "247 feeder zones",
    update: "Quarterly",
    figure: <ZonesFig />,
    href: "https://geohub.lio.gov.on.ca",
  },
  {
    tone: "v2",
    org: "Ontario MTO",
    name: "BEV Registrations",
    caption:
      "Quarterly battery-electric vehicle registration counts by forward sortation area — the primary adoption signal driving ZEUS's XGBoost demand model.",
    metaCat: "EV Registrations",
    metaVal: "124K BEVs · 2024",
    update: "Quarterly",
    figure: <BevRegFig />,
    href: "https://www.ontario.ca/data/vehicle-registration-statistics",
  },
  {
    tone: "v3",
    org: "Statistics Canada",
    name: "Income & Housing Census",
    caption:
      "Median household income, housing tenure, and dwelling type at the census tract level — the two strongest predictors in the XGBoost adoption model.",
    metaCat: "Demographics",
    metaVal: "6.7M households",
    update: "Annual",
    figure: <StatCanFig />,
    href: "https://www12.statcan.gc.ca",
  },
  {
    tone: "v4",
    org: "Ontario Energy Board",
    name: "Distribution System Plans",
    caption:
      "OEB-mandated DSP filings contain feeder topology, rated capacities, and five-year capital programmes — grounding every ZEUS risk projection in regulatory data.",
    metaCat: "Grid Topology",
    metaVal: "11 DSP filings",
    update: "Annual",
    figure: <OebFig />,
    href: "https://www.oeb.ca",
  },
  {
    tone: "v5",
    org: "Natural Resources Canada",
    name: "EVSE Registry",
    caption:
      "Canada's national registry of publicly accessible EV supply equipment — used to compute charging-port density per zone, an 18% weight feature in the model.",
    metaCat: "Infrastructure",
    metaVal: "14K ports · ON",
    update: "Monthly",
    figure: <NrCanFig />,
    href: "https://natural-resources.canada.ca/energy-efficiency/transportation-alternative-fuels/electric-charging-alternative-fuelling-stationslocator-map/20487",
  },
  {
    tone: "v6",
    org: "Environment Canada",
    name: "Retail Gas Price Survey",
    caption:
      "Weekly average retail gasoline prices by city — the macro shock variable in the simulator and a top-weighted feature driving near-term EV purchase decisions.",
    metaCat: "Macro Signal",
    metaVal: "Avg $1.65/L",
    update: "Weekly",
    figure: <GasFig />,
    href: "https://www.nrcan.gc.ca/energy/fuel-prices/4593",
  },
  {
    tone: "v1",
    org: "Alectra Utilities",
    name: "Feeder Capacity Data",
    caption:
      "Internal OEB-filed feeder-level rated capacities and current load profiles across Alectra's service territory — the denominator in every capacity-utilisation calculation.",
    metaCat: "Utility Internal",
    metaVal: "300 MW total",
    update: "Annual DSP",
    figure: <AlectraFig />,
    href: "https://www.alectrautilities.com",
  },
  {
    tone: "v3",
    org: "Statistics Canada",
    name: "Census Geographic Boundaries",
    caption:
      "Dissemination area and FSA shapefiles used to spatially join population density and income data to OEB feeder polygons for the stress-map choropleth.",
    metaCat: "Geospatial",
    metaVal: "521 FSAs · ON",
    update: "5-yr Census",
    figure: <CensusGeoFig />,
    href: "https://www12.statcan.gc.ca/census-recensement/2021/geo/index-eng.cfm",
  },
];

/* ═══════════════════════════════════════════
   PAGE SECTIONS
   ═══════════════════════════════════════════ */

function DataHero() {
  return (
    <section className="sec ds-hero-sec">
      <div className="sec-inner">
        <Link href="/" className="ds-back">
          ← Home
        </Link>
        <div className="ds-hero-grid">
          <div>
            <p className="sec-label prob-lbl">Data Infrastructure</p>
            <h1 className="prob-h2 ds-h1">
              Open data.
              <br />
              <span className="serif-i prob-serif-i">Verified</span> sources.
            </h1>
          </div>
          <div>
            <p className="prob-intro ds-intro">
              ZEUS ingests eight publicly available and utility-provided
              datasets, joining them spatially at the feeder level. Every
              forecast, risk flag, and siting recommendation traces directly
              back to a named, versioned source — no proprietary black boxes.
            </p>
            <div className="ds-meta-row">
              {[
                { n: "8", l: "Source datasets" },
                { n: "247", l: "Feeder zones" },
                { n: "100%", l: "Open or OEB-filed" },
                { n: "Weekly", l: "Fastest refresh" },
              ].map(({ n, l }) => (
                <div key={l} className="prob-kpi">
                  <span className="pkn">{n}</span>
                  <span className="pkl">{l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SourcesGrid() {
  return (
    <section className="sec sol-sec ds-grid-sec">
      <div className="sec-inner">
        <div className="sol-head">
          <p className="sec-label sol-lbl">All Sources</p>
          <h2 className="sec-h2 sol-h2">
            Eight datasets.
            <br />
            One <span className="serif-i sol-serif-i">pipeline</span>.
          </h2>
          <p className="sol-intro">
            Each source is downloaded on its published refresh cadence,
            validated against prior versions, spatially joined to OEB feeder
            boundaries, and versioned before it enters the model. Click any card
            to visit the original source.
          </p>
        </div>

        <div className="sol-grid ds-sources-grid">
          {SOURCES.map((s) => (
            <SourceCard key={`${s.org}-${s.name}`} {...s} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PipelineNote() {
  return (
    <section className="sec ds-pipeline-sec">
      <div className="cta-glow" aria-hidden="true" />
      <div className="sec-inner ds-pipeline-inner">
        <p className="sec-label cta-lbl">Methodology</p>
        <h2 className="cta-h2 ds-pipe-h2">
          How the data
          <br />
          becomes a <span className="serif-i">forecast</span>.
        </h2>

        <div className="ds-steps">
          {[
            {
              n: "01",
              title: "Ingest",
              body: "Automated scripts pull each source on its refresh cadence — weekly for gas prices, quarterly for MTO registrations, annually for OEB DSPs and StatCan data.",
            },
            {
              n: "02",
              title: "Validate",
              body: "Row counts, geographic coverage, and key-field nulls are checked against prior versions. Anomalies halt the pipeline and trigger a Slack alert.",
            },
            {
              n: "03",
              title: "Join",
              body: "All datasets are spatially joined to Ontario GeoHub's feeder polygons using PostGIS, producing one row per feeder per quarter with 14 features.",
            },
            {
              n: "04",
              title: "Model",
              body: "An XGBoost regressor predicts BEV registrations per FSA through 2031. An ARIMA layer captures adoption-curve momentum and outputs three confidence scenarios.",
            },
            {
              n: "05",
              title: "Score",
              body: "Forecasted load is divided by OEB-rated feeder capacity. Feeders crossing 80% utilisation within five years are flagged in the risk register.",
            },
            {
              n: "06",
              title: "Publish",
              body: "Results are written to the ZEUS API and surfaced across the platform — simulator, stress map, siting tool, and OEB brief generator.",
            },
          ].map(({ n, title, body }) => (
            <div key={n} className="ds-step">
              <span className="ds-step-n">{n}</span>
              <div className="ds-step-body">
                <h3 className="ds-step-title">{title}</h3>
                <p className="ds-step-text">{body}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="cta-dividers ds-pipe-stats">
          {[
            { n: "14", l: "Model Features" },
            { n: "5yr", l: "Forecast Horizon" },
            { n: "3", l: "Confidence Scenarios" },
            { n: "80%", l: "Risk Threshold" },
          ].map(({ n, l }) => (
            <>
              <div key={l} className="cta-stat">
                <span className="cs-n">{n}</span>
                <span className="cs-l">{l}</span>
              </div>
              <div className="cta-sep" aria-hidden="true" />
            </>
          ))}
        </div>
      </div>
    </section>
  );
}

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
  );
}

/* ═══════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════ */
export default function DataSources() {
  return (
    <>
      <DataHero />
      <SourcesGrid />
      <PipelineNote />
      <SiteFooter />
    </>
  );
}
