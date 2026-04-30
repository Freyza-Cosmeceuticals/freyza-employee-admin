# AGENTS.md - Freyza Employee Admin

This document provides guidelines for agentic coding agents working in this repository.

## Project Overview

- **Tech Stack**: SvelteKit, TypeScript, Drizzle ORM, Supabase (PostgreSQL)
- **Runtime**: Bun (Vite with experimental Bun support)
- **Styling**: TailwindCSS v4, bits-ui components
- **Validation**: Valibot for form validation

## Build / Lint / Test Commands

```bash
# Development
bun dev              # Start Vite dev server
bun build            # Production build
bun preview          # Preview production build

# Type checking
bun run check        # Run svelte-check (type checking)
bun run check:watch  # Watch mode for type checking

# Formatting & Linting
bun run format       # Format all files with Prettier
bun run lint         # Check formatting with Prettier (no auto-fix)

# Database
bun run db:generate  # Generate Drizzle schema
bun run db:studio    # Open Drizzle Studio
bun run supabase:start    # Start Supabase local services
bun run supabase:stop     # Stop Supabase services
bun run supabase:reset    # Reset local database
bun run supabase:migrate  # Apply migrations to local db
```

## Code Style Guidelines

### Formatting (Prettier)

Configuration is in `.prettierrc.json`:

- Print width: 100
- No trailing commas
- No semicolons
- Single quotes: NO (use double quotes)
- Tabs: NO (use spaces)
- Svelte scripts/styles: not indented specially

**Always run `bun run format` before committing.**

### Imports

Follow this import order (configured in `.prettierrc.json`):

```typescript
// 1. SvelteKit built-ins ($app/*)
import { error } from "@sveltejs/kit"

// 2. Empty line
// 3. Project components
import * as Avatar from "@ui/avatar"
import { Badge } from "@ui/badge"

// 4. $lib imports
import * as s from "$lib/db/schema"
import { UserRole, UserStatus } from "$lib/types"
import { cn } from "$lib/utils"

// 6. Third-party modules
import { and, desc, eq } from "drizzle-orm"
import * as v from "valibot"

// 5. @ aliases (if using)
import { db, handleDbError, requireAuthMaybeAdmin } from "./common"
// 7. Relative imports
import type { Employee } from "./types"
// 8. Type imports (last)
import type { ItemVariant } from "@ui/item/item.svelte"
```

### Path Aliases

Configured in `svelte.config.js`:

- `@/*` → `./src/*`
- `@ui/*` → `./src/lib/components/ui/*`

Use these instead of relative paths when possible.

### Naming Conventions

- **Files**: kebab-case (`employee-item.svelte`, `user.ts`)
- **Components**: PascalCase (`EmployeeItem.svelte`, `Button.svelte`)
- **Functions/Variables**: camelCase (`getUser`, `employeeData`)
- **Constants/Enums**: SCREAMING_SNAKE_CASE or PascalCase enums
  ```typescript
  export enum UserRole {
    ADMIN = "ADMIN",
    EMPLOYEE = "EMPLOYEE"
  }
  ```
- **Types**: PascalCase (`EmployeeWithHQ`, `TravelPlanCreate`)
- **Database schema**: lowercase with underscores (`s.user`, `s.location`)

### TypeScript

- **Always use TypeScript** - no JavaScript files
- Enable `strict` mode in tsconfig
- Use `type` imports for types: `import type { Employee } from "..."`
- Define all database types in `$lib/types.ts` using Drizzle's `InferSelectModel` and `InferInsertModel`

### Svelte 5

This project uses Svelte 5 with runes. Use:

- `$props()` for component props
- `$state()` for reactive state
- `$derived()` for derived values
- `$effect()` for side effects

```svelte
<script lang="ts">
interface Props {
  employee: EmployeeWithHQ
  variant?: ItemVariant
}

let { employee, variant = "default" }: Props = $props()
</script>
```

### Database / Drizzle

- Schema in `$lib/db/schema.ts`
- DB queries in `$lib/server/db/*.ts`
- Use `requireAuthMaybeAdmin()` for auth checks
- Use `handleDbError()` for consistent error handling
- Return pattern: `{ data: T, error: null } | { data: null, error: string }`

```typescript
export async function getUser(
  locals: App.Locals
): Promise<{ data: User | null; error: null } | { data: null; error: string }> {
  try {
    const user = await db.query.user.findFirst(...)
    return { data: user, error: null }
  } catch (e) {
    return handleDbError(e)
  }
}
```

### Form Validation

Use **Valibot** (not Zod) for form schemas in `$lib/formSchemas.ts`.

