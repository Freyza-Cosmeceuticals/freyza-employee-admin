# Project Milestones & Timeline

**Total Duration:** 8–10 weeks (assuming 1 full-time dev or small team)
**Current Date:** Jan 02, 2026  
**Target MVP:** ~Feb 15, 2026

---

## Milestone 1: Backend & Data Foundation (Week 1–2)

**Duration:** 10 days  
**Deliverable:** Secure, seeded database ready for client integration.

### Goals

- Supabase project set up with Prisma schema migrated.
- Essential RLS policies implemented and tested.
- Seed data: 2–3 admins, 10 employees, 20 locations, 50 routes.
- Basic auth working (admin login via SvelteKit).

### Success Criteria

- Admin can query all employee data via Prisma.
- Test employee `auth.uid()` can only see own plans/reports.

**Risks:** RLS complexity, Supabase auth setup.[1]

---

## Milestone 2: Admin Travel Plan MVP (Week 3–4)

**Duration:** 10 days  
**Deliverable:** Admin can create monthly travel plans for all employees.

### Goals

- `/admin/travelplan` listing page (months grouped, next-month prompt).
- Travel plan creation UI:
  - Employee selector.
  - Day-by-day table: Date | DayType | Route.
  - Save full plan to DB.
- Basic validation (no duplicate plans, required fields).

### Success Criteria

- Admin creates plans for 3 months for all 10 seeded employees.
- Data persists correctly; on-the-fly stats work.

**Risks:** UI complexity for calendar/table, location/route dropdowns.

---

## Milestone 3: Android MR MVP (Week 4–6)

**Duration:** 12 days  
**Deliverable:** MR can login, confirm daily route, lock report.

### Goals

- Android app:
  - Login (phone/password).
  - Home screen: Today’s plan from `TravelPlanEntry`.
  - Route confirmation → create `DailyReport`.
  - Manual lock button.
- Basic sync (online/offline).

### Success Criteria

- End-to-end: Admin creates plan → MR logs in → sees plan → confirms → locks.
- 3 different MRs can test simultaneously.

**Risks:** Supabase Kotlin client quirks, session handling.[2][3]

---

## Milestone 4: Visits & Reports (Week 6–7)

**Duration:** 8 days  
**Deliverable:** MR visits logged, visible in admin.

### Goals

- Android:
  - “Add Visit” with type select + note.
  - List of visits for today.
- Admin:
  - `/admin/reports` table listing daily reports.
  - Click to view visits for a report.

### Success Criteria

- MR logs 5+ visits per day; admin sees them correctly.
- RLS prevents MRs seeing each other’s visits.

**Risks:** Visit extensibility (defer doctor/stockist tables if needed).

---

## Milestone 5: Expenses & Automation (Week 8)

**Duration:** 6 days  
**Deliverable:** Automated expense calculation + auto-locking.

### Goals

- Backend expense logic:
  - TA = `distanceKm * tier_multiplier`.
  - DA for stay/home days.
  - Write to `DailyReport.ta/da/totalExpense`.
- Supabase cron:
  - Auto-lock reports at 00:30 daily.
  - Re-run expense calc for newly locked reports.
- Admin view:
  - Export reports as CSV (date range, employee filter).

### Success Criteria

- Lock a report → expenses auto-populate correctly.
- Cron runs nightly; reports lock automatically.

**Risks:** Cron setup, expense business rules.[4][5]

---

## Milestone 6: Polish & Production (Week 9–10)

**Duration:** 10 days  
**Deliverable:** Production-ready MVP.

### Goals

- Leave request flow (apply before 9am, admin approve).
- UI polish:
  - Admin: better tables, search, bulk actions.
  - Android: history calendar, notifications.
- Testing:
  - 10+ employees with full month data.
  - Edge cases (offline, late locks, route changes).
- Deployment:
  - SvelteKit → Vercel/Netlify.
  - Android → internal test track or Play Store internal testing.
  - Supabase prod project with secrets.

### Success Criteria

- Client can onboard 50+ employees and use system normally.
- Export 1 month of expenses for 10 employees.

---

## Timeline Summary

```
Week 1–2 (Jan 03–14):    Backend + RLS
Week 3–4 (Jan 15–28):    Admin Travel Plans
Week 4–6 (Jan 29–Feb 11): Android MVP
Week 6–7 (Feb 12–19):    Visits
Week 8 (Feb 20–26):      Expenses + Cron
Week 9–10 (Feb 27–Mar 07): Polish + Deploy
```

**MVP Date:** February 26, 2026

---

## Critical Dependencies

1. **Week 1:** Supabase project + Prisma schema migration working.
2. **Week 3:** Travel plan CRUD fully functional in admin.
3. **Week 5:** Android login + basic plan fetch working.
4. **Week 7:** End-to-end employee flow (admin → MR → admin view) verified.

---

## Success Metrics

- **MVP (Week 8):** 80% of core flows working end-to-end.
- **Production (Week 10):** Client can run 1 full month cycle with 10+ employees.
- **Post-MVP:** Add GPS, master lists, advanced exports (v2).

---

## Risks & Mitigations

| Risk                   | Impact | Mitigation                                             |
| ---------------------- | ------ | ------------------------------------------------------ |
| RLS complexity         | High   | Start with permissive policies, tighten gradually.     |
| Supabase Kotlin quirks | Medium | Use official examples; test with simple CRUD first.[2] |
| Cron setup             | Low    | Test manually first, use pg_cron.                      |
| Expense rules unclear  | Medium | Get client confirmation on formulas early.             |
| Android offline sync   | Medium | Defer complex sync; focus on online-first MVP.         |

---

**Weekly Check-ins:** Review milestone deliverables. If behind, cut scope (e.g., defer visits, start with simpler expense rules).

This timeline assumes steady progress and quick client feedback on data/business rules.
