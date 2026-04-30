# Geography Specification

## Overview

Geographic data management system for locations (headquarters) and routes between them. Used primarily for travel planning and daily reports.

## Database Schema

### Location Table

```typescript
// Headquarters/locations
{
  id: text (UUID, primary key, auto-generated)
  name: varchar(25) - unique, required
  operational: boolean - default true
  createdAt: timestamp
  updatedAt: timestamp
}
```

### Route Table

```typescript
// Routes between locations
{
  id: text (UUID, primary key, auto-generated)
  srcLocId: text - required (FK to location)
  destLocId: text - required (FK to location)
  distanceKm: integer - required (fixed distance)
  createdAt: timestamp
  updatedAt: timestamp
}
```

## TypeScript Types

```typescript
// Basic types
type Location = InferSelectModel<typeof location>
type Route = InferSelectModel<typeof route>

// Create types
type LocationCreate = InferInsertModel<typeof location>
type RouteCreate = InferInsertModel<typeof route>

// Extended types
type LocationWithName = Pick<Location, "id" | "name">

type RouteWithName = Pick<Route, "id" | "distanceKm"> & {
  srcLoc: Pick<Location, "id" | "name">
  destLoc: Pick<Location, "id" | "name">
}
```

## Architecture

### RLS Policies

**Location Policies**:

- All authenticated users can SELECT
- Only admins can INSERT, UPDATE, DELETE

**Route Policies**:

- All authenticated users can SELECT
- Only admins can INSERT, UPDATE, DELETE

## Components

### RouteSelectComboBox

- Location: `src/lib/components/dashboard/RouteSelectComboBox.svelte`
- Props: `{ value?: string, onchange?: (routeId: string) => void }`
- Features: Dropdown to select route for travel plans/daily reports

## Routes

- `/admin/locations` - Location management (future)
- `/admin/routes` - Route management (future)

## Database Operations

```typescript
// src/lib/server/db/location.ts
getLocationsDb(locals) // Get all operational locations
getLocationByIdDb(locals, id) // Get single location
createLocationDb(locals, data) // Create location
updateLocationDb(locals, id, data) // Update location

// src/lib/server/db/route.ts
getRoutesDb(locals) // Get all routes
getRouteByIdDb(locals, id) // Get single route
getRoutesFromSourceDb(locals, srcLocId) // Get routes from source
createRouteDb(locals, data) // Create route
```

## Valibot Schemas

```typescript
export const addLocationSchema = v.object({
  name: v.pipe(
    v.string(),
    v.trim(),
    v.minLength(1, "Location name is required"),
    v.maxLength(25, "Location name must be 25 characters or less")
  ),
  operational: v.boolean()
})

export const addRouteSchema = v.object({
  srcLocId: v.string(),
  destLocId: v.pipe(v.string(), v.notValue("srcLocId", "Source and destination must be different")),
  distanceKm: v.pipe(v.integer(), v.minValue(1, "Distance must be at least 1 km"))
})
```

## Usage in Travel Plans

- Employees are assigned to a headquarters (hqId)
- Travel plan entries specify routes between locations
- Distance is used for TA/DA calculations

## Usage in Daily Reports

- Daily reports record which route was taken
- Route distance used for travel allowance calculations

## Related Files

- `src/lib/db/schema.ts` - Database schema
- `src/lib/types.ts` - TypeScript types
- `src/lib/server/db/location.ts` - Location DB operations
- `src/lib/server/db/route.ts` - Route DB operations
- `src/lib/components/dashboard/RouteSelectComboBox.svelte`
