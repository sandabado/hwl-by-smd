# HWL Launch Runbook

This end-to-end launch runbook begins with one isolated, test-money-only Vercel
Preview and proceeds through separately gated Production verification. It grants
no authority to push, deploy, change provider configuration, assign a domain,
charge live money, or promote Production. Every provider or hosted-state step
below requires direct owner approval first.

The owner changed the launch domain to `hwlbysmd.com` on September 4, 2026.
Production canonicals use `https://www.hwlbysmd.com`, matching Vercel's existing
apex-to-www redirect. The custom Preview is now configured, TLS-valid, assigned
only to the checkpoint branch, and protected by Vercel SSO. Preserve the
current Proton inbound-mail records and exact verified Resend sending records;
do not recreate the superseded root-mail forwarding configuration.

## September 14 Current Authority Snapshot

- The synchronized checkpoint branch and protected Preview use exact commit
  `828bd43a0ddb59f7bdb2301cb761f59aeacb517a`. Vercel deployment
  `dpl_3jU7MS43zTFcJ7wr9nYpoghQna8S` is READY/Preview and owns
  `preview.hwlbysmd.com`; GitHub Actions run `34860826873` passed. `main`, public
  Production aliases, live Stripe, and sales were not changed.
- Public aliases still resolve to older READY deployment
  `dpl_HMtiyuJNF5unFUY9K6uWkiWZ4y4i`, exact commit
  `6a260bcfa7c752562be264d1a077013fc8ff9f4d`, with commerce and inquiry
  collection closed. The exact `828bd43` Preview has not been promoted.
- A fresh local verification passes the production build, ESLint, TypeScript,
  changed-file formatting, dependency-tree and tracked-secret checks, all 63
  static pages, SEO for 21 pages and seven long-form documents, and 741/741
  launch assertions. The only local environment failure is the stale local
  Resend credential; this does not establish the validity of the opaque
  deployed Preview credential.
- The exact-`828bd43` Preview passed the then-current HTTP and browser
  postflight: `/index` returned an exact query-preserving `308` redirect to `/`;
  the immutable raw `/` response returned `200 text/html` with 118,679 bytes;
  and the hosted-root audit passed all 9 checks. A fresh browser rendered the complete home application
  tree and the Cal selector hydrated with five Pacific-time choices on September 27. Browser warning/error logs were empty for the app and Cal views, and the
  exact-deployment Vercel warning/error log scan returned no records.
  Desktop and 390-pixel mobile checks also found no horizontal overflow,
  preserved the accessible navigation and all 11 visible services, and kept
  the contact form fully labelled. No transaction or form was submitted.
- Preview remains deliberately sales-closed. The last verified read-only
  provider/storage audit found an active Stripe sandbox Product and one-time
  $11.11 Price, a persistent Preview webhook subscribed to the exact four
  required events, and both private staging media objects. Treat these as
  last-verified provider/storage state, not fresh exact-artifact fulfillment
  proof. No Stripe session or event postdates the September 14 deployment, so
  the current artifact still needs an owner-approved purchase, signed webhook,
  fulfillment/access, replay, refund, dispute, and recovery canary.
- Public Cal booking exposes all 11 zero-price, manual-confirmation services
  with seats disabled, 48-hour notice, 60-minute buffers, and
  reschedule/cancellation enabled. Fresh unauthenticated Cal public-API queries
  return real availability for every service through October 14. A separate
  authenticated staging Supabase read shows migrations 001–020, the
  migration-019 RPC contract, and a booking-ledger aggregate baseline of zero
  records, aliases, webhook receipts, and manual-review events. These are
  different evidence modalities; neither proves signed Cal-to-HWL ingestion.
  Production is current only through migration 018, so migrations 019 and 020
  are a hard gate before any Production Cal-ledger activation. Cal's
  authenticated profile now shows `shannon@hwlbysmd.com` as the sole Primary
  email. Neither Preview nor Production has `CALCOM_API_KEY` or
  `CALCOM_WEBHOOK_SECRET`, and the Preview ledger endpoint is disabled. Do not
  claim synchronized booking history until the signed request → confirmation →
  reschedule → cancellation lifecycle passes.
