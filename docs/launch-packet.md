# HWL by SMD — Launch Packet

**Updated:** September 5, 2026

**Canonical domain:** `hwlbysmd.com`, changed by the owner on September 4.
Use `https://www.hwlbysmd.com` for website canonical URLs to match the existing
Vercel apex-to-www redirect, `https://preview.hwlbysmd.com` for the protected
custom Preview, and `hello@hwlbysmd.com` for the configured Preview sender. This
supersedes the old-domain setup instructions and approval request below;
historical `howlbysmd.com` observations are not new-domain verification.

## September 5 Launch Continuation — Current Authority

- **Checkpoint baseline and candidate:** the last externally verified pushed
  checkpoint before this candidate was exact commit
  `8e841fc2db78bf42126c2ee365c0f65228076980` on
  `checkpoint/platform-overhaul-2026-08-20`; local HEAD and its tracked remote
  matched at that checkpoint, and `main` remains untouched. Its dedicated
  partial-refund regression brings the provider-free commerce suite to 55/55.
  The current candidate also includes the September 5 Auth UX and
  dependency-lock repairs described below. Resolve its exact branch SHA, CI,
  and Preview deployment externally after any checkpoint push.
- **Protected Preview:** `https://preview.hwlbysmd.com` is verified in Vercel
  and assigned only to the checkpoint branch. Exact checkpoint `8e841fc` passed
  GitHub CI and deployed READY as `dpl_F2R2enfjMUgT9qwnbj2Yr67apihU`. The
  branch-bound custom hostname advances to each later READY checkpoint, so its
  current deployment ID must still be read from Vercel after any later push.
  Authoritative and public
  DNS return `CNAME cname.vercel-dns.com`; Vercel reports the domain correctly
  configured, and its certificate validates for the hostname.
  Anonymous requests redirect to Vercel SSO while authenticated Vercel access
  reaches the application with HTTP 200. Deployment Protection remains on. A
  purchaser/member journey still requires private Vercel SSO sign-in followed
  by an existing confirmed staging Supabase purchaser login on this exact host;
  that post-login Preview E2E has not yet been performed.
- **Preview configuration:** the branch-scoped configuration now has all 22
  required names, including the domain-restricted Resend credential and the
  dedicated Stripe sandbox webhook secret. The Preview launch preflight passed
  in sandbox-open mode. `COMMERCE_SALES_READY=true` is confined to this
  protected Preview; Production checkout remains closed.
- **Resend:** `hwlbysmd.com` is verified. The active sending credential is
  scoped to that domain and installed as a sensitive checkpoint-branch Preview
  variable. A new valid inquiry has not yet been sent, so database persistence,
  Resend acceptance, deduplication, and Shannon's human inbox receipt still
  require an owner-confirmed end-to-end test.
- **Local visual check:** `/beauty/lift` renders the LIFT hero, public movement
  previews, accessible navigation, and the persistent cart. The cart sheet
  contains one `LIFT — Video + PDF` item at `$11.11`, included assets, and the
  expected license/refund/help links. Meaningful DOM was present and no Next.js
  error overlay appeared. Local development intentionally retains closed-sales
  copy; the protected Preview owns the open sandbox configuration.
- **Auth UX repair:** the candidate source normalizes failed callback links
  to allowlisted, non-provider error copy; preserves only safe same-origin return
  paths; defaults successful callbacks to `/library`; and prevents
  `/update-password` from showing a password form without a verified Supabase
  session. The signed-out/expired path provides a clear fresh-link action. The
  Auth suite passes 16/16, and the repaired login and expired-reset
  states render locally. Hosted custom SMTP, URL allowlists, link-tracking and
  rate-limit settings, a real non-team signup confirmation, and password
  recovery delivery remain unverified.
- **Dependency audit:** the lockfile-only local remediation now reports zero npm
  advisories in both the full tree (560 dependencies) and the production graph
  (141 dependencies). The combined local gate and production build now pass;
  local evidence is not hosted evidence until the exact candidate SHA passes
  checkpoint CI and deploys with the Auth repair.
- **Stripe:** canonical sandbox `acct_1U9cEQAdcj2oNOF4` still contains one
  active Complete LIFT Product, one one-time USD 1111 Price, and the enabled
  four-event checkpoint webhook. A fresh exact-candidate paid/refund/dispute
  journey is still pending. The separate live HWLbySMD parent account
  `acct_1U9cEIPTLuM8Maxa` shows 10% onboarding completion: Business type is in
  progress and every other required section is not started. No live Product,
  Price, webhook, or Production sales flag may be configured until private
  activation is completed and verified and the owner separately approves
  Production.
- **Cal.com:** the ten intended `hwlbysmd` event types remain published with
  manual confirmation and no Cal payments. Fresh public checks show distinct
  available Esthetician, Yoga, and Consultation schedules. The exact Preview
  booking submission, organizer/attendee human email receipts, FIREBIRDS write,
  and a deliberate conflict-suppression check remain action-time tests.
- **Production:** `www.hwlbysmd.com` still serves the older Production artifact
  and its LIFT checkout fails closed. No candidate promotion has occurred.

The remaining launch-critical evidence is a private sign-in to the exact
protected Preview; a fresh sandbox paid journey and protected fulfillment; a
valid database-first inquiry with Resend acceptance and Shannon's human inbox
receipt; the final Cal.com booking/calendar/notification journey; hosted Auth
SMTP plus non-team signup/recovery proof; Stripe live-account activation; and
the owner's explicit Production approval.

## September 5 Full Local Verification

- TypeScript, ESLint, SEO (21 pages, 21 metadata records, seven long-form
  documents), and the Next.js 16.3.1 Webpack production build all pass. The
  build printed 62 route/page entries.
- `npm run test:commerce`: **55/55 passed**, including the dedicated partial
  refund regression that retains active LIFT access without provider calls.
- `npm run test:auth`: **16/16 passed** for stable, non-reflective login feedback
  and hostile same-origin redirect cases.
- `npm run test:preview-release`: **16/16 passed**, including the requirement
  that checkpoint CI retain Auth-boundary coverage.
- Launch-environment fixtures pass 23/23; booking passes 6/6; inquiries pass
  7/7; and the accessibility-markup test passes 1/1.
- Full `npm audit` and `npm audit --omit=dev`: **zero vulnerabilities** against
  the repaired lockfile (560 total dependencies; 141 production dependencies).

This full local gate covers the current Auth/lockfile candidate. By itself it
does not prove a clean checkpoint, exact-SHA CI/deployment, hosted Auth email, signed-in
Preview behavior, a real payment, a real inquiry notification, a real Cal.com
booking, or live-money readiness.

## September 4 Domain Change

- Application canonical metadata, structured-data URLs, sitemap/robots,
  social-image branding, admin domain label, email defaults, environment
  template, and release-validator expectations now target `hwlbysmd.com`.
  Local `NEXT_PUBLIC_SITE_URL` remains localhost and Shannon's receiving
  `CONTACT_TO_EMAIL` is unchanged. The local sender setting changes only the
  planned From address; it does not grant verified sending authority.
- Live Vercel reads confirm `hwlbysmd.com` and `www.hwlbysmd.com` are verified
  and assigned to `hwl-by-smd`. The existing apex-to-www HTTP 308 rule is kept.
  At 10:38 AM PDT the authoritative Porkbun records were `@ A 216.198.79.1`
  and `www CNAME e662837722e1e8d4.vercel-dns-017.com`; Vercel reported both
  hosts correctly configured. Earlier recursive parking answers were stale.
  No website DNS or redirect change was made by Codex.
- At the start of the domain change, `preview.hwlbysmd.com` was not assigned.
  It is now configured and verified as recorded in the current-authority
  section above. Do not silently rewrite existing orders' site URLs or use an
  old-host result as new-host payment evidence.
- Existing apex Porkbun mail-forwarding MX/SPF must be preserved. At 10:38 AM
  PDT the new domain had no authoritative `send`, `resend._domainkey`, or
  `_dmarc` records. Obtain fresh records for this exact domain from Resend;
  never copy the old domain's DKIM value. Do not enable receiving or replace
  the apex mail records as part of sending setup.
- The Resend domain `hwlbysmd.com` was added as
  `74f41a20-cb2c-4902-a9bb-378ed2049143`. Its initial Not Started state is now
  superseded: the domain is verified, the approved mail DNS records coexist
  with the pre-existing receiving records, and a replacement sending key is
  domain-restricted and installed for the checkpoint Preview. A real inquiry
  delivery test is still required before email delivery can be called live.
- At this stage these were source/configuration preparations, not a deployed
  candidate. The current-authority section records the later protected Preview,
  DNS, and email-provider completions. Production promotion and live Stripe
  configuration retain their explicit owner gates.
- Post-change validation passed: 23 launch-environment cases, 15 Preview-policy
  tests, seven reported inquiry tests, 54 commerce tests, six reported booking
  tests, lint, a Next.js 16.3.1 Webpack build, and standalone TypeScript after
  the build. The generated sitemap's 23 URLs all use
  `https://www.hwlbysmd.com`; generated robots references the new sitemap;
  neither artifact contains the retired domain. This began as local artifact
  evidence; the current-authority section records its later Preview deployment.
  It still is not a real email-delivery claim.
- The final checkpoint review re-ran the 23 launch-environment fixtures,
  15 Preview-policy tests, and seven inquiry tests successfully. The earlier
  `RESEND_API_KEY` failure is now cleared for the branch-scoped Preview; the
  verified domain and restricted credential are recorded above. The local
  development browser remains available at `http://localhost:3000/`; this does
  not imply a Production deployment or live-money change.
- A fresh September 4 Cal.com check found all ten exact public event types and
  real 30-day availability, but also reproduced HTTP 403 for the application's
  former server request shape. Cal accepted the same versioned JSON request
  with a normal `User-Agent`. The current code now supplies the stable
  `HWLbySMD/1.0 (+https://www.hwlbysmd.com)` request identity; a deterministic
  header/cache/timeout regression test and the real repaired application
  function both pass, with the latter returning all ten intended slugs. This
  restores server discovery locally. The exact deployed Preview has passed
  protected HTTP routing and boundary checks; its post-login visual booking
  journey remains pending.
- A same-time Stripe read confirms the canonical sandbox still has exactly one
  active Complete LIFT Product and one active one-time USD 1111 Price, and its
  persistent checkpoint webhook remains enabled for the four approved event
  types. The two newest hardened-candidate Sessions remain expired/unpaid with
  no PaymentIntent. Live-parent activation and live objects remain unverified.

**Launch decision:** **Not live yet.** The current working tree implements the
single $11.11 LIFT offer, protected fulfillment, a persistent cart, a guarded
Stripe Checkout path, durable scheduled reconciliation, private operations
visibility, and Cal.com-aware booking. An earlier implementation path passed an
isolated real Stripe sandbox purchase, fulfillment, refund, dispute, and replay
journey. The current hardened fulfillment and recovery source passes
provider-free and isolated-database verification but still requires a fresh
real sandbox repeat. The DB-first inquiry journey also passes against the
isolated database. Hosted staging now has migrations 001–014 plus byte-verified
private video and PDF assets. Cal.com provider configuration is published and
a real request, manual confirmation, reschedule, and cancellation lifecycle has
passed, while human inbox receipt, the protected Preview's final transactional
journeys, and Production have not yet passed their required end-to-end launch
tests.

## September 4, 10:30 AM Continuation — Before the Domain Change

