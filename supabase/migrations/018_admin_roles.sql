-- Add an explicit two-tier administrator role without weakening the existing
-- practitioner boundary. Existing is_admin callers remain compatible: the
-- synchronization trigger maps legacy true/false writes to administrator/null.
--
-- This migration intentionally provisions no people. A confirmed Auth identity
-- must be promoted later through the owner-operated bootstrap or the narrow
-- authenticated super-admin RPC below.

begin;

set local lock_timeout = '5s';

alter table public.profiles
  add column if not exists admin_role text;

comment on column public.profiles.admin_role is
  'Trusted administrator tier. Null for members; administrator or super_admin for administrators.';

create or replace function public.synchronize_profile_admin_role()
returns trigger
language plpgsql
set search_path = ''
as $function$
declare
  role_changed boolean;
  legacy_flag_changed boolean;
begin
  if tg_op = 'INSERT' then
    if new.admin_role is not null then
      new.is_admin := true;
    elsif new.is_admin is true then
      new.admin_role := 'administrator';
    end if;
    return new;
  end if;

  role_changed := new.admin_role is distinct from old.admin_role;
  legacy_flag_changed := new.is_admin is distinct from old.is_admin;

  if role_changed and legacy_flag_changed then
    if new.is_admin is distinct from (new.admin_role is not null) then
      raise exception 'Administrator role and legacy administrator flag must agree.';
    end if;
  elsif role_changed then
    new.is_admin := new.admin_role is not null;
  elsif legacy_flag_changed then
    if new.is_admin is true then
      new.admin_role := coalesce(old.admin_role, 'administrator');
    else
      new.admin_role := null;
    end if;
  end if;

  return new;
end;
$function$;

revoke all on function public.synchronize_profile_admin_role()
  from public, anon, authenticated, service_role;

drop trigger if exists profiles_synchronize_admin_role on public.profiles;
create trigger profiles_synchronize_admin_role
  before insert or update of is_admin, admin_role on public.profiles
  for each row execute procedure public.synchronize_profile_admin_role();

create table public.admin_role_change_audit (
  id bigint generated always as identity primary key,
  target_user_id uuid not null,
  actor_user_id uuid,
  actor_context text not null,
  operation text not null,
  change_reference text not null,
  previous_role text,
  next_role text,
  previous_is_admin boolean not null,
  next_is_admin boolean not null,
  changed_at timestamptz not null default pg_catalog.clock_timestamp(),
  transaction_id bigint not null default pg_catalog.txid_current(),
  constraint admin_role_change_audit_operation_check check (
    operation in ('insert', 'update', 'delete', 'backfill')
  ),
  constraint admin_role_change_audit_reference_check check (
    pg_catalog.length(change_reference) between 8 and 120
    and change_reference ~ '^[A-Za-z0-9][A-Za-z0-9._:/#-]{7,119}$'
  ),
  constraint admin_role_change_audit_previous_role_check check (
    previous_role is null
    or (
      previous_role is not null
      and previous_role in ('administrator', 'super_admin', 'legacy_admin')
    )
  ),
  constraint admin_role_change_audit_next_role_check check (
    next_role is null
    or (
      next_role is not null
      and next_role in ('administrator', 'super_admin')
    )
  ),
  constraint admin_role_change_audit_previous_state_check check (
    previous_is_admin = (previous_role is not null)
  ),
  constraint admin_role_change_audit_next_state_check check (
    next_is_admin = (next_role is not null)
  ),
  constraint admin_role_change_audit_operation_state_check check (
    (
      operation is not distinct from 'insert'
      and previous_role is null
      and next_role is not null
      and next_role in ('administrator', 'super_admin')
    )
    or (
      operation is not distinct from 'update'
      and previous_role is distinct from 'legacy_admin'
      and previous_role is distinct from next_role
    )
    or (
      operation is not distinct from 'delete'
      and previous_role is not null
      and previous_role in ('administrator', 'super_admin')
      and next_role is null
    )
    or (
      operation is not distinct from 'backfill'
      and previous_role is not distinct from 'legacy_admin'
      and next_role is not distinct from 'administrator'
    )
  )
);

