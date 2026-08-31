-- Add a durable, exact-namespace reconciliation queue for Checkout Sessions.
--
-- The three browser-triggered reconciliation attempts on checkout_orders remain
-- a separate recovery budget. Scheduled work uses expiring lease tokens,
-- append-only attempt evidence, database-controlled retry timing, and a durable
-- manual-review state. This migration creates no Stripe Event receipt because
-- only the signed webhook endpoint may write public.stripe_events.

begin;

-- Fail quickly rather than waiting behind an unexpected commerce writer. Sales
-- remain closed while this migration is reviewed and applied.
set local lock_timeout = '5s';

lock table public.checkout_orders in access exclusive mode;

-- A reconciliation job repeats the commerce namespace so claim queries remain
-- indexable and fail closed. The composite foreign key below prevents that copy
-- from drifting away from its authoritative checkout order.
alter table public.checkout_orders
  add constraint checkout_orders_id_target_account_mode_key
  unique (id, deployment_target, stripe_account_id, stripe_livemode);

alter table public.checkout_orders
  drop constraint if exists checkout_orders_fulfillment_source_check;

alter table public.checkout_orders
  add constraint checkout_orders_fulfillment_source_check check (
    fulfillment_source in (
      'webhook',
      'authenticated_reconciliation',
      'scheduled_reconciliation'
    )
  );

create table public.checkout_reconciliation_jobs (
  order_id uuid primary key,
  deployment_target text not null check (
    deployment_target in ('development', 'preview', 'production')
  ),
  stripe_account_id text not null check (
    stripe_account_id ~ '^acct_[a-zA-Z0-9]{8,}$'
  ),
  stripe_livemode boolean not null,
  state text not null default 'pending' check (
    state in (
      'pending',
      'leased',
      'retry_wait',
      'monitoring',
      'complete',
      'manual_review'
    )
  ),
  claim_count bigint not null default 0 check (claim_count >= 0),
  consecutive_failure_count smallint not null default 0 check (
    consecutive_failure_count between 0 and 8
  ),
  next_attempt_at timestamptz,
  claim_token uuid,
  claimed_at timestamptz,
  lease_expires_at timestamptz,
  last_attempt_at timestamptz,
  last_provider_checked_at timestamptz,
  last_outcome text check (
    last_outcome is null
    or last_outcome in (
      'claimed',
      'lease_expired',
      'verified_active',
      'fulfilled',
      'terminal',
      'not_ready',
      'retryable_error',
      'inconsistent',
      'manual_review',
      'exhausted'
    )
  ),
  last_error_code text check (
    last_error_code is null
    or last_error_code ~ '^[a-z][a-z0-9_]{0,63}$'
  ),
  alert_pending boolean not null default false,
  alert_required_at timestamptz,
  manual_review_reason text check (
    manual_review_reason is null
    or manual_review_reason ~ '^[a-z][a-z0-9_]{0,63}$'
  ),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (
    order_id,
    deployment_target,
    stripe_account_id,
    stripe_livemode
  ),
  constraint checkout_reconciliation_jobs_order_namespace_fkey
    foreign key (
      order_id,
      deployment_target,
      stripe_account_id,
      stripe_livemode
    ) references public.checkout_orders (
      id,
      deployment_target,
      stripe_account_id,
      stripe_livemode
    ) on delete restrict,
  constraint checkout_reconciliation_jobs_lease_shape check (
    (
      state = 'leased'
      and claim_token is not null
      and claimed_at is not null
      and lease_expires_at is not null
      and next_attempt_at is null
      and completed_at is null
    )
    or (
      state in ('pending', 'retry_wait', 'monitoring')
      and claim_token is null
      and claimed_at is null
      and lease_expires_at is null
      and next_attempt_at is not null
      and completed_at is null
    )
    or (
      state = 'complete'
      and claim_token is null
      and claimed_at is null
      and lease_expires_at is null
      and next_attempt_at is null
      and completed_at is not null
    )
    or (
      state = 'manual_review'
      and claim_token is null
      and claimed_at is null
      and lease_expires_at is null
      and next_attempt_at is null
      and completed_at is null
    )
  ),
  constraint checkout_reconciliation_jobs_alert_shape check (
    (
      state = 'manual_review'
      and alert_pending
      and alert_required_at is not null
      and manual_review_reason is not null
    )
    or (
      state <> 'manual_review'
      and not alert_pending
      and alert_required_at is null
      and manual_review_reason is null
    )
  )
);

comment on table public.checkout_reconciliation_jobs is
  'Durable exact-namespace Stripe reconciliation work. Browser reconciliation counters are intentionally separate.';
