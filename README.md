# Ontario EV Intelligence Platform

Zeus is God. Or Zeus was God? And was he a God at all? Maybe for the Ancient Greek philosophers he was. And maybe he is now, meaning, we still have records of those philosophers talking of him as God. So is the godness, imagination of it, the cultural understanding of the cosmos and of the creation, is it all relative or is there a certainty in the concepts and words we use to describe anything specific? God, language is so complicated, how did we even start talking to each other and how is there a bear minimum of understanding between us and the things we try to express to each other?

Anyway, luckily, you don't need to bother about any of this information, and we also wouldn't do so. What we have today on the agenda is Zeus an innovative Hackathon project and solution to predict the EVs energy demand across Toronto and the broader area of Ontario. Already excited? Well, get on board with us, we accept everybody cuz we don't claim to be gods ;D

---

## The Problem

EV adoption in Ontario is accelerating faster than utilities can plan for.

Ontario BEV registrations grew **49% year-over-year in 2024**, reaching 124,911 vehicles. Two macro forces are set to push that curve far beyond historical trends and Alectra's grid wasn't built for what's coming. Without a proactive forecasting tool, distribution utilities face three converging risks:

- **Feeder overload** from unplanned charging demand especially during evening peaks when a cluster of new EVs begins charging simultaneously on a circuit designed for a different load profile.
- **Reactive capital spending** utilities discover grid constraints only after interconnection applications are filed, leading to costly expedited upgrades and 18+ month connection backlogs.
- **Inequitable infrastructure planning** charger investment follows existing demand rather than future need, systematically underserving low-income and high-density communities where residents cannot charge at home.

> Distribution upgrades now account for **30–60% of total EV charging project costs** in constrained areas. GridPulse exists to move that spend from reactive to proactive.

### Two macro demand accelerators

**Middle East conflict — oil price shock**

