-- Whole Body OS administrator access
--
-- Promote an administrator only from the Supabase SQL editor or trusted
-- service-role code:
--   update public.profiles set is_admin = true where email = 'owner@example.com';
--
-- There is intentionally no authenticated-client policy that can change this
-- field.

alter table public.profiles
  add column if not exists is_admin boolean not null default false;

comment on column public.profiles.is_admin is
  'Service-managed Whole Body OS administrator flag.';

-- The original profile policy allows a user to update their own row. Restrict
-- the authenticated role to the non-privileged display-name field so a member
-- cannot promote themselves or change server-managed commerce identifiers.
revoke update on table public.profiles from authenticated;
grant update (full_name) on table public.profiles to authenticated;

create or replace function public.is_current_user_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select profiles.is_admin
      from public.profiles
      where profiles.id = (select auth.uid())
    ),
    false
  );
$$;

revoke all on function public.is_current_user_admin() from public;
grant execute on function public.is_current_user_admin() to authenticated;

drop policy if exists "profiles_admin_select_all" on public.profiles;
create policy "profiles_admin_select_all"
  on public.profiles for select
  to authenticated
  using ((select public.is_current_user_admin()));

drop policy if exists "purchases_admin_select_all" on public.purchases;
create policy "purchases_admin_select_all"
  on public.purchases for select
  to authenticated
  using ((select public.is_current_user_admin()));

drop policy if exists "memberships_admin_select_all" on public.memberships;
create policy "memberships_admin_select_all"
  on public.memberships for select
  to authenticated
  using ((select public.is_current_user_admin()));

drop policy if exists "courses_admin_select_all" on public.courses;
create policy "courses_admin_select_all"
  on public.courses for select
  to authenticated
  using ((select public.is_current_user_admin()));

drop policy if exists "lessons_admin_select_all" on public.lessons;
create policy "lessons_admin_select_all"
  on public.lessons for select
  to authenticated
  using ((select public.is_current_user_admin()));

drop policy if exists "progress_admin_select_all" on public.user_progress;
create policy "progress_admin_select_all"
  on public.user_progress for select
  to authenticated
  using ((select public.is_current_user_admin()));