comment on column public.checkout_reconciliation_jobs.last_error_code is
  'Non-sensitive machine category only. Provider response bodies, customer data, and credentials are prohibited.';
comment on column public.checkout_reconciliation_jobs.alert_pending is
  'Durable signal that owner review and alert routing are required before this order may be retried.';

-- Each row is one immutable report, claim, or claim-closing event. A claim and
-- its one closing outcome are separate rows so a crashed lease remains visible
-- without updating history in place.
create table public.checkout_reconciliation_attempts (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null,
  deployment_target text not null check (
    deployment_target in ('development', 'preview', 'production')
  ),
  stripe_account_id text not null check (
    stripe_account_id ~ '^acct_[a-zA-Z0-9]{8,}$'
  ),
  stripe_livemode boolean not null,
  run_id uuid not null,
  mode text not null check (mode in ('report', 'repair')),
  claim_token uuid,
  claim_number bigint,
  outcome text not null check (
    outcome in (
      'reported',
      'claimed',
      'lease_expired',
      'verified_active',
      'fulfilled',
      'terminal',
      'not_ready',
      'retryable_error',
      'inconsistent',
      'manual_review',
      'exhausted'
    )
  ),
  error_code text check (
    error_code is null
    or error_code ~ '^[a-z][a-z0-9_]{0,63}$'
  ),
  recorded_at timestamptz not null default now(),
  constraint checkout_reconciliation_attempts_job_namespace_fkey
    foreign key (
      order_id,
      deployment_target,
      stripe_account_id,
      stripe_livemode
    ) references public.checkout_reconciliation_jobs (
      order_id,
      deployment_target,
      stripe_account_id,
      stripe_livemode
    ) on delete restrict,
  constraint checkout_reconciliation_attempts_shape check (
    (
      mode = 'report'
      and outcome = 'reported'
      and claim_token is null
      and claim_number is null
      and error_code is null
    )
    or (
      mode = 'repair'
      and outcome <> 'reported'
      and claim_token is not null
      and claim_number is not null
      and claim_number > 0
    )
  )
);

comment on table public.checkout_reconciliation_attempts is
  'Append-only reconciliation evidence. One claimed row and at most one closing row are retained per lease token.';
comment on column public.checkout_reconciliation_attempts.error_code is
  'Non-sensitive machine category only; never store raw provider or application exceptions.';

create index checkout_reconciliation_jobs_due_idx
  on public.checkout_reconciliation_jobs (
    deployment_target,
    stripe_account_id,
    stripe_livemode,
    next_attempt_at,
    order_id
  )
  where state in ('pending', 'retry_wait', 'monitoring');

create index checkout_reconciliation_jobs_expired_lease_idx
  on public.checkout_reconciliation_jobs (
    deployment_target,
    stripe_account_id,
    stripe_livemode,
    lease_expires_at,
    order_id
  )
  where state = 'leased';

create index checkout_reconciliation_jobs_manual_review_idx
  on public.checkout_reconciliation_jobs (
    deployment_target,
    stripe_account_id,
    stripe_livemode,
    updated_at,
    order_id
  )
  where state = 'manual_review';

create index checkout_reconciliation_attempts_order_history_idx
  on public.checkout_reconciliation_attempts (order_id, recorded_at desc);

create index checkout_reconciliation_attempts_run_idx
  on public.checkout_reconciliation_attempts (run_id, recorded_at);

create unique index checkout_reconciliation_attempts_report_once_idx
  on public.checkout_reconciliation_attempts (run_id, order_id)
  where mode = 'report' and outcome = 'reported';

create unique index checkout_reconciliation_attempts_claim_once_idx
  on public.checkout_reconciliation_attempts (order_id, claim_token)
  where mode = 'repair' and outcome = 'claimed';

create unique index checkout_reconciliation_attempts_close_once_idx
  on public.checkout_reconciliation_attempts (order_id, claim_token)
  where mode = 'repair' and outcome <> 'claimed';

-- This matches the trusted-server entitlement lookup used by member content.
create index purchases_exact_entitlement_idx
  on public.purchases (
    user_id,
    deployment_target,
    stripe_account_id,
    stripe_livemode,
    product_type,
    status
  );

create trigger checkout_reconciliation_jobs_touch_updated_at
  before update on public.checkout_reconciliation_jobs
  for each row execute procedure public.touch_updated_at();

create function public.reject_checkout_reconciliation_attempt_mutation()
returns trigger
language plpgsql
set search_path = ''
as $function$
begin
  raise exception using
    errcode = '55000',
    message = 'Checkout reconciliation attempt evidence is append-only.';
end;
$function$;

