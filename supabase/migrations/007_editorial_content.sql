-- Structured website editorial content for Whole Body OS.
--
-- This migration is intentionally server-authoritative:
--   * anon and authenticated clients receive no table privileges or RLS policy;
--   * trusted server code may use the service role after re-authorizing an admin;
--   * public pages consume only a deliberately minimized, fully gated DTO.
--
-- Apply in sequence after migrations 001 through 006. Applying this file enables the
-- authenticated editor persistence boundary. It does not publish any draft;
-- the public reader ignores everything except a fully gated published record.

begin;

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  asset_key text not null unique check (
    asset_key ~ '^[a-z0-9]+([._-][a-z0-9]+)*$'
  ),
  title text not null check (char_length(btrim(title)) between 1 and 160),
  media_kind text not null check (media_kind in ('image', 'video')),
  status text not null default 'draft' check (
    status in ('draft', 'review', 'ready', 'archived')
  ),
  provider text not null default 'supabase' check (
    provider in ('repo_public', 'supabase', 'mux', 'external')
  ),
  public_path text check (
    public_path is null
    or (
      (public_path = '/' or public_path ~ '^/[^/]')
      and public_path !~ '[[:cntrl:]]'
      and position(chr(92) in public_path) = 0
    )
  ),
  storage_bucket text,
  storage_path text,
  external_url text check (
    external_url is null or external_url ~ '^https://'
  ),
  mux_playback_id text,
  mime_type text,
  width integer check (width is null or width > 0),
  height integer check (height is null or height > 0),
  duration_seconds numeric(10, 3) check (
    duration_seconds is null or duration_seconds >= 0
  ),
  alt_text text,
  accessibility_description text,
  caption text,
  credit text,
  has_meaningful_audio boolean not null default false,
  captions_path text,
  transcript_path text,
  focal_point_x numeric(4, 3) not null default 0.5 check (
    focal_point_x between 0 and 1
  ),
  focal_point_y numeric(4, 3) not null default 0.5 check (
    focal_point_y between 0 and 1
  ),
  rights_status text not null default 'unverified' check (
    rights_status in (
      'unverified',
      'owned',
      'licensed',
      'permission_granted',
      'restricted'
    )
  ),
  rights_holder text,
  rights_reference text,
  rights_expires_at timestamptz,
  model_release_status text not null default 'not_reviewed' check (
    model_release_status in (
      'not_reviewed',
      'not_applicable',
      'not_required',
      'required',
      'obtained'
    )
  ),
  model_release_reference text,
  ai_usage text not null default 'none' check (
    ai_usage in ('none', 'ai_assisted', 'ai_generated')
  ),
  ai_disclosure text,
  metadata jsonb not null default '{}'::jsonb check (
    jsonb_typeof(metadata) = 'object'
  ),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    status <> 'ready'
    or coalesce(public_path, storage_path, external_url, mux_playback_id) is not null
  ),
  check (
    status <> 'ready'
    or rights_status in ('owned', 'licensed', 'permission_granted')
  ),
  check (
    status <> 'ready'
    or model_release_status in (
      'not_applicable',
      'not_required',
      'obtained'
    )
  ),
  check (
    media_kind <> 'image'
    or status <> 'ready'
    or nullif(btrim(alt_text), '') is not null
  ),
  check (
    media_kind <> 'video'
    or status <> 'ready'
    or nullif(btrim(accessibility_description), '') is not null
  ),
  check (
    not has_meaningful_audio
    or status <> 'ready'
    or coalesce(captions_path, transcript_path) is not null
  ),
  check (
    ai_usage = 'none'
    or nullif(btrim(ai_disclosure), '') is not null
  ),
  check (
    rights_status not in ('licensed', 'permission_granted')
    or nullif(btrim(rights_reference), '') is not null
  ),
  check (
    model_release_status <> 'obtained'
    or nullif(btrim(model_release_reference), '') is not null
  )
);

