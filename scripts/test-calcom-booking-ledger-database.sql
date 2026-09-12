\set ON_ERROR_STOP on

-- Run only after migrations 016 and 019 in an isolated local or owner-approved
-- staging database. Every fixture and assertion is enclosed in this
-- transaction and the script always rolls back.

begin;

set local lock_timeout = '5s';

create or replace function pg_temp.ingest_booking(
  p_digest text,
  p_trigger text default 'BOOKING_REQUESTED',
  p_event_at timestamptz default timestamptz '2026-09-09 18:00:00+00',
  p_uid text default 'booking-fixture-original',
  p_previous_uid text default null,
  p_booking_id bigint default 7001,
  p_event_type_id bigint default 9001,
  p_ical_uid text default 'booking-fixture-series@example.invalid',
  p_ical_sequence integer default 0,
  p_service_slug text default 'signature-facial',
  p_service_title text default 'Signature Facial',
  p_duration integer default 60,
  p_attendee_name text default 'Booking Fixture',
  p_attendee_email text default 'booking-fixture@example.invalid',
  p_timezone text default 'America/Los_Angeles',
  p_start_at timestamptz default timestamptz '2026-10-01 18:00:00+00',
  p_end_at timestamptz default timestamptz '2026-10-01 19:00:00+00',
  p_requires_confirmation boolean default true,
  p_booking_status text default 'requested',
  p_cal_status text default 'PENDING',
  p_provider_price_was_null boolean default false,
  p_deployment_target text default 'preview'
)
returns table (booking_record_id uuid, outcome text)
language sql
as $function$
  select *
  from public.ingest_calcom_booking_event(
    p_deployment_target => p_deployment_target,
    p_calcom_username => 'hwlbysmd',
    p_payload_digest => p_digest,
    p_webhook_version => '2026-07-27',
    p_trigger_event => p_trigger,
    p_event_created_at => p_event_at,
    p_cal_booking_uid => p_uid,
    p_previous_cal_booking_uid => p_previous_uid,
    p_cal_booking_id => p_booking_id,
    p_cal_event_type_id => p_event_type_id,
    p_cal_ical_uid => p_ical_uid,
    p_cal_ical_sequence => p_ical_sequence,
    p_service_slug => p_service_slug,
    p_service_title => p_service_title,
    p_service_duration_minutes => p_duration,
    p_attendee_name => p_attendee_name,
    p_attendee_email => p_attendee_email,
    p_attendee_timezone => p_timezone,
    p_start_at => p_start_at,
    p_end_at => p_end_at,
    p_requires_confirmation => p_requires_confirmation,
    p_booking_status => p_booking_status,
    p_cal_status => p_cal_status,
    p_currency => 'usd',
    p_provider_price_was_null => p_provider_price_was_null
  );
$function$;

-- Runtime roles cannot mutate the booking ledger. Only service_role receives
-- the exact SELECT and RPC privileges used by the server DAL.
do $test$
declare
  runtime_role text;
  ledger_table text;
begin
  foreach runtime_role in array array['anon', 'authenticated', 'service_role']
  loop
    foreach ledger_table in array array[
      'booking_records',
      'calcom_booking_aliases',
      'calcom_webhook_events'
    ]
    loop
      if has_table_privilege(
        runtime_role,
        'public.' || ledger_table,
        'INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER'
      ) then
        raise exception '% can mutate booking ledger table %.',
          runtime_role,
          ledger_table;
      end if;

      if runtime_role <> 'service_role' and has_table_privilege(
        runtime_role,
        'public.' || ledger_table,
        'SELECT'
      ) then
        raise exception '% can read booking ledger table %.',
          runtime_role,
          ledger_table;
      end if;

      if runtime_role = 'service_role' and not has_table_privilege(
        runtime_role,
        'public.' || ledger_table,
        'SELECT'
      ) then
        raise exception 'service_role cannot read booking ledger table %.',
          ledger_table;
      end if;
    end loop;

    if runtime_role <> 'service_role' and (
      has_function_privilege(
        runtime_role,
        'public.claim_calcom_bookings_for_member(uuid,text,text)',
        'EXECUTE'
      )
      or has_function_privilege(
        runtime_role,
        'public.ingest_calcom_booking_event(text,text,text,text,text,timestamptz,text,text,bigint,bigint,text,integer,text,text,integer,text,text,text,timestamptz,timestamptz,boolean,text,text,text,boolean)',
        'EXECUTE'
      )
    ) then
      raise exception '% can execute a booking-ledger RPC.', runtime_role;
    end if;
  end loop;

  if not has_function_privilege(
    'service_role',
    'public.claim_calcom_bookings_for_member(uuid,text,text)',
    'EXECUTE'
  ) or not has_function_privilege(
    'service_role',
    'public.ingest_calcom_booking_event(text,text,text,text,text,timestamptz,text,text,bigint,bigint,text,integer,text,text,integer,text,text,text,timestamptz,timestamptz,boolean,text,text,text,boolean)',
    'EXECUTE'
  ) then
    raise exception 'service_role is missing a booking-ledger RPC grant.';
  end if;

  if to_regprocedure(
    'public.ingest_calcom_booking_event(text,text,text,text,text,timestamptz,text,text,bigint,bigint,text,integer,text,text,integer,text,text,text,timestamptz,timestamptz,boolean,text,text,text)'
  ) is not null then
    raise exception 'The superseded booking-ledger RPC overload still exists.';
  end if;
