-- Persist public website inquiries before attempting any optional notification.
--
-- Browser roles intentionally receive no table privileges or RLS policies.
-- The public contact route writes through the server-only service role.

begin;

-- Fail quickly rather than waiting indefinitely behind unexpected DDL or
-- table writers during the controlled staging migration window.
set local lock_timeout = '5s';

create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null unique,
  payload_digest text not null check (
    payload_digest ~ '^[0-9a-f]{64}$'
  ),
  source text not null default 'website-inquiry' check (
    source in (
      'booking-request',
      'contact-page',
      'journal-newsletter',
      'retreat-partnership-inquiry',
      'website-inquiry'
    )
  ),
  name text not null check (
    char_length(btrim(name)) between 1 and 120
  ),
  email text not null check (
    char_length(btrim(email)) between 3 and 320
  ),
  message text not null check (
    char_length(btrim(message)) between 1 and 5000
  ),
  booking_preference text check (
    booking_preference is null or char_length(booking_preference) <= 500
  ),
  date_preference text check (
    date_preference is null or char_length(date_preference) <= 500
  ),
  event_date text check (
    event_date is null or char_length(event_date) <= 500
  ),
  format text check (
    format is null or char_length(format) <= 500
  ),
  guest_count text check (
    guest_count is null or char_length(guest_count) <= 500
  ),
  group_size text check (
    group_size is null or char_length(group_size) <= 500
  ),
  interests text check (
    interests is null or char_length(interests) <= 500
  ),
  location text check (
    location is null or char_length(location) <= 500
  ),
  organization text check (
    organization is null or char_length(organization) <= 500
  ),
  phone text check (
    phone is null or char_length(phone) <= 500
  ),
  preferred_date text check (
    preferred_date is null or char_length(preferred_date) <= 500
  ),
  preferred_window text check (
    preferred_window is null or char_length(preferred_window) <= 500
  ),
  service text check (
    service is null or char_length(service) <= 500
  ),
  service_slug text check (
    service_slug is null or char_length(service_slug) <= 500
  ),
  services text check (
    services is null or char_length(services) <= 500
  ),
  subject text check (
    subject is null or char_length(subject) <= 500
  ),
  time_zone text check (
    time_zone is null or char_length(time_zone) <= 500
  ),
  status text not null default 'received' check (
    status in ('received', 'in_review', 'responded', 'closed', 'spam')
  ),
  notification_status text not null default 'unattempted' check (
    notification_status in (
      'unattempted',
      'attempting',
      'accepted',
      'failed',
      'not_configured',
      'audit_unknown'
    )
  ),
  notification_error_code text check (
    notification_error_code is null
    or notification_error_code in (
      'configuration_missing',
      'claim_outcome_unknown',
      'network_outcome_unknown',
      'provider_rejected',
      'provider_receipt_missing'
    )
  ),
  notification_attempted_at timestamptz,
  notification_accepted_at timestamptz,
  notification_provider_id text check (
    notification_provider_id is null
    or char_length(notification_provider_id) between 1 and 255
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint inquiries_notification_audit check (
    (
      (
        notification_status = 'attempting'
        and notification_attempted_at is not null
        and notification_accepted_at is null
        and notification_provider_id is null
        and notification_error_code is null
      )
      or (
        notification_status = 'accepted'
        and notification_attempted_at is not null
        and notification_accepted_at is not null
        and notification_provider_id is not null
        and notification_error_code is null
      )
      or (
        notification_status = 'failed'
        and notification_attempted_at is not null
        and notification_accepted_at is null
        and notification_provider_id is null
        and notification_error_code = 'provider_rejected'
      )
      or (
        notification_status = 'not_configured'
        and notification_attempted_at is not null
        and notification_accepted_at is null
        and notification_provider_id is null
        and notification_error_code = 'configuration_missing'
      )
      or (
        notification_status = 'audit_unknown'
        and notification_attempted_at is not null
        and notification_accepted_at is null
        and notification_provider_id is null
        and notification_error_code in (
          'claim_outcome_unknown',
          'network_outcome_unknown',
          'provider_receipt_missing'
        )
      )
      or (
        notification_status = 'unattempted'
        and notification_attempted_at is null
        and notification_accepted_at is null
        and notification_provider_id is null
        and notification_error_code is null
      )
    ) is true
  )
);

