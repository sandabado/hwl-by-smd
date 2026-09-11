\set ON_ERROR_STOP on

-- Run only after migrations through 018 in an isolated local database. Every
-- fixture, simulated Auth claim, assertion, and schema probe is enclosed in
-- this transaction and the script always rolls back.

begin;

set local lock_timeout = '5s';

create or replace function pg_temp.assert_true(
  observed boolean,
  assertion_name text
)
returns void
language plpgsql
as $function$
begin
  if observed is distinct from true then
    raise exception '%: expected true.', assertion_name;
  end if;
end;
$function$;

create or replace function pg_temp.assert_count(
  observed bigint,
  expected bigint,
  assertion_name text
)
returns void
language plpgsql
as $function$
begin
  if observed is distinct from expected then
    raise exception '%: expected %, observed %.',
      assertion_name,
      expected,
      observed;
  end if;
end;
$function$;

insert into auth.users (id, email, email_confirmed_at, raw_user_meta_data)
values
  (
    '18181818-0000-4000-8000-000000000001',
    'super-admin-fixture@example.invalid',
    pg_catalog.now(),
    '{}'::jsonb
  ),
  (
    '18181818-0000-4000-8000-000000000002',
    'administrator-fixture@example.invalid',
    pg_catalog.now(),
    '{}'::jsonb
  ),
  (
    '18181818-0000-4000-8000-000000000003',
    'insert-delete-fixture@example.invalid',
    pg_catalog.now(),
    '{}'::jsonb
  ),
  (
    '18181818-0000-4000-8000-000000000004',
    'member-one-fixture@example.invalid',
    pg_catalog.now(),
    '{}'::jsonb
  ),
  (
    '18181818-0000-4000-8000-000000000005',
    'member-two-fixture@example.invalid',
    pg_catalog.now(),
    '{}'::jsonb
  ),
  (
    '18181818-0000-4000-8000-000000000006',
    'unconfirmed-fixture@example.invalid',
    null,
    '{}'::jsonb
  );

-- The check itself, not only the legacy NOT NULL attribute, rejects NULL and
-- every contradictory flag/role pair. The synchronization trigger is disabled
-- only for this rollback-only constraint probe and is restored immediately.
alter table public.profiles
  alter column is_admin drop not null;
alter table public.profiles
  disable trigger profiles_synchronize_admin_role;

do $test$
begin
  begin
    update public.profiles
    set is_admin = null, admin_role = null
    where id = '18181818-0000-4000-8000-000000000004';
    raise exception 'NULL administrator state unexpectedly passed the role constraint.';
  exception
    when check_violation then null;
  end;

  begin
    update public.profiles
    set is_admin = false, admin_role = 'administrator'
    where id = '18181818-0000-4000-8000-000000000004';
    raise exception 'A role with a false administrator flag unexpectedly passed.';
  exception
    when check_violation then null;
  end;

  begin
    update public.profiles
    set is_admin = true, admin_role = null
    where id = '18181818-0000-4000-8000-000000000004';
    raise exception 'A true administrator flag without a role unexpectedly passed.';
  exception
    when check_violation then null;
  end;
end;
$test$;

alter table public.profiles
  enable trigger profiles_synchronize_admin_role;
alter table public.profiles
  alter column is_admin set not null;

-- Recreate one disposable pre-018 row to execute the migration-only backfill
-- branch. The live constraint and both role triggers are restored before any
-- later assertion, and the outer transaction rolls every probe back.
alter table public.profiles
  drop constraint profiles_admin_role_check;
alter table public.profiles
  disable trigger profiles_synchronize_admin_role;
alter table public.profiles
  disable trigger profiles_record_admin_role_change;

update public.profiles
set is_admin = true, admin_role = null
where id = '18181818-0000-4000-8000-000000000006';

alter table public.profiles
  enable trigger profiles_synchronize_admin_role;
alter table public.profiles
  enable trigger profiles_record_admin_role_change;

