-- Minimal private booking history for The Den.
--
-- Cal.com remains the scheduling authority. Only fields needed for client-facing
-- booking history are retained. Intake answers, addresses, guest emails, notes,
-- meeting secrets, ICS bodies, and payment data intentionally stay out of this
-- scheduling ledger.
--
-- Cal.com takes no payment. Post-service Stripe invoicing is a separate future
-- workflow and must receive its own migration, server action, and verification.

begin;

create table public.booking_records (
  id uuid primary key default gen_random_uuid(),
  deployment_target text not null check (
    deployment_target in ('development', 'preview', 'production')
  ),
  calcom_username text not null check (
    calcom_username = lower(btrim(calcom_username))
    and calcom_username ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  ),
  current_cal_booking_uid text not null check (
    current_cal_booking_uid = btrim(current_cal_booking_uid)
    and char_length(current_cal_booking_uid) between 1 and 255
  ),
  cal_booking_id bigint check (cal_booking_id is null or cal_booking_id > 0),
  cal_event_type_id bigint not null check (cal_event_type_id > 0),
  cal_ical_uid text check (
    cal_ical_uid is null
    or (
      cal_ical_uid = btrim(cal_ical_uid)
      and char_length(cal_ical_uid) between 1 and 500
    )
  ),
  cal_ical_sequence integer not null check (cal_ical_sequence >= 0),
  service_slug text not null check (
    service_slug in (
      'wild-glow-express-facial',
      'reiki-aromatherapy-healing',
      'signature-facial',
      'beauty-being-ritual',
      'wild-glow-luxury-facial',
      'private-yoga-and-sound',
      'private-sound-healing',
      'private-yoga',
      'intuitive-tarot-reading',
      'moon-oracle-reading',
      'tarot-and-reiki'
    )
  ),
  service_title text not null check (
    service_title = btrim(service_title)
    and char_length(service_title) between 1 and 240
  ),
  service_duration_minutes integer not null check (
    service_duration_minutes between 1 and 1440
  ),
  attendee_name text not null check (
    attendee_name = btrim(attendee_name)
    and char_length(attendee_name) between 1 and 200
  ),
  attendee_email text not null check (
    attendee_email = lower(btrim(attendee_email))
    and char_length(attendee_email) between 3 and 320
    and attendee_email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  ),
  attendee_timezone text not null check (
    attendee_timezone = btrim(attendee_timezone)
    and char_length(attendee_timezone) between 1 and 100
  ),
  user_id uuid references public.profiles(id) on delete restrict,
  member_claimed_at timestamptz,
  start_at timestamptz not null,
  end_at timestamptz not null,
  requires_confirmation boolean,
  booking_status text not null check (
    booking_status in ('requested', 'confirmed', 'cancelled', 'rejected')
  ),
  cal_status text not null check (
    cal_status = upper(btrim(cal_status))
    and char_length(cal_status) between 1 and 80
  ),
  currency text not null check (currency = 'usd'),
  no_show boolean not null default false,
  details_ical_sequence integer not null check (details_ical_sequence >= 0),
  details_event_at timestamptz not null,
  details_event_rank smallint not null,
  booking_state_ical_sequence integer not null check (
    booking_state_ical_sequence >= 0
  ),
  booking_state_event_at timestamptz not null,
  booking_state_rank smallint not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_at > start_at),
  check (
    (user_id is null and member_claimed_at is null)
    or (user_id is not null and member_claimed_at is not null)
  ),
  unique (id, deployment_target, calcom_username),
  unique (deployment_target, calcom_username, current_cal_booking_uid)
);

create unique index booking_records_provider_id_idx
  on public.booking_records (
    deployment_target,
    calcom_username,
    cal_booking_id
  )
  where cal_booking_id is not null;

create unique index booking_records_ical_identity_idx
  on public.booking_records (
    deployment_target,
    calcom_username,
    cal_ical_uid
  )
  where cal_ical_uid is not null;

create index booking_records_member_history_idx
  on public.booking_records (
    user_id,
    deployment_target,
    calcom_username,
    start_at desc
  )
  where user_id is not null;