This section records the pre-domain-change checkpoint. The domain-change
section above takes precedence. Historical August 31 tests remain evidence
for that dated path only.

- **Application candidate:** `455edc3a5529535080587988d52f9f22360c0626`
  was clean before this packet refresh. Its five commits after the pushed
  `c74fe61` are documentation-only; no application change, `main` push, or
  Production deployment occurred in this continuation.
- **Fresh local verification:** commerce 54/54, inquiries 7/7, booking 5/5,
  accessibility 1/1, launch-environment fixtures 18/18, and Preview-policy
  10/10 reported cases passed. Lint, SEO (21 pages, 21 metadata records,
  seven documents), Next.js 16.3.1 Webpack build (63 generated pages), and
  post-build standalone TypeScript passed on September 4. `build:ci` omits
  the deployment-environment gate; compilation does not prove deployability.
- **Actual environment:** the full local launch validator still fails only
  on invalid `RESEND_API_KEY`; captions remain an optional accessibility
  follow-up. Sales remain closed and Stripe mode remains sandbox.
- **Stripe and staging:** the current canonical sandbox still has exactly
  one active Product and one active Price: the one-time USD 1111 Complete
  LIFT Video + Guide. The two exact-candidate Sessions are expired/unpaid,
  with no PaymentIntent. Staging contains two matching expired orders and
  zero purchases, Stripe Event receipts, customer bindings, or memberships.
  Both reconciliation jobs are complete/terminal with zero failures or
  manual-review alerts. Older paid/refunded/disputed Stripe fixtures do not
  prove this candidate. Sandbox account flags do not establish the separate
  live account's activation state.
- **Preview:** live Vercel reads still resolve the latest checkpoint attempt
  to failed deployment `dpl_3ZEfnCQJ9MxsYTS6zR98bEZvmiuo` / `c74fe61`.
  Its logs show a pre-compilation environment failure for Resend and the
  then-missing webhook secret. The webhook name now exists among 21 sensitive
  branch-scoped variables; `RESEND_API_KEY` remains absent. Write-only name
  inventory is not value-coherence proof. Production still has zero
  environment-variable records and serves older commit `145112cd`.
- **Resend:** Vercel's raw account API and unfiltered installation listing
  confirm completed Free installation `icfg_JwUVu69AO52KNNTlwWItMAG6`,
  zero selected projects, and zero resources. The installation is not an
  email resource. Current resource discovery offers Pro and Scale only;
  no paid plan was selected. The filtered CLI installation command returned
  an empty list despite the authoritative unfiltered/API record, so it must
  not be used alone to infer removal. Direct Resend is now signed in to the
  `jesse.gawlik` team, whose Domains page shows no domains. Owner confirmation
  of that account boundary and a domain-restricted sending key is pending;
  no domain, credential, or DNS record was created in this continuation.
- **Cal.com:** the ten intended public service links remain discoverable.
  The recorded August 31 request/confirmation/reschedule/cancellation and
  released-slot proof is retained. Human inbox receipt, deliberate conflict
  blocking, and the remaining exact-Preview interaction tests are not proven.

**Next executable gate:** confirm the direct Resend team/domain/key scope,
provision the approved Free sending authority, then install its server-only
key in local and checkpoint-branch Preview configuration. Run coherent
environment preflight before a new Preview attempt; do not manufacture a key,
skip the validator, or reopen public sales to obtain a green deployment.
The subsequent exact-candidate sandbox purchase, signed webhook/entitlement,
inquiry delivery, Auth email/admin access, and Production approval gates all
remain required.

**Release boundary:** Work is on
`checkpoint/platform-overhaul-2026-08-20`. Commit `c74fe61` is the latest
pushed checkpoint; later local documentation commits await the next
authorized checkpoint-only push. `main` remains
untouched.
This pass rotated the sandbox-only Stripe test key, authorized the Stripe CLI
directly to the canonical sandbox, applied the exact reviewed migrations
012–014 to hosted staging, installed and verified the corrected canonical PDF
in private staging storage, published the ten approved Cal.com event types, and
created 21 fail-closed, sensitive, branch-scoped Preview configuration records,
including a dedicated persistent Stripe sandbox webhook signing secret. The
first automatic `c74fe61` Preview build failed safely at the launch validator
because `RESEND_API_KEY` was absent and the hosted Stripe set was not yet
complete. The Stripe set is now complete; Resend remains the sole missing
Preview variable. This pass did not touch a live Stripe key, take real money,
push `main`, or promote anything to Production.

## Status by Evidence Boundary

<!-- prettier-ignore -->
| Boundary                        | Status                            | Authoritative evidence                                                                                                                                                                                                      |
| ------------------------------- | --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Implemented in the working tree | READY FOR INTEGRATION             | One $11.11 video + PDF offer; persistent cart and sheet; server-validated Checkout; target/account/mode-scoped webhook, authenticated recovery, and durable scheduled recovery; private reconciliation status; protected media routes; Cal.com discovery/embed with manual inquiry fallback; DB-first inquiry route |
| Locally verified                | FULL PASS / EXACT-SHA HOSTED PROOF REQUIRED | The combined September 5 tree passes TypeScript, ESLint, SEO, the Next.js 16.3.1 Webpack build (62 printed route/page entries), 55 commerce, 23 launch-boundary, 16 Auth, 7 inquiry-boundary, 6 booking-boundary, 1 accessibility-markup, and 16 Preview-policy tests, plus zero-vulnerability full/production npm audits. Resolve the exact candidate SHA, CI, and Preview deployment externally; this row is local evidence only |
| Supabase staging                | SCHEMA + ASSETS VERIFIED / E2E PENDING | Project is healthy; the remote ledger contains migrations 001–014 and a current linked dry-run is a no-op. Hosted schema/RPC probes match the 012–014 boundaries. The private 46,514,399-byte video remains verified, and the corrected 6,036,808-byte PDF returned a signed HTTP 200 with byte-identical SHA-256 while anonymous access returned 400. Current-code purchase, inquiry, recovery, and administrator journeys still require hosted/public-Preview repeats |
| Stripe sandbox                  | PROVIDER OBJECTS VERIFIED / CURRENT E2E PENDING | A fresh read-only API check resolves to canonical account `acct_1U9cEQAdcj2oNOF4`; its active test Product/Price are one-time USD 1111 and match the launch catalog. The account still reports `charges_enabled=false`, `payouts_enabled=false`, and `details_submitted=false`. An earlier path passed real sandbox Checkout and lifecycle tests, but the exact current candidate has not repeated that provider journey |
| Cal.com                         | OPERATIONAL / INBOX RECEIPT PENDING | `HWLbySMD` / `hwlbysmd` publicly lists the ten exact website event types. A real Signature Facial request entered the organizer's unconfirmed queue with the required guest count and location, passed manual confirmation, moved from 10:00 to 11:00 AM Pacific, and was then canceled. A fresh organizer read removed it from Upcoming, retained it under Canceled, and a fresh public read restored the released 11:00 AM slot. Cal collected no payment. Cal reported sending lifecycle emails, but human inbox receipt is not independently verified. Wild Glow Express remains inquiry-only |
| Inquiry delivery                | PERSISTENCE VERIFIED / HUMAN DELIVERY BLOCKED | Migration 013 is ledger-applied and its private tables/RPC boundary is present in staging. One synthetic hosted submission is durably stored, but its latest notification state is `failed` / provider rejected. There are zero verified administrator profiles, so Shannon currently has neither a confirmed email alert nor verified human inbox access |
| Supabase Auth email             | PROVIDER SETUP / E2E PENDING      | A fresh public settings read shows signup enabled and email confirmation required (`mailer_autoconfirm=false`). Custom SMTP, verified-domain sending, exact Preview/Production redirect allowlists, rate limits, disabled link tracking, and real non-team-email delivery have not been proven |
| Authentication UX              | LOCAL REPAIR VERIFIED / HOSTED E2E PENDING | Failed-link feedback is allowlisted and non-reflective, return paths are same-origin, and password update now requires a verified server session before the form renders. Auth tests pass 16/16 and signed-out states render locally. A real confirmation link, recovery link, and purchaser login still need exact-Preview verification |
| Scheduled recovery             | STAGING RUN VERIFIED / PREVIEW RUN PENDING | Migration 014 is ledger-applied and its private queue/attempt tables plus narrow service-role RPCs are present in staging. On August 31, an authenticated local worker run against hosted staging reported and claimed the two expired current-candidate sandbox orders, resolved both as terminal, and left both jobs complete with zero alerts, errors, or manual-review reasons. A distinct sensitive branch-scoped Preview `CRON_SECRET` exists; deployed Preview invocation, alert routing, and cadence acceptance remain pending |
| Launch Preview baseline         | READY / PROTECTED / TRANSACTIONAL E2E PENDING | The last externally verified checkpoint before this candidate, `8e841fc2db78bf42126c2ee365c0f65228076980`, passed GitHub CI and deployed READY as `dpl_F2R2enfjMUgT9qwnbj2Yr67apihU`; `preview.hwlbysmd.com` is DNS/TLS-verified and protected by Vercel SSO. All 22 required branch-scoped variable names existed, sandbox-open preflight passed, and safe runtime probes passed. Resolve the candidate deployment externally after any push; purchaser sign-in, signed payment, inquiry delivery, and exact-Preview booking remain pending. Production stays closed; `main` is untouched |
| Production / live money         | PENDING OWNER GATE                | Production publicly serves older commit `145112cd` and checkout truthfully returns 503. The canonical live Stripe parent reports 10% onboarding: Business type in progress and the remaining required sections not started. Live Product/Price/webhook/Production variables remain incomplete |

Passing local compilation does not prove provider integration, a paid journey,
or Production readiness. Each boundary above must be verified independently.

## Implemented in the Current Working Tree

### LIFT storefront and cart

- One launch product only: **LIFT — Video + PDF**, **$11.11 one time**.
- PDF-only checkout and The Den membership checkout are intentionally disabled.
- Product buttons add LIFT directly to a persistent cart and open the cart
  sheet without sending the visitor to a separate store page.
- The header exposes a cart trigger with item count and dialog state.
- The cart persists the single launch item and checkout-attempt identifier in
  local storage, synchronizes between tabs, restores a canceled cart, and
  prevents duplicate line items.
- The cart sheet is full-width on small screens and capped at 28rem on larger
  screens. It provides a named dialog, focus placement/restoration, keyboard
  close behavior, live cart announcements, 44px-or-larger primary controls,
  reduced-motion handling, and truthful disabled-checkout copy.
- Checkout stays disabled while `COMMERCE_SALES_READY=false` or any required
  Stripe, Supabase, webhook, Price, or protected-file setting is missing.

These are source-level accessibility and interaction safeguards. A final
keyboard, zoom, screen-reader, and mobile check is still required on the launch
Preview; this packet does not claim third-party Stripe Checkout conformance.

### Authentication feedback and password recovery

- The callback exchanges a valid Supabase code and returns only to a sanitized
  same-origin path, defaulting to `/library`.
- Failed, expired, or denied links are reduced to an allowlisted code and static
  supportive copy. Provider-controlled descriptions and arbitrary query values
  are never reflected into the page.
- `/update-password` verifies the Supabase user server-side before rendering the
  password form. A missing or expired session receives a clear recovery action
  instead of an unauthorized password form.
- The client form rechecks the user before mutation, uses generic failure copy,
  and sends a successful update to `/account`.