create trigger checkout_reconciliation_attempts_append_only
  before update or delete on public.checkout_reconciliation_attempts
  for each row execute procedure public.reject_checkout_reconciliation_attempt_mutation();

revoke execute on function public.reject_checkout_reconciliation_attempt_mutation()
  from public, anon, authenticated, service_role;

create function public.enqueue_checkout_reconciliation_job()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if tg_op = 'UPDATE'
    and old.stripe_checkout_session_id is not null
    and new.stripe_checkout_session_id
      is distinct from old.stripe_checkout_session_id then
    raise exception using
      errcode = '23514',
      message = 'A Checkout Session binding cannot be replaced.';
  end if;

  if new.stripe_checkout_session_id is null then
    return new;
  end if;

  insert into public.checkout_reconciliation_jobs (
    order_id,
    deployment_target,
    stripe_account_id,
    stripe_livemode,
    next_attempt_at
  )
  values (
    new.id,
    new.deployment_target,
    new.stripe_account_id,
    new.stripe_livemode,
    pg_catalog.clock_timestamp() + interval '2 minutes'
  )
  on conflict (order_id) do nothing;

  return new;
end;
$function$;

create trigger checkout_orders_enqueue_reconciliation
  after insert or update of stripe_checkout_session_id
  on public.checkout_orders
  for each row
  execute procedure public.enqueue_checkout_reconciliation_job();

revoke execute on function public.enqueue_checkout_reconciliation_job()
  from public, anon, authenticated, service_role;

-- Queue existing Session-bound orders without inferring provider state or
-- mutating commerce authority. The worker must retrieve Stripe before repair.
insert into public.checkout_reconciliation_jobs (
  order_id,
  deployment_target,
  stripe_account_id,
  stripe_livemode,
  next_attempt_at
)
select
  orders.id,
  orders.deployment_target,
  orders.stripe_account_id,
  orders.stripe_livemode,
  pg_catalog.clock_timestamp() + interval '2 minutes'
from public.checkout_orders as orders
where orders.stripe_checkout_session_id is not null
on conflict (order_id) do nothing;

alter table public.checkout_reconciliation_jobs enable row level security;
alter table public.checkout_reconciliation_attempts enable row level security;

revoke all on table public.checkout_reconciliation_jobs
  from public, anon, authenticated, service_role;
revoke all on table public.checkout_reconciliation_attempts
  from public, anon, authenticated, service_role;

-- Read-only with respect to jobs and commerce authority. The inserted
-- append-only report row makes each dry-run auditable without leasing work.
create function public.report_due_checkout_reconciliations(
  p_deployment_target text,
  p_stripe_account_id text,
  p_stripe_livemode boolean,
  p_run_id uuid,
  p_batch_size integer default 100
)
returns table (
  order_id uuid,
  user_id uuid,
  product_type text,
  catalog_version text,
  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  stripe_product_id text,
  stripe_price_id text,
  deployment_target text,
  stripe_account_id text,
  stripe_livemode boolean,
  order_status text,
  job_state text,
  claim_count bigint,
  consecutive_failure_count smallint,
  next_attempt_at timestamptz,
  lease_expires_at timestamptz,
  alert_pending boolean,
  manual_review_reason text
)
language plpgsql
security definer
set search_path = ''
as $function$
declare
  reported_at timestamptz := pg_catalog.clock_timestamp();
