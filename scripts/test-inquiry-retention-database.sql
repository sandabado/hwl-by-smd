-- Run only after migration 015 in an isolated local or owner-approved staging
-- database. The complete test is transactional and always rolls back.

begin;

set local lock_timeout = '5s';

do $test$
declare
  runtime_role text;
begin
  foreach runtime_role in array array['anon', 'authenticated', 'service_role']
  loop
    if has_table_privilege(
      runtime_role,
      'public.inquiry_retention_runs',
      'SELECT,INSERT,UPDATE,DELETE'
    ) then
      raise exception '% can access inquiry retention evidence.', runtime_role;
    end if;

    if has_function_privilege(
      runtime_role,
      'public.get_inquiry_retention_candidates(timestamptz)',
      'EXECUTE'
    ) or has_function_privilege(
      runtime_role,
      'public.set_inquiry_retention_hold(uuid,text)',
      'EXECUTE'
    ) or has_function_privilege(
      runtime_role,
      'public.purge_inquiry_retention_candidates(timestamptz,uuid[],text)',
      'EXECUTE'
    ) then
      raise exception '% can execute owner-only retention functions.',
        runtime_role;
    end if;

    if has_table_privilege(
      runtime_role,
      'public.inquiries',
      'INSERT,UPDATE,DELETE'
    ) or has_column_privilege(
      runtime_role,
      'public.inquiries',
      'retention_hold_reason',
      'UPDATE'
    ) or has_column_privilege(
      runtime_role,
      'public.inquiries',
      'retention_hold_set_at',
      'UPDATE'
    ) then
      raise exception '% can mutate inquiry retention state.', runtime_role;
    end if;
  end loop;
end;
$test$;

-- Prove that even a legacy-compatible p_limit above five cannot admit a sixth
-- request. The migration trigger must preserve the existing RPC's graceful
-- rate_limited result rather than surfacing a constraint failure.
savepoint approved_rate_limit_cap;

do $test$
declare
  attempt integer;
  was_created boolean;
  was_rate_limited boolean;
begin
  for attempt in 1..6 loop
    select result.created, result.rate_limited
    into was_created, was_rate_limited
    from public.record_inquiry_submission(
      p_submission_id => (
        '10000000-0000-4000-8000-' || lpad(attempt::text, 12, '0')
      )::uuid,
      p_fingerprint => repeat('1', 64),
      p_payload_digest => repeat(attempt::text, 64),
      p_limit => 20,
      p_source => 'website-inquiry',
      p_name => 'Rate-limit fixture',
      p_email => 'rate-limit-fixture@example.invalid',
      p_message => 'Approved five-per-hour boundary fixture',
      p_booking_preference => null,
      p_date_preference => null,
      p_event_date => null,
      p_format => null,
      p_guest_count => null,
      p_group_size => null,
      p_interests => null,
      p_location => null,
      p_organization => null,
      p_phone => null,
      p_preferred_date => null,
      p_preferred_window => null,
      p_service => null,
      p_service_slug => null,
      p_services => null,
      p_subject => null,
      p_time_zone => null
    ) as result;

    if attempt <= 5 and (was_created is distinct from true
      or was_rate_limited is distinct from false) then
      raise exception 'An allowed request was not recorded at attempt %.',
        attempt;
    end if;

    if attempt = 6 and (was_created is distinct from false
      or was_rate_limited is distinct from true) then
      raise exception 'A sixth request did not return the rate-limited result.';
    end if;
  end loop;

  if (
    select submission_count
    from public.inquiry_submission_limits
    where fingerprint = repeat('1', 64)
  ) is distinct from 5 then
    raise exception 'The database rate-limit row advanced above five.';
  end if;

  if (
    select count(*)
    from public.inquiries
    where submission_id::text like '10000000-0000-4000-8000-%'
  ) <> 5 then
    raise exception 'The database admitted more or fewer than five requests.';
  end if;
end;
$test$;

rollback to savepoint approved_rate_limit_cap;