- Inquiry collection renders open in Preview and historical database-first plus
  Resend delivery evidence exists, but it belongs to two distinct artifacts:
  one labeled test on exact Preview `d28be30`, and a separate labeled test on an
  isolated Production deployment. Neither is proof for current public
  Production, and `828bd43` has no successful labeled inquiry submission. The
  local Resend credential fails provider validation; this does not prove the
  opaque deployed Preview credential is invalid. Three older staging inquiries
  for the designated QA email are retained with
  `received`/`accepted` state, so the new canary must be identified by its exact
  generated submission ID and Stage 2 label.
- The designated Stage 2 identity `accounts@wholebody.earth` exists in staging
  Auth, is email-confirmed, and has previously signed in. The read-only check
  created no account mutation or login link. It already owns the active
  September 11 Preview LIFT purchase. The linked sandbox Session and $11.11
  charge are paid, undisputed, and unrefunded, so a fresh same-account checkout
  requires explicit approval to fully refund the historical sandbox charge,
  verify signed revocation, and then repurchase. Otherwise use a new confirmed
  QA identity approved by the owner.
- Proton's two inbound MX records, SPF, and three DKIM selectors are live for
  `hwlbysmd.com`, and the verified Resend sending records remain present.
  Authoritative DNS, Cloudflare, and Google now return exactly one `_dmarc` TXT
  record, `v=DMARC1; p=quarantine`, so the conflicting-policy gate is closed.
  Run one labeled Resend-to-Proton receipt canary before calling end-to-end
  mail delivery complete.
  The Production invitations for `shannon@hwlbysmd.com` and
  `admin@ghosthand.studio` remain unconfirmed; neither identity is a proven
  signed-in administrator.
- The canonical live Stripe account has an active LIFT Product, one-time $11.11
  Price, and four-event Production webhook, but still has zero live
  transactions. No signed live webhook, entitlement, or private-media
  fulfillment proof exists; live object presence is configuration evidence
  only.
- Four configuration names have both branch and general Preview definitions:
  `COMMERCE_SALES_READY`, `CONTACT_TO_EMAIL`, `LIFT_PDF_STORAGE_PATH`, and
  `LIFT_VIDEO_STORAGE_PATH`. A secret-safe pull confirmed that every general
  value is byte-for-byte identical to its effective checkpoint value. Once the
  owner authorizes the mutation, remove only the four general Preview copies and
  retain the isolated checkpoint definitions; no provider change has been made.
- Exact `828bd43` remains the last synchronized and deployed Preview artifact,
  and its immutable root passed the earlier 9-check hosted-root audit. A
  stricter local verifier follow-up now rejects numeric record-zero aliases and
  unsupported Flight push channels, pins the two expected Next/React runtime
  inline bodies, parses markup with the standards-compliant `parse5` browser
  grammar, and rejects unreviewed inline handlers, active embeds,
  foreign/declarative-template execution, and external scripts outside the
  ordered same-origin Next-chunk inventory. Its targeted suite passes 60/60 and
  the Preview-release suite passes 101/101. That hardening is still uncommitted in two
  scripts, two dependency-manifest files, and these two reconciled documents, so
  it is neither part of `828bd43` nor deployed. A newly approved checkpoint SHA
  must repeat the exact-artifact HTTP and browser proof before promotion.

### Pending Production migration gate

Production is missing migrations 019 and 020. Their reviewed hashes are:

```text
019  504d83b41cd385d62af3eed8b4845d8ae0ee85cb9065b646260d11daaa8e93fd
020  7294172e47a0d20aa000054efaa2a2b1b5833f534b2a9e4deeef92573f01dbb3
```

Before a separately approved Production apply:

The September 14 read-only Production preflight already confirms migration 018,
an absent migration-020 index, zero rows in each of the four booking/audit
tables, zero duplicate target/reference pairs, and the exact pre-019 contract:
one 24-argument, zero-default, service-role-only `SECURITY DEFINER` ingestion RPC
with an empty `search_path` and the original four-value review constraint. The
published LIFT course and all seven lessons are present. The private
`member-content` bucket exists with zero policies and a 50 MB object limit, but
it contains no files; both canonical LIFT assets remain a separate approved
Production upload-and-verification gate.