end;
$test$;

-- Exact replay, out-of-order delivery, reschedule aliases, terminal state, and
-- manual review must all resolve deterministically without duplicating records.
do $test$
declare
  first_record_id uuid;
  observed_record_id uuid;
  observed_outcome text;
begin
  select result.booking_record_id, result.outcome
  into first_record_id, observed_outcome
  from pg_temp.ingest_booking(repeat('a', 64)) as result;

  if first_record_id is null or observed_outcome <> 'applied' then
    raise exception 'The initial booking request was not applied.';
  end if;

  -- Exact replay returns the original evidence outcome and does not duplicate
  -- the canonical record or webhook receipt.
  select result.booking_record_id, result.outcome
  into observed_record_id, observed_outcome
  from pg_temp.ingest_booking(repeat('a', 64)) as result;

  if observed_record_id is distinct from first_record_id
    or observed_outcome <> 'applied'
    or (select count(*) from public.booking_records) <> 1
    or (
      select count(*)
      from public.calcom_webhook_events
      where payload_digest = repeat('a', 64)
    ) <> 1 then
    raise exception 'Exact replay was not idempotent.';
  end if;

  -- A newer provider sequence confirms the request.
  select result.booking_record_id, result.outcome
  into observed_record_id, observed_outcome
  from pg_temp.ingest_booking(
    p_digest => repeat('b', 64),
    p_trigger => 'BOOKING_CREATED',
    p_event_at => timestamptz '2026-09-09 18:01:00+00',
    p_ical_sequence => 1,
    p_booking_status => 'confirmed',
    p_cal_status => 'ACCEPTED'
  ) as result;

  if observed_record_id is distinct from first_record_id
    or observed_outcome <> 'applied' then
    raise exception 'The confirmed event did not advance the booking.';
  end if;

  -- An out-of-order cancellation with an older iCal sequence cannot reverse a
  -- newer confirmed state.
  select result.booking_record_id, result.outcome
  into observed_record_id, observed_outcome
  from pg_temp.ingest_booking(
    p_digest => repeat('c', 64),
    p_trigger => 'BOOKING_CANCELLED',
    p_event_at => timestamptz '2026-09-09 18:02:00+00',
    p_ical_sequence => 0,
    p_booking_status => 'cancelled',
    p_cal_status => 'CANCELLED'
  ) as result;

  if observed_record_id is distinct from first_record_id
    or observed_outcome <> 'ignored_stale'
    or (
      select booking_status
      from public.booking_records
      where id = first_record_id
    ) <> 'confirmed' then
    raise exception 'An out-of-order event overrode a newer booking state.';
  end if;

  -- A valid reschedule must retain the original identity as an alias while
  -- moving the canonical current UID.
  select result.booking_record_id, result.outcome
  into observed_record_id, observed_outcome
  from pg_temp.ingest_booking(
    p_digest => repeat('d', 64),
    p_trigger => 'BOOKING_RESCHEDULED',
    p_event_at => timestamptz '2026-09-09 18:03:00+00',
    p_uid => 'booking-fixture-rescheduled',
    p_previous_uid => 'booking-fixture-original',
    p_ical_sequence => 2,
    p_start_at => timestamptz '2026-10-01 20:00:00+00',
    p_end_at => timestamptz '2026-10-01 21:00:00+00',
    p_booking_status => 'confirmed',
    p_cal_status => 'ACCEPTED'
  ) as result;

  if observed_record_id is distinct from first_record_id
    or observed_outcome <> 'applied'
    or (
      select count(*)
      from public.calcom_booking_aliases
      where booking_record_id = first_record_id
        and cal_booking_uid in (
          'booking-fixture-original',
          'booking-fixture-rescheduled'
        )
    ) <> 2
    or (
      select current_cal_booking_uid
      from public.booking_records
      where id = first_record_id
    ) <> 'booking-fixture-rescheduled' then
    raise exception 'Reschedule aliases did not preserve one booking identity.';
  end if;

  -- A terminal event at the current sequence and a later provider time wins.
  select result.booking_record_id, result.outcome
  into observed_record_id, observed_outcome
  from pg_temp.ingest_booking(
    p_digest => repeat('e', 64),
    p_trigger => 'BOOKING_CANCELLED',
    p_event_at => timestamptz '2026-09-09 18:04:00+00',
    p_uid => 'booking-fixture-rescheduled',
    p_ical_sequence => 2,
    p_start_at => timestamptz '2026-10-01 20:00:00+00',
    p_end_at => timestamptz '2026-10-01 21:00:00+00',
    p_booking_status => 'cancelled',
    p_cal_status => 'CANCELLED'
  ) as result;

  if observed_record_id is distinct from first_record_id
    or observed_outcome <> 'applied'
    or (
      select booking_status
      from public.booking_records
      where id = first_record_id
    ) <> 'cancelled' then
    raise exception 'A terminal booking state was not applied.';
  end if;

  -- Reusing provider identity with a different attendee is evidence for manual
  -- review, never an implicit account merge or a second booking.
  select result.booking_record_id, result.outcome
  into observed_record_id, observed_outcome
  from pg_temp.ingest_booking(
    p_digest => repeat('f', 64),
    p_trigger => 'BOOKING_CREATED',
    p_event_at => timestamptz '2026-09-09 18:05:00+00',
    p_uid => 'booking-fixture-rescheduled',
    p_ical_sequence => 3,
    p_attendee_email => 'different-attendee@example.invalid',
    p_start_at => timestamptz '2026-10-01 20:00:00+00',
    p_end_at => timestamptz '2026-10-01 21:00:00+00',
    p_booking_status => 'confirmed',
    p_cal_status => 'ACCEPTED'
  ) as result;

  if observed_record_id is distinct from first_record_id
    or observed_outcome <> 'manual_review'
    or (
      select review_reason
      from public.calcom_webhook_events
      where payload_digest = repeat('f', 64)
        and deployment_target = 'preview'
    ) <> 'immutable_identity_mismatch'
    or (select count(*) from public.booking_records) <> 1 then
    raise exception 'An immutable identity mismatch bypassed manual review.';
  end if;
