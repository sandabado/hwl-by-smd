-- Make each administrator approval reference a consumed capability for one
-- exact target. This prevents an older still-addressable deployment from
-- replaying a previously successful grant after a separately approved revoke.

begin;

set local lock_timeout = '5s';

create unique index admin_role_change_audit_target_reference_once_idx
  on public.admin_role_change_audit (target_user_id, change_reference);

comment on index public.admin_role_change_audit_target_reference_once_idx is
  'A role-change approval reference may be consumed only once per exact target UUID.';

commit;