insert into public.inquiries (
  id,
  submission_id,
  payload_digest,
  source,
  name,
  email,
  message,
  created_at
) values
  (
    '00000000-0000-4000-8000-000000000101',
    '00000000-0000-4000-8000-000000000201',
    repeat('a', 64),
    'contact-page',
    'Retention fixture',
    'retention-fixture@example.invalid',
    'Old and unheld',
    timestamptz '1999-12-31 23:59:59+00'
  ),
  (
    '00000000-0000-4000-8000-000000000102',
    '00000000-0000-4000-8000-000000000202',
    repeat('b', 64),
    'journal-newsletter',
    'Retention fixture',
    'retention-fixture@example.invalid',
    'Exactly on the retention boundary',
    timestamptz '2000-01-01 00:00:00+00'
  ),
  (
    '00000000-0000-4000-8000-000000000103',
    '00000000-0000-4000-8000-000000000203',
    repeat('c', 64),
    'booking-request',
    'Retention fixture',
    'retention-fixture@example.invalid',
    'Old with an active-service hold',
    timestamptz '1999-01-01 00:00:00+00'
  ),
  (
    '00000000-0000-4000-8000-000000000104',
    '00000000-0000-4000-8000-000000000204',
    repeat('d', 64),
    'retreat-partnership-inquiry',
    'Retention fixture',
    'retention-fixture@example.invalid',
    'Fresh and ineligible',
    timestamptz '2000-01-01 00:00:01+00'
  );

-- Exercise every approved hold reason, clearing between each one. The database
-- stores only current hold state; the required external append-only decision
-- history is an operator control documented in the runbook.
do $test$
declare
  approved_reason text;
  observed_reason text;
  observed_set_at timestamptz;
begin
  foreach approved_reason in array array[
    'active_service',
    'legal',
    'safety',
    'dispute'
  ]
  loop
    select hold.retention_hold_reason, hold.retention_hold_set_at
    into observed_reason, observed_set_at
    from public.set_inquiry_retention_hold(
      '00000000-0000-4000-8000-000000000103',
      approved_reason
    ) as hold;

    if observed_reason is distinct from approved_reason
      or observed_set_at is null then
      raise exception 'Approved hold reason % was not stored coherently.',
        approved_reason;
    end if;

    perform *
    from public.set_inquiry_retention_hold(
      '00000000-0000-4000-8000-000000000103',
      null
    );

    if exists (
      select 1
      from public.inquiries
      where id = '00000000-0000-4000-8000-000000000103'
        and (
          retention_hold_reason is not null
          or retention_hold_set_at is not null
        )
    ) then
      raise exception 'Clearing hold reason % left mutable hold state.',
        approved_reason;
    end if;
  end loop;

  perform *
  from public.set_inquiry_retention_hold(
    '00000000-0000-4000-8000-000000000103',
    'active_service'
  );
end;
$test$;

insert into public.inquiry_submission_limits (
  fingerprint,
  window_started_at,
  submission_count,
  last_seen_at
) values
  (
    repeat('e', 64),
    pg_catalog.statement_timestamp() - interval '31 days',
    1,
    pg_catalog.statement_timestamp() - interval '31 days'
  ),
  (
    repeat('f', 64),
    pg_catalog.statement_timestamp() - interval '29 days',
    1,
    pg_catalog.statement_timestamp() - interval '29 days'
  );

do $test$
declare
  candidate_ids uuid[];
  inquiry_rows_before bigint;
  limit_rows_before bigint;
  run_rows_before bigint;