create table if not exists public.content_entries (
  id uuid primary key default gen_random_uuid(),
  entry_key text not null unique check (
    entry_key ~ '^[a-z0-9]+([._-][a-z0-9]+)*$'
  ),
  entry_type text not null default 'page' check (
    entry_type in ('page', 'global', 'journal')
  ),
  admin_title text not null check (
    char_length(btrim(admin_title)) between 1 and 160
  ),
  page_path text unique check (
    page_path is null
    or page_path = '/'
    or page_path ~ '^/[^/]'
  ),
  template_key text not null check (
    template_key ~ '^[a-z0-9]+([._-][a-z0-9]+)*$'
  ),
  status text not null default 'draft' check (
    status in ('draft', 'review', 'published', 'archived')
  ),
  seo_title text check (seo_title is null or char_length(seo_title) <= 70),
  seo_description text check (
    seo_description is null or char_length(seo_description) <= 180
  ),
  published_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (status <> 'published' or published_at is not null)
);

create table if not exists public.content_sections (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.content_entries(id) on delete cascade,
  section_key text not null check (
    section_key ~ '^[a-z0-9]+([._-][a-z0-9]+)*$'
  ),
  section_type text not null check (
    section_type in (
      'hero',
      'featured_story',
      'path_cards',
      'booking_invitation',
      'editorial_chapter',
      'gallery',
      'credentials',
      'rich_text',
      'call_to_action'
    )
  ),
  admin_label text not null check (
    char_length(btrim(admin_label)) between 1 and 120
  ),
  eyebrow text,
  headline text,
  body text,
  cta_label text,
  cta_href text check (
    cta_href is null
    or cta_href = '/'
    or cta_href ~ '^/[^/]'
  ),
  media_asset_id uuid references public.media_assets(id) on delete set null,
  position integer not null default 0 check (position >= 0),
  is_visible boolean not null default true,
  is_design_locked boolean not null default false,
  content jsonb not null default '{}'::jsonb check (
    jsonb_typeof(content) = 'object'
  ),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (entry_id, section_key),
  unique (entry_id, position),
  check (
    (cta_label is null and cta_href is null)
    or (
      nullif(btrim(cta_label), '') is not null
      and nullif(btrim(cta_href), '') is not null
    )
  )
);

create table if not exists public.featured_slots (
  id uuid primary key default gen_random_uuid(),
  feature_key text not null unique check (
    feature_key ~ '^[a-z0-9]+([._-][a-z0-9]+)*$'
  ),
  slot_key text not null check (
    slot_key ~ '^[a-z0-9]+([._-][a-z0-9]+)*$'
  ),
  internal_name text not null check (
    char_length(btrim(internal_name)) between 1 and 160
  ),
  status text not null default 'draft' check (
    status in ('draft', 'review', 'published', 'archived')
  ),
  eyebrow text check (eyebrow is null or char_length(eyebrow) <= 48),
  headline text not null check (
    char_length(btrim(headline)) between 1 and 72
  ),
  description text check (
    description is null or char_length(description) <= 100
  ),
  cta_label text not null check (
    char_length(btrim(cta_label)) between 1 and 32
  ),
  cta_href text not null check (
    char_length(cta_href) <= 160
    and (cta_href = '/' or cta_href ~ '^/[^/]')
    and cta_href !~ '[[:cntrl:]]'
    and position(chr(92) in cta_href) = 0
  ),
  media_asset_id uuid references public.media_assets(id) on delete restrict,
  entry_id uuid references public.content_entries(id) on delete set null,
  starts_at timestamptz,
  ends_at timestamptz,
  published_at timestamptz,
  content jsonb not null default '{}'::jsonb check (
    jsonb_typeof(content) = 'object'
  ),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or starts_at is null or ends_at > starts_at),
  check (status <> 'published' or published_at is not null),
  check (status <> 'published' or media_asset_id is not null)
);

create table if not exists public.content_revisions (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.content_entries(id) on delete cascade,
  revision_number integer not null check (revision_number > 0),
  status text not null default 'draft' check (
    status in ('draft', 'review', 'published', 'superseded')
  ),
  snapshot jsonb not null check (jsonb_typeof(snapshot) = 'object'),
  content_hash text,
  change_summary text,
  created_by uuid references auth.users(id) on delete set null,
  published_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  published_at timestamptz,
  unique (entry_id, revision_number),
  check (status <> 'published' or published_at is not null),
  check (status <> 'published' or published_by is not null)
);

create index if not exists content_sections_entry_position_idx
  on public.content_sections(entry_id, position);
create index if not exists featured_slots_publication_idx
  on public.featured_slots(slot_key, status, starts_at, ends_at);
create index if not exists content_revisions_entry_created_idx
  on public.content_revisions(entry_id, revision_number desc);
