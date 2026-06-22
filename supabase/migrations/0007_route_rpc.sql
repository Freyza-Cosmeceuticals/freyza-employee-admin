-- Custom SQL migration file, put your code below! --

-- add search_path to 0005_functions.sql
create or replace function public.set_daily_report_locked_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.locked = true and old.locked = false then
    new."lockedAt" = now();
  end if;

  return new;
end;
$$;

-- create get_or_create_route rpc
create or replace function public.get_or_create_route(
  p_src_loc_id text,
  p_dest_loc_id text
)
returns public.route
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_route public.route;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required';
  end if;

  if p_src_loc_id is null or p_dest_loc_id is null then
    raise exception 'Source and destination are required';
  end if;

  select *
  into v_route
  from public.route r
  where r."srcLocId" = p_src_loc_id
    and r."destLocId" = p_dest_loc_id;

  if found then
    return v_route;
  end if;

  insert into public.route (
    "srcLocId",
    "destLocId",
    "distanceKm"
  )
  values (
    p_src_loc_id,
    p_dest_loc_id,
    0
  )
  on conflict ("srcLocId", "destLocId")
  do nothing;

  select *
  into v_route
  from public.route r
  where r."srcLocId" = p_src_loc_id
    and r."destLocId" = p_dest_loc_id;

  return v_route;
end;
$$;

revoke all on function public.get_or_create_route(text, text)
from public;

revoke all on function public.get_or_create_route(text, text)
from anon;

grant execute on function public.get_or_create_route(text, text)
to authenticated;

comment on function public.get_or_create_route(text, text)
is 'Returns an existing route or creates a new route with distanceKm = 0.';
