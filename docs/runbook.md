# HWL by SMD — Operations Runbook

**Status:** Skeleton for review; not an authorization to deploy, charge, send,
alter provider configuration, migrate a database, or move a public alias.
**Primary risk:** Bus factor = 1. Keep recovery steps legible to a second
operator and identify a human decision-maker for every business-impacting
action.

## 1. Deployment Process

### Preview

1. Confirm the intended change is reviewed and references its decision in
   `docs/decisions.md`; preserve unrelated working-tree changes.
2. Run the approved local checks and the exact candidate's CI. Record failures;
   do not substitute a local pass for hosted proof.
3. Push only the approved checkpoint branch:
   `checkpoint/platform-overhaul-2026-08-20`.
4. In Vercel, verify the resulting deployment's full Git SHA, branch, target,
   protection state, and aliases. Test the immutable candidate URL first.
5. Keep sales, inquiries, booking-ledger writes, and other business gates
   closed unless a separate scoped canary authorization says otherwise.
6. Record browser, HTTP, API, database, provider, and mailbox evidence
   separately. A Preview success is not Production proof.

### Frozen release candidate

1. Cut a release branch directly from the audited checkpoint SHA; do not
   cherry-pick or amend the audited commit.
2. Record the branch name and full SHA in `docs/decisions.md` and
   `docs/worklog.md`. Verify the local and origin refs match.
3. Continue implementation on the checkpoint branch. Do not update the frozen
   release branch unless an explicit decision approves the exact change and
   its evidence.
4. Any change to a release branch resets its exact-SHA canary; rerun the
   required canary against the new branch head before promotion.
5. The release branch head—not a moving checkpoint ref or remembered SHA—is
   the source for release canaries and promotion candidates.

### Production

1. Stop unless the owner has approved the exact SHA, migration(s), business
   impact, and release sequence. `main` is not part of the current checkpoint
   release path.
2. Confirm Production secrets/configuration by name and validity without
   printing values; independently verify Production migration ledger and
   backups before any approved schema change.
3. Deploy the exact approved SHA as an alias-free, closed candidate. Verify the
   deployment identity and the required closed-state gates.
4. For LIFT live-path validation, follow the ordered Production canary in
   `docs/decisions.md` ADR-007. The live charge/refund canary needs separate
   approval naming the payer and accepting possible non-refundable fees.
5. Move public aliases only after the required canary evidence is recorded and
   alias movement is explicitly authorized. Verify canonical host, redirects,
   key routes, logs, commerce state, and rollback target immediately afterward.
6. Record the exact SHA, Vercel deployment ID, approvals, checks, gates, and
   follow-up work in the append-only `docs/worklog.md`.

### Release record (fill for each change)

- Approved SHA / branch:
- Vercel deployment ID and target:
- Alias state before / after:
- Checks and evidence links:
- Business gates before / after:
- Approver and approval scope:
- Rollback deployment ID:

## 2. Credential Locations

Store and retrieve credentials only through the authorized provider's secure
interface. **Never put secret values in this runbook, Git, screenshots, chat,
logs, test output, or issue trackers.** Restrict access, scope credentials by
environment, rotate exposed values, and verify revocation after replacement.

- Local development: ignored `.env.local` in the repository; do not commit it.
- Hosted application: Vercel project **Settings → Environment Variables**;
  separate Preview and Production scope and redeploy after approved changes.
- Database/auth/storage: the exact Supabase project dashboard and its API,
  Auth, Storage, and database/migration areas. Confirm the project ID before
  changing anything.
- Payments: the canonical HWLbySMD Stripe account, with explicit test/live
  mode awareness; webhook signing secrets are distinct per endpoint/environment.
- Scheduling: the canonical `hwlbysmd` Cal.com account; developer API keys and
  webhook signing secrets are separate, least-privilege credentials.
- Email: the approved Resend workspace, verified sending domain, and restricted
  API key. Sender-domain configuration is distinct from Proton mailbox hosting.
- Recovery: maintain owner-controlled MFA, account recovery, and a second
  authorized operator path for Vercel, Supabase, Stripe, Cal.com, and Resend.

