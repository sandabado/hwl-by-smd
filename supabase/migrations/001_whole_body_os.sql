-- Whole Body OS / The Den
-- Apply this migration in the Supabase SQL editor before enabling live auth.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  stripe_customer_id text unique,
  created_at timestamptz not null default now()
);

create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_type text not null check (
    product_type in ('lift_guide', 'pdf_download', 'membership')
  ),
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text unique,
  amount_paid numeric(10, 2) not null default 0,
  status text not null default 'active' check (
    status in ('active', 'refunded', 'cancelled')
  ),
  purchased_at timestamptz not null default now()
);

create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  stripe_subscription_id text not null unique,
  status text not null check (
    status in ('active', 'canceled', 'past_due', 'trialing', 'incomplete', 'unpaid')
  ),
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text not null default '',
  cover_image_url text,
  category text not null default 'Ritual' check (
    category in ('Beauty', 'Movement', 'Ritual')
  ),
  access_tier text not null default 'membership' check (
    access_tier in ('lift', 'membership')
  ),
  published boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  slug text not null,
  description text not null default '',
  video_playback_id text,
  pdf_storage_path text,
  duration_seconds integer not null default 0 check (duration_seconds >= 0),
  order_index integer not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  unique(course_id, slug),
  unique(course_id, order_index)
);

create table if not exists public.user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  completed boolean not null default false,
  watched_until_second integer not null default 0 check (
    watched_until_second >= 0
  ),
  updated_at timestamptz not null default now(),
  unique(user_id, lesson_id)
);

create table if not exists public.stripe_events (
  id text primary key,
  event_type text not null,
  processed_at timestamptz not null default now()
);

create index if not exists purchases_user_id_idx
  on public.purchases(user_id);
create index if not exists memberships_user_id_idx
  on public.memberships(user_id);
create index if not exists lessons_course_id_idx
  on public.lessons(course_id, order_index);
create index if not exists user_progress_user_id_idx
  on public.user_progress(user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    coalesce(new.email, ''),
    nullif(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists memberships_touch_updated_at on public.memberships;
create trigger memberships_touch_updated_at
  before update on public.memberships
  for each row execute procedure public.touch_updated_at();

drop trigger if exists progress_touch_updated_at on public.user_progress;
create trigger progress_touch_updated_at
  before update on public.user_progress
  for each row execute procedure public.touch_updated_at();

alter table public.profiles enable row level security;
alter table public.purchases enable row level security;
alter table public.memberships enable row level security;
alter table public.courses enable row level security;
alter table public.lessons enable row level security;
alter table public.user_progress enable row level security;
alter table public.stripe_events enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists "purchases_select_own" on public.purchases;
create policy "purchases_select_own"
  on public.purchases for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "memberships_select_own" on public.memberships;
create policy "memberships_select_own"
  on public.memberships for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "progress_select_own" on public.user_progress;
create policy "progress_select_own"
  on public.user_progress for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "progress_insert_own" on public.user_progress;
create policy "progress_insert_own"
  on public.user_progress for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "progress_update_own" on public.user_progress;
create policy "progress_update_own"
  on public.user_progress for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Paid entitlements, courses, lessons, and Stripe event records are written
-- only by trusted server code using the service role. There are intentionally
-- no client-write policies for purchases or memberships.

insert into storage.buckets (id, name, public)
values ('member-content', 'member-content', false)
on conflict (id) do update set public = false;

insert into public.courses (
  id,
  title,
  slug,
  description,
  category,
  access_tier,
  published
)
values (
  '5aa34592-e286-41a2-a94d-7f2479f7e0a1',
  'LIFT — A Daily Facial Ritual',
  'lift-daily-facial-ritual',
  'Seven intentional movements for circulation, release, sculpting, and glow.',
  'Beauty',
  'lift',
  true
)
on conflict (slug) do nothing;

insert into public.lessons (
  id,
  course_id,
  title,
  slug,
  description,
  duration_seconds,
  order_index,
  published
)
values
  (
    '7d479f66-2894-4552-b8e1-1f6ce7228011',
    '5aa34592-e286-41a2-a94d-7f2479f7e0a1',
    'Prep the Skin',
    'prep-the-skin',
    'Create slip, settle your breath, and begin with intention.',
    90,
    1,
    true
  ),
  (
    '7d479f66-2894-4552-b8e1-1f6ce7228012',
    '5aa34592-e286-41a2-a94d-7f2479f7e0a1',
    'Jawline Lift',
    'jawline-lift',
    'Release the jaw and invite gentle upward movement.',
    120,
    2,
    true
  ),
  (
    '7d479f66-2894-4552-b8e1-1f6ce7228013',
    '5aa34592-e286-41a2-a94d-7f2479f7e0a1',
    'Mid-Face Sculpt',
    'mid-face-sculpt',
    'Support circulation and contour through the center of the face.',
    120,
    3,
    true
  ),
  (
    '7d479f66-2894-4552-b8e1-1f6ce7228014',
    '5aa34592-e286-41a2-a94d-7f2479f7e0a1',
    'Brow Lift',
    'brow-lift',
    'Create openness around the eyes and brow.',
    90,
    4,
    true
  ),
  (
    '7d479f66-2894-4552-b8e1-1f6ce7228015',
    '5aa34592-e286-41a2-a94d-7f2479f7e0a1',
    'Forehead Release',
    'forehead-release',
    'Soften held expression and invite ease.',
    90,
    5,
    true
  ),
  (
    '7d479f66-2894-4552-b8e1-1f6ce7228016',
    '5aa34592-e286-41a2-a94d-7f2479f7e0a1',
    'Lymphatic Sweep',
    'lymphatic-sweep',
    'Use feather-light pressure to support flow and de-puffing.',
    120,
    6,
    true
  ),
  (
    '7d479f66-2894-4552-b8e1-1f6ce7228017',
    '5aa34592-e286-41a2-a94d-7f2479f7e0a1',
    'Neck Drainage',
    'neck-drainage',
    'Complete the lymphatic pathway with gentle downward strokes toward the collarbones.',
    120,
    7,
    true
  )
on conflict (course_id, slug) do nothing;