create index booking_records_unclaimed_email_idx
  on public.booking_records (
    deployment_target,
    calcom_username,
    attendee_email
  )
  where user_id is null;

create table public.calcom_booking_aliases (
  deployment_target text not null check (
    deployment_target in ('development', 'preview', 'production')
  ),
  calcom_username text not null check (
    calcom_username = lower(btrim(calcom_username))
  ),
  cal_booking_uid text not null check (
    cal_booking_uid = btrim(cal_booking_uid)
    and char_length(cal_booking_uid) between 1 and 255
  ),
  cal_booking_id bigint check (cal_booking_id is null or cal_booking_id > 0),
  booking_record_id uuid not null,
  first_seen_at timestamptz not null default now(),
  primary key (deployment_target, calcom_username, cal_booking_uid),
  foreign key (booking_record_id, deployment_target, calcom_username)
    references public.booking_records(id, deployment_target, calcom_username)
    on delete restrict
);

create unique index calcom_booking_aliases_provider_id_idx
  on public.calcom_booking_aliases (
    deployment_target,
    calcom_username,
    cal_booking_id
  )
  where cal_booking_id is not null;

create index calcom_booking_aliases_record_idx
  on public.calcom_booking_aliases (booking_record_id);

create table public.calcom_webhook_events (
  deployment_target text not null check (
    deployment_target in ('development', 'preview', 'production')
  ),
  calcom_username text not null,
  payload_digest text not null check (payload_digest ~ '^[a-f0-9]{64}$'),
  webhook_version text not null check (
    webhook_version in ('2021-10-20', '2026-07-27')
  ),
  trigger_event text not null check (
    trigger_event in (
      'BOOKING_REQUESTED',
      'BOOKING_CREATED',
      'BOOKING_RESCHEDULED',
      'BOOKING_CANCELLED',
      'BOOKING_REJECTED'
    )
  ),
  event_created_at timestamptz not null,
  cal_booking_uid text not null,
  booking_record_id uuid references public.booking_records(id) on delete restrict,
  processing_outcome text not null check (
    processing_outcome in ('applied', 'ignored_stale', 'manual_review')
  ),
  review_reason text check (
    review_reason is null
    or review_reason in (
      'ambiguous_identity',
      'immutable_identity_mismatch',
      'causal_clock_conflict',
      'alias_identity_collision'
    )
  ),
  received_at timestamptz not null default now(),
  check (
    (processing_outcome = 'manual_review' and review_reason is not null)
    or (processing_outcome <> 'manual_review' and review_reason is null)
  ),
  primary key (deployment_target, calcom_username, payload_digest)
);

create index calcom_webhook_events_manual_review_idx
  on public.calcom_webhook_events (received_at)
  where processing_outcome = 'manual_review';

alter table public.booking_records enable row level security;
alter table public.calcom_booking_aliases enable row level security;
alter table public.calcom_webhook_events enable row level security;

revoke all on table public.booking_records
  from public, anon, authenticated, service_role;
revoke all on table public.calcom_booking_aliases
  from public, anon, authenticated, service_role;
revoke all on table public.calcom_webhook_events
  from public, anon, authenticated, service_role;

-- Trusted server reads are permitted. Writes happen only through the typed
-- SECURITY DEFINER functions below.
grant select on table public.booking_records to service_role;
grant select on table public.calcom_booking_aliases to service_role;
grant select on table public.calcom_webhook_events to service_role;

drop trigger if exists booking_records_touch_updated_at
  on public.booking_records;
create trigger booking_records_touch_updated_at
  before update on public.booking_records
  for each row execute procedure public.touch_updated_at();

create or replace function public.reject_booking_evidence_mutation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
  raise exception 'Booking evidence is append-only.';
end;
$function$;

revoke all on function public.reject_booking_evidence_mutation()
  from public, anon, authenticated, service_role;

create trigger calcom_booking_aliases_immutable
  before update or delete on public.calcom_booking_aliases
  for each row execute procedure public.reject_booking_evidence_mutation();

create trigger calcom_webhook_events_immutable
  before update or delete on public.calcom_webhook_events
  for each row execute procedure public.reject_booking_evidence_mutation();

