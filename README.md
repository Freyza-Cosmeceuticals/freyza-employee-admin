# Freyza Employee Admin

This is the Sveltekit project for the Admin site of Freyza Employee System.

The tech stack is:

- SvelteKit
- TypeScript
- Drizzle ORM
- Supabase (PostgreSQL)

This project also uses supabase cli setup for local development. All values in `.env.local` should refer to local instances.
We use the `drizzle` postgres user with all drizzle queries. It is created automatically when running `supabase db reset` via the `supabase/roles.sql`.

Edit the file to update the password, and DON'T COMMIT WITH THE PASSWORD (revert it back). Use the set password in `.env.local`.

# Development

1. Install Supabase CLI and run `bun supabase:start` to start all the supabase services.
2. Take a note of addresses and keys in the output or `bun supabase:status` output. Update `.env.local`
3. Run `bun supabase db reset` to reset the database and apply the migrations.
4. Run `./drizzle/seed.sh` to seed in all the values (will merge into supabase seed later).
5. Run `bun dev` to start the development vite server.

## Making a change to the schema

Using drizzle and supabase cli can be cumbersome together, but i have this flow...

1. Update `./src/lib/db/schema.ts` accordingly.
2. Add new types to `./src/lib/types.ts` and `./src/lib/constants.ts` if needed.
3. Run `bun db:generate` to generate the new schema.
4. Run `bun supabase:migrate` to apply the migrations to the local db.
5. Run `bun db:studio` to open the drizzle studio or open the local supabase dashboard.

NOTE: We use drizzle to generate the migration files into `./supabase/migrations`, and then let supabase handle the actual migration process. NEVER use drizzle to apply migrations.

# Staging

TODO

PLAN: Use the existing project for staging, and the `dev` git branch for staging. Work in `feature` branch or similar or maybe even `dev`. Do PRs to `staging`.
On PR to `staging`, or maybe commits, setup GitHub action to push migrations and changes to supabase.

# Production

TODO

PLAN: Create a new project for prod, and use `main` git branch for prod. ALWAYS Open PRs from `staging` to `main` and merge once okay.
GitHub actions to do supabase migrations.
