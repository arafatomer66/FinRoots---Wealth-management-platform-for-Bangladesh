# Technical reference

## Database schema

13 migrations producing 11 tables. All have `id` (PK), `created_at`, `updated_at` unless noted. Foreign keys cascade on delete.

| Table | Purpose | Key columns |
|---|---|---|
| `users` | Auth | `email` (unique), `password_hash`, `name`, `phone`, `religion` |
| `family_members` | Dependents | `user_id`, `name`, `relationship`, `date_of_birth`, `gender` |
| `assets` | Owned assets | `user_id`, `category`, `name`, `current_value`, `purchase_value`, `family_member_id` |
| `liabilities` | Debts | `user_id`, `category`, `outstanding_amount`, `interest_rate`, `emi`, `due_date` |
| `income` | Income records | `user_id`, `source`, `amount`, `frequency`, `is_taxable`, `is_recurring`, `next_due_date` |
| `expenses` | Expense records | `user_id`, `category`, `amount`, `date`, `is_recurring`, `next_due_date` |
| `goals` | Financial goals | `user_id`, `name`, `target_amount`, `current_amount`, `deadline` |
| `documents` | Vault | `user_id`, `name`, `category`, `file_path`, `file_size`, `mime_type` |
| `inheritance_plans` | Saved distributions | `user_id`, `religion`, `total_estate`, `distribution` (JSON) |
| `tax_filings` | NBR tax records | `user_id`, `fiscal_year`, `taxable_income`, `tax_payable` |
| `budgets` | Monthly budgets | `user_id`, `category`, `year`, `month`, `amount`, unique `(user_id, category, year, month)` |
| `investments` | DSE/CSE stock holdings | `user_id`, `ticker`, `exchange` (DSE/CSE), `quantity`, `buy_price`, `current_price`, `buy_date`, `last_price_update` |
| `insurance_policies` | Insurance | `user_id`, `type`, `insurer`, `policy_number`, `sum_assured`, `premium`, `premium_frequency`, `next_premium_date`, `beneficiary_family_id` |
| `charity` | Donations | `user_id`, `type` (zakat/sadaqah/fitra/qurbani/lillah/other), `amount`, `category`, `date`, `hijri_year` |

Indexes added in `20260426_011_add_indexes.ts` cover `user_id` on every table plus `(user_id, date)` on income/expenses for dashboard range queries.

## API surface

All endpoints prefixed `/api`. All except `/auth/*` and `/health` require `Authorization: Bearer <jwt>`.

### Auth
- `POST /auth/register` — `{email, password, name, phone, religion}` → `{user, token}`
- `POST /auth/login` — `{email, password}` → `{user, token}`
- `GET /auth/me` — current user

### Resources (uniform CRUD pattern)
Each of `family`, `assets`, `liabilities`, `income`, `expenses`, `goals`, `documents`, `budgets`, `investments`, `insurance`, `charity`:
- `GET /<resource>` — list (paginated: `?page=1&limit=20`)
- `GET /<resource>/:id` — read
- `POST /<resource>` — create
- `PUT /<resource>/:id` — update
- `DELETE /<resource>/:id` — delete

### Specialized
- `GET /dashboard/summary` — net worth, allocation, totals
- `GET /dashboard/health-score` — `{score, grade, breakdown}`
- `GET /dashboard/income-vs-expense?months=6` — monthly time series
- `POST /documents/upload` — multipart, file field `file`, max 10MB
- `GET /documents/:id/download` — file stream
- `GET /budgets/summary?year=&month=` — totals + per-category status
- `GET /recurring/upcoming` — `{income[], expenses[]}`
- `POST /recurring/process` — process all due recurring records
- `PUT /recurring/income/:id/toggle`, `PUT /recurring/expense/:id/toggle`
- `GET /export/{assets|income|expenses|liabilities|full-report}` — CSV download
- `GET /investments/summary` — total invested, market value, P/L, DSE/CSE split
- `PUT /investments/:id/price` — quick price update (sets `last_price_update`)
- `GET /insurance/summary` — active policies, sum assured, annual premium, upcoming due
- `GET /charity?year=2026` — list filtered by year
- `GET /charity/summary?year=2026` — yearly totals by type and category
- `POST /inheritance/calculate` — `{religion, estate, family[]}` → distribution
- `POST /zakat/calculate` — eligible assets → 2.5% if over nisab
- `POST /tax/calculate` — `{taxable_income, fiscal_year}` → slab calculation

## Pagination format

```json
{
  "data": [...],
  "pagination": { "page": 1, "limit": 20, "total": 142, "totalPages": 8 }
}
```

`utils/pagination.ts` provides the `paginate(query, page, limit)` helper used across services.

## Response shape conventions

- Success: domain object or `{data, pagination}`
- Error: `{error: string, message: string, statusCode: number}` (set by `error.middleware.ts`)
- Unauthorized: `401` with `{error: "Unauthorized"}`
- Validation: `400` with `{error: "ValidationError", details: [...]}`

## Auth middleware

`AuthRequest` (in `middleware/auth.middleware.ts`) extends Express `Request` with `userId: number`. Always type controller signatures as `(req: AuthRequest, res: Response, next: NextFunction)` and parse params with `Number(req.params.id)` (matches the convention in `goals.controller.ts`).

## Frontend conventions

- All feature components are **standalone** — declared with `standalone: true`, import their own dependencies
- BDT formatting via `bdt.pipe.ts` (`{{ amount | bdt }}`)
- Forms use Angular Reactive Forms (`FormBuilder`, `FormGroup`)
- Dialogs use Angular Material (`MatDialog`)
- Routes lazy-load: `loadComponent: () => import('...').then(m => m.X)`
- Charts are hand-rendered on `<canvas>` via `@ViewChild` refs (no chart library)
- Theme tokens are CSS custom properties in `styles.scss` — gold accent `#d4a853`, dark surface `#1a1a1a`

## Docker build targets

`backend/Dockerfile` is multi-stage:
- `base` — installs deps
- `development` — `npm install`, runs `ts-node-dev` with hot reload
- `build` — `npm ci`, runs `tsc` to produce `dist/`
- `production` — copies `dist/`, `node_modules`, migrations, seeds, knexfile, tsconfig; runs as `appuser` (uid 1001); `HEALTHCHECK` hits `/api/health`

`frontend/Dockerfile` builds the Angular app and serves it from nginx with `frontend/nginx.conf`.

## Local development

```bash
# Backend only
cd backend && npm install && npm run migrate && npm run dev

# Frontend only
cd frontend && npm install && npm start

# Add a migration
cd backend && npm run migrate:make <name>
```

## Health checks

- Backend: `GET /api/health` → `{status: "ok"}`
- Postgres: `pg_isready -U finroots`
- Frontend: nginx process check (default Docker behavior)

Compose declares healthchecks on postgres and backend. Frontend `depends_on: backend: condition: service_healthy` so it only starts after the backend is up.
