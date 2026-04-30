# Travel Plans Specification

## Overview

Travel plan management system for assigning monthly travel schedules to employees. Admins create travel plans; employees view their assigned plans.

## Database Schema

### TravelPlan Table

```typescript
{
  id: text (UUID, primary key, auto-generated)
  employeeId: text - required (FK to user)
  month: date - required (first day of month/year)
  createdById: text - required (FK to user, admin)
  createdAt: timestamp
  updatedAt: timestamp
}
```

### TravelPlanEntry Table

```typescript
{
  id: text (UUID, primary key, auto-generated)
  tpId: text - required (FK to travelPlan)
  date: date - required (sequential day of month)
  dayType: DayType - default WORK (WORK | HOLIDAY | LEAVE)
  routeId: text - nullable (FK to route, required if WORK)
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
```

## TypeScript Types

```typescript
type TravelPlan = InferSelectModel<typeof travelPlan>
type TravelPlanEntry = InferSelectModel<typeof travelPlanEntry>

type TravelPlanCreate = InferInsertModel<typeof travelPlan> & {
  planEntries: TravelPlanEntryCreate[]
}

type TravelPlanEntryCreate = Omit<InferInsertModel<typeof travelPlanEntry>, "tpId">

type TravelPlanWithEmployee = TravelPlan & {
  employee: EmployeeWithHQ
  stats?: TravelPlanStats
}

type TravelPlanStats = {
  workDays: number
  leaveDays: number
  holidayDays: number
}

type TravelPlanEntryWithRoute = TravelPlanEntry & {
  route: (Route & { srcLoc; destLoc }) | null
}

type TravelPlanWithEmployeeWithEntries = TravelPlan & {
  employee: EmployeeWithHQ
  planEntries: TravelPlanEntryWithRoute[]
}
```

## Components

### PlanCalendar

- Location: `src/lib/components/dashboard/travelplan/PlanCalendar.svelte`
- Features: Monthly calendar view showing travel plan entries

### TravelPlanCard

- Location: `src/lib/components/dashboard/travelplan/TravelPlanCard.svelte`
- Props: `{ plan: TravelPlanWithEmployee }`
- Features: Card showing travel plan summary for an employee

### AddTravelPlanCard

- Location: `src/lib/components/dashboard/travelplan/AddTravelPlanCard.svelte`
- Features: Form to create/edit travel plan entries

### ViewPlanCalendar

- Location: `src/lib/components/dashboard/travelplan/ViewPlanCalendar.svelte`
- Features: Read-only calendar view for employees

## Routes

- `/admin/travelplan` - List all travel plans
- `/admin/travelplan/[tpId]` - View single travel plan detail
- `/admin/travelplan/[y=year]-[m=month]` - Calendar view by month
- `/admin/travelplan/create` - Create new travel plan

## Database Operations

```typescript
// src/lib/server/db/travelplan.ts
getTravelPlansDb(locals) // All plans
getTravelPlanByIdDb(locals, id) // Single plan with entries
getTravelPlansForEmployeeDb(locals, employeeId) // Employee's plans
getTravelPlansForMonthDb(locals, year, month) // Plans for specific month
createTravelPlanDb(locals, data) // Create plan with entries
updateTravelPlanDb(locals, id, data) // Update plan
deleteTravelPlanDb(locals, id) // Delete plan
```

## Valibot Schemas

```typescript
export const createTravelPlanSchema = v.object({
  employeeId: v.string(),
  month: v.coerce(v.date(), v.string()),
  planEntries: v.array(
    v.object({
      date: v.coerce(v.date(), v.string()),
      dayType: v.enumType(DayType),
      routeId: v.optional(v.string())
    })
  )
})

export const updateTravelPlanEntrySchema = v.object({
  id: v.string(),
  dayType: v.enumType(DayType),
  routeId: v.optional(v.string())
})
```

## Usage

1. **Admin creates travel plan**: Select employee, choose month, fill in daily routes/leave/holidays
2. **Employee views plan**: See their monthly travel schedule
3. **Calendar view**: Visual representation of all employees' plans for a month
4. **Stats**: Count of work/leave/holiday days per plan

## Constants

```typescript
const NUM_PAST_MONTHS_TRAVEL_PLAN = 2 // Allow creating plans for past 2 months
```

## Related Files

- `src/lib/db/schema.ts` - Database schema
- `src/lib/types.ts` - TypeScript types
- `src/lib/server/db/travelplan.ts` - Database operations
- `src/lib/api/travelplan.remote.ts` - Remote functions
- `src/routes/(dashboard)/admin/travelplan/+page.svelte`
- `src/routes/(dashboard)/admin/travelplan/[tpId]/+page.svelte`
- `src/routes/(dashboard)/admin/travelplan/[y=year]-[m=month]/+page.svelte`
- `src/routes/(dashboard)/admin/travelplan/create/+page.svelte`