**Before any provider action:** record the provider account/project identifier,
environment, scope, and intended operation; do not infer account identity from
a browser tab title or a familiar-looking dashboard.

## 3. Incident Response

### Stripe / payment failure

1. Stop new checkout exposure by confirming `COMMERCE_SALES_READY=false` in the
   affected environment. If that cannot be confirmed, escalate and do not retry
   a charge.
2. Identify the exact deployment, Stripe account, and mode. Inspect the
   Checkout Session, PaymentIntent, webhook delivery, and matching HWL order/
   entitlement before taking action.
3. Prevent duplicate payment requests. Never grant access based on a browser
   success screen alone; use authoritative Stripe and database evidence.
4. For refunds, disputes, or ambiguous paid states, preserve records and follow
   the approved reconciliation/refund policy. Disputed access remains suspended
   pending manual review; do not improvise a restoration.
5. Restore sales only after cause is fixed, idempotency/webhook/access checks
   pass, and the owner separately approves reopening.

### Cal.com / booking failure

1. Do not invent or cache availability as a substitute for Cal.com. If slots
   cannot be verified, stop online time selection and give the customer the
   truthful contact/provider fallback.
2. Check the published event, Cal account, timezone, conflict calendars, and
   provider logs without editing or re-publishing event types as a first step.
3. Cal.com remains authoritative for requests, confirmation, rescheduling, and
   cancellation. If its private Admin API queue or HWL webhook ledger is
   unavailable, manage the appointment directly in Cal.com and label HWL
   history as unavailable.
4. Do not collect Cal payment; service payment is currently a manual,
   post-appointment Stripe invoice/payment-link workflow.
5. Verify restored slot availability and client/provider notices before
   declaring the incident resolved.

### Site / Vercel outage

1. Confirm the affected hostname, deployment ID/SHA, target, HTTP response, and
   time window. Check Vercel deployment state, build/runtime logs, and provider
   health before changing aliases.
2. If a business flow may be unsafe, keep checkout and other affected gates
   closed. Communicate a simple alternative (for example, contact Shannon) that
   does not promise an unverified service.
3. Choose the last-known-good deployment from verified deployment metadata;
   do not guess from a branch name or mutable tag.
4. Follow the rollback procedure below only with the needed approval. Verify
   the public host, redirects, core pages, and safety gates after restoration.

### Incident record

- Incident ID / start time / timezone:
- Impacted users, routes, providers, and environment:
- Exact deployment SHA and provider identifiers:
- Safety gates closed:
- Actions and evidence (no secret values):
- Customer communication / owner escalation:
- Recovery verification and unresolved risks:

## 4. Rollback Procedure

Rollback means restoring a previously verified deployment; it does not mean
discarding commits or undoing database history.

1. Identify the failing public deployment and the exact last-known-good Vercel
   deployment ID/full SHA. Confirm it contains compatible routes and data
   assumptions; do not assume an application rollback reverses a migration.
2. Obtain explicit approval for the affected environment and alias scope. Keep
   checkout/sales closed while diagnosing and during rollback unless the
   approved runbook explicitly requires another state.
3. Use Vercel's deployment/alias rollback control to restore the named prior
   deployment. Do not change Git history with `reset --hard` or force-push.
4. Verify the expected domains resolve to the chosen deployment; test homepage,
   `/beauty/lift`, `/book`, and `/store`; inspect runtime errors and confirm
   relevant gates remain closed.
5. If a database migration is implicated, stop application rollback if it is
   not backward-compatible. Preserve evidence and prepare an explicit,
   reviewed fix-forward migration; never falsify migration history or drop
   customer records to make code fit.
6. Record who approved the rollback, before/after deployment IDs and aliases,
   verification evidence, customer impact, and fix-forward owner in
   `docs/worklog.md`.

## 5. Contacts and Recovery Details — To Complete

- Business decision-maker / alternate:
- Vercel project and team owner:
- Supabase Production project owner:
- Stripe account owner / payer for any approved live canary:
- Cal.com account owner:
- Resend workspace/domain owner:
- Customer-safe outage contact method:
- Recovery-factor location and custodian (never recovery codes themselves):
