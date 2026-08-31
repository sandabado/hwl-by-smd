# Inquiry privacy operations

Status: owner-operated launch runbook. This document does not authorize a
hosted migration, provider change, deployment, or deletion.

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
  later valid submission. They contain no raw network address.
- Do not forward inquiry content into ordinary email or copy it into unrelated
  project tools.

## Current rate-limit contract

- The default limit is five accepted submissions per HMAC-pseudonymized client
  address in a one-hour window. `INQUIRY_RATE_LIMIT_MAX` may narrow or widen that
  value only within the database-enforced range of 1 through 20.
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
  submission. This fixed technical-record cleanup is separate from the still
  undecided retention period for inquiry content.
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

Use this sequence only after the owner names and approves the exact normalized
administrator email:

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
4. Obtain separate owner approval for the privilege change. Then, in the SQL
   editor, replace both placeholders and run the narrow transaction below. The
   UUID and email predicates must identify the same previously verified row:

   ```sql
   begin;

   update public.profiles
   set is_admin = true
   where id = 'REPLACE_WITH_VERIFIED_AUTH_USER_UUID'::uuid
     and lower(email) = lower('REPLACE_WITH_OWNER_APPROVED_ADMIN_EMAIL')
     and is_admin = false
   returning id, email, is_admin;

   rollback;
   ```

5. Require the rollback rehearsal to return exactly one row. Repeat the same
   transaction with `COMMIT` only after the owner reviews that row and explicitly
   authorizes promotion. If it returns zero or more than one row, stop.
6. Sign out, sign in through the normal site flow as the approved administrator,
   and verify `/admin/inquiries` uses a real Supabase session rather than the
   local demo path. Confirm the private inbox can be read after migration 013 is
   applied, while a logged-out browser is denied.
7. Record the approver, operator, UTC time, Auth UUID, and verification result in
   the private operations log. Do not record the password, session cookie,
   service-role credential, or unrelated profile data.
8. To revoke access, use the same exact UUID-and-email transaction with
   `is_admin = false`, verify the affected row count, and confirm the former
   session can no longer open the inbox.

This bootstrap is authorization guidance, not permission to create an account
or change hosted data. The website service role and public application must
never expose a self-promotion path.

## Retention decision and dry-run protocol

No retention period is encoded or implied by this runbook. Before accepting
live inquiries, the owner must decide all of the following:

1. The retention period for each inquiry source, or one period that explicitly
   covers booking, contact, retreat, and journal requests.
2. Whether the clock starts at `created_at` or after an inquiry is closed. The
   current schema records `created_at` but has no `closed_at`; a closure-based
   clock therefore requires a separately reviewed schema change.
3. Which legal, financial, safety, dispute, or active-service holds suspend
   deletion. The current table has no hold flag, so any hold mechanism also
   requires an explicit operating record or schema change.
4. The purge cadence, named operator, review/approval path, and evidence kept
   after deletion without retaining deleted PII.
5. The exact public privacy-policy language and effective date.
6. Whether the existing 30-day cleanup of pseudonymized rate-limit fingerprints
   is accepted as the technical-record policy.
7. Whether the default five submissions per client identity per hour is the
   launch limit, or which explicit value from 1 through 20 should be configured
   in each environment.
8. Whether journal requests remain owner-reviewed consent requests or move to a
   separately approved mailing-list and unsubscribe system.

After those decisions are approved, begin with this owner/postgres **read-only
candidate report**. The placeholder is deliberately invalid until an owner
supplies an approved UTC cutoff:

```sql
begin transaction read only;

select
  count(*) as candidate_count,
  min(created_at) as oldest_created_at,
  max(created_at) as newest_created_at
from public.inquiries
where created_at < timestamptz 'REPLACE_WITH_OWNER_APPROVED_CUTOFF_UTC';

select id, created_at, source, status, notification_status
from public.inquiries
where created_at < timestamptz 'REPLACE_WITH_OWNER_APPROVED_CUTOFF_UTC'
order by created_at, id;

rollback;
```

This report is not deletion authority. A later purge must be separately
reviewed, start with the approved candidate IDs, exclude documented holds,
return only deleted IDs as evidence, and be rehearsed with `ROLLBACK` before an
owner authorizes `COMMIT`. Do not add a blanket scheduled delete while the
retention decision remains open.

## Repeatable local boundary check

Run `npm run test:inquiries` before each launch candidate. The suite verifies
that deployed traffic trusts only Vercel's protected client-address header,
spoofable generic forwarding headers are rejected, missing deployment identity
or a short HMAC secret fails closed, rate limits remain within 1–20 with a
default of 5, fingerprints and payload evidence are secret-keyed, and local
development uses only its explicit non-IP fallback. This suite is provider-free;
it does not replace a hosted staging persistence test or a real Resend
acceptance and mailbox-delivery check.

## Owner decision still required

Before live inquiry collection is approved, the owner must complete the
retention decisions above, publish the resulting privacy language, and approve
the purge cadence and operator. Until then, retention is a launch gate; the
application must not claim that inquiries are automatically deleted, that
read-only inbox statuses are operationally advanced, or that a journal request
has been added to a managed mailing list.
