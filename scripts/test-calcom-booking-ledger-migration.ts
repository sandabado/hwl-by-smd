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
  source("supabase/migrations/016_calcom_booking_ledger.sql")
)
const databaseHarness = compact(
  source("scripts/test-calcom-booking-ledger-database.sql")
)

test("migration 016 keeps the booking ledger private and narrowly writable", () => {
  for (const table of [
    "booking_records",
    "calcom_booking_aliases",
    "calcom_webhook_events",
  ]) {
    assert.match(migration, new RegExp(`create table public\\.${table}`))
    assert.match(
      migration,
      new RegExp(`alter table public\\.${table} enable row level security`)
    )
    assert.match(
      migration,
      new RegExp(
        `revoke all on table public\\.${table} from public, anon, authenticated, service_role`
      )
    )
  }

  assert.match(
    migration,
    /grant select on table public\.booking_records to service_role/
  )
  assert.match(
    migration,
    /grant select on table public\.calcom_booking_aliases to service_role/
  )
  assert.match(
    migration,
    /grant select on table public\.calcom_webhook_events to service_role/
  )
  assert.match(
    migration,
    /grant execute on function public\.claim_calcom_bookings_for_member\(uuid, text, text\) to service_role/
  )
  assert.match(
    migration,
    /grant execute on function public\.ingest_calcom_booking_event\(.*?\) to service_role/
  )
  assert.match(migration, /calcom_booking_aliases_immutable/)
  assert.match(migration, /calcom_webhook_events_immutable/)
})

test("migration 016 retains only the approved scheduling projection", () => {
  const bookingTable = migration.match(
    /create table public\.booking_records \((.*?)\); create unique index/
  )?.[1]

  assert.ok(bookingTable)
  for (const forbiddenField of [
    "address",
    "guest_email",
    "intake",
    "meeting_url",
    "notes",
    "payment",
    "phone",
  ]) {
    assert.equal(bookingTable.includes(forbiddenField), false)
  }

  assert.match(migration, /p_calcom_username <> 'hwlbysmd'/)
  assert.match(migration, /p_currency is distinct from 'usd'/)
  assert.match(migration, /users\.email_confirmed_at is not null/)
  assert.match(migration, /payload_digest ~ '\^\[a-f0-9\]\{64\}\$'/)
  assert.match(
    migration,
    /processing_outcome in \('applied', 'ignored_stale', 'manual_review'\)/
  )
})

test("the migration 016 database harness is transactional and covers lifecycle boundaries", () => {
  assert.match(databaseHarness, /^\\set ON_ERROR_STOP on/)
  assert.match(databaseHarness, /\bbegin;/)
  assert.match(databaseHarness, /rollback;$/)

  for (const expectedProof of [
    "runtime roles cannot mutate the booking ledger",
    "exact replay",
    "out-of-order",
    "reschedule aliases",
    "manual review",
    "confirmed member claim",
    "append-only evidence",
    "deployment namespace",
  ]) {
    assert.match(databaseHarness, new RegExp(expectedProof, "i"))
  }

  assert.match(databaseHarness, /public\.ingest_calcom_booking_event/)
  assert.match(databaseHarness, /public\.claim_calcom_bookings_for_member/)
  assert.match(databaseHarness, /from public\.calcom_webhook_events/)
  assert.match(databaseHarness, /from public\.calcom_booking_aliases/)
  assert.match(databaseHarness, /insert into auth\.users/)
})