-- One privacy-preserving row per HMAC-pseudonymized client address. The raw
-- address and the secret used to derive this value never enter the database.
create table public.inquiry_submission_limits (
  fingerprint text primary key check (
    fingerprint ~ '^[0-9a-f]{64}$'
  ),
  window_started_at timestamptz not null default now(),
  submission_count integer not null default 1 check (
    submission_count between 1 and 20
  ),
  last_seen_at timestamptz not null default now()
);

comment on table public.inquiries is
  'Server-recorded website inquiries. Persistence is the delivery boundary; email is a best-effort notification.';
comment on column public.inquiries.payload_digest is
  'Non-authoritative server HMAC evidence. Retry equality compares canonical stored fields so secret rotation cannot invalidate a receipt.';
comment on column public.inquiries.notification_error_code is
  'Non-sensitive operational category only. Provider response bodies and credentials are never stored.';
comment on column public.inquiries.notification_provider_id is
  'Provider acceptance receipt only. This is not evidence of mailbox delivery.';
comment on table public.inquiry_submission_limits is
  'Durable public-inquiry abuse control. Stores only a keyed HMAC fingerprint; never a raw network address.';

create index inquiries_work_queue_idx
  on public.inquiries (status, created_at desc);
create index inquiries_notification_queue_idx
  on public.inquiries (notification_status, created_at desc)
  where notification_status <> 'accepted';
create index inquiry_submission_limits_last_seen_idx
  on public.inquiry_submission_limits (last_seen_at);

create trigger inquiries_touch_updated_at
  before update on public.inquiries
  for each row execute procedure public.touch_updated_at();

alter table public.inquiries enable row level security;
alter table public.inquiry_submission_limits enable row level security;

-- No browser-facing policy is created. Only trusted server code may access
-- inquiry content, including for later admin review or notification retries.
revoke all on table public.inquiries
  from public, anon, authenticated, service_role;
grant select on table public.inquiries to service_role;
revoke all on table public.inquiry_submission_limits
  from public, anon, authenticated, service_role;

-- Idempotently persist one inquiry and claim its one-hour submission slot in
-- the same transaction. A retry with the same client-generated submission ID
-- returns the existing receipt without consuming another rate slot. Refusing a
-- claim does not extend the window or leave behind an unrecorded claim.
create function public.record_inquiry_submission(
  p_submission_id uuid,
  p_fingerprint text,
  p_payload_digest text,
  p_limit integer,
  p_source text,
  p_name text,
  p_email text,
  p_message text,
  p_booking_preference text,
  p_date_preference text,
  p_event_date text,
  p_format text,
  p_guest_count text,
  p_group_size text,
  p_interests text,
  p_location text,
  p_organization text,
  p_phone text,
  p_preferred_date text,
  p_preferred_window text,
  p_service text,
  p_service_slug text,
  p_services text,
  p_subject text,
  p_time_zone text
)
returns table (
  inquiry_id uuid,
  created boolean,
  rate_limited boolean,
  payload_matches boolean,
  notification_status text,
  notification_error_code text
)
language plpgsql
security definer
set search_path = ''
as $function$
declare
  claimed_count integer;
  claimed_at timestamptz := pg_catalog.statement_timestamp();
  existing_inquiry_id uuid;
  existing_payload_matches boolean;
  existing_notification_status text;
  existing_notification_error_code text;
  recorded_inquiry_id uuid;