create index if not exists media_assets_status_kind_idx
  on public.media_assets(status, media_kind);

drop trigger if exists media_assets_touch_updated_at on public.media_assets;
create trigger media_assets_touch_updated_at
  before update on public.media_assets
  for each row execute procedure public.touch_updated_at();

drop trigger if exists content_entries_touch_updated_at on public.content_entries;
create trigger content_entries_touch_updated_at
  before update on public.content_entries
  for each row execute procedure public.touch_updated_at();

drop trigger if exists content_sections_touch_updated_at on public.content_sections;
create trigger content_sections_touch_updated_at
  before update on public.content_sections
  for each row execute procedure public.touch_updated_at();

drop trigger if exists featured_slots_touch_updated_at on public.featured_slots;
create trigger featured_slots_touch_updated_at
  before update on public.featured_slots
  for each row execute procedure public.touch_updated_at();

alter table public.media_assets enable row level security;
alter table public.media_assets force row level security;
alter table public.content_entries enable row level security;
alter table public.content_entries force row level security;
alter table public.content_sections enable row level security;
alter table public.content_sections force row level security;
alter table public.featured_slots enable row level security;
alter table public.featured_slots force row level security;
alter table public.content_revisions enable row level security;
alter table public.content_revisions force row level security;

revoke all on table public.media_assets
  from public, anon, authenticated, service_role;
revoke all on table public.content_entries
  from public, anon, authenticated, service_role;
revoke all on table public.content_sections
  from public, anon, authenticated, service_role;
revoke all on table public.featured_slots
  from public, anon, authenticated, service_role;
revoke all on table public.content_revisions
  from public, anon, authenticated, service_role;

grant select, insert, update, delete on table public.media_assets to service_role;
grant select, insert, update, delete on table public.content_entries to service_role;
grant select, insert, update, delete on table public.content_sections to service_role;
grant select, insert, update, delete on table public.featured_slots to service_role;
grant select, insert on table public.content_revisions to service_role;

comment on table public.media_assets is
  'Server-managed website media with accessibility, usage-rights, release, AI disclosure, and crop metadata.';
comment on table public.content_entries is
  'Server-managed editorial entry records. No browser role has direct access.';
comment on table public.content_sections is
  'Ordered structured sections belonging to an editorial content entry.';
comment on table public.featured_slots is
  'Schedulable featured experiences such as the homepage LIFT story.';
comment on table public.content_revisions is
  'Append-only editorial snapshots created by the authorized publishing boundary.';

-- Draft-only starting structure. These records do not render publicly until a
-- authorized publishing boundary explicitly promotes a revision.
insert into public.content_entries (
  id,
  entry_key,
  entry_type,
  admin_title,
  page_path,
  template_key,
  status,
  seo_title,
  seo_description
)
values
  (
    '71000000-0000-4000-8000-000000000001',
    'homepage',
    'page',
    'Homepage',
    '/',
    'landing-pad',
    'draft',
    'HWL by SMD | Beauty, Movement & Astrology in Palm Springs',
    'Beauty rituals, private movement, sound, astrology, and desert experiences with Shannon Mary Dixon in Palm Springs.'
  ),
  (
    '71000000-0000-4000-8000-000000000002',
    'about-shannon',
    'page',
    'About Shannon',
    '/about',
    'editorial-profile',
    'draft',
    'About Shannon Mary Dixon | HWL by SMD',
    'Meet Shannon Mary Dixon, the Palm Springs practitioner behind HWL by SMD.'
  )
on conflict (entry_key) do nothing;

