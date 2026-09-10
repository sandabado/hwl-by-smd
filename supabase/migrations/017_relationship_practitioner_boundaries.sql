-- Close the relationship-engine practitioner boundary.
--
-- Migration 003 gave every administrator broad relationship/message reads and
-- allowed every administrator to clear any conversation's unread state.
-- The application now presents an assigned-practitioner queue, so the database
-- must enforce the same boundary even when an authenticated administrator calls
-- PostgREST or an RPC directly.
--
-- The member policies introduced and membership-gated by migration 005 are left
-- intact. There is deliberately no super-admin bypass in this migration. A
-- future cross-practitioner role requires its own capability, audit contract,
-- UI disclosure, and owner approval.

begin;

set local lock_timeout = '5s';

drop policy if exists "relationships_admin_select" on public.relationships;
drop policy if exists "relationships_practitioner_select"
  on public.relationships;
create policy "relationships_practitioner_select"
  on public.relationships for select
  to authenticated
  using (
    practitioner_id = (select auth.uid())
    and (select public.is_current_user_admin())
  );

drop policy if exists "conversations_admin_select" on public.conversations;
drop policy if exists "conversations_practitioner_select"
  on public.conversations;
create policy "conversations_practitioner_select"
  on public.conversations for select
  to authenticated
  using (
    (select public.is_current_user_admin())
    and exists (
      select 1
      from public.relationships as relationship
      where relationship.id = conversations.relationship_id
        and relationship.practitioner_id = (select auth.uid())
    )
  );

drop policy if exists "conversation_messages_admin_select"
  on public.conversation_messages;
drop policy if exists "conversation_messages_practitioner_select"
  on public.conversation_messages;
create policy "conversation_messages_practitioner_select"
  on public.conversation_messages for select
  to authenticated
  using (
    (select public.is_current_user_admin())
    and exists (
      select 1
      from public.conversations as conversation
      join public.relationships as relationship
        on relationship.id = conversation.relationship_id
      where conversation.id = conversation_messages.conversation_id
        and relationship.practitioner_id = (select auth.uid())
    )
  );

create or replace function public.mark_conversation_read(
  p_conversation_id uuid
)
returns integer
language plpgsql
security definer
set search_path = ''
as $function$
declare
  caller_id uuid := auth.uid();
  relationship_member_id uuid;
  relationship_practitioner_id uuid;
  marked_count integer;
begin
  if caller_id is null then
    raise exception 'Authentication is required.';
  end if;

  select relationship.member_id, relationship.practitioner_id
  into relationship_member_id, relationship_practitioner_id
  from public.conversations as conversation
  join public.relationships as relationship
    on relationship.id = conversation.relationship_id
  where conversation.id = p_conversation_id;

  if relationship_member_id is null then
    raise exception 'Conversation is not available.';
  end if;

  if caller_id = relationship_member_id then
    if not (select public.has_active_den_membership()) then
      raise exception 'An active Den membership is required.';
    end if;

    update public.conversation_messages
    set read_at = coalesce(read_at, pg_catalog.now())
    where conversation_id = p_conversation_id
      and sender_id = relationship_practitioner_id
      and read_at is null;
    get diagnostics marked_count = row_count;

    update public.conversations
    set member_unread_count = 0, updated_at = pg_catalog.now()
    where id = p_conversation_id;
  elsif caller_id = relationship_practitioner_id then
    if not (select public.is_current_user_admin()) then
      raise exception 'Assigned practitioner access is required.';
    end if;

    update public.conversation_messages
    set read_at = coalesce(read_at, pg_catalog.now())
    where conversation_id = p_conversation_id
      and sender_id = relationship_member_id
      and read_at is null;
    get diagnostics marked_count = row_count;

    update public.conversations
    set practitioner_unread_count = 0, updated_at = pg_catalog.now()
    where id = p_conversation_id;
  else
    raise exception 'Conversation is not available.';
  end if;

  return marked_count;
end;
$function$;

revoke all on function public.mark_conversation_read(uuid)
  from public, anon, authenticated, service_role;
grant execute on function public.mark_conversation_read(uuid)
  to authenticated, service_role;

commit;