The Auth suite passes 16/16 for error allowlisting and hostile redirect
inputs, and the signed-out login/reset states render locally. This candidate
repair is not proof of Supabase custom SMTP, callback allowlist
configuration, non-team confirmation/recovery email delivery, or an
authenticated purchaser journey on the protected Preview.

### Secure payment and fulfillment path

- The server owns the launch catalog and validates the exact Stripe account,
  Product and Price IDs, currency, amount, cadence, Product/Price metadata,
  catalog version, and Stripe mode.
- Checkout is authenticated, same-origin, JSON-size limited, and restricted to
  the single launch product.
- The first release requests immediate card payment only; delayed settlement
  methods are not silently granted access by the synchronous fulfillment path.
- Checkout reservations are scoped by user, product, deployment target, Stripe
  account, and Stripe mode. The isolated database admitted separate
  development and Preview orders, rejected a duplicate Preview reservation,
  and reused only an order with the exact expected `site_url`.
- Checkout timeouts and ambiguous provider retrieval failures no longer claim
  that nothing was charged; the customer is told to check email and account
  history before retrying. The account history includes active, refunded,
  disputed, and cancelled purchases, while entitlement continues to derive
  only from active purchases.
- Webhooks verify Stripe's signature from the raw request body, reject the
  wrong account or test/live mode, enforce target/account/mode Event
  idempotency, and
  validate Checkout, PaymentIntent, Charge, amount, currency, Price, Product,
  user, and order identity before granting access. Webhook input is read into
  the exact `Buffer` used for signature verification and fails closed above
  1,000,000 bytes.
- Because development and Preview share the sandbox Stripe account, a valid
  Event for the other deployment target returns HTTP 200 without a database or
  Event-receipt write. Account/mode metadata corruption remains an error.
- The read-only success GET can render an owned pending or partially recorded
  order. A one-shot, same-origin, authenticated JSON POST then pre-binds the
  exact order and invokes the same authoritative Session/PaymentIntent/Charge
  verifier as the webhook. It is capped at 512 bytes, three lifetime claims,
  and a 60-second server cooldown; the redirect itself never grants access.
- Fulfillment records first-writer provenance (`webhook` or
  `authenticated_reconciliation` or `scheduled_reconciliation`) and time.
  Active entitlement is written only after the paid order and its provenance
  are durably written and re-read; any failed order/provenance transition leaves
  access closed so an idempotent replay can repair it. Non-webhook recovery must
  receive the complete expected identity before it may retrieve provider or
  database state. Neither recovery path fabricates a `stripe_events` row, and
  signed webhook delivery remains primary.
- Live mode requires all four runtime facts together:
  `HWL_DEPLOYMENT_TARGET=production`, `VERCEL_ENV=production`, `VERCEL=1`, and
  `NODE_ENV=production`. Isolated tests remain test-only even if other Stripe
  values are shaped like live configuration.
- Partial refunds retain access; full refunds revoke it. A newly opened dispute
  moves the purchase into `disputed` status and suspends private access pending
  manual review. The reconciliation path preserves refund/dispute state when
  Stripe delivers events out of order, while historical state remains valid
  after a later Product or Price rotation. No automatic
  `charge.dispute.closed` restoration exists.
- Purchases, memberships, Stripe Events, Stripe customers, and checkout orders
  are deployment-target/account/mode scoped. Financial/customer/order rows use
  `ON DELETE RESTRICT` profile foreign keys so an Auth deletion cannot cascade
  away financial evidence. An isolated deletion attempt raised the expected
  foreign-key violation and preserved the user and records.
- Signed Supabase URLs protect the LIFT video and PDF behind authenticated
  entitlement checks.

### Durable reconciliation and private operations visibility

- Migration 014 adds an exact deployment-target/account/mode reconciliation
  queue with immutable report/claim/finish evidence, expiring lease-token
  compare-and-swap, `SKIP LOCKED` concurrency, bounded exponential retry,
  24-hour monitoring of verified-active purchases, and durable
  `manual_review`/`alert_pending` state after exhaustion or inconsistency.
- `GET /api/cron/commerce-reconciliation` requires an exact 32+-character
  Bearer `CRON_SECRET`, verifies the expected Stripe account before leasing
  work, reports before repair, claims at most 10 jobs for 120 seconds, and
  enforces a 45-second internal deadline. Its response contains only a run UUID
  and sanitized aggregate counts.
- The worker reuses the shared provider-authoritative fulfillment and expiration
  paths. It verifies active payments, repairs missed fulfillment idempotently,
  closes expired/refunded/disputed terminal state, preserves existing
  first-writer provenance, and sends provider/identity/database inconsistency to
  durable manual review rather than guessing.
- `/admin/store` exposes recovering, monitoring, and manual-review counts plus a
  sanitized machine-state table through a service-role-only RPC after verified
  Supabase admin authentication. Demo admin sessions never read hosted commerce
  records.
- `vercel.json` schedules the worker once daily at `17 15 * * *`, the maximum
  cadence available to this project's current Hobby plan. The webhook remains
  the immediate primary path and browser reconciliation remains the immediate
  customer-session fallback. A daily recovery backstop is not a short recovery
  SLA; Production requires explicit owner acceptance of that delay or a Vercel
  Pro upgrade and a tested 15-minute schedule.

The database structures needed by checkout reservation and mode separation are
now ledger-applied in staging through migrations 012–014. Migration 012 also
establishes deterministic least-privilege grants instead of relying on legacy
implicit PostgREST table privileges. A fresh isolated database accepted
migrations 001–013 and passed rollback-only commerce schema/state assertions;
migration 014 then passed in disposable PostgreSQL 17.6 with a two-session
`SKIP LOCKED` concurrency check. Current hosted PostgREST/OpenAPI probes now
confirm the distinctive 012–014 tables, columns, and narrow RPCs, while direct
reads of the rate-limit and reconciliation tables retain their intended 403
boundary. `npm run test:commerce` independently passed 55 provider-free policy,
verifier, and scheduled-worker cases. These results still do not constitute the
current public-Preview Stripe, cron, administrator, or browser E2E, so sales
remain closed.

### Cal.com-aware booking

- `/book` fetches Shannon's public Cal.com event types server-side with a
  five-second timeout, strict response validation, and five-minute cache.
- Only an exact published Cal.com slug, title, and fixed duration from the
  website's 11-service catalog is mapped to a service.
- A matching service lazy-loads an inline date/time selector. The embed has a
  visible loading state, failure fallback, local-timezone guidance, a named
  iframe, reduced-motion handling, and an external Cal.com link.
- Missing, unpublished, invalid, mismatched, or unreachable Cal.com data fails
  closed to the existing manual inquiry flow; the website never invents
  availability.
- `Wild Glow Express Facial` is explicitly inquiry-only and cannot be activated
  by a guessed 20-minute Cal.com event. The other ten services require an exact
  canonical slug, title, and duration match.
- The manual inquiry remains available for alternate times even after an event
  type is published.

The six booking-boundary tests pass for unique canonical slugs, inquiry-only
Wild Glow Express handling, exact Cal.com matching, and published guest limits.
Provider setup is now complete for the ten exact-match services: three approved
schedules, six conflict calendars with `BILLS` excluded, `FIREBIRDS` as the
destination, required guest-count and location questions, manual confirmation,
no Cal.com payments or seats, 48-hour notice, 60-minute before/after buffers, a
rolling 30-day horizon, and per-event daily caps. Only Intuitive Tarot Reading
and Moon Oracle Reading offer Cal Video alongside an attendee address; the
other eight use attendee address only. The exact configuration and remaining
customer-journey evidence are recorded in `docs/calcom-booking-setup.md`.

The prior local zero-event check proved the inquiry fallback. A fresh
network-enabled local run now also proves the other side of the boundary:
`/book` discovered all ten exact public events, Signature Facial, Private Yoga,
and Moon Oracle Reading each rendered genuine family-specific dates and times,
and Wild Glow Express remained inquiry-only without a Cal.com link or iframe.
The page returned HTTP 200 with no Next.js error overlay. At 390×844,
`/book?service=signature-facial` rendered enabled dates and six visible time
buttons; `innerWidth`, document client width, and document scroll width were all
390, with no horizontal overflow or Next.js error overlay. Keyboard date and
slot selection was not verified. The separate provider-level test request,
confirmation, reschedule, cancellation, and released-slot lifecycle recorded
below passed. Full launch proof still requires the same submission through the
exact protected Preview, deliberate conflict suppression, the FIREBIRDS calendar
write, keyboard/mobile interaction, and organizer/attendee human email receipts.

### Inquiry durability

- `/api/contact` validates origin, JSON content type, body size, email, message,
  honeypot, and optional booking/retreat fields.
- Non-object JSON payloads are rejected with HTTP 400 rather than reaching
  field handling; checkout uses the same defensive boundary.
- Valid-shaped submissions must atomically claim a database rate-limit slot
  before persistence. The default is five submissions per address per hour;
  only an HMAC fingerprint is stored, never a raw client address.
- The route writes an inquiry to Supabase before attempting email.
- Resend is a best-effort notification layer. A missing or failed notification
  returns a truthful received/pending response after persistence succeeds, so
  email delivery is not the data-loss boundary.
- Provider response bodies and secrets are not written to the inquiry table.
- `/admin/inquiries` gives a verified Supabase administrator a private,
  50-record paginated view of all inquiry records and notification health.
  Resend alerts link through sign-in to the exact inquiry UUID without putting
  submitted contact details in the URL. Demo-preview sessions cannot receive
  live inquiry PII; delayed alerts retain a direct email fallback.

Against a fresh isolated database, this path passed persistence-before-email,
notification-missing fallback, sanitization, honeypot, origin/content/body
validation, malformed input, the five-per-hour boundary, browser-role denial,
verified-admin inbox access, and anonymous-admin denial. No real email was sent
for that test. Migration 013 is now ledger-applied, and hosted probes confirm
the inquiry table plus four narrow service-role RPCs while direct rate-table
access remains denied. The modern Supabase server credential authenticates,
but the real hosted inquiry route, administrator inbox, and Resend notification
still require fresh end-to-end verification.

The current inquiry concurrency and notification-state proof is more specific:

- Two simultaneous records with the same submission ID produced one
  `created=true` and one `created=false`, returned the same inquiry UUID, and
  both reported `payload_matches=true`.
- Reusing that ID with a changed canonical field returned
  `payload_matches=false` without consuming another rate-limit claim. Reusing
  the identical canonical payload with a rotated HMAC digest still returned
  `payload_matches=true`; digest-key rotation is no longer replay authority.
- With a limit of two, two distinct submission IDs stored a count of 2 and the
  third returned `rate_limited`; a forced failed insert rolled its rate claim
  back.
- Twenty simultaneous notification claims produced exactly one winner and 19
  rejections. An accepted completion remained terminal when a later caller
  attempted `audit_unknown`.
- The state machine separately passed `not_configured`,
  `failed/provider_rejected`, `audit_unknown/network_outcome_unknown`, and
  `audit_unknown/provider_receipt_missing`. A five-minute stale attempt moves
  once to `audit_unknown/claim_outcome_unknown`, never reauthorizes sending,
  and remains race-safe against a concurrent completion.
- `anon` has no table or RPC access. `service_role` has inquiry select plus the
  four narrow RPCs, no direct rate-table access, and the browser-policy count
  is zero.
- A host-level honeypot POST returned HTTP 200 with `received=false`. The normal
  valid host-level inquiry's earlier HTTP 503 occurred before migration 013 was
  applied and is no longer current delivery evidence; repeat the request
  against staging before claiming hosted persistence or notification.

