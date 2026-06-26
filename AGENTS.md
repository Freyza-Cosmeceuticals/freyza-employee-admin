# AGENTS.md - Freyza Employee Admin

## Stack

- Svelte 5 (with runes) + SvelteKit + TypeScript
- Drizzle ORM + Supabase
- TailwindCSS v4 + bits-ui
- Bun runtime
- Valibot validation

## Commands

```bash
bun dev
bun build

bun run check

bun run format
bun run lint
```

## Code Style Guidelines

### Formatting

Read `.prettierrc.json`:

### Imports

Follow import order in `.prettierrc.json`

### Path Aliases

Configured in `svelte.config.js`:

`@/*` → `src/*`
`@ui/*` → `src/lib/components/ui/*`

### Database / Drizzle

- Schema in `$lib/db/schema.ts`
- DB queries in `$lib/server/db/*.ts`
- Use `requireAuthMaybeAdmin()` for auth checks
- Use `handleDbError()` for consistent error handling
- Return pattern: `{ data: T, error: null } | { data: null, error: string }`

### Form Validation

Use **Valibot** (not Zod) for form schemas in `$lib/formSchemas.ts`.

### Error Handling

- Use SvelteKit's `error()` function for HTTP errors
- Log errors with console.error or structured logging with TAG
- Wrap DB operations in try/catch with proper error returns

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

## Data Fetching Conventions

This project follows a three-layer data fetching architecture: **Remote Functions** (client-safe server logic), **Drizzle DB Queries** (server-only database access), and **Frontend Data Fetching** (component-level async rendering).

### Remote Functions

Remote functions are SvelteKit server functions exposed to the client via `$app/server` utilities. They provide a type-safe bridge between client and server.

### Drizzle DB Queries

Database queries are server-only functions that interact directly with the database. They always return a consistent result object.

### Frontend Data Fetching

Frontend components fetch data using remote functions within `svelte:boundary` blocks. This enables streaming and progressive enhancement.

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