The disruption to the Strait of Hormuz (which carries ~20% of the world's oil) sent Brent crude up ~65% in March 2026, pushing Ontario pump prices to $2.01/L in early April. Research shows petrol drivers are five times more exposed to oil price spikes than EV owners. GridPulse models this as a quantified demand multiplier measuring the historical correlation between Ontario gas prices sustained above $1.80/L and quarter-over-quarter EV registration growth.

**Affordable EV market entry — the price floor drop**
The January 2026 Canada-China trade deal allows up to 49,000 Chinese EVs annually into Canada at 6.1% tariff (down from a prohibitive 100%). BYD is opening 20 Ontario dealerships in 2026 with models priced $25,000–$42,000. The cheapest EV in Canada was previously ~$45,000 beyond reach for most Ontario households whose median individual income is ~$42,000. Sub-$35K vehicles unlock an estimated **2.1 million Ontario households** concentrated in exactly the FSAs served by Alectra.

If gas stays above $1.90/L through 2027 AND affordable sub-$35K EVs enter market, GridPulse projects Ontario BEV registrations reaching **600,000–700,000 by 2029** roughly 40–65% above base case. That changes the number of Alectra feeders projected to hit critical capacity from 3 to potentially 11 or more.

---

## What GridPulse Does

GridPulse is a web platform giving Ontario electricity distributors a neighbourhood-level, 5-year forward view of where EV charging demand will spike, where chargers should be built, and what grid upgrades to prioritize before the crisis arrives, not after.

| Module                                | What it does                                                                                                                                                                                                 |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **EV Adoption Forecast Engine**       | FSA-level XGBoost + ARIMA model predicting quarterly BEV counts through 2031 across all Ontario postal zones, with three scenarios and a macro shock multiplier layer.                                       |
| **Gas Price Correlation Model**       | Tracks Ontario weekly gas prices and measures historical elasticity between sustained price spikes and EV adoption acceleration. Updates forecast multipliers in real time when prices cross key thresholds. |
| **Affordability Unlocked Analysis**   | Calculates how many Ontario households cross the EV affordability threshold at each price floor — $45K, $38K, $31K, $25K — by FSA. Shows the demand spike that results from affordable vehicle entry.        |
| **Feeder Stress Dashboard**           | Translates EV adoption forecasts into kW peak demand per feeder zone. Flags feeders projected to exceed 80% capacity with projected overload date.                                                           |
| **Charging Station Siting Optimizer** | Linear programming model recommending where to build public chargers to minimize peak feeder load, with an equity constraint ensuring low-income communities are not left as charging deserts.               |
| **Managed Charging Impact Model**     | Quantifies how much peak feeder load is reduced if X% of EV owners shift to Ontario's Ultra-Low Overnight rate (3.9¢/kWh). Expresses savings as capital deferral in dollars and years.                       |
| **OEB DSP Evidence Generator**        | Auto-generates a ward-level planning brief in Word and PDF format, suitable for inclusion in Alectra's Distribution System Plan filing with the Ontario Energy Board.                                        |

---

## Core Use Cases

### Use case 1 — EV adoption forecast by zone

Use MTO quarterly registration data combined with StatCan income and housing data per FSA to train an XGBoost model that predicts EV count per neighbourhood through 2031. This is Stage 1 and the foundation everything else rests on. Every feeder stress calculation, every siting recommendation, every scenario simulation starts here. Fully buildable with open data in 48 hours.

**Inputs:** MTO FSA registration data (Q2 2022–present), StatCan Census income quartile, housing type, renter ratio, commute distance per FSA, federal rebate flag, building permit pipeline.
**Output:** Quarterly BEV count per FSA through Q4 2031, three scenarios (conservative / base / accelerated), with confidence intervals.

### Use case 2 — Feeder stress dashboard

Translate the EV forecasts into peak kW demand using a charging behaviour model percentage of EVs charging 6–9 PM multiplied by Level 2 load (~7.2 kW) then flag which feeders cross 80% capacity and by when. This is the "so that I can" of the entire platform. It's the direct output a distribution planner acts on: not an interesting chart, but a ranked list of circuits that need capital attention before a specific date.

**Inputs:** Stage 1 EV counts per FSA, charging behaviour parameters by neighbourhood type, OEB feeder GIS boundary data, current feeder capacity ratings.
**Output:** Feeder risk register capacity utilization % per feeder per quarter through 2031, with projected overload date and recommended action.

### Use case 3 — Scenario simulation with macro shocks

Add two sliders: one for gas price sustained above $1.80/L, one for sub-$35K EV market entry. Show how the feeder risk map changes under each scenario in real time. This is the demo moment it makes the model feel alive and directly ties the solution to the two real forces driving Ontario EV growth right now. Judges and Alectra planners can see, with a single drag, what the Middle East conflict or BYD's Ontario expansion means for their specific feeders.

**Inputs:** Gas price threshold slider (baseline / $1.80/L sustained / $2.00/L sustained), affordable EV entry toggle (none / sub-$35K / sub-$25K), base forecast.
**Output:** Live-updating feeder risk map showing how many additional feeders cross the 80% threshold under each scenario and how many years sooner overload arrives.

---

## Model Architecture

The prediction engine runs in three stages:

**Stage 1 — EV Adoption Forecast**
XGBoost model per FSA trained on quarterly MTO registration data (2022–present). Features include income quartile, housing type, renter ratio, historical growth rate, gas price sustained above threshold, new development permits, and federal rebate status. Output: quarterly BEV count forecast per FSA through Q4 2031, with confidence intervals.

**Stage 2 — Load Translation**
Converts FSA-level EV counts into peak kW demand using a charging behaviour model. Parameters: share of home Level 2 vs. public Level 2 vs. DC fast charging by neighbourhood type; percentage charging simultaneously during peak hours (6–9 PM); managed charging enrollment rate.

**Stage 3 — Feeder Stress Mapping**
GeoPandas spatial join maps FSA-level kW demand onto OEB feeder boundary GIS data, producing a capacity utilization percentage per feeder per quarter. Flags feeders projected to exceed 80% within 5 years.

### Macro demand multiplier engine

Two independent multipliers overlay the base forecast:

- **Gas Price Multiplier** — when Ontario weekly gas prices sustain above $1.80/L for 8+ consecutive weeks, a +15–25% uplift is applied to adoption forecasts in high-car-dependency FSAs. Calibrated on the 2022 Russia-Ukraine oil shock vs. Ontario EV registrations. Refreshes weekly.
- **Affordability Unlock Multiplier** — when a new sub-$35K EV model enters the Transport Canada eligible vehicle list, the model recalculates the share of households in each FSA that cross the purchase threshold, feeding directly into an upward forecast revision for income brackets $40K–$65K.

Every multiplier is logged with its source data and parameter values. Planners see not just the output number, but the exact assumptions driving each revision — essential for OEB filing auditability.

---

## Data Sources

Every source is free, publicly accessible, and Ontario-specific. No proprietary data agreements required.

| Source                             | What it provides                                                                                                                                                |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Ontario MTO — quarterly**        | EV registrations (BEV and PHEV) by FSA (first 3 digits of postal code), back to Q2 2022. Core geographic demand signal.                                         |
| **OEB open data**                  | SAIDI/SAIFI feeder reliability data, distributor GIS boundaries, DSP filings, historical rate data. Feeder capacity context.                                    |
| **IESO power data**                | Hourly Ontario demand by zone (10+ years) and real-time 5-minute fuel mix. Identifies existing EV load signatures.                                              |
| **Statistics Canada Census 2021**  | Median household income, income distribution, renter vs. owner ratio, housing type, commute distance by FSA. Core affordability inputs.                         |
| **Ontario gas prices (weekly)**    | GlobalPetrolPrices.com Ontario weekly data. Feeds the gas-price-to-adoption correlation multiplier.                                                             |
| **Transport Canada EVAP list**     | Federally eligible EV models with MSRP. Tracks the price floor of incentivized EVs. Triggers affordability unlock revisions.                                    |
| **NRCan EV charger locations**     | Every public charger in Canada with location, level, and operator. Shows coverage gaps for the equity constraint.                                               |
| **City building permit data**      | Residential development pipeline from Toronto, Brampton, Vaughan, and Mississauga open data portals. Predicts future demand before any vehicles are registered. |
| **Environment Canada weather API** | Historical and forecast temperature and precipitation. Models seasonal demand patterns and cold-weather charging behaviour.                                     |
| **IEA Middle East energy tracker** | Oil supply disruption metrics, Strait of Hormuz flow data. Feeds the conflict scenario multiplier.                                                              |

---

## Tech Stack

| Layer                 | Technology                            | Purpose                                                                                                                              |
| --------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Data ingestion**    | Python + pandas                       | Download MTO CSVs, IESO XML, Environment Canada JSON, StatCan Census, gas price feeds. Scheduled with cron.                          |
| **Database**          | DuckDB                                | Lightweight analytical DB querying CSV and Parquet directly. Handles millions of rows without a server.                              |
| **Geospatial**        | GeoPandas + Shapely                   | Spatial joins between census tracts, FSA boundaries, feeder GIS zones, charger locations, and development sites.                     |
| **Forecast model**    | XGBoost + ARIMA                       | Per-FSA adoption forecasting. XGBoost for feature-rich cross-sectional model; ARIMA for time-series validation. Retrained quarterly. |
| **Load model**        | Python physics model                  | Translates EV counts into peak kW demand using charging behaviour parameters by neighbourhood type.                                  |
| **Siting optimizer**  | PuLP (linear programming)             | Recommends optimal charger locations to minimize peak feeder load subject to equity and land availability constraints.               |
| **Backend API**       | FastAPI + Python                      | REST API serving forecasts, feeder stress data, and siting recommendations. Polls IESO every 5 minutes for real-time grid data.      |
| **Frontend**          | Next.js + Tailwind + Leaflet          | Interactive web app with scenario sliders, choropleth maps, feeder risk table, affordability analysis, and export functions.         |
| **Report generation** | python-docx + WeasyPrint              | Auto-generates OEB planning briefs in Word and PDF from forecast data.                                                               |
| **Deployment**        | Vercel (frontend) + Railway (backend) | Push to GitHub triggers automated deployment. No server management required.                                                         |

---

## Getting Started

```bash
# Clone the repo
git clone git@github.com:Apex-Ascension-Protocol/zeus.git
cd zeus

# Install frontend dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your API keys to .env.local

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Backend (Python model API):**

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

---

## Project Structure

```
zeus/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Landing page
│   │   ├── dashboard/            # Feeder stress dashboard & live map
│   │   ├── forecast/             # EV adoption forecast explorer
│   │   ├── affordability/        # Affordability unlock analysis
│   │   └── siting/               # Charging station optimizer
│   ├── components/               # Shared UI components
│   └── lib/                      # API clients, utilities
├── backend/
│   ├── models/                   # XGBoost + ARIMA forecast models
│   ├── data/                     # Data ingestion pipelines
│   ├── optimizer/                # PuLP siting optimizer
│   └── main.py                   # FastAPI entrypoint
└── README.md
```

---

## Development Roadmap

| Phase | Focus                                        | Weeks | Deliverable                                                                                     |
| ----- | -------------------------------------------- | ----- | ----------------------------------------------------------------------------------------------- |
| **1** | Data pipeline & Ontario baseline             | 1–2   | Automated data refresh, clean joined dataset, first EV growth chart by community                |
| **2** | EV adoption forecast model                   | 3–5   | 5-year FSA-level forecast, three scenarios, confidence intervals, validated on holdout quarters |
| **3** | Load translation & feeder stress mapping     | 6–7   | Feeder risk register: capacity utilization per feeder per quarter through 2031                  |
| **4** | Affordability analysis & macro demand engine | 8–9   | Affordability unlocked chart, gas price correlation dashboard, combined scenario projections    |
| **5** | Charging station siting optimizer            | 10–11 | Top 20 ranked charger locations with load impact and equity score                               |
| **6** | React dashboard, OEB export & alert system   | 12–14 | Live web app, auto-generated OEB planning brief, weekly alert email digest                      |

---

## Why This Matters for Alectra

GridPulse directly supports all three of Alectra's 2027–2031 Distribution System Plan priorities:

- **Renew and replace infrastructure** — identifies which specific feeders will be stressed first by EV demand growth, so Alectra's $3.1B renewal program invests in the right places proactively.
- **Meet growing electricity demand** — forward view of demand growth in Brampton, Vaughan, and Markham well before new subdivisions connect to the grid.
- **Resilience and modernization** — GridPulse is the data intelligence layer that makes Alectra's "control room of the future" actually functional.

> Without a demand forecast, Alectra's $46.2M investment in Vaughan alone in 2026 goes in partly blind. The managed charging capital deferral model shows that demand management programs could delay **$180M+ in feeder upgrade costs** across the territory.

**One-sentence pitch:** GridPulse gives you a neighbourhood-level, 5-year forecast of where EV charging demand will spike in your service territory incorporating gas price shocks, affordable vehicle market entry, and Ontario-specific income data — so your $3.1 billion investment plan puts grid upgrades in the right place before the crisis, not after.

---

## The Team

Built at Hackathon 2025 by a team that genuinely believes this infrastructure matters — for Alectra, for Ontario drivers, and for the grid that connects them.

We accept everybody. We don't claim to be gods.

---

## Sponsor

Built in partnership with **[Alectra Utilities](https://www.alectra.com/)** — one of Ontario's largest electricity distributors, serving over a million customers across the Greater Toronto and Hamilton Area.

---

_Zeus · Hackathon 2026 · Challenge 2 · Problem Statement 03 · Ontario, Canada_
