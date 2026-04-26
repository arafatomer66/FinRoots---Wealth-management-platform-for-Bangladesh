# Architecture

## System layout

```
┌──────────────┐     :80      ┌──────────────────┐
│   Browser    │ ───────────▶ │  nginx (frontend)│
└──────────────┘              │  - serves SPA    │
                              │  - /api/* proxy  │
                              └────────┬─────────┘
                                       │ :3000
                                       ▼
                              ┌──────────────────┐
                              │  Express backend │
                              │  - JWT auth      │
                              │  - Knex          │
                              │  - Multer        │
                              └────────┬─────────┘
                                       │ :5432
                                       ▼
                              ┌──────────────────┐
                              │  Postgres 16     │
                              └──────────────────┘
```

In production the backend port is **not** exposed to the host — all API traffic goes through nginx's `/api/` location block. In dev the backend exposes 3000 directly so the Angular dev server (4200) can hit it via `environment.ts`.

## Request flow

1. Browser hits Angular SPA. Auth interceptor (`core/interceptors/auth.interceptor.ts`) attaches `Authorization: Bearer <jwt>` from localStorage.
2. nginx serves static files, falls back to `index.html` for SPA routes, proxies `/api/*` to `backend:3000`.
3. Express applies `helmet`, `cors`, `compression`, `rate-limit`, then the route's `authMiddleware` decodes the JWT and sets `req.userId`.
4. Controllers delegate to service classes; services run Knex queries.
5. Errors bubble through `error.middleware.ts` which normalizes them to `{error, message, statusCode}`.

## Module pattern (backend)

Each domain in `src/modules/<name>/` contains:

- `<name>.routes.ts` — Express router, applies `authMiddleware`, wires endpoints to controller methods
- `<name>.controller.ts` — request/response shaping, uses `AuthRequest` type
- `<name>.service.ts` — business logic + Knex queries

Routes are registered in `src/app.ts` under `/api/<name>`.

## Frontend structure

```
src/app/
  core/         services, guards, interceptors (singletons)
  features/     one folder per feature page (lazy-loaded)
  shared/       reusable components (sidebar) and pipes (bdt)
  app.routes.ts Top-level router with authGuard
  app.config.ts Provides router, HTTP client, animations
```

All feature components are **standalone** (no NgModules), use Angular signals where applicable, and lazy-load via `loadComponent`.

## Data flow

`ApiService` (`core/services/api.service.ts`) is the single HTTP client wrapper. All feature components inject it and call typed methods like `getAssets()`, `createBudget()`, `uploadDocument()`. Auth state lives in `AuthService` (BehaviorSubject of current user). The auth guard subscribes to it before allowing route activation.

## File uploads

Documents flow:

1. Frontend builds `FormData`, posts to `/api/documents/upload`.
2. nginx forwards the request with `client_max_body_size 12M` and `proxy_request_buffering off` so streaming works without buffering the whole file.
3. Multer (disk storage) writes to `/app/uploads/` inside the backend container.
4. `/app/uploads/` is mounted as the named volume `finroots-uploads`, surviving container rebuilds.
5. The DB row stores the relative path; downloads stream the file back with `Content-Disposition: attachment`.

## Migrations

Knex migrations in `backend/migrations/` are timestamp-prefixed. The Dockerfile's `CMD` runs `npx knex migrate:latest` before starting the server, so a fresh container always has the latest schema. Rollback locally with `npm run migrate:rollback`.

## Environment matrix

| Variable | Dev default | Prod |
|---|---|---|
| `DB_PASSWORD` | `finroots_dev_2026` | required (`:?` syntax fails compose if missing) |
| `JWT_SECRET` | dev placeholder | required |
| `FRONTEND_URL` | `http://localhost:4200` | required (used for CORS) |
| `NODE_ENV` | `development` | `production` |
| `PORT` | `3000` | `3000` (internal only) |

## Security posture

- JWT signed with `JWT_SECRET`, 7-day expiry
- Passwords hashed with bcrypt (cost 10)
- `helmet` for default security headers + nginx adds `X-Frame-Options`, `X-Content-Type-Options`, `X-XSS-Protection`, `Referrer-Policy`
- Rate limiting on auth endpoints
- Postgres not exposed to host in production
- Backend not exposed to host in production (nginx-only ingress)
- Non-root `appuser` runs the backend in production
- Uploads volume owned by `appuser`