insert into public.content_sections (
  entry_id,
  section_key,
  section_type,
  admin_label,
  headline,
  body,
  cta_label,
  cta_href,
  position,
  is_design_locked,
  content
)
values
  (
    '71000000-0000-4000-8000-000000000001',
    'hero',
    'hero',
    'Hero experience',
    'Come back to your whole body.',
    'A Shannon-first portrait opens into the ambient Whole Body film.',
    null,
    null,
    0,
    true,
    '{"editable_fields":["eyebrow","headline","body","cta_label","cta_href","media_asset_id"]}'::jsonb
  ),
  (
    '71000000-0000-4000-8000-000000000001',
    'primary-feature',
    'featured_story',
    'Featured story',
    'A five-minute facial ritual.',
    'Guided video + downloadable PDF · $11.11 one time.',
    'Experience LIFT',
    '/beauty/lift',
    1,
    true,
    '{"slot_key":"homepage.primary-feature"}'::jsonb
  ),
  (
    '71000000-0000-4000-8000-000000000001',
    'practice-paths',
    'path_cards',
    'Four entry doors',
    'LIFT, private sessions, The Den, and retreat invitations.',
    null,
    null,
    null,
    2,
    true,
    '{"paths":["lift","sessions","the-den","retreats"]}'::jsonb
  ),
  (
    '71000000-0000-4000-8000-000000000001',
    'booking-invitation',
    'booking_invitation',
    'Contact edge',
    'Palm Springs location, email address, and telephone link.',
    null,
    null,
    null,
    3,
    true,
    '{}'::jsonb
  ),
  (
    '71000000-0000-4000-8000-000000000002',
    'opening-portrait',
    'editorial_chapter',
    'Opening portrait',
    'Meet Shannon.',
    null,
    null,
    null,
    0,
    true,
    '{"media_brief":"Present-day editorial portrait"}'::jsonb
  ),
  (
    '71000000-0000-4000-8000-000000000002',
    'skating',
    'editorial_chapter',
    'Skating chapter',
    null,
    null,
    null,
    null,
    1,
    true,
    '{"media_brief":"Original archival or newly commissioned skating photography"}'::jsonb
  ),
  (
    '71000000-0000-4000-8000-000000000002',
    'yoga',
    'editorial_chapter',
    'Yoga chapter',
    null,
    null,
    null,
    null,
    2,
    true,
    '{"media_brief":"Outdoor yoga with natural, unperformed movement"}'::jsonb
  ),
  (
    '71000000-0000-4000-8000-000000000002',
    'motorcycle',
    'editorial_chapter',
    'Motorcycle chapter',
    null,
    null,
    null,
    null,
    3,
    true,
    '{"media_brief":"Original or newly commissioned motorcycle portrait"}'::jsonb
  ),
  (
    '71000000-0000-4000-8000-000000000002',
    'beauty-work',
    'editorial_chapter',
    'Beauty work chapter',
    null,
    null,
    null,
    null,
    4,
    true,
    '{"media_brief":"Shannon performing real facial work with client release"}'::jsonb
  ),
  (
    '71000000-0000-4000-8000-000000000002',
    'desert-life',
    'editorial_chapter',
    'Desert life chapter',
    null,
    null,
    null,
    null,
    5,
    true,
    '{"media_brief":"Relaxed Palm Springs desert-life photograph"}'::jsonb
  ),
  (
    '71000000-0000-4000-8000-000000000002',
    'credentials',
    'credentials',
    'Verified credentials',
    null,
    null,
    null,
    null,
    6,
    true,
    '{"publish_gate":"Credentials require source verification"}'::jsonb
  ),
  (
    '71000000-0000-4000-8000-000000000002',
    'closing-invitation',
    'call_to_action',
    'Closing invitation',
    'Come spend some time with Shannon.',
    null,
    'Book with Shannon',
    '/book',
    7,
    true,
    '{}'::jsonb
  )
on conflict (entry_id, section_key) do nothing;

insert into public.media_assets (
  id,
  asset_key,
  title,
  media_kind,
  status,
  provider,
  public_path,
  accessibility_description,
  credit,
  has_meaningful_audio,
  focal_point_x,
  focal_point_y,
  rights_status,
  rights_holder,
  rights_reference,
  model_release_status,
  ai_usage,
  metadata
)
values (
  '70000000-0000-4000-8000-000000000001',
  'lift-video-preview',
  'LIFT homepage preview',
  'video',
  'ready',
  'repo_public',
  '/video/lift/facial-lift-preview.mp4',
  'A quiet close-up preview of Shannon demonstrating her LIFT facial massage.',
  'Courtesy Shannon Mary Dixon',
  false,
  0.5,
  0.42,
  'owned',
  'Shannon Mary Dixon',
  'Source video supplied directly by the site owner for HWL by SMD on 2026-08-20.',
  'not_required',
  'none',
  '{"provenance":"Site-owner-supplied muted homepage derivative of FACIAL LIFT VIDEO FINAL.mp4.","audio":"Muted derivative; no meaningful audio."}'::jsonb
)
on conflict (asset_key) do nothing;