end;
$test$;

-- Native payload omissions must preserve identity, ordering, and idempotency.
-- Cal may omit iCalUID on a reschedule and may omit both iCalSequence and
-- iCalUID on a rejection. Only a rejection may use provider time without
-- lowering the last trusted sequence, and an older rejection remains stale.
do $test$
declare
  original_record_id uuid;
  observed_record_id uuid;
  observed_outcome text;
begin
  select result.booking_record_id, result.outcome
  into original_record_id, observed_outcome
  from pg_temp.ingest_booking(
    p_digest => repeat('2', 64),
    p_trigger => 'BOOKING_CREATED',
    p_event_at => timestamptz '2026-09-09 19:00:00+00',
    p_uid => 'booking-native-original',
    p_booking_id => 7101,
    p_event_type_id => 9101,
    p_ical_uid => 'booking-native-series@example.invalid',
    p_ical_sequence => 4,
    p_booking_status => 'confirmed',
    p_cal_status => 'ACCEPTED'
  ) as result;

  if original_record_id is null or observed_outcome <> 'applied' then
    raise exception 'The native-payload baseline booking was not applied.';
  end if;

  select result.booking_record_id, result.outcome
  into observed_record_id, observed_outcome
  from pg_temp.ingest_booking(
    p_digest => repeat('3', 64),
    p_trigger => 'BOOKING_RESCHEDULED',
    p_event_at => timestamptz '2026-09-09 19:01:00+00',
    p_uid => 'booking-native-rescheduled',
    p_previous_uid => 'booking-native-original',
    p_booking_id => 7102,
    p_event_type_id => 9101,
    p_ical_uid => null,
    p_ical_sequence => 5,
    p_start_at => timestamptz '2026-10-01 20:00:00+00',
    p_end_at => timestamptz '2026-10-01 21:00:00+00',
    p_booking_status => 'confirmed',
    p_cal_status => 'ACCEPTED'
  ) as result;

  if observed_record_id is distinct from original_record_id
    or observed_outcome <> 'applied'
    or not exists (
      select 1
      from public.booking_records
      where id = original_record_id
        and current_cal_booking_uid = 'booking-native-rescheduled'
        and cal_ical_uid = 'booking-native-series@example.invalid'
        and cal_ical_sequence = 5
        and details_ical_sequence = 5
        and booking_state_ical_sequence = 5
    )
    or (
      select count(*)
      from public.calcom_booking_aliases
      where booking_record_id = original_record_id
        and (
          (
            cal_booking_uid = 'booking-native-original'
            and cal_booking_id = 7101
          )
          or (
            cal_booking_uid = 'booking-native-rescheduled'
            and cal_booking_id = 7102
          )
        )
    ) <> 2 then
    raise exception 'A native reschedule omission lost identity or ordering.';
  end if;

  -- Exact replay keeps the first receipt and does not add evidence rows.
  select result.booking_record_id, result.outcome
  into observed_record_id, observed_outcome
  from pg_temp.ingest_booking(
    p_digest => repeat('3', 64),
    p_trigger => 'BOOKING_RESCHEDULED',
    p_event_at => timestamptz '2026-09-09 19:01:00+00',
    p_uid => 'booking-native-rescheduled',
    p_previous_uid => 'booking-native-original',
    p_booking_id => 7102,
    p_event_type_id => 9101,
    p_ical_uid => null,
    p_ical_sequence => 5,
    p_start_at => timestamptz '2026-10-01 20:00:00+00',
    p_end_at => timestamptz '2026-10-01 21:00:00+00',
    p_booking_status => 'confirmed',
    p_cal_status => 'ACCEPTED'
  ) as result;

  if observed_record_id is distinct from original_record_id
    or observed_outcome <> 'applied'
    or (
      select count(*)
      from public.calcom_webhook_events
      where deployment_target = 'preview'
        and payload_digest = repeat('3', 64)
    ) <> 1 then
    raise exception 'A native omission replay was not idempotent.';
  end if;

  -- A reschedule without a provider sequence is outside the accepted boundary.
  begin
    perform result.booking_record_id
    from pg_temp.ingest_booking(
      p_digest => repeat('8', 64),
      p_trigger => 'BOOKING_RESCHEDULED',
      p_event_at => timestamptz '2026-09-09 19:01:30+00',
      p_uid => 'booking-native-rescheduled-again',
      p_previous_uid => 'booking-native-rescheduled',
      p_booking_id => 7103,
      p_event_type_id => 9101,
      p_ical_uid => null,
      p_ical_sequence => null,
      p_start_at => timestamptz '2026-10-01 22:00:00+00',
      p_end_at => timestamptz '2026-10-01 23:00:00+00',
      p_booking_status => 'confirmed',
      p_cal_status => 'ACCEPTED'
    ) as result;

    raise exception 'A reschedule without iCalSequence was accepted.';
  exception
    when others then
      if sqlerrm <> 'Invalid Cal.com booking event boundary.' then
        raise;
      end if;
  end;

  -- An older rejection with no provider sequence cannot override newer state.
  select result.booking_record_id, result.outcome
  into observed_record_id, observed_outcome
  from pg_temp.ingest_booking(
    p_digest => repeat('4', 64),
    p_trigger => 'BOOKING_REJECTED',
    p_event_at => timestamptz '2026-09-09 18:59:00+00',
    p_uid => 'booking-native-rescheduled',
    p_booking_id => 7102,
    p_event_type_id => 9101,
    p_ical_uid => null,
    p_ical_sequence => null,
    p_start_at => timestamptz '2026-10-01 20:00:00+00',
    p_end_at => timestamptz '2026-10-01 21:00:00+00',
    p_booking_status => 'rejected',
    p_cal_status => 'REJECTED'
  ) as result;

  if observed_record_id is distinct from original_record_id
    or observed_outcome <> 'ignored_stale'
    or (
      select booking_status
      from public.booking_records
      where id = original_record_id
    ) <> 'confirmed' then
    raise exception 'An older inferred rejection overrode newer booking state.';
  end if;

  -- A newer rejection applies but retains the trusted explicit sequence.
  select result.booking_record_id, result.outcome
  into observed_record_id, observed_outcome
  from pg_temp.ingest_booking(
    p_digest => repeat('5', 64),
    p_trigger => 'BOOKING_REJECTED',
    p_event_at => timestamptz '2026-09-09 19:02:00+00',
    p_uid => 'booking-native-rescheduled',
    p_booking_id => 7102,
    p_event_type_id => 9101,
    p_ical_uid => null,
    p_ical_sequence => null,
    p_start_at => timestamptz '2026-10-01 20:00:00+00',
    p_end_at => timestamptz '2026-10-01 21:00:00+00',
    p_booking_status => 'rejected',
    p_cal_status => 'REJECTED'
  ) as result;

  if observed_record_id is distinct from original_record_id
    or observed_outcome <> 'applied'
    or not exists (
      select 1
      from public.booking_records
      where id = original_record_id
        and booking_status = 'rejected'
        and cal_ical_sequence = 5
        and booking_state_ical_sequence = 5
    ) then
    raise exception 'A newer inferred rejection was not safely applied.';
  end if;
