import Navbar from '@/components/navbar/navbar'
import Hero from '@/components/hero/hero'
import Sections from '@/components/sections/sections'

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white overflow-x-hidden">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#00e5a0] flex items-center justify-center">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#0a0f1e"
              strokeWidth="2.5"
            >
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <span className="font-bold text-lg tracking-tight">ZEUS</span>
        </div>
        <div className="flex items-center gap-6 text-sm text-white/50">
          <span>Challenge 2 · Problem 03</span>
          <span className="px-3 py-1 rounded-full border border-[#00e5a0]/40 text-[#00e5a0] text-xs">
            Powered by Alectra
          </span>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative px-8 pt-24 pb-20 text-center max-w-4xl mx-auto">
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#00e5a0]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/50 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00e5a0] animate-pulse" />
          Hackathon 2025 · EV Grid Intelligence Platform
        </div>

        <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6 tracking-tight">
          Predict where EV demand{" "}
          <span className="text-[#00e5a0]">overloads the grid</span> before it
          happens.
        </h1>

        <p className="text-white/50 text-lg max-w-2xl mx-auto leading-relaxed mb-10">
          Zeus gives utilities like Alectra real-time visibility into EV
          charging demand spikes — combining public APIs, predictive modeling,
          and optimal station placement to future-proof Ontario&apos;s power
          grid.
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <a
            href="/dashboard"
            className="px-6 py-3 rounded-xl bg-[#00e5a0] text-[#0a0f1e] font-semibold text-sm hover:bg-[#00ffb3] transition-colors"
          >
            View Live Dashboard →
          </a>
          <a
            href="/model"
            className="px-6 py-3 rounded-xl border border-white/20 text-white/70 text-sm hover:border-white/40 hover:text-white transition-colors"
          >
            Explore the Model
          </a>
        </div>
      </section>

      {/* Stats */}
      <section className="px-8 pb-16">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              value: "2.4×",
              label: "EV adoption growth",
              sub: "Ontario 2022–2025",
            },
            {
              value: "47%",
              label: "Feeder overload risk",
              sub: "without grid planning",
            },
            {
              value: "12+",
              label: "Public APIs integrated",
              sub: "weather, traffic, census",
            },
            {
              value: "~$0",
              label: "Extra fuel cost",
              sub: "vs petroleum spikes",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-1"
            >
              <span className="text-2xl font-bold text-[#00e5a0]">
                {s.value}
              </span>
              <span className="text-sm font-medium text-white/80">
                {s.label}
              </span>
              <span className="text-xs text-white/30">{s.sub}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-8 pb-24 max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold mb-2">What Zeus does</h2>
        <p className="text-white/40 text-sm mb-10">
          Three core pillars that turn raw data into grid decisions.
        </p>

        <div className="grid md:grid-cols-3 gap-5">
          {[
            {
              icon: (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              ),
              title: "Demand Forecasting",
              desc: "ML model predicts hourly charging demand per feeder zone using weather, commute patterns, EV ownership data, and petroleum prices.",
              accent: "#00e5a0",
            },
            {
              icon: (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              ),
              title: "Grid Heat Map",
              desc: "Interactive map showing current load, predicted overload zones, and real-time charging activity across the Alectra service territory.",
              accent: "#3b82f6",
            },
            {
              icon: (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              ),
              title: "Station Placement",
              desc: "Optimization engine recommends ideal locations for new charging infrastructure — balancing grid capacity, population density, and equity.",
              accent: "#f59e0b",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-4 hover:border-white/20 transition-colors"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${f.accent}18`, color: f.accent }}
              >
                {f.icon}
              </div>
              <h3 className="font-semibold text-white">{f.title}</h3>
              <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Data Sources */}
      <section className="px-8 pb-24 max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold mb-2">Data sources</h2>
        <p className="text-white/40 text-sm mb-8">
          Publicly available APIs + mock Alectra grid data + census
          demographics.
        </p>
        <div className="flex flex-wrap gap-3">
          {[
            "Open Charge Map API",
            "Environment Canada Weather",
            "Statistics Canada Census",
            "Ontario Energy Board",
            "TomTom Traffic API",
            "NRCan EV Registry",
            "Google Maps API",
            "Alectra Grid (mock)",
            "IESO Demand Data",
            "CAA EV Cost Data",
          ].map((src) => (
            <span
              key={src}
              className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/60"
            >
              {src}
            </span>
          ))}
        </div>
      </section>

      {/* Why now */}
      <section className="px-8 pb-24 max-w-4xl mx-auto border-t border-white/10 pt-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-2xl font-semibold mb-4">
              Why this matters right now
            </h2>
            <ul className="space-y-4 text-white/50 text-sm leading-relaxed">
              <li className="flex gap-3">
                <span className="text-[#00e5a0] mt-0.5">▸</span>
                EV adoption is accelerating — Canada-China trade agreements are
                bringing affordable EVs to market, lowering the barrier to
                entry.
              </li>
              <li className="flex gap-3">
                <span className="text-[#00e5a0] mt-0.5">▸</span>
                Global petroleum prices are rising with geopolitical
                instability, making EVs economically compelling for everyday
                Ontarians.
              </li>
              <li className="flex gap-3">
                <span className="text-[#00e5a0] mt-0.5">▸</span>
                Federal EV incentives and reduced taxes are accelerating
                adoption — utilities need to be ready before the inflection
                point.
              </li>
              <li className="flex gap-3">
                <span className="text-[#00e5a0] mt-0.5">▸</span>
                Without predictive planning today, feeder overloads will cost
                Alectra millions in reactive infrastructure upgrades tomorrow.
              </li>
            </ul>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="text-xs text-white/30 mb-4 uppercase tracking-wider">
              Projected EV penetration
            </div>
            <div className="space-y-3">
              {[
                { year: "2024", pct: 8, color: "#00e5a0" },
                { year: "2026", pct: 18, color: "#00e5a0" },
                { year: "2028", pct: 34, color: "#3b82f6" },
                { year: "2030", pct: 55, color: "#f59e0b" },
                { year: "2035", pct: 82, color: "#ef4444" },
              ].map((row) => (
                <div key={row.year} className="flex items-center gap-3">
                  <span className="text-xs text-white/40 w-8">{row.year}</span>
                  <div className="flex-1 h-2 rounded-full bg-white/10">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{ width: `${row.pct}%`, background: row.color }}
                    />
                  </div>
                  <span
                    className="text-xs font-medium"
                    style={{ color: row.color }}
                  >
                    {row.pct}%
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-white/20 mt-4">
              Source: NRCan + Zeus model estimates
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-8 py-8 text-center text-xs text-white/20">
        Zeus · Hackathon 2025 · Built for Alectra · Challenge 2 Problem
        Statement 03
      </footer>
    </main>
  );
}