1. Keep the Cal booking ledger, Cal webhook, and administrator handoff disabled.
2. Confirm migration 018 exists and the migration-020 index does not.
3. Confirm `calcom_webhook_events` has low/zero traffic and record its row count.
4. Require this preflight to return no rows:

   ```sql
   select target_user_id, change_reference, count(*)
   from public.admin_role_change_audit
   group by target_user_id, change_reference
   having count(*) > 1;
   ```

5. Apply 019, verify the single 25-argument service-role RPC and widened review
   constraint, then apply 020 and verify the exact unique-index definition.
6. If either file fails before commit, rely on its transaction rollback. If 019
   commits and 020 later fails, keep both features disabled, retain every audit
   row, and fix forward. Do not restore the obsolete Cal RPC or delete audit
   evidence.

This review authorizes nothing by itself. Production remains unchanged until
the owner approves these exact files and scope.

## September 13 Historical Authority Snapshot

This section is retained as dated evidence. It is not current release authority.

- `preview.hwlbysmd.com` remains protected and resolves to READY/STAGED
  deployment `dpl_3eUKiEGs53CSw893CZmrN1McA2PU`, exact checkpoint
  `d28be30b9eff32e5f74784fb63f827407e70e9f1`. A newer Dependabot deployment
  owns only its automatic branch alias and is not a release candidate.
- Exact Preview and public Production `/index` and `/` currently return the
  same cached root artifact within each deployment. Their Flight state names
  `index`, so the server emits the non-home header, breadcrumb, and effects
  before the client hydrates canonical `/`; fresh browsers record React error 418. The local fix redirects `/index` permanently before filesystem/ISR
  resolution and has regression coverage. A fresh-cache closed Preview must
  prove `/index` is 3xx, `/` has canonical root state, and browser hydration is
  clean before any Production promotion.
- Public Production remains READY at
  `dpl_HMtiyuJNF5unFUY9K6uWkiWZ4y4i`, exact checkpoint
  `6a260bcfa7c752562be264d1a077013fc8ff9f4d`, with sales, inquiries, and booking
  history closed. Its fail-closed public canaries pass. The complete live-mode
  configuration shape is present, but live Stripe connectivity, a signed
  webhook, charge, entitlement, and delivery are not proven.
- Public Cal booking remains available with manual confirmation and no payment.
  The restricted Cal API key and webhook secret are absent from Production,
  and the pending `shannon@hwlbysmd.com` account identity remains unverified.
  Do not enable HWL booking history or run the signed lifecycle until those
  gates are complete.
- Service payment is a manual customer-specific Stripe Invoice after Shannon
  confirms the appointment occurred and the final amount. The application does
  not automate the invoice email or expose service-payment history in the Den.
- The current fix-forward set is local and uncommitted. It grants no commit,
  push, hosted migration, provider, Preview, Production, domain, alias, live
  payment, or sales-opening authority.

## September 9 Historical Authority Snapshot

This section superseded the historical September 5 status below. Keep it as an
audit trail; do not use it as current release evidence.

- The read-oriented administrator runtime was committed and pushed only to
  `checkpoint/platform-overhaul-2026-08-20` at `450188fb9950`. Exact-SHA GitHub
  CI passed, and the clean post-push repository preflight confirmed local and
  upstream synchronization.
- `preview.hwlbysmd.com` resolved to READY deployment
  `dpl_ALJWgaPjEcK1Bppsbo6RHjedvmxb` at `450188fb9950`. Protected-Preview
  canaries passed for the homepage, the single $11.11 LIFT video-plus-PDF cart,
  signed-out checkout recovery, Tarot availability, and the individual
  20-minute Wild Glow Express calendar. Browser console evidence contained no
  application errors; Cal.com's embedded page emitted only its own unused-font
  preload warning.
- The immutable successful Stripe sandbox purchase and private LIFT fulfillment
  proof belongs to deployment `dpl_7Vc1qbMZYRHoQDoxd2haNahQpucP` at
  `4ea17b40`. The mutable Preview alias moved afterward. Never transfer that
  proof to a later SHA without rerunning the exact-host lifecycle.
- Public Production currently resolves to
  `dpl_HMtiyuJNF5unFUY9K6uWkiWZ4y4i` at `6a260bc`. It is intentionally
  sales-closed and inquiry-closed, predates the dependency-patched baseline,
  and produced a reproducible React hydration error on the homepage during the
  September 9 browser audit. Production is not an acceptable source candidate
  for the next release.