end;
$test$;

-- A null cancellation is not itself proof that Cal scheduling was free. It may
-- mutate only a booking with earlier accepted non-cancellation evidence; a
-- first-seen null cancellation is retained for review without creating a row.
do $test$
declare
  free_record_id uuid;
  observed_record_id uuid;
  observed_outcome text;
begin
  select result.booking_record_id, result.outcome
  into observed_record_id, observed_outcome
  from pg_temp.ingest_booking(
    p_digest => repeat('6', 64),
    p_trigger => 'BOOKING_CANCELLED',
    p_event_at => timestamptz '2026-09-09 20:00:00+00',
    p_uid => 'booking-null-cancellation-unverified',
    p_booking_id => 7201,
    p_event_type_id => 9201,
    p_ical_uid => 'booking-null-unverified@example.invalid',
    p_ical_sequence => 1,
    p_booking_status => 'cancelled',
    p_cal_status => 'CANCELLED',
    p_provider_price_was_null => true
  ) as result;

  if observed_record_id is not null
    or observed_outcome <> 'manual_review'
    or exists (
      select 1
      from public.booking_records
      where deployment_target = 'preview'
        and current_cal_booking_uid = 'booking-null-cancellation-unverified'
    )
    or not exists (
      select 1
      from public.calcom_webhook_events
      where deployment_target = 'preview'
        and payload_digest = repeat('6', 64)
        and booking_record_id is null
        and processing_outcome = 'manual_review'
        and review_reason = 'unverified_null_price_cancellation'
    ) then
    raise exception 'A first-seen null cancellation bypassed manual review.';
  end if;

  select result.booking_record_id, result.outcome
  into free_record_id, observed_outcome
  from pg_temp.ingest_booking(
    p_digest => repeat('7', 64),
    p_trigger => 'BOOKING_CREATED',
    p_event_at => timestamptz '2026-09-09 20:10:00+00',
    p_uid => 'booking-null-cancellation-verified',
    p_booking_id => 7301,
    p_event_type_id => 9301,
    p_ical_uid => 'booking-null-verified@example.invalid',
    p_ical_sequence => 0,
    p_booking_status => 'confirmed',
    p_cal_status => 'ACCEPTED'
  ) as result;

  if free_record_id is null or observed_outcome <> 'applied' then
    raise exception 'The verified free-booking baseline was not applied.';
  end if;

  select result.booking_record_id, result.outcome
  into observed_record_id, observed_outcome
  from pg_temp.ingest_booking(
    p_digest => repeat('9', 64),
    p_trigger => 'BOOKING_CANCELLED',
    p_event_at => timestamptz '2026-09-09 20:11:00+00',
    p_uid => 'booking-null-cancellation-verified',
    p_booking_id => 7301,
    p_event_type_id => 9301,
    p_ical_uid => 'booking-null-verified@example.invalid',
    p_ical_sequence => 1,
    p_booking_status => 'cancelled',
    p_cal_status => 'CANCELLED',
    p_provider_price_was_null => true
  ) as result;

  if observed_record_id is distinct from free_record_id
    or observed_outcome <> 'applied'
    or not exists (
      select 1
      from public.booking_records
      where id = free_record_id
        and booking_status = 'cancelled'
    ) then
    raise exception 'A null cancellation with prior free evidence was rejected.';
  end if;
