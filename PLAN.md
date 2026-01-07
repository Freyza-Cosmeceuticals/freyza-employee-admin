# PLAN.md – Employee Travel & Expense System

Status: WIP  
Stack: Android (Kotlin) · Supabase (Postgres, Auth, Cron) · SvelteKit + Drizzle

---

## 1. High-level Architecture

### 1.1 Components

- **Supabase**
  - Postgres DB (Drizzle-managed schema)
  - Auth (email/phone + password; optional OAuth later)
  - RLS for per-user isolation
  - Cron / scheduled jobs for auto-locking reports, etc.

- **SvelteKit Admin Dashboard**
  - Uses Drizzle Client against Supabase Postgres.
  - Admin authentication via Supabase.
  - Admin-only views for:
    - Travel plan management
    - Daily report review
    - Employee & master-data management
    - Expense exports

- **Android (Kotlin) Employee App**
  - Uses supabase-kt / Supabase Kotlin client.
  - Handles MR login, daily plan confirmation, visit logging, report locking.
  - Minimal offline caching for plan/day-view; sync to Supabase when online.

### 1.2 User Roles

- **ADMIN**
  - Creates monthly travel plans (TPs) for all employees before 25th of previous month.
  - Manages employees, locations, routes, master lists (doctors, stockists, chemists – later).
  - Reviews daily reports and generates exports.

- **EMPLOYEE (MR)**
  - Views travel plan, confirms route each day.
  - Logs visits (doctor/stockist/chemist).
  - Locks daily report (or auto-lock at 00:00).
  - Can request leave for specific days before cutoff.

---

## 2. Data Model Overview (Drizzle)

Drizzle schema already roughly defined; key models:

- `User`
  - Fields: `id`, `name`, `phone`, `role`, `status`, `tier`, `hqId`, timestamps.
  - Relations:
    - EMPLOYEE: `travelPlans`, `dailyReports`
    - ADMIN: `plansCreated`

- `Location`
  - Fields: `id`, `name`, `operational`, timestamps.
  - Relations: `employees (hq)`, `routeAsSrc`, `routeAsDest`.

- `Route`
  - `srcLocId`, `destLocId`, `distanceKm`.
  - Unique on `(srcLocId, destLocId)`.
  - Used for expense calculation.

- `TravelPlan`
  - One per EMPLOYEE per month.
  - `employeeId`, `month`, `createdById`.
  - Relations: `planEntries`.

- `TravelPlanEntry`
  - One per day per `TravelPlan`.
  - `date`, `dayType (WORK/HOLIDAY/LEAVE)`, optional `routeId`.

- `DailyReport`
  - One per EMPLOYEE per date.
  - `dayType`, optional `routeId`, `ta`, `da`, `totalExpense`, `locked`, `lockedAt`.
  - Relations: `visits`.

- `Visit`
  - `reportId`, `visitType (DOCTOR/STOCKIST/CHEMIST)`.
  - Later: link to doctor/stockist/chemist tables, GPS data, etc.

This schema lives in the SvelteKit repo and is applied to the Supabase Postgres DB via Drizzle migrations.

---

## 3. Auth & Security

### 3.1 Supabase Auth

- All users (admins + employees) are Supabase auth users.
- Application `user.id` equals `auth.users.id`.
- On signup/provision:
  - Admin creation: via dashboard or script; `role = ADMIN`.
  - Employee creation: admin-only; `role = EMPLOYEE`, `tier` set, `hqId` set.

### 3.2 RLS Policies (Core Idea)

- On tables like `TravelPlan`, `TravelPlanEntry`, `DailyReport`, `Visit`:
  - Employee access condition: `employee_id = auth.uid()`.
  - Admin access: `exists(...) where user.role = 'ADMIN'` via a secure function or JWT claim.

- For listing employees, locations, routes:
  - Readable by admins.
  - Restricted read-only subset for employees where needed (e.g. locations list).

Policies will be written in Supabase SQL and tested before mobile integration.

---

## 4. SvelteKit Admin Dashboard Plan

### 4.1 Project Setup

- SvelteKit app with:
  - Drizzle Client connected to Supabase `DATABASE_URL`.
  - Supabase JS client for auth in hooks/layout.
  - UI framework: shadcn-svelte.