- The dependency-patched repository baseline uses Next.js `16.3.4`; the current
  Production deployment reports Next.js `16.3.1`.
- Public Production booking currently loads the exact Cal.com service and shows
  Shannon's available dates and times without collecting payment. Three
  intermittent `/book` upstream `fetch failed` timeouts were also present in
  recent Vercel runtime evidence, so the next candidate still needs repeated
  booking canaries and a graceful-fallback check.
- The current admin candidate is a seven-workspace, read-oriented console.
  Local authenticated desktop/mobile browser checks passed across all eight
  canonical surfaces. Hosted administrator reads still require an authenticated
  operator canary, and private Cal.com booking queues require a key from the
  exact Shannon account. The Cal.com booking ledger remains gated until
  migrations 016 and 017 plus a signed webhook lifecycle pass are applied and
  verified in the intended hosted environment; client-message writes remain
  gated by `ADMIN_CLIENT_MESSAGING_READY=false`.
- Migrations 014–017 and both rollback-only SQL harnesses passed in an isolated
  local Supabase database. This is local database evidence only; neither
  migration 016 nor 017 has been applied to hosted Supabase.
- Live LIFT selling remains a separate owner-driven Production gate. Do not
  infer live-money readiness from the completed sandbox purchase.

## Fixed Preview boundary

| Boundary            | Required Preview value                    |
| ------------------- | ----------------------------------------- |
| Git branch          | `checkpoint/platform-overhaul-2026-08-20` |
| Stable origin       | `https://preview.hwlbysmd.com`            |
| Deployment target   | `preview`                                 |
| Stripe mode         | Sandbox/test only                         |
| Stripe account      | `acct_1U9cEQAdcj2oNOF4`                   |
| Stripe Product      | `prod_VACTsFboJAEOF0`                     |
| Stripe Price        | `price_1U9s49Adcj2oNOF4jcyMjyDB`          |
| Supabase            | Staging project `lkxppynmdfzljuptauxf`    |
| Production mutation | Forbidden during Preview preparation      |

## Historical September 5 checkpoint baseline and candidate

- The last externally verified pushed commit before this candidate was
  `8e841fc2db78bf42126c2ee365c0f65228076980`. It
  passed GitHub CI and deployed READY as
  `dpl_F2R2enfjMUgT9qwnbj2Yr67apihU`; local HEAD and its tracked checkpoint
  branch matched at that boundary. `main` was not pushed.
- The protected Preview has all 22 required branch-scoped configuration names
  and previously passed its sandbox-open environment preflight. This inventory
  does not prove secret values or provider behavior.
- The full combined local gate passes: TypeScript, ESLint, SEO, the Next.js
  16.3.1 Webpack build (62 printed route/page entries), 55/55 commerce, 23/23
  launch-environment, 16/16 Auth, 7/7 inquiry, 6/6 booking, 1/1
  accessibility-markup, 16/16 Preview-policy, and full/production npm audits
  with zero vulnerabilities. This candidate includes the Auth and repaired
  lockfile changes; exact-SHA GitHub CI and Vercel deployment evidence must be
  resolved externally after each checkpoint push.
- Before transactional testing, the owner must privately pass Vercel SSO and
  sign in with an existing confirmed staging Supabase purchaser on the exact
  `https://preview.hwlbysmd.com` host. Do not place credentials in chat.
- Hosted Auth still needs custom SMTP, exact redirect allowlists, disabled link
  tracking, rate-limit review, and non-team signup-confirmation/password-reset
  proof. A real database-first inquiry plus Resend/human receipt, an exact-host
  Cal.com booking plus FIREBIRDS/conflict/human-email proof, and the current
  sandbox purchase/fulfillment lifecycle also remain pending.
- The canonical live Stripe parent is only 10% through onboarding: Business
  type is in progress and the remaining required sections are not started.
  Sandbox state is not live-money readiness.

The local preflight is deterministic and offline. It does not fetch Git refs,
read Vercel configuration, inspect provider objects, or make network calls.

```bash
npm run test:preview-release
npm run preflight:preview:repository
```

The repository preflight intentionally fails while the tree is dirty, the
checkpoint has no upstream, or the candidate is behind its current local
upstream tracking ref. A clean candidate may be ahead before its authorized
push. It reports that tracking evidence as local-only; a separately authorized
fetch is needed before anyone claims the remote itself is current.

