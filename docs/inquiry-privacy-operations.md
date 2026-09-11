# Inquiry privacy operations

Status: owner-approved policy and owner-operated launch runbook. The exact
reviewed migration 015 is applied and verified in Production as recorded in
the deployment gate below. This document does not authorize any additional
hosted migration, provider change, deployment, retention run, or deletion.

## Data boundary

- A successful website receipt means the inquiry exists in the private
  `public.inquiries` table. Database persistence is the delivery boundary.
- Browser roles have no table access. The application service role has direct
  `SELECT` access only. Public-form inserts and notification-state changes pass
  through narrow, service-role-only database functions; the service role cannot
  insert, update, or delete inquiry rows directly.
- Resend is only an optional alert. Its message contains the inquiry ID, source,
  and protected admin-inbox link. It intentionally omits the visitor's name,
  email, phone, booking details, and message.
- `accepted` means Resend returned a provider receipt. It does not mean mailbox
  delivery. `attempting`, `failed`, `not_configured`, `unattempted`, and
  `audit_unknown` must be reviewed in the private inbox.

## Access, correction, export, and deletion requests

1. Do not confirm that a record exists until identity is verified. A request
   sent from a different address must be verified through the address stored on
   the inquiry before any data is disclosed or changed.
2. Record the request date and request type in the owner-controlled privacy log.
   Do not copy the inquiry message into that log.
3. In the Supabase dashboard, use an owner/postgres session—not the website
   service credential—to locate the exact row by inquiry ID or verified email.
4. For access or export, disclose only the matched visitor's inquiry fields.
   Review the export before sending it through an owner-approved secure channel.
5. For correction, update only the requested fields and retain the original
   privacy-request evidence outside the public website runtime.
6. For deletion, first check whether a separate financial, booking, safety, or
   legal record must be retained. Inquiry rows have no commerce foreign keys.
   When deletion is allowed, delete the exact inquiry ID from an owner/postgres
   session and verify that zero rows remain for that ID.
7. Record completion date and outcome in the privacy log without retaining the
   deleted inquiry content.

The service-role credential intentionally has no `delete` grant. This keeps a
compromised public route from becoming a bulk-erasure path.

## Routine review

- Review the private inquiry inbox at least once each business day while the
  site is accepting requests.
- Review non-`accepted` notification states directly; there is no background
  retry worker and the interface must never promise one.
- An `attempting` alert older than five minutes is atomically reclassified as
  `audit_unknown/claim_outcome_unknown` when that submission is checked again.
  This reconciliation never returns it to `unattempted` and never sends another
  provider request.
- HMAC-pseudonymized rate-limit rows older than 30 days are pruned during a
  later valid submission and by the monthly retention run after migration 015.
  They contain no raw network address.
- Do not forward inquiry content into ordinary email or copy it into unrelated
  project tools.

## Current rate-limit contract

- The approved launch limit is five accepted submissions per
  HMAC-pseudonymized client address in a one-hour window.
  `INQUIRY_RATE_LIMIT_MAX` must be exactly `5` in a launch environment. The
  legacy RPC keeps its 1-through-20 input validation for compatibility, while
  migration 015 caps the database write and graceful rate-limited outcome at
  five. Neither boundary permits a launch-time override without review.
- Deployed Vercel traffic trusts only `x-vercel-forwarded-for`; generic
  forwarding headers are never accepted as the deployed caller identity.
- A limited request receives HTTP `429` with `Retry-After: 3600`. The database
  claim and inquiry insert are one transaction, so a rejected or failed insert
  does not consume an unrecorded slot.
- The database stores only a keyed SHA-256 HMAC fingerprint. It never stores or
  logs the raw client address or the HMAC secret.
- `INQUIRY_RATE_LIMIT_SECRET` and `CRON_SECRET` are separate authorities. The
  launch validator rejects a shared value so compromise or rotation of one
  boundary does not silently become authority for the other.
- Fingerprint rows older than 30 days are deleted during a later valid
  submission and by every monthly retention run. This fixed technical-record
  policy is separate from the 12-month inquiry-content policy.
- Rotating `INQUIRY_RATE_LIMIT_SECRET` changes both future fingerprints and
  payload digests. Treat rotation as an incident or controlled maintenance
  action: record the time, environment, and reason, and expect existing client
  rate buckets to stop matching their replacement fingerprints. Submission-ID
  retries still compare the canonical stored inquiry fields rather than relying
  on the old digest.

