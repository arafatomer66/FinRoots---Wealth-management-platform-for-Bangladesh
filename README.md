# FinRoots

**Wealth management platform built for Bangladesh.** Track net worth across the whole family, plan inheritance per Sharia / Hindu / Christian rules, calculate zakat and NBR-compliant income tax, manage budgets and recurring expenses, and keep all your financial documents in one encrypted vault — in BDT, with a dark, premium UI.

[![stack](https://img.shields.io/badge/Angular-20-DD0031)]() [![stack](https://img.shields.io/badge/Express-TypeScript-3178C6)]() [![stack](https://img.shields.io/badge/PostgreSQL-16-336791)]() [![stack](https://img.shields.io/badge/Docker-Compose-2496ED)]()

---

## Features

### 💰 Net Worth Tracking
- **Assets** across 11 categories: cash, savings, FDR, DPS, stocks, mutual funds, real estate, gold, vehicles, business, other
- **Liabilities**: home loans, car loans, personal loans, credit cards, business loans — with EMI, interest rate, lender, due dates
- **Per-family-member ownership** so you see who owns what
- **Live net worth** = assets − liabilities, updated on every change

### 📊 Smart Dashboard
- Net worth at a glance, formatted in BDT
- **Asset allocation donut** (canvas-rendered, no chart library bloat)
- **Income vs expense bar chart** — last 6 months with gradient bars
- **Financial health score** (0–100, grade A/B/C/D) on a circular ring
  - 4 pillars × 25 pts: savings rate, debt ratio, emergency fund, goal progress

### 💵 Income & Expenses
- **Income**: salary, business, freelance, rental, dividends, interest — with frequency (one-time / monthly / yearly) and taxable flag
- **Expenses**: 9 categories, date-based tracking, this-month total in summary strip
- **Recurring transactions**: mark as recurring → auto-creates next entry on the due date, with toggle on/off

### 📈 Budgets
- Per category, per month, with auto-calculated spending from expense records
- **Progress bars** with warning (>80%) and danger (>100%) states
- Month-by-month navigation
- Unique constraint on `(user, category, year, month)` so one budget per slot

### 📁 Document Vault
- **Drag-and-drop upload** (PDF, JPG, PNG, DOC, XLS — up to 10MB)
- Categorize, tag, attach to family members
- Streaming uploads through nginx (`proxy_request_buffering off`) so big files don't OOM the proxy
- Persisted in named Docker volume (survives rebuilds)
- One-click download

### 🕌 Islamic Inheritance Calculator
- **Sharia-compliant** distribution across spouse, children, parents, siblings
- Separate calculators for **Hindu** and **Christian** inheritance laws
- Saves distribution plans for review

### 🌙 Zakat Calculator
- Calculates 2.5% on eligible assets above nisab threshold
- Pulls automatically from cash, savings, gold, business inventory

### 🏛️ Tax Calculator (NBR Bangladesh)
- Current FY income tax slabs
- Pulls taxable income directly from the income module

### 🎯 Goals
- Target amount + deadline + progress tracking
- Feeds the financial-health-score's goal-progress pillar

### 👨‍👩‍👧 Family Members
- Spouse, children, parents tracked as first-class entities
- Used by inheritance calculator and asset ownership

### 📤 CSV Export
- Per-module: assets, income, expenses, liabilities
- Combined `full-report` export for a single download

### 🔐 Auth & Security
- JWT (7-day expiry), bcrypt-hashed passwords
- HTTP interceptor attaches bearer token automatically
- Helmet + CORS + rate limiting + nginx security headers
- Postgres and backend ports closed in production (nginx-only ingress)
- Non-root container user

---

## Quick start

```bash
cp .env.example .env
docker compose up --build
```

- Frontend: http://localhost:4200
- Backend API: http://localhost:3000/api
- Postgres: localhost:5432

Migrations run automatically on backend boot. A demo user is seeded by `backend/seeds/01_demo_user.ts`.

## Production deploy

```bash
DB_PASSWORD=... JWT_SECRET=... FRONTEND_URL=https://your.domain \
  docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d
```

Production compose enforces required env vars (fails fast if missing), drops the Postgres port, hides the backend behind nginx, and runs the backend as a non-root user.

## Stack

| Layer | Tech |
|---|---|
| **Frontend** | Angular 20 (standalone components, signals), Angular Material, custom canvas charts |
| **Backend** | Express + TypeScript, JWT, Knex, Multer, Helmet, rate-limit |
| **Database** | PostgreSQL 16 (13 migrations, 11 tables, indexed for dashboard queries) |
| **Infra** | Multi-stage Docker, named volumes (pgdata, uploads), nginx reverse proxy |
| **Theme** | Dark UI with gold accents (`#d4a853`), BDT formatting throughout |

## Documentation

- 📋 [Features](docs/FEATURES.md) — every module in detail
- 🏗️ [Architecture](docs/ARCHITECTURE.md) — system layout, request flow, security
- ⚙️ [Technical reference](docs/TECHNICAL.md) — schema, API surface, conventions

## Repository layout

```
backend/                 Express + TypeScript API
  migrations/            Knex migrations (timestamped)
  src/modules/           One folder per domain (controller, service, routes)
    auth, users, family, assets, liabilities, income, expenses,
    budgets, goals, documents, dashboard, recurring, export,
    inheritance, zakat, tax
frontend/                Angular 20 SPA
  src/app/features/      One folder per feature page (lazy-loaded)
  src/app/core/          Auth, guards, interceptors, API service
  src/app/shared/        Sidebar, BDT pipe
docker-compose.yml       Dev compose
docker-compose.prod.yml  Prod overrides (required env, closed ports)
```

## License

Private project. All rights reserved.