select pg_catalog.set_config(
  'hwl.admin_change_reference',
  'migration-018:legacy-admin-backfill',
  true
);
update public.profiles
set admin_role = 'administrator'
where id = '18181818-0000-4000-8000-000000000006'
  and is_admin is true
  and admin_role is null;

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

select pg_temp.assert_count(
  (
    select pg_catalog.count(*)
    from public.admin_role_change_audit
    where target_user_id = '18181818-0000-4000-8000-000000000006'
      and operation = 'backfill'
      and change_reference = 'migration-018:legacy-admin-backfill'
      and previous_role = 'legacy_admin'
      and next_role = 'administrator'
      and previous_is_admin is true
      and next_is_admin is true
  ),
  1,
  'legacy backfill sentinel audit evidence'
);

select pg_catalog.set_config(
  'request.jwt.claim.sub',
  '18181818-0000-4000-8000-000000000006',
  true
);
set local role authenticated;

select pg_temp.assert_true(
  (select public.current_admin_role() is null),
  'unconfirmed identity denied a current administrator role'
);
select pg_temp.assert_true(
  (select public.is_current_user_admin() is false),
  'unconfirmed identity denied by the legacy administrator helper'
);

reset role;
select pg_catalog.set_config('request.jwt.claim.sub', '', true);

-- Browser users cannot write either privileged profile field, and the role RPC
-- is exposed only to authenticated users. Service-role table writes remain
-- possible for trusted operations, but the trigger below makes a same-
-- transaction change reference mandatory and records their result.
do $test$
begin
  if has_column_privilege(
    'authenticated',
    'public.profiles',
    'is_admin',
    'UPDATE'
  ) or has_column_privilege(
    'authenticated',
    'public.profiles',
    'admin_role',
    'UPDATE'
  ) then
    raise exception 'authenticated can directly update a privileged profile field.';
  end if;

  if not has_column_privilege(
    'authenticated',
    'public.profiles',
    'full_name',
    'UPDATE'
  ) then
    raise exception 'authenticated lost its narrow full_name update grant.';
  end if;

  if not has_table_privilege(
    'service_role',
    'public.profiles',
    'INSERT'
  ) or not has_table_privilege(
    'service_role',
    'public.profiles',
    'UPDATE'
  ) or not has_table_privilege(
    'service_role',
    'public.profiles',
    'DELETE'
  ) then
    raise exception 'service_role lost required row-level profile DML.';
  end if;

  if has_table_privilege(
    'service_role',
    'public.profiles',
    'TRUNCATE,REFERENCES,TRIGGER'
  ) then
    raise exception 'service_role retains a profile operation that can bypass role audit controls.';
  end if;

  if not has_function_privilege(
    'authenticated',
    'public.change_admin_role(uuid,text,text,text,text)',
    'EXECUTE'
  ) then
    raise exception 'authenticated is missing the narrow role-change RPC.';
  end if;

  if has_function_privilege(
    'anon',
    'public.change_admin_role(uuid,text,text,text,text)',
    'EXECUTE'
  ) or has_function_privilege(
    'service_role',
    'public.change_admin_role(uuid,text,text,text,text)',
    'EXECUTE'
  ) then
    raise exception 'A non-authenticated runtime role can execute the role-change RPC.';
  end if;

  if has_table_privilege(
    'authenticated',
    'public.admin_role_change_audit',
    'SELECT,INSERT,UPDATE,DELETE'
  ) then
    raise exception 'authenticated can access the private role audit directly.';
  end if;

  if not has_table_privilege(
    'service_role',
    'public.admin_role_change_audit',
    'SELECT'
  ) or has_table_privilege(
    'service_role',
    'public.admin_role_change_audit',
    'INSERT,UPDATE,DELETE'
  ) then
    raise exception 'service_role role-audit privileges are not read-only.';
  end if;

  if exists (
    select 1
    from pg_catalog.pg_constraint
    where conrelid = 'public.admin_role_change_audit'::regclass
      and contype = 'f'
      and confrelid = 'public.profiles'::regclass
  ) then
    raise exception 'Role audit target UUIDs would be deleted with profiles.';
  end if;

  if (
    select pg_catalog.count(*)
    from pg_catalog.pg_constraint
    where conrelid = 'public.admin_role_change_audit'::regclass
      and conname in (
        'admin_role_change_audit_previous_state_check',
        'admin_role_change_audit_next_state_check',
        'admin_role_change_audit_operation_state_check'
      )
  ) <> 3 then
    raise exception 'A role-audit state invariant constraint is missing.';
  end if;
