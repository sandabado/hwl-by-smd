\set ON_ERROR_STOP on

-- Run only after migration 017 in an isolated local database. Fixtures,
-- simulated Auth claims, read-state changes, and assertions always roll back.

begin;

set local lock_timeout = '5s';

insert into auth.users (id, email, email_confirmed_at, raw_user_meta_data)
values
  (
    '17171717-0000-4000-8000-000000000001',
    'practitioner-one@example.invalid',
    pg_catalog.now(),
    '{}'::jsonb
  ),
  (
    '17171717-0000-4000-8000-000000000002',
    'practitioner-two@example.invalid',
    pg_catalog.now(),
    '{}'::jsonb
  ),
  (
    '17171717-0000-4000-8000-000000000011',
    'member-one@example.invalid',
    pg_catalog.now(),
    '{}'::jsonb
  ),
  (
    '17171717-0000-4000-8000-000000000012',
    'member-two@example.invalid',
    pg_catalog.now(),
    '{}'::jsonb
  );

update public.profiles
set is_admin = true
where id in (
  '17171717-0000-4000-8000-000000000001',
  '17171717-0000-4000-8000-000000000002'
);

insert into public.relationships (id, member_id, practitioner_id)
values
  (
    '17171717-0000-4000-8000-000000000101',
    '17171717-0000-4000-8000-000000000011',
    '17171717-0000-4000-8000-000000000001'
  ),
  (
    '17171717-0000-4000-8000-000000000102',
    '17171717-0000-4000-8000-000000000012',
    '17171717-0000-4000-8000-000000000002'
  );

insert into public.conversations (id, relationship_id, type, subject)
values
  (
    '17171717-0000-4000-8000-000000000201',
    '17171717-0000-4000-8000-000000000101',
    'direct',
    'Practitioner one thread'
  ),
  (
    '17171717-0000-4000-8000-000000000202',
    '17171717-0000-4000-8000-000000000102',
    'direct',
    'Practitioner two thread'
  );

insert into public.conversation_messages (
  id,
  conversation_id,
  sender_id,
  body
)
values
  (
    '17171717-0000-4000-8000-000000000301',
    '17171717-0000-4000-8000-000000000201',
    '17171717-0000-4000-8000-000000000011',
    'Private message for practitioner one.'
  ),
  (
    '17171717-0000-4000-8000-000000000302',
    '17171717-0000-4000-8000-000000000202',
    '17171717-0000-4000-8000-000000000012',
    'Private message for practitioner two.'
  );

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

-- Broad administrator policies are gone, the correlated replacements exist,
-- and migration 005's member-entitlement policies remain installed.
do $test$
begin
  if exists (
    select 1
    from pg_catalog.pg_policies
    where schemaname = 'public'
      and policyname in (
        'relationships_admin_select',
        'conversations_admin_select',
        'conversation_messages_admin_select'
      )
  ) then
    raise exception 'A broad relationship-engine admin policy remains.';
  end if;

  if (
    select pg_catalog.count(*)
    from pg_catalog.pg_policies
    where schemaname = 'public'
      and policyname in (
        'relationships_practitioner_select',
        'conversations_practitioner_select',
        'conversation_messages_practitioner_select'
      )
  ) <> 3 then
    raise exception 'A practitioner-correlated read policy is missing.';
  end if;

  if (
    select pg_catalog.count(*)
    from pg_catalog.pg_policies
    where schemaname = 'public'
      and policyname in (
        'relationships_select_own',
        'conversations_select_own',
        'conversation_messages_select_own'
      )
      and qual ilike '%has_active_den_membership%'
  ) <> 3 then
    raise exception 'A migration 005 member-entitlement policy was changed.';
  end if;
end;
$test$;

-- Each authenticated practitioner sees only the rows assigned to that exact
-- Auth UID, despite both profiles carrying the general administrator flag.
select pg_catalog.set_config(
  'request.jwt.claim.sub',
  '17171717-0000-4000-8000-000000000001',
  true
);
set local role authenticated;

select pg_temp.assert_count(
  (select pg_catalog.count(*) from public.relationships),
  1,
  'practitioner one relationship isolation'
);
select pg_temp.assert_count(
  (select pg_catalog.count(*) from public.conversations),
  1,
  'practitioner one conversation isolation'
);
select pg_temp.assert_count(
  (select pg_catalog.count(*) from public.conversation_messages),
  1,
  'practitioner one message isolation'
);

reset role;

select pg_catalog.set_config(
  'request.jwt.claim.sub',
  '17171717-0000-4000-8000-000000000002',
  true
);
set local role authenticated;

select pg_temp.assert_count(
  (select pg_catalog.count(*) from public.relationships),
  1,
  'practitioner two relationship isolation'
);
select pg_temp.assert_count(
  (select pg_catalog.count(*) from public.conversations),
  1,
  'practitioner two conversation isolation'
);
select pg_temp.assert_count(
  (select pg_catalog.count(*) from public.conversation_messages),
  1,
  'practitioner two message isolation'
);

reset role;

-- Migration 012 currently keeps the Den membership authority closed. Migration
-- 017 must preserve that launch gate and must not turn member reads back on.
select pg_catalog.set_config(
  'request.jwt.claim.sub',
  '17171717-0000-4000-8000-000000000011',
  true
);
set local role authenticated;

select pg_temp.assert_count(
  (select pg_catalog.count(*) from public.relationships),
  0,
  'closed Den relationship gate'
);
select pg_temp.assert_count(
  (select pg_catalog.count(*) from public.conversations),
  0,
  'closed Den conversation gate'
);
select pg_temp.assert_count(
  (select pg_catalog.count(*) from public.conversation_messages),
  0,
  'closed Den message gate'
);

reset role;

-- The assigned practitioner can clear their own queue.
select pg_catalog.set_config(
  'request.jwt.claim.sub',
  '17171717-0000-4000-8000-000000000001',
  true
);
set local role authenticated;

select pg_temp.assert_count(
  public.mark_conversation_read(
    '17171717-0000-4000-8000-000000000201'
  ),
  1,
  'assigned practitioner read mutation'
);

reset role;

-- A different administrator cannot clear the other practitioner's unread
-- state. Catch the expected function error, then inspect canonical state as the
-- transaction owner.
select pg_catalog.set_config(
  'request.jwt.claim.sub',
  '17171717-0000-4000-8000-000000000002',
  true
);
set local role authenticated;

do $test$
begin
  begin
    perform public.mark_conversation_read(
      '17171717-0000-4000-8000-000000000201'
    );
    raise exception 'Cross-practitioner mark-read unexpectedly succeeded.';
  exception
    when others then
      if sqlerrm <> 'Conversation is not available.' then
        raise;
      end if;
  end;
end;
$test$;

reset role;

do $test$
begin
  if (
    select practitioner_unread_count
    from public.conversations
    where id = '17171717-0000-4000-8000-000000000202'
  ) <> 1 then
    raise exception 'Unrelated practitioner unread state changed.';
  end if;

  if (
    select practitioner_unread_count
    from public.conversations
    where id = '17171717-0000-4000-8000-000000000201'
  ) <> 0 then
    raise exception 'Assigned practitioner unread state was not cleared.';
  end if;

  if exists (
    select 1
    from public.conversation_messages
    where id = '17171717-0000-4000-8000-000000000302'
      and read_at is not null
  ) then
    raise exception 'Another practitioner message was marked read.';
  end if;
end;
$test$;

rollback;
