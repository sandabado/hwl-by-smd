import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { test } from "node:test"

function source(path: string) {
  return readFileSync(new URL(`../${path}`, import.meta.url), "utf8")
}

function compact(value: string) {
  return value.replace(/\s+/g, " ").trim()
}

const migrationSource = source("supabase/migrations/018_admin_roles.sql")
const migration = compact(migrationSource)
const handoffReferenceMigrationSource = source(
  "supabase/migrations/020_admin_handoff_reference_uniqueness.sql"
)
const handoffReferenceMigration = compact(handoffReferenceMigrationSource)
const databaseHarness = compact(source("scripts/test-admin-role-database.sql"))
const inquiryOperations = compact(source("docs/inquiry-privacy-operations.md"))
const adminAudit = compact(
  source("docs/admin-functionality-audit-2026-09-09.md")
)
const packageJson = JSON.parse(source("package.json")) as {
  scripts?: Record<string, string>
}

test("migration 018 creates two explicit admin tiers without seeding identities", () => {
  assert.match(migration, /admin_role in \('administrator', 'super_admin'\)/)
  assert.match(
    migration,
    /set admin_role = 'administrator' where is_admin is true and admin_role is null/
  )
  assert.doesNotMatch(migrationSource, /@[a-z0-9.-]+/i)
  assert.doesNotMatch(migration, /where .*?email = '.*?@/i)
})

test("the role constraint is explicitly NULL-safe and keeps is_admin compatible", () => {
  const constraint = migration.match(
    /add constraint profiles_admin_role_check check \((.*?)\);/
  )?.[1]

  assert.ok(constraint)
  assert.match(constraint, /is_admin is not null/)
  assert.match(constraint, /is_admin is false and admin_role is null/)
  assert.match(
    constraint,
    /is_admin is true and admin_role is not null and admin_role in \('administrator', 'super_admin'\)/
  )

  const synchronizationFunction = migration.match(
    /create or replace function public\.synchronize_profile_admin_role\(\)(.*?)\$function\$;/
  )?.[1]

  assert.ok(synchronizationFunction)
  assert.match(synchronizationFunction, /new\.admin_role := 'administrator'/)
  assert.match(
    synchronizationFunction,
    /new\.is_admin := new\.admin_role is not null/
  )
  assert.match(
    migration,
    /revoke update on table public\.profiles from authenticated/
  )
  assert.match(
    migration,
    /grant update \(full_name\) on table public\.profiles to authenticated/
  )
  assert.doesNotMatch(migration, /grant update \([^)]*admin_role/)
  assert.doesNotMatch(migration, /grant update \([^)]*is_admin/)
  assert.match(
    migration,
    /revoke truncate, references, trigger on table public\.profiles from service_role/
  )
})

test("insert, update, delete, and the legacy backfill create durable audit evidence", () => {
  const auditFunction = migration.match(
    /create or replace function public\.record_profile_admin_role_change\(\)(.*?)\$function\$;/
  )?.[1]

  assert.ok(auditFunction)
  for (const operation of ["INSERT", "UPDATE", "DELETE"]) {
    assert.match(auditFunction, new RegExp(`tg_op = '${operation}'`))
  }
  assert.match(auditFunction, /audit_previous_role := 'legacy_admin'/)
  assert.match(auditFunction, /audit_operation := 'backfill'/)
  assert.match(
    auditFunction,
    /current_setting\('hwl\.admin_change_reference', true\)/
  )
  assert.match(auditFunction, /length\(reference_value\) not between 8 and 120/)
  assert.match(
    auditFunction,
    /actor_user_id, actor_context, operation, change_reference/
  )
  assert.match(migration, /after insert on public\.profiles/)
  assert.match(
    migration,
    /after update of is_admin, admin_role on public\.profiles/
  )
  assert.match(migration, /after delete on public\.profiles/)
  assert.match(migration, /previous_is_admin = \(previous_role is not null\)/)
  assert.match(migration, /next_is_admin = \(next_role is not null\)/)
  assert.match(
    migration,
    /operation is not distinct from 'backfill' and previous_role is not distinct from 'legacy_admin' and next_role is not distinct from 'administrator'/
  )
  assert.match(
    migration,
    /operation is not distinct from 'insert' and previous_role is null and next_role is not null/
  )
  assert.match(
    migration,
    /operation is not distinct from 'update' and previous_role is distinct from 'legacy_admin' and previous_role is distinct from next_role/
  )
  assert.match(
    migration,
    /operation is not distinct from 'delete' and previous_role is not null .*? and next_role is null/
  )
  assert.doesNotMatch(
    migration.match(
      /add constraint profiles_admin_role_check check \((.*?)\);/
    )?.[1] ?? "",
    /legacy_admin/
  )
  assert.doesNotMatch(
    migration.match(
      /create or replace function public\.change_admin_role\((.*?)\$function\$;/
    )?.[1] ?? "",
    /legacy_admin/
  )

  const triggerPosition = migration.indexOf(
    "create trigger profiles_record_admin_role_change"
  )
  const backfillReferencePosition = migration.indexOf(
    "migration-018:legacy-admin-backfill"
  )
  const backfillPosition = migration.indexOf(
    "update public.profiles set admin_role = 'administrator'"
  )
  assert.ok(triggerPosition >= 0)
  assert.ok(backfillReferencePosition > triggerPosition)
  assert.ok(backfillPosition > backfillReferencePosition)

  assert.match(
    migration,
    /before update or delete on public\.admin_role_change_audit .*? public\.reject_admin_role_audit_mutation\(\)/
  )
  assert.match(
    migration,
    /revoke all on table public\.admin_role_change_audit from public, anon, authenticated, service_role/
  )
  assert.match(
    migration,
    /grant select on table public\.admin_role_change_audit to service_role/
  )
  assert.doesNotMatch(
    migration,
    /target_user_id uuid[^,]*references public\.profiles/
  )
  assert.doesNotMatch(
    migration,
    /grant (?:insert|update|delete|all) on table public\.admin_role_change_audit/
  )
})

test("the authenticated role-change RPC is narrow, optimistic, and actor-preserving", () => {
  const roleChangeFunction = migration.match(
    /create or replace function public\.change_admin_role\((.*?)\$function\$;/
  )?.[1]

  assert.ok(roleChangeFunction)
  assert.match(roleChangeFunction, /security definer/)
  assert.match(roleChangeFunction, /set search_path = ''/)
  assert.match(roleChangeFunction, /caller_id uuid := auth\.uid\(\)/)
  assert.match(roleChangeFunction, /profile\.admin_role = 'super_admin'/)
  assert.match(roleChangeFunction, /auth_user\.email_confirmed_at is not null/)
  assert.match(roleChangeFunction, /p_target_user_id = caller_id/)
  assert.match(
    roleChangeFunction,
    /p_target_email is distinct from normalized_target_email/
  )
  assert.match(
    roleChangeFunction,
    /coalesce\(profile\.admin_role, 'member'\) = p_expected_role/
  )
  assert.match(
    roleChangeFunction,
    /set_config\( 'hwl\.admin_change_reference', normalized_reference, true \)/
  )
  assert.match(roleChangeFunction, /for share of profile, auth_user/)
  assert.match(roleChangeFunction, /for update of profile, auth_user/)
  assert.match(
    roleChangeFunction,
    /and exists \( select 1 from auth\.users as auth_user .*? auth_user\.email_confirmed_at is not null \)/
  )
  assert.doesNotMatch(roleChangeFunction, /admin@|shannon@/i)

  assert.match(
    migration,
    /revoke all on function public\.change_admin_role\(uuid, text, text, text, text\) from public, anon, authenticated, service_role/
  )
  assert.match(
    migration,
    /grant execute on function public\.change_admin_role\(uuid, text, text, text, text\) to authenticated/
  )
  assert.doesNotMatch(
    migration,
    /grant execute on function public\.change_admin_role\([^)]*\) to (?:anon|service_role|public)/
  )
})

test("migration 020 makes each target approval reference durably one-time", () => {
  assert.match(handoffReferenceMigration, /\bbegin;/)
  assert.match(handoffReferenceMigration, /set local lock_timeout = '5s'/)
  assert.match(
    handoffReferenceMigration,
    /create unique index admin_role_change_audit_target_reference_once_idx on public\.admin_role_change_audit \(target_user_id, change_reference\)/
  )
  assert.match(handoffReferenceMigration, /commit;$/)
  assert.doesNotMatch(handoffReferenceMigrationSource, /@[a-z0-9.-]+/i)
  assert.doesNotMatch(
    handoffReferenceMigration,
    /\bgrant\s+(?:all|select|insert|update|delete|execute)\b|\bcreate\s+policy\b/i
  )
})

test("super-admin detection does not bypass migration 017 practitioner isolation", () => {
  const currentRoleFunction = migration.match(
    /create or replace function public\.current_admin_role\(\)(.*?)\$function\$;/
  )?.[1]

  assert.ok(currentRoleFunction)
  assert.match(currentRoleFunction, /join auth\.users as auth_user/)
  assert.match(currentRoleFunction, /auth_user\.email_confirmed_at is not null/)
  const legacyAdminFunction = migration.match(
    /create or replace function public\.is_current_user_admin\(\)(.*?)\$function\$;/
  )?.[1]
  assert.ok(legacyAdminFunction)
  assert.match(
    legacyAdminFunction,
    /\(select public\.current_admin_role\(\)\) is not null/
  )
  assert.match(
    migration,
    /\(select public\.current_admin_role\(\)\) = 'super_admin'/
  )
  assert.doesNotMatch(
    migration,
    /(?:drop|create) policy .*? on public\.(?:relationships|conversations|conversation_messages)/
  )

  const practitionerBoundary = compact(
    source("supabase/migrations/017_relationship_practitioner_boundaries.sql")
  )
  assert.match(
    practitionerBoundary,
    /relationship\.practitioner_id = \(select auth\.uid\(\)\)/
  )
  assert.match(
    practitionerBoundary,
    /There is deliberately no super-admin bypass/
  )
})

test("the migration 018 database harness is isolated and covers security invariants", () => {
  assert.match(databaseHarness, /^\\set ON_ERROR_STOP on/)
  assert.match(databaseHarness, /\bbegin;/)
  assert.match(databaseHarness, /rollback;$/)

  for (const expectedProof of [
    "NULL administrator state",
    "false administrator flag",
    "true administrator flag without a role",
    "legacy backfill sentinel audit evidence",
    "unconfirmed identity denied a current administrator role",
    "unconfirmed identity denied by the legacy administrator helper",
    "NULL role with true audit state",
    "INSERT audit without an active next role",
    "UPDATE audit without a state change",
    "DELETE audit without an active previous role",
    "BACKFILL audit without legacy_admin",
    "manual bootstrap audit evidence",
    "manual bootstrap exact confirmed identity update",
    "manual bootstrap exact identity lock",
    "service_role retains a profile operation that can bypass role audit controls",
    "context-free service-role promotion",
    "context-free service-role administrator insert",
    "context-free service-role administrator deletion",
    "rejected service-role write remained atomic",
    "rejected service-role insert remained atomic",
    "rejected service-role deletion remained atomic",
    "referenced service-role update audit evidence",
    "super administrator changed their own role",
    "mismatched target email",
    "stale expected role",
    "unconfirmed target",
    "human actor UUID preserved",
    "ordinary administrator changed a role",
    "super-admin practitioner isolation",
    "audit survives privileged profile insert and deletion",
    "every role audit row satisfies role-state invariants",
    "Role audit update",
    "Role audit deletion",
    "approval reference was consumed twice for one target",
  ]) {
    assert.match(databaseHarness, new RegExp(expectedProof, "i"))
  }

  assert.match(databaseHarness, /set local role authenticated/)
  assert.match(databaseHarness, /set local role service_role/)
  assert.match(databaseHarness, /request\.jwt\.claim\.sub/)
  assert.match(databaseHarness, /public\.change_admin_role/)
  assert.match(databaseHarness, /public\.relationships/)
  assert.equal(
    packageJson.scripts?.["test:admin:database"],
    "psql -X --set=ON_ERROR_STOP=on --file scripts/test-admin-role-database.sql"
  )
})

test("operator documentation keeps bootstrap manual, role-aware, and unprovisioned", () => {
  assert.match(
    inquiryOperations,
    /first super administrator cannot be created by the authenticated RPC/
  )
  assert.match(
    inquiryOperations,
    /hwl\.admin_change_reference.*?REPLACE_WITH_NONSECRET_APPROVAL_REFERENCE/
  )
  assert.match(inquiryOperations, /for update of profile, auth_user/)
  const bootstrapAudit = inquiryOperations.indexOf(
    "from public.admin_role_change_audit"
  )
  const bootstrapRollback = inquiryOperations.indexOf(
    "rollback;",
    bootstrapAudit
  )
  assert.ok(bootstrapAudit >= 0)
  assert.ok(bootstrapRollback > bootstrapAudit)
  assert.match(
    inquiryOperations,
    /Before `ROLLBACK`.*?audit query each to return exactly one row.*?After `ROLLBACK`.*?neither the role change nor its rehearsal audit row persisted/
  )
  assert.match(inquiryOperations, /signedInSupabase\.rpc\("change_admin_role"/)
  assert.match(
    inquiryOperations,
    /Email is a target cross-check only; it never grants privilege/
  )
  assert.match(
    inquiryOperations,
    /not permission to create an account, apply migration 018, or change hosted data/
  )

  assert.match(adminAudit, /Role-boundary revision.*?September 11, 2026/)
  assert.match(
    adminAudit,
    /Migration 018 has not been applied or verified in a hosted environment/
  )
  assert.match(adminAudit, /new ledger covers administrator-role changes only/)
  assert.doesNotMatch(
    adminAudit,
    /database currently has one `is_admin` boolean/
  )
})
