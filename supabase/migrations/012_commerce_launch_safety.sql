-- Keep every deployment target, Stripe account, and mode in a separate commerce
-- namespace, reserve one active Checkout Session per
-- user/product/target/account/mode, and make refund reconciliation safe when
-- Stripe events arrive out of order.
--
-- This migration is intentionally unapplied until the hosted ledger and any
-- duplicate active rows have been audited. Stripe object IDs do not identify
-- the account that owns them, so ambiguous legacy commerce rows are rejected
-- rather than silently assigned to a sandbox or live account.

begin;

-- Fail quickly instead of waiting indefinitely behind an unexpected writer.
-- Sales remain closed during this controlled migration window.
set local lock_timeout = '5s';

-- Freeze every legacy commerce writer before auditing emptiness. Profile reads
-- may continue, but the deprecated unscoped Stripe customer column cannot be
-- populated between this audit and the new namespace becoming authoritative.
lock table public.profiles in share row exclusive mode;
lock table
  public.purchases,
  public.memberships,
  public.stripe_events
  in access exclusive mode;

do $$
begin
  if exists (select 1 from public.purchases limit 1)
    or exists (select 1 from public.memberships limit 1)
    or exists (select 1 from public.stripe_events limit 1)
    or exists (
      select 1
      from public.profiles
      where stripe_customer_id is not null
      limit 1
    ) then
    raise exception using
      message = 'Migration 012 cannot infer Stripe account ownership for legacy commerce rows.',
      hint = 'Reconcile each legacy row to an exact acct_ identifier before applying migration 012.';
  end if;
end
$$;

-- Financial records must survive an account-deletion request. The profile can
-- be anonymized under an owner-run privacy workflow, but it cannot cascade away
-- payment, refund, dispute, or subscription evidence.
alter table public.purchases
  drop constraint if exists purchases_user_id_fkey,
  add constraint purchases_user_id_fkey
    foreign key (user_id) references public.profiles(id) on delete restrict;

alter table public.memberships
  drop constraint if exists memberships_user_id_fkey,
  add constraint memberships_user_id_fkey
    foreign key (user_id) references public.profiles(id) on delete restrict;

alter table public.purchases
  -- The locked audit above requires this table to be empty. Migration 012 does
  -- not backfill or infer authority for a legacy row: an owner must reconcile
  -- every such row before this migration can run.
  add column deployment_target text not null,
  add column stripe_account_id text not null,
  add column stripe_livemode boolean not null,
  add column stripe_product_id text not null,
  add column stripe_price_id text not null,
  add column catalog_version text not null,
  add column currency text not null default 'usd';

alter table public.purchases
  drop constraint if exists purchases_stripe_checkout_session_id_key,
  drop constraint if exists purchases_stripe_payment_intent_id_key,
  drop constraint if exists purchases_stripe_checkout_session_mode_key,
  drop constraint if exists purchases_stripe_payment_intent_mode_key,
  drop constraint if exists purchases_stripe_checkout_session_target_account_mode_key,
  drop constraint if exists purchases_stripe_payment_intent_target_account_mode_key,
  drop constraint if exists purchases_deployment_target_check,
  drop constraint if exists purchases_stripe_account_id_format,
  drop constraint if exists purchases_stripe_product_id_format,
  drop constraint if exists purchases_stripe_price_id_format,
  drop constraint if exists purchases_status_check,
  drop constraint if exists purchases_currency_format;

alter table public.purchases
  add constraint purchases_stripe_checkout_session_target_account_mode_key
    unique (
      stripe_checkout_session_id,
      deployment_target,
      stripe_account_id,
      stripe_livemode
    ),
  add constraint purchases_stripe_payment_intent_target_account_mode_key
    unique (
      stripe_payment_intent_id,
      deployment_target,
      stripe_account_id,
      stripe_livemode
    ),
  add constraint purchases_deployment_target_check
    check (deployment_target in ('development', 'preview', 'production')),
  add constraint purchases_stripe_account_id_format
    check (stripe_account_id ~ '^acct_[a-zA-Z0-9]{8,}$'),
  add constraint purchases_stripe_product_id_format
    check (stripe_product_id ~ '^prod_[a-zA-Z0-9]{8,}$'),
  add constraint purchases_stripe_price_id_format
    check (stripe_price_id ~ '^price_[a-zA-Z0-9]{8,}$'),
  add constraint purchases_status_check
    check (status in ('active', 'refunded', 'cancelled', 'disputed')),
  add constraint purchases_currency_format
    check (currency ~ '^[a-z]{3}$');