create or replace function public.claim_calcom_bookings_for_member(
  p_user_id uuid,
  p_deployment_target text,
  p_calcom_username text
)
returns integer
language plpgsql
security definer
set search_path = ''
as $function$
declare
  claimed_count integer;
  verified_email text;
begin
  if p_deployment_target not in ('development', 'preview', 'production')
    or p_calcom_username <> 'hwlbysmd' then
    raise exception 'Invalid booking claim boundary.';
  end if;

  select lower(btrim(users.email))
  into verified_email
  from auth.users as users
  join public.profiles as profiles on profiles.id = users.id
  where users.id = p_user_id
    and users.email_confirmed_at is not null
    and lower(btrim(profiles.email)) = lower(btrim(users.email));

  if verified_email is null then
    raise exception 'A confirmed matching account is required.';
  end if;

  update public.booking_records
  set
    user_id = p_user_id,
    member_claimed_at = now()
  where user_id is null
    and deployment_target = p_deployment_target
    and calcom_username = p_calcom_username
    and attendee_email = verified_email;

  get diagnostics claimed_count = row_count;
  return claimed_count;
end;
$function$;

revoke all on function public.claim_calcom_bookings_for_member(uuid, text, text)
  from public, anon, authenticated, service_role;
grant execute on function public.claim_calcom_bookings_for_member(uuid, text, text)
  to service_role;

create or replace function public.ingest_calcom_booking_event(
  p_deployment_target text,
  p_calcom_username text,
  p_payload_digest text,
  p_webhook_version text,
  p_trigger_event text,
  p_event_created_at timestamptz,
  p_cal_booking_uid text,
  p_previous_cal_booking_uid text,
  p_cal_booking_id bigint,
  p_cal_event_type_id bigint,
  p_cal_ical_uid text,
  p_cal_ical_sequence integer,
  p_service_slug text,
  p_service_title text,
  p_service_duration_minutes integer,
  p_attendee_name text,
  p_attendee_email text,
  p_attendee_timezone text,
  p_start_at timestamptz,
  p_end_at timestamptz,
  p_requires_confirmation boolean,
  p_booking_status text,
  p_cal_status text,
  p_currency text
)
returns table (booking_record_id uuid, outcome text)
language plpgsql
security definer
set search_path = ''
as $function$
declare
  affected_rows integer := 0;
  alias_rows integer := 0;
  booking_rank smallint;
  candidate_ids uuid[];
  current_booking public.booking_records%rowtype;
  details_rank smallint;
  existing_outcome text;
  existing_record_id uuid;
  incoming_booking_wins boolean := false;
  incoming_details_wins boolean := false;
  lock_value text;
  manual_review_reason text;
  matched_profile_id uuid;
  member_claim_wins boolean := false;
  record_mutated boolean := false;
  resolved_record_id uuid;
  result_outcome text;
