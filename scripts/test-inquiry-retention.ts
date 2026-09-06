import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { test } from "node:test"

function readProjectFile(path: string) {
  return readFileSync(new URL(`../${path}`, import.meta.url), "utf8")
}

function compact(value: string) {
  return value.replace(/\s+/g, " ").trim()
}

const migration = compact(
  readProjectFile("supabase/migrations/015_inquiry_retention.sql")
)

test("migration 015 encodes the approved inquiry retention policy", () => {
  assert.match(migration, /created_at <= p_as_of - interval '12 months'/)
  assert.match(
    migration,
    /retention_hold_reason in \( 'active_service', 'legal', 'safety', 'dispute' \)/
  )
  assert.match(
    migration,
    /last_seen_at < purge_started_at - interval '30 days'/
  )
  assert.match(
    migration,
    /rate_limit_cutoff_at = executed_at - interval '30 days'/
  )
  assert.match(migration, /submission_count between 1 and 5/)
  assert.match(
    migration,
    /create trigger inquiry_submission_limits_approved_maximum before insert or update/
  )
  assert.match(migration, /if new\.submission_count > 5 then return null;/)
  assert.match(
    migration,
    /p_operator_email is distinct from 'admin@ghosthand\.studio'/
  )
  assert.match(migration, /actual_ids is distinct from expected_ids/)
  const limitLock = migration.indexOf(
    "lock table public.inquiry_submission_limits in share row exclusive mode"
  )
  const inquiryLock = migration.indexOf(
    "lock table public.inquiries in share row exclusive mode"
  )
  assert.notEqual(limitLock, -1)
  assert.notEqual(inquiryLock, -1)
  assert.ok(limitLock < inquiryLock)
  assert.match(
    migration,
    /purge_inquiry_retention_candidates\(.*?set lock_timeout = '5s' as \$function\$/
  )
})

test("retention operations remain owner-only and aggregate", () => {
  for (const signature of [
    "public.enforce_inquiry_submission_approved_maximum()",
    "public.get_inquiry_retention_candidates(timestamptz)",
    "public.set_inquiry_retention_hold(uuid, text)",
  ]) {
    assert.ok(
      migration.includes(
        `revoke execute on function ${signature} from public, anon, authenticated, service_role;`
      )
    )
  }

  assert.match(
    migration,
    /revoke execute on function public\.purge_inquiry_retention_candidates\( timestamptz, uuid\[\], text \) from public, anon, authenticated, service_role;/
  )
  assert.doesNotMatch(
    migration,
    /grant (?:all|delete|execute|insert|update).*service_role/
  )
  assert.match(migration, /create table public\.inquiry_retention_runs/)
  assert.match(
    migration,
    /before update or delete on public\.inquiry_retention_runs/
  )

  const runTableDefinition = migration.match(
    /create table public\.inquiry_retention_runs \((.*?)\);/
  )?.[1]
  assert.ok(runTableDefinition)
  for (const forbiddenContentColumn of [
    "email_address",
    "inquiry_id",
    "message",
    "name",
    "phone",
    "provider_id",
  ]) {
    assert.equal(runTableDefinition.includes(forbiddenContentColumn), false)
  }
})

test("published and operator-facing policy text matches the approved bundle", () => {
  const privacy = compact(readProjectFile("app/privacy/page.tsx"))
  const operations = compact(
    readProjectFile("docs/inquiry-privacy-operations.md")
  )
  const newsletter = compact(
    readProjectFile("components/shared/newsletter-form.tsx")
  )
  const contactRoute = compact(readProjectFile("app/api/contact/route.ts"))
  const environmentTemplate = readProjectFile(".env.example")

  for (const text of [privacy, operations]) {
    assert.match(text, /12 months/)
    assert.match(text, /30 days/)
    assert.match(text, /active service/i)
    assert.match(text, /legal/i)
    assert.match(text, /safety/i)
    assert.match(text, /dispute/i)
  }
  assert.match(operations, /admin@ghosthand\.studio/)
  assert.match(operations, /monthly/i)
  assert.match(operations, /five .*hour/i)
  assert.match(
    operations,
    /authenticated, access-controlled, append-only owner-controlled privacy log/i
  )
  assert.match(newsletter, /Request journal updates/)
  assert.match(newsletter, /personal HWL by SMD journal updates/)
  assert.match(newsletter, /source: "journal-newsletter"/)
  assert.match(newsletter, /submitInquiry/)
  assert.doesNotMatch(newsletter, /Join the list/)
  assert.doesNotMatch(newsletter, /subscribe|mailing list/i)
  assert.doesNotMatch(newsletter, /\bthe list\b/i)
  assert.doesNotMatch(
    newsletter,
    /mailchimp|convertkit|audience[_-]?id|list[_-]?id|fetch\(/
  )
  assert.match(contactRoute, /"journal-newsletter"/)
  assert.match(contactRoute, /inquiryAdmin\.rpc\( "record_inquiry_submission"/)
  assert.match(contactRoute, /https:\/\/api\.resend\.com\/emails/)
  assert.match(contactRoute, /subject: "HWL by SMD · New private inquiry"/)
  assert.match(contactRoute, /to: \[to\]/)
  assert.doesNotMatch(
    contactRoute,
    /api\.resend\.com\/(?:audiences|broadcasts|contacts)|mailchimp|convertkit/i
  )
  assert.match(
    environmentTemplate,
    /^NEXT_PUBLIC_INQUIRY_COLLECTION_READY=false$/m
  )
  assert.match(environmentTemplate, /^INQUIRY_RATE_LIMIT_MAX=5$/m)
})

test("rollback database proof covers destructive and authority boundaries", () => {
  const databaseTest = compact(
    readProjectFile("scripts/test-inquiry-retention-database.sql")
  )

  assert.match(databaseTest, /foreach runtime_role in array/)
  for (const runtimeRole of ["anon", "authenticated", "service_role"]) {
    assert.match(databaseTest, new RegExp(`'${runtimeRole}'`))
  }
  assert.match(databaseTest, /for attempt in 1\.\.6 loop/)
  assert.match(databaseTest, /p_limit => 20/)
  assert.match(databaseTest, /submission_count.*is distinct from 5/)
  for (const holdReason of ["active_service", "legal", "safety", "dispute"]) {
    assert.match(databaseTest, new RegExp(`'${holdReason}'`))
  }
  for (const rejectedScope of [
    "partial reviewed candidate set",
    "held inquiry",
    "fresh inquiry",
    "nonexistent extra reviewed ID",
    "Duplicate reviewed candidate IDs",
    "null purge ID set",
    "non-designated purge operator",
  ]) {
    assert.match(databaseTest, new RegExp(rejectedScope, "i"))
  }
  assert.match(
    databaseTest,
    /A rejected retention operation left partial mutations/
  )
  assert.match(databaseTest, /Retention-run evidence could be deleted/)
  assert.match(databaseTest, /zero-candidate purge/i)
  assert.match(databaseTest, /rate_limit_cutoff_at > reviewed_at/)
  assert.match(databaseTest, /rollback;$/)
})