begin
  select array_agg(candidate.inquiry_id order by candidate.inquiry_id)
  into candidate_ids
  from public.get_inquiry_retention_candidates(
    timestamptz '2001-01-01 00:00:00+00'
  ) as candidate;

  if candidate_ids is distinct from array[
    '00000000-0000-4000-8000-000000000101'::uuid,
    '00000000-0000-4000-8000-000000000102'::uuid
  ] then
    raise exception 'The 12-month candidate boundary or hold exclusion drifted.';
  end if;

  select count(*) into inquiry_rows_before from public.inquiries;
  select count(*) into limit_rows_before from public.inquiry_submission_limits;
  select count(*) into run_rows_before from public.inquiry_retention_runs;

  begin
    perform *
    from public.get_inquiry_retention_candidates(null::timestamptz);
    raise exception 'A null candidate review time was accepted.';
  exception
    when invalid_parameter_value then null;
  end;

  begin
    perform *
    from public.get_inquiry_retention_candidates(
      pg_catalog.statement_timestamp() + interval '1 minute'
    );
    raise exception 'A future candidate review time was accepted.';
  exception
    when invalid_parameter_value then null;
  end;

  begin
    perform *
    from public.purge_inquiry_retention_candidates(
      timestamptz '2001-01-01 00:00:00+00',
      array['00000000-0000-4000-8000-000000000101'::uuid],
      'admin@ghosthand.studio'
    );
    raise exception 'A partial reviewed candidate set was accepted.';
  exception
    when sqlstate '40001' then null;
  end;

  begin
    perform *
    from public.purge_inquiry_retention_candidates(
      timestamptz '2001-01-01 00:00:00+00',
      array[
        '00000000-0000-4000-8000-000000000101'::uuid,
        '00000000-0000-4000-8000-000000000102'::uuid,
        '00000000-0000-4000-8000-000000000103'::uuid
      ],
      'admin@ghosthand.studio'
    );
    raise exception 'A held inquiry was accepted as a purge candidate.';
  exception
    when sqlstate '40001' then null;
  end;

  begin
    perform *
    from public.purge_inquiry_retention_candidates(
      timestamptz '2001-01-01 00:00:00+00',
      array[
        '00000000-0000-4000-8000-000000000101'::uuid,
        '00000000-0000-4000-8000-000000000102'::uuid,
        '00000000-0000-4000-8000-000000000104'::uuid
      ],
      'admin@ghosthand.studio'
    );
    raise exception 'A fresh inquiry was accepted as a purge candidate.';
  exception
    when sqlstate '40001' then null;
  end;

  begin
    perform *
    from public.purge_inquiry_retention_candidates(
      timestamptz '2001-01-01 00:00:00+00',
      array[
        '00000000-0000-4000-8000-000000000101'::uuid,
        '00000000-0000-4000-8000-000000000102'::uuid,
        '00000000-0000-4000-8000-000000000199'::uuid
      ],
      'admin@ghosthand.studio'
    );
    raise exception 'A nonexistent extra reviewed ID was accepted.';
  exception
    when sqlstate '40001' then null;
  end;

  begin
    perform *
    from public.purge_inquiry_retention_candidates(
      timestamptz '2001-01-01 00:00:00+00',
      array[
        '00000000-0000-4000-8000-000000000101'::uuid,
        '00000000-0000-4000-8000-000000000101'::uuid,
        '00000000-0000-4000-8000-000000000102'::uuid
      ],
      'admin@ghosthand.studio'
    );
    raise exception 'Duplicate reviewed candidate IDs were accepted.';
  exception
    when invalid_parameter_value then null;
  end;

  begin
    perform *
    from public.purge_inquiry_retention_candidates(
      null::timestamptz,
      candidate_ids,
      'admin@ghosthand.studio'
    );
    raise exception 'A null purge review time was accepted.';
  exception
    when invalid_parameter_value then null;
  end;

  begin
    perform *
    from public.purge_inquiry_retention_candidates(
      pg_catalog.statement_timestamp() + interval '1 minute',
      candidate_ids,
      'admin@ghosthand.studio'
    );
    raise exception 'A future purge review time was accepted.';
  exception
    when invalid_parameter_value then null;
  end;

  begin
    perform *
    from public.purge_inquiry_retention_candidates(
      timestamptz '2001-01-01 00:00:00+00',
      null::uuid[],
      'admin@ghosthand.studio'
    );
    raise exception 'A null purge ID set was accepted.';
  exception
    when invalid_parameter_value then null;
  end;

  begin
    perform *
    from public.purge_inquiry_retention_candidates(
      timestamptz '2001-01-01 00:00:00+00',
      array[
        '00000000-0000-4000-8000-000000000101'::uuid,
        null::uuid,
        '00000000-0000-4000-8000-000000000102'::uuid
      ],
      'admin@ghosthand.studio'
    );
    raise exception 'A null member in the purge ID set was accepted.';
  exception
    when invalid_parameter_value then null;
  end;

  begin
    perform *
    from public.purge_inquiry_retention_candidates(
      timestamptz '2001-01-01 00:00:00+00',
      candidate_ids,
      'shannon@hwlbysmd.com'
    );
    raise exception 'A non-designated purge operator was accepted.';
  exception
    when invalid_parameter_value then null;
  end;

  begin
    perform *
    from public.set_inquiry_retention_hold(
      '00000000-0000-4000-8000-000000000103',
      'other'
    );
    raise exception 'An unapproved hold reason was accepted.';
  exception
    when invalid_parameter_value then null;
  end;

  begin
    perform *
    from public.set_inquiry_retention_hold(null::uuid, 'legal');
    raise exception 'A null hold target was accepted.';
  exception
    when invalid_parameter_value then null;
  end;

  begin
    perform *
    from public.set_inquiry_retention_hold(
      '00000000-0000-4000-8000-000000000199',
      'legal'
    );
    raise exception 'A missing hold target was accepted.';
  exception
    when no_data_found then null;
  end;

  if (select count(*) from public.inquiries) <> inquiry_rows_before
    or (select count(*) from public.inquiry_submission_limits)
      <> limit_rows_before
    or (select count(*) from public.inquiry_retention_runs) <> run_rows_before
    or not exists (
      select 1
      from public.inquiries
      where id = '00000000-0000-4000-8000-000000000103'
        and retention_hold_reason = 'active_service'
        and retention_hold_set_at is not null
    ) then
    raise exception 'A rejected retention operation left partial mutations.';
  end if;