alter table public.memberships
  add column deployment_target text not null,
  add column stripe_account_id text not null,
  add column stripe_livemode boolean not null;

alter table public.memberships
  drop constraint if exists memberships_stripe_subscription_id_key,
  drop constraint if exists memberships_stripe_subscription_mode_key,
  drop constraint if exists memberships_stripe_subscription_target_account_mode_key,
  drop constraint if exists memberships_deployment_target_check,
  drop constraint if exists memberships_stripe_account_id_format;

alter table public.memberships
  add constraint memberships_stripe_subscription_target_account_mode_key
    unique (
      stripe_subscription_id,
      deployment_target,
      stripe_account_id,
      stripe_livemode
    ),
  add constraint memberships_deployment_target_check
    check (deployment_target in ('development', 'preview', 'production')),
  add constraint memberships_stripe_account_id_format
    check (stripe_account_id ~ '^acct_[a-zA-Z0-9]{8,}$');

alter table public.stripe_events
  add column deployment_target text not null,
  add column stripe_account_id text not null,
  add column stripe_livemode boolean not null;

alter table public.stripe_events
  drop constraint if exists stripe_events_pkey,
  drop constraint if exists stripe_events_deployment_target_check,
  drop constraint if exists stripe_events_stripe_account_id_format;

alter table public.stripe_events
  add constraint stripe_events_pkey
    primary key (
      id,
      deployment_target,
      stripe_account_id,
      stripe_livemode
    ),
  add constraint stripe_events_deployment_target_check
    check (deployment_target in ('development', 'preview', 'production')),
  add constraint stripe_events_stripe_account_id_format
    check (stripe_account_id ~ '^acct_[a-zA-Z0-9]{8,}$');

create table public.stripe_customers (
  user_id uuid not null references public.profiles(id) on delete restrict,
  deployment_target text not null check (
    deployment_target in ('development', 'preview', 'production')
  ),
  stripe_account_id text not null check (
    stripe_account_id ~ '^acct_[a-zA-Z0-9]{8,}$'
  ),
  stripe_livemode boolean not null,
  stripe_customer_id text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (
    user_id,
    deployment_target,
    stripe_account_id,
    stripe_livemode
  ),
  unique (
    stripe_customer_id,
    deployment_target,
    stripe_account_id,
    stripe_livemode
  )
);

comment on column public.profiles.stripe_customer_id is
  'Deprecated unscoped value. Use public.stripe_customers with an exact deployment target, Stripe account ID, and mode.';

create table public.checkout_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete restrict,
  deployment_target text not null check (
    deployment_target in ('development', 'preview', 'production')
  ),
  product_type text not null check (
    product_type in ('lift_guide', 'pdf_download', 'membership')
  ),
  catalog_version text not null,
  checkout_attempt_id text not null check (
    checkout_attempt_id ~ '^[a-zA-Z0-9-]{16,80}$'
  ),
  stripe_account_id text not null check (
    stripe_account_id ~ '^acct_[a-zA-Z0-9]{8,}$'
  ),
  stripe_livemode boolean not null,
  stripe_product_id text not null check (
    stripe_product_id ~ '^prod_[a-zA-Z0-9]{8,}$'
  ),
  stripe_price_id text not null check (
    stripe_price_id ~ '^price_[a-zA-Z0-9]{8,}$'
  ),
  stripe_customer_id text,
  customer_email text not null,
  site_url text not null check (site_url ~ '^https?://[^/]+$'),
  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  fulfillment_source text check (
    fulfillment_source in ('webhook', 'authenticated_reconciliation')
  ),
  fulfilled_at timestamptz,
  reconciliation_attempt_count integer not null default 0 check (
    reconciliation_attempt_count between 0 and 3
  ),
  last_reconciliation_attempt_at timestamptz,
  status text not null default 'creating' check (
    status in (
      'creating',
      'open',
      'paid',
      'refunded',
      'disputed',
      'expired',
      'failed'
    )
  ),
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (fulfillment_source is null and fulfilled_at is null)
    or (fulfillment_source is not null and fulfilled_at is not null)
  ),
  unique (
    stripe_checkout_session_id,
    deployment_target,
    stripe_account_id,
    stripe_livemode
  ),
  unique (
    stripe_payment_intent_id,
    deployment_target,
    stripe_account_id,
    stripe_livemode
  )
);

create unique index checkout_orders_one_open_per_product_idx
  on public.checkout_orders (
    user_id,
    product_type,
    deployment_target,
    stripe_account_id,
    stripe_livemode
  )
  where status in ('creating', 'open');

create index checkout_orders_user_history_idx
  on public.checkout_orders (
    user_id,
    deployment_target,
    stripe_account_id,
    stripe_livemode,
    created_at desc
  );

