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

## Development

1. Always create new branches to work on from the `preview` branch.
2. Install Supabase CLI and run `bun supabase:start` to start all the supabase services.
3. Take a note of addresses and keys in the output or `bun supabase:status` output. Update `.env.local`
4. Run `bun supabase db reset` to reset the database and apply the migrations.
5. Run `./drizzle/seed.sh` to seed in all the values (will merge into supabase seed later).
6. Run `bun dev` to start the development vite server.

### Making a change to the schema

Using drizzle and supabase cli can be cumbersome together, but i have this flow...

1. Update `./src/lib/db/schema.ts` accordingly.
2. Add new types to `./src/lib/types.ts` and `./src/lib/constants.ts` if needed.
3. Run `bun db:generate` to generate the new schema.
4. Run `bun supabase:migrate` to apply the migrations to the local db.
5. Run `bun db:studio` to open the drizzle studio or open the local supabase dashboard.

NOTE: We use drizzle to generate the migration files into `./supabase/migrations`, and then let supabase handle the actual migration process. NEVER use drizzle to apply migrations.

## Preview

All preview deployments are sourced from the `preview` branch here on github, deployed to the `preview` vercel project with migrations pushed to the `preview` supabase project.
Never push directly to the `preview` branch. Use other branches to work (no builds are created for commits to those branches), and open a PR to the preview branch.

Vercel will create a preview deployment for each PR automatically. Upon merging a PR, the preview deployment will be promoted to the preview environment.
With that, the `supabase-preview` workflow will run and apply any pending migrations to the preview supabase project.

All new development branches should be created on the `preview` branch.
Always seed only ONCE to the preview db running `bun run --env-file=.env.preview ./src/lib/server/seed/location.ts`

## Production

Create a PR from `preview` to `main` and merge once okay. This will NOT create any preview deployments.
Upon merging, vercel deploys the build to the `prod` vercel project with migrations pushed to the `prod` supabase project using the `supabase-production` workflow.

NEVER EVER push to `main` directly, don't even think of doing that. Only tested code should flow into `main`.

Always seed only ONCE to the preview db running `bun run --env-file=.env.production ./src/lib/server/seed/location.ts`