After the authorized push, require exact local upstream synchronization:

```bash
npm run preflight:preview:post-push
```

For a complete environment-shape check, place an owner-approved Preview-only
snapshot in ignored `.env.preview.local`, then run:

```bash
npm run preflight:preview -- --expect-sales=closed
```

The first Preview must use closed sales. After the stable hostname, persistent
sandbox webhook, hosted migrations, private assets, and closed-state probes are
verified, the owner may approve a Preview-only sandbox E2E phase. Re-check that
snapshot with:

```bash
npm run preflight:preview -- --expect-sales=open
```

Passing either command proves configuration shape only. It never proves
provider ownership, branch scoping, webhook delivery, or fulfillment.

## Owner-approved Preview variables

Install one complete, branch-scoped Preview set. Do not copy these variables to
Production, and do not reuse local webhook, cron, or inquiry secrets.

### Application identity

- `HWL_DEPLOYMENT_TARGET=preview`
- `HWL_LOCAL_BUILD=false`
- `NEXT_PUBLIC_SITE_URL=https://preview.hwlbysmd.com`

### Staging Supabase

- `NEXT_PUBLIC_SUPABASE_URL=https://lkxppynmdfzljuptauxf.supabase.co`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — modern staging publishable key
- `SUPABASE_SERVICE_ROLE_KEY` — modern staging server secret

The service secret must remain server-only. The staging ledger currently lists
migrations 001–020. Migrations 012–014 are owner-approved, ledger-applied in
order, and fingerprint-verified; the presence of 015–020 in the ledger is not by
itself fingerprint proof. Preserve the ledger and do not reapply or repair it to
prepare a later Preview.

Supabase Auth must separately use production-capable custom SMTP from the
verified HWL sender domain. The project URL allowlist must include the exact
Preview callback `https://preview.hwlbysmd.com/auth/callback`, the canonical
Production callback `https://www.hwlbysmd.com/auth/callback`, and only the
intended localhost callbacks. Disable SMTP link tracking, review provider and
Supabase Auth rate limits, and prove signup confirmation plus password recovery
using a non-team email address. The application's Resend notification key does
not by itself configure Supabase Auth email.

### Stripe sandbox

- `COMMERCE_SALES_READY=false` for the first deployment
- `STRIPE_LIVEMODE=false`
- `STRIPE_ACCOUNT_ID=acct_1U9cEQAdcj2oNOF4`
- `STRIPE_LIFT_PRODUCT_ID=prod_VACTsFboJAEOF0`
- `STRIPE_LIFT_GUIDE_PRICE_ID=price_1U9s49Adcj2oNOF4jcyMjyDB`
- `STRIPE_SECRET_KEY` — test-mode key belonging to that sandbox
- `STRIPE_WEBHOOK_SECRET` — secret issued for the persistent Preview endpoint,
  never the Stripe CLI listener secret

Preserve the approved dedicated Vercel **Protection Bypass for Automation**
secret, keep Deployment Protection enabled globally, and keep the persistent
sandbox endpoint configured with the secret in its query parameter:

```text
https://preview.hwlbysmd.com/api/stripe/webhook?x-vercel-protection-bypass=<dedicated-secret>
```

The bypass secret belongs only in Vercel's protected project setting and the
Stripe sandbox endpoint configuration. Never place it in source, committed
configuration, screenshots, logs, or chat, and never reuse it as an
application, cron, inquiry, Stripe, or Supabase secret. Vercel documents this
query-parameter method specifically for third-party webhook services such as
Stripe:
<https://vercel.com/docs/deployment-protection/methods-to-bypass-deployment-protection/protection-bypass-automation>.

Subscribe exactly:

- `checkout.session.completed`
- `checkout.session.expired`
- `charge.refunded`
- `charge.dispute.created`

The exact bypass-qualified endpoint must be reachable by Stripe without a
redirect or authentication challenge, while the same endpoint without the
bypass must remain protected. A signed delivery and database receipt remain
unverified. Creating or rotating this bypass is a hosted security change and
requires owner approval.

### Fulfillment and inquiries