end;
$test$;

create temporary table retention_test_deleted on commit drop as
select *
from public.purge_inquiry_retention_candidates(
  timestamptz '2001-01-01 00:00:00+00',
  array[
    '00000000-0000-4000-8000-000000000101'::uuid,
    '00000000-0000-4000-8000-000000000102'::uuid
  ],
  'admin@ghosthand.studio'
);

do $test$
declare
  run_identifier uuid;
begin
  if (select count(*) from retention_test_deleted) <> 2 then
    raise exception 'The exact purge did not return two deleted inquiry IDs.';
  end if;

  select run_id
  into run_identifier
  from retention_test_deleted
  limit 1;

  if run_identifier is null
    or exists (
      select 1
      from retention_test_deleted
      where run_id <> run_identifier
    ) then
    raise exception 'The purge did not return one stable run identifier.';
  end if;

  if exists (
    select 1
    from public.inquiries
    where id in (
      '00000000-0000-4000-8000-000000000101',
      '00000000-0000-4000-8000-000000000102'
    )
  ) then
    raise exception 'An exact eligible inquiry survived the purge.';
  end if;

  if (
    select count(*)
    from public.inquiries
    where id in (
      '00000000-0000-4000-8000-000000000103',
      '00000000-0000-4000-8000-000000000104'
    )
  ) <> 2 then
    raise exception 'A held or fresh inquiry was deleted.';
  end if;

  if exists (
    select 1
    from public.inquiry_submission_limits
    where fingerprint = repeat('e', 64)
  ) or not exists (
    select 1
    from public.inquiry_submission_limits
    where fingerprint = repeat('f', 64)
  ) then
    raise exception 'The 30-day rate-limit cleanup boundary drifted.';
  end if;

  if not exists (
    select 1
    from public.inquiry_retention_runs
    where id = run_identifier
      and operator_email = 'admin@ghosthand.studio'
      and reviewed_at = timestamptz '2001-01-01 00:00:00+00'
      and cutoff_at = timestamptz '2000-01-01 00:00:00+00'
      and rate_limit_cutoff_at = executed_at - interval '30 days'
      and rate_limit_cutoff_at > reviewed_at
      and candidate_count = 2
      and held_count = 1
      and deleted_count = 2
      and rate_limit_deleted_count = 1
  ) then
    raise exception 'The aggregate retention-run evidence is incomplete.';
  end if;

  begin
    update public.inquiry_retention_runs
    set deleted_count = deleted_count
    where id = run_identifier;
    raise exception 'Retention-run evidence was mutable.';
  exception
    when object_not_in_prerequisite_state then null;
  end;

  begin
    delete from public.inquiry_retention_runs
    where id = run_identifier;
    raise exception 'Retention-run evidence could be deleted.';
  exception
    when object_not_in_prerequisite_state then null;
  end;
end;
$test$;

-- A month with no eligible inquiries is still a valid, auditable run and still
-- evaluates the actual 30-day fingerprint boundary.
create temporary table retention_test_zero_run on commit drop as
select *
from public.purge_inquiry_retention_candidates(
  timestamptz '2001-01-01 00:00:00+00',
  array[]::uuid[],
  'admin@ghosthand.studio'
);

do $test$
declare
  zero_run_identifier uuid;
begin
  if (select count(*) from retention_test_zero_run) <> 1
    or exists (
      select 1
      from retention_test_zero_run
      where deleted_inquiry_id is not null
    ) then
    raise exception 'A zero-candidate purge did not return one null-ID result.';
  end if;

  select run_id
  into zero_run_identifier
  from retention_test_zero_run;

  if not exists (
    select 1
    from public.inquiry_retention_runs
    where id = zero_run_identifier
      and operator_email = 'admin@ghosthand.studio'
      and reviewed_at = timestamptz '2001-01-01 00:00:00+00'
      and cutoff_at = timestamptz '2000-01-01 00:00:00+00'
      and rate_limit_cutoff_at = executed_at - interval '30 days'
      and candidate_count = 0
      and held_count = 1
      and deleted_count = 0
      and rate_limit_deleted_count = 0
  ) then
    raise exception 'Zero-candidate run evidence is incomplete.';
  end if;

  if not exists (
    select 1
    from public.inquiry_submission_limits
    where fingerprint = repeat('f', 64)
  ) then
    raise exception 'A fingerprint younger than 30 days was deleted.';
  end if;
end;
$test$;

rollback;
