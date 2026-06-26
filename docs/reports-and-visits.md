# Reports and Visits Specification

## Overview

Daily report submission system for employees. Each daily report contains one or more visits to doctors, chemists, or stockists.

## Database Schema

### DailyReport Table

```typescript
{
  id: text (UUID, primary key, auto-generated)
  employeeId: text - required (FK to user)
  date: date - required (unique per employee)
  dayType: DayType - default WORK (WORK | HOLIDAY | LEAVE)
  routeId: text - nullable (FK to route, required if dayType = WORK)
  ta: doublePrecision - nullable (travel allowance)
  da: doublePrecision - nullable (daily allowance)
  totalExpense: doublePrecision - nullable
  locked: boolean - default false (if true, no more edits)
  lockedAt: timestamp - nullable
  createdAt: timestamp
  updatedAt: timestamp
}
```

### Visit Table

```typescript
{
  id: text (UUID, primary key, auto-generated)
  reportId: text - required (FK to dailyReport)
  employeeId: text - required (FK to user)
  visitType: VisitType - required (DOCTOR | CHEMIST | STOCKIST)

  // GPS data
  latitude: doublePrecision - required
  longitude: doublePrecision - required
  distanceMetersFromPOI: integer - required

  // Target identification
  doctorName: text - nullable
  chemistName: text - nullable
  stockistName: text - nullable

  // Doctor/Chemist fields
  productDetails: jsonb - [{ name, rate, quantity }]
  samplesGiven: jsonb - string[]
  orderTaken: boolean - default false

  // Stockist fields
  billNo: text - nullable
  paymentCollected: boolean - default false
  amountWithGST: decimal - nullable
  amountWithoutGST: decimal - nullable
  outstandingAmount: decimal - nullable
  orderAmount: decimal - nullable
  stockChecked: boolean - default false

  // Common
  additionalNotes: text - nullable

  createdAt: timestamp
  updatedAt: timestamp
}
```

### Enums

```typescript
enum DayType {
  WORK = "WORK"
  HOLIDAY = "HOLIDAY"
  LEAVE = "LEAVE"
}

enum ReportStatus {
  SAVED = "SAVED"
  LOCKED = "LOCKED"
}

enum VisitType {
  DOCTOR = "DOCTOR"
  STOCKIST = "STOCKIST"
  CHEMIST = "CHEMIST"
}
```

## TypeScript Types

```typescript
type DailyReport = InferSelectModel<typeof dailyReport>
type Visit = InferSelectModel<typeof visit>

// Extended types
type DailyReportWithEmployee = DailyReport & {
  employee: EmployeeWithHQ
}

type DailyReportWithRoute = DailyReport & {
  route: (Route & { srcLoc; destLoc }) | null
}

type DailyReportWithEmployeeWithRoute = DailyReportWithEmployee & DailyReportWithRoute

type DailyReportWithEmployeeWithVisits = DailyReportWithEmployee & {
  visits: Visit[]
}
```

## Components

### DailyReportCard

- Location: `src/lib/components/dashboard/dailyreport/DailyReportCard.svelte`
- Props: `{ report: DailyReportWithEmployeeWithRoute }`
- Features: Display daily report summary with employee info, date, day type, route

### VisitCard

- Location: `src/lib/components/dashboard/VisitCard.svelte`
- Props: `{ visit: Visit }`
- Features: Display visit details (doctor/chemist/stockist info, products, orders)

## Routes

- `/admin/dailyreport` - List all daily reports
- `/admin/dailyreport/[reportId]` - View single report with visits

## Database Operations

```typescript
// src/lib/server/db/dailyreport.ts
getDailyReportsDb(locals) // All reports with employee
getDailyReportsForEmployeeDb(locals, employeeId) // Employee's reports
getDailyReportByIdDb(locals, id) // Single report with visits
getDailyReportsForDatesDb(locals, dates) // Reports for specific dates
createDailyReportDb(locals, data) // Create report
updateDailyReportDb(locals, id, data) // Update report
lockDailyReportDb(locals, id) // Lock report (prevent edits)

// src/lib/server/db/visit.ts
getVisitsForReportDb(locals, reportId) // Visits for a report
createVisitDb(locals, data) // Create visit
updateVisitDb(locals, id, data) // Update visit
deleteVisitDb(locals, id) // Delete visit
```

## Valibot Schemas

```typescript
export const createDailyReportSchema = v.object({
  employeeId: v.string(),
  date: v.coerce(v.date(), v.string()),
  dayType: v.enumType(DayType),
  routeId: v.optional(v.string())
})

export const createVisitSchema = v.object({
  reportId: v.string(),
  visitType: v.enumType(VisitType),
  latitude: v.number(),
  longitude: v.number(),
  distanceMetersFromPOI: v.integer(),
  doctorName: v.optional(v.string()),
  chemistName: v.optional(v.string()),
  stockistName: v.optional(v.string()),
  productDetails: v.optional(
    v.array(
      v.object({
        name: v.string(),
        rate: v.number(),
        quantity: v.integer()
      })
    )
  ),
  samplesGiven: v.optional(v.array(v.string())),
  orderTaken: v.optional(v.boolean()),
  // stockist fields...
  additionalNotes: v.optional(v.string())
})

export const updateDailyReportSchema = v.object({
  id: v.string(),
  dayType: v.optional(v.enumType(DayType)),
  routeId: v.optional(v.string()),
  ta: v.optional(v.number()),
  da: v.optional(v.number()),
  totalExpense: v.optional(v.number())
})
```

## RLS Policies

**Daily Report**:

- Users can SELECT their own reports
- Admins can SELECT all reports
- Users can INSERT their own reports
- Users can UPDATE their own reports if not locked
- Admins can UPDATE all reports

**Visit**:

- Users can SELECT their own visits
- Admins can SELECT all visits
- Users can INSERT visits only if parent report is not locked
- Users can UPDATE visits only if parent report is not locked
- Admins can UPDATE all visits

## Constants

```typescript
const NUM_PAST_DAYS_DAILY_REPORT = 5 // Allow creating reports for past 5 days
```

## Related Files

- `src/lib/db/schema.ts` - Database schema
- `src/lib/types.ts` - TypeScript types
- `src/lib/server/db/dailyreport.ts` - Report DB operations
- `src/lib/server/db/visit.ts` - Visit DB operations
- `src/lib/api/dailyreport.remote.ts` - Remote functions
- `src/routes/(dashboard)/admin/dailyreport/+page.svelte`
- `src/routes/(dashboard)/admin/dailyreport/[reportId]/+page.svelte`