end;
$test$;

-- If rejection arrives first without iCal identity, an older Created delivery
-- may backfill only the missing stable iCal UID. It must not reopen the rejected
-- booking or replace any non-null identity.
do $test$
declare
  rejected_record_id uuid;
  observed_record_id uuid;
  observed_outcome text;
begin
  select result.booking_record_id, result.outcome
  into rejected_record_id, observed_outcome
  from pg_temp.ingest_booking(
    p_digest => repeat('0', 64),
    p_trigger => 'BOOKING_REJECTED',
    p_event_at => timestamptz '2026-09-09 21:01:00+00',
    p_uid => 'booking-rejection-first',
    p_booking_id => 7401,
    p_event_type_id => 9401,
    p_ical_uid => null,
    p_ical_sequence => null,
    p_booking_status => 'rejected',
    p_cal_status => 'REJECTED'
  ) as result;

  if rejected_record_id is null
    or observed_outcome <> 'applied'
    or not exists (
      select 1
      from public.booking_records
      where id = rejected_record_id
        and cal_ical_uid is null
        and booking_status = 'rejected'
    ) then
    raise exception 'The rejection-first baseline was not applied.';
  end if;

  select result.booking_record_id, result.outcome
  into observed_record_id, observed_outcome
  from pg_temp.ingest_booking(
    p_digest => repeat('0', 63) || '1',
    p_trigger => 'BOOKING_CREATED',
    p_event_at => timestamptz '2026-09-09 21:00:00+00',
    p_uid => 'booking-rejection-first',
    p_booking_id => 7401,
    p_event_type_id => 9401,
    p_ical_uid => 'booking-rejection-first@example.invalid',
    p_ical_sequence => 0,
    p_booking_status => 'confirmed',
    p_cal_status => 'ACCEPTED'
  ) as result;

  if observed_record_id is distinct from rejected_record_id
    or observed_outcome <> 'applied'
    or not exists (
      select 1
      from public.booking_records
      where id = rejected_record_id
        and cal_ical_uid = 'booking-rejection-first@example.invalid'
        and booking_status = 'rejected'
        and details_event_at = timestamptz '2026-09-09 21:01:00+00'
        and booking_state_event_at = timestamptz '2026-09-09 21:01:00+00'
  ) then
    raise exception 'An inverse delivery did not perform a null-only iCal UID backfill.';
  end if;

  select result.booking_record_id, result.outcome
  into observed_record_id, observed_outcome
  from pg_temp.ingest_booking(
    p_digest => repeat('0', 63) || '2',
    p_trigger => 'BOOKING_CREATED',
    p_event_at => timestamptz '2026-09-09 21:02:00+00',
    p_uid => 'booking-rejection-first',
    p_booking_id => 7401,
    p_event_type_id => 9401,
    p_ical_uid => 'conflicting-series@example.invalid',
    p_ical_sequence => 1,
    p_booking_status => 'confirmed',
    p_cal_status => 'ACCEPTED'
  ) as result;

  if observed_record_id is distinct from rejected_record_id
    or observed_outcome <> 'manual_review'
    or not exists (
      select 1
      from public.booking_records
      where id = rejected_record_id
        and cal_ical_uid = 'booking-rejection-first@example.invalid'
        and booking_status = 'rejected'
    )
    or not exists (
      select 1
      from public.calcom_webhook_events
      where deployment_target = 'preview'
        and payload_digest = repeat('0', 63) || '2'
        and booking_record_id = rejected_record_id
        and processing_outcome = 'manual_review'
        and review_reason = 'immutable_identity_mismatch'
    ) then
    raise exception 'A non-null iCal UID was overwritten after inverse delivery.';
  end if;
