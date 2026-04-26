# Features

## Authentication

- Email + password registration and login
- JWT-based session, 7-day expiry, stored in localStorage
- Auth guard on all protected routes; HTTP interceptor attaches bearer token
- Profile management

## Family members

CRUD for dependents (spouse, children, parents) used by inheritance calculations and goal assignment.

## Net worth

### Assets
Categories: cash, savings, FDR, DPS, stocks, mutual funds, real estate, gold, vehicles, business, other. Tracks current value, purchase value, family ownership, location.

### Liabilities
Categories: home loan, car loan, personal loan, credit card, business loan. Tracks principal, outstanding, interest rate, EMI, lender, due dates.

### Dashboard
- Net worth = assets − liabilities (canvas donut chart of asset allocation)
- Income vs expense bar chart (last 6 months, gradient bars)
- Financial health score ring (0–100, grade A/B/C/D)
- Quick action cards into each module

## Income & expenses

### Income
- Categories: salary, business, freelance, rental, dividends, interest, other
- Frequency: one-time, monthly, yearly
- Taxable flag (feeds tax module)
- Pagination, filtering by date range

### Expenses
- Categories: food, transport, utilities, rent, healthcare, education, entertainment, shopping, other
- Date-based, this-month total displayed in summary strip

### Recurring transactions
- `is_recurring` + `next_due_date` on income and expenses
- `/api/recurring/upcoming` lists due-soon entries
- `/api/recurring/process` auto-creates new entries from due recurring records and rolls `next_due_date` forward
- Toggle endpoints to enable/disable recurrence per record

## Budgets

- Per category, per month (unique on `user_id, category, year, month`)
- Auto-calculates spent amount by joining matching expenses
- Progress bars with warning (>80%) and danger (>100%) states
- Month-by-month navigation (prev / next)

## Documents vault

- Drag-and-drop upload (10MB cap, PDF/JPG/PNG/DOC/XLS)
- Multer disk storage to `uploads/` (mounted as named Docker volume)
- Categorize, tag, attach to family members
- Download as Blob, delete removes file from disk

## Goals

Track financial goals (target amount, deadline, current progress). Used by health score's goal-progress pillar.

## Islamic inheritance

`/api/inheritance` calculator with three faith-specific implementations (Muslim, Hindu, Christian). Muslim calculator implements Sharia distribution rules across spouse, children, parents, siblings.

## Zakat

Annual zakat calculation on eligible assets (cash, savings, gold, business inventory) above nisab threshold; 2.5% rate.

## Tax (NBR Bangladesh)

Bangladesh income-tax slab calculator using current FY brackets. Pulls taxable income from the income module.

## Financial health score

100 points across 4 pillars (25 each):

| Pillar | Metric |
|---|---|
| Savings rate | (income − expense) / income |
| Debt ratio | liabilities / assets (inverted) |
| Emergency fund | months of expenses covered by liquid assets |
| Goal progress | average completion % across active goals |

Grade: A (80+), B (60–79), C (40–59), D (<40).

## Export

CSV export per module (`/api/export/assets`, `income`, `expenses`, `liabilities`) and combined `/api/export/full-report`. Sets `Content-Disposition: attachment`.
