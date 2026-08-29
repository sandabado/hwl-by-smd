-- Keep trigger-only functions out of the exposed RPC surface and pin the
-- search path of shared trigger helpers. Trigger execution does not require
-- direct EXECUTE permission for browser roles.

begin;

alter function public.touch_updated_at()
  set search_path = public;
alter function public.preserve_relational_keys()
  set search_path = public;
alter function public.preserve_conversation_message_history()
  set search_path = public;

revoke execute on function public.handle_new_user()
  from public, anon, authenticated;
revoke execute on function public.create_connection_preferences()
  from public, anon, authenticated;
revoke execute on function public.validate_relationship_practitioner()
  from public, anon, authenticated;
revoke execute on function public.validate_journey_creator()
  from public, anon, authenticated;
revoke execute on function public.enforce_journey_milestone_guardrails()
  from public, anon, authenticated;
revoke execute on function public.enforce_journey_override_change()
  from public, anon, authenticated;
revoke execute on function public.enforce_weekly_journey_cadence()
  from public, anon, authenticated;
revoke execute on function public.enforce_enrollment_guardrails()
  from public, anon, authenticated;
revoke execute on function public.validate_conversation_context()
  from public, anon, authenticated;
revoke execute on function public.validate_conversation_message()
  from public, anon, authenticated;
revoke execute on function public.update_conversation_from_message()
  from public, anon, authenticated;
revoke execute on function public.queue_deliveries_for_enrollment()
  from public, anon, authenticated;
revoke execute on function public.queue_deliveries_for_milestone()
  from public, anon, authenticated;
revoke execute on function public.refresh_enrollment_from_delivery()
  from public, anon, authenticated;

revoke execute on function public.is_current_user_admin()
  from public, anon;
grant execute on function public.is_current_user_admin()
  to authenticated, service_role;

commit;