- `LIFT_PDF_STORAGE_PATH=lift/lift-guide.pdf`
- `LIFT_VIDEO_STORAGE_PATH=lift/complete-lift-v1.mp4`
- `LIFT_VIDEO_CAPTIONS_STORAGE_PATH` only after a VTT object is verified
- `RESEND_API_KEY` for the approved Resend account
- `CONTACT_TO_EMAIL` for Shannon's destination
- `CONTACT_FROM_EMAIL` on the verified `hwlbysmd.com` sender domain
- `INQUIRY_RATE_LIMIT_SECRET` — unique random value of at least 32 characters
- `INQUIRY_RATE_LIMIT_MAX=5`
- `CRON_SECRET` — a separate unique random value of at least 32 characters
- `CALCOM_PROFILE_URL=https://cal.com/hwlbysmd`

The last verified storage audit found the visually reviewed canonical PDF and
byte-verified video in private staging storage. Preserve those exact objects,
but do not treat the dated storage result as a fresh fulfillment canary. Neither
the PDF nor video belongs in Git or the Vercel deployment bundle.

## Vercel Preview facts and manual recovery test

Vercel invokes project cron jobs only for Production deployments, not Preview
deployments. The declaration in `vercel.json` can build into the Preview, but
it does not prove scheduled execution there. Official reference:
<https://vercel.com/docs/cron-jobs/quickstart>.

After approval and deployment, exercise the Preview reconciliation route once
through a secret-safe HTTP client with its Preview `CRON_SECRET`. Do not put the
secret in source, chat, screenshots, or a process command line. Verify the
sanitized admin queue state and application logs. Production scheduling remains
untested until a separately authorized Production smoke test.

## Hosted root HTTP and hydration postflight

The hosted root check is an operator-only post-deployment gate. Its unit tests
run in CI, but CI must never fetch the protected Preview or receive a provider
credential. First verify the immutable deployment and its approved SHA through
authenticated Vercel deployment evidence. Then independently confirm that
`preview.hwlbysmd.com` resolves to that exact deployment immediately before the
HTTP check. Store the dedicated automation credential only in the ignored
`.env.preview.local` file:

```text
VERCEL_AUTOMATION_BYPASS_SECRET=<dedicated Preview automation credential>
```

Then run:

```bash
npm run verify:hosted-root -- --origin https://preview.hwlbysmd.com
```

The verifier sends that credential only to the exact HWL Preview origin and
never prints it. It reads only three first-party URLs, stops at the first broken
boundary, caps HTML at 2 MiB, and requires:

- exact `308` from `/index` to `/`;
- a raw `Location: /` value and exact raw query-preserving Location on the
  redirect canary (absolute or equivalent-looking spellings fail);
- `200` from `/` with the exact `text/html` MIME essence;
- the pinned Next.js channel-1, record-0 bootstrap root and route-tree Flight
  segments to be empty;
- the semantic home header plus homepage, hero-heading, and LIFT markers; and
- the raw hydration-sentinel marker, with no breadcrumb or non-home
  scroll-breath markup in raw server HTML.

Vercel documents the automation bypass header and system environment variable
at
<https://vercel.com/docs/deployment-protection/methods-to-bypass-deployment-protection/protection-bypass-automation>.

The custom-alias HTTP result is authoritative only when the independent
alias-to-SHA checks immediately before and after it match the approved
immutable deployment. Do not widen the bypass allowlist or send its credential
to an automatic or immutable deployment URL. Establish immutable-deployment
proof through authenticated Vercel metadata and, when browser proof is needed,
an authenticated fresh browser session.

The HTTP gate is server-response proof, not browser hydration proof. In a
separate fresh extension-free browser context, attach console and page-error
capture before navigating to the bare `/`, wait for
`[data-hwl-hydration-sentinel][data-hwl-hydrated="true"]`, and require the final
URL `/`, `data-site-header-variant="home"`, the Production canonical link, no
breadcrumb or non-home effects, and zero React 418, hydration mismatch,
first-party console error, or page error. Run the fresh browser check against
the authenticated immutable deployment and the custom alias. Recheck the
alias-to-SHA mapping afterward to close the race window; do not substitute a
mutable alias for immutable deployment identity.

The raw verifier checks the ordered logical Next chunk references and their
script attributes, but it does not fetch or hash those external chunk bytes and
does not prove CSP enforcement or JavaScript execution. The mandatory fresh
browser hydration, console/page-error, and first-party network checks provide
that separate execution evidence; neither gate substitutes for the other.