```typescript
import * as v from "valibot"

export const addEmployeeSchema = v.object({
  name: v.pipe(v.string(), v.trim(), v.minLength(3, "Name must be at least 3 characters long."))
  // ...
})
```

### Error Handling

- Use SvelteKit's `error()` function for HTTP errors
- Log errors with console.error or structured logging with TAG
- Wrap DB operations in try/catch with proper error returns

```typescript
const TAG = "DB: getUser()"
console.time(TAG)
try {
  // operation
} catch (e) {
  console.error(e)
  return handleDbError(e)
} finally {
  console.timeEnd(TAG)
}
```

### CSS / TailwindCSS

- Use TailwindCSS v4 (no `tailwind.config.js` - config in CSS)
- Custom components in `$lib/components/ui/` follow bits-ui patterns

### File Organization

```
src/
├── lib/
│   ├── components/
│   │   ├── ui/           # bits-ui style components
│   │   └── dashboard/   # Feature-specific components
│   ├── server/
│   │   └── db/          # Database operations
│   ├── db/              # Schema and relations
│   ├── api/             # Remote API calls
│   ├── utils.ts
│   ├── types.ts         # All TypeScript types
│   ├── constants.ts     # Enums and constants
│   └── formSchemas.ts   # Valibot schemas
├── routes/
│   ├── (dashboard)/     # Authenticated routes
│   └── (unauthenticated)/ # Public routes
└── hooks.server.ts       # Server hooks
```

### Git Workflow

1. Create branches from `preview` branch
2. Never push directly to `preview` or `main`
3. Open PRs for merging
4. Use **squash and merge** to preview, **rebase or squash** to main
5. Run `bun run format` before committing
6. Run `bun run check` to verify types pass

### Environment Variables

- Local: `.env.local`
- Never commit secrets to repository
- Use Supabase CLI for local development

## Common Patterns

### Server Page Load

```typescript
// +page.server.ts
import { fail, redirect } from "@sveltejs/kit"

export const load = async ({ locals }) => {
  const { user, session } = requireAuthMaybeAdmin(locals)
  // ...
}

export const actions = {
  default: async ({ request }) => {
    const formData = await request.formData()
    // use valibot to parse
    // return fail(400, { errors }) or redirect
  }
}
```

### Component Props

```svelte
<script lang="ts">
import type { ClassValue } from "svelte/elements"

interface Props {
  title: string
  count?: number
  class?: ClassValue
}

let { title, count = 0, class: itemClass }: Props = $props()
</script>

<div class={["base-classes", itemClass]}>
  {title} - {count}
</div>
```

## Data Fetching Conventions

This project follows a three-layer data fetching architecture: **Remote Functions** (client-safe server logic), **Drizzle DB Queries** (server-only database access), and **Frontend Data Fetching** (component-level async rendering).

### Remote Functions

Remote functions are SvelteKit server functions exposed to the client via `$app/server` utilities. They provide a type-safe bridge between client and server.

**File Location**: `$lib/api/*.remote.ts`

**Pattern**:

- Use `query()` for read operations or `form()` for mutations
- Use `query.batch()` for batch operations (multiple requests collapsed into one)
- Always validate input with Valibot schemas
- Call Drizzle DB functions for data access
- Use `getRequestEvent()` to access `locals`
- Use `requireAuthMaybeAdmin()` for authentication checks
- Return data directly (remote functions handle serialization)
- Use `error()` from `@sveltejs/kit` for HTTP errors
- Include timing logs with `console.time(TAG)` / `console.timeEnd(TAG)`

```typescript
// $lib/api/dailyreport.remote.ts
import { getRequestEvent, query } from "$app/server"
import { error } from "@sveltejs/kit"

import { getDailyReportsWithEmployeeForDatesDb } from "$lib/server/db/dailyreport"

import { getDailyReportForDatesSchema } from "@/lib/formSchemas"

import { requireAuthMaybeAdmin } from "./common"

/**
 * Remote batch query function to get daily reports for specific dates
 * Batch queries collapse multiple identical requests into a single server call
 */
export const getDailyReportsForDate = query.batch(getDailyReportForDatesSchema, async (dates) => {
  const TAG = `Remote: getDailyReportsForDate(${dates.length} dates)`
  console.time(TAG)

  const { locals } = getRequestEvent()
  const { user, session } = requireAuthMaybeAdmin(locals) // Requires admin

  if (dates.length === 0) {
    error(400, "No dates provided")
  }

  const { data: dailyReports, error: dbError } = await getDailyReportsWithEmployeeForDatesDb(
    locals,
    dates
  )

  if (dbError !== null) {
    console.error("Failed to fetch daily reports", dbError)
    error(500, dbError)
  }

  console.timeEnd(TAG)
  // For batch queries, return a mapping function
  return (date) => dailyReports.get(date.toISOString().split("T", 1)[0])
})
```