## Resend failure and notification handling

Resend is not the inquiry ledger and there is intentionally no automatic email
retry worker. Review each state as follows:

| Notification state | What it proves                                                         | Owner action                                                                                                                                                         |
| ------------------ | ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `accepted`         | Resend returned a provider receipt; mailbox delivery is still unproven | Review the private inbox and normal mailbox-delivery signals                                                                                                         |
| `unattempted`      | The inquiry was stored but no provider claim completed                 | Review directly; do not manually resend from the website route                                                                                                       |
| `attempting`       | One request owns the provider claim                                    | Review directly. Only a genuine client retry carrying the original submission UUID may reconcile a stale claim; do not invent a new receipt or create a second alert |
| `not_configured`   | Required Resend/sender configuration was missing                       | Review directly and repair configuration for future inquiries; this row will not send later automatically                                                            |
| `failed`           | Resend returned a non-success response                                 | Review directly and repair the provider/sender issue; do not assume a later retry exists                                                                             |
| `audit_unknown`    | The claim, network, or provider-receipt outcome could not be proven    | Check Resend and the mailbox by inquiry ID; never send again automatically because the first request may have succeeded                                              |

The deterministic `Idempotency-Key` is derived from the submission UUID, but
the database claim remains the durable one-attempt authority. Do not bypass the
claim or manufacture a new submission UUID merely to trigger another alert.

## Admin inbox handling

1. Open `/admin/inquiries` only through a verified Supabase administrator
   session. The local demo administrator is intentionally denied live inquiry
   content.
2. Review the inbox at least once each business day and reply from the visitor's
   stored address. An email-alert warning does not mean the inquiry was lost.
3. The current UI is read-only and paginates all records at 50 rows per page.
   Resend alerts link to the exact inquiry UUID without putting contact details
   in the URL. The interface does not currently provide an audited transition
   for `received`, `in_review`, `responded`, `closed`, or `spam`. Do not imply
   that the displayed status was advanced merely because a reply was sent.
4. Use the aggregate owner/postgres report below during routine review to
   reconcile backlog totals without copying inquiry content. The website
   service credential must not be broadened to mutate PII.
5. A `journal-newsletter` row is evidence that a visitor requested journal
   messages; it is not a mailing-list engine, delivery record, or unsubscribe
   system. Do not claim the visitor is subscribed until an owner-approved
   consent and unsubscribe workflow exists.

The following owner-only report contains no inquiry message or contact details:

```sql
select
  status,
  notification_status,
  count(*) as inquiry_count,
  min(created_at) as oldest_created_at,
  max(created_at) as newest_created_at
from public.inquiries
group by status, notification_status
order by status, notification_status;
```

### Verified administrator bootstrap gate

The August 29, 2026 hosted count-only preflight found zero profiles with
`is_admin = true`, and the exact configured Shannon contact address matched zero
profile rows. At that checkpoint, `/admin/inquiries` had no verified human
operator.
Do not infer that the notification recipient, a local demo administrator, or any
existing Auth identity is the intended production administrator.

The owner-approved intended Production identities are `shannon@hwlbysmd.com`
as the permanent `administrator` and `admin@ghosthand.studio` as the
operational `super_admin` and retention operator. Migration 018 represents
those two tiers in `profiles.admin_role` while preserving `profiles.is_admin`
for compatibility. It provisions no identity and, at the time of this local
review, is not proof that either role exists in a hosted environment.

Bootstrap is deliberately asymmetric. The first super administrator cannot be
created by the authenticated RPC because no authorized caller exists yet. It
requires one owner/postgres transaction after exact identity verification and
fresh human approval. Every later change uses `change_admin_role(...)`, which
retains the signed-in human actor UUID in the append-only audit. Apply this
sequence:

1. The owner creates or signs into that exact account through the ordinary
   `/login?redirectTo=/admin/inquiries` Supabase flow and completes email
   confirmation. Do not create a hidden password, share a temporary password in
   chat, or reuse another person's account.
2. In an owner/postgres Supabase session, query `auth.users` by that exact
   owner-approved email only. Require exactly one row, a non-null
   `email_confirmed_at`, and record its UUID without inspecting unrelated users.
3. Query `public.profiles` by both that UUID and exact email. Require exactly one
   matching profile. Stop if the Auth and profile identities differ or either is
   absent; do not repair by promoting a near match.
