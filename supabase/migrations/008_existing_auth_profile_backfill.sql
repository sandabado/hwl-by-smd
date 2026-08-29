-- Backfill profiles for Auth identities created before migration 001 installed
-- the auth.users trigger. This keeps an existing staging Auth project aligned
-- with the application schema without changing or recreating Auth users.

begin;

insert into public.profiles (id, email, full_name)
select
  users.id,
  coalesce(users.email, ''),
  nullif(users.raw_user_meta_data ->> 'full_name', '')
from auth.users as users
left join public.profiles as profiles on profiles.id = users.id
where profiles.id is null
on conflict (id) do nothing;

insert into public.connection_preferences (user_id)
select profiles.id
from public.profiles as profiles
left join public.connection_preferences as preferences
  on preferences.user_id = profiles.id
where preferences.user_id is null
on conflict (user_id) do nothing;

commit;
