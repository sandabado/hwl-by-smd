begin;

create or replace function public.has_active_den_membership()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.memberships
    where user_id = (select auth.uid())
      and status in ('active', 'trialing')
      and current_period_end > now()
  );
$$;

revoke all on function public.has_active_den_membership() from public, anon;
grant execute on function public.has_active_den_membership() to authenticated, service_role;

drop policy if exists "relationships_select_own" on public.relationships;
create policy "relationships_select_own"
  on public.relationships for select
  to authenticated
  using (
    (select public.has_active_den_membership())
    and (select auth.uid()) = member_id
  );

drop policy if exists "connection_preferences_select_own" on public.connection_preferences;
create policy "connection_preferences_select_own"
  on public.connection_preferences for select
  to authenticated
  using (
    (select public.has_active_den_membership())
    and (select auth.uid()) = user_id
  );

drop policy if exists "connection_preferences_insert_own" on public.connection_preferences;
create policy "connection_preferences_insert_own"
  on public.connection_preferences for insert
  to authenticated
  with check (
    (select public.has_active_den_membership())
    and (select auth.uid()) = user_id
  );

drop policy if exists "connection_preferences_update_own" on public.connection_preferences;
create policy "connection_preferences_update_own"
  on public.connection_preferences for update
  to authenticated
  using (
    (select public.has_active_den_membership())
    and (select auth.uid()) = user_id
  )
  with check (
    (select public.has_active_den_membership())
    and (select auth.uid()) = user_id
  );

drop policy if exists "journeys_select_available" on public.journeys;
create policy "journeys_select_available"
  on public.journeys for select
  to authenticated
  using (
    (select public.has_active_den_membership())
    and (
      (enrollment_mode = 'opt_in' and status in ('scheduled', 'active'))
      or exists (
        select 1
        from public.journey_enrollments as enrollment
        where enrollment.journey_id = journeys.id
          and enrollment.member_id = (select auth.uid())
      )
    )
  );

drop policy if exists "journey_milestones_select_enrolled" on public.journey_milestones;
create policy "journey_milestones_select_enrolled"
  on public.journey_milestones for select
  to authenticated
  using (
    (select public.has_active_den_membership())
    and exists (
      select 1
      from public.journey_enrollments as enrollment
      where enrollment.journey_id = journey_milestones.journey_id
        and enrollment.member_id = (select auth.uid())
    )
  );

drop policy if exists "journey_enrollments_select_own" on public.journey_enrollments;
create policy "journey_enrollments_select_own"
  on public.journey_enrollments for select
  to authenticated
  using (
    (select public.has_active_den_membership())
    and (select auth.uid()) = member_id
  );

drop policy if exists "journey_enrollments_opt_in" on public.journey_enrollments;
create policy "journey_enrollments_opt_in"
  on public.journey_enrollments for insert
  to authenticated
  with check (
    (select public.has_active_den_membership())
    and (select auth.uid()) = member_id
    and status = 'pending'
    and exists (
      select 1
      from public.journeys as journey
      where journey.id = journey_enrollments.journey_id
        and journey.enrollment_mode = 'opt_in'
        and journey.status in ('scheduled', 'active')
    )
  );

drop policy if exists "conversations_select_own" on public.conversations;
create policy "conversations_select_own"
  on public.conversations for select
  to authenticated
  using (
    (select public.has_active_den_membership())
    and exists (
      select 1
      from public.relationships as relationship
      where relationship.id = conversations.relationship_id
        and relationship.member_id = (select auth.uid())
    )
  );

drop policy if exists "conversations_insert_own" on public.conversations;
create policy "conversations_insert_own"
  on public.conversations for insert
  to authenticated
  with check (
    (select public.has_active_den_membership())
    and type in ('direct', 'booking_support', 'feedback')
    and journey_enrollment_id is null
    and exists (
      select 1
      from public.relationships as relationship
      where relationship.id = conversations.relationship_id
        and relationship.member_id = (select auth.uid())
        and relationship.status = 'active'
    )
  );

drop policy if exists "conversation_messages_select_own" on public.conversation_messages;
create policy "conversation_messages_select_own"
  on public.conversation_messages for select
  to authenticated
  using (
    (select public.has_active_den_membership())
    and exists (
      select 1
      from public.conversations as conversation
      join public.relationships as relationship
        on relationship.id = conversation.relationship_id
      where conversation.id = conversation_messages.conversation_id
        and relationship.member_id = (select auth.uid())
    )
  );

drop policy if exists "conversation_messages_insert_own" on public.conversation_messages;
create policy "conversation_messages_insert_own"
  on public.conversation_messages for insert
  to authenticated
  with check (
    (select public.has_active_den_membership())
    and sender_id = (select auth.uid())
    and body_format = 'plain_text'
    and sentiment is null
    and cta_label is null
    and cta_link is null
    and exists (
      select 1
      from public.conversations as conversation
      join public.relationships as relationship
        on relationship.id = conversation.relationship_id
      where conversation.id = conversation_messages.conversation_id
        and relationship.member_id = (select auth.uid())
        and relationship.status = 'active'
    )
  );

alter function public.send_conversation_message(uuid, text, uuid)
  rename to send_conversation_message_internal;
alter function public.mark_conversation_read(uuid)
  rename to mark_conversation_read_internal;
alter function public.set_journey_participation(uuid, boolean)
  rename to set_journey_participation_internal;
alter function public.set_journey_pause(uuid, boolean)
  rename to set_journey_pause_internal;