comment on table public.admin_role_change_audit is
  'Append-only evidence of administrator insert, backfill, role change, and deletion events. Target UUIDs intentionally survive profile deletion.';
comment on column public.admin_role_change_audit.change_reference is
  'Bounded non-secret approval, ticket, or migration reference supplied explicitly for every privileged role change.';

create index admin_role_change_audit_target_changed_idx
  on public.admin_role_change_audit(target_user_id, changed_at desc);

create or replace function public.record_profile_admin_role_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  reference_value text;
  audit_target_id uuid;
  audit_previous_role text;
  audit_next_role text;
  audit_previous_is_admin boolean;
  audit_next_is_admin boolean;
  audit_operation text;
begin
  if tg_op = 'INSERT' then
    if new.is_admin is not true and new.admin_role is null then
      return new;
    end if;

    audit_target_id := new.id;
    audit_previous_role := null;
    audit_next_role := new.admin_role;
    audit_previous_is_admin := false;
    audit_next_is_admin := new.is_admin;
    audit_operation := 'insert';
  elsif tg_op = 'UPDATE' then
    if new.admin_role is not distinct from old.admin_role
      and new.is_admin is not distinct from old.is_admin then
      return new;
    end if;

    audit_target_id := new.id;
    audit_previous_role := old.admin_role;
    audit_next_role := new.admin_role;
    audit_previous_is_admin := old.is_admin;
    audit_next_is_admin := new.is_admin;
    audit_operation := 'update';

    -- The only pre-constraint mismatch this migration accepts is the legacy
    -- boolean administrator representation. Preserve that actual state with an
    -- audit-only sentinel; legacy_admin is never a profiles or RPC role.
    if old.is_admin is true
      and old.admin_role is null
      and new.is_admin is true
      and new.admin_role = 'administrator' then
      audit_previous_role := 'legacy_admin';
      audit_operation := 'backfill';
    end if;
  elsif tg_op = 'DELETE' then
    if old.is_admin is not true and old.admin_role is null then
      return old;
    end if;

    audit_target_id := old.id;
    audit_previous_role := old.admin_role;
    audit_next_role := null;
    audit_previous_is_admin := old.is_admin;
    audit_next_is_admin := false;
    audit_operation := 'delete';
  else
    raise exception 'Unsupported administrator role audit operation.';
  end if;

  reference_value := pg_catalog.btrim(
    pg_catalog.current_setting('hwl.admin_change_reference', true)
  );

  if reference_value is null
    or pg_catalog.length(reference_value) not between 8 and 120
    or reference_value !~ '^[A-Za-z0-9][A-Za-z0-9._:/#-]{7,119}$' then
    raise exception using
      message = 'Administrator role changes require an explicit non-secret change reference.',
      hint = 'Set hwl.admin_change_reference inside the same transaction to an owner approval, ticket, or migration reference.';
  end if;

  insert into public.admin_role_change_audit (
    target_user_id,
    actor_user_id,
    actor_context,
    operation,
    change_reference,
    previous_role,
    next_role,
    previous_is_admin,
    next_is_admin
  )
  values (
    audit_target_id,
    auth.uid(),
    coalesce(nullif(auth.role(), ''), session_user::text),
    audit_operation,
    reference_value,
    audit_previous_role,
    audit_next_role,
    audit_previous_is_admin,
    audit_next_is_admin
  );

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$function$;

revoke all on function public.record_profile_admin_role_change()
  from public, anon, authenticated, service_role;

drop trigger if exists profiles_record_admin_role_insert on public.profiles;
create trigger profiles_record_admin_role_insert
  after insert on public.profiles
  for each row execute procedure public.record_profile_admin_role_change();

drop trigger if exists profiles_record_admin_role_change on public.profiles;
create trigger profiles_record_admin_role_change
  after update of is_admin, admin_role on public.profiles
  for each row execute procedure public.record_profile_admin_role_change();