end;
$test$;

-- Operation semantics are fully two-valued: NULL role states cannot exploit
-- SQL CHECK's UNKNOWN behavior to masquerade as insert/update/delete/backfill.
do $test$
begin
  begin
    insert into public.admin_role_change_audit (
      target_user_id, actor_context, operation, change_reference,
      previous_role, next_role, previous_is_admin, next_is_admin
    ) values (
      '18181818-0000-4000-8000-000000000004',
      'database-harness', 'update', 'test-018:audit-null-state',
      null, 'administrator', true, true
    );
    raise exception 'A NULL role with true audit state unexpectedly passed.';
  exception
    when check_violation then null;
  end;

  begin
    insert into public.admin_role_change_audit (
      target_user_id, actor_context, operation, change_reference,
      previous_role, next_role, previous_is_admin, next_is_admin
    ) values (
      '18181818-0000-4000-8000-000000000004',
      'database-harness', 'insert', 'test-018:audit-null-insert',
      null, null, false, false
    );
    raise exception 'An INSERT audit without an active next role unexpectedly passed.';
  exception
    when check_violation then null;
  end;

  begin
    insert into public.admin_role_change_audit (
      target_user_id, actor_context, operation, change_reference,
      previous_role, next_role, previous_is_admin, next_is_admin
    ) values (
      '18181818-0000-4000-8000-000000000004',
      'database-harness', 'update', 'test-018:audit-null-update',
      null, null, false, false
    );
    raise exception 'An UPDATE audit without a state change unexpectedly passed.';
  exception
    when check_violation then null;
  end;

  begin
    insert into public.admin_role_change_audit (
      target_user_id, actor_context, operation, change_reference,
      previous_role, next_role, previous_is_admin, next_is_admin
    ) values (
      '18181818-0000-4000-8000-000000000004',
      'database-harness', 'delete', 'test-018:audit-null-delete',
      null, null, false, false
    );
    raise exception 'A DELETE audit without an active previous role unexpectedly passed.';
  exception
    when check_violation then null;
  end;

  begin
    insert into public.admin_role_change_audit (
      target_user_id, actor_context, operation, change_reference,
      previous_role, next_role, previous_is_admin, next_is_admin
    ) values (
      '18181818-0000-4000-8000-000000000004',
      'database-harness', 'backfill', 'test-018:audit-null-backfill',
      null, 'administrator', false, true
    );
    raise exception 'A BACKFILL audit without legacy_admin unexpectedly passed.';
  exception
    when check_violation then null;
  end;
end;
$test$;

-- Bootstrap is deliberately manual and exact. It must carry a bounded,
-- non-secret owner-approval reference and therefore leaves audited evidence.
select pg_catalog.set_config(
  'hwl.admin_change_reference',
  'owner-approval:test-bootstrap',
  true
);

select pg_temp.assert_count(
  (
    select pg_catalog.count(*)
    from (
      select profile.id
      from public.profiles as profile
      join auth.users as auth_user on auth_user.id = profile.id
      where profile.id = '18181818-0000-4000-8000-000000000001'
        and profile.email = 'super-admin-fixture@example.invalid'
        and pg_catalog.lower(pg_catalog.btrim(auth_user.email)) = profile.email
        and auth_user.email_confirmed_at is not null
        and profile.is_admin is false
        and profile.admin_role is null
      for update of profile, auth_user
    ) as locked_identity
  ),
  1,
  'manual bootstrap exact identity lock'
);

