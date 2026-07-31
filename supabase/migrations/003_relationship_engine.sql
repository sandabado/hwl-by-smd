-- Whole Body OS relationship engine
--
-- This migration intentionally models journeys as consent-based, two-way
-- conversations. Operational writes are service-role only unless a narrowly
-- scoped member policy or security-definer RPC is declared below.

create extension if not exists pgcrypto;

create table if not exists public.relationships (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.profiles(id) on delete cascade,
  practitioner_id uuid not null references public.profiles(id) on delete restrict,
  status text not null default 'active' check (
    status in ('active', 'inactive', 'archived')
  ),
  created_at timestamptz not null default now(),
  last_interaction timestamptz,
  intimacy_score smallint not null default 0 check (
    intimacy_score between 0 and 100
  ),
  notes text check (notes is null or char_length(notes) <= 10000),
  constraint relationships_distinct_people check (member_id <> practitioner_id),
  constraint relationships_unique_pair unique (member_id, practitioner_id)
);

comment on table public.relationships is
  'One consent-based practitioner/member relationship. Notes are private and never granted to members.';
comment on column public.relationships.intimacy_score is
  'Reserved for a transparent V2 relationship-health signal; never a sales lead score.';

create table if not exists public.connection_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  guidance_cadence text not null default 'relevant' check (
    guidance_cadence in ('daily', 'weekly', 'relevant')
  ),
  booking_invites boolean not null default false,
  share_progress boolean not null default false,
  updated_at timestamptz not null default now()
);

comment on table public.connection_preferences is
  'Member-controlled communication consent. Privacy-preserving choices are the defaults.';

insert into public.connection_preferences (user_id)
select id from public.profiles
on conflict (user_id) do nothing;

create or replace function public.create_connection_preferences()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.connection_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists profiles_create_connection_preferences on public.profiles;
create trigger profiles_create_connection_preferences
  after insert on public.profiles
  for each row execute procedure public.create_connection_preferences();

create table if not exists public.journeys (
  id uuid primary key default gen_random_uuid(),
  name text not null check (
    char_length(btrim(name)) between 1 and 120
  ),
  kind text not null default 'sequence' check (
    kind in ('sequence', 'announcement', 'education')
  ),
  entry_point text not null default 'manual' check (
    entry_point in ('signup', 'purchase', 'manual', 'opt_in')
  ),
  frequency text not null default 'manual' check (
    frequency in ('daily', 'every_other_day', 'weekly', 'manual')
  ),
  enrollment_mode text not null default 'opt_in' check (
    enrollment_mode in ('auto', 'opt_in', 'manual')
  ),
  status text not null default 'draft' check (
    status in ('draft', 'scheduled', 'active', 'paused', 'completed', 'archived')
  ),
  start_at timestamptz,
  end_at timestamptz,
  allow_milestone_override boolean not null default false,
  pause_after_hours smallint not null default 24 check (
    pause_after_hours between 24 and 168
  ),
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint journeys_valid_window check (
    end_at is null or (start_at is not null and end_at > start_at)
  ),
  constraint journeys_scheduled_have_start check (
    status not in ('scheduled', 'active') or start_at is not null
  )
);

comment on table public.journeys is
  'Human-paced guidance journeys. Public product-marketing campaign semantics are intentionally excluded.';
comment on column public.journeys.allow_milestone_override is
  'Service-managed exception to the seven-milestone cap; never exposed as a member control.';

