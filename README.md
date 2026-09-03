# 🌌 Lumora: AI Sentiment Trader

### Autonomous Market-Sentiment Trading, Powered by Gemini

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Gemini API](https://img.shields.io/badge/Gemini-3%20Flash-8E75B2.svg?style=for-the-badge&logo=googlegemini&logoColor=white)](https://ai.google.dev/)
[![Express](https://img.shields.io/badge/Express-4-000000.svg?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/SQLite-better--sqlite3-003B57.svg?style=for-the-badge&logo=sqlite&logoColor=white)](https://github.com/WiseLibs/better-sqlite3)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](#-license)

**An advanced autonomous trading platform that synthesizes global market sentiment into actionable intelligence and automated portfolio management — powered by Gemini and real market data from Finnhub.**

---

## 📌 Table of Contents

- [Overview](#-overview)
- [How Lumora Thinks](#-how-lumora-thinks)
- [System Architecture](#️-system-architecture)
- [Feature Breakdown](#-feature-breakdown)
- [The Autonomous Agent (Cron)](#-the-autonomous-agent-cron)
- [Subscription Tiers](#-subscription-tiers)
- [Database Schema](#️-database-schema)
- [API Reference](#-api-reference)
- [Tech Stack](#-tech-stack)
- [Project Directory Structure](#-project-directory-structure)
- [Quickstart Guide](#-quickstart-guide)
  * [1. Prerequisites](#1-prerequisites)
  * [2. Clone & Install](#2-clone--install)
  * [3. Environment Setup](#3-environment-setup)
  * [4. Run Locally](#4-run-locally)
  * [5. Run Tests](#5-run-tests)
  * [6. Build for Production](#6-build-for-production)
- [Development Scripts](#-development-scripts)
- [Troubleshooting](#️-troubleshooting)
- [Roadmap](#-roadmap)
- [Disclaimer](#-disclaimer)
- [Contributing & License](#-contributing--license)

---

## 🔭 Overview

Markets move on more than price charts — they move on **narrative**: headlines, sentiment shifts, and crowd psychology that lagging indicators are slow to capture.

**Lumora** is a full-stack autonomous trading platform that puts Gemini's reasoning to work on exactly that problem. It ingests real-time financial news via **Finnhub**, asks Gemini to score overall market sentiment and generate per-stock trading recommendations, and either surfaces those recommendations to the user or — for accounts with the AI Agent enabled — **executes high-conviction trades automatically** against a simulated brokerage account with real cash balances, holdings, and full trade history.

Every trade runs against a **mock portfolio backed by a local SQLite database**, so the platform is a safe, fully-functional sandbox for exploring LLM-driven financial decision-making without any real capital or brokerage connection.

---

## 🧠 How Lumora Thinks

```
                 Finnhub Live News Feed
                            │
                            ▼
                 ┌─────────────────────┐
                 │   Gemini 3 Flash      │
                 │  Sentiment Analysis   │
                 └──────────┬──────────┘
                            │
              ┌─────────────┼─────────────┐
              ▼             ▼             ▼
          Bullish        Neutral        Bearish
         Sentiment      Sentiment      Sentiment
              │             │             │
              ▼             ▼             ▼
         ┌─────────────────────────────────────┐
         │   Per-Symbol Recommendation Engine     │
         │        BUY  ·  HOLD  ·  SELL           │
         │       (with confidence score)          │
         └──────────────────┬────────────────────┘
                             │
              ┌──────────────┴──────────────┐
              ▼                             ▼
     Manual Review (Dashboard)     Confidence > 0.8 &
     User Confirms Trade           Agent Enabled → Auto-Execute
              │                             │
              └──────────────┬──────────────┘
                             ▼
                   Mock Portfolio Update
           (Cash, Holdings, Avg. Price, Trade Log)
```

---

## ⚙️ System Architecture

```
flowchart TD
    A[Finnhub News API] --> B[Express Backend /api/news]
    B --> C[Gemini Sentiment Engine /api/ai/sentiment]
    C --> D[Overall Sentiment Score + Reasoning]
    C --> E[Per-Stock Recommendations]

    D --> F[Dashboard UI]
    E --> F
    E --> G{Confidence > 0.8?}

    G -->|Yes, Agent Enabled| H[node-cron Autonomous Agent]
    G -->|No / Manual| F

    H --> I[/api/trade/execute/]
    F -->|User confirms trade| I

    I --> J[SQLite: trades, holdings, portfolio]
    J --> K[Live Quote Enrichment via Finnhub]
    K --> L[Portfolio Dashboard / History / Backtest]

    M[Jarvis Chat Assistant] <--> N[/api/ai/chat/]
    N --> C
```

    Loading

---

## 🧩 Feature Breakdown

| Module | Description |
|---|---|
| **📰 Real-Time News Ingestion** | Pulls live financial headlines from the Finnhub News API, with graceful fallback messaging when no key is configured. |
| **🤖 Gemini Sentiment Engine** | Sends aggregated headlines to Gemini (`gemini-3-flash-preview`) with a structured JSON response schema, returning an overall sentiment score (-1 to 1), reasoning, and BUY/SELL/HOLD recommendations per symbol. |
| **⚡ Autonomous Trading Agent** | A `node-cron` job runs every 15 minutes, evaluates fresh news, and auto-executes any recommendation with confidence > 0.8 for users who've enabled the agent. |
| **💼 Mock Portfolio Engine** | Full buy/sell logic with average-price recalculation, insufficient-funds/shares checks, and atomic SQLite transactions. |
| **📊 Live Quote Enrichment** | Holdings are enriched with near-real-time prices from Finnhub (60-second cache) to compute live P&L. |
| **🧠 Jarvis — AI Financial Assistant** | A persistent Gemini-powered chat assistant with full portfolio context, available across the app via `JarvisChat`. |
| **🛡️ Risk Rules Engine** | Per-user configurable max position size, stop-loss percentage, daily trade cap, and an agent on/off switch. |
| **🧪 Strategy Backtesting** | A dedicated Backtest page simulates historical trade performance, reporting hit rate, Sharpe ratio, and total simulated return. |
| **🗂️ Sector Sentiment Breakdown** | Gemini scores sentiment across Technology, Energy, Finance, Healthcare, and Consumer Goods sectors. |
| **🔐 Google OAuth Login** | Full OAuth2 authorization-code flow against Google, with popup-based callback messaging back to the main window. |
| **💳 Tiered Subscription Plans** | Lite, Standard, Premium, and Ultra Premium plans gating AI analysis token limits and feature access. |
| **🧾 Trade History & Memory** | Every trade is logged with its sentiment score and AI reasoning; a `trade_memory` table tracks predicted vs. actual returns for future learning loops. |

---

## 🕒 The Autonomous Agent (Cron)

Lumora's most distinctive feature runs entirely server-side, on a schedule — no user interaction required:

1. **Every 15 minutes**, `node-cron` checks for any user with `agentEnabled = 1` in their risk rules.
2. If active agents exist, it pulls the latest **Finnhub** headlines.
3. Gemini is asked for **one high-conviction trade** (BUY or SELL) — the prompt explicitly instructs it to respond only if confidence exceeds **0.8**.
4. Qualifying signals are logged to `trade_memory` and executed for each active user according to their risk rules.
5. Every decision — human-reviewed or fully autonomous — is fully auditable in the trade history.

---

## 💳 Subscription Tiers

| Plan | Price | Highlights |
|---|---|---|
| **Lite** | ₹0 | Up to 5 active investments, 100 AI tokens/month, standard market feed |
| **Standard** | ₹1,500 | Up to 20 investments, 500 AI tokens/month, priority feed, email alerts |
| **Premium** | ₹2,499 | Unlimited investments, 2000 AI tokens/month, real-time sentiment streaming, custom agent strategies |
| **Ultra Premium** | ₹3,899 | Unlimited everything, early access to new models, 1-on-1 strategy consulting, API access |

---

## 🗄️ Database Schema

Lumora persists all state locally via **better-sqlite3** (`trading.db`), created and migrated automatically on server start.

<details>
<summary><strong>👤 users</strong></summary>

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  name TEXT,
  plan TEXT DEFAULT 'LITE'
);
```
</details>

<details>
<summary><strong>💰 portfolio</strong></summary>

```sql
CREATE TABLE portfolio (
  userId TEXT PRIMARY KEY,
  cash REAL DEFAULT 100000.0,
  FOREIGN KEY(userId) REFERENCES users(id)
);
```
</details>

<details>
<summary><strong>📈 holdings</strong></summary>

```sql
CREATE TABLE holdings (
  userId TEXT,
  symbol TEXT,
  name TEXT,
  shares REAL,
  avgPrice REAL,
  PRIMARY KEY(userId, symbol),
  FOREIGN KEY(userId) REFERENCES users(id)
);
```
</details>

<details>
<summary><strong>🧾 trades</strong></summary>

```sql
CREATE TABLE trades (
  id TEXT PRIMARY KEY,
  userId TEXT,
  timestamp TEXT,
  symbol TEXT,
  type TEXT,
  shares REAL,
  price REAL,
  sentimentScore REAL,
  reasoning TEXT,
  FOREIGN KEY(userId) REFERENCES users(id)
);
```
</details>

<details>
<summary><strong>🛡️ risk_rules</strong></summary>

```sql
CREATE TABLE risk_rules (
  userId TEXT PRIMARY KEY,
  maxPositionSize REAL DEFAULT 5000.0,
  stopLossPercent REAL DEFAULT 0.05,
  dailyTradeCap INTEGER DEFAULT 5,
  agentEnabled INTEGER DEFAULT 0,
  FOREIGN KEY(userId) REFERENCES users(id)
);
```
</details>

<details>
<summary><strong>🧠 trade_memory</strong></summary>

```sql
CREATE TABLE trade_memory (
  id TEXT PRIMARY KEY,
  userId TEXT,
  symbol TEXT,
  priorSentiment REAL,
  predictedAction TEXT,
  actualReturn REAL,
  timestamp TEXT,
  FOREIGN KEY(userId) REFERENCES users(id)
);
```
</details>

---

## 🔌 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/auth/url` | Returns the Google OAuth consent URL |
| `GET` | `/auth/callback` | Handles the OAuth code exchange and user creation |
| `GET` | `/api/user/:userId` | Fetches a user record |
| `POST` | `/api/user/plan` | Updates a user's subscription plan |
| `GET` | `/api/portfolio/:userId` | Returns cash, holdings (with live prices), and trade history |
| `GET` | `/api/news` | Fetches the latest general market news from Finnhub |
| `POST` | `/api/trade/execute` | Executes a BUY/SELL trade against the mock portfolio |
| `POST` | `/api/ai/sentiment` | Gemini-powered overall sentiment score + recommendations |
| `POST` | `/api/ai/chat` | Jarvis conversational assistant with portfolio context |
| `POST` | `/api/ai/decision` | Single-symbol BUY/SELL/HOLD decision |
| `POST` | `/api/ai/risk` | Portfolio risk-level analysis and alerting |
| `POST` | `/api/ai/sectors` | Sector-by-sector sentiment breakdown |
| `POST` | `/api/backtest` | Runs a simulated strategy backtest and returns performance metrics |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, React Router 7, Tailwind CSS 4, Framer Motion (`motion`), Recharts, Lucide Icons |
| **Backend** | Express 4, Vite 6 (middleware mode for dev, static serve for prod) |
| **Database** | better-sqlite3 (local, file-based) |
| **AI Engine** | Google Gemini (`@google/genai`, model `gemini-3-flash-preview`) |
| **Market Data** | Finnhub (real-time quotes & news) |
| **Scheduling** | node-cron (autonomous agent, every 15 minutes) |
| **Auth** | Google OAuth 2.0 |
| **Language / Tooling** | TypeScript, tsx, esbuild |
| **Testing** | Vitest |

---

## 📁 Project Directory Structure

```
lumora-ai-sentiment-trader/
├── src/
│   ├── main.tsx                  # React entry point
│   ├── App.tsx                   # Router, layout, auth & portfolio state
│   ├── index.css                 # Tailwind styles
│   ├── types.ts                  # Shared TypeScript interfaces & enums
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── JarvisChat.tsx        # AI chat assistant widget
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── About.tsx
│   │   ├── Login.tsx
│   │   ├── Pricing.tsx           # Subscription tiers
│   │   ├── Dashboard.tsx         # Portfolio, sentiment, trading UI
│   │   ├── History.tsx           # Trade history log
│   │   └── Backtest.tsx          # Strategy backtesting UI
│   └── services/
│       ├── geminiService.ts      # Client-side Gemini API helpers
│       └── jarvisService.ts      # Jarvis chat service helpers
├── test/
│   └── trade.test.ts             # Vitest unit tests for trade execution logic
├── server.ts                     # Express server, SQLite schema, AI & trading routes, cron agent
├── index.html                    # Vite entry HTML
├── metadata.json                 # AI Studio app metadata
├── vite.config.ts                # Vite build configuration
├── tsconfig.json                 # TypeScript configuration
├── package.json                  # Dependencies & scripts
├── bun.lock / package-lock.json  # Lockfiles
├── .env.example                  # Environment variable template
└── README.md                     # You are here
```

---

## 🚀 Quickstart Guide

### 1. Prerequisites

Make sure you have the following:

- **Node.js** 18+ (or **Bun**)
- A **Gemini API key** — [get one from Google AI Studio](https://aistudio.google.com/apikey)
- *(Optional, for live market data)* A **Finnhub API key** — [get one for free](https://finnhub.io/)
- *(Optional, for Google login)* **Google OAuth Client ID & Secret**

### 2. Clone & Install

```bash
git clone https://github.com/raahuldatta/Lumora.git
cd Lumora
npm install
```

### 3. Environment Setup

Copy the example environment file:

```bash
cp .env.example .env
```

```env
# Required for Gemini AI API calls
GEMINI_API_KEY="your-gemini-api-key"

# Used for OAuth callbacks and self-referential links
APP_URL="http://localhost:3000"

# Google OAuth credentials (optional — needed for login)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Finnhub API key for real market data & news (optional — falls back to simulated data)
FINNHUB_API_KEY="your-finnhub-api-key"
```

> 💡 Without `GEMINI_API_KEY` or `FINNHUB_API_KEY`, Lumora gracefully falls back to simulated sentiment and mock price data so the app remains fully explorable.

### 4. Run Locally

```bash
npm run dev
```

This runs `server.ts` via `tsx`, which boots Express with Vite in middleware mode. Visit **[http://localhost:3000](http://localhost:3000)**.

### 5. Run Tests

```bash
npm test
```

Runs the Vitest suite covering trade execution logic (fund checks, share accumulation, average price recalculation).

### 6. Build for Production

```bash
npm run build
npm run start
```

`build` compiles the frontend with Vite and bundles `server.ts` into `dist/server.cjs` via esbuild; `start` runs the bundled server with Node.

---

## 🧪 Development Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Express + Vite dev server (`tsx server.ts`) |
| `npm run build` | Build the frontend and bundle the server for production |
| `npm run start` | Run the production server bundle (`dist/server.cjs`) |
| `npm run preview` | Preview the built frontend with Vite |
| `npm run clean` | Remove the `dist` directory |
| `npm run lint` | Type-check the project with `tsc --noEmit` |
| `npm test` | Run the Vitest test suite |

---

## 🩺 Troubleshooting

<details>
<summary><strong>🔑 Gemini API errors</strong></summary>

- Confirm `GEMINI_API_KEY` is set correctly in `.env`
- If left as the placeholder value, all AI routes automatically fall back to simulated responses instead of failing
</details>

<details>
<summary><strong>📉 Missing or stale market data</strong></summary>

- Confirm `FINNHUB_API_KEY` is set — without it, quotes are randomly generated near $150 and news shows a placeholder message
- Quotes are cached for 60 seconds per symbol to respect API rate limits
</details>

<details>
<summary><strong>🔐 OAuth login failing</strong></summary>

- Ensure `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `APP_URL` are all set correctly
- The OAuth redirect URI is constructed as `${APP_URL}/auth/callback` — make sure this exact URI is registered in your Google Cloud OAuth credentials
</details>

<details>
<summary><strong>⚙️ Build / dev server issues</strong></summary>

- Delete `node_modules` and `dist`, then reinstall dependencies
- Ensure Node.js is 18+ and that `trading.db` is writable in the project root
</details>

---

## 🗺️ Roadmap

- [ ] Real backtesting against historical price + news data (current engine is simulated for demo purposes)
- [ ] Per-user configurable AI model and prompt tuning
- [ ] Enforcement of `maxPositionSize`, `stopLossPercent`, and `dailyTradeCap` in the autonomous agent
- [ ] Multi-exchange / multi-currency support
- [ ] Push/email notifications for autonomous trade execution

---

## ⚠️ Disclaimer

Lumora trades against a **simulated, mock portfolio only** (starting cash: $100,000). It does not execute real brokerage orders, move real money, or constitute financial advice. Backtest results are simulated for demonstration purposes. This project is intended for educational and experimental use.

---

## 🤝 Contributing & License

Contributions, issues, and feature requests are welcome — feel free to open a PR or file an issue.

This project is licensed under the **MIT License**.