end;
$test$;

-- The same provider identity may exist once in each explicit deployment
-- namespace; it must never collide with or mutate the Preview record.
do $test$
declare
  development_record_id uuid;
  observed_outcome text;
begin
  select result.booking_record_id, result.outcome
  into development_record_id, observed_outcome
  from pg_temp.ingest_booking(
    p_digest => repeat('a', 64),
    p_deployment_target => 'development'
  ) as result;

  if development_record_id is null
    or observed_outcome <> 'applied'
    or (
      select count(*)
      from public.booking_records
      where cal_ical_uid = 'booking-fixture-series@example.invalid'
    ) <> 2 then
    raise exception 'The explicit deployment namespace was not isolated.';
  end if;

  if not exists (
    select 1
    from public.booking_records
    where id = development_record_id
      and deployment_target = 'development'
      and current_cal_booking_uid = 'booking-fixture-original'
  ) or (
    select count(*)
    from public.calcom_booking_aliases
    where cal_booking_uid = 'booking-fixture-original'
      and deployment_target in ('development', 'preview')
  ) <> 2 then
    raise exception 'The deployment-scoped booking aliases were not isolated.';
  end if;
end;
$test$;

-- A booking created before a member account exists remains unclaimed. Only a
-- confirmed Auth user with a matching profile email can claim it.
do $test$
declare
  claimed_count integer;
  unclaimed_record_id uuid;