## Verification record — August 29–September 5

<!-- prettier-ignore -->
| Check                                                               | Result                                                                                                                                                                                                                                                                   |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `npm run typecheck`                                                 | PASS                                                                                                                                                                                                                                                                     |
| `npm run lint`                                                      | PASS                                                                                                                                                                                                                                                                     |
| `npm run validate:seo`                                              | PASS — 21 pages, 21 metadata records, 7 long-form documents                                                                                                                                                                                                              |
| `npm run build:ci`                                                  | PASS — September 5 combined tree: SEO 21 pages / 21 metadata records / 7 long-form documents; Next.js 16.3.1 Webpack build printed 62 route/page entries and includes `/api/cron/commerce-reconciliation`                                                                |
| `npm audit --omit=dev` and full `npm audit`                         | PASS — September 5 lockfile remediation reports zero vulnerabilities across 141 production dependencies and 560 total dependencies. Pair this local result with exact-SHA checkpoint CI and deployment evidence before relying on it as hosted proof                     |
| `npm run test:launch-env`                                           | PASS — all 23 synthetic launch-boundary fixtures pass, including explicit rejection of legacy Supabase browser/server keys, missing/short `CRON_SECRET`, and reuse of the inquiry-rate-limit secret as cron authority, without exposing fixture secrets |
| `npm run test:inquiries`                                            | PASS — 7 provider-free boundary cases cover trusted Vercel addressing, spoof rejection, missing deployed identity, short/missing HMAC authority, keyed fingerprints and payload digests, 1–20 limit clamping/defaulting, and the explicit local-development fallback          |
| `npm run test:booking`                                              | PASS — 6 booking-boundary cases cover the complete Cal request identity, 11 unique canonical slugs, Wild Glow Express as inquiry-only, exact slug/title/duration matching for the other 10 services, and published guest limits                                                |
| `npm run test:accessibility`                                        | PASS — rendered markup proves the actual LIFT progressbar directly owns its accessible name and truthful 0–7 initial value semantics                                                                                                                                       |
| `npm run test:auth`                                                  | PASS — 16 cases cover stable non-reflective error feedback and safe same-origin redirect handling, including hostile absolute, protocol-relative, encoded slash/backslash/control-character, and malformed inputs |
| `npm run test:preview-release`                                      | PASS — 16 offline Preview-policy cases cover repository policy, forbidden Production deploy commands, deployment-gate ordering, required Auth test coverage, exact cron declaration, committed-template secrecy, checkpoint synchronization, dirty-tree rejection, and branch/upstream mismatch rejection |
| Preview repository preflight before and after push                  | PASS for the recorded baseline — local and tracked remote matched exact commit `8e841fc2db78bf42126c2ee365c0f65228076980`; every later authorized checkpoint-only push must repeat this exact-synchronization proof and be resolved externally |
| `npm run test:commerce`                                             | PASS — 55 provider-free cases: 10 request/limit/namespace policy cases, 23 shared-verifier/expiry/repair cases including partial-refund retention, and 22 cron/scheduled-worker cases covering exact identity, fail-closed write ordering, customer-bookkeeping isolation, terminal monitoring, leases, report validation, deadline release, sanitized failure categories/responses, and replay repair |
| Targeted Prettier and `git diff --check`                            | PASS                                                                                                                                                                                                                                                                     |
| Changed/untracked launch-file secret-shape scan                     | PASS — no real Stripe, webhook, Supabase, Resend, or JWT secret-shaped values; every shape hit is an explicitly synthetic fixture in the launch/Preview test harness or the packet's redacted fixture note                                                                 |
| Prior `/book` fallback with 0 public Cal.com events                 | PASS — inquiry fallback, service switching, no iframe, no console errors; historical fallback proof only, because ten exact event types are now public                                                                                                                     |
| Current website → Cal.com live-selector handoff                     | PASS — a network-enabled local `/book` run discovered all ten exact public events; Signature Facial, Private Yoga, and Moon Oracle Reading rendered genuine Beauty, Yoga + Sound, and Consultation / Tarot dates and times; Wild Glow Express remained inquiry-only; HTTP 200 and no Next.js error overlay |
| Current real Cal.com booking lifecycle                              | PASS — a public Signature Facial request for September 3 entered the authenticated organizer queue as unconfirmed with required guest count and attendee address; the organizer manually confirmed it, rescheduled it from 10:00 to 11:00 AM Pacific with a stated test reason, and canceled it with a stated completion reason. The final provider page says the event is canceled; no Cal payment was configured or collected. Cal stated that lifecycle email was sent, but human inbox receipt remains unverified |
| Current live Cal.com selector at 390×844                            | PASS — `/book?service=signature-facial` rendered enabled dates and six visible time buttons; `innerWidth`, document client width, and document scroll width were all 390; no horizontal overflow or Next.js error overlay. Keyboard and mobile pointer/touch activation were not verified |
| Current `/beauty/lift` + cart at 390×844                            | PASS — browser inner width 390; document client/scroll width both 375; no horizontal overflow; full-height cart showed one $11.11 LIFT Video + PDF item, included assets, truthful closed-sales checkout, and Stripe/license/refund/help links; zero console errors             |
| Current inquiry-only Wild Glow booking at 390×844                   | PASS — `/book?service=wild-glow-express-facial` rendered guest minimum/default 4, inquiry-only explanation, timing choices, privacy notice, and no live calendar; document client/scroll width both 375; zero console errors                                                   |
| Local desktop/mobile axe sweep                                      | PASS — 18 public, store, legal, auth, and member-entry journeys at 1440×1000 and 390×844 produced zero WCAG 2 A/AA, 2.1 A/AA, or 2.2 AA axe violations after the contrast/progress fixes; six additional checkout-result, protected-auth, and password journeys passed at 390×844; no audited page overflowed or logged a console error |
| Local keyboard and reduced-motion checks                            | PASS — skip navigation moved focus to `main`; mobile navigation and the cart trapped focus, closed with Escape, and restored their triggers; keyboard service activation preserved focus; four representative routes reported zero active animations under reduced motion                                                                  |
| Remaining accessibility/provider verification                      | **PARTIAL** — live Cal.com dates and times render for all three schedule families and a prior provider-level Signature Facial request/confirm/reschedule/cancel lifecycle passed. The exact protected Preview still lacks purchaser sign-in, keyboard/mobile Cal submission, deliberate conflict blocking, FIREBIRDS destination write, organizer/attendee human email receipts, authenticated paid-library content, the real inquiry-admin inbox, 200% zoom across every route, and a manual screen-reader journey |
| Current local `/beauty/lift` browser verification                   | PASS — rendered LIFT hero, accessible navigation, cart trigger, public preview, seven movement links, and $11.11 video+PDF copy; meaningful DOM present; no Next.js error overlay or browser warning/error logs                                                                                                                           |
| Local same-origin page probes                                       | PASS — `GET /`, `GET /book`, and `GET /beauty/lift` each returned HTTP 200                                                                                                                                                                                               |
| Contact same-origin boundary                                        | PASS — missing Origin and foreign Origin returned HTTP 403; the correct localhost Origin reached the route and returned a truthful HTTP 503 in the pre-migration host test. Now that migration 013 is applied, hosted persistence requires a fresh repeat                                                                                |
| Checkout same-origin boundary                                       | PASS — missing Origin and foreign Origin returned HTTP 403; the correct localhost Origin reached the route and returned a truthful HTTP 503 because sales are closed; no Session or charge was attempted                                                                 |
| Unsigned local Stripe webhook                                       | PASS — HTTP 400 before processing                                                                                                                                                                                                                                        |
| Unauthenticated local reconciliation cron                           | PASS — after a fresh local `CRON_SECRET` was installed, a request without its bearer returned HTTP 401 before Stripe, Supabase, report, or lease work; route tests also assert `no-store`                                                                                   |
| Stripe deployment-target namespace                                  | PASS — purchases, customers, Events, and orders coexist for development/Preview in one sandbox account; exact-target reads isolate them; valid foreign-target fulfillment performs no DB write; account/mode corruption rejects                                                                                                            |
| Stripe webhook body cap                                             | PASS — raw bytes use the exact signature `Buffer`; payloads above 1,000,000 bytes fail closed                                                                                                                                                                            |
| Financial-record foreign keys                                       | PASS — four profile relationships use `ON DELETE RESTRICT`; isolated Auth deletion raised a foreign-key violation and preserved the user and records                                                                                                                     |
| Trusted client-address resolver                                     | PASS — local fallback, local proxy, trusted Vercel forwarding, spoof rejection, missing deployed identity, and IPv6 cases matched the exact expected outputs                                                                                                             |
| Supabase linked migration inventory                                 | CURRENT APPLIED / NO-OP PASS — the hosted ledger contains 001–014, and a fresh linked `supabase db push --dry-run` reports the database is up to date with no migration, seed, or role work pending                                                                                                                                        |
| Hosted 012–014 schema/RPC boundary                                  | PASS — exact namespace columns and 012 tables/RPC are present; the 013 inquiry table and four RPCs are present with direct rate-table access denied; the 014 private queue/attempt tables and four RPCs are present with direct table reads denied; sanitized status RPC returned HTTP 200 and zero rows                             |
| Corrected canonical PDF in private staging storage                  | PASS — local and hosted `member-content/lift/lift-guide.pdf` are 6,036,808 bytes with SHA-256 `652c3c6eb6e87a44d47e5326e4e3a385d3704596a19020bc75ae318c6c117ad6`; signed GET returned HTTP 200 and byte-identical content; anonymous access returned HTTP 400                         |
| Fresh isolated Supabase reset, migrations 001–014                   | PASS — migrations 001–014 applied in disposable PostgreSQL 17.6; rollback-only schema/state assertions passed; the disposable database/container was removed and hosted staging was untouched                                                                                                                                            |
| Commerce DB isolation/replay assertions                             | PASS — rollback-only target coexistence/isolation; paid-write/provenance repair; refunded-over-disputed monotonicity; durable exact-namespace jobs; immutable attempts; lease-token CAS; bounded retries; monitoring; manual-review alerts; fixtures rolled back                                                                         |
| Concurrent reconciliation claim race                                | PASS — the existing browser claim CAS admitted one claimant; a separate two-session scheduled-queue `SKIP LOCKED` check returned zero rows while the only due row was leased elsewhere                                                                                                                                                |
| Targeted schema/RLS/function assertions                             | PASS — 14 migrations; browser commerce/inquiry/reconciliation access denied; service-role authority limited to the required server tables/RPCs; fixtures rolled back to zero                                                                                                                                                           |
| Concurrent inquiry limiter                                          | PASS — 20 simultaneous claims produced exactly 5 accepts, 15 rejects, and a stored count of 5                                                                                                                                                                            |
| Inquiry idempotency and notification state machine                  | PASS — same-ID record and notification races elected one creator/claimant; canonical mismatch consumed no claim; digest rotation preserved an identical retry; terminal accepted resisted downgrade; all five failure/pending categories and stale/completion CAS passed |
| Stripe sandbox Checkout → signed webhook → entitlement              | PRIOR PATH PASS / CURRENT REPEAT PENDING — real test Session for 1111 cents; webhook HTTP 200; one active purchase/order; success, account, library, course, progress, video, and PDF delivery were verified before the latest shared-verifier hardening                                                                                                      |
| Entitled and anonymous private media                                | PRIOR PATH PASS / CURRENT REPEAT PENDING — video returned a signed 206 range of 1024 bytes; PDF signed download responded; anonymous library/PDF/video access remained blocked before the latest shared-verifier hardening                                                                                                                               |
| Full refund → entitlement revocation                                | PRIOR PATH PASS / CURRENT REPEAT PENDING — full 1111-cent sandbox refund; purchase/order became `refunded`; library, video, and PDF access closed; success page reported revocation before the latest shared-verifier hardening                                                                                                                          |
| Duplicate signed webhook replay                                     | PRIOR PATH PASS / CURRENT REPEAT PENDING — two replays returned HTTP 200 while event and purchase rows remained unique and terminal before the latest shared-verifier hardening                                                                                                                                                                          |
| Dispute and event-order safety                                      | PRIOR PATH PASS / CURRENT REPEAT PENDING — Stripe's dispute test card produced a sandbox Dispute; completion observed the terminal Charge, recorded `disputed`, denied all assets, and the later direct dispute event remained terminal before the latest shared-verifier hardening                                                                      |
| Authenticated reconciliation on public Preview                      | NOT RUN — route/auth/cookie/origin/client refresh and persistent webhook interaction still require the current custom Preview boundary; provider-free shared-helper and isolated DB transition coverage pass locally                                                        |
| Current launch Preview browser journey                              | PARTIAL PASS — custom hostname DNS, TLS, exact deployment mapping, protected redirect, authenticated HTTP 200, application route boundaries, and open-sandbox checkout readiness are verified. The in-app browser reaches Vercel Login; post-login visual, keyboard/mobile, checkout, inquiry, and booking journeys remain pending                                                                    |
| Inquiry persistence → notification fallback                         | PERSISTENCE PASS / DELIVERY RETEST PENDING — one hosted synthetic inquiry remains durably stored after the former provider rejection. `hwlbysmd.com` is now verified and the domain-scoped Resend key is installed in the protected Preview, but no new valid inquiry, accepted provider receipt, stable replay, or human mailbox receipt has been verified                                              |
| Inquiry abuse, privacy, and admin boundaries                        | PASS — malformed/cross-origin/oversize payloads rejected; first five rate claims persisted and sixth returned 429; browser table reads denied; verified admin saw the record; anonymous admin denied                                                                     |
| Launch environment preflight                                        | PASS — explicit deployment target is mandatory; development/Preview closed and sandbox-open fixtures pass; target mismatches, partial/live Preview config, and shared cron/inquiry secrets fail; Production intentionally fails because no separate Production Supabase boundary has been created or owner-approved                         |
| Current configured launch environment                               | PREVIEW PASS / PRODUCTION CLOSED — the exact pushed checkpoint passes Preview post-push preflight with all 22 required branch-scoped names. The canonical sandbox account/Product/Price and open-sales runtime gate are verified; provider value binding and transactional E2E still require a paid journey. Live account activation and a separately approved Production environment remain incomplete               |
| First `c74fe61` automatic Preview build                             | EXPECTED FAIL-CLOSED — `dpl_3ZEfnCQJ9MxsYTS6zR98bEZvmiuo` stopped at the launch validator because `RESEND_API_KEY` and the then-incomplete hosted Stripe set were absent; application compilation/deployment did not proceed                                                    |
| Live Vercel Preview configuration inventory                         | PASS 22/22 NAMES / VALUE E2E PENDING — all required records are sensitive and branch-scoped to `checkpoint/platform-overhaul-2026-08-20`, including the dedicated sandbox webhook secret and domain-scoped Resend key. The READY deployment passed the value-safe environment validator; signed Stripe and accepted Resend delivery still require transactional proof. Production remains at zero environment records |
| Current public Production safety probe                              | PASS — homepage HTTP 200; unauthenticated LIFT Checkout HTTP 503 with truthful not-ready copy; no charge attempted                                                                                                                                                       |
| Cal.com booking → conflict block → confirmation → cancel/reschedule | PARTIAL — the August 31 public Signature Facial request, manual confirmation, reschedule, cancellation, and released-slot provider checks passed. Deliberate conflict blocking and human notification receipt remain unverified; this is not complete launch-Preview proof |