-- AI-generated About concepts are catalogued for review, never publication.
-- Their visible disclosures travel with the assets, and the draft status plus
-- unresolved rights/release fields keeps the database publication gates shut.
insert into public.media_assets (
  id,
  asset_key,
  title,
  media_kind,
  status,
  provider,
  public_path,
  alt_text,
  credit,
  rights_status,
  model_release_status,
  ai_usage,
  ai_disclosure,
  metadata
)
values
  (
    '70000000-0000-4000-8000-000000000002',
    'about-shannon-skating-concept-v1',
    'About Shannon skating editorial concept v1',
    'image',
    'draft',
    'repo_public',
    '/images/editorial/about-shannon-skating-concept-v1.webp',
    'Editorial concept of a red-haired figure skater on indoor ice, wearing a dark aubergine skating dress.',
    'AI-generated editorial concept for HWL by SMD',
    'unverified',
    'not_reviewed',
    'ai_generated',
    'AI-generated editorial concept created from Shannon reference portraits; replace with approved original photography before publication.',
    '{"publication_intent":"Concept only. Do not publish as documentary photography."}'::jsonb
  ),
  (
    '70000000-0000-4000-8000-000000000003',
    'about-shannon-motorcycle-concept-v1',
    'About Shannon motorcycle editorial concept v1',
    'image',
    'draft',
    'repo_public',
    '/images/editorial/about-shannon-motorcycle-concept-v1.webp',
    'Editorial concept of Shannon seated on a classic motorcycle in the Palm Springs desert, wearing a helmet and protective jacket.',
    'AI-generated editorial concept for HWL by SMD',
    'unverified',
    'not_reviewed',
    'ai_generated',
    'AI-generated editorial concept created from Shannon reference portraits; replace with approved original photography before publication.',
    '{"publication_intent":"Concept only. Do not publish as documentary photography."}'::jsonb
  )
on conflict (asset_key) do nothing;

insert into public.featured_slots (
  id,
  feature_key,
  slot_key,
  internal_name,
  status,
  eyebrow,
  headline,
  description,
  cta_label,
  cta_href,
  media_asset_id,
  entry_id,
  content
)
values (
  '72000000-0000-4000-8000-000000000001',
  'lift-daily-ritual',
  'homepage.primary-feature',
  'LIFT daily facial ritual',
  'draft',
  'LIFT · Guided facial massage',
  'A five-minute facial ritual.',
  'Guided video + downloadable PDF · $11.11 one time.',
  'Experience LIFT',
  '/beauty/lift',
  '70000000-0000-4000-8000-000000000001',
  '71000000-0000-4000-8000-000000000001',
  '{"video_behavior":"muted autoplay once with reduced-motion poster"}'::jsonb
)
on conflict (feature_key) do nothing;