-- Every trusted write must name the deployment target, Stripe account, and
-- mode explicitly; no missing field can silently become sandbox authority.

-- The Den is explicitly deferred for this launch. Migration 005's legacy
-- membership authority predates Stripe account/mode namespaces and would let
-- any active membership row unlock relationship data. Keep every member-side
-- Den policy and RPC closed until a later migration introduces an explicit,
-- environment-scoped membership authority.
create or replace function public.has_active_den_membership()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select false;
$$;

revoke all on function public.has_active_den_membership()
  from public, anon;
grant execute on function public.has_active_den_membership()
  to authenticated, service_role;

-- Journey delivery claiming also relied on the unscoped legacy membership
-- predicate. No automated Den delivery is allowed during the single-LIFT
-- launch; the future membership migration must replace this stub.
create or replace function public.claim_due_journey_deliveries(
  p_batch_size integer default 50
)
returns setof public.journey_deliveries
language plpgsql
security definer
set search_path = ''
as $$
begin
  return;
end;
$$;

revoke all on function public.claim_due_journey_deliveries(integer)
  from public, anon, authenticated;
grant execute on function public.claim_due_journey_deliveries(integer)
  to service_role;

drop trigger if exists stripe_customers_touch_updated_at
  on public.stripe_customers;
create trigger stripe_customers_touch_updated_at
  before update on public.stripe_customers
  for each row execute procedure public.touch_updated_at();

drop trigger if exists checkout_orders_touch_updated_at
  on public.checkout_orders;
create trigger checkout_orders_touch_updated_at
  before update on public.checkout_orders
  for each row execute procedure public.touch_updated_at();

alter table public.stripe_customers enable row level security;
alter table public.checkout_orders enable row level security;

-- Supabase projects no longer guarantee implicit PostgREST privileges for
-- tables created by migrations. Keep the legacy member/content tables on the
-- same explicit least-privilege boundary as the new commerce tables so a
-- fresh project behaves exactly like staging.
revoke all on table public.profiles
  from public, anon, authenticated, service_role;
revoke all on table public.purchases
  from public, anon, authenticated, service_role;
revoke all on table public.memberships
  from public, anon, authenticated, service_role;
revoke all on table public.courses
  from public, anon, authenticated, service_role;
revoke all on table public.lessons
  from public, anon, authenticated, service_role;
revoke all on table public.user_progress
  from public, anon, authenticated, service_role;
revoke all on table public.stripe_events
  from public, anon, authenticated, service_role;

alter table public.profiles enable row level security;
alter table public.purchases enable row level security;
alter table public.memberships enable row level security;
alter table public.courses enable row level security;
alter table public.lessons enable row level security;
alter table public.user_progress enable row level security;
alter table public.stripe_events enable row level security;

-- Signed-in members have no direct commerce-table access. Member entitlement
-- reads occur through the trusted server only after the current Auth user is
-- established, preventing development and Preview rows in shared staging from
-- being enumerated through PostgREST. Course and lesson reads remain admin-only
-- because their only authenticated policies are the administrator policies
-- from migration 002; member pages use the trusted server content layer after
-- an entitlement check.
grant select on table public.profiles to authenticated;
grant update (full_name) on table public.profiles to authenticated;
grant select on table public.courses to authenticated;
grant select on table public.lessons to authenticated;
grant select (
  user_id,
  lesson_id,
  completed,
  watched_until_second,
  updated_at
) on table public.user_progress to authenticated;
grant insert (
  user_id,
  lesson_id,
  completed,
  watched_until_second
) on table public.user_progress to authenticated;
grant update (
  user_id,
  lesson_id,
  completed,
  watched_until_second
) on table public.user_progress to authenticated;

-- Checkout, webhook reconciliation, protected content, and administrative
-- reads all use the service role. RLS is still enabled as a defense-in-depth
-- boundary for every browser role.
grant all on table public.profiles to service_role;
grant select, insert, update on table public.purchases to service_role;
grant select, insert, update on table public.memberships to service_role;
grant all on table public.courses to service_role;
grant all on table public.lessons to service_role;
grant all on table public.user_progress to service_role;
grant select, insert on table public.stripe_events to service_role;

-- These tables contain server-managed payment identities and order state.
-- Browser roles have no direct read or write authority.
revoke all on table public.stripe_customers
  from public, anon, authenticated, service_role;
revoke all on table public.checkout_orders
  from public, anon, authenticated, service_role;
grant select, insert, update on table public.stripe_customers to service_role;
grant select, insert, update on table public.checkout_orders to service_role;

commit;
