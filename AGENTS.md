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
- Use `cn()` utility from `$lib/utils` for class merging
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

<div class={cn("base-classes", itemClass)}>
  {title} - {count}
</div>
```