### Drizzle DB Queries

Database queries are server-only functions that interact directly with the database. They always return a consistent result object.

**File Location**: `$lib/server/db/*.ts`

**Pattern**:

- Accept `locals: App.Locals` as first parameter for auth checks
- Use `requireAuthMaybeAdmin(locals)` to ensure authorization
- Always return: `{ data: T, error: null } | { data: null, error: string }`
- Use `handleDbError(e)` for consistent error handling
- Include timing logs with `console.time(TAG)` and `console.timeEnd(TAG)`
- Use Drizzle query API (`db.select()`, `db.insert()`, `db.update()`, etc.)
- Use `db.query.*` for typed query builder
- Wrap operations in try/catch blocks

```typescript
// $lib/server/db/dailyreport.ts
import { db, handleDbError, requireAuthMaybeAdmin } from "./common"
import type { DailyReportWithEmployee } from "$lib/types"

/**
 * Gets daily reports with employee info for given dates
 */
export async function getDailyReportsWithEmployeeForDatesDb(
  locals: App.Locals,
  dates: Date[]
): Promise<
  { data: Map<string, DailyReportWithEmployee[]>; error: null } | { data: null; error: string }
> {
  const TAG = `DB: getDailyReportsWithEmployeeForDatesDb(${dates.length} dates)`
  console.time(TAG)
  const { user, session } = requireAuthMaybeAdmin(locals)

  try {
    const dateStrings = dates.map((d) => d.toISOString().split("T", 1)[0])

    const reports = await db
      .select()
      .from(s.dailyReport)
      .where(inArray(s.dailyReport.reportDate, dateStrings))
      .innerJoin(s.user, eq(s.dailyReport.employeeId, s.user.id))

    // Map results by date for easy lookup
    const reportsByDate = new Map<string, DailyReportWithEmployee[]>()
    for (const { dailyReport, user } of reports) {
      const dateKey = dailyReport.reportDate
      if (!reportsByDate.has(dateKey)) {
        reportsByDate.set(dateKey, [])
      }
      reportsByDate.get(dateKey)!.push({ ...dailyReport, employee: user })
    }

    return { data: reportsByDate, error: null }
  } catch (e) {
    return handleDbError(e)
  } finally {
    console.timeEnd(TAG)
  }
}
```

### Frontend Data Fetching

Frontend components fetch data using remote functions within `svelte:boundary` blocks. This enables streaming and progressive enhancement.

**Pattern**:

- Call remote functions directly in component code (not in `load` functions)
- Wrap async operations in `svelte:boundary` with `{#await}` blocks
- Use `pending()`, `then()`, and `failed()` snippets for different states
- Use `$derived` to extract and transform data
- Can use batch queries for multiple related requests
- Never call Drizzle functions directly from components (use remote functions)

```svelte
<!-- +page.svelte -->
<script lang="ts">
import { getDailyReportsForDate } from "$lib/api/dailyreport.remote"

import { DateTime } from "luxon"

let { data } = $props()
let { days } = $derived(data)
</script>

<div class="space-y-8">
  {#each days as d, i (d.toString())}
    <div>
      <h2>{d.toLocaleString(DateTime.DATE_MED)}</h2>

      <svelte:boundary>
        <!-- Call remote function directly; can be batched if called multiple times -->
        {@const dailyReports = (await getDailyReportsForDate(d)) ?? []}

        {#each dailyReports as report}
          <DailyReportCard {report} />
        {:else}
          <p>No reports submitted for this date</p>
        {/each}

        {#snippet pending()}
          <Skeleton class="aspect-video w-32" />
        {/snippet}

        {#snippet failed(error)}
          <p class="text-destructive">Error loading reports: {error.message}</p>
        {/snippet}
      </svelte:boundary>
    </div>
  {/each}
</div>
```

**Note**: SvelteKit's `remoteFunctions: true` experimental feature (enabled in `svelte.config.js`) handles automatic batching of identical queries and provides type safety for remote function calls.

### Data Flow Summary

```
Component (Browser)
    ↓ calls
Remote Function ($lib/api/*.remote.ts)
    ↓ calls
Drizzle DB Query ($lib/server/db/*.ts)
    ↓ accesses
Database (Supabase PostgreSQL)
```

- **Remote functions**: Validation → Auth → DB Call → Error Handling → Return Data
- **DB functions**: Auth → Query Building → Error Handling → Structured Return
- **Components**: Await Remote → Handle States (pending/failed/success) → Render