-- The only mutation boundary for the homepage feature. PostgREST invokes each
-- RPC in a transaction, and this function locks the homepage entry before it
-- updates canonical content and appends its matching revision snapshot.
create or replace function public.persist_homepage_feature(
  p_actor_id uuid,
  p_eyebrow text,
  p_headline text,
  p_description text,
  p_cta_label text,
  p_cta_href text,
  p_publish boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_entry public.content_entries%rowtype;
  v_feature public.featured_slots%rowtype;
  v_media public.media_assets%rowtype;
  v_eyebrow text := nullif(btrim(coalesce(p_eyebrow, '')), '');
  v_headline text := btrim(coalesce(p_headline, ''));
  v_description text := nullif(btrim(coalesce(p_description, '')), '');
  v_cta_label text := btrim(coalesce(p_cta_label, ''));
  v_cta_href text := btrim(coalesce(p_cta_href, ''));
  v_revision_number integer;
  v_draft_payload jsonb;
  v_sections_snapshot jsonb;
  v_snapshot jsonb;
begin
  if p_actor_id is null or not exists (
    select 1
    from public.profiles
    where id = p_actor_id and is_admin = true
  ) then
    raise exception using
      errcode = '42501',
      message = 'An active administrator is required.';
  end if;

  if char_length(coalesce(v_eyebrow, '')) > 48 then
    raise exception using errcode = '22023', message = 'Eyebrow is too long.';
  end if;
  if char_length(v_headline) not between 1 and 72 then
    raise exception using errcode = '22023', message = 'Headline is invalid.';
  end if;
  if char_length(coalesce(v_description, '')) > 100 then
    raise exception using errcode = '22023', message = 'Description is too long.';
  end if;
  if char_length(v_cta_label) not between 1 and 32 then
    raise exception using errcode = '22023', message = 'CTA label is invalid.';
  end if;
  if
    char_length(v_cta_href) not between 1 and 160
    or not (v_cta_href = '/' or v_cta_href ~ '^/[^/]')
    or v_cta_href ~ '[[:cntrl:]]'
    or position(chr(92) in v_cta_href) > 0
  then
    raise exception using errcode = '22023', message = 'CTA route is invalid.';
  end if;

  select *
  into v_entry
  from public.content_entries
  where entry_key = 'homepage'
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'code', 'homepage_missing');
  end if;

  select *
  into v_feature
  from public.featured_slots
  where
    feature_key = 'lift-daily-ritual'
    and slot_key = 'homepage.primary-feature'
    and entry_id = v_entry.id
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'code', 'feature_missing');
  end if;

  if v_feature.media_asset_id is not null then
    select *
    into v_media
    from public.media_assets
    where id = v_feature.media_asset_id;
  end if;

  if p_publish then
    if v_feature.media_asset_id is null or v_media.id is null then
      return jsonb_build_object('ok', false, 'code', 'media_required');
    end if;
    if v_media.status <> 'ready' then
      return jsonb_build_object('ok', false, 'code', 'media_not_ready');
    end if;
    if v_media.rights_status not in ('owned', 'licensed', 'permission_granted') then
      return jsonb_build_object('ok', false, 'code', 'media_rights');
    end if;
    if v_media.rights_expires_at is not null and v_media.rights_expires_at <= now() then
      return jsonb_build_object('ok', false, 'code', 'media_rights_expired');
    end if;
    if v_media.model_release_status not in (
      'not_applicable',
      'not_required',
      'obtained'
    ) then
      return jsonb_build_object('ok', false, 'code', 'media_release');
    end if;
    if
      (v_media.media_kind = 'image' and nullif(btrim(v_media.alt_text), '') is null)
      or (
        v_media.media_kind = 'video'
        and nullif(btrim(v_media.accessibility_description), '') is null
      )
    then
      return jsonb_build_object('ok', false, 'code', 'media_accessibility');
    end if;
    if
      v_media.has_meaningful_audio
      and coalesce(v_media.captions_path, v_media.transcript_path) is null
    then
      return jsonb_build_object(
        'ok',
        false,
        'code',
        'media_audio_accessibility'
      );
    end if;
    if
      v_media.ai_usage <> 'none'
      and nullif(btrim(v_media.ai_disclosure), '') is null
    then
      return jsonb_build_object('ok', false, 'code', 'media_ai_disclosure');
    end if;
    if coalesce(
      v_media.public_path,
      v_media.storage_path,
      v_media.external_url,
      v_media.mux_playback_id
    ) is null then
      return jsonb_build_object('ok', false, 'code', 'media_source');
    end if;
  end if;

  v_draft_payload := jsonb_build_object(
    'eyebrow', v_eyebrow,
    'headline', v_headline,
    'description', v_description,
    'cta_label', v_cta_label,
    'cta_href', v_cta_href,
    'media_asset_id', v_feature.media_asset_id,
    'saved_at', now()
  );

  if p_publish then
    update public.featured_slots
    set
      status = 'published',
      eyebrow = v_eyebrow,
      headline = v_headline,
      description = v_description,
      cta_label = v_cta_label,
      cta_href = v_cta_href,
      published_at = now(),
      content = content - 'draft' - 'has_unpublished_changes',
      updated_by = p_actor_id
    where id = v_feature.id;

    update public.content_sections
    set
      eyebrow = v_eyebrow,
      headline = v_headline,
      body = v_description,
      cta_label = v_cta_label,
      cta_href = v_cta_href,
      media_asset_id = v_feature.media_asset_id,
      updated_by = p_actor_id
    where entry_id = v_entry.id and section_key = 'primary-feature';

    update public.content_entries
    set
      status = 'published',
      published_at = now(),
      updated_by = p_actor_id
    where id = v_entry.id;
  elsif v_feature.status = 'published' then
    -- Keep the last published canonical values live. The new draft remains
    -- private inside the editor record until a later publish promotes it.
    update public.featured_slots
    set
      content = jsonb_set(
        jsonb_set(content, '{draft}', v_draft_payload, true),
        '{has_unpublished_changes}',
        'true'::jsonb,
        true
      ),
      updated_by = p_actor_id
    where id = v_feature.id;

    update public.content_entries
    set updated_by = p_actor_id
    where id = v_entry.id;
  else
    update public.featured_slots
    set
      status = 'draft',
      eyebrow = v_eyebrow,
      headline = v_headline,
      description = v_description,
      cta_label = v_cta_label,
      cta_href = v_cta_href,
      published_at = null,
      content = content - 'draft' - 'has_unpublished_changes',
      updated_by = p_actor_id
    where id = v_feature.id;

    update public.content_sections
    set
      eyebrow = v_eyebrow,
      headline = v_headline,
      body = v_description,
      cta_label = v_cta_label,
      cta_href = v_cta_href,
      media_asset_id = v_feature.media_asset_id,
      updated_by = p_actor_id
    where entry_id = v_entry.id and section_key = 'primary-feature';

    update public.content_entries
    set status = 'draft', published_at = null, updated_by = p_actor_id
    where id = v_entry.id;
  end if;

  select *
  into v_entry
  from public.content_entries
  where id = v_entry.id;

  select *
  into v_feature
  from public.featured_slots
  where id = v_feature.id;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'key', section_key,
        'type', section_type,
        'label', admin_label,
        'eyebrow', eyebrow,
        'headline', headline,
        'body', body,
        'cta_label', cta_label,
        'cta_href', cta_href,
        'media_asset_id', media_asset_id,
        'position', position,
        'visible', is_visible,
        'content', content
      ) order by position
    ),
    '[]'::jsonb
  )
  into v_sections_snapshot
  from public.content_sections
  where entry_id = v_entry.id;

  v_snapshot := jsonb_build_object(
    'schema_version', 1,
    'action', case when p_publish then 'publish' else 'save_draft' end,
    'entry', jsonb_build_object(
      'key', v_entry.entry_key,
      'path', v_entry.page_path,
      'template', v_entry.template_key,
      'status', v_entry.status,
      'published_at', v_entry.published_at
    ),
    'sections', v_sections_snapshot,
    'proposed_feature', v_draft_payload,
    'canonical_feature', jsonb_build_object(
      'key', v_feature.feature_key,
      'slot', v_feature.slot_key,
      'status', v_feature.status,
      'eyebrow', v_feature.eyebrow,
      'headline', v_feature.headline,
      'description', v_feature.description,
      'cta_label', v_feature.cta_label,
      'cta_href', v_feature.cta_href,
      'media_asset_id', v_feature.media_asset_id,
      'published_at', v_feature.published_at
    ),
    'media', case
      when v_media.id is null then null
      else jsonb_build_object(
        'key', v_media.asset_key,
        'kind', v_media.media_kind,
        'status', v_media.status,
        'rights_status', v_media.rights_status,
        'rights_expires_at', v_media.rights_expires_at,
        'model_release_status', v_media.model_release_status,
        'ai_usage', v_media.ai_usage
      )
    end
  );

  select coalesce(max(revision_number), 0) + 1
  into v_revision_number
  from public.content_revisions
  where entry_id = v_entry.id;

  insert into public.content_revisions (
    entry_id,
    revision_number,
    status,
    snapshot,
    change_summary,
    created_by,
    published_by,
    published_at
  )
  values (
    v_entry.id,
    v_revision_number,
    case when p_publish then 'published' else 'draft' end,
    v_snapshot,
    case
      when p_publish then 'Published the homepage LIFT feature.'
      else 'Saved a homepage LIFT feature draft.'
    end,
    p_actor_id,
    case when p_publish then p_actor_id else null end,
    case when p_publish then now() else null end
  );

  return jsonb_build_object(
    'ok', true,
    'code', case when p_publish then 'published' else 'draft_saved' end,
    'revision', v_revision_number
  );
end;
$$;

revoke all on function public.persist_homepage_feature(
  uuid,
  text,
  text,
  text,
  text,
  text,
  boolean
) from public, anon, authenticated;
grant execute on function public.persist_homepage_feature(
  uuid,
  text,
  text,
  text,
  text,
  text,
  boolean
) to service_role;

comment on function public.persist_homepage_feature(
  uuid,
  text,
  text,
  text,
  text,
  text,
  boolean
) is
  'Service-role-only, admin-attributed atomic draft and publish boundary for the homepage LIFT feature.';

commit;
