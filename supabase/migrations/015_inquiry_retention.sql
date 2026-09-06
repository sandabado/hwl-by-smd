-- Enforce the owner-approved inquiry retention policy without creating a
-- browser, application-service, or scheduled deletion path.
--
-- Policy approved September 5, 2026:
-- - retain inquiry content for 12 months from created_at;
-- - review and purge monthly;
-- - allow holds only for active service, legal, safety, or dispute needs;
-- - keep the existing 30-day pseudonymous rate-limit cleanup and five/hour
--   default from migration 013 and application configuration;
-- - treat journal requests as consent inquiries, not subscriptions.

begin;

set local lock_timeout = '5s';

lock table public.inquiry_submission_limits in access exclusive mode;
lock table public.inquiries in access exclusive mode;

-- Migration 013 accepts only the defensive 1-through-20 RPC input range. The
-- owner-approved launch policy is narrower: no stored one-hour bucket may
-- advance beyond five accepted submissions, even if a future caller supplies a
-- larger RPC argument. A violating legacy row makes this migration fail for
-- review instead of being silently rewritten.
alter table public.inquiry_submission_limits
  add constraint inquiry_submission_limits_approved_maximum check (
    submission_count between 1 and 5
  );

-- Keep migration 013's function signature compatible while enforcing the
-- approved maximum at the database write boundary. Returning null from this
-- BEFORE trigger skips an over-limit INSERT/UPDATE. In record_inquiry_submission
-- that produces no RETURNING row, so its existing claimed_count-is-null path
-- truthfully returns rate_limited=true instead of surfacing a constraint error.
create function public.enforce_inquiry_submission_approved_maximum()
returns trigger
language plpgsql
set search_path = ''
as $function$
begin
  if new.submission_count > 5 then
    return null;
  end if;

  return new;
end;
$function$;

create trigger inquiry_submission_limits_approved_maximum
  before insert or update on public.inquiry_submission_limits
  for each row execute procedure
    public.enforce_inquiry_submission_approved_maximum();

revoke execute on function public.enforce_inquiry_submission_approved_maximum()
  from public, anon, authenticated, service_role;

alter table public.inquiries
  add column retention_hold_reason text,
  add column retention_hold_set_at timestamptz,
  add constraint inquiries_retention_hold_shape check (
    (
      retention_hold_reason is null
      and retention_hold_set_at is null
    )
    or (
      retention_hold_reason in (
        'active_service',
        'legal',
        'safety',
        'dispute'
      )
      and retention_hold_set_at is not null
    )
  );

comment on column public.inquiries.retention_hold_reason is
  'Owner-reviewed exception to the 12-month inquiry purge. Allowed reasons: active_service, legal, safety, or dispute.';
comment on column public.inquiries.retention_hold_set_at is
  'Time the current retention hold was set. Null whenever no hold is active.';

create index inquiries_retention_candidates_idx
  on public.inquiries (created_at, id)
  where retention_hold_reason is null;

-- Aggregate, non-content evidence for committed monthly purge runs. This table
-- intentionally stores no inquiry IDs, names, addresses, messages, or provider
-- receipts. Rollback rehearsals leave no row here because their transaction is
-- never committed.
create table public.inquiry_retention_runs (
  id uuid primary key default gen_random_uuid(),
  operator_email text not null check (
    operator_email = 'admin@ghosthand.studio'
  ),
  reviewed_at timestamptz not null,
  cutoff_at timestamptz not null,
  rate_limit_cutoff_at timestamptz not null,
  candidate_count integer not null check (candidate_count >= 0),
  held_count integer not null check (held_count >= 0),
  deleted_count integer not null check (deleted_count >= 0),
  rate_limit_deleted_count integer not null check (
    rate_limit_deleted_count >= 0
  ),
  executed_at timestamptz not null default now(),
  constraint inquiry_retention_runs_exact_delete check (
    deleted_count = candidate_count
  ),
  constraint inquiry_retention_runs_cutoff check (
    cutoff_at = reviewed_at - interval '12 months'
  ),
  constraint inquiry_retention_runs_rate_limit_cutoff check (
    rate_limit_cutoff_at = executed_at - interval '30 days'
  )
);