begin
  if p_deployment_target is null
    or p_deployment_target not in ('development', 'preview', 'production')
    or p_stripe_account_id is null
    or p_stripe_account_id !~ '^acct_[a-zA-Z0-9]{8,}$'
    or p_stripe_livemode is null
    or p_run_id is null
    or p_batch_size is null
    or p_batch_size not between 1 and 100 then
    raise exception using
      errcode = '22023',
      message = 'Invalid checkout reconciliation report scope.';
  end if;

  return query
  with candidates as materialized (
    select jobs.*
    from public.checkout_reconciliation_jobs as jobs
    where jobs.deployment_target = p_deployment_target
      and jobs.stripe_account_id = p_stripe_account_id
      and jobs.stripe_livemode = p_stripe_livemode
      and (
        (
          jobs.state in ('pending', 'retry_wait', 'monitoring')
          and jobs.next_attempt_at <= reported_at
        )
        or (
          jobs.state = 'leased'
          and jobs.lease_expires_at <= reported_at
        )
        or jobs.state = 'manual_review'
      )
    order by
      case
        when jobs.state = 'manual_review' then 0
        when jobs.state = 'leased' then 1
        when jobs.state = 'pending' then 2
        when jobs.state = 'retry_wait' then 3
        else 4
      end,
      coalesce(
        jobs.lease_expires_at,
        jobs.next_attempt_at,
        jobs.updated_at
      ),
      jobs.order_id
    limit p_batch_size
  ),
  recorded as (
    insert into public.checkout_reconciliation_attempts (
      order_id,
      deployment_target,
      stripe_account_id,
      stripe_livemode,
      run_id,
      mode,
      outcome,
      recorded_at
    )
    select
      candidates.order_id,
      candidates.deployment_target,
      candidates.stripe_account_id,
      candidates.stripe_livemode,
      p_run_id,
      'report',
      'reported',
      reported_at
    from candidates
    on conflict do nothing
    returning checkout_reconciliation_attempts.order_id
  )
  select
    orders.id,
    orders.user_id,
    orders.product_type,
    orders.catalog_version,
    orders.stripe_checkout_session_id,
    orders.stripe_payment_intent_id,
    orders.stripe_product_id,
    orders.stripe_price_id,
    orders.deployment_target,
    orders.stripe_account_id,
    orders.stripe_livemode,
    orders.status,
    candidates.state,
    candidates.claim_count,
    candidates.consecutive_failure_count,
    candidates.next_attempt_at,
    candidates.lease_expires_at,
    candidates.alert_pending,
    candidates.manual_review_reason
  from candidates
  join public.checkout_orders as orders
    on orders.id = candidates.order_id
    and orders.deployment_target = candidates.deployment_target
    and orders.stripe_account_id = candidates.stripe_account_id
    and orders.stripe_livemode = candidates.stripe_livemode
  order by candidates.order_id;
end;
$function$;

revoke execute on function public.report_due_checkout_reconciliations(
  text,
  text,
  boolean,
  uuid,
  integer
)
  from public, anon, authenticated, service_role;
grant execute on function public.report_due_checkout_reconciliations(
  text,
  text,
  boolean,
  uuid,
  integer
)
  to service_role;