Project structure guided by SvelteKit docs (`src/routes`, `+layout`, `+page.server.ts`).

### 4.2 Admin Routes

#### 4.2.1 `/auth`

- Simple login page using Supabase auth (email/phone+password).
- On success:
  - Store session in cookies via SvelteKit hook.
  - Redirect to `/admin`.

#### 4.2.2 `/admin`

- Overview cards:
  - Number of employees.
  - Current month: count of employees with TPs created.
  - Today’s reports locked vs unlocked.

#### 4.2.3 `/admin/travelplan` (List page)

**Goal:** Admin view for all travel plans, grouped by month.

- **Data load (remote functions):**
  - Fetch months with existing `TravelPlan`s (limit to last 6–12 months).
  - For each month:
    - Count employees total vs employees with `TravelPlan` for that month.
  - Determine next month (relative to today) and which employees still lack plans.

- **UI layout:**
  - Month sections (accordion or expandable panels):
    - Month header: e.g. “October 2025”
    - Badge: “12/15 employees planned”.
    - List of rows: Employee name, TP status (complete/partial), link to edit.
  - Top card: **Next month**:
    - Text: “Create Travel Plans for [Next Month]”
    - Button `+ Create`:
      - Opens wizard to create/edit plans for that month.

#### 4.2.4 `/admin/travelplan/[year]-[month]`

**Goal:** Manage all employees’ plans for a specific month.

- **Server:**
  - Fetch all employees (`User` with `role = EMPLOYEE`).
  - For each employee:
    - Fetch (or determine absence of) `TravelPlan` for that month.
    - Optionally prefetch `TravelPlanEntry[]` for quick view.

- **UI:**
  - Fetch Travel Plan with all data using remote functions.
  - Sidebar / list:
    - All employees with status icons (complete / missing / partial).
    - Click selects an employee.
  - Main panel:
    - Header: Employee name, month, HQ.
    - Calendar-like table:
      - One row per date.
      - Columns: Date, DayType (select), Source, Destination.
    - Actions:
      - “Copy previous day”
      - “Mark as holiday” (bulk for selected range) – later.
      - “Save Plan for this Employee”.

- **Actions (server):**
  - `createOrUpdateTravelPlan`:
    - If TP not exists: create `TravelPlan` row for employee + month.
    - Upsert `TravelPlanEntry[]`:
      - Ensure `@@unique([tpId, date])` respected.
    - Return updated plan.

#### 4.2.5 `/admin/travelplan/[planId]` (optional)

- View a single `TravelPlan` in detail (flattened view, debug-friendly).

#### 4.2.6 `/admin/reports` (Daily reports dashboard)

Later, when daily reports are in place:

- Filter by date range, employee, lock status.
- Table of `DailyReport` rows.
- Click to view details: visits and expenses.

---

## 5. Android MR App Plan

### 5.1 Project Setup

- Android app using Kotlin + supabase-kt.
- Dependencies:
  - Kotlin serialization plugin.
  - Ktor HTTP client.
  - Supabase modules: Auth + Postgrest.

### 5.2 Auth Flow

- **Login screen:**
  - Phone + password (or email).
  - Call Supabase Auth signIn.
  - On success, store session/token securely.

- **Session handling:**
  - On app start:
    - Check cached session; refresh if possible.
    - If no valid session, show login.

### 5.3 Main Screens

#### 5.3.1 Home / Today Screen

- Shows:
  - Today’s date.
  - Day type from travel plan (WORK/HOLIDAY/LEAVE).
  - Route (source → dest) from `TravelPlanEntry` or fallback.
  - Lock status of `DailyReport`.

- **Data fetch:**
  - Query `TravelPlanEntry` for current month for this employee.
  - Query/create `DailyReport` for today as needed.

#### 5.3.2 Route Confirmation Flow

- If `DailyReport` for today does not exist:
  - Show default dayType + route from `TravelPlanEntry`.
  - Allow editing:
    - DayType select (WORK/HOLIDAY/LEAVE).
    - For WORK:
      - Source and destination dropdowns from `Location` list.
  - Save:
    - Create `DailyReport` row with chosen `dayType` and `routeId`.

- For future days:
  - Show read-only plan (no report yet).

#### 5.3.3 Visit Logging Flow