comment on table public.inquiry_retention_runs is
  'Aggregate evidence for committed owner/postgres inquiry purges. Contains no submitted inquiry content or inquiry identifiers.';

alter table public.inquiry_retention_runs enable row level security;
revoke all on table public.inquiry_retention_runs
  from public, anon, authenticated, service_role;

create function public.reject_inquiry_retention_run_mutation()
returns trigger
language plpgsql
set search_path = ''
as $function$
begin
  raise exception using
    errcode = '55000',
    message = 'Inquiry retention run evidence is append-only.';
end;
$function$;

create trigger inquiry_retention_runs_append_only
  before update or delete on public.inquiry_retention_runs
  for each row execute procedure public.reject_inquiry_retention_run_mutation();

revoke execute on function public.reject_inquiry_retention_run_mutation()
  from public, anon, authenticated, service_role;

-- Return only the minimum fields needed for monthly review. The explicit
-- timestamp makes a review repeatable; the function never chooses "now" or a
-- caller-specific retention period on the operator's behalf.
create function public.get_inquiry_retention_candidates(
  p_as_of timestamptz
)
returns table (
  inquiry_id uuid,
  created_at timestamptz,
  source text,
  status text,
  notification_status text
)
language plpgsql
stable
security invoker
set search_path = ''
as $function$
begin
  if p_as_of is null
    or p_as_of > pg_catalog.statement_timestamp() then
    raise exception using
      errcode = '22023',
      message = 'Invalid inquiry retention review time.';
  end if;

  return query
  select
    inquiry.id,
    inquiry.created_at,
    inquiry.source,
    inquiry.status,
    inquiry.notification_status
  from public.inquiries as inquiry
  where inquiry.created_at <= p_as_of - interval '12 months'
    and inquiry.retention_hold_reason is null
  order by inquiry.created_at, inquiry.id;
end;
$function$;

revoke execute on function public.get_inquiry_retention_candidates(timestamptz)
  from public, anon, authenticated, service_role;

-- Set or clear one approved hold without accepting free-form reasons or notes.
-- This is owner/postgres-only; the website and its service credential retain no
-- inquiry mutation authority.
create function public.set_inquiry_retention_hold(
  p_inquiry_id uuid,
  p_reason text
)
returns table (
  inquiry_id uuid,
  retention_hold_reason text,
  retention_hold_set_at timestamptz
)
language plpgsql
security invoker
set search_path = ''
as $function$
begin
  if p_inquiry_id is null
    or (
      p_reason is not null
      and p_reason not in ('active_service', 'legal', 'safety', 'dispute')
    ) then
    raise exception using
      errcode = '22023',
      message = 'Invalid inquiry retention hold.';
  end if;

  return query
  update public.inquiries as inquiry
  set
    retention_hold_reason = p_reason,
    retention_hold_set_at = case
      when p_reason is null then null
      else pg_catalog.clock_timestamp()
    end
  where inquiry.id = p_inquiry_id
  returning
    inquiry.id,
    inquiry.retention_hold_reason,
    inquiry.retention_hold_set_at;

  if not found then
    raise exception using
      errcode = 'P0002',
      message = 'Inquiry retention hold target was not found.';
  end if;
end;
$function$;

revoke execute on function public.set_inquiry_retention_hold(uuid, text)
  from public, anon, authenticated, service_role;

-- Delete only when the operator supplies the complete, exact candidate UUID set
-- returned for the same review timestamp. Any missing, duplicate, extra, newly
-- held, or otherwise changed candidate aborts the transaction before deletion.
-- The caller must rehearse this function inside a transaction that ends in
-- ROLLBACK before repeating the reviewed call in a separately committed run.
create function public.purge_inquiry_retention_candidates(
  p_as_of timestamptz,
  p_expected_ids uuid[],
  p_operator_email text
)
returns table (
  run_id uuid,
  deleted_inquiry_id uuid
)
language plpgsql
security invoker
set search_path = ''
set lock_timeout = '5s'
as $function$
declare
  actual_ids uuid[];
  deleted_rows integer;
  expected_ids uuid[];
  held_rows integer;
  purge_started_at timestamptz := pg_catalog.statement_timestamp();
  rate_limit_deleted_rows integer;
  recorded_run_id uuid;