4. Record a bounded, non-secret approval or change-ticket reference. It must be
   8–120 characters, start with a letter or number, and contain only letters,
   numbers, `.`, `_`, `:`, `/`, `#`, or `-`. Never put a credential, token,
   customer detail, or free-form personal data in this field.
5. Rehearse the first `super_admin` bootstrap in an owner/postgres SQL session.
   Replace every placeholder, including the exact current role (`member` or
   `administrator`) observed during verification. The UUID, normalized email,
   confirmation, and expected-role predicates must all match one row:

   ```sql
   begin;

   select pg_catalog.set_config(
     'hwl.admin_change_reference',
     'REPLACE_WITH_NONSECRET_APPROVAL_REFERENCE',
     true
   );

   select profile.id, profile.email, profile.admin_role, profile.is_admin
   from public.profiles as profile
   join auth.users as auth_user on auth_user.id = profile.id
   where profile.id = 'REPLACE_WITH_VERIFIED_AUTH_USER_UUID'::uuid
     and profile.email = 'REPLACE_WITH_NORMALIZED_APPROVED_EMAIL'
     and lower(auth_user.email) = profile.email
     and auth_user.email_confirmed_at is not null
     and coalesce(profile.admin_role, 'member') =
       'REPLACE_WITH_EXACT_CURRENT_ROLE'
   for update of profile, auth_user;

   update public.profiles as profile
   set admin_role = 'super_admin'
   from auth.users as auth_user
   where profile.id = 'REPLACE_WITH_VERIFIED_AUTH_USER_UUID'::uuid
     and auth_user.id = profile.id
     and profile.email = lower('REPLACE_WITH_NORMALIZED_APPROVED_EMAIL')
     and lower(auth_user.email) = profile.email
     and auth_user.email_confirmed_at is not null
     and coalesce(profile.admin_role, 'member') =
       'REPLACE_WITH_EXACT_CURRENT_ROLE'
   returning profile.id, profile.email, profile.admin_role, profile.is_admin;

   rollback;
   ```

6. Require both the locked identity query and rehearsal update to return exactly
   one row with
   `admin_role='super_admin'` and `is_admin=true`. Verify a corresponding
   `admin_role_change_audit` row carries the same target UUID and approval
   reference. Repeat with `COMMIT` only after the owner reviews the evidence and
   explicitly authorizes this bootstrap. If any predicate returns zero rows or
   the evidence is ambiguous, stop.
7. The current candidate intentionally has no generic role editor. Through a
   separately reviewed invocation using that confirmed super administrator's
   Supabase session—not an owner SQL editor or service-role request—call the
   narrow RPC for the separately confirmed Shannon identity. Use the exact
   current role verified at that moment:

   ```ts
   const result = await signedInSupabase.rpc("change_admin_role", {
     p_target_user_id: "REPLACE_WITH_SHANNON_AUTH_UUID",
     p_target_email: "shannon@hwlbysmd.com",
     p_expected_role: "member", // or administrator, only when verified
     p_new_role: "administrator",
     p_approval_reference: "REPLACE_WITH_NONSECRET_APPROVAL_REFERENCE",
   })
   ```

   The RPC rejects unconfirmed identities, UUID/email mismatches, stale expected
   roles, ordinary administrators, and self-change. Email is a target
   cross-check only; it never grants privilege.

8. Verify `/admin/inquiries` through each real Supabase session rather than the
   local demo path. Confirm the permanent administrator can read the intended
   private inbox after migration 013, while a logged-out browser is denied.
9. Record the approver, operator, UTC time, Auth UUID, role, approval reference,
   and verification result in the private operations log. Do not record a
   password, token, session cookie, service-role credential, or unrelated
   profile data.
10. Later role changes and revocations use the same authenticated RPC with exact
    UUID, normalized email, expected role, and a fresh approval reference. The
    RPC never permits self-demotion. An exceptional last-super-admin recovery
    therefore requires the same separately approved owner/postgres procedure as
    bootstrap, followed by audit verification and session-access checks.

This bootstrap is authorization guidance, not permission to create an account,
apply migration 018, or change hosted data. Direct service-role role changes
also require an explicit same-transaction change reference and are not a
self-promotion path. The website must not expose a generic role editor.

## Approved retention policy

The owner approved this policy on September 5, 2026:

1. All website inquiry sources—booking request, contact page, journal request,
   retreat partnership inquiry, and generic website inquiry—use one retention
   period: 12 months from the row's `created_at` submission time.
2. At an explicit UTC review time, a row is eligible when
   `created_at <= review_time - interval '12 months'`.
3. A hold may suspend routine deletion only for active service
   (`active_service`), legal, safety, or dispute needs. Free-form hold reasons
   are prohibited.
4. `admin@ghosthand.studio` is the named monthly review and purge operator. The
   operator uses an owner/postgres database session; neither the public site nor
   its service-role credential receives hold or delete authority.
5. HMAC-pseudonymized rate-limit rows use a separate 30-day clock and are
   pruned by the monthly run as well as migration 013's opportunistic cleanup.
6. The launch submission limit remains five accepted requests per client
   identity per one-hour window.
7. A journal submission is a consent inquiry for personal review. It is not a
   mailing-list subscription, delivery record, or authority to send bulk mail.

Migration 015 encodes the 12-month clock, constrained hold reasons, owner-only
candidate/hold/purge functions, deterministic 30-day fingerprint cleanup, and
an append-only aggregate run ledger. It intentionally creates no browser,
service-role, application API, or scheduled deletion path.

### Hold placement and release

Before setting a hold, record the inquiry ID, approved reason, decision time,
and decision owner in the authenticated, access-controlled, append-only
owner-controlled privacy log. Do not copy the inquiry message or contact
details into that log. In an owner/postgres SQL session, set one hold with:

```sql
select *
from public.set_inquiry_retention_hold(
  'REPLACE_WITH_EXACT_INQUIRY_UUID'::uuid,
  'REPLACE_WITH_active_service_OR_legal_OR_safety_OR_dispute'
);
```

Review every active hold during the monthly run. When its approved reason no
longer applies, record the release decision in the privacy log and clear it:

```sql
select *
from public.set_inquiry_retention_hold(
  'REPLACE_WITH_EXACT_INQUIRY_UUID'::uuid,
  null::text
);
```

The table stores only the current hold and set time; the authenticated
owner-controlled log is the audit history for placement and release. The purge
function's `p_operator_email` is a required operator assertion, not proof of a
human identity; retain authenticated database-session evidence for hold and
purge actions in that log. Do not use a hold as an indefinite archive category.

### Monthly candidate review

Use one explicit UTC `review_time` for the report, rehearsal, and committed
run. The placeholder below is deliberately invalid. Run this only through an
owner/postgres session after migration 015 is ledger-applied:

```sql
begin transaction read only;

select *
from public.get_inquiry_retention_candidates(
  timestamptz 'REPLACE_WITH_REVIEW_TIME_UTC'
);

select retention_hold_reason, count(*) as held_count
from public.inquiries
where created_at
  <= timestamptz 'REPLACE_WITH_REVIEW_TIME_UTC' - interval '12 months'
  and retention_hold_reason is not null
group by retention_hold_reason
order by retention_hold_reason;

select count(*) as expired_fingerprint_count
from public.inquiry_submission_limits
where last_seen_at
  < statement_timestamp() - interval '30 days';

rollback;
```

Review the complete candidate list and every hold without exporting submitted
content. Copy the complete, exact candidate UUID set into the purge call. The
database rejects null, duplicate, missing, extra, newly held, or otherwise
changed IDs; it never silently performs a partial purge.

### Required rollback rehearsal and committed run

First rehearse the exact reviewed set. An empty reviewed set is represented by
`array[]::uuid[]` and still records the 30-day fingerprint cleanup during the
eventual committed run.

```sql
begin;
set local lock_timeout = '5s';

select *
from public.purge_inquiry_retention_candidates(
  timestamptz 'REPLACE_WITH_SAME_REVIEW_TIME_UTC',
  array[
    'REPLACE_WITH_REVIEWED_INQUIRY_UUID'::uuid
  ],
  'admin@ghosthand.studio'
);

select operator_email, reviewed_at, cutoff_at, rate_limit_cutoff_at,
  candidate_count, held_count, deleted_count, rate_limit_deleted_count,
  executed_at
from public.inquiry_retention_runs
where reviewed_at = timestamptz 'REPLACE_WITH_SAME_REVIEW_TIME_UTC';

rollback;
```