## Current release verification order

The original Preview bootstrap—staging migrations, initial private-media upload,
the custom Preview hostname, Stripe sandbox objects, and publication of the 11
Cal services—is historical completed setup and must not be repeated as if it
were current work. Exact `828bd43` remains the last pinned Preview, but the
six-file verifier, dependency, and documentation follow-up is local and
uncommitted. Begin
from that delta and reprove every artifact-scoped result after its SHA changes.

1. Finish the six-file local candidate on top of `828bd43`. Require the 60/60
   hosted-root verifier suite, 101/101 Preview-release suite, complete launch test
   set, TypeScript, ESLint, changed-file formatting, production build,
   dependency and tracked-secret checks, and `git diff --check` to pass.
2. After the owner approves the exact diff, commit and push only
   `checkpoint/platform-overhaul-2026-08-20`; never push or merge `main`. Wait
   for exact-SHA CI, then deploy that exact SHA to Preview with commerce closed.
3. Pin the new deployment ID and SHA. Run the hardened hosted-root verifier only
   against `preview.hwlbysmd.com`, bracketed by alias-to-SHA checks. Establish
   immutable-deployment identity with authenticated Vercel metadata, then run
   fresh desktop/mobile hydration and console checks against both the
   authenticated immutable deployment and stable alias, plus route coverage,
   protected-route denial, and a second alias-to-SHA check. Clean up the four
   value-identical general Preview variables only with separate owner approval.
4. With explicit transactional approval, run exact-SHA Preview canaries: one
   sandbox $11.11 LIFT purchase using an approved clean identity (or an approved
   refund/revocation of the historical QA purchase), signed Stripe webhook,
   durable order and entitlement, PDF/video delivery, wrong-user denial,
   duplicate suppression, refund/dispute behavior, and recovery. Reclose
   Preview sales immediately afterward.
5. Reconfirm that DNS still exposes exactly one `_dmarc` TXT value,
   `v=DMARC1; p=quarantine`, before the mail canary. Submit one exact-SHA labeled
   Preview inquiry and prove its new database row, Resend receipt, Proton mailbox
   receipt, replay behavior, and Admin visibility; do not reuse the historical
   `d28be30` or isolated Production inquiry evidence.
6. Before Cal activation, replace the one currently shared
   `CALCOM_BOOKING_LEDGER_READY` Vercel record with isolated Preview and
   Production records and set both to `false`. With provider approval, install
   the restricted Cal API key and signed Preview webhook from the verified
   Shannon account, then enable only the exact Preview target for the canary.
   Run one request → Shannon confirmation → reschedule → cancellation lifecycle,
   proving released availability, organizer/attendee email, webhook receipts,
   aliases, booking history, and no Cal payment. Keep both targets disabled if
   any stage fails: first disable or remove the failed Preview webhook so Cal
   cannot continue retrying a deliberately closed endpoint, then return the
   Preview ledger to `false`, redeploy it closed, and verify both the provider's
   active-webhook inventory and the disabled endpoint response. Production must
   remain `false` throughout.
7. With separate Production-migration approval and both dependent features
   disabled, apply migrations 019 and 020 to Production using the recorded
   preflights and hashes. Verify the 25-argument service-role RPC, review
   constraint, unique index, ledger entries, privileges, and post-apply row
   counts; fix forward without deleting audit evidence if post-commit recovery
   is needed.
8. Verify Production directly rather than carrying forward staging assumptions.
   With separate upload approval, place the canonical 6,036,808-byte PDF and
   46,514,399-byte MP4 into their exact private `member-content` paths, then
   verify their bytes, hashes, signed delivery, and anonymous denial. Also verify
   modern Supabase credentials, live Stripe account/Product/Price/webhook
   identity, Resend sender and recipient, and the intended Production Cal
   identity before installing its still-missing private integration. Both
   approved administrator identities must accept, sign in, and receive their
   exact roles before administrator operations are called live.
