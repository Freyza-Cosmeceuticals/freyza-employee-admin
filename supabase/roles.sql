create user "drizzle" with password 'secure_password' bypassrls createdb;

-- extend drizzle's privileges to postgres (necessary to view changes in Dashboard)
grant "drizzle" to "postgres";

-- Grant it necessary permissions over the relevant schemas (public)
grant usage on schema public to drizzle;
grant create on schema public to drizzle;
grant all on all tables in schema public to drizzle;
grant all on all routines in schema public to drizzle;
grant all on all sequences in schema public to drizzle;
alter default privileges for role postgres in schema public grant all on tables to drizzle;
alter default privileges for role postgres in schema public grant all on routines to drizzle;
alter default privileges for role postgres in schema public grant all on sequences to drizzle;
