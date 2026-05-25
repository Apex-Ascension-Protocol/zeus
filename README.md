# ⚡ Zeus

Zeus is God. Or Zeus was God? And was he a God at all? Maybe for the Ancient Greek philosophers he was. And maybe he is now, meaning, we still have records of those philosophers talking of him as God. So is the godness, imagination of it, the cultural understanding of the cosmos and of the creation, is it all relative or is there a certainty in the concepts and words we use to describe anything specific? God, language is so complicated, how did we even start talking to each other and how is there a bear minimum of understanding between us and the things we try to express to each other?

Anyway, luckily, you don't need to bother about any of this information, and we also wouldn't do so. What we have today on the agenda is Zeus — an innovative Hackathon project and solution to predict the EVs energy demand across Toronto and the broader area of Ontario. Already excited? Well, get on board with us, we accept everybody — cuz we don't claim to be gods ;D

---

## The Problem

EV adoption is accelerating fast. But Ontario's grid wasn't built for it.

Utilities like **Alectra** currently have limited visibility into _where_ and _when_ EV charging demand will spike. The result? Feeders risk becoming overloaded — silently, suddenly, and expensively. Without predictive planning, a wave of new EVs plugging in after work in the same neighbourhood can cascade into outages, costly emergency infrastructure upgrades, and a worse experience for everyone trying to do the right thing for the planet.

**Challenge 2 · Problem Statement 03** asks us to solve exactly this.

---

## What Zeus Does

Zeus is an EV grid intelligence platform that gives utilities real-time visibility and forward-looking predictions on charging demand — before problems happen.

Three core capabilities:

### 🔮 Demand Forecasting

A predictive model estimates hourly EV charging demand per feeder zone across Ontario. It combines weather, commute patterns, time-of-day behaviour, EV ownership density, and even petroleum price trends to anticipate load spikes days in advance.

### 🗺️ Grid Heat Map

An interactive map visualizes current feeder load, predicted overload risk zones, and live charging activity across the Alectra service territory. Operators can see at a glance where to pay attention — and where they have breathing room.

### 📍 Optimal Station Placement

An optimization layer recommends the best locations for new public charging infrastructure — balancing available grid capacity, population density, transit proximity, and equity of access across communities.

---

## Why Right Now

The timing of this project isn't accidental. Several forces are converging:

- **EV adoption is accelerating.** Canada-China trade agreements are bringing well-priced EVs to market, lowering the entry barrier for everyday Canadians.
- **Petroleum prices keep rising.** Geopolitical instability is pushing fuel costs higher, making EVs increasingly compelling on pure economics — not just environmentalism.
- **Federal incentives and tax reductions** are further accelerating the switch. The inflection point isn't years away.
- **Utilities need to act now.** Reactive infrastructure upgrades after demand spikes are far costlier than proactive planning. Zeus gives Alectra the intelligence to get ahead of the curve.

This isn't a niche academic exercise. This is infrastructure planning for Ontario's near future.

---

## Data Sources

Zeus is built on publicly available APIs and datasets, plus mock Alectra grid data:

| Source                     | What it provides                                    |
| -------------------------- | --------------------------------------------------- |
| Open Charge Map API        | Existing charging station locations and density     |
| Environment Canada         | Weather data (temperature, precipitation, season)   |
| Statistics Canada Census   | Population density, income, vehicle ownership rates |
| Ontario Energy Board       | Grid structure and feeder zone data                 |
| TomTom Traffic API         | Commute patterns and peak movement times            |
| NRCan EV Registry          | EV ownership by region                              |
| Google Maps / Places API   | Points of interest, amenities near proposed sites   |
| IESO Demand Data           | Historical and real-time Ontario grid demand        |
| CAA EV Cost Data           | EV cost of ownership vs. petroleum benchmarks       |
| Alectra Grid Data _(mock)_ | Feeder topology, capacity limits, current load      |

---

## Tech Stack

| Layer            | Technology                           |
| ---------------- | ------------------------------------ |
| Frontend         | Next.js 15, TypeScript, Tailwind CSS |
| Visualization    | Mapbox GL / Leaflet, Recharts        |
| Prediction Model | Python, scikit-learn / XGBoost       |
| API Layer        | Next.js API Routes                   |
| Deployment       | Vercel                               |

---

## Getting Started

```bash
# Clone the repo
git clone git@github.com:Apex-Ascension-Protocol/zeus.git
cd zeus

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your API keys to .env.local

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
zeus/
├── src/
│   ├── app/
│   │   ├── page.tsx           # Landing page
│   │   ├── dashboard/         # Grid heat map & live stats
│   │   └── model/             # Prediction model explorer
│   ├── components/            # Shared UI components
│   └── lib/                   # API clients, utilities
├── public/
└── README.md
```

---

## The Team

Built at Hackathon 2025 by a team who genuinely believes this infrastructure matters — for Alectra, for Ontario drivers, and for the grid that connects them.

We accept everybody. We don't claim to be gods.

---

## Sponsor

This project was built in partnership with **[Alectra](https://www.alectra.com/)** — one of Ontario's largest electricity distributors, serving over a million customers across the Greater Toronto and Hamilton Area.

---

_Zeus · Hackathon 2025 · Challenge 2 · Problem Statement 03_