create table if not exists public.journey_milestones (
  id uuid primary key default gen_random_uuid(),
  journey_id uuid not null references public.journeys(id) on delete cascade,
  position smallint not null check (position between 1 and 100),
  delay_hours integer not null default 0 check (
    delay_hours between 0 and 8760
  ),
  subject text not null check (
    char_length(btrim(subject)) between 1 and 180
  ),
  body text not null check (
    char_length(btrim(body)) between 1 and 50000
  ),
  body_format text not null default 'plain_text' check (
    body_format in ('plain_text', 'sanitized_html')
  ),
  human_touchpoint boolean not null default false,
  intent text not null default 'guidance' check (
    intent in ('guidance', 'check_in', 'resource', 'booking_invite', 'product_invite')
  ),
  cta_kind text not null default 'none' check (
    cta_kind in ('none', 'resource', 'booking', 'product')
  ),
  cta_label text check (
    cta_label is null or char_length(btrim(cta_label)) between 1 and 80
  ),
  cta_link text check (
    cta_link is null
    or (
      char_length(cta_link) <= 2000
      and (
        (left(cta_link, 1) = '/' and left(cta_link, 2) <> '//')
        or left(lower(cta_link), 8) = 'https://'
      )
    )
  ),
  opt_out_text text not null default
    'Want fewer notes? Adjust your Connection Preferences in your account.'
    check (char_length(btrim(opt_out_text)) between 1 and 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint journey_milestones_unique_position unique (journey_id, position),
  constraint journey_milestones_cta_complete check (
    (cta_kind = 'none' and cta_label is null and cta_link is null)
    or (cta_kind <> 'none' and cta_label is not null and cta_link is not null)
  )
);

comment on table public.journey_milestones is
  'At most seven scheduled messages per journey by default. Every message carries member-facing opt-out guidance.';

create table if not exists public.journey_enrollments (
  id uuid primary key default gen_random_uuid(),
  journey_id uuid not null references public.journeys(id) on delete cascade,
  member_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (
    status in ('pending', 'active', 'paused', 'completed', 'opted_out')
  ),
  enrolled_at timestamptz not null default now(),
  started_at timestamptz,
  paused_at timestamptz,
  pause_until timestamptz,
  completed_at timestamptz,
  next_milestone_position smallint not null default 1 check (
    next_milestone_position between 1 and 101
  ),
  reply_count integer not null default 0 check (reply_count >= 0),
  booking_count integer not null default 0 check (booking_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint journey_enrollments_unique_member unique (journey_id, member_id),
  constraint journey_enrollments_active_started check (
    status <> 'active' or started_at is not null
  ),
  constraint journey_enrollments_paused_at check (
    status <> 'paused' or paused_at is not null
  ),
  constraint journey_enrollments_completed_at check (
    status <> 'completed' or completed_at is not null
  )
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  relationship_id uuid not null references public.relationships(id) on delete cascade,
  journey_enrollment_id uuid references public.journey_enrollments(id) on delete set null,
  type text not null default 'direct' check (
    type in ('journey', 'direct', 'booking_support', 'feedback')
  ),
  subject text not null check (
    char_length(btrim(subject)) between 1 and 180
  ),
  status text not null default 'open' check (
    status in ('open', 'resolved', 'awaiting_practitioner')
  ),
  member_unread_count integer not null default 0 check (
    member_unread_count >= 0
  ),
  practitioner_unread_count integer not null default 0 check (
    practitioner_unread_count >= 0
  ),
  last_message text check (
    last_message is null or char_length(last_message) <= 300
  ),
  last_message_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint conversations_journey_link check (
    (type = 'journey' and journey_enrollment_id is not null)
    or (type <> 'journey' and journey_enrollment_id is null)
  )
);

create unique index if not exists conversations_journey_enrollment_uidx
  on public.conversations(journey_enrollment_id)
  where journey_enrollment_id is not null;

create table if not exists public.conversation_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete restrict,
  body text not null check (
    char_length(btrim(body)) between 1 and 20000
  ),
  body_format text not null default 'plain_text' check (
    body_format in ('plain_text', 'sanitized_html')
  ),
  sent_at timestamptz not null default now(),
  read_at timestamptz,
  reply_to_id uuid references public.conversation_messages(id) on delete set null,
  sentiment text check (
    sentiment is null or sentiment in ('positive', 'neutral', 'struggling')
  ),
  cta_label text check (
    cta_label is null or char_length(btrim(cta_label)) between 1 and 80
  ),
  cta_link text check (
    cta_link is null
    or (
      char_length(cta_link) <= 2000
      and (
        (left(cta_link, 1) = '/' and left(cta_link, 2) <> '//')
        or left(lower(cta_link), 8) = 'https://'
      )
    )
  ),
  constraint conversation_messages_cta_complete check (
    (cta_label is null and cta_link is null)
    or (cta_label is not null and cta_link is not null)
  )
);

create table if not exists public.journey_deliveries (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.journey_enrollments(id) on delete cascade,
  milestone_id uuid not null references public.journey_milestones(id) on delete cascade,
  scheduled_for timestamptz not null,
  status text not null default 'pending' check (
    status in ('pending', 'processing', 'sent', 'failed', 'cancelled')
  ),
  attempts smallint not null default 0 check (attempts between 0 and 10),
  last_attempt_at timestamptz,
  sent_at timestamptz,
  provider_message_id text,
  conversation_message_id uuid references public.conversation_messages(id) on delete set null,
  error_message text check (
    error_message is null or char_length(error_message) <= 1000
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint journey_deliveries_unique_message unique (enrollment_id, milestone_id),
  constraint journey_deliveries_sent_at check (
    status <> 'sent' or sent_at is not null
  )
);

create table if not exists public.relationship_alerts (
  id uuid primary key default gen_random_uuid(),
  relationship_id uuid not null references public.relationships(id) on delete cascade,
  conversation_id uuid references public.conversations(id) on delete cascade,
  message_id uuid references public.conversation_messages(id) on delete cascade,
  alert_type text not null check (
    alert_type in ('support_keyword', 'struggling_sentiment', 'response_overdue')
  ),
  matched_keyword text check (
    matched_keyword is null or char_length(matched_keyword) <= 80
  ),
  severity text not null default 'attention' check (
    severity in ('info', 'attention', 'urgent')
  ),
  status text not null default 'open' check (
    status in ('open', 'acknowledged', 'resolved')
  ),
  created_at timestamptz not null default now(),
  acknowledged_at timestamptz,
  resolved_at timestamptz,
  resolved_by uuid references public.profiles(id) on delete set null
);

create unique index if not exists relationship_alerts_message_type_uidx
  on public.relationship_alerts(message_id, alert_type)
  where message_id is not null;

create unique index if not exists relationship_alerts_overdue_conversation_uidx
  on public.relationship_alerts(conversation_id, alert_type)
  where alert_type = 'response_overdue'
    and status in ('open', 'acknowledged');

create table if not exists public.relationship_engine_settings (
  id text primary key default 'global' check (id = 'global'),
  journeys_paused boolean not null default false,
  paused_at timestamptz,
  pause_reason text check (
    pause_reason is null or char_length(pause_reason) <= 500
  ),
  updated_at timestamptz not null default now()
);

insert into public.relationship_engine_settings (id)
values ('global')
on conflict (id) do nothing;

create index if not exists relationships_member_idx
  on public.relationships(member_id, status);
create index if not exists relationships_practitioner_idx
  on public.relationships(practitioner_id, status);
create index if not exists relationships_last_interaction_idx
  on public.relationships(last_interaction desc nulls last);
create index if not exists journeys_status_start_idx
  on public.journeys(status, start_at);
create index if not exists journey_milestones_order_idx
  on public.journey_milestones(journey_id, position);
create index if not exists journey_enrollments_member_status_idx
  on public.journey_enrollments(member_id, status);
create index if not exists journey_enrollments_journey_status_idx
  on public.journey_enrollments(journey_id, status);
create index if not exists conversations_relationship_updated_idx
  on public.conversations(relationship_id, updated_at desc);
create index if not exists conversations_practitioner_queue_idx
  on public.conversations(status, practitioner_unread_count, updated_at desc);
create index if not exists conversation_messages_thread_idx
  on public.conversation_messages(conversation_id, sent_at, id);
create index if not exists conversation_messages_unread_idx
  on public.conversation_messages(conversation_id, read_at)
  where read_at is null;
create index if not exists journey_deliveries_due_idx
  on public.journey_deliveries(status, scheduled_for)
  where status in ('pending', 'processing', 'failed');
create index if not exists relationship_alerts_queue_idx
  on public.relationship_alerts(status, severity, created_at desc);

create or replace function public.enforce_journey_milestone_guardrails()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  milestone_count integer;
  override_allowed boolean;
begin
  select allow_milestone_override
  into override_allowed
  from public.journeys
  where id = new.journey_id;

  if override_allowed is null then
    raise exception 'Journey does not exist.';
  end if;

  if not override_allowed then
    select count(*)
    into milestone_count
    from public.journey_milestones
    where journey_id = new.journey_id
      and (tg_op = 'INSERT' or id <> new.id);

    if milestone_count >= 7 then
      raise exception 'A journey may have at most seven milestones.';
    end if;
  end if;

  if new.position <= 3 and (
    new.intent in ('booking_invite', 'product_invite')
    or new.cta_kind in ('booking', 'product')
  ) then
    raise exception 'The first three journey milestones must provide value before offering a sale.';
  end if;

  return new;
end;
$$;

drop trigger if exists journey_milestones_guardrails on public.journey_milestones;
create trigger journey_milestones_guardrails
  before insert or update on public.journey_milestones
  for each row execute procedure public.enforce_journey_milestone_guardrails();

create or replace function public.preserve_relational_keys()
returns trigger
language plpgsql
as $$
begin
  if tg_table_name = 'relationships' and (
    to_jsonb(new) ->> 'member_id' is distinct from to_jsonb(old) ->> 'member_id'
    or to_jsonb(new) ->> 'practitioner_id'
      is distinct from to_jsonb(old) ->> 'practitioner_id'
  ) then
    raise exception 'Relationship participants cannot be changed.';
  elsif tg_table_name = 'journey_milestones'
    and to_jsonb(new) ->> 'journey_id'
      is distinct from to_jsonb(old) ->> 'journey_id' then
    raise exception 'A milestone cannot be moved to another journey.';
  elsif tg_table_name = 'journey_enrollments' and (
    to_jsonb(new) ->> 'journey_id'
      is distinct from to_jsonb(old) ->> 'journey_id'
    or to_jsonb(new) ->> 'member_id'
      is distinct from to_jsonb(old) ->> 'member_id'
  ) then
    raise exception 'An enrollment cannot be reassigned.';
  end if;

  return new;
end;
$$;

drop trigger if exists relationships_preserve_participants on public.relationships;
create trigger relationships_preserve_participants
  before update of member_id, practitioner_id on public.relationships
  for each row execute procedure public.preserve_relational_keys();
drop trigger if exists journey_milestones_preserve_journey on public.journey_milestones;
create trigger journey_milestones_preserve_journey
  before update of journey_id on public.journey_milestones
  for each row execute procedure public.preserve_relational_keys();
drop trigger if exists journey_enrollments_preserve_assignment on public.journey_enrollments;
create trigger journey_enrollments_preserve_assignment
  before update of journey_id, member_id on public.journey_enrollments
  for each row execute procedure public.preserve_relational_keys();

create or replace function public.validate_relationship_practitioner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  practitioner_is_admin boolean;
begin
  select is_admin
  into practitioner_is_admin
  from public.profiles
  where id = new.practitioner_id;

  if not coalesce(practitioner_is_admin, false) then
    raise exception 'The relationship practitioner must be an administrator.';
  end if;

  return new;
end;
$$;

drop trigger if exists relationships_validate_practitioner on public.relationships;
create trigger relationships_validate_practitioner
  before insert or update of practitioner_id on public.relationships
  for each row execute procedure public.validate_relationship_practitioner();

create or replace function public.validate_journey_creator()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  creator_is_admin boolean;
begin
  select is_admin
  into creator_is_admin
  from public.profiles
  where id = new.created_by;

  if not coalesce(creator_is_admin, false) then
    raise exception 'A journey must be created by an administrator.';
  end if;

  return new;
end;
$$;

drop trigger if exists journeys_validate_creator on public.journeys;
create trigger journeys_validate_creator
  before insert or update of created_by on public.journeys
  for each row execute procedure public.validate_journey_creator();

create or replace function public.enforce_journey_override_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  milestone_count integer;
begin
  if old.allow_milestone_override and not new.allow_milestone_override then
    select count(*)
    into milestone_count
    from public.journey_milestones
    where journey_id = new.id;

    if milestone_count > 7 then
      raise exception 'Remove extra milestones before disabling the override.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists journeys_override_guardrail on public.journeys;
create trigger journeys_override_guardrail
  before update of allow_milestone_override on public.journeys
  for each row execute procedure public.enforce_journey_override_change();

create or replace function public.enforce_enrollment_guardrails()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  active_count integer;
  cooldown_until timestamptz;
begin
  if new.status = 'active' then
    new.started_at := coalesce(new.started_at, now());
    new.paused_at := null;
    new.pause_until := null;

    perform pg_advisory_xact_lock(hashtextextended(new.member_id::text, 0));

    select count(*)
    into active_count
    from public.journey_enrollments
    where member_id = new.member_id
      and status = 'active'
      and (tg_op = 'INSERT' or id <> new.id);

    if active_count >= 2 then
      raise exception 'A member may participate in at most two active journeys.';
    end if;

    select max(
      enrollment.completed_at
      + make_interval(hours => journey.pause_after_hours::integer)
    )
    into cooldown_until
    from public.journey_enrollments as enrollment
    join public.journeys as journey on journey.id = enrollment.journey_id
    where enrollment.member_id = new.member_id
      and enrollment.completed_at is not null
      and (tg_op = 'INSERT' or enrollment.id <> new.id);

    if cooldown_until is not null and cooldown_until > now() then
      raise exception 'This member is in the required post-journey pause until %.', cooldown_until;
    end if;
  elsif new.status = 'paused' then
    new.paused_at := coalesce(new.paused_at, now());
  elsif new.status = 'completed' then
    new.completed_at := coalesce(new.completed_at, now());
  end if;

  return new;
end;
$$;

drop trigger if exists journey_enrollments_guardrails on public.journey_enrollments;
create trigger journey_enrollments_guardrails
  before insert or update of status on public.journey_enrollments
  for each row execute procedure public.enforce_enrollment_guardrails();

create or replace function public.validate_conversation_context()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  relationship_member uuid;
  relationship_practitioner uuid;
  enrollment_member uuid;
  journey_practitioner uuid;
begin
  select member_id, practitioner_id
  into relationship_member, relationship_practitioner
  from public.relationships
  where id = new.relationship_id;

  if relationship_member is null then
    raise exception 'Relationship does not exist.';
  end if;

  if new.journey_enrollment_id is not null then
    select enrollment.member_id, journey.created_by
    into enrollment_member, journey_practitioner
    from public.journey_enrollments as enrollment
    join public.journeys as journey on journey.id = enrollment.journey_id
    where enrollment.id = new.journey_enrollment_id;

    if enrollment_member is distinct from relationship_member
      or journey_practitioner is distinct from relationship_practitioner then
      raise exception 'Journey enrollment does not belong to this relationship.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists conversations_validate_context on public.conversations;
create trigger conversations_validate_context
  before insert or update of relationship_id, journey_enrollment_id, type
  on public.conversations
  for each row execute procedure public.validate_conversation_context();

create or replace function public.validate_conversation_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  relationship_member uuid;
  relationship_practitioner uuid;
  reply_conversation uuid;
begin
  select relationship.member_id, relationship.practitioner_id
  into relationship_member, relationship_practitioner
  from public.conversations as conversation
  join public.relationships as relationship
    on relationship.id = conversation.relationship_id
  where conversation.id = new.conversation_id;

  if new.sender_id <> relationship_member
    and new.sender_id <> relationship_practitioner then
    raise exception 'Messages may only be sent by relationship participants.';
  end if;

  if new.reply_to_id is not null then
    select conversation_id
    into reply_conversation
    from public.conversation_messages
    where id = new.reply_to_id;

    if reply_conversation is distinct from new.conversation_id then
      raise exception 'A reply must reference a message in the same conversation.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists conversation_messages_validate on public.conversation_messages;
create trigger conversation_messages_validate
  before insert or update of conversation_id, sender_id, reply_to_id
  on public.conversation_messages
  for each row execute procedure public.validate_conversation_message();

create or replace function public.preserve_conversation_message_history()
returns trigger
language plpgsql
as $$
begin
  if new.conversation_id is distinct from old.conversation_id
    or new.sender_id is distinct from old.sender_id
    or new.body is distinct from old.body
    or new.body_format is distinct from old.body_format
    or new.sent_at is distinct from old.sent_at
    or new.reply_to_id is distinct from old.reply_to_id
    or new.cta_label is distinct from old.cta_label
    or new.cta_link is distinct from old.cta_link then
    raise exception 'Conversation history is immutable.';
  end if;

  return new;
end;
$$;

drop trigger if exists conversation_messages_preserve_history on public.conversation_messages;
create trigger conversation_messages_preserve_history
  before update on public.conversation_messages
  for each row execute procedure public.preserve_conversation_message_history();

create or replace function public.update_conversation_from_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  relationship_member uuid;
  enrollment_id uuid;
begin
  select relationship.member_id, conversation.journey_enrollment_id
  into relationship_member, enrollment_id
  from public.conversations as conversation
  join public.relationships as relationship
    on relationship.id = conversation.relationship_id
  where conversation.id = new.conversation_id;

  if new.sender_id = relationship_member then
    update public.conversations
    set
      last_message = left(regexp_replace(new.body, '<[^>]+>', '', 'g'), 300),
      last_message_at = new.sent_at,
      practitioner_unread_count = practitioner_unread_count + 1,
      status = 'awaiting_practitioner',
      updated_at = now()
    where id = new.conversation_id;

    if enrollment_id is not null then
      update public.journey_enrollments
      set reply_count = reply_count + 1, updated_at = now()
      where id = enrollment_id;
    end if;
  else
    update public.conversations
    set
      last_message = left(regexp_replace(new.body, '<[^>]+>', '', 'g'), 300),
      last_message_at = new.sent_at,
      member_unread_count = member_unread_count + 1,
      status = 'open',
      updated_at = now()
    where id = new.conversation_id;
  end if;

  update public.relationships
  set last_interaction = new.sent_at
  where id = (
    select relationship_id
    from public.conversations
    where id = new.conversation_id
  );

  return new;
end;
$$;

drop trigger if exists conversation_messages_update_thread on public.conversation_messages;
create trigger conversation_messages_update_thread
  after insert on public.conversation_messages
  for each row execute procedure public.update_conversation_from_message();

create or replace function public.queue_deliveries_for_enrollment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'active' then
    insert into public.journey_deliveries (
      enrollment_id,
      milestone_id,
      scheduled_for
    )
    select
      new.id,
      milestone.id,
      coalesce(new.started_at, new.enrolled_at)
        + make_interval(hours => milestone.delay_hours)
    from public.journey_milestones as milestone
    where milestone.journey_id = new.journey_id
    on conflict (enrollment_id, milestone_id) do update
      set scheduled_for = excluded.scheduled_for,
          status = case
            when public.journey_deliveries.status in ('sent', 'cancelled')
              then public.journey_deliveries.status
            else 'pending'
          end,
          updated_at = now();
  elsif new.status in ('completed', 'opted_out') then
    update public.journey_deliveries
    set status = 'cancelled', updated_at = now()
    where enrollment_id = new.id
      and status in ('pending', 'processing', 'failed');
  end if;

  return new;
end;
$$;

drop trigger if exists journey_enrollments_queue_deliveries on public.journey_enrollments;
create trigger journey_enrollments_queue_deliveries
  after insert or update of status, started_at on public.journey_enrollments
  for each row execute procedure public.queue_deliveries_for_enrollment();

create or replace function public.queue_deliveries_for_milestone()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.journey_deliveries (
    enrollment_id,
    milestone_id,
    scheduled_for
  )
  select
    enrollment.id,
    new.id,
    coalesce(enrollment.started_at, enrollment.enrolled_at)
      + make_interval(hours => new.delay_hours)
  from public.journey_enrollments as enrollment
  where enrollment.journey_id = new.journey_id
    and enrollment.status = 'active'
  on conflict (enrollment_id, milestone_id) do update
    set scheduled_for = excluded.scheduled_for,
        updated_at = now()
    where public.journey_deliveries.status in ('pending', 'failed');

  return new;
end;
$$;

drop trigger if exists journey_milestones_queue_deliveries on public.journey_milestones;
create trigger journey_milestones_queue_deliveries
  after insert or update of delay_hours on public.journey_milestones
  for each row execute procedure public.queue_deliveries_for_milestone();

create or replace function public.refresh_enrollment_from_delivery()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  remaining_count integer;
  next_position integer;
begin
  if new.status = 'sent' and old.status is distinct from 'sent' then
    select count(*)
    into remaining_count
    from public.journey_deliveries
    where enrollment_id = new.enrollment_id
      and id <> new.id
      and status <> 'sent';

    select coalesce(max(milestone.position), 0) + 1
    into next_position
    from public.journey_deliveries as delivery
    join public.journey_milestones as milestone
      on milestone.id = delivery.milestone_id
    where delivery.enrollment_id = new.enrollment_id
      and (delivery.id = new.id or delivery.status = 'sent');

    update public.journey_enrollments
    set
      next_milestone_position = least(next_position, 101),
      status = case when remaining_count = 0 then 'completed' else status end,
      completed_at = case
        when remaining_count = 0 then coalesce(completed_at, now())
        else completed_at
      end,
      updated_at = now()
    where id = new.enrollment_id;
  end if;

  return new;
end;
$$;

drop trigger if exists journey_deliveries_refresh_enrollment on public.journey_deliveries;
create trigger journey_deliveries_refresh_enrollment
  after update of status on public.journey_deliveries
  for each row execute procedure public.refresh_enrollment_from_delivery();

create or replace function public.enforce_weekly_journey_cadence()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  enrollment_member uuid;
  messages_sent integer;
begin
  if new.status = 'sent' and old.status is distinct from 'sent' then
    select member_id
    into enrollment_member
    from public.journey_enrollments
    where id = new.enrollment_id;

    if enrollment_member is null then
      raise exception 'Journey enrollment does not exist.';
    end if;

    perform pg_advisory_xact_lock(
      hashtextextended('journey-cadence:' || enrollment_member::text, 0)
    );

    select count(*)
    into messages_sent
    from public.journey_deliveries as delivery
    join public.journey_enrollments as enrollment
      on enrollment.id = delivery.enrollment_id
    where enrollment.member_id = enrollment_member
      and delivery.id <> new.id
      and delivery.status = 'sent'
      and delivery.sent_at >= now() - interval '7 days';

    if messages_sent >= 3 then
      raise exception
        'A member may receive at most three automated journey messages in a rolling week.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists journey_deliveries_weekly_cadence
  on public.journey_deliveries;
create trigger journey_deliveries_weekly_cadence
  before update of status on public.journey_deliveries
  for each row execute procedure public.enforce_weekly_journey_cadence();

drop trigger if exists connection_preferences_touch_updated_at on public.connection_preferences;
create trigger connection_preferences_touch_updated_at
  before update on public.connection_preferences
  for each row execute procedure public.touch_updated_at();
drop trigger if exists journeys_touch_updated_at on public.journeys;
create trigger journeys_touch_updated_at
  before update on public.journeys
  for each row execute procedure public.touch_updated_at();
drop trigger if exists journey_milestones_touch_updated_at on public.journey_milestones;
create trigger journey_milestones_touch_updated_at
  before update on public.journey_milestones
  for each row execute procedure public.touch_updated_at();
drop trigger if exists journey_enrollments_touch_updated_at on public.journey_enrollments;
create trigger journey_enrollments_touch_updated_at
  before update on public.journey_enrollments
  for each row execute procedure public.touch_updated_at();
drop trigger if exists conversations_touch_updated_at on public.conversations;
create trigger conversations_touch_updated_at
  before update on public.conversations
  for each row execute procedure public.touch_updated_at();
drop trigger if exists journey_deliveries_touch_updated_at on public.journey_deliveries;
create trigger journey_deliveries_touch_updated_at
  before update on public.journey_deliveries
  for each row execute procedure public.touch_updated_at();
drop trigger if exists relationship_engine_settings_touch_updated_at on public.relationship_engine_settings;
create trigger relationship_engine_settings_touch_updated_at
  before update on public.relationship_engine_settings
  for each row execute procedure public.touch_updated_at();

alter table public.relationships enable row level security;
alter table public.connection_preferences enable row level security;
alter table public.journeys enable row level security;
alter table public.journey_milestones enable row level security;
alter table public.journey_enrollments enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_messages enable row level security;
alter table public.journey_deliveries enable row level security;
alter table public.relationship_alerts enable row level security;
alter table public.relationship_engine_settings enable row level security;

drop policy if exists "relationships_select_own" on public.relationships;
create policy "relationships_select_own"
  on public.relationships for select
  to authenticated
  using ((select auth.uid()) = member_id);

drop policy if exists "relationships_admin_select" on public.relationships;
create policy "relationships_admin_select"
  on public.relationships for select
  to authenticated
  using ((select public.is_current_user_admin()));

drop policy if exists "connection_preferences_select_own" on public.connection_preferences;
create policy "connection_preferences_select_own"
  on public.connection_preferences for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "connection_preferences_insert_own" on public.connection_preferences;
create policy "connection_preferences_insert_own"
  on public.connection_preferences for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "connection_preferences_update_own" on public.connection_preferences;
create policy "connection_preferences_update_own"
  on public.connection_preferences for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "journeys_select_available" on public.journeys;
create policy "journeys_select_available"
  on public.journeys for select
  to authenticated
  using (
    (
      enrollment_mode = 'opt_in'
      and status in ('scheduled', 'active')
    )
    or exists (
      select 1
      from public.journey_enrollments as enrollment
      where enrollment.journey_id = journeys.id
        and enrollment.member_id = (select auth.uid())
    )
  );

drop policy if exists "journeys_admin_select" on public.journeys;
create policy "journeys_admin_select"
  on public.journeys for select
  to authenticated
  using ((select public.is_current_user_admin()));

drop policy if exists "journey_milestones_select_enrolled" on public.journey_milestones;
create policy "journey_milestones_select_enrolled"
  on public.journey_milestones for select
  to authenticated
  using (
    exists (
      select 1
      from public.journey_enrollments as enrollment
      where enrollment.journey_id = journey_milestones.journey_id
        and enrollment.member_id = (select auth.uid())
    )
  );

drop policy if exists "journey_milestones_admin_select" on public.journey_milestones;
create policy "journey_milestones_admin_select"
  on public.journey_milestones for select
  to authenticated
  using ((select public.is_current_user_admin()));

drop policy if exists "journey_enrollments_select_own" on public.journey_enrollments;
create policy "journey_enrollments_select_own"
  on public.journey_enrollments for select
  to authenticated
  using ((select auth.uid()) = member_id);

drop policy if exists "journey_enrollments_opt_in" on public.journey_enrollments;
create policy "journey_enrollments_opt_in"
  on public.journey_enrollments for insert
  to authenticated
  with check (
    (select auth.uid()) = member_id
    and status = 'pending'
    and exists (
      select 1
      from public.journeys as journey
      where journey.id = journey_enrollments.journey_id
        and journey.enrollment_mode = 'opt_in'
        and journey.status in ('scheduled', 'active')
    )
  );

drop policy if exists "journey_enrollments_admin_select" on public.journey_enrollments;
create policy "journey_enrollments_admin_select"
  on public.journey_enrollments for select
  to authenticated
  using ((select public.is_current_user_admin()));

drop policy if exists "conversations_select_own" on public.conversations;
create policy "conversations_select_own"
  on public.conversations for select
  to authenticated
  using (
    exists (
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
    type in ('direct', 'booking_support', 'feedback')
    and journey_enrollment_id is null
    and exists (
      select 1
      from public.relationships as relationship
      where relationship.id = conversations.relationship_id
        and relationship.member_id = (select auth.uid())
        and relationship.status = 'active'
    )
  );

drop policy if exists "conversations_admin_select" on public.conversations;
create policy "conversations_admin_select"
  on public.conversations for select
  to authenticated
  using ((select public.is_current_user_admin()));

drop policy if exists "conversation_messages_select_own" on public.conversation_messages;
create policy "conversation_messages_select_own"
  on public.conversation_messages for select
  to authenticated
  using (
    exists (
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
    sender_id = (select auth.uid())
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

drop policy if exists "conversation_messages_admin_select" on public.conversation_messages;
create policy "conversation_messages_admin_select"
  on public.conversation_messages for select
  to authenticated
  using ((select public.is_current_user_admin()));

drop policy if exists "relationship_alerts_admin_select" on public.relationship_alerts;
create policy "relationship_alerts_admin_select"
  on public.relationship_alerts for select
  to authenticated
  using ((select public.is_current_user_admin()));

drop policy if exists "relationship_engine_settings_admin_select" on public.relationship_engine_settings;
create policy "relationship_engine_settings_admin_select"
  on public.relationship_engine_settings for select
  to authenticated
  using ((select public.is_current_user_admin()));

revoke all on table public.relationships from anon, authenticated;
revoke all on table public.connection_preferences from anon, authenticated;
revoke all on table public.journeys from anon, authenticated;
revoke all on table public.journey_milestones from anon, authenticated;
revoke all on table public.journey_enrollments from anon, authenticated;
revoke all on table public.conversations from anon, authenticated;
revoke all on table public.conversation_messages from anon, authenticated;
revoke all on table public.journey_deliveries from anon, authenticated;
revoke all on table public.relationship_alerts from anon, authenticated;
revoke all on table public.relationship_engine_settings from anon, authenticated;

grant select (
  id,
  member_id,
  practitioner_id,
  status,
  created_at,
  last_interaction,
  intimacy_score
) on public.relationships to authenticated;
grant select, insert, update on public.connection_preferences to authenticated;
grant select on public.journeys to authenticated;
grant select on public.journey_milestones to authenticated;
grant select on public.journey_enrollments to authenticated;
grant insert (journey_id, member_id) on public.journey_enrollments to authenticated;
grant select on public.conversations to authenticated;
grant insert (relationship_id, type, subject) on public.conversations to authenticated;
grant select on public.conversation_messages to authenticated;
grant insert (
  conversation_id,
  sender_id,
  body,
  reply_to_id
) on public.conversation_messages to authenticated;
grant select on public.relationship_alerts to authenticated;
grant select on public.relationship_engine_settings to authenticated;

grant all on table public.relationships to service_role;
grant all on table public.connection_preferences to service_role;
grant all on table public.journeys to service_role;
grant all on table public.journey_milestones to service_role;
grant all on table public.journey_enrollments to service_role;
grant all on table public.conversations to service_role;
grant all on table public.conversation_messages to service_role;
grant all on table public.journey_deliveries to service_role;
grant all on table public.relationship_alerts to service_role;
grant all on table public.relationship_engine_settings to service_role;

create or replace function public.send_conversation_message(
  p_conversation_id uuid,
  p_body text,
  p_reply_to_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_id uuid := auth.uid();
  message_id uuid;
begin
  if caller_id is null then
    raise exception 'Authentication is required.';
  end if;

  if char_length(btrim(p_body)) not between 1 and 20000 then
    raise exception 'Message body must be between 1 and 20000 characters.';
  end if;

  if not exists (
    select 1
    from public.conversations as conversation
    join public.relationships as relationship
      on relationship.id = conversation.relationship_id
    where conversation.id = p_conversation_id
      and relationship.member_id = caller_id
      and relationship.status = 'active'
  ) then
    raise exception 'Conversation is not available.';
  end if;

  insert into public.conversation_messages (
    conversation_id,
    sender_id,
    body,
    reply_to_id
  )
  values (
    p_conversation_id,
    caller_id,
    btrim(p_body),
    p_reply_to_id
  )
  returning id into message_id;

  return message_id;
end;
$$;

create or replace function public.mark_conversation_read(
  p_conversation_id uuid
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_id uuid := auth.uid();
  member_id uuid;
  practitioner_id uuid;
  marked_count integer;
begin
  if caller_id is null then
    raise exception 'Authentication is required.';
  end if;

  select relationship.member_id, relationship.practitioner_id
  into member_id, practitioner_id
  from public.conversations as conversation
  join public.relationships as relationship
    on relationship.id = conversation.relationship_id
  where conversation.id = p_conversation_id;

  if member_id is null then
    raise exception 'Conversation is not available.';
  end if;

  if caller_id = member_id then
    update public.conversation_messages
    set read_at = coalesce(read_at, now())
    where conversation_id = p_conversation_id
      and sender_id = practitioner_id
      and read_at is null;
    get diagnostics marked_count = row_count;

    update public.conversations
    set member_unread_count = 0, updated_at = now()
    where id = p_conversation_id;
  elsif caller_id = practitioner_id
    or (select public.is_current_user_admin()) then
    update public.conversation_messages
    set read_at = coalesce(read_at, now())
    where conversation_id = p_conversation_id
      and sender_id = member_id
      and read_at is null;
    get diagnostics marked_count = row_count;

    update public.conversations
    set practitioner_unread_count = 0, updated_at = now()
    where id = p_conversation_id;
  else
    raise exception 'Conversation is not available.';
  end if;

  return marked_count;
end;
$$;

create or replace function public.set_journey_participation(
  p_enrollment_id uuid,
  p_participating boolean
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_id uuid := auth.uid();
  next_status text;
begin
  if caller_id is null then
    raise exception 'Authentication is required.';
  end if;

  if not exists (
    select 1
    from public.journey_enrollments as enrollment
    join public.journeys as journey on journey.id = enrollment.journey_id
    where enrollment.id = p_enrollment_id
      and enrollment.member_id = caller_id
      and journey.enrollment_mode = 'opt_in'
      and journey.status in ('scheduled', 'active', 'paused')
  ) then
    raise exception 'Journey enrollment is not available.';
  end if;

  if p_participating then
    select case
      when journey.status = 'active'
        and journey.start_at <= now()
        and (journey.end_at is null or journey.end_at > now())
        then 'active'
      else 'pending'
    end
    into next_status
    from public.journey_enrollments as enrollment
    join public.journeys as journey on journey.id = enrollment.journey_id
    where enrollment.id = p_enrollment_id;

    update public.journey_enrollments
    set
      status = next_status,
      started_at = case
        when next_status = 'active' then coalesce(started_at, now())
        else started_at
      end,
      updated_at = now()
    where id = p_enrollment_id;
  else
    next_status := 'opted_out';
    update public.journey_enrollments
    set status = next_status, updated_at = now()
    where id = p_enrollment_id;
  end if;

  return next_status;
end;
$$;

create or replace function public.set_journey_pause(
  p_enrollment_id uuid,
  p_paused boolean
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_id uuid := auth.uid();
  current_status text;
  next_status text;
begin
  if caller_id is null then
    raise exception 'Authentication is required.';
  end if;

  select enrollment.status
  into current_status
  from public.journey_enrollments as enrollment
  where enrollment.id = p_enrollment_id
    and enrollment.member_id = caller_id;

  if current_status is null or current_status in ('completed', 'opted_out') then
    raise exception 'Journey enrollment cannot be paused.';
  end if;

  if p_paused then
    next_status := 'paused';
    update public.journey_enrollments
    set
      status = next_status,
      paused_at = now(),
      pause_until = null,
      updated_at = now()
    where id = p_enrollment_id;
  else
    select case
      when journey.status = 'active'
        and journey.start_at <= now()
        and (journey.end_at is null or journey.end_at > now())
        then 'active'
      else 'pending'
    end
    into next_status
    from public.journey_enrollments as enrollment
    join public.journeys as journey on journey.id = enrollment.journey_id
    where enrollment.id = p_enrollment_id;

    update public.journey_enrollments
    set
      status = next_status,
      started_at = case
        when next_status = 'active' then coalesce(started_at, now())
        else started_at
      end,
      paused_at = null,
      pause_until = null,
      updated_at = now()
    where id = p_enrollment_id;
  end if;

  return next_status;
end;
$$;

create or replace function public.claim_due_journey_deliveries(
  p_batch_size integer default 50
)
returns setof public.journey_deliveries
language plpgsql
security definer
set search_path = public
as $$
begin
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

revoke all on function public.enforce_journey_milestone_guardrails() from public;
revoke all on function public.create_connection_preferences() from public;
revoke all on function public.preserve_relational_keys() from public;
revoke all on function public.validate_relationship_practitioner() from public;
revoke all on function public.validate_journey_creator() from public;
revoke all on function public.enforce_journey_override_change() from public;
revoke all on function public.enforce_enrollment_guardrails() from public;
revoke all on function public.validate_conversation_context() from public;
revoke all on function public.validate_conversation_message() from public;
revoke all on function public.preserve_conversation_message_history() from public;
revoke all on function public.update_conversation_from_message() from public;
revoke all on function public.queue_deliveries_for_enrollment() from public;
revoke all on function public.queue_deliveries_for_milestone() from public;
revoke all on function public.refresh_enrollment_from_delivery() from public;
revoke all on function public.enforce_weekly_journey_cadence() from public;
revoke all on function public.send_conversation_message(uuid, text, uuid) from public, anon;
revoke all on function public.mark_conversation_read(uuid) from public, anon;
revoke all on function public.set_journey_participation(uuid, boolean) from public, anon;
revoke all on function public.set_journey_pause(uuid, boolean) from public, anon;
revoke all on function public.claim_due_journey_deliveries(integer) from public, anon, authenticated;

grant execute on function public.send_conversation_message(uuid, text, uuid) to authenticated;
grant execute on function public.mark_conversation_read(uuid) to authenticated;
grant execute on function public.set_journey_participation(uuid, boolean) to authenticated;
grant execute on function public.set_journey_pause(uuid, boolean) to authenticated;
grant execute on function public.claim_due_journey_deliveries(integer) to service_role;