begin
  if p_as_of is null
    or p_as_of > purge_started_at
    or p_expected_ids is null
    or pg_catalog.array_position(p_expected_ids, null) is not null
    or p_operator_email is distinct from 'admin@ghosthand.studio' then
    raise exception using
      errcode = '22023',
      message = 'Invalid inquiry retention purge scope.';
  end if;

  select coalesce(
    pg_catalog.array_agg(distinct expected.id order by expected.id),
    '{}'::uuid[]
  )
  into expected_ids
  from pg_catalog.unnest(p_expected_ids) as expected(id);

  if pg_catalog.cardinality(expected_ids)
    <> pg_catalog.cardinality(p_expected_ids) then
    raise exception using
      errcode = '22023',
      message = 'Inquiry retention purge IDs must be unique.';
  end if;

  -- Prevent concurrent hold changes or other inquiry writes between the exact
  -- set comparison and delete. New ordinary inquiries cannot be 12 months old,
  -- but this lock also protects owner-operated corrections and backfills.
  -- Match record_inquiry_submission's write order (limit row, then inquiry) so
  -- a live submission cannot form an avoidable cross-table deadlock cycle.
  lock table public.inquiry_submission_limits in share row exclusive mode;
  lock table public.inquiries in share row exclusive mode;

  select coalesce(
    pg_catalog.array_agg(inquiry.id order by inquiry.id),
    '{}'::uuid[]
  )
  into actual_ids
  from public.inquiries as inquiry
  where inquiry.created_at <= p_as_of - interval '12 months'
    and inquiry.retention_hold_reason is null;

  if actual_ids is distinct from expected_ids then
    raise exception using
      errcode = '40001',
      message = 'Inquiry retention candidate set changed; run a new review.';
  end if;

  select count(*)::integer
  into held_rows
  from public.inquiries as inquiry
  where inquiry.created_at <= p_as_of - interval '12 months'
    and inquiry.retention_hold_reason is not null;

  delete from public.inquiries as inquiry
  where inquiry.id = any(actual_ids)
    and inquiry.created_at <= p_as_of - interval '12 months'
    and inquiry.retention_hold_reason is null;

  get diagnostics deleted_rows = row_count;

  if deleted_rows <> pg_catalog.cardinality(actual_ids) then
    raise exception using
      errcode = '40001',
      message = 'Inquiry retention delete count changed; transaction aborted.';
  end if;

  -- Unlike migration 013's opportunistic cleanup, the monthly owner run also
  -- enforces the approved 30-day technical-record cutoff when no later inquiry
  -- arrives to trigger cleanup. Technical records use the actual purge start,
  -- not the caller-supplied inquiry review time, so a stale review timestamp
  -- cannot extend their retention.
  delete from public.inquiry_submission_limits as submission_limit
  where submission_limit.last_seen_at
    < purge_started_at - interval '30 days';

  get diagnostics rate_limit_deleted_rows = row_count;

  insert into public.inquiry_retention_runs (
    operator_email,
    reviewed_at,
    cutoff_at,
    rate_limit_cutoff_at,
    candidate_count,
    held_count,
    deleted_count,
    rate_limit_deleted_count,
    executed_at
  ) values (
    p_operator_email,
    p_as_of,
    p_as_of - interval '12 months',
    purge_started_at - interval '30 days',
    pg_catalog.cardinality(actual_ids),
    held_rows,
    deleted_rows,
    rate_limit_deleted_rows,
    purge_started_at
  )
  returning id into recorded_run_id;

  if pg_catalog.cardinality(actual_ids) = 0 then
    return query select recorded_run_id, null::uuid;
    return;
  end if;

  return query
  select recorded_run_id, deleted.id
  from pg_catalog.unnest(actual_ids) as deleted(id)
  order by deleted.id;
end;
$function$;

revoke execute on function public.purge_inquiry_retention_candidates(
  timestamptz,
  uuid[],
  text
)
  from public, anon, authenticated, service_role;

commit;