update public.profiles as profile
set admin_role = 'super_admin'
from auth.users as auth_user
where profile.id = '18181818-0000-4000-8000-000000000001'
  and auth_user.id = profile.id
  and profile.email = 'super-admin-fixture@example.invalid'
  and pg_catalog.lower(pg_catalog.btrim(auth_user.email)) = profile.email
  and auth_user.email_confirmed_at is not null
  and profile.is_admin is false
  and profile.admin_role is null;

select pg_temp.assert_true(
  (
    select is_admin is true and admin_role = 'super_admin'
    from public.profiles
    where id = '18181818-0000-4000-8000-000000000001'
  ),
  'manual bootstrap exact confirmed identity update'
);

select pg_temp.assert_count(
  (
    select pg_catalog.count(*)
    from public.admin_role_change_audit
    where target_user_id = '18181818-0000-4000-8000-000000000001'
      and actor_user_id is null
      and operation = 'update'
      and change_reference = 'owner-approval:test-bootstrap'
      and previous_role is null
      and next_role = 'super_admin'
      and previous_is_admin is false
      and next_is_admin is true
  ),
  1,
  'manual bootstrap audit evidence'
);

-- Direct service-role UPDATE, privileged INSERT, and privileged DELETE all
-- fail atomically without explicit context. Removing the ordinary member
-- profile first prepares an auth-backed row for the insert probe without
-- creating a privileged audit event.
delete from public.profiles
where id = '18181818-0000-4000-8000-000000000003';

select pg_catalog.set_config('hwl.admin_change_reference', '', true);
set local role service_role;

do $test$
begin
  begin
    update public.profiles
    set is_admin = true
    where id = '18181818-0000-4000-8000-000000000002';
    raise exception 'A context-free service-role promotion unexpectedly succeeded.';
  exception
    when others then
      if sqlerrm not like '%require an explicit non-secret change reference%' then
        raise;
      end if;
  end;

  begin
    insert into public.profiles (id, email, admin_role)
    values (
      '18181818-0000-4000-8000-000000000003',
      'insert-delete-fixture@example.invalid',
      'administrator'
    );
    raise exception 'A context-free service-role administrator insert unexpectedly succeeded.';
  exception
    when others then
      if sqlerrm not like '%require an explicit non-secret change reference%' then
        raise;
      end if;
  end;

  begin
    delete from public.profiles
    where id = '18181818-0000-4000-8000-000000000006';
    raise exception 'A context-free service-role administrator deletion unexpectedly succeeded.';
  exception
    when others then
      if sqlerrm not like '%require an explicit non-secret change reference%' then
        raise;
      end if;
  end;
end;
$test$;

reset role;

select pg_temp.assert_true(
  (
    select is_admin is false and admin_role is null
    from public.profiles
    where id = '18181818-0000-4000-8000-000000000002'
  ),
  'rejected service-role write remained atomic'
);

select pg_temp.assert_true(
  not exists (
    select 1
    from public.profiles
    where id = '18181818-0000-4000-8000-000000000003'
  ),
  'rejected service-role insert remained atomic'
);

select pg_temp.assert_true(
  (
    select is_admin is true and admin_role = 'administrator'
    from public.profiles
    where id = '18181818-0000-4000-8000-000000000006'
  ),
  'rejected service-role deletion remained atomic'
);

-- A referenced service-role UPDATE succeeds and records the operational
-- context without pretending a human JWT actor was present.
select pg_catalog.set_config(
  'hwl.admin_change_reference',
  'service-change:test-role-update',
  true
);
set local role service_role;

update public.profiles
set admin_role = 'administrator'
where id = '18181818-0000-4000-8000-000000000005';

reset role;