begin
  if p_submission_id is null
    or p_fingerprint is null
    or p_fingerprint !~ '^[0-9a-f]{64}$'
    or p_payload_digest is null
    or p_payload_digest !~ '^[0-9a-f]{64}$'
    or p_limit is null
    or p_limit not between 1 and 20 then
    raise exception using
      errcode = '22023',
      message = 'Invalid inquiry rate-limit claim.';
  end if;

  -- Serialize concurrent retries for this logical submission. The lock key is
  -- a one-way PostgreSQL hash of the random UUID, not submitted PII.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_submission_id::text, 0)
  );

  select
    i.id,
    (
      i.source is not distinct from p_source
      and i.name is not distinct from p_name
      and i.email is not distinct from p_email
      and i.message is not distinct from p_message
      and i.booking_preference is not distinct from p_booking_preference
      and i.date_preference is not distinct from p_date_preference
      and i.event_date is not distinct from p_event_date
      and i.format is not distinct from p_format
      and i.guest_count is not distinct from p_guest_count
      and i.group_size is not distinct from p_group_size
      and i.interests is not distinct from p_interests
      and i.location is not distinct from p_location
      and i.organization is not distinct from p_organization
      and i.phone is not distinct from p_phone
      and i.preferred_date is not distinct from p_preferred_date
      and i.preferred_window is not distinct from p_preferred_window
      and i.service is not distinct from p_service
      and i.service_slug is not distinct from p_service_slug
      and i.services is not distinct from p_services
      and i.subject is not distinct from p_subject
      and i.time_zone is not distinct from p_time_zone
    ),
    i.notification_status,
    i.notification_error_code
  into
    existing_inquiry_id,
    existing_payload_matches,
    existing_notification_status,
    existing_notification_error_code
  from public.inquiries as i
  where i.submission_id = p_submission_id;

  if found then
    return query select
      existing_inquiry_id,
      false,
      false,
      existing_payload_matches,
      existing_notification_status,
      existing_notification_error_code;
    return;
  end if;

  delete from public.inquiry_submission_limits
  where last_seen_at < claimed_at - interval '30 days';

  insert into public.inquiry_submission_limits (
    fingerprint,
    window_started_at,
    submission_count,
    last_seen_at
  )
  values (p_fingerprint, claimed_at, 1, claimed_at)
  on conflict (fingerprint) do update
  set
    window_started_at = case
      when inquiry_submission_limits.window_started_at
        <= claimed_at - interval '1 hour'
        then claimed_at
      else inquiry_submission_limits.window_started_at
    end,
    submission_count = case
      when inquiry_submission_limits.window_started_at
        <= claimed_at - interval '1 hour'
        then 1
      else inquiry_submission_limits.submission_count + 1
    end,
    last_seen_at = claimed_at
  where
    inquiry_submission_limits.window_started_at
      <= claimed_at - interval '1 hour'
    or inquiry_submission_limits.submission_count < p_limit
  returning submission_count into claimed_count;

  if claimed_count is null then
    return query select
      null::uuid,
      false,
      true,
      true,
      null::text,
      null::text;
    return;
  end if;

  insert into public.inquiries (
    submission_id,
    payload_digest,
    source,
    name,
    email,
    message,
    booking_preference,
    date_preference,
    event_date,
    format,
    guest_count,
    group_size,
    interests,
    location,
    organization,
    phone,
    preferred_date,
    preferred_window,
    service,
    service_slug,
    services,
    subject,
    time_zone
  )
  values (
    p_submission_id,
    p_payload_digest,
    p_source,
    p_name,
    p_email,
    p_message,
    p_booking_preference,
    p_date_preference,
    p_event_date,
    p_format,
    p_guest_count,
    p_group_size,
    p_interests,
    p_location,
    p_organization,
    p_phone,
    p_preferred_date,
    p_preferred_window,
    p_service,
    p_service_slug,
    p_services,
    p_subject,
    p_time_zone
  )
  returning id into recorded_inquiry_id;

  return query select
    recorded_inquiry_id,
    true,
    false,
    true,
    'unattempted'::text,
    null::text;
end;
$function$;

revoke execute on function public.record_inquiry_submission(
  uuid,
  text,
  text,
  integer,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text
)
  from public, anon, authenticated, service_role;
grant execute on function public.record_inquiry_submission(
  uuid,
  text,
  text,
  integer,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text
)
  to service_role;