-- Operational status is separate from report mode: reading the admin queue
-- must not manufacture report evidence or lease work. Customer and Stripe
-- identifiers are intentionally absent from this result.
create function public.get_checkout_reconciliation_status(
  p_deployment_target text,
  p_stripe_account_id text,
  p_stripe_livemode boolean,
  p_limit integer default 50
)
returns table (
  order_id uuid,
  state text,
  claim_count bigint,
  consecutive_failure_count smallint,
  next_attempt_at timestamptz,
  last_attempt_at timestamptz,
  last_provider_checked_at timestamptz,
  last_outcome text,
  last_error_code text,
  alert_pending boolean,
  alert_required_at timestamptz,
  manual_review_reason text,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if p_deployment_target is null
    or p_deployment_target not in ('development', 'preview', 'production')
    or p_stripe_account_id is null
    or p_stripe_account_id !~ '^acct_[a-zA-Z0-9]{8,}$'
    or p_stripe_livemode is null
    or p_limit is null
    or p_limit not between 1 and 100 then
    raise exception using
      errcode = '22023',
      message = 'Invalid checkout reconciliation status scope.';
  end if;

  return query
  select
    jobs.order_id,
    jobs.state,
    jobs.claim_count,
    jobs.consecutive_failure_count,
    jobs.next_attempt_at,
    jobs.last_attempt_at,
    jobs.last_provider_checked_at,
    jobs.last_outcome,
    jobs.last_error_code,
    jobs.alert_pending,
    jobs.alert_required_at,
    jobs.manual_review_reason,
    jobs.updated_at
  from public.checkout_reconciliation_jobs as jobs
  where jobs.deployment_target = p_deployment_target
    and jobs.stripe_account_id = p_stripe_account_id
    and jobs.stripe_livemode = p_stripe_livemode
  order by
    case
      when jobs.state = 'manual_review' then 0
      when jobs.state = 'leased' then 1
      when jobs.state = 'pending' then 2
      when jobs.state = 'retry_wait' then 3
      when jobs.state = 'monitoring' then 4
      else 5
    end,
    coalesce(jobs.next_attempt_at, jobs.lease_expires_at, jobs.updated_at),
    jobs.order_id
  limit p_limit;
end;
$function$;

revoke execute on function public.get_checkout_reconciliation_status(
  text,
  text,
  boolean,
  integer
)
  from public, anon, authenticated, service_role;
grant execute on function public.get_checkout_reconciliation_status(
  text,
  text,
  boolean,
  integer
)
  to service_role;

-- Reclaim expired leases first, then lease due work with SKIP LOCKED. Provider
-- calls occur after this transaction, so the opaque token is the completion CAS.
create function public.claim_due_checkout_reconciliations(
  p_deployment_target text,
  p_stripe_account_id text,
  p_stripe_livemode boolean,
  p_run_id uuid,
  p_batch_size integer default 10,
  p_lease_seconds integer default 120
)
returns table (
  order_id uuid,
  claim_token uuid,
  claim_number bigint,
  user_id uuid,
  product_type text,
  catalog_version text,
  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  stripe_product_id text,
  stripe_price_id text,
  deployment_target text,
  stripe_account_id text,
  stripe_livemode boolean,
  order_status text,
  expires_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $function$
declare
  claimed_at_value timestamptz := pg_catalog.clock_timestamp();
  expired_job record;
  new_failure_count smallint;
  retry_at timestamptz;
begin
  if p_deployment_target is null
    or p_deployment_target not in ('development', 'preview', 'production')
    or p_stripe_account_id is null
    or p_stripe_account_id !~ '^acct_[a-zA-Z0-9]{8,}$'
    or p_stripe_livemode is null
    or p_run_id is null
    or p_batch_size is null
    or p_batch_size not between 1 and 25
    or p_lease_seconds is null
    or p_lease_seconds not between 30 and 300 then
    raise exception using
      errcode = '22023',
      message = 'Invalid checkout reconciliation claim scope.';
  end if;

  for expired_job in
    select jobs.*
    from public.checkout_reconciliation_jobs as jobs
    where jobs.deployment_target = p_deployment_target
      and jobs.stripe_account_id = p_stripe_account_id
      and jobs.stripe_livemode = p_stripe_livemode
      and jobs.state = 'leased'
      and jobs.lease_expires_at <= claimed_at_value
    order by jobs.lease_expires_at, jobs.order_id
    limit p_batch_size
    for update skip locked
  loop
    new_failure_count := least(
      expired_job.consecutive_failure_count + 1,
      8
    )::smallint;

    retry_at := case new_failure_count
      when 1 then claimed_at_value + interval '1 minute'
      when 2 then claimed_at_value + interval '2 minutes'
      when 3 then claimed_at_value + interval '4 minutes'
      when 4 then claimed_at_value + interval '8 minutes'
      when 5 then claimed_at_value + interval '16 minutes'
      when 6 then claimed_at_value + interval '32 minutes'
      when 7 then claimed_at_value + interval '1 hour'
      else null
    end;

    insert into public.checkout_reconciliation_attempts (
      order_id,
      deployment_target,
      stripe_account_id,
      stripe_livemode,
      run_id,
      mode,
      claim_token,
      claim_number,
      outcome,
      error_code,
      recorded_at
    ) values (
      expired_job.order_id,
      expired_job.deployment_target,
      expired_job.stripe_account_id,
      expired_job.stripe_livemode,
      p_run_id,
      'repair',
      expired_job.claim_token,
      expired_job.claim_count,
      case when new_failure_count = 8 then 'exhausted' else 'lease_expired' end,
      'lease_expired',
      claimed_at_value
    );

    update public.checkout_reconciliation_jobs
    set
      state = case
        when new_failure_count = 8 then 'manual_review'
        else 'retry_wait'
      end,
      consecutive_failure_count = new_failure_count,
      next_attempt_at = retry_at,
      claim_token = null,
      claimed_at = null,
      lease_expires_at = null,
      last_outcome = case
        when new_failure_count = 8 then 'exhausted'
        else 'lease_expired'
      end,
      last_error_code = 'lease_expired',
      alert_pending = new_failure_count = 8,
      alert_required_at = case
        when new_failure_count = 8 then claimed_at_value
        else null
      end,
      manual_review_reason = case
        when new_failure_count = 8 then 'retry_exhausted'
        else null
      end
    where checkout_reconciliation_jobs.order_id = expired_job.order_id
      and checkout_reconciliation_jobs.state = 'leased'
      and checkout_reconciliation_jobs.claim_token = expired_job.claim_token;
  end loop;

  return query
  with due as materialized (
    select jobs.order_id
    from public.checkout_reconciliation_jobs as jobs
    join public.checkout_orders as orders
      on orders.id = jobs.order_id
      and orders.deployment_target = jobs.deployment_target
      and orders.stripe_account_id = jobs.stripe_account_id
      and orders.stripe_livemode = jobs.stripe_livemode
    where jobs.deployment_target = p_deployment_target
      and jobs.stripe_account_id = p_stripe_account_id
      and jobs.stripe_livemode = p_stripe_livemode
      and jobs.state in ('pending', 'retry_wait', 'monitoring')
      and jobs.next_attempt_at <= claimed_at_value
      and orders.stripe_checkout_session_id is not null
    order by
      case jobs.state
        when 'pending' then 0
        when 'retry_wait' then 1
        else 2
      end,
      jobs.next_attempt_at,
      jobs.order_id
    limit p_batch_size
    for update of jobs skip locked
  ),
  claimed as (
    update public.checkout_reconciliation_jobs as jobs
    set
      state = 'leased',
      claim_count = jobs.claim_count + 1,
      next_attempt_at = null,
      claim_token = gen_random_uuid(),
      claimed_at = claimed_at_value,
      lease_expires_at = claimed_at_value
        + (p_lease_seconds * interval '1 second'),
      last_attempt_at = claimed_at_value,
      last_outcome = 'claimed',
      last_error_code = null,
      alert_pending = false,
      alert_required_at = null,
      manual_review_reason = null
    from due
    where jobs.order_id = due.order_id
    returning jobs.*
  ),
  recorded as (
    insert into public.checkout_reconciliation_attempts (
      order_id,
      deployment_target,
      stripe_account_id,
      stripe_livemode,
      run_id,
      mode,
      claim_token,
      claim_number,
      outcome,
      recorded_at
    )
    select
      claimed.order_id,
      claimed.deployment_target,
      claimed.stripe_account_id,
      claimed.stripe_livemode,
      p_run_id,
      'repair',
      claimed.claim_token,
      claimed.claim_count,
      'claimed',
      claimed_at_value
    from claimed
    returning
      checkout_reconciliation_attempts.order_id,
      checkout_reconciliation_attempts.claim_token
  )
  select
    claimed.order_id,
    claimed.claim_token,
    claimed.claim_count,
    orders.user_id,
    orders.product_type,
    orders.catalog_version,
    orders.stripe_checkout_session_id,
    orders.stripe_payment_intent_id,
    orders.stripe_product_id,
    orders.stripe_price_id,
    orders.deployment_target,
    orders.stripe_account_id,
    orders.stripe_livemode,
    orders.status,
    orders.expires_at
  from claimed
  join recorded
    on recorded.order_id = claimed.order_id
    and recorded.claim_token = claimed.claim_token
  join public.checkout_orders as orders
    on orders.id = claimed.order_id
    and orders.deployment_target = claimed.deployment_target
    and orders.stripe_account_id = claimed.stripe_account_id
    and orders.stripe_livemode = claimed.stripe_livemode
  order by claimed.order_id;
end;
$function$;

revoke execute on function public.claim_due_checkout_reconciliations(
  text,
  text,
  boolean,
  uuid,
  integer,
  integer
)
  from public, anon, authenticated, service_role;
grant execute on function public.claim_due_checkout_reconciliations(
  text,
  text,
  boolean,
  uuid,
  integer,
  integer
)
  to service_role;

-- Finish only the exact currently leased token. Provider verification happens
-- in trusted server code; this function validates the resulting database state
-- before an active or terminal claim may leave the retry queue.
create function public.finish_checkout_reconciliation_claim(
  p_order_id uuid,
  p_claim_token uuid,
  p_outcome text,
  p_error_code text default null
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $function$
declare
  job public.checkout_reconciliation_jobs%rowtype;
  checkout_order public.checkout_orders%rowtype;
  finished_at_value timestamptz := pg_catalog.clock_timestamp();
  matching_purchase_count integer := 0;
  coherent_purchase_count integer := 0;
  database_coherent boolean := false;
  effective_outcome text := p_outcome;
  effective_error_code text := p_error_code;
  effective_state text;
  effective_next_attempt_at timestamptz;
  effective_failure_count smallint;
  effective_alert_pending boolean := false;
  effective_alert_required_at timestamptz;
  effective_manual_review_reason text;
begin
  if p_order_id is null
    or p_claim_token is null
    or p_outcome is null
    or p_outcome not in (
      'verified_active',
      'fulfilled',
      'terminal',
      'not_ready',
      'retryable_error',
      'inconsistent',
      'manual_review'
    )
    or (
      p_error_code is not null
      and p_error_code !~ '^[a-z][a-z0-9_]{0,63}$'
    )
    or (
      p_outcome in ('verified_active', 'fulfilled', 'terminal', 'not_ready')
      and p_error_code is not null
    )
    or (
      p_outcome in ('retryable_error', 'inconsistent', 'manual_review')
      and p_error_code is null
    ) then
    raise exception using
      errcode = '22023',
      message = 'Invalid checkout reconciliation completion.';
  end if;

  select jobs.*
  into job
  from public.checkout_reconciliation_jobs as jobs
  where jobs.order_id = p_order_id
    and jobs.state = 'leased'
    and jobs.claim_token = p_claim_token
  for update;

  if not found then
    return false;
  end if;

  select orders.*
  into strict checkout_order
  from public.checkout_orders as orders
  where orders.id = job.order_id
    and orders.deployment_target = job.deployment_target
    and orders.stripe_account_id = job.stripe_account_id
    and orders.stripe_livemode = job.stripe_livemode;

  select
    count(*),
    count(*) filter (
      where purchases.user_id = checkout_order.user_id
        and purchases.product_type = checkout_order.product_type
        and purchases.catalog_version = checkout_order.catalog_version
        and purchases.stripe_product_id = checkout_order.stripe_product_id
        and purchases.stripe_price_id = checkout_order.stripe_price_id
        and purchases.stripe_checkout_session_id
          = checkout_order.stripe_checkout_session_id
        and purchases.stripe_payment_intent_id
          = checkout_order.stripe_payment_intent_id
    )
  into matching_purchase_count, coherent_purchase_count
  from public.purchases as purchases
  where purchases.deployment_target = checkout_order.deployment_target
    and purchases.stripe_account_id = checkout_order.stripe_account_id
    and purchases.stripe_livemode = checkout_order.stripe_livemode
    and (
      purchases.stripe_checkout_session_id
        = checkout_order.stripe_checkout_session_id
      or (
        checkout_order.stripe_payment_intent_id is not null
        and purchases.stripe_payment_intent_id
          = checkout_order.stripe_payment_intent_id
      )
    );

  if p_outcome in ('verified_active', 'fulfilled') then
    database_coherent :=
      checkout_order.status = 'paid'
      and checkout_order.stripe_checkout_session_id is not null
      and checkout_order.stripe_payment_intent_id is not null
      and checkout_order.fulfillment_source in (
        'webhook',
        'authenticated_reconciliation',
        'scheduled_reconciliation'
      )
      and checkout_order.fulfilled_at is not null
      and matching_purchase_count = 1
      and coherent_purchase_count = 1
      and exists (
        select 1
        from public.purchases as purchases
        where purchases.deployment_target = checkout_order.deployment_target
          and purchases.stripe_account_id = checkout_order.stripe_account_id
          and purchases.stripe_livemode = checkout_order.stripe_livemode
          and purchases.stripe_checkout_session_id
            = checkout_order.stripe_checkout_session_id
          and purchases.stripe_payment_intent_id
            = checkout_order.stripe_payment_intent_id
          and purchases.status = 'active'
      );
  elsif p_outcome = 'terminal' then
    database_coherent := (
      checkout_order.status = 'expired'
      and checkout_order.stripe_payment_intent_id is null
      and checkout_order.fulfillment_source is null
      and checkout_order.fulfilled_at is null
      and matching_purchase_count = 0
    ) or (
      checkout_order.status = 'refunded'
      and matching_purchase_count = 1
      and coherent_purchase_count = 1
      and exists (
        select 1
        from public.purchases as purchases
        where purchases.deployment_target = checkout_order.deployment_target
          and purchases.stripe_account_id = checkout_order.stripe_account_id
          and purchases.stripe_livemode = checkout_order.stripe_livemode
          and purchases.stripe_checkout_session_id
            = checkout_order.stripe_checkout_session_id
          and purchases.stripe_payment_intent_id
            = checkout_order.stripe_payment_intent_id
          and purchases.status = 'refunded'
      )
    ) or (
      checkout_order.status = 'disputed'
      and matching_purchase_count = 1
      and coherent_purchase_count = 1
      and exists (
        select 1
        from public.purchases as purchases
        where purchases.deployment_target = checkout_order.deployment_target
          and purchases.stripe_account_id = checkout_order.stripe_account_id
          and purchases.stripe_livemode = checkout_order.stripe_livemode
          and purchases.stripe_checkout_session_id
            = checkout_order.stripe_checkout_session_id
          and purchases.stripe_payment_intent_id
            = checkout_order.stripe_payment_intent_id
          and purchases.status = 'disputed'
      )
    ) or (
      checkout_order.status = 'paid'
      and checkout_order.fulfillment_source in (
        'webhook',
        'authenticated_reconciliation',
        'scheduled_reconciliation'
      )
      and checkout_order.fulfilled_at is not null
      and matching_purchase_count = 1
      and coherent_purchase_count = 1
      and exists (
        select 1
        from public.purchases as purchases
        where purchases.deployment_target = checkout_order.deployment_target
          and purchases.stripe_account_id = checkout_order.stripe_account_id
          and purchases.stripe_livemode = checkout_order.stripe_livemode
          and purchases.stripe_checkout_session_id
            = checkout_order.stripe_checkout_session_id
          and purchases.stripe_payment_intent_id
            = checkout_order.stripe_payment_intent_id
          and purchases.status = 'cancelled'
      )
    );
  end if;

  if p_outcome in ('verified_active', 'fulfilled') and not database_coherent then
    effective_outcome := 'inconsistent';
    effective_error_code := 'database_state_inconsistent';
  elsif p_outcome = 'terminal' and not database_coherent then
    effective_outcome := 'inconsistent';
    effective_error_code := 'database_state_inconsistent';
  elsif p_outcome = 'not_ready'
    and checkout_order.status not in ('creating', 'open') then
    effective_outcome := 'inconsistent';
    effective_error_code := 'database_state_inconsistent';
  end if;

  if effective_outcome in ('verified_active', 'fulfilled') then
    effective_state := 'monitoring';
    effective_next_attempt_at := finished_at_value + interval '24 hours';
    effective_failure_count := 0;
  elsif effective_outcome = 'terminal' then
    effective_state := 'complete';
    effective_next_attempt_at := null;
    effective_failure_count := 0;
  elsif effective_outcome = 'not_ready' then
    effective_state := 'retry_wait';
    effective_next_attempt_at := greatest(
      finished_at_value + interval '1 minute',
      least(
        checkout_order.expires_at + interval '2 minutes',
        finished_at_value + interval '15 minutes'
      )
    );
    effective_failure_count := 0;
  elsif effective_outcome = 'retryable_error' then
    effective_failure_count := least(
      job.consecutive_failure_count + 1,
      8
    )::smallint;

    if effective_failure_count = 8 then
      effective_state := 'manual_review';
      effective_next_attempt_at := null;
      effective_outcome := 'exhausted';
      effective_alert_pending := true;
      effective_alert_required_at := finished_at_value;
      effective_manual_review_reason := 'retry_exhausted';
    else
      effective_state := 'retry_wait';
      effective_next_attempt_at := case effective_failure_count
        when 1 then finished_at_value + interval '1 minute'
        when 2 then finished_at_value + interval '2 minutes'
        when 3 then finished_at_value + interval '4 minutes'
        when 4 then finished_at_value + interval '8 minutes'
        when 5 then finished_at_value + interval '16 minutes'
        when 6 then finished_at_value + interval '32 minutes'
        else finished_at_value + interval '1 hour'
      end;
    end if;
  else
    effective_state := 'manual_review';
    effective_next_attempt_at := null;
    effective_failure_count := job.consecutive_failure_count;
    effective_alert_pending := true;
    effective_alert_required_at := finished_at_value;
    effective_manual_review_reason := effective_error_code;
  end if;

  insert into public.checkout_reconciliation_attempts (
    order_id,
    deployment_target,
    stripe_account_id,
    stripe_livemode,
    run_id,
    mode,
    claim_token,
    claim_number,
    outcome,
    error_code,
    recorded_at
  ) values (
    job.order_id,
    job.deployment_target,
    job.stripe_account_id,
    job.stripe_livemode,
    (
      select attempts.run_id
      from public.checkout_reconciliation_attempts as attempts
      where attempts.order_id = job.order_id
        and attempts.claim_token = job.claim_token
        and attempts.mode = 'repair'
        and attempts.outcome = 'claimed'
    ),
    'repair',
    job.claim_token,
    job.claim_count,
    effective_outcome,
    effective_error_code,
    finished_at_value
  );

  update public.checkout_reconciliation_jobs
  set
    state = effective_state,
    consecutive_failure_count = effective_failure_count,
    next_attempt_at = effective_next_attempt_at,
    claim_token = null,
    claimed_at = null,
    lease_expires_at = null,
    last_provider_checked_at = case
      when p_outcome = 'retryable_error'
        then checkout_reconciliation_jobs.last_provider_checked_at
      else finished_at_value
    end,
    last_outcome = effective_outcome,
    last_error_code = effective_error_code,
    alert_pending = effective_alert_pending,
    alert_required_at = effective_alert_required_at,
    manual_review_reason = effective_manual_review_reason,
    completed_at = case
      when effective_state = 'complete' then finished_at_value
      else null
    end
  where checkout_reconciliation_jobs.order_id = job.order_id
    and checkout_reconciliation_jobs.state = 'leased'
    and checkout_reconciliation_jobs.claim_token = job.claim_token;

  return true;
end;
$function$;

revoke execute on function public.finish_checkout_reconciliation_claim(
  uuid,
  uuid,
  text,
  text
)
  from public, anon, authenticated, service_role;
grant execute on function public.finish_checkout_reconciliation_claim(
  uuid,
  uuid,
  text,
  text
)
  to service_role;

commit;
