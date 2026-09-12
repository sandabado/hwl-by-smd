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
const compatibilityMigration = compact(
  source("supabase/migrations/019_calcom_native_payload_compatibility.sql")
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

test("migration 019 accepts only documented native Cal omissions", () => {
  assert.match(
    compatibilityMigration,
    /create or replace function public\.ingest_calcom_booking_event/
  )
  assert.match(
    compatibilityMigration,
    /drop function if exists public\.ingest_calcom_booking_event/
  )
  assert.match(
    compatibilityMigration,
    /p_cal_ical_sequence is null and p_trigger_event <> 'BOOKING_REJECTED'/
  )
  assert.doesNotMatch(
    compatibilityMigration,
    /p_cal_ical_sequence is null[^;]+BOOKING_RESCHEDULED/
  )
  assert.match(
    compatibilityMigration,
    /sequence_is_inferred := p_cal_ical_sequence is null/
  )
  assert.match(
    compatibilityMigration,
    /effective_ical_sequence := greatest\( current_booking\.details_ical_sequence, current_booking\.booking_state_ical_sequence \)/
  )
  assert.match(
    compatibilityMigration,
    /\(p_event_created_at, booking_rank\) > \( current_booking\.booking_state_event_at, current_booking\.booking_state_rank \)/
  )
  assert.match(
    compatibilityMigration,
    /p_provider_price_was_null boolean default false/
  )
  assert.match(compatibilityMigration, /unverified_null_price_cancellation/)
  assert.match(
    compatibilityMigration,
    /prior_events\.trigger_event <> 'BOOKING_CANCELLED' and prior_events\.processing_outcome <> 'manual_review'/
  )
  assert.match(
    compatibilityMigration,
    /ical_uid_backfill_wins := current_booking\.cal_ical_uid is null and p_cal_ical_uid is not null/
  )
  assert.match(
    compatibilityMigration,
    /current_booking\.cal_ical_uid is not null and p_cal_ical_uid is not null and current_booking\.cal_ical_uid <> p_cal_ical_uid/
  )
  assert.doesNotMatch(
    compatibilityMigration,
    /p_previous_cal_booking_uid = p_cal_booking_uid or p_cal_ical_uid is null/
  )
  assert.match(
    compatibilityMigration,
    /grant execute on function public\.ingest_calcom_booking_event\(.*?\) to service_role/
  )
  assert.doesNotMatch(compatibilityMigration, /create table public\./)
  assert.doesNotMatch(
    compatibilityMigration,
    /add column [^;]*(?:price|payment_intent|stripe_payment)/i
  )
})

test("the booking-ledger database harness is transactional and covers lifecycle boundaries", () => {
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
    "native payload omissions",
    "null cancellation",
    "inverse delivery",
  ]) {
    assert.match(databaseHarness, new RegExp(expectedProof, "i"))
  }

  assert.match(databaseHarness, /public\.ingest_calcom_booking_event/)
  assert.match(databaseHarness, /public\.claim_calcom_bookings_for_member/)
  assert.match(databaseHarness, /from public\.calcom_webhook_events/)
  assert.match(databaseHarness, /from public\.calcom_booking_aliases/)
  assert.match(databaseHarness, /insert into auth\.users/)
})