The trusted client-address resolver assertion returned this exact value:

```text
{local:'local-development',localProxy:'203.0.113.8',previewForged:null,previewTrusted:'203.0.113.9',vercelOverride:null,productionMissing:null,ipv6:'2001:db8::1'}
```

This proves the local resolver behavior only: deployed Vercel traffic accepts
the platform-owned `x-vercel-forwarded-for` boundary and does not fall back to
caller-controlled generic proxy headers. It does not prove a hosted request
path until the same boundary is exercised on the launch Preview.

### Launch-environment fixture proof

`npm run test:launch-env` passed these 18 synthetic cases:

1. `development closed`
2. `preview closed without Stripe provider values`
3. `preview sandbox open`
4. `legacy browser fallback fails`
5. `legacy browser shadow fails`
6. `legacy server key fails`
7. `missing explicit target fails`
8. `target mismatch fails`
9. `partial Stripe set fails`
10. `live Stripe key in Preview fails`
11. `wrong Preview Stripe account fails`
12. `wrong Preview Stripe price fails`
13. `missing Resend key fails`
14. `missing cron secret fails`
15. `short cron secret fails`
16. `shared cron and inquiry secrets fail`
17. `unapproved sender domain fails`
18. `Production remains closed without approved database`

The harness also confirmed that no synthetic secret appeared in validator
output. This is configuration-shape proof only; it does not prove provider
objects, hosted variables, webhook reachability, or delivery.

## Supabase Staging — Verified and Pending

**Project:** `lkxppynmdfzljuptauxf`

**Health:** `ACTIVE_HEALTHY`

**Bucket:** `member-content`, private

### Verified staging state

- The current provider inventory contains one HWL Supabase project only:
  `lkxppynmdfzljuptauxf`. No separate Production database project or boundary
  has been created or owner-approved.
- The remote migration ledger contains migrations 001 through 014. A fresh
  linked `supabase db push --dry-run` is a no-op: the database is up to date,
  with no migration, seed, or role work pending.
- Migration 011 remains authoritative for the owner-confirmed single $11.11
  video + PDF offer. Migrations 012–014 now provide the hosted commerce safety,
  private inquiry, and durable reconciliation boundaries used by the candidate.
- Protected video object:
  `member-content/lift/complete-lift-v1.mp4`.
- The hosted video is 46,514,399 bytes and hash-matches the canonical local
  H.264/AAC derivative.
- Direct public storage access is denied; signed range delivery and anonymous
  application denial were previously verified.
- Corrected canonical PDF object:
  `member-content/lift/lift-guide.pdf`.
- The local and hosted PDF are both 6,036,808 bytes with SHA-256
  `652c3c6eb6e87a44d47e5326e4e3a385d3704596a19020bc75ae318c6c117ad6`.
  A signed GET returned HTTP 200 and byte-identical content; anonymous access
  returned HTTP 400.
- A fresh hosted count-only probe found zero `public.profiles` rows with
  `is_admin = true`; an exact lookup for the configured Shannon contact address
  also matched zero profile rows. No unrelated profile data was inspected and
  no account or privilege was created. Verified human access to
  `/admin/inquiries` is therefore a launch blocker.

### Applied migration and source fingerprints

The exact reviewed and ledger-applied migration artifacts are:

| Migration                         | Byte length | SHA-256                                                            |
| --------------------------------- | ----------: | ------------------------------------------------------------------ |
| `012_commerce_launch_safety.sql`  |      15,521 | `dc3816238c0c514541c83ad280c505eed7fe2d3d783a01907ed73efe8a3e5ffd` |
| `013_inquiries.sql`               |      19,067 | `438db68e8787a257136dc1973be293f51ce23b648408304e14b248246b4d0d2c` |
| `014_commerce_reconciliation.sql` |      38,438 | `5cc6d39d4c067be2c3787980b02a894cc5ceff5b232010ca764764a773b418a2` |

The hosted ledger contains each version, the current linked dry-run is a no-op,
and the schema/RPC inventory below confirms their distinctive runtime objects.
The fingerprints remain the source-review boundary; they do not replace a
public-Preview application E2E.

The inquiry route paired with the migration is 18,359 bytes with SHA-256
`7d8f1c3d4c181d18c09af556f1e151cfc490b05a9a752541be1c7a3ac4e465ec`.
That fingerprint binds the locally tested notification-state behavior to the
current route source; it is not hosted execution evidence.

The current commerce verifier and recovery proof are bound to these local
artifacts:

| Artifact                                        | Byte length | SHA-256                                                            |
| ----------------------------------------------- | ----------: | ------------------------------------------------------------------ |
| `lib/commerce/stripe-fulfillment.ts`            |      35,564 | `fed27bc331355934e44b9a7ed6003debd1b2c92c4c68ee47455a4e94d8bc8692` |
| `lib/commerce/scheduled-reconciliation.ts`      |      26,173 | `591dbb9d1bddb2101e1862c4543b16ade7fbee2ccdf2e3dbddfb6f2841886dfa` |
| `app/api/cron/commerce-reconciliation/route.ts` |         382 | `e7613f9f8f7ba533fa0c80f5656040bb267ec11ef3a885b9abbc6003a7b9bcb5` |
| `app/api/checkout/reconcile/route.ts`           |       7,086 | `ddce6fe29199cc78714f37fef995087bc3c61b1054cfd2c9fb5d4332fa3ff1ce` |
| `paid-checkout-reconciler.tsx`                  |       2,457 | `98ffb93dd1aa45f40117148ea2b93b6ad4f0d36d628fcb2b6f72f0ec7ffcb6cd` |
| `scripts/test-stripe-fulfillment.ts`            |      29,851 | `ec8c7f1a403dfdb1ec0b023e0cf4495780193d841b919f43b2615b2846f70459` |
| `scripts/test-scheduled-reconciliation.ts`      |      23,141 | `ffc098354ade8da03431bf4566d2fe1dd56e1e422c6b19e9d751376e1f8b5d9f` |
| `scripts/test-commerce-database.sql`            |      32,807 | `84e760b0103b63d80300906161594ff32e5c6841da392e7d9be7c5a0f772b821` |
| `scripts/validate-launch-env.ts`                |      14,236 | `1a7cdc0c98a78352bc00b1a23dc1d0a4d83932bf2da52abf5774727dea03370e` |

These hashes identify the source and test bytes that passed the 55
provider-free commerce cases, 23 launch-environment cases, and rollback-only
database assertions. They do not replace the pending current-code Stripe
sandbox repeat.

- `012_commerce_launch_safety.sql` is **ledger-applied**. Hosted OpenAPI exposes
  its exact namespace columns on purchases, memberships, and Stripe Events;
  `stripe_customers` and `checkout_orders` both return HTTP 200 with exact count
  `*/0`; and `has_active_den_membership` is present. Current count-only probes
  also return zero purchases, memberships, Stripe Events, or profiles with a
  non-null legacy customer ID.
- `013_inquiries.sql` is **ledger-applied**. `inquiries` returns HTTP 200 with
  exact count `*/0`; the private `inquiry_submission_limits` object exists but
  direct service-role table access returns the intended HTTP 403 / SQLSTATE
  `42501`; and all four narrow inquiry RPCs are present. Live collection still
  requires an owner-approved inquiry retention and purge policy.