begin
  if p_deployment_target is null
    or p_deployment_target not in ('development', 'preview', 'production')
    or p_calcom_username is distinct from 'hwlbysmd'
    or p_payload_digest is null
    or p_payload_digest !~ '^[a-f0-9]{64}$'
    or p_webhook_version is null
    or p_webhook_version not in ('2021-10-20', '2026-07-27')
    or p_trigger_event is null
    or p_trigger_event not in (
      'BOOKING_REQUESTED',
      'BOOKING_CREATED',
      'BOOKING_RESCHEDULED',
      'BOOKING_CANCELLED',
      'BOOKING_REJECTED'
    )
    or p_event_created_at is null
    or p_cal_booking_uid is null
    or p_cal_booking_uid <> btrim(p_cal_booking_uid)
    or char_length(p_cal_booking_uid) not between 1 and 255
    or (p_cal_booking_id is not null and p_cal_booking_id <= 0)
    or p_cal_event_type_id is null
    or p_cal_event_type_id <= 0
    or (p_cal_ical_uid is not null and (
      p_cal_ical_uid <> btrim(p_cal_ical_uid)
      or char_length(p_cal_ical_uid) not between 1 and 500
    ))
    or p_cal_ical_sequence is null
    or p_cal_ical_sequence < 0
    or p_service_slug is null
    or p_service_slug not in (
      'wild-glow-express-facial',
      'reiki-aromatherapy-healing',
      'signature-facial',
      'beauty-being-ritual',
      'wild-glow-luxury-facial',
      'private-yoga-and-sound',
      'private-sound-healing',
      'private-yoga',
      'intuitive-tarot-reading',
      'moon-oracle-reading',
      'tarot-and-reiki'
    )
    or p_service_title is null
    or p_service_title <> btrim(p_service_title)
    or char_length(p_service_title) not between 1 and 240
    or p_service_duration_minutes is null
    or p_service_duration_minutes not between 1 and 1440
    or p_attendee_name is null
    or p_attendee_name <> btrim(p_attendee_name)
    or char_length(p_attendee_name) not between 1 and 200
    or p_attendee_email is null
    or p_attendee_email <> lower(btrim(p_attendee_email))
    or char_length(p_attendee_email) not between 3 and 320
    or p_attendee_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    or p_attendee_timezone is null
    or p_attendee_timezone <> btrim(p_attendee_timezone)
    or char_length(p_attendee_timezone) not between 1 and 100
    or p_start_at is null
    or p_end_at is null
    or p_end_at <= p_start_at
    or p_booking_status is null
    or p_booking_status not in ('requested', 'confirmed', 'cancelled', 'rejected')
    or p_cal_status is null
    or p_cal_status <> upper(btrim(p_cal_status))
    or char_length(p_cal_status) not between 1 and 80
    or p_currency is distinct from 'usd' then
    raise exception 'Invalid Cal.com booking event boundary.';
  end if;

  if (p_trigger_event = 'BOOKING_RESCHEDULED' and (
      p_previous_cal_booking_uid is null
      or p_previous_cal_booking_uid <> btrim(p_previous_cal_booking_uid)
      or char_length(p_previous_cal_booking_uid) not between 1 and 255
      or p_previous_cal_booking_uid = p_cal_booking_uid
      or p_cal_ical_uid is null
    ))
    or (p_trigger_event <> 'BOOKING_RESCHEDULED'
      and p_previous_cal_booking_uid is not null) then
    raise exception 'Invalid Cal.com event causality boundary.';
  end if;

  details_rank := case p_trigger_event
    when 'BOOKING_RESCHEDULED' then 40
    when 'BOOKING_CREATED' then 30
    when 'BOOKING_REQUESTED' then 20
    else 10
  end;
  booking_rank := case p_booking_status
    when 'cancelled' then 40
    when 'rejected' then 40
    when 'confirmed' then 30
    else 20
  end;

  for lock_value in
    select distinct identities.value
    from unnest(array[
      'uid:' || p_cal_booking_uid,
      case when p_previous_cal_booking_uid is null then null
        else 'uid:' || p_previous_cal_booking_uid end,
      case when p_cal_ical_uid is null then null
        else 'ical:' || p_cal_ical_uid end,
      case when p_cal_booking_id is null then null
        else 'booking-id:' || p_cal_booking_id::text end
    ]) as identities(value)
    where identities.value is not null
    order by identities.value
  loop
    perform pg_advisory_xact_lock(
      hashtextextended(
        p_deployment_target || ':' || p_calcom_username || ':' || lock_value,
        0
      )
    );
  end loop;

  select events.processing_outcome, events.booking_record_id
  into existing_outcome, existing_record_id
  from public.calcom_webhook_events as events
  where events.deployment_target = p_deployment_target
    and events.calcom_username = p_calcom_username
    and events.payload_digest = p_payload_digest;

  if existing_outcome is not null then
    return query select existing_record_id, existing_outcome;
    return;
  end if;

  select array_agg(candidates.id order by candidates.id)
  into candidate_ids
  from (
    select distinct identities.id
    from (
      select aliases.booking_record_id as id
      from public.calcom_booking_aliases as aliases
      where aliases.deployment_target = p_deployment_target
        and aliases.calcom_username = p_calcom_username
        and aliases.cal_booking_uid in (
          p_cal_booking_uid,
          coalesce(p_previous_cal_booking_uid, p_cal_booking_uid)
        )
      union all
      select aliases.booking_record_id
      from public.calcom_booking_aliases as aliases
      where aliases.deployment_target = p_deployment_target
        and aliases.calcom_username = p_calcom_username
        and p_cal_booking_id is not null
        and aliases.cal_booking_id = p_cal_booking_id
      union all
      select records.id
      from public.booking_records as records
      where records.deployment_target = p_deployment_target
        and records.calcom_username = p_calcom_username
        and records.current_cal_booking_uid in (
          p_cal_booking_uid,
          coalesce(p_previous_cal_booking_uid, p_cal_booking_uid)
        )
      union all
      select records.id
      from public.booking_records as records
      where records.deployment_target = p_deployment_target
        and records.calcom_username = p_calcom_username
        and p_cal_booking_id is not null
        and records.cal_booking_id = p_cal_booking_id
      union all
      select records.id
      from public.booking_records as records
      where records.deployment_target = p_deployment_target
        and records.calcom_username = p_calcom_username
        and p_cal_ical_uid is not null
        and records.cal_ical_uid = p_cal_ical_uid
    ) as identities
  ) as candidates;

  if coalesce(cardinality(candidate_ids), 0) > 1 then
    manual_review_reason := 'ambiguous_identity';
  else
    resolved_record_id := candidate_ids[1];
  end if;

  if manual_review_reason is null and resolved_record_id is not null then
    select *
    into current_booking
    from public.booking_records
    where id = resolved_record_id
    for update;

    incoming_details_wins :=
      (p_cal_ical_sequence, p_event_created_at, details_rank)
      > (
        current_booking.details_ical_sequence,
        current_booking.details_event_at,
        current_booking.details_event_rank
      );

    incoming_booking_wins :=
      (p_cal_ical_sequence, booking_rank, p_event_created_at)
      > (
        current_booking.booking_state_ical_sequence,
        current_booking.booking_state_rank,
        current_booking.booking_state_event_at
      );

    if current_booking.service_slug <> p_service_slug
      or current_booking.attendee_email <> p_attendee_email
      or current_booking.currency <> p_currency
      or (
        current_booking.cal_ical_uid is not null
        and p_cal_ical_uid is not null
        and current_booking.cal_ical_uid <> p_cal_ical_uid
      ) then
      manual_review_reason := 'immutable_identity_mismatch';
    elsif (
      p_cal_ical_sequence,
      p_event_created_at,
      details_rank
    ) = (
      current_booking.details_ical_sequence,
      current_booking.details_event_at,
      current_booking.details_event_rank
    ) and (
      current_booking.current_cal_booking_uid <> p_cal_booking_uid
      or (
        p_cal_booking_id is not null
        and current_booking.cal_booking_id is distinct from p_cal_booking_id
      )
      or (
        p_cal_ical_uid is not null
        and current_booking.cal_ical_uid is distinct from p_cal_ical_uid
      )
      or current_booking.cal_event_type_id <> p_cal_event_type_id
      or current_booking.service_title <> p_service_title
      or current_booking.service_duration_minutes <> p_service_duration_minutes
      or current_booking.attendee_name <> p_attendee_name
      or current_booking.attendee_timezone <> p_attendee_timezone
      or current_booking.start_at <> p_start_at
      or current_booking.end_at <> p_end_at
      or (
        p_requires_confirmation is not null
        and current_booking.requires_confirmation
          is distinct from p_requires_confirmation
      )
    ) then
      manual_review_reason := 'causal_clock_conflict';
    elsif (
      p_cal_ical_sequence,
      booking_rank,
      p_event_created_at
    ) = (
      current_booking.booking_state_ical_sequence,
      current_booking.booking_state_rank,
      current_booking.booking_state_event_at
    ) and (
      current_booking.booking_status <> p_booking_status
      or current_booking.cal_status <> p_cal_status
    ) then
      manual_review_reason := 'causal_clock_conflict';
    elsif exists (
      select 1
      from public.calcom_booking_aliases as aliases
      where aliases.deployment_target = p_deployment_target
        and aliases.calcom_username = p_calcom_username
        and aliases.cal_booking_uid = p_cal_booking_uid
        and aliases.booking_record_id = resolved_record_id
        and aliases.cal_booking_id is not null
        and p_cal_booking_id is not null
        and aliases.cal_booking_id <> p_cal_booking_id
    ) then
      manual_review_reason := 'alias_identity_collision';
    end if;
  end if;

  if manual_review_reason is not null then
    insert into public.calcom_webhook_events (
      deployment_target,
      calcom_username,
      payload_digest,
      webhook_version,
      trigger_event,
      event_created_at,
      cal_booking_uid,
      booking_record_id,
      processing_outcome,
      review_reason
    ) values (
      p_deployment_target,
      p_calcom_username,
      p_payload_digest,
      p_webhook_version,
      p_trigger_event,
      p_event_created_at,
      p_cal_booking_uid,
      resolved_record_id,
      'manual_review',
      manual_review_reason
    );

    return query select resolved_record_id, 'manual_review'::text;
    return;
  end if;

  select profiles.id
  into matched_profile_id
  from public.profiles as profiles
  join auth.users as users on users.id = profiles.id
  where lower(btrim(users.email)) = p_attendee_email
    and users.email_confirmed_at is not null
    and lower(btrim(profiles.email)) = p_attendee_email
  order by profiles.created_at asc, profiles.id asc
  limit 1;

  if resolved_record_id is null then
    insert into public.booking_records (
      deployment_target,
      calcom_username,
      current_cal_booking_uid,
      cal_booking_id,
      cal_event_type_id,
      cal_ical_uid,
      cal_ical_sequence,
      service_slug,
      service_title,
      service_duration_minutes,
      attendee_name,
      attendee_email,
      attendee_timezone,
      user_id,
      member_claimed_at,
      start_at,
      end_at,
      requires_confirmation,
      booking_status,
      cal_status,
      currency,
      details_ical_sequence,
      details_event_at,
      details_event_rank,
      booking_state_ical_sequence,
      booking_state_event_at,
      booking_state_rank
    ) values (
      p_deployment_target,
      p_calcom_username,
      p_cal_booking_uid,
      p_cal_booking_id,
      p_cal_event_type_id,
      p_cal_ical_uid,
      p_cal_ical_sequence,
      p_service_slug,
      p_service_title,
      p_service_duration_minutes,
      p_attendee_name,
      p_attendee_email,
      p_attendee_timezone,
      matched_profile_id,
      case when matched_profile_id is null then null else now() end,
      p_start_at,
      p_end_at,
      p_requires_confirmation,
      p_booking_status,
      p_cal_status,
      p_currency,
      p_cal_ical_sequence,
      p_event_created_at,
      details_rank,
      p_cal_ical_sequence,
      p_event_created_at,
      booking_rank
    ) returning id into resolved_record_id;

    record_mutated := true;
  else
    member_claim_wins := current_booking.user_id is null
      and matched_profile_id is not null;
    record_mutated := incoming_details_wins
      or incoming_booking_wins
      or member_claim_wins;

    if record_mutated then
      update public.booking_records as records
      set
        current_cal_booking_uid = case when incoming_details_wins
          then p_cal_booking_uid else records.current_cal_booking_uid end,
        cal_booking_id = case when incoming_details_wins
          then coalesce(p_cal_booking_id, records.cal_booking_id)
          else records.cal_booking_id end,
        cal_event_type_id = case when incoming_details_wins
          then p_cal_event_type_id else records.cal_event_type_id end,
        cal_ical_uid = case when incoming_details_wins
          then coalesce(p_cal_ical_uid, records.cal_ical_uid)
          else records.cal_ical_uid end,
        cal_ical_sequence = case when incoming_details_wins
          then p_cal_ical_sequence else records.cal_ical_sequence end,
        service_title = case when incoming_details_wins
          then p_service_title else records.service_title end,
        service_duration_minutes = case when incoming_details_wins
          then p_service_duration_minutes else records.service_duration_minutes end,
        attendee_name = case when incoming_details_wins
          then p_attendee_name else records.attendee_name end,
        attendee_timezone = case when incoming_details_wins
          then p_attendee_timezone else records.attendee_timezone end,
        start_at = case when incoming_details_wins
          then p_start_at else records.start_at end,
        end_at = case when incoming_details_wins
          then p_end_at else records.end_at end,
        requires_confirmation = case when incoming_details_wins
          then coalesce(p_requires_confirmation, records.requires_confirmation)
          else records.requires_confirmation end,
        details_ical_sequence = case when incoming_details_wins
          then p_cal_ical_sequence else records.details_ical_sequence end,
        details_event_at = case when incoming_details_wins
          then p_event_created_at else records.details_event_at end,
        details_event_rank = case when incoming_details_wins
          then details_rank else records.details_event_rank end,
        user_id = case when member_claim_wins
          then matched_profile_id else records.user_id end,
        member_claimed_at = case when member_claim_wins
          then now() else records.member_claimed_at end,
        booking_status = case when incoming_booking_wins
          then p_booking_status else records.booking_status end,
        cal_status = case when incoming_booking_wins
          then p_cal_status else records.cal_status end,
        booking_state_ical_sequence = case when incoming_booking_wins
          then p_cal_ical_sequence else records.booking_state_ical_sequence end,
        booking_state_event_at = case when incoming_booking_wins
          then p_event_created_at else records.booking_state_event_at end,
        booking_state_rank = case when incoming_booking_wins
          then booking_rank else records.booking_state_rank end
      where records.id = resolved_record_id;
    end if;
  end if;

  insert into public.calcom_booking_aliases (
    deployment_target,
    calcom_username,
    cal_booking_uid,
    cal_booking_id,
    booking_record_id
  ) values (
    p_deployment_target,
    p_calcom_username,
    p_cal_booking_uid,
    case
      when p_cal_booking_id is null then null
      when exists (
        select 1
        from public.calcom_booking_aliases as aliases
        where aliases.deployment_target = p_deployment_target
          and aliases.calcom_username = p_calcom_username
          and aliases.cal_booking_id = p_cal_booking_id
          and aliases.booking_record_id = resolved_record_id
      ) then null
      else p_cal_booking_id
    end,
    resolved_record_id
  ) on conflict (deployment_target, calcom_username, cal_booking_uid) do nothing;
  get diagnostics affected_rows = row_count;
  alias_rows := alias_rows + affected_rows;

  if p_previous_cal_booking_uid is not null then
    insert into public.calcom_booking_aliases (
      deployment_target,
      calcom_username,
      cal_booking_uid,
      booking_record_id
    ) values (
      p_deployment_target,
      p_calcom_username,
      p_previous_cal_booking_uid,
      resolved_record_id
    ) on conflict (deployment_target, calcom_username, cal_booking_uid) do nothing;
    get diagnostics affected_rows = row_count;
    alias_rows := alias_rows + affected_rows;
  end if;

  result_outcome := case
    when record_mutated or alias_rows > 0 then 'applied'
    else 'ignored_stale'
  end;

  insert into public.calcom_webhook_events (
    deployment_target,
    calcom_username,
    payload_digest,
    webhook_version,
    trigger_event,
    event_created_at,
    cal_booking_uid,
    booking_record_id,
    processing_outcome
  ) values (
    p_deployment_target,
    p_calcom_username,
    p_payload_digest,
    p_webhook_version,
    p_trigger_event,
    p_event_created_at,
    p_cal_booking_uid,
    resolved_record_id,
    result_outcome
  );

  return query select resolved_record_id, result_outcome;
end;
$function$;

revoke all on function public.ingest_calcom_booking_event(
  text, text, text, text, text, timestamptz, text, text, bigint, bigint,
  text, integer, text, text, integer, text, text, text, timestamptz,
  timestamptz, boolean, text, text, text
)
  from public, anon, authenticated, service_role;
grant execute on function public.ingest_calcom_booking_event(
  text, text, text, text, text, timestamptz, text, text, bigint, bigint,
  text, integer, text, text, integer, text, text, text, timestamptz,
  timestamptz, boolean, text, text, text
)
  to service_role;

commit;