drop trigger if exists profiles_record_admin_role_delete on public.profiles;
create trigger profiles_record_admin_role_delete
  after delete on public.profiles
  for each row execute procedure public.record_profile_admin_role_change();

create or replace function public.reject_admin_role_audit_mutation()
returns trigger
language plpgsql
set search_path = ''
as $function$
begin
  raise exception 'Administrator role audit records are append-only.';
end;
$function$;

revoke all on function public.reject_admin_role_audit_mutation()
  from public, anon, authenticated, service_role;

create trigger admin_role_change_audit_reject_mutation
  before update or delete on public.admin_role_change_audit
  for each row execute procedure public.reject_admin_role_audit_mutation();

alter table public.admin_role_change_audit enable row level security;
revoke all on table public.admin_role_change_audit
  from public, anon, authenticated, service_role;
grant select on table public.admin_role_change_audit to service_role;

-- Preserve every existing administrator as the least-privileged tier. The
-- migration reference makes this set-based legacy backfill independently
-- visible in the same append-only role audit as later changes.
select pg_catalog.set_config(
  'hwl.admin_change_reference',
  'migration-018:legacy-admin-backfill',
  true
);
update public.profiles
set admin_role = 'administrator'
where is_admin is true
  and admin_role is null;

alter table public.profiles
  drop constraint if exists profiles_admin_role_check;
alter table public.profiles
  add constraint profiles_admin_role_check
  check (
    is_admin is not null
    and (
      (is_admin is false and admin_role is null)
      or (
        is_admin is true
        and admin_role is not null
        and admin_role in ('administrator', 'super_admin')
      )
    )
  );

-- Reassert the browser boundary after adding the privileged column. Signed-in
-- users may edit only their display name; neither role field is client-writable.
revoke update on table public.profiles from authenticated;
grant update (full_name) on table public.profiles to authenticated;

-- Migration 012 granted service_role ALL for legacy server operations. Keep
-- the required row-level DML but remove table operations that could bypass the
-- row audit or change its enforcement machinery.
revoke truncate, references, trigger on table public.profiles
  from service_role;

create or replace function public.current_admin_role()
returns text
language sql
stable
security definer
set search_path = ''
as $function$
  select case
    when profiles.is_admin is true
      and profiles.admin_role in ('administrator', 'super_admin')
      then profiles.admin_role
    else null
  end
  from public.profiles as profiles
  join auth.users as auth_user on auth_user.id = profiles.id
  where profiles.id = (select auth.uid())
    and auth_user.email_confirmed_at is not null;
$function$;

create or replace function public.is_current_user_super_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select coalesce(
    (select public.current_admin_role()) = 'super_admin',
    false
  );
$function$;

-- Preserve every legacy caller while making the old boolean helper derive from
-- the confirmed, internally consistent role source. Migration 017 continues to
-- call this function, so its practitioner correlation stays intact while an
-- unconfirmed identity can no longer satisfy an older administrator policy.
create or replace function public.is_current_user_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select (select public.current_admin_role()) is not null;
$function$;

-- Post-bootstrap changes have exactly one browser-accessible path. Authority
-- comes from the caller's confirmed super-admin profile, never from an email
-- allowlist. The target email is only a second exact identity predicate.
create or replace function public.change_admin_role(
  p_target_user_id uuid,
  p_target_email text,
  p_expected_role text,
  p_new_role text,
  p_approval_reference text
)
returns table (
  target_user_id uuid,
  role text,
  is_admin boolean
)
language plpgsql
security definer
set search_path = ''
as $function$
declare
  caller_id uuid := auth.uid();
  caller_role text;
  normalized_target_email text;
  normalized_reference text;
  current_target_role text;