- `014_commerce_reconciliation.sql` is **ledger-applied**. The private jobs and
  immutable-attempt tables exist and direct service-role table reads return the
  intended HTTP 403 / SQLSTATE `42501`; all four reconciliation RPCs are
  present; and the sanitized status RPC returned HTTP 200 with zero rows for the
  exact development sandbox namespace. Manual-review rows deliberately have no
  website requeue or acknowledgment RPC; owner/postgres intervention or a later
  audited migration remains required.
- The current linked `supabase db push --dry-run` is a no-op and reports the
  remote database is up to date. Do not reapply or repair migration history.
- The isolated `hwl-by-smd-isolated-test` Supabase project was separately reset
  through migrations 001–013 and passed commerce target isolation, exact-target
  reads, concurrent claim CAS, partial-order repair, terminal monotonicity,
  uniqueness, status, browser denial, service-role, RLS, and atomic inquiry-rate
  checks. Migration 014 separately passed with migrations 001–014 in disposable
  PostgreSQL 17.6, including a two-session `SKIP LOCKED` claim test. Those local
  checks complement, rather than replace, the current hosted schema inventory.
- The configured local `SUPABASE_SERVICE_ROLE_KEY` now contains the project's
  modern `sb_secret_…` key and passed a fresh read-only admin-auth check with
  HTTP 200 against `lkxppynmdfzljuptauxf`. The value remains only in the ignored,
  mode-600 `.env.local`; it is not recorded in source or this packet. The exact
  `@supabase/supabase-js` 2.111.0 admin-client construction used by the app also
  completed a head-only `profiles` count with HTTP 200 and no returned row data.
- A fresh read-only public probe confirms the configured `sb_publishable_…`
  browser key is accepted by Auth. The obsolete local legacy anon value returns
  401 and is not launch authority.
- During the key repair, the Supabase CLI's nominally masked key-list response
  unexpectedly returned the legacy `service_role` JWT in full. Treat that
  legacy server JWT as compromised. The website has been moved to the modern
  secret, but the legacy key has not been disabled or the project JWT secret
  rotated because unknown external deployments could still depend on it. Audit
  every deployed environment first, then obtain owner approval for the
  coordinated legacy-key retirement; do not paste or reuse the legacy value.
  The repository contains no legacy key value, hosted Supabase has no Edge
  Functions, Vercel Production has no configured environment variables, and
  Preview's four variables contain no Supabase name. Those checks reduce but do
  not eliminate the possibility of a third-party or off-Vercel dependency.
  Supabase's official migration guidance says to deactivate legacy keys only
  after manually confirming nothing still uses them; deactivation is reversible:
  <https://supabase.com/docs/guides/getting-started/migrating-to-new-api-keys>.
- The corrected canonical PDF is present at
  `private-content/lift/lift-guide.pdf` and in private hosted storage at
  `member-content/lift/lift-guide.pdf`. The all-page render review confirmed the
  corrected page 6 `Jawline Lift` copy before upload.
- Both canonical copies are 6,036,808 bytes with SHA-256
  `652c3c6eb6e87a44d47e5326e4e3a385d3704596a19020bc75ae318c6c117ad6`.
  A signed hosted GET returned HTTP 200 and byte-identical content. Anonymous
  access returned HTTP 400. The older Downloads export remains noncanonical and
  must not be uploaded or committed.

## Canonical Stripe Boundary

The authenticated Stripe account switcher and Stripe API establish this public
identifier chain:

| Object                  | Public identifier                | Verified state                                             |
| ----------------------- | -------------------------------- | ---------------------------------------------------------- |
| Live parent account     | `acct_1U9cEIPTLuM8Maxa`          | `HWLbySMD`; canonical business account                     |
| Canonical child sandbox | `acct_1U9cEQAdcj2oNOF4`          | `HWLbySMD sandbox (HWLbySMD)` beneath the canonical parent |
| Sandbox Product         | `prod_VACTsFboJAEOF0`            | Active LIFT Product                                        |
| Sandbox Price           | `price_1U9s49Adcj2oNOF4jcyMjyDB` | Active, `livemode=false`, one-time USD 1111 cents          |

The sandbox Price metadata is verified as:

- `hwl_product_id=lift_guide`
- `catalog_version=lift-complete-v2`
- `delivery=video_and_pdf`

The current read-only Stripe API check returned HTTP 200 for the refreshed
local sandbox secret and resolved to canonical account
`acct_1U9cEQAdcj2oNOF4`. It reconfirmed the Price as `active=true`,
`livemode=false`, `type=one_time`, `currency=usd`, and `unit_amount=1111` for
Product `prod_VACTsFboJAEOF0`. Secret values are intentionally omitted. This is
current sandbox provider-object and identity evidence, not live-money,
hosted-application, Checkout, webhook, or fulfillment evidence.

The sandbox API-key page was verified in the authenticated Stripe session. The
standard test secret was rotated after each credential-exposure boundary, and
`.env.local` now contains only the final replacement. A second read-only API
check with that final key reconfirmed the exact account, Price, and Product. No
live key was viewed or changed, and no secret value appears in this packet.

The Stripe CLI is now authorized directly to `HWLbySMD sandbox · sandbox`
instead of the live parent context. One restricted localhost listener is active
for exactly `checkout.session.completed`, `checkout.session.expired`,
`charge.refunded`, and `charge.dispute.created`, forwarding to
`http://localhost:3000/api/stripe/webhook`. Its signing secret is installed only
in local `.env.local`; the dev server was restarted afterward. Process
inspection confirmed the listener has neither `--api-key` nor an API key value
in its arguments. A separate enabled persistent sandbox endpoint now targets
the stable checkpoint alias with a dedicated, non-default Vercel automation
bypass and exactly `checkout.session.completed`, `checkout.session.expired`,
`charge.refunded`, and `charge.dispute.created`. Its fresh signing secret is a
sensitive exact-branch Preview variable; the localhost CLI secret was not
reused. Deployment Protection remains enabled and the unqualified endpoint
returns 401. The latest READY deployment includes the complete branch-scoped
configuration, but no signed delivery/database-receipt or current-candidate
purchase has been exercised on that exact deployment. Local
`STRIPE_LIVEMODE=false` and `COMMERCE_SALES_READY=false` keep the local payment
boundary in test mode and keep local sales closed.

The exact replay, refund, dispute, evidence, and incident procedure is recorded
in [`docs/commerce-operations.md`](commerce-operations.md). That runbook is an
operating boundary, not permission to perform a provider mutation.

### Prior Stripe isolated E2E evidence

The following real sandbox proof was completed before the latest shared
fulfillment-verifier hardening. It remains valuable integration evidence, but
it is not proof that the current exact working-tree bytes have completed the
same provider journey. A fresh current-code repeat is required before Preview
approval.

- An authenticated website request created a real Stripe sandbox Checkout
  Session for exactly 1111 USD cents and returned only the Stripe-hosted HTTPS
  destination.
- Stripe CLI delivered `checkout.session.completed` to the real application
  route and received HTTP 200. The isolated database recorded one mode-scoped
  order, purchase, customer identity, and event.
- The authenticated success, account, library, course, progress, signed video,
  and signed PDF paths passed. Anonymous library/PDF/video access remained
  denied. The video used the actual 46,514,399-byte MP4 and returned a 206 range
  response; the PDF was an explicitly noncanonical 1,508-byte functional
  fixture because the corrected owner asset was unavailable during that prior
  run. The canonical PDF is now byte-verified in private staging storage, but
  the current-code purchase journey has not yet repeated against it.
- A full 1111-cent sandbox refund produced `charge.refunded`, changed both
  order and purchase to `refunded`, closed every private content path, and made
  the success page report revoked access.
- Two signed replays of the same refund event returned HTTP 200 while the event
  and purchase rows remained unique and terminal.
- Stripe's fraudulent-dispute test card created a real sandbox Dispute. The
  Checkout completion handler observed the already-disputed Charge, stored
  `disputed`, and never granted content. The later direct
  `charge.dispute.created` delivery was recorded once and left the terminal
  state unchanged.

### Stripe evidence still required

1. Preserve the now-verified replacement sandbox test secret only in encrypted
   local/Preview configuration; do not paste it into chat, source, or this
   packet. Repeat the exact current-code Checkout/webhook/lifecycle journey.
2. Preserve the now-applied 001–014 ledger and no-op dry-run evidence; repeat
   schema, privilege, queue, and lease behavior through the deployed application
   boundary without reapplying or repairing migration history.
3. Preserve the verified modern Supabase server credential and canonical
   private PDF/video paths in encrypted branch-scoped Preview configuration;
   repeat the purchase/delivery/refund journey on the public custom Preview
   hostname.
4. Preserve the enabled persistent Preview webhook and its four exact
   subscriptions; verify a signed delivery and target/account/mode database
   receipt on the exact current deployment.
5. Exercise the authenticated `paid_pending` reconciliation path on the public
   Preview, including exact auth/origin/order binding, one POST/refresh, the
   60-second cooldown and three-claim ceiling, no fabricated Event receipt, and
   partial-order replay repair. Then exercise the migration-014 scheduled path:
   report, lease, missed-webhook repair, active monitoring, terminal revocation,
   retry exhaustion/manual review, stale-token rejection, and private admin
   visibility. Configure the owner alert destination; `alert_pending` is a
   durable signal but does not itself notify a person.
6. Implement and verify the accepted dispute-resolution runbook. The current
   `charge.dispute.created` behavior suspends access in `disputed` status
   pending manual review; no automatic `charge.dispute.closed` path or audited
   operator restoration control exists after a won dispute.
7. Complete Stripe's private business verification, create the matching live
   Product/Price and webhook, and run the minimal real-money smoke test only
   after separate Production approval.

The latest signed-in live-account check shows 10% onboarding completion:
Business type is in progress and every other required section is not started.
No private value was copied into this packet, charges/payouts are not verified
active, and no live LIFT Product/Price exists. Sandbox readiness must not be
reported as live-money readiness.

## Cal.com Booking State

| Property                      | Current authenticated/public evidence                                          |
| ----------------------------- | ------------------------------------------------------------------------------ |
| Account                       | `HWLbySMD` (`hwlbysmd`)                                                        |
| Public profile                | `https://cal.com/hwlbysmd` lists ten exact-match website events                |
| Timezone                      | `America/Los_Angeles`                                                          |
| Beauty schedule               | `2303131` — Wednesday–Thursday, 10:00 AM–4:00 PM Pacific                       |
| Yoga + Sound schedule         | `2303132` — Friday–Saturday, 9:00 AM–2:00 PM Pacific                           |
| Consultation / Tarot schedule | `2303130` — Sunday, 12:00–5:00 PM Pacific                                      |
| Destination calendar          | `FIREBIRDS`                                                                    |
| Conflict calendars            | `FIREBIRDS`, `WHOLEBODY`, `LIONWOLF`, `ACTOR`, `YOGA`, `HWL`; `BILLS` excluded |
| Confirmation                  | Always required; unconfirmed requests block the slot                           |
| Booking window                | 48-hour notice; 60 minutes before/after; rolling 30 calendar days              |
| Intake                        | Required guest count and required location details; guest invitations hidden   |
| Payments / seats              | Disabled for every event                                                       |

All ten exact repo titles, slugs, and fixed durations are active and public.
Beauty and Yoga + Sound events have a per-event daily cap of two; Consultation
/ Tarot events have a per-event daily cap of three. Intuitive Tarot Reading and
Moon Oracle Reading offer Cal Video or attendee address. The other eight events
use attendee address only. One booking remains one manually reviewed party
request; Cal.com does not calculate group pricing or collect payment.

