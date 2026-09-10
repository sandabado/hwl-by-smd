import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { test } from "node:test"

function source(path: string) {
  return readFileSync(new URL(`../${path}`, import.meta.url), "utf8")
}

function compact(value: string) {
  return value.replace(/\s+/g, " ").trim()
}

const migration = compact(
  source("supabase/migrations/017_relationship_practitioner_boundaries.sql")
)
const databaseHarness = compact(
  source("scripts/test-relationship-practitioner-boundary-database.sql")
)

test("migration 017 removes broad admin reads and installs practitioner-correlated policies", () => {
  for (const policy of [
    "relationships_admin_select",
    "conversations_admin_select",
    "conversation_messages_admin_select",
  ]) {
    assert.match(migration, new RegExp(`drop policy if exists "${policy}"`))
    assert.doesNotMatch(migration, new RegExp(`create policy "${policy}"`))
  }

  assert.match(
    migration,
    /create policy "relationships_practitioner_select" .*? practitioner_id = \(select auth\.uid\(\)\) and \(select public\.is_current_user_admin\(\)\)/
  )
  assert.match(
    migration,
    /create policy "conversations_practitioner_select" .*? relationship\.id = conversations\.relationship_id and relationship\.practitioner_id = \(select auth\.uid\(\)\)/
  )
  assert.match(
    migration,
    /create policy "conversation_messages_practitioner_select" .*? conversation\.id = conversation_messages\.conversation_id and relationship\.practitioner_id = \(select auth\.uid\(\)\)/
  )

  for (const memberPolicy of [
    "relationships_select_own",
    "conversations_select_own",
    "conversation_messages_select_own",
  ]) {
    assert.doesNotMatch(
      migration,
      new RegExp(`drop policy.*?"${memberPolicy}"`)
    )
  }

  assert.match(migration, /There is deliberately no super-admin bypass/)
})

test("migration 017 restricts mark-read to an entitled member or the exact assigned practitioner", () => {
  const markReadFunction = migration.match(
    /create or replace function public\.mark_conversation_read\( p_conversation_id uuid \)(.*?)\$function\$;/
  )?.[1]

  assert.ok(markReadFunction)
  assert.match(
    markReadFunction,
    /if caller_id = relationship_member_id then if not \(select public\.has_active_den_membership\(\)\)/
  )
  assert.match(
    markReadFunction,
    /elsif caller_id = relationship_practitioner_id then if not \(select public\.is_current_user_admin\(\)\)/
  )
  assert.doesNotMatch(
    markReadFunction,
    /or \(select public\.is_current_user_admin\(\)\)/
  )
  assert.match(markReadFunction, /set search_path = ''/)
  assert.match(
    migration,
    /grant execute on function public\.mark_conversation_read\(uuid\) to authenticated, service_role/
  )
})

test("the migration 017 database harness is isolated, transactional, and covers both boundaries", () => {
  assert.match(databaseHarness, /^\\set ON_ERROR_STOP on/)
  assert.match(databaseHarness, /\bbegin;/)
  assert.match(databaseHarness, /rollback;$/)

  for (const expectedProof of [
    "broad relationship-engine admin policy",
    "member-entitlement polic",
    "practitioner one relationship isolation",
    "practitioner two conversation isolation",
    "practitioner two message isolation",
    "closed Den relationship gate",
    "assigned practitioner read mutation",
    "Cross-practitioner mark-read",
    "Unrelated practitioner unread state changed",
  ]) {
    assert.match(databaseHarness, new RegExp(expectedProof, "i"))
  }

  assert.match(databaseHarness, /set local role authenticated/)
  assert.match(databaseHarness, /request\.jwt\.claim\.sub/)
  assert.match(databaseHarness, /public\.mark_conversation_read/)
})