9. Build an alias-free Production candidate from the exact tested SHA with all
   five controls pinned closed:
   `COMMERCE_SALES_READY=false`,
   `NEXT_PUBLIC_INQUIRY_COLLECTION_READY=false`,
   `CALCOM_BOOKING_LEDGER_READY=false`,
   `ADMIN_CLIENT_MESSAGING_READY=false`, and
   `ADMIN_SHANNON_HANDOFF_MODE=disabled`. Verify environment shape, hosted root
   and hydration, routes, Auth/Admin boundaries, closed checkout and inquiry
   responses, signed provider webhook reachability, booking display,
   private-media denial, and warning/error logs. This candidate—not Preview—is
   the source of truth for Production configuration.
10. With separate provider approval, provision the restricted Production Cal
    key and a dedicated signing secret while the alias-free Production ledger
    remains `false`. Verify their presence without exposing values. Then enable
    only the Production ledger and redeploy the same source SHA alias-free.
    After that new immutable deployment URL exists, create or retarget the Cal
    webhook—using the same signing secret—to that exact enabled endpoint and
    verify one signed delivery before the lifecycle. Run one request → Shannon
    confirmation → reschedule → cancellation lifecycle and require signed
    webhook rows, canonical aliases and history, released availability,
    organizer and attendee delivery, and no Cal payment. If any stage fails,
    disable the webhook and ledger and redeploy the same SHA closed; retain the
    enabled artifact only after the entire lifecycle passes.
11. Only after owner approval, keep the Cal webhook on the proven immutable
    endpoint while moving `hwlbysmd.com` and `www.hwlbysmd.com` to that exact
    closed, lifecycle-proven candidate. Reprove both aliases before retargeting
    the webhook to the public endpoint, then verify one signed public delivery
    and repeat the public booking and fail-closed canaries. If bookings cannot
    remain safely routed to the immutable endpoint throughout cutover, pause
    new booking submissions for the transition. Keep sales, inquiry, messaging,
    and handoff controls closed. If a post-retarget check fails, first restore
    and verify the webhook on the proven immutable endpoint—or pause new
    bookings if restoration cannot be proven—then roll the aliases back to the
    prior closed deployment.
12. Inquiry collection requires its own approved artifact transition because
    `NEXT_PUBLIC_INQUIRY_COLLECTION_READY` is embedded at build time. Build the
    same source SHA with that control set to `true`; preserve the already-proven
    Production Cal-ledger state while keeping commerce, messaging, and handoff
    closed, and prove the alias-free artifact first. With separate alias and
    submission approval, temporarily assign the public aliases and submit one
    labeled database-first inquiry. Require the exact Supabase row, Resend
    delivery, Proton mailbox receipt, replay behavior, and Admin visibility.
    Retain the inquiry-open artifact only if every check passes. On failure,
    first disable or protect the inquiry-open immutable deployment so it cannot
    accept another submission, then restore the public aliases to the
    already-proven closed candidate and preserve the failed canary evidence.
    Before leaving recovery, prove `POST /api/contact` is closed on both the
    public aliases and the failed immutable artifact.
13. A separate live-money and sales-open approval is required for the LIFT
    transition. Create and verify the same-source-SHA Production artifact with
    commerce open while inquiry state remains at its last separately proven
    value and messaging, handoff, and Cal-ledger controls remain unchanged.
    After an approved public-alias transition, make one $11.11 purchase and
    verify the live charge, signed webhook, Supabase order, entitlement, video
    range playback, PDF, receipt email, replay, and recovery behavior. Keep full
    refund/revocation and dispute semantics proven by sandbox and signed-fixture
    coverage; an optional live full refund requires its own explicit approval,
    and a deliberate live dispute is not a launch canary. Leave sales open only
    on complete success. On failure, first disable or protect the commerce-open
    immutable deployment so it cannot create another Checkout Session; then
    expire every incomplete live canary Session and restore the public aliases
    to the last proven closed artifact. Reconcile any completed charge, order,
    and entitlement under the canary's separately approved remediation
    decision. Before leaving recovery, prove that neither the public aliases nor
    the failed immutable artifact can create a new Checkout Session and that
    Stripe, Supabase, and customer access agree on the final canary state.

## Production gate

Preview success is not Production approval. Do not assign Production aliases,
promote a deployment, run a live charge, or enable real money until the owner
separately approves the Production Supabase boundary, live provider
configuration, and final Preview evidence. The live Stripe account and
canonical $11.11 Product, Price, and webhook already exist; their presence is
not proof of credential validity, signed delivery, entitlement, or a successful
live purchase.