`Wild Glow Express Facial` remains inquiry-only. The offer says 15–20 minutes
per guest with a minimum of four, so the website now rejects even an otherwise
matching 20-minute Cal.com event instead of under-reserving Shannon's time. The
owner must approve the truthful total reservation duration, including setup and
turnover, before a future event type and website mapping are reviewed together.

Provider publication and the website discovery/embed handoff are complete. A
fresh network-enabled local run rendered genuine public dates and times for
Beauty, Yoga + Sound, and Consultation / Tarot while keeping Wild Glow Express
inquiry-only. The Signature Facial selector also rendered enabled dates and six
visible time buttons at 390×844 without horizontal overflow or a Next.js error
overlay. A clearly labeled real Signature Facial test request then entered the
organizer's unconfirmed queue with the required guest count and location,
passed manual confirmation, was rescheduled from 10:00 to 11:00 AM Pacific,
and was canceled. A fresh organizer read removed the test from Upcoming and
retained it under Canceled; a fresh public read restored the released 11:00 AM
slot. No test appointment remains active. Cal stated that it sent the lifecycle
emails; human inbox receipt, deliberate conflict blocking, and keyboard/mobile
pointer activation still require separate verification.

## Inquiry and Resend State

### Current state

- Resend domain `hwlbysmd.com` is verified. Its DKIM TXT, `send` and `rsend`
  CNAMEs, and DMARC resolve publicly while the domain's pre-existing receiving
  records remain intact.
- The replacement Resend credential is sending-only, restricted to
  `hwlbysmd.com`, and installed as a sensitive variable only for the checkpoint
  branch Preview. The READY deployment passed the environment validator with
  all 22 required names.
- Safe exact-Preview probes reject missing/foreign origins, non-JSON input, and
  malformed payloads before persistence or notification. Inquiry helper tests
  pass 7/7.
- Hosted staging retains one earlier synthetic inquiry with failed notification
  status and no inquiry was lost. There are still zero verified administrator
  profiles.
- Launch proof still requires one owner-confirmed valid Preview inquiry,
  database-first receipt, Resend `accepted`, one-row/one-alert replay, Shannon's
  human mailbox confirmation, and an approved administrator identity. No valid
  inquiry was sent during the current read-only audit.

### Historical setup evidence (superseded where noted)

- `CONTACT_TO_EMAIL` is configured locally.
- `CONTACT_FROM_EMAIL` is locally configured in the planned
  `HWL by SMD <hello@hwlbysmd.com>` shape. This is configuration evidence only;
  it must not be treated as delivery authority until the domain is verified in
  Resend.
- The present local Resend credential did not validate in the provider audit.
- Resend Marketplace terms were accepted and Free provisioning through Vercel
  was attempted. The provider rejected the request because its Marketplace
  Free plan is disabled; only paid Marketplace plans were enabled at the time
  of the check. No paid plan was selected. A direct Resend Free account/key is
  the approved zero-cost path, but owner sign-in and a valid `RESEND_API_KEY`
  are still pending.
- The September 4 new-domain update added `hwlbysmd.com` to the direct Resend
  account. See [Domain Setup](hwl-domain-setup.md) for the exact new CNAME/DKIM
  records; DNS verification and a scoped sending key are still pending.
- No sender-domain delivery test has passed.
- The August 31 old-domain DNS check returned no MX or TXT at `send.howlbysmd.com`, no
  TXT at the common `resend._domainkey.howlbysmd.com` selector, no root MX/TXT,
  and no `links.howlbysmd.com` tracking CNAME. A DMARC record does exist at
  `_dmarc.howlbysmd.com` with `p=quarantine`. Resend must first generate the
  exact SPF/MX and DKIM records; DKIM selectors can be account-specific and
  must not be guessed. Official domain guidance:
  <https://resend.com/docs/dashboard/domains/introduction>.
- The launch validator now rejects a `CONTACT_FROM_EMAIL` outside the
  owner-selected `hwlbysmd.com` domain. This prevents an arbitrary sender
  from satisfying configuration shape; Resend-side domain verification and a
  real delivery test remain separate evidence.
- Migration 013 is ledger-applied, and its private tables plus narrow RPCs are
  present with the intended direct-table denial. A fresh real hosted inquiry
  submission has not yet repeated the isolated persistence proof.
- A private rate-limit secret is installed locally but still needs encrypted,
  environment-specific configuration in Preview and Production.
- The protected inquiry inbox is implemented and the server credential is
  operational, but no hosted administrator identity exists to prove real inbox
  access yet.
- Hosted staging currently has zero administrator profiles, and the exact
  configured Shannon contact address has no profile row. The owner must name
  the intended administrator, complete and verify that exact Auth/profile
  identity, separately approve the narrow privilege change, and prove real
  authenticated inbox access plus logged-out denial before launch.
- The full isolated journey passed with email deliberately unconfigured: a
  valid request persisted first, notification audit became
  `not_configured/configuration_missing`, and the route returned HTTP 202 with
  `received: true`. Five rate-limited requests persisted and the sixth returned
  HTTP 429; direct anon/authenticated table reads were denied; a verified admin
  could read the durable record; an anonymous admin request was redirected.
- A fresh hosted staging submission also returned HTTP 202 and persisted one
  inquiry. Its Resend notification was rejected and the durable row moved to
  `notification_status=failed`; no inquiry was lost. Hosted staging currently
  has zero administrator profiles, so this row is not yet available to a
  verified human inbox user.

The safe launch target is: save the inquiry first, return success after that
save, and use Resend only to notify Shannon. A Resend outage must not lose the
inquiry.

## Preview Release Candidate — Ready and Protected

### Recorded external baseline and current requirements

- Last externally verified pushed checkpoint before this candidate:
  `8e841fc2db78bf42126c2ee365c0f65228076980` on
  `checkpoint/platform-overhaul-2026-08-20`. GitHub CI passed and Vercel
  deployment `dpl_F2R2enfjMUgT9qwnbj2Yr67apihU` reached READY for that exact
  SHA. Resolve the branch alias after any later push rather than treating this
  deployment ID as permanently current. The candidate includes the September 5
  Auth and lockfile repairs; resolve its exact SHA and deployment externally.
- `preview.hwlbysmd.com` is verified, correctly CNAME-configured, TLS-valid,
  and follows the latest READY checkpoint deployment. Deployment Protection
  redirects anonymous traffic to Vercel SSO; authenticated Vercel access reaches
  application HTTP 200.
- All 22 required branch-scoped configuration names exist. Runtime probes show
  the single `$11.11` LIFT offer with `checkoutReady:true`, an anonymous
  same-origin checkout reaching the login boundary rather than readiness 503,
  hostile origins rejected, non-launch membership closed, and unsigned webhook
  input rejected.
- Remaining Preview work starts with private Vercel SSO sign-in and an existing
  confirmed staging Supabase purchaser login on the exact custom hostname, then
  post-login visual/keyboard/mobile verification and the owner-confirmed Stripe,
  inquiry, and Cal.com transactional journeys.

### Historical first-attempt evidence (superseded where noted)

Checkpoint `c74fe61` is pushed to
`origin/checkpoint/platform-overhaul-2026-08-20`; the current local
documentation commits are not yet pushed. The first automatic Preview,
`dpl_3ZEfnCQJ9MxsYTS6zR98bEZvmiuo`, failed safely at the launch environment
validator before application compilation. At that moment both
`RESEND_API_KEY` and the persistent `STRIPE_WEBHOOK_SECRET` were absent, so the
validator rejected the incomplete provider configuration. The last Ready
Preview remains `dpl_AhkgfivPDCowE55gCFdewiC6ax7d` at older commit `555cead`;
it is not the launch candidate.

Twenty-one of the 22 required variables now exist as sensitive records scoped only
to `checkpoint/platform-overhaul-2026-08-20`:

- ten baseline records: `HWL_DEPLOYMENT_TARGET`, `HWL_LOCAL_BUILD`,
  `NEXT_PUBLIC_SITE_URL`, `COMMERCE_SALES_READY`, `STRIPE_LIVEMODE`,
  `CALCOM_PROFILE_URL`, `INQUIRY_RATE_LIMIT_MAX`, both LIFT storage paths, and
  `NEXT_PUBLIC_SUPABASE_URL`;