begin
  select result.booking_record_id
  into unclaimed_record_id
  from pg_temp.ingest_booking(
    p_digest => repeat('1', 64),
    p_uid => 'booking-late-member',
    p_booking_id => 7002,
    p_event_type_id => 9002,
    p_ical_uid => 'booking-late-member-series@example.invalid',
    p_attendee_name => 'Late Member',
    p_attendee_email => 'late-member@example.invalid'
  ) as result;

  if unclaimed_record_id is null or exists (
    select 1
    from public.booking_records
    where id = unclaimed_record_id
      and user_id is not null
  ) then
    raise exception 'A guest booking was linked without a confirmed member.';
  end if;

  insert into auth.users (
    id,
    email,
    email_confirmed_at,
    raw_user_meta_data
  ) values (
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    'late-member@example.invalid',
    timestamptz '2026-09-09 18:10:00+00',
    '{}'::jsonb
  );

  select public.claim_calcom_bookings_for_member(
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    'preview',
    'hwlbysmd'
  ) into claimed_count;

  if claimed_count <> 1 or not exists (
    select 1
    from public.booking_records
    where id = unclaimed_record_id
      and user_id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
      and member_claimed_at is not null
  ) then
    raise exception 'The confirmed member claim did not link the exact booking.';
  end if;

  select public.claim_calcom_bookings_for_member(
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    'preview',
    'hwlbysmd'
  ) into claimed_count;

  if claimed_count <> 0 then
    raise exception 'A repeated confirmed member claim was not idempotent.';
  end if;
end;
$test$;

-- Append-only evidence must reject privileged mutation as well as runtime-role
-- access. Booking records remain updateable only through the governed RPC.
do $test$
declare
  mutation_rejected boolean;
begin
  mutation_rejected := false;
  begin
    update public.calcom_booking_aliases
    set first_seen_at = first_seen_at + interval '1 second'
    where deployment_target = 'preview'
      and cal_booking_uid = 'booking-fixture-original';
  exception
    when others then
      mutation_rejected := sqlerrm = 'Booking evidence is append-only.';
  end;
  if not mutation_rejected then
    raise exception 'Alias append-only evidence could be updated.';
  end if;

  mutation_rejected := false;
  begin
    delete from public.calcom_webhook_events
    where deployment_target = 'preview'
      and payload_digest = repeat('a', 64);
  exception
    when others then
      mutation_rejected := sqlerrm = 'Booking evidence is append-only.';
  end;
  if not mutation_rejected then
    raise exception 'Webhook append-only evidence could be deleted.';
  end if;
end;
$test$;

rollback;