-- Claim notification work exactly once. Concurrent HTTP retries can all return
-- the same durable receipt, but only the transaction that moves the row from
-- unattempted to attempting may call the email provider.
create function public.claim_inquiry_notification(
  p_inquiry_id uuid,
  p_submission_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $function$
declare
  claimed boolean;
begin
  if p_inquiry_id is null or p_submission_id is null then
    raise exception using
      errcode = '22023',
      message = 'Invalid inquiry notification claim.';
  end if;

  update public.inquiries
  set
    notification_status = 'attempting',
    notification_attempted_at = pg_catalog.clock_timestamp(),
    notification_accepted_at = null,
    notification_provider_id = null,
    notification_error_code = null
  where id = p_inquiry_id
    and submission_id = p_submission_id
    and notification_status = 'unattempted'
  returning true into claimed;

  return coalesce(claimed, false);
end;
$function$;

revoke execute on function public.claim_inquiry_notification(uuid, uuid)
  from public, anon, authenticated, service_role;
grant execute on function public.claim_inquiry_notification(uuid, uuid)
  to service_role;

-- A provider attempt is bounded to ten seconds in the application. If no
-- completion reaches the ledger within five minutes, record only that the
-- claim outcome is unknown. This never returns the row to unattempted and
-- therefore cannot authorize a duplicate provider call.
create function public.mark_stale_inquiry_notification_unknown(
  p_inquiry_id uuid,
  p_submission_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $function$
declare
  marked boolean;
begin
  if p_inquiry_id is null or p_submission_id is null then
    raise exception using
      errcode = '22023',
      message = 'Invalid stale inquiry notification claim.';
  end if;

  update public.inquiries
  set
    notification_status = 'audit_unknown',
    notification_accepted_at = null,
    notification_provider_id = null,
    notification_error_code = 'claim_outcome_unknown'
  where id = p_inquiry_id
    and submission_id = p_submission_id
    and notification_status = 'attempting'
    and notification_attempted_at
      <= pg_catalog.clock_timestamp() - interval '5 minutes'
  returning true into marked;

  return coalesce(marked, false);
end;
$function$;

revoke execute on function public.mark_stale_inquiry_notification_unknown(
  uuid,
  uuid
)
  from public, anon, authenticated, service_role;
grant execute on function public.mark_stale_inquiry_notification_unknown(
  uuid,
  uuid
)
  to service_role;

-- Complete only work held by the attempting state. Accepted is terminal and a
-- late timeout or duplicate request cannot overwrite its provider receipt.
create function public.complete_inquiry_notification(
  p_inquiry_id uuid,
  p_submission_id uuid,
  p_status text,
  p_error_code text,
  p_provider_id text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $function$
declare
  completed boolean;
begin
  if p_inquiry_id is null
    or p_submission_id is null
    or p_status is null
    or (
      p_status = 'accepted'
      and (p_error_code is not null or p_provider_id is null)
    )
    or (
      p_status = 'failed'
      and (
        p_error_code is distinct from 'provider_rejected'
        or p_provider_id is not null
      )
    )
    or (
      p_status = 'not_configured'
      and (
        p_error_code is distinct from 'configuration_missing'
        or p_provider_id is not null
      )
    )
    or (
      p_status = 'audit_unknown'
      and (
        (
          p_error_code is null
          or p_error_code not in (
            'network_outcome_unknown',
            'provider_receipt_missing'
          )
        )
        or p_provider_id is not null
      )
    )
    or p_status not in (
      'accepted',
      'failed',
      'not_configured',
      'audit_unknown'
    )
    or (
      p_provider_id is not null
      and char_length(p_provider_id) not between 1 and 255
    ) then
    raise exception using
      errcode = '22023',
      message = 'Invalid inquiry notification completion.';
  end if;

  update public.inquiries
  set
    notification_status = p_status,
    notification_accepted_at = case
      when p_status = 'accepted' then pg_catalog.clock_timestamp()
      else null
    end,
    notification_provider_id = p_provider_id,
    notification_error_code = p_error_code
  where id = p_inquiry_id
    and submission_id = p_submission_id
    and notification_status = 'attempting'
  returning true into completed;

  return coalesce(completed, false);
end;
$function$;

revoke execute on function public.complete_inquiry_notification(
  uuid,
  uuid,
  text,
  text,
  text
)
  from public, anon, authenticated, service_role;
grant execute on function public.complete_inquiry_notification(
  uuid,
  uuid,
  text,
  text,
  text
)
  to service_role;

commit;