- six additional non-Stripe records: `CONTACT_FROM_EMAIL`, `CONTACT_TO_EMAIL`,
  `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
  `CRON_SECRET`, and `INQUIRY_RATE_LIMIT_SECRET`; and
- five sandbox Stripe records: `STRIPE_ACCOUNT_ID`,
  `STRIPE_LIFT_PRODUCT_ID`, `STRIPE_LIFT_GUIDE_PRICE_ID`, and
  `STRIPE_SECRET_KEY`, plus the persistent `STRIPE_WEBHOOK_SECRET`.

Vercel's sensitive/write-only storage prevents value readback, so inventory is
not value-correctness or runtime evidence. `RESEND_API_KEY` is the only missing
required name. Marketplace terms are accepted, but Marketplace Free resource
creation was rejected because that plan is disabled; the direct Resend Free
account/key remains pending. The hosted Stripe signing secret belongs to the
dedicated persistent sandbox endpoint; the ephemeral localhost Stripe CLI
authority was not copied into Preview.

Production has zero environment-variable records, and
`preview.hwlbysmd.com` is not currently assigned to a deployment. The
checkpoint branch alone was pushed; no custom-domain, DNS, `main`, or
Production mutation occurred.

Vercel sign-in protection still redirects unauthenticated requests on the
branch Preview URL. Deployment Protection remains enabled globally. A
dedicated non-default Protection Bypass for Automation is installed only in the
Stripe sandbox endpoint URL as the `x-vercel-protection-bypass` query
parameter. The same endpoint without that bypass remains protected. Never
commit, print, or reuse the bypass secret. Vercel explicitly documents this
method for Stripe and other third-party webhooks:
<https://vercel.com/docs/deployment-protection/methods-to-bypass-deployment-protection/protection-bypass-automation>.

`scripts/validate-launch-env.ts` now provides a value-safe configuration gate.
It validates required names and shapes, canonical site/account boundaries,
test/live key coherence, storage paths, inquiry secrets, and the expected
commerce gate without printing any value. Every build requires an explicit,
server-only `HWL_DEPLOYMENT_TARGET`; when Vercel also exposes `VERCEL_ENV`, the
two signals must match. This prevents an optional platform setting from making
a Preview or Production build silently skip its launch gate. The server also
fails Stripe mode closed when that explicit boundary is missing in a production
Node runtime, when either signal is invalid, or when the two signals disagree.
Run the explicit audit with:

```bash
npm run validate:launch-env -- --target=preview --expect-sales=closed
npm run validate:launch-env -- --target=preview --expect-sales=open
npm run validate:launch-env -- --target=production --expect-sales=open
```

The new `scripts/preflight-preview-release.ts` and
`docs/preview-release-runbook.md` add a dry, offline checkpoint policy before
any Preview action. Its current 16/16 policy fixtures pass and require Auth
boundary tests to remain in CI. The repository-only preflight passed on the
clean pushed `8e841fc` checkpoint, where local HEAD exactly matched its tracked
upstream. All 22 branch-scoped Preview names now exist and the deployed
sandbox-open environment preflight passed. Every candidate containing the Auth,
lockfile, or documentation changes must repeat clean repository/full validation
for its own reviewed checkpoint. Passing repository or
configuration policy is not permission to push `main`, promote Production, or
change a provider.

This validator proves configuration shape only. Hosted staging schema and asset
existence are verified separately above; webhook reachability, Cal.com
availability, inquiry delivery, and paid entitlement remain separate E2E gates.
Only one HWL Supabase project currently exists. The Production profile
intentionally remains closed until the owner explicitly approves whether that
project may serve Production or authorizes creation of a separate Production
project; neither choice has been made. The optional captions path is empty by
default and may remain unset until a VTT object and its signed route pass.

The branch-scoped Preview set must include `HWL_DEPLOYMENT_TARGET=preview`, the
staging Supabase URL, publishable and server credentials; sandbox Stripe key,
webhook secret, `STRIPE_ACCOUNT_ID`, `STRIPE_LIFT_PRODUCT_ID`, and Price ID;
both private asset paths; contact/Resend values;
`INQUIRY_RATE_LIMIT_SECRET`; a distinct 32+-character `CRON_SECRET`; the custom
site URL; and explicit false values for Stripe live mode and the first-deploy
commerce gate. A public Cal.com embed needs only the profile URL, not a private
API key.

For the next Preview checkpoint:

1. Preserve the verified hosted 001–014 ledger, schema/RPC boundaries,
   byte-identical private PDF/video evidence, exact custom hostname, 22-name
   branch-scoped configuration, and dedicated protected webhook boundary.
2. Commit and push only the reviewed checkpoint branch after authorization;
   repeat the full local gate, exact upstream synchronization, CI, deployment,
   and alias-to-SHA proof. Do not push `main`.
3. Privately pass Vercel SSO and sign in with an existing confirmed staging
   Supabase purchaser on `preview.hwlbysmd.com`; never share credentials in chat.
4. Repeat the current-candidate cart, sandbox Checkout, signed webhook,
   reconciliation, entitlement, video, PDF, duplicate, partial/full refund,
   dispute, scheduled recovery, and private admin checks on that exact host.
5. Submit one valid inquiry and prove database-first receipt, Resend acceptance,
   stable retry/idempotency, Shannon's human receipt, admin visibility, and
   logged-out denial.
6. Complete a website-originated Cal.com booking and prove manual confirmation,
   deliberate conflict suppression, the FIREBIRDS destination write,
   cancellation/rescheduling, organizer/attendee human emails, keyboard/mobile
   interaction, and fallback behavior.
7. Configure and verify Supabase custom SMTP and the exact URL allowlist, then
   prove signup confirmation and password recovery with a non-team address.
8. Restore `COMMERCE_SALES_READY=false` if any provider, access, notification,
   calendar, isolation, accessibility, or operational check fails.

No direct push to `main` is authorized or required for this workflow.

## Production and Live Payments — Pending

Production remains closed until all of the following are true:

- Vercel Production currently has zero environment-variable names. Install a
  separately scoped, coherent Production set only after the owner approves the
  database boundary. The provider inventory contains only the staging project;
  no separate Production Supabase project currently exists.

- Stripe verifies the canonical live `HWLbySMD` business and enables charges
  and payouts. The September 5 authenticated dashboard shows only 10%
  onboarding completion: Business type is in progress and every remaining
  required section is not started.
- One live, one-time USD $11.11 Product/Price exists with the same canonical
  LIFT metadata as the sandbox Product.
- The live webhook points directly to
  `https://www.hwlbysmd.com/api/stripe/webhook` without a redirect and is
  subscribed to `checkout.session.completed`, `checkout.session.expired`,
  `charge.refunded`, and `charge.dispute.created`.
- Production has a coherent set of live Stripe, Production Supabase, protected
  storage, inquiry, and sender configuration.
- The exact Preview candidate has passed all end-to-end tests.
- Migration 014 is applied and its cron, durable retry/manual-review queue, and
  private admin status view pass in the exact Production namespace.
- The owner either accepts the current Hobby-plan once-daily recovery backstop
  as the documented recovery SLA or upgrades to Pro and verifies a 15-minute
  schedule. The signed webhook remains the immediate primary path in either
  case.
- The owner reviews the Preview evidence and explicitly approves Production
  configuration and promotion.

Only after the Production smoke test passes should
`COMMERCE_SALES_READY=true` be retained in Production. If any entitlement,
webhook, storage, or mode check fails, commerce must remain or return to
fail-closed.

The current public Production alias resolves to deployment
`dpl_6uHzaSNDmqeU1Zmk6CZ5Jg6Yt8f5` at commit `145112cd`, not the present launch
tree. A direct August 29 probe returned HTTP 200 for `/` and HTTP 503 for the
LIFT Checkout route with truthful not-ready copy. Vercel reported no grouped
runtime errors in the preceding seven days. This proves the old site is
publicly reachable and sales are closed; it does not prove the new candidate.

## Owner Approvals Still Needed

The canonical HWLbySMD sandbox account, Product, and $11.11 Price identities
were previously approved and read-verified. The current hardened application
journey still requires a fresh provider repeat. These approvals remain
outstanding:

1. **Stripe live onboarding:** the private flow is 10% complete, with Business
   type in progress and the remaining required sections not started. The owner
   must privately complete the truthful business, representative, banking, tax,
   and identity details; no legal status or private value will be inferred from
   website copy or local files.
2. **Inquiry retention:** choose and publish a specific retention period and
   purge cadence before live inquiry collection; no automatic-deletion claim
   will be made until that policy and implementation are verified.
3. **Administrator bootstrap:** hosted staging has no administrator profile.
   Name the exact intended administrator, verify the matching confirmed
   Auth/profile identity, approve the narrow privilege change separately, and
   prove real inbox access plus logged-out denial.
4. **Supabase Auth delivery:** configure custom SMTP from the verified HWL
   sender domain, set the canonical Site URL to `https://www.hwlbysmd.com`,
   allow the exact Preview and Production callbacks, disable SMTP link
   tracking, review Auth rate limits, and verify signup confirmation plus
   password recovery with a non-team address.
5. **Tax and purchase-time Terms:** obtain the owner/accountant decision on
   whether the $11.11 digital product is taxable and whether any tax is
   inclusive. Also decide whether Stripe Checkout must collect explicit Terms
   acceptance; the sandbox account's public Terms, privacy, and support URLs
   are currently unset. Do not enable Stripe Tax later without updating and
   testing the fulfillment amount model.
6. **Payment recovery cadence, alert routing, and dispute operations:** choose
   the human destination/owner for durable manual-review alerts and either
   accept the Hobby daily recovery backstop or approve a Pro upgrade plus tested
   15-minute cadence. Opened disputes suspend access under the accepted policy;
   document and verify the manual review and resolution path because the app has
   no automatic `charge.dispute.closed` restoration.
7. **Preview transactional proof:** the custom branch domain, dedicated webhook
   bypass, persistent sandbox webhook, verified Resend domain, and restricted
   sending credential now exist while Deployment Protection remains enabled.
   Reconfirm at action time the sandbox payment, valid inquiry, and Cal.com
   booking submissions needed to prove signed delivery, staging receipt,
   fulfillment, destination-calendar behavior, and human notifications.
8. **Production database:** only one HWL Supabase project currently exists.
   Explicitly approve whether Production may use it or authorize creation and
   verification of a separate Production project; staging must not be silently
   inherited.
9. **Production:** separately approve live environment configuration and
   promotion after reviewing the tested Preview packet.
10. **Git:** no `main` push is authorized. Any later request to merge or push
    `main` must be explicit.

## Private Owner Inputs Still Needed

Do not paste these values into this document, chat output, source files, or
commit history.

- Owner approval for a coordinated retirement of the now-compromised legacy
  Supabase `service_role` JWT after every deployed environment is confirmed on
  the modern key. The modern project secret is verified locally and installed
  as a sensitive checkpoint-branch Preview record; Production remains empty.
- Human confirmation that the next valid Preview inquiry reaches Shannon's
  intended mailbox. The direct Resend domain and restricted Preview credential
  are now configured; do not paste or copy that secret into chat or source.
- Private sign-in to Vercel SSO and an existing confirmed staging Supabase
  purchaser account on `https://preview.hwlbysmd.com`. Do not place either
  credential in chat; post-login purchaser E2E remains unverified until that
  browser session exists on the exact hostname.
- Private Supabase Auth review confirming custom SMTP, the canonical Site URL and
  exact callback allowlist, disabled link tracking, and appropriate email rate
  limits, followed by one non-team signup-confirmation and password-recovery
  delivery test.
- Distinct `INQUIRY_RATE_LIMIT_SECRET` and `CRON_SECRET` values are installed as
  sensitive checkpoint-branch Preview records. Production still needs its own
  independently generated values after separate approval; neither value may be
  copied into source, this packet, or another environment.
- Stripe's private business, representative, banking, and tax verification
  details, entered by the owner directly in Stripe.
- Shannon's cancellation, rescheduling, no-show, and late-arrival terms for the
  now-published Cal.com services.

## Launch Sequence

1. Preserve the verified staging ledger 001–014, current no-op dry-run,
   commerce/inquiry/reconciliation schema boundaries, and byte-identical private
   PDF/video evidence; do not reapply or repair migration history.
2. Install the already-verified modern Supabase secret and private asset paths
   only through encrypted branch-scoped Preview configuration.
3. Repeat the previously passing prior-path Stripe sandbox purchase, refund,
   dispute, and replay journey against the public custom Preview boundary using
   the current hardened candidate. Run the scheduled report/repair/monitoring
   path and verify private admin visibility and manual-review alert routing.
4. Repeat DB-first inquiry receipt on staging, then verify the configured Resend
   delivery without making email the receipt boundary.
5. Preserve the published Cal.com configuration and test all three schedule
   families through the website, including conflict blocking, manual
   confirmation, cancellation, rescheduling, and notification delivery.
6. Preserve the reviewed, pushed checkpoint candidate and its READY protected
   Preview; complete the remaining post-login end-to-end and accessibility
   checks on that exact deployment.
7. Complete Stripe live activation and live provider configuration.
8. Present the final Preview evidence. Promote to Production only after the
   owner's explicit approval, then run a live smoke test and retain the
   fail-closed gate if any check is incomplete.

## Current Recommendation

Keep `COMMERCE_SALES_READY=false` in Production. The protected checkpoint
Preview is intentionally open only to Stripe sandbox testing. The product,
cart, payment safety model,
protected video, durable payment recovery, private operations visibility, and
booking integration are substantially implemented. The local Auth repair now
fails invalid links safely and gates password updates on a verified session;
its 16/16 boundary suite passes, but hosted SMTP and email-link E2E do not. The
refreshed sandbox
Stripe secret and canonical $11.11 Price/Product pass current read-only API
verification. An earlier implementation path passed canonical Stripe sandbox
purchase, fulfillment, refund, dispute, and replay proof; the exact hardened
source must repeat it. The isolated DB-first inquiry journey passes. Hosted
staging now has the verified 001–014 ledger, current schema/RPC boundaries, and
byte-identical canonical private PDF/video assets. The remaining work is the
public provider and release proof: private sign-in to the exact protected
Preview, coordinated retirement of the compromised
legacy Supabase key, deployed cron execution, valid inquiry delivery and human
inbox receipt, verified administrator bootstrap, Cal.com website booking E2E,
owner acceptance of the recovery cadence and alert routing, the dispute manual
review/resolution runbook, the remaining post-login mobile/keyboard/provider
journeys on the current protected Preview, completion of the currently 10%
Stripe live onboarding, live provider activation, and explicit
Production approval.