Require the returned IDs and counts to match the reviewed report exactly.
After that rehearsal passes, repeat the same transaction with the same UTC
review time and exact UUID array, inspect the result again, and use `COMMIT`
instead of `ROLLBACK`. A set mismatch or count drift aborts before any deletion.
The committed run ledger contains aggregate counts and operator assertion only;
it retains no inquiry content or inquiry IDs.

The inquiry cutoff always uses the explicit reviewed time. The technical
fingerprint cutoff instead uses the database statement time at the start of the
purge and records that exact cutoff in `rate_limit_cutoff_at`; an old review time
therefore cannot extend the approved 30-day technical-record period.

Record the run ID, UTC review time, aggregate counts, outcome, and operator in
the private operations log. Never record deleted names, addresses, messages,
phone numbers, or provider receipts. Primary-table deletion does not imply that
managed backups are immediately rewritten; document and honor the verified
backup-expiry boundary when responding to a deletion request.

## Managed backup recovery boundary

Verified September 6, 2026 against the authenticated Production project
`qwprhsrwiihfllmgallr`: the project is on Supabase Pro with managed daily
physical database backups. Point-in-Time Recovery is not enabled. Supabase
defines the customer-accessible managed recovery window as the last seven days
of daily backups; without PITR, the recovery point can be nearly 24 hours old.

The completed restore points visible during verification were
`2026-09-05 18:34:35 UTC` and `2026-09-06 07:58:54 UTC`. Their calculated
seven-day boundaries are approximately `2026-09-12 18:34:35 UTC` and
`2026-09-13 07:58:54 UTC`. These are customer-accessible recovery boundaries,
not provider-attested physical-erasure timestamps. Supabase does not expose an
exact per-snapshot cryptographic-erasure time.

Managed database backups cover Postgres data and database metadata, but not
Supabase Storage object bodies. Physical backups are restorable in place or to
a new project, are not directly downloadable as logical exports, and restore
the database as a whole rather than a selected row. A restore or clone from a
pre-deletion snapshot can reintroduce a previously deleted inquiry. Keep that
environment closed to users and rerun the retention purge before intake or
access resumes. The provider dashboard offers no selective removal of one
person's row from an existing managed snapshot.

## Repeatable local boundary check

Run `npm run test:inquiries` before each launch candidate. The suite verifies
that deployed traffic trusts only Vercel's protected client-address header,
spoofable generic forwarding headers are rejected, missing deployment identity
or a short HMAC secret fails closed, the approved rate limit remains exactly
five accepted submissions per hour, fingerprints and payload evidence are
secret-keyed, and local
development uses only its explicit non-IP fallback. It also checks the local
migration contract, approved policy text, exact collection gate, owner-only
retention authority, 12-month cutoff, constrained holds, and 30-day technical
cleanup. This suite is provider-free; it does not replace executing
`scripts/test-inquiry-retention-database.sql` after migration 015 in an isolated
database, a hosted staging rehearsal, or a real Resend acceptance and
mailbox-delivery check.

## Deployment and opening gate

The policy decision alone did not apply migration 015 and does not authorize a
purge. On September 6, 2026, the exact reviewed migration was ledger-applied to
the dedicated Production database as version `015`; a follow-up native dry run
was up to date, the catalog/privilege assertions passed, and the Production
inquiry, submission-limit, and retention-run counts remained zero. This closes
items 1 and 2 below, but `NEXT_PUBLIC_INQUIRY_COLLECTION_READY` remains exactly
`false` until every remaining operational condition is verified:

1. **Passed:** migration 015 is applied to Production and its migration ledger
   matches the reviewed local version.
2. **Passed:** `scripts/test-inquiry-retention-database.sql` passed in the
   approved staging transaction and rolled back completely.
3. The named operator's owner/postgres SQL access is verified separately from
   ordinary site-admin access, the authenticated append-only private operations
   log exists, and the monthly calendar reminder has an owner.
4. **Passed:** the published privacy policy carries the approved language and
   September 5, 2026 effective date.
5. **Provider boundary passed; operations record pending:** the managed backup
   recovery window is verified above. Record that boundary in the authenticated
   private operations log once item 3 exists.
6. A rollback-only monthly rehearsal is reviewed without exported inquiry
   content.

Only a rebuilt deployment with exact lowercase
`NEXT_PUBLIC_INQUIRY_COLLECTION_READY=true` opens the website forms and API.
The application must not claim that journal requests are subscriptions or that
read-only inbox statuses are operationally advanced.