select pg_temp.assert_count(
  (
    select pg_catalog.count(*)
    from public.admin_role_change_audit
    where target_user_id = '18181818-0000-4000-8000-000000000005'
      and actor_user_id is null
      and operation = 'update'
      and change_reference = 'service-change:test-role-update'
      and previous_role is null
      and next_role = 'administrator'
  ),
  1,
  'referenced service-role update audit evidence'
);

-- The authenticated RPC requires the caller's persisted super-admin role. It
-- rejects self-change, email mismatch, stale expected role, and unconfirmed
-- targets before applying one optimistic update.
select pg_catalog.set_config(
  'request.jwt.claim.sub',
  '18181818-0000-4000-8000-000000000001',
  true
);
set local role authenticated;

do $test$
begin
  begin
    perform public.change_admin_role(
      '18181818-0000-4000-8000-000000000001',
      'super-admin-fixture@example.invalid',
      'super_admin',
      'administrator',
      'owner-approval:test-self-change'
    );
    raise exception 'A super administrator changed their own role.';
  exception
    when others then
      if sqlerrm <> 'A super administrator cannot change their own role.' then
        raise;
      end if;
  end;

  begin
    perform public.change_admin_role(
      '18181818-0000-4000-8000-000000000002',
      'wrong-email@example.invalid',
      'member',
      'administrator',
      'owner-approval:test-email-match'
    );
    raise exception 'A mismatched target email unexpectedly passed.';
  exception
    when others then
      if sqlerrm <> 'Target identity is not an exact confirmed Auth/profile match.' then
        raise;
      end if;
  end;

  begin
    perform public.change_admin_role(
      '18181818-0000-4000-8000-000000000002',
      'administrator-fixture@example.invalid',
      'administrator',
      'super_admin',
      'owner-approval:test-stale-role'
    );
    raise exception 'A stale expected role unexpectedly passed.';
  exception
    when others then
      if sqlerrm <> 'Target role changed before this request was applied.' then
        raise;
      end if;
  end;

  begin
    perform public.change_admin_role(
      '18181818-0000-4000-8000-000000000006',
      'unconfirmed-fixture@example.invalid',
      'member',
      'administrator',
      'owner-approval:test-confirmation'
    );
    raise exception 'An unconfirmed target unexpectedly passed.';
  exception
    when others then
      if sqlerrm <> 'Target identity is not an exact confirmed Auth/profile match.' then
        raise;
      end if;
  end;
end;
$test$;

select pg_temp.assert_count(
  (
    select pg_catalog.count(*)
    from public.change_admin_role(
      '18181818-0000-4000-8000-000000000002',
      'administrator-fixture@example.invalid',
      'member',
      'administrator',
      'owner-approval:test-rpc-promotion'
    ) as changed
    where changed.target_user_id = '18181818-0000-4000-8000-000000000002'
      and changed.role = 'administrator'
      and changed.is_admin is true
  ),
  1,
  'authenticated super-admin role change'
);

reset role;

select pg_temp.assert_count(
  (
    select pg_catalog.count(*)
    from public.admin_role_change_audit
    where target_user_id = '18181818-0000-4000-8000-000000000002'
      and actor_user_id = '18181818-0000-4000-8000-000000000001'
      and operation = 'update'
      and change_reference = 'owner-approval:test-rpc-promotion'
      and previous_role is null
      and next_role = 'administrator'
  ),
  1,
  'human actor UUID preserved by RPC audit'
);

-- An ordinary administrator has the same function grant but fails the
-- server-side capability check, so the function itself remains fail-closed.
select pg_catalog.set_config(
  'request.jwt.claim.sub',
  '18181818-0000-4000-8000-000000000002',
  true
);
set local role authenticated;

do $test$
begin
  begin
    perform public.change_admin_role(
      '18181818-0000-4000-8000-000000000004',
      'member-one-fixture@example.invalid',
      'member',
      'administrator',
      'owner-approval:test-admin-denial'
    );
    raise exception 'An ordinary administrator changed a role.';
  exception
    when others then
      if sqlerrm <> 'Super-administrator access is required.' then
        raise;
      end if;
  end;