- Only active when:
  - DayType = WORK.
  - `DailyReport.locked = false`.

- UI:
  - List of visits (per report).
  - “Add Visit” FAB/button:
    - VisitType selector.
    - Simple fields for now (e.g., note, maybe contact name).
    - Later: link to master doctor/stockist/chemist, GPS.

- Data:
  - Insert into `Visit` table with `reportId`.

#### 5.3.4 Report Locking

- UI:
  - “Lock Report” button on Today screen (if not locked).
- Behavior:
  - On press: set `locked = true`, `lockedAt = now()` for today’s `DailyReport`.
  - Visits no longer editable after locked.

#### 5.3.5 History Screens (later)

- Monthly calendar listing:
  - Each date: icon showing locked/unlocked, dayType, expense summary.
- Tap a day to view report + visits.

### 5.4 Sync Strategy

- Minimal offline:
  - Cache `TravelPlanEntry[]` and recent `DailyReport[]` locally.
  - On app start & refresh:
    - Pull from Supabase.
  - On create/update:
    - Post to Supabase; on failure, queue locally.

- No heavy conflict resolution initially; assume mostly online usage.

---

## 6. Business Logic: Expenses & Cron

### 6.1 Expense Calculation

- **Inputs:**
  - `User.tier` to pick pay-per-km and DA.
  - `Route.distanceKm`.
  - `DayType` and consecutive stay/home city rules (later).

- **Logic location:**
  - Implement as backend (SvelteKit) function or Postgres function.
  - Called:
    - When `DailyReport` is locked.
    - Or via nightly cron for all newly locked/unlocked reports.

- **Output:**
  - Writes `ta`, `da`, `totalExpense` fields into `DailyReport`.

### 6.2 Auto-Locking

- Use Supabase Cron / `pg_cron` to schedule a job running shortly after midnight.
- Job:
  - For each `DailyReport` with `locked = false` and `date < today`, set `locked = true`, `lockedAt = now()`.
  - Potentially auto-create missing `DailyReport` entries as fully empty/zero for auditing or leave them absent depending on business decision.

---

## 7. Implementation Phases (Roadmap)

### Phase 1 – Backend & Schema

- Finalize Drizzle schema; run migrations against Supabase.
- Seed:
  - Admin user(s).
  - Some employees.
  - Basic locations & routes.
- Implement essential RLS.

### Phase 2 – Admin Travel Plan MVP

- `/admin/login` with Supabase auth.
- `/admin/travelplan` list:
  - Show months, employees, and next-month “create” card.
- `/admin/travelplan/[year]-[month]`:
  - Per-employee flat table for dayType and route.
  - Save plan to DB.

Deliverable: Admin can create monthly plans for all employees.

### Phase 3 – Android “Today + Lock” MVP

- Basic login.
- Fetch today’s `TravelPlanEntry`.
- Create `DailyReport` with selected route/dayType.
- Lock report manually.

Deliverable: End-to-end flow: admin plan → MR confirm+lock.

### Phase 4 – Visits

- Add `Visit` editing in app.
- Show visits per report in admin dashboard (`/admin/reports` simple list).

Deliverable: MR logging of field visits with admin visibility.

### Phase 5 – Expenses & Cron

- Implement TA/DA/totalExpense calculation.
- Run it on lock or via nightly cron.
- Display expense fields in admin reports and exports.

Deliverable: Basic automated expense calculation.

### Phase 6 – Enhancements

- Detailed visit metadata and master lists for doctors/stockists/chemists.
- Leave request flow.
- Better UX (bulk operations, copy previous day, better filters).
- PDF/Excel exports and Drive integration.
- GPS + distance-from-POI logic in Kotlin app.

---

## 8. Conventions & Notes

- **Dates & Times:**
  - Store all timestamps as `timestamptz` in Postgres.
  - Use ISO8601 at API boundaries.
- **ID Strategy:**
  - UUID everywhere (already in Drizzle schema).
- **Error Handling:**
  - Prefer backend validation of business rules (e.g., no leave applied after 9am) with clear error codes.
- **Security:**
  - Never leak service role keys to clients; use anon key for client access.
- **Testing:**
  - Seed dev DB with 2–3 employees, 1–2 months of plans to iterate on UI.

---