begin
  if caller_id is null then
    raise exception 'Authentication is required.';
  end if;

  select profile.admin_role
  into caller_role
  from public.profiles as profile
  join auth.users as auth_user on auth_user.id = profile.id
  where profile.id = caller_id
    and profile.is_admin is true
    and profile.admin_role = 'super_admin'
    and auth_user.email_confirmed_at is not null
  for share of profile, auth_user;

  if caller_role is distinct from 'super_admin' then
    raise exception 'Super-administrator access is required.';
  end if;

  if p_target_user_id is null or p_target_user_id = caller_id then
    raise exception 'A super administrator cannot change their own role.';
  end if;

  normalized_target_email := pg_catalog.lower(pg_catalog.btrim(p_target_email));
  if p_target_email is null
    or p_target_email is distinct from normalized_target_email
    or pg_catalog.length(normalized_target_email) not between 3 and 320 then
    raise exception 'Target email must be the exact normalized email address.';
  end if;

  if p_expected_role is null
    or p_expected_role not in ('member', 'administrator', 'super_admin') then
    raise exception 'Expected role is invalid.';
  end if;

  if p_new_role is null
    or p_new_role not in ('member', 'administrator', 'super_admin') then
    raise exception 'New role is invalid.';
  end if;

  if p_new_role = p_expected_role then
    raise exception 'A role change must change the target role.';
  end if;

  normalized_reference := pg_catalog.btrim(p_approval_reference);
  if p_approval_reference is null
    or p_approval_reference is distinct from normalized_reference
    or pg_catalog.length(normalized_reference) not between 8 and 120
    or normalized_reference !~ '^[A-Za-z0-9][A-Za-z0-9._:/#-]{7,119}$' then
    raise exception 'Approval reference must be a bounded non-secret reference.';
  end if;

  select coalesce(profile.admin_role, 'member')
  into current_target_role
  from public.profiles as profile
  join auth.users as auth_user on auth_user.id = profile.id
  where profile.id = p_target_user_id
    and pg_catalog.lower(pg_catalog.btrim(profile.email)) = normalized_target_email
    and pg_catalog.lower(pg_catalog.btrim(auth_user.email)) = normalized_target_email
    and auth_user.email_confirmed_at is not null
    and profile.is_admin is not distinct from (profile.admin_role is not null)
  for update of profile, auth_user;

  if current_target_role is null then
    raise exception 'Target identity is not an exact confirmed Auth/profile match.';
  end if;

  if current_target_role is distinct from p_expected_role then
    raise exception 'Target role changed before this request was applied.';
  end if;

  perform pg_catalog.set_config(
    'hwl.admin_change_reference',
    normalized_reference,
    true
  );

  return query
    update public.profiles as profile
    set admin_role = case
      when p_new_role = 'member' then null
      else p_new_role
    end
    where profile.id = p_target_user_id
      and pg_catalog.lower(pg_catalog.btrim(profile.email)) = normalized_target_email
      and coalesce(profile.admin_role, 'member') = p_expected_role
      and profile.is_admin is not distinct from (profile.admin_role is not null)
      and exists (
        select 1
        from auth.users as auth_user
        where auth_user.id = profile.id
          and pg_catalog.lower(pg_catalog.btrim(auth_user.email)) =
            normalized_target_email
          and auth_user.email_confirmed_at is not null
      )
    returning profile.id, coalesce(profile.admin_role, 'member'), profile.is_admin;

  if not found then
    raise exception 'Target role changed before this request was applied.';
  end if;
end;
$function$;

revoke all on function public.current_admin_role()
  from public, anon, authenticated, service_role;
revoke all on function public.is_current_user_admin()
  from public, anon, authenticated, service_role;
revoke all on function public.is_current_user_super_admin()
  from public, anon, authenticated, service_role;
revoke all on function public.change_admin_role(uuid, text, text, text, text)
  from public, anon, authenticated, service_role;
grant execute on function public.current_admin_role()
  to authenticated;
grant execute on function public.is_current_user_admin()
  to authenticated;
grant execute on function public.is_current_user_super_admin()
  to authenticated;
grant execute on function public.change_admin_role(uuid, text, text, text, text)
  to authenticated;

commit;