revoke all on function public.send_conversation_message_internal(uuid, text, uuid)
  from public, anon, authenticated;
revoke all on function public.mark_conversation_read_internal(uuid)
  from public, anon, authenticated;
revoke all on function public.set_journey_participation_internal(uuid, boolean)
  from public, anon, authenticated;
revoke all on function public.set_journey_pause_internal(uuid, boolean)
  from public, anon, authenticated;

create function public.send_conversation_message(
  p_conversation_id uuid,
  p_body text,
  p_reply_to_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
begin
  if not (select public.has_active_den_membership()) then
    raise exception 'An active Den membership is required.';
  end if;

  return public.send_conversation_message_internal(
    p_conversation_id,
    p_body,
    p_reply_to_id
  );
end;
$$;

create function public.mark_conversation_read(p_conversation_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
begin
  if not (
    (select public.has_active_den_membership())
    or (select public.is_current_user_admin())
  ) then
    raise exception 'An active Den membership is required.';
  end if;

  return public.mark_conversation_read_internal(p_conversation_id);
end;
$$;

create function public.set_journey_participation(
  p_enrollment_id uuid,
  p_participating boolean
)
returns text
language plpgsql
security definer
set search_path = public
as $$
begin
  if not (select public.has_active_den_membership()) then
    raise exception 'An active Den membership is required.';
  end if;

  return public.set_journey_participation_internal(
    p_enrollment_id,
    p_participating
  );
end;
$$;

create function public.set_journey_pause(
  p_enrollment_id uuid,
  p_paused boolean
)
returns text
language plpgsql
security definer
set search_path = public
as $$
begin
  if not (select public.has_active_den_membership()) then
    raise exception 'An active Den membership is required.';
  end if;

  return public.set_journey_pause_internal(p_enrollment_id, p_paused);
end;
$$;

revoke all on function public.send_conversation_message(uuid, text, uuid)
  from public, anon;
revoke all on function public.mark_conversation_read(uuid)
  from public, anon;
revoke all on function public.set_journey_participation(uuid, boolean)
  from public, anon;
revoke all on function public.set_journey_pause(uuid, boolean)
  from public, anon;

grant execute on function public.send_conversation_message(uuid, text, uuid)
  to authenticated, service_role;
grant execute on function public.mark_conversation_read(uuid)
  to authenticated, service_role;
grant execute on function public.set_journey_participation(uuid, boolean)
  to authenticated, service_role;
grant execute on function public.set_journey_pause(uuid, boolean)
  to authenticated, service_role;

create or replace function public.claim_due_journey_deliveries(
  p_batch_size integer default 50
)
returns setof public.journey_deliveries
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.journey_deliveries as delivery
  set
    status = 'cancelled',
    error_message = 'Journey delivery cancelled because membership is not active.',
    updated_at = now()
  from public.journey_enrollments as enrollment
  where enrollment.id = delivery.enrollment_id
    and delivery.status in ('pending', 'failed', 'processing')
    and not exists (
      select 1
      from public.memberships as membership
      where membership.user_id = enrollment.member_id
        and membership.status in ('active', 'trialing')
        and membership.current_period_end > now()
    );

  return query
  with due as (
    select delivery.id
    from public.journey_deliveries as delivery
    join public.journey_enrollments as enrollment
      on enrollment.id = delivery.enrollment_id
    join public.journeys as journey on journey.id = enrollment.journey_id
    cross join public.relationship_engine_settings as settings
    where settings.id = 'global'
      and not settings.journeys_paused
      and journey.status = 'active'
      and journey.start_at <= now()
      and (journey.end_at is null or journey.end_at > now())
      and enrollment.status = 'active'
      and exists (
        select 1
        from public.memberships as membership
        where membership.user_id = enrollment.member_id
          and membership.status in ('active', 'trialing')
          and membership.current_period_end > now()
      )
      and (enrollment.pause_until is null or enrollment.pause_until <= now())
      and delivery.scheduled_for <= now()
      and delivery.attempts < 5
      and (
        select count(*)
        from public.journey_deliveries as sent_delivery
        join public.journey_enrollments as sent_enrollment
          on sent_enrollment.id = sent_delivery.enrollment_id
        where sent_enrollment.member_id = enrollment.member_id
          and sent_delivery.status = 'sent'
          and sent_delivery.sent_at >= now() - interval '7 days'
      ) < 3
      and (
        delivery.status in ('pending', 'failed')
        or (
          delivery.status = 'processing'
          and delivery.last_attempt_at < now() - interval '30 minutes'
        )
      )
    order by delivery.scheduled_for, delivery.id
    for update of delivery skip locked
    limit least(greatest(p_batch_size, 1), 100)
  )
  update public.journey_deliveries as delivery
  set
    status = 'processing',
    attempts = delivery.attempts + 1,
    last_attempt_at = now(),
    error_message = null,
    updated_at = now()
  from due
  where delivery.id = due.id
  returning delivery.*;
end;
$$;

revoke all on function public.claim_due_journey_deliveries(integer)
  from public, anon, authenticated;
grant execute on function public.claim_due_journey_deliveries(integer)
  to service_role;

alter table public.journey_milestones
  alter column opt_out_text set default
    'Want to pause these notes? Open your Journey in The Den at any time.';

update public.journey_milestones
set opt_out_text =
  'Want to pause these notes? Open your Journey in The Den at any time.'
where opt_out_text =
  'Want fewer notes? Adjust your Connection Preferences in your account.';

commit;
