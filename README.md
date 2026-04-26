# FinRoots

Wealth management platform for Bangladesh — net worth tracking, family financial planning, Islamic inheritance & zakat calculators, NBR-compliant tax estimation, and budget/expense management. Built with a dark, premium UI in BDT.

## Quick start

```bash
cp .env.example .env
docker compose up --build
```

- Frontend: http://localhost:4200
- Backend API: http://localhost:3000/api
- Postgres: localhost:5432

Migrations run automatically on backend boot. Demo user is seeded by `backend/seeds/01_demo_user.ts`.

## Production

```bash
DB_PASSWORD=... JWT_SECRET=... FRONTEND_URL=https://your.domain \
  docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d
```

Production overrides enforce required env vars, drop the Postgres port, and route the backend behind nginx (port 80 only).

## Stack

- **Frontend** — Angular 20 (standalone components, signals), Angular Material, custom canvas charts, dark theme with gold accents (`#d4a853`).
- **Backend** — Express + TypeScript, JWT auth, Knex/PostgreSQL, Multer file uploads, Helmet/CORS/rate-limit hardening.
- **Database** — Postgres 16 with 13 migrations covering 11 domain tables.
- **Infra** — Multi-stage Docker builds, named volumes for pgdata and uploads, nginx reverse proxy with security headers.

## Documentation

- [Features](docs/FEATURES.md) — what the app does, by module
- [Architecture](docs/ARCHITECTURE.md) — system layout and request flow
- [Technical reference](docs/TECHNICAL.md) — data model, APIs, conventions

## Repository layout

```
backend/      Express + TypeScript API
  migrations/   Knex migrations (timestamped)
  src/modules/  One folder per domain (controller, service, routes)
frontend/     Angular 20 SPA
  src/app/features/   One folder per feature page
  src/app/core/       Auth, guards, interceptors, API service
docker-compose.yml          Dev compose
docker-compose.prod.yml     Prod overrides
```