end;
$test$;

reset role;

-- Migration 017 remains practitioner-correlated even for the new super-admin
-- tier: elevated role does not reveal another practitioner's relationships.
insert into public.relationships (id, member_id, practitioner_id)
values
  (
    '18181818-0000-4000-8000-000000000101',
    '18181818-0000-4000-8000-000000000004',
    '18181818-0000-4000-8000-000000000001'
  ),
  (
    '18181818-0000-4000-8000-000000000102',
    '18181818-0000-4000-8000-000000000005',
    '18181818-0000-4000-8000-000000000002'
  );

select pg_catalog.set_config(
  'request.jwt.claim.sub',
  '18181818-0000-4000-8000-000000000001',
  true
);
set local role authenticated;

select pg_temp.assert_count(
  (select pg_catalog.count(*) from public.relationships),
  1,
  'super-admin practitioner isolation from migration 017'
);

reset role;

-- Privileged direct INSERT and DELETE operations also require context and
-- remain auditable after the profile row is gone. Recreate the profile removed
-- for the negative insert probe rather than changing its Auth identity.

select pg_catalog.set_config(
  'request.jwt.claim.sub',
  '',
  true
);
select pg_catalog.set_config(
  'hwl.admin_change_reference',
  'service-change:test-role-insert',
  true
);
set local role service_role;

insert into public.profiles (id, email, admin_role)
values (
  '18181818-0000-4000-8000-000000000003',
  'insert-delete-fixture@example.invalid',
  'administrator'
);

reset role;

select pg_catalog.set_config(
  'hwl.admin_change_reference',
  'service-change:test-role-delete',
  true
);
set local role service_role;

delete from public.profiles
where id = '18181818-0000-4000-8000-000000000003';

reset role;

select pg_temp.assert_count(
  (
    select pg_catalog.count(*)
    from public.admin_role_change_audit
    where target_user_id = '18181818-0000-4000-8000-000000000003'
      and actor_user_id is null
      and operation in ('insert', 'delete')
      and change_reference in (
        'service-change:test-role-insert',
        'service-change:test-role-delete'
      )
  ),
  2,
  'role audit survives privileged profile insert and deletion'
);

select pg_temp.assert_count(
  (
    select pg_catalog.count(*)
    from public.profiles
    where id = '18181818-0000-4000-8000-000000000003'
  ),
  0,
  'profile deletion completed without deleting audit evidence'
);

select pg_temp.assert_count(
  (
    select pg_catalog.count(*)
    from public.admin_role_change_audit
    where previous_is_admin is distinct from (previous_role is not null)
      or next_is_admin is distinct from (next_role is not null)
      or (
        operation = 'backfill'
        and (
          previous_role is distinct from 'legacy_admin'
          or next_role is distinct from 'administrator'
        )
      )
      or (
        operation <> 'backfill'
        and previous_role is not distinct from 'legacy_admin'
      )
  ),
  0,
  'every role audit row satisfies role-state invariants'
);

-- Even the table owner cannot mutate or erase evidence through ordinary DML.
do $test$
begin
  begin
    update public.admin_role_change_audit
    set change_reference = 'owner-approval:test-rewrite'
    where target_user_id = '18181818-0000-4000-8000-000000000003';
    raise exception 'Role audit update unexpectedly succeeded.';
  exception
    when others then
      if sqlerrm <> 'Administrator role audit records are append-only.' then
        raise;
      end if;
  end;

  begin
    delete from public.admin_role_change_audit
    where target_user_id = '18181818-0000-4000-8000-000000000003';
    raise exception 'Role audit deletion unexpectedly succeeded.';
  exception
    when others then
      if sqlerrm <> 'Administrator role audit records are append-only.' then
        raise;
      end if;
  end;
end;
$test$;

rollback;
