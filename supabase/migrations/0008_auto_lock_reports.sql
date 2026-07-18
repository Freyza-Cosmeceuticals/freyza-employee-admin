create extension if not exists pg_cron;

create or replace function lock_past_daily_reports()
returns void
language plpgsql
set search_path = ''
as $$
begin
  update public."dailyReport"
  set
    "locked" = true,
    "lockedAt" = now()
  where
    "locked" = false
    and "date" < (now() AT TIME ZONE 'Asia/Kolkata')::date;
end;
$$;

comment on function lock_past_daily_reports()
is 'Locks daily reports that are past the current date in IST.';

-- schedule the cron job (Executes at 18:35 UTC / 00:05 IST daily)
select cron.schedule(
  'lock-daily-reports',
  '35 18 * * *',
  $$SELECT public.lock_past_daily_reports();$$
);
