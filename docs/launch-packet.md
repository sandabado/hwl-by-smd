# HWL by SMD — Launch Packet

**Updated:** August 30, 2026

**Launch decision:** **Not live yet.** The current working tree implements the
single $11.11 LIFT offer, protected fulfillment, a persistent cart, a guarded
Stripe Checkout path, durable scheduled reconciliation, private operations
visibility, and Cal.com-aware booking. An earlier implementation path passed an
isolated real Stripe sandbox purchase, fulfillment, refund, dispute, and replay
journey. The current hardened fulfillment and recovery source passes
provider-free and isolated-database verification but still requires a fresh
real sandbox repeat. The DB-first inquiry journey also passes against the
isolated database. Hosted staging now has migrations 001–014 plus byte-verified
private video and PDF assets; booking, provider email delivery, the current
public Preview, and Production have not yet passed their required end-to-end
launch tests.

**Release boundary:** Work is on
`checkpoint/platform-overhaul-2026-08-20`. The functional launch source is
captured through local commits `1945a0c` and `787b1db`; this packet refresh
follows those commits, and none of the launch commits has been pushed.
This pass rotated the sandbox-only Stripe test key, authorized the Stripe CLI
directly to the canonical sandbox, applied the exact reviewed migrations
012–014 to hosted staging, installed and verified the corrected canonical PDF
in private staging storage, and created ten fail-closed, branch-scoped Preview
configuration records that contain no private provider credentials. It did not
create a domain or persistent webhook, deploy, touch a live Stripe key, or take
real money. Nothing in this launch pass has been pushed to `main`. The current
launch candidate has not been deployed to Preview or promoted to Production.

## Status by Evidence Boundary

<!-- prettier-ignore -->
| Boundary                        | Status                            | Authoritative evidence                                                                                                                                                                                                      |
| ------------------------------- | --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Implemented in the working tree | READY FOR INTEGRATION             | One $11.11 video + PDF offer; persistent cart and sheet; server-validated Checkout; target/account/mode-scoped webhook, authenticated recovery, and durable scheduled recovery; private reconciliation status; protected media routes; Cal.com discovery/embed with manual inquiry fallback; DB-first inquiry route |
| Locally verified                | PASS                              | TypeScript, ESLint, SEO validation, 54 commerce tests, 18 launch-boundary tests, 7 inquiry-boundary tests, 5 booking-boundary tests, 1 accessibility-markup test, 10 Preview-policy tests, and a Next.js 16.3.1 Webpack production build all pass on August 29; a rendered axe sweep also passes on the audited desktop/mobile local journeys |
| Supabase staging                | SCHEMA + ASSETS VERIFIED / E2E PENDING | Project is healthy; the remote ledger contains migrations 001–014 and a current linked dry-run is a no-op. Hosted schema/RPC probes match the 012–014 boundaries. The private 46,514,399-byte video remains verified, and the corrected 6,036,808-byte PDF returned a signed HTTP 200 with byte-identical SHA-256 while anonymous access returned 400. Current-code purchase, inquiry, recovery, and administrator journeys still require hosted/public-Preview repeats |
| Stripe sandbox                  | PROVIDER OBJECTS VERIFIED / CURRENT E2E PENDING | A fresh read-only API check resolves to canonical account `acct_1U9cEQAdcj2oNOF4`; its active test Product/Price are one-time USD 1111 and match the launch catalog. The account still reports `charges_enabled=false`, `payouts_enabled=false`, and `details_submitted=false`. An earlier path passed real sandbox Checkout and lifecycle tests, but the exact current candidate has not repeated that provider journey |
| Cal.com                         | ACCOUNT READY, EVENTS UNPUBLISHED | `HWLbySMD` / `hwlbysmd` is authenticated. The six approved conflict calendars were enabled and `BILLS` remained excluded, but a fresh exact-header public API request still returned `eventTypes: []` and the public profile rendered “No links set up.” Family schedules, locations, group intake, confirmation, and no-Cal-payment settings still require provider verification before publication |
| Inquiry delivery                | PERSISTENCE VERIFIED / HUMAN DELIVERY BLOCKED | Migration 013 is ledger-applied and its private tables/RPC boundary is present in staging. One synthetic hosted submission is durably stored, but its latest notification state is `failed` / provider rejected. There are zero verified administrator profiles, so Shannon currently has neither a confirmed email alert nor verified human inbox access |
| Supabase Auth email             | PROVIDER SETUP / E2E PENDING      | A fresh public settings read shows signup enabled and email confirmation required (`mailer_autoconfirm=false`). Custom SMTP, verified-domain sending, exact Preview/Production redirect allowlists, rate limits, disabled link tracking, and real non-team-email delivery have not been proven |
| Scheduled recovery             | STAGING SCHEMA READY / HOSTED RUN PENDING | Migration 014 is ledger-applied and its private queue/attempt tables plus narrow service-role RPCs are present in staging. The authenticated cron route, shared verifier, durable leases/retries/manual-review state, sanitized reporting, and admin queue view pass locally; a distinct encrypted Preview `CRON_SECRET`, deployed invocation, alert routing, and cadence acceptance remain pending |
| Current launch Preview          | PENDING                           | The remote branch and Ready Preview remain at older commit `555cead`; functional launch source is captured locally through `787b1db` and has not been pushed. Ten of 22 required names are now branch-scoped and fail closed, but private provider credentials, sender settings, fresh cron/rate secrets, stable hostname, and Stripe-reachable automation-bypass-qualified webhook remain absent. `preview.howlbysmd.com` does not currently resolve |
| Production / live money         | PENDING OWNER GATE                | Production publicly serves older commit `145112cd` and checkout truthfully returns 503; Stripe activation and coherent live Product/Price/webhook/Production variables remain incomplete                                    |

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
- Full refunds and newly opened charge disputes revoke access. The
  reconciliation path preserves a revoked tombstone when Stripe delivers
  refund, dispute, and completion events out of order, while historical
  revocation remains valid after a later Product or Price rotation.
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
boundary. `npm run test:commerce` independently passed 54 provider-free policy,
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

The five booking-boundary tests pass for unique canonical slugs, inquiry-only
Wild Glow Express handling, exact Cal.com matching, and published guest limits.
The exact provider-neutral catalog, three proposed schedule families, current
price/location/capacity ambiguities, 12 owner decisions, and pilot publication
sequence are frozen in `docs/calcom-booking-setup.md`. That document does not
invent hours, buffers, notice, locations, payment collection, or publication
authority.
The locally checked zero-event state correctly retained the inquiry flow,
allowed service switching, mounted no calendar iframe, and produced no browser
console error. A live accessible calendar cannot be claimed until at least one
real event is published and tested with keyboard, timezone, confirmation,
rescheduling, cancellation, and conflict-calendar behavior.

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

## Verification — August 29–30

<!-- prettier-ignore -->
| Check                                                               | Result                                                                                                                                                                                                                                                                   |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `npm run typecheck`                                                 | PASS                                                                                                                                                                                                                                                                     |
| `npm run lint`                                                      | PASS                                                                                                                                                                                                                                                                     |
| `npm run validate:seo`                                              | PASS — 21 pages, 21 metadata records, 7 long-form documents                                                                                                                                                                                                              |
| `npm run build:ci`                                                  | PASS — SEO 21 pages / 21 metadata records / 7 long-form documents; Next.js 16.3.1 Webpack build; 63 static pages generated; build manifest includes `/api/cron/commerce-reconciliation`                                                                                   |
| `npm run test:launch-env`                                           | PASS — all 18 synthetic launch-boundary fixtures, including explicit rejection of legacy Supabase browser/server keys, missing/short `CRON_SECRET`, and reuse of the inquiry-rate-limit secret as cron authority, produced the expected exit and message without exposing fixture secrets |
| `npm run test:inquiries`                                            | PASS — 7 provider-free boundary cases cover trusted Vercel addressing, spoof rejection, missing deployed identity, short/missing HMAC authority, keyed fingerprints and payload digests, 1–20 limit clamping/defaulting, and the explicit local-development fallback          |
| `npm run test:booking`                                              | PASS — 5 booking-boundary cases cover 11 unique canonical slugs, Wild Glow Express as inquiry-only, exact slug/title/duration matching for the other 10 services, and published guest limits                                                                                |
| `npm run test:accessibility`                                        | PASS — rendered markup proves the actual LIFT progressbar directly owns its accessible name and truthful 0–7 initial value semantics                                                                                                                                       |
| `npm run test:preview-release`                                      | PASS — 10 offline Preview-policy cases cover repository policy, forbidden Production deploy commands, deployment-gate ordering, exact cron declaration, committed-template secrecy, clean checkpoint state, pre-push ahead state, post-push exact synchronization, dirty-tree rejection, and branch/upstream mismatch rejection |
| `npm run test:commerce`                                             | PASS — 54 provider-free cases: 10 request/limit/namespace policy cases, 22 shared-verifier/expiry/repair cases, and 22 cron/scheduled-worker cases covering exact identity, fail-closed write ordering, customer-bookkeeping isolation, terminal monitoring, leases, report validation, deadline release, sanitized failure categories/responses, and replay repair |
| Targeted Prettier and `git diff --check`                            | PASS                                                                                                                                                                                                                                                                     |
| Changed/untracked launch-file secret-shape scan                     | PASS — no real Stripe, webhook, Supabase, Resend, or JWT secret-shaped values; every shape hit is an explicitly synthetic fixture in the launch/Preview test harness or the packet's redacted fixture note                                                                 |
| `/book` with 0 public Cal.com events                                | PASS — inquiry fallback, service switching, no iframe, no console errors                                                                                                                                                                                                 |
| Current `/beauty/lift` + cart at 390×844                            | PASS — browser inner width 390; document client/scroll width both 375; no horizontal overflow; full-height cart showed one $11.11 LIFT Video + PDF item, included assets, truthful closed-sales checkout, and Stripe/license/refund/help links; zero console errors             |
| Current inquiry-only Wild Glow booking at 390×844                   | PASS — `/book?service=wild-glow-express-facial` rendered guest minimum/default 4, inquiry-only explanation, timing choices, privacy notice, and no live calendar; document client/scroll width both 375; zero console errors                                                   |
| Local desktop/mobile axe sweep                                      | PASS — 18 public, store, legal, auth, and member-entry journeys at 1440×1000 and 390×844 produced zero WCAG 2 A/AA, 2.1 A/AA, or 2.2 AA axe violations after the contrast/progress fixes; six additional checkout-result, protected-auth, and password journeys passed at 390×844; no audited page overflowed or logged a console error |
| Local keyboard and reduced-motion checks                            | PASS — skip navigation moved focus to `main`; mobile navigation and the cart trapped focus, closed with Escape, and restored their triggers; keyboard service activation preserved focus; four representative routes reported zero active animations under reduced motion                                                                  |
| Remaining accessibility/provider verification                      | **NOT RUN** — the local sweep does not prove authenticated paid-library content, the real inquiry-admin inbox, live Cal.com date/slot/confirmation/cancel/reschedule behavior, third-party Stripe Checkout, 200% zoom across every route, or a manual screen-reader journey                                                                  |
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
| Current launch Preview browser journey                              | NOT RUN — current changes are not deployed                                                                                                                                                                                                                               |
| Inquiry persistence → notification fallback                         | PARTIAL PASS — one hosted synthetic inquiry is durably stored before email and the route returned HTTP 202, but Resend rejected the notification; the row is retained with `notification_status=failed`, proving no data loss while also proving human delivery is not ready                                                            |
| Inquiry abuse, privacy, and admin boundaries                        | PASS — malformed/cross-origin/oversize payloads rejected; first five rate claims persisted and sixth returned 429; browser table reads denied; verified admin saw the record; anonymous admin denied                                                                     |
| Launch environment preflight                                        | PASS — explicit deployment target is mandatory; development/Preview closed and sandbox-open fixtures pass; target mismatches, partial/live Preview config, and shared cron/inquiry secrets fail; Production intentionally fails because no separate Production Supabase boundary has been created or owner-approved                         |
| Current configured launch environment                               | BLOCKED — the full local validator's only configuration failure is the invalid `RESEND_API_KEY`; the captions path is optional and may remain unset until a verified VTT object exists. The canonical sandbox account/Product/Price remain valid, while live account activation remains incomplete                                                   |
| Live Vercel Preview configuration inventory                         | BLOCKED — ten required names are now encrypted and branch-scoped to `checkpoint/platform-overhaul-2026-08-20`; one additional required contact recipient exists only as a global Preview record. Eleven effective required names remain absent, and `CONTACT_TO_EMAIL` still lacks branch isolation. No private provider credential has been transmitted in this pass |
| Current public Production safety probe                              | PASS — homepage HTTP 200; unauthenticated LIFT Checkout HTTP 503 with truthful not-ready copy; no charge attempted                                                                                                                                                       |
| Cal.com booking → conflict block → confirmation → cancel/reschedule | NOT RUN                                                                                                                                                                                                                                                                  |

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
| `scripts/test-stripe-fulfillment.ts`            |      28,422 | `41d06f3eab8381e3f58068619a47548fb06da3cbd7de21da70cddf27f1c48f93` |
| `scripts/test-scheduled-reconciliation.ts`      |      23,141 | `ffc098354ade8da03431bf4566d2fe1dd56e1e422c6b19e9d751376e1f8b5d9f` |
| `scripts/test-commerce-database.sql`            |      32,807 | `84e760b0103b63d80300906161594ff32e5c6841da392e7d9be7c5a0f772b821` |
| `scripts/validate-launch-env.ts`                |      14,236 | `1a7cdc0c98a78352bc00b1a23dc1d0a4d83932bf2da52abf5774727dea03370e` |

These hashes identify the source and test bytes that passed the 54
provider-free commerce cases, 18 launch-environment cases, and rollback-only
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
in its arguments. There is still **no persistent Preview event destination**,
and no current-candidate purchase has been run. Local `STRIPE_LIVEMODE=false`
and `COMMERCE_SALES_READY=false` keep the payment boundary in test mode and keep
sales closed.

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
3. Install the verified modern Supabase server credential in encrypted,
   branch-scoped Preview configuration and point Preview at the byte-verified
   canonical private PDF/video objects; repeat the purchase/delivery/refund
   journey on the public custom Preview hostname.
4. Configure and verify the four persistent Preview webhook subscriptions.
5. Exercise the authenticated `paid_pending` reconciliation path on the public
   Preview, including exact auth/origin/order binding, one POST/refresh, the
   60-second cooldown and three-claim ceiling, no fabricated Event receipt, and
   partial-order replay repair. Then exercise the migration-014 scheduled path:
   report, lease, missed-webhook repair, active monitoring, terminal revocation,
   retry exhaustion/manual review, stale-token rejection, and private admin
   visibility. Configure the owner alert destination; `alert_pending` is a
   durable signal but does not itself notify a person.
6. Approve and implement the dispute-closure policy. The current
   `charge.dispute.created` behavior revokes access permanently; no
   `charge.dispute.closed` path restores access after a won dispute.
7. Complete Stripe's private business verification, create the matching live
   Product/Price and webhook, and run the minimal real-money smoke test only
   after separate Production approval.

The latest signed-in live-account check reached Stripe's first activation
screen: United States is fixed and the owner must choose the legal business
type before entering representative, tax, address, and bank details. No legal
choice was guessed or submitted, charges/payouts are not activated, and no live
LIFT Product/Price exists. Sandbox readiness must not be reported as live-money
readiness.

## Cal.com Booking State

| Property                      | Current/last authenticated evidence                    |
| ----------------------------- | ------------------------------------------------------ |
| Account                       | `HWLbySMD`                                             |
| Username                      | `hwlbysmd`                                             |
| Public profile                | `https://cal.com/hwlbysmd` — HTTP 200                  |
| Public event types            | **0** — public API returned `data=[]`                  |
| Timezone                      | `America/Los_Angeles`                                  |
| Existing default availability | Sunday and Wednesday–Saturday, 9:00 AM–5:00 PM Pacific |
| Calendar connection           | Apple Calendar connected                               |
| Destination calendar          | FIREBIRDS                                              |
| Conflict calendars            | None enabled at the last audit                         |
| Virtual location              | Cal Video available and set as default                 |

The existing single schedule does not satisfy the owner's requested booking
system. Launch needs three truthful availability schedules with open slots that
vary by service family:

1. Beauty / aesthetician hours
2. Yoga + Sound hours
3. Consultations / Tarot / virtual hours

Shannon must supply the exact days and hours for all three. The recommended
initial safety posture is to check conflicts against FIREBIRDS, WHOLEBODY,
LIONWOLF, ACTOR, YOGA, and HWL; exclude BILLS; send new bookings to FIREBIRDS;
and require Shannon's confirmation for every service initially. This remains a
recommendation, not an applied provider setting.

`Wild Glow Express Facial` remains inquiry-only. The offer says 15–20 minutes
per guest with a minimum of four, so the website now rejects even an otherwise
matching 20-minute Cal.com event instead of under-reserving Shannon's time. The
owner must approve the truthful total reservation duration, including setup and
turnover, before a future event type and website mapping are reviewed together.

No event types, schedules, conflict settings, buffers, notice windows, intake
questions, or public booking links have been changed in Cal.com. Publishing
requires Shannon's exact hours and the owner's explicit action-time approval.
`Intuitive Tarot Reading` is the current 60-minute pilot recommendation, but
its schedule, Cal Video location, confirmation policy, notice, horizon,
buffers, capacity, intake, cancellation terms, and payment boundary all remain
unapproved. No default limits may be inferred from the existing account
schedule or from this recommendation.

## Inquiry and Resend State

- `CONTACT_TO_EMAIL` is configured locally.
- `CONTACT_FROM_EMAIL` is locally configured in the planned
  `HWL by SMD <hello@howlbysmd.com>` shape. This is configuration evidence only;
  it must not be treated as delivery authority until the domain is verified in
  Resend.
- The present Resend credential did not validate in the provider audit.
- The current browser session reaches the Resend login page, not an
  authenticated account. No account, domain, key, or billing integration was
  created or changed.
- No sender-domain delivery test has passed.
- Public DNS currently returns no MX or TXT record at `send.howlbysmd.com`, no
  TXT at the common `resend._domainkey.howlbysmd.com` selector, no root MX/TXT,
  and no `links.howlbysmd.com` tracking CNAME. A DMARC record does exist at
  `_dmarc.howlbysmd.com` with `p=quarantine`. Resend must first generate the
  exact SPF/MX and DKIM records; DKIM selectors can be account-specific and
  must not be guessed. Official domain guidance:
  <https://resend.com/docs/dashboard/domains/introduction>.
- The launch validator now rejects a `CONTACT_FROM_EMAIL` outside the
  owner-controlled `howlbysmd.com` domain. This prevents an arbitrary sender
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

## Preview Release Candidate — Pending

The newest automatic checkpoint Preview is Ready as deployment
`dpl_AhkgfivPDCowE55gCFdewiC6ax7d`, but it still stops at commit `555cead`.
It is not the current candidate: a protected fetch of `/beauty/lift` still
rendered the superseded $33.33 Complete LIFT offer and The Den card instead of
the single $11.11 launch product. Functional launch source is captured locally
through `787b1db` and has not been pushed.

Ten fail-closed variables now exist only for the checkpoint branch:
`HWL_DEPLOYMENT_TARGET`, `HWL_LOCAL_BUILD`, `NEXT_PUBLIC_SITE_URL`,
`COMMERCE_SALES_READY`, `STRIPE_LIVEMODE`, `CALCOM_PROFILE_URL`,
`INQUIRY_RATE_LIMIT_MAX`, both LIFT storage paths, and
`NEXT_PUBLIC_SUPABASE_URL`. Vercel stores them as sensitive, so their values
cannot be read back and are not used as proof of value correctness. The prior
global Preview `CONTACT_TO_EMAIL` remains effective but is not yet branch
isolated. Eleven required effective names remain absent:
`CONTACT_FROM_EMAIL`, `CRON_SECRET`, `INQUIRY_RATE_LIMIT_SECRET`,
`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `RESEND_API_KEY`,
`STRIPE_ACCOUNT_ID`, `STRIPE_LIFT_GUIDE_PRICE_ID`,
`STRIPE_LIFT_PRODUCT_ID`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and
`SUPABASE_SERVICE_ROLE_KEY`. No private provider credential was transmitted in
this configuration pass.

Production has zero environment-variable records, and
`preview.howlbysmd.com` is not currently assigned to a deployment.

Vercel sign-in protection currently redirects unauthenticated requests on the
branch Preview URL, so a plain Stripe webhook URL cannot deliver there. Keep
Deployment Protection enabled globally. The safe E2E route is an owner-approved
custom Preview hostname such as `preview.howlbysmd.com`, plus a dedicated
Vercel Protection Bypass for Automation secret installed only in the Stripe
sandbox endpoint URL as the `x-vercel-protection-bypass` query parameter. The
same endpoint without that bypass must remain protected. Never commit, print,
or reuse the bypass secret. Vercel explicitly documents this method for Stripe
and other third-party webhooks:
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
any Preview action. Its 10/10 policy fixtures pass. The repository-only
preflight passed on the clean committed candidate after a fresh fetch, proving
the checkpoint branch was ahead and not behind its tracked upstream. The full
environment preflight remains blocked until all 22 branch-scoped values are
available; passing repository policy is not permission to push, deploy, assign
a hostname, or change a provider.

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

Before describing a Preview as the release candidate:

1. Preserve the verified hosted 001–014 ledger, no-op dry-run, schema/RPC
   boundaries, and byte-identical private PDF/video evidence.
2. Install the valid staging Supabase credential and verified private asset
   paths in coherent branch-scoped Preview configuration.
3. Preserve the passing isolated Stripe and inquiry evidence; repeat both
   against hosted staging through the deployed current candidate.
4. Publish and verify Cal.com event types against the approved schedules.
5. Review the diff, exclude unrelated local screenshots, and commit only the
   intended launch candidate on
   `checkpoint/platform-overhaul-2026-08-20`.
6. Push that checkpoint branch and deploy a new Vercel Preview.
7. Configure coherent, branch-scoped Preview-only test credentials and public
   identifiers; never mix a live Stripe key with a sandbox Price or staging
   database. Keep `COMMERCE_SALES_READY=false` for the first deployment.
8. Create the custom Preview hostname and dedicated Vercel automation bypass,
   then install the bypass-qualified Stripe sandbox webhook without disabling
   Deployment Protection globally.
9. Redeploy, then enable commerce only for the coherent test Preview and repeat
   cart, checkout, webhook, entitlement, refund, inquiry, booking, scheduled
   recovery, admin queue visibility, keyboard, mobile, and console checks on
   the actual Preview URL.

No direct push to `main` is authorized or required for this workflow.

## Production and Live Payments — Pending

Production remains closed until all of the following are true:

- Vercel Production currently has zero environment-variable names. Install a
  separately scoped, coherent Production set only after the owner approves the
  database boundary. The provider inventory contains only the staging project;
  no separate Production Supabase project currently exists.

- Stripe verifies the canonical live `HWLbySMD` business and enables charges
  and payouts.
- One live, one-time USD $11.11 Product/Price exists with the same canonical
  LIFT metadata as the sandbox Product.
- The live webhook points directly to
  `https://www.howlbysmd.com/api/stripe/webhook` without a redirect and is
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

1. **Stripe legal business type:** the owner must choose the truthful Stripe
   category for HWLbySMD before live activation can continue; no legal status
   will be inferred from website copy or local files.
2. **Inquiry retention:** choose and publish a specific retention period and
   purge cadence before live inquiry collection; no automatic-deletion claim
   will be made until that policy and implementation are verified.
3. **Administrator bootstrap:** hosted staging has no administrator profile.
   Name the exact intended administrator, verify the matching confirmed
   Auth/profile identity, approve the narrow privilege change separately, and
   prove real inbox access plus logged-out denial.
4. **Cal.com publication:** approve the conflict/destination/confirmation
   settings and publish plan after Shannon supplies the three category-specific
   schedules.
5. **Supabase Auth delivery:** configure custom SMTP from the verified HWL
   sender domain, set the canonical Site URL to `https://www.howlbysmd.com`,
   allow the exact Preview and Production callbacks, disable SMTP link
   tracking, review Auth rate limits, and verify signup confirmation plus
   password recovery with a non-team address.
6. **Tax and purchase-time Terms:** obtain the owner/accountant decision on
   whether the $11.11 digital product is taxable and whether any tax is
   inclusive. Also decide whether Stripe Checkout must collect explicit Terms
   acceptance; the sandbox account's public Terms, privacy, and support URLs
   are currently unset. Do not enable Stripe Tax later without updating and
   testing the fulfillment amount model.
7. **Payment recovery cadence, alert routing, and dispute policy:** choose the
   human destination/owner for durable manual-review alerts and either accept
   the Hobby daily recovery backstop or approve a Pro upgrade plus tested
   15-minute cadence. Separately decide whether a won dispute restores access;
   current behavior fails closed and keeps dispute-created revocation terminal.
8. **Preview provider boundary:** approve creation of the custom
   `preview.howlbysmd.com` hostname, a dedicated Vercel automation-bypass
   secret, and its persistent bypass-qualified sandbox webhook before those
   external changes are made. Deployment Protection remains enabled globally.
9. **Production database:** only one HWL Supabase project currently exists.
   Explicitly approve whether Production may use it or authorize creation and
   verification of a separate Production project; staging must not be silently
   inherited.
10. **Production:** separately approve live environment configuration and
    promotion after reviewing the tested Preview packet.
11. **Git:** no `main` push is authorized. Any later request to merge or push
    `main` must be explicit.

## Private Owner Inputs Still Needed

Do not paste these values into this document, chat output, source files, or
commit history.

- Owner approval for a coordinated retirement of the now-compromised legacy
  Supabase `service_role` JWT after every deployed environment is confirmed on
  the modern key. The modern project secret is verified locally and must later
  be installed through encrypted, branch-scoped Preview configuration.
- A valid Resend API key plus a verified `CONTACT_FROM_EMAIL` sender.
- A distinct, stable, random 32+ character `INQUIRY_RATE_LIMIT_SECRET` in each
  deployed environment. A private local value is already installed and must
  not be copied into source or this packet.
- A distinct, stable, random 32+ character `CRON_SECRET` in each deployed
  environment. It must never reuse the inquiry, Stripe, Supabase, or webhook
  secret.
- Stripe's private business, representative, banking, and tax verification
  details, entered by the owner directly in Stripe.
- Shannon's exact Beauty, Yoga + Sound, and Consultation/Tarot availability,
  plus minimum notice, booking horizon, buffers, daily limits, cancellation,
  location, and intake-question decisions.

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
4. Repeat DB-first inquiry receipt on staging, then configure and verify Resend
   without making email the receipt boundary.
5. Apply the approved Cal.com schedules/settings, publish one pilot service,
   verify it, then publish and test the remaining services.
6. Commit only the reviewed launch candidate on the checkpoint branch, deploy
   a new Preview, and repeat every end-to-end and accessibility check there.
7. Complete Stripe live activation and live provider configuration.
8. Present the final Preview evidence. Promote to Production only after the
   owner's explicit approval, then run a live smoke test and retain the
   fail-closed gate if any check is incomplete.

## Current Recommendation

Keep `COMMERCE_SALES_READY=false`. The product, cart, payment safety model,
protected video, durable payment recovery, private operations visibility, and
booking integration are substantially implemented. The refreshed sandbox
Stripe secret and canonical $11.11 Price/Product pass current read-only API
verification. An earlier implementation path passed canonical Stripe sandbox
purchase, fulfillment, refund, dispute, and replay proof; the exact hardened
source must repeat it. The isolated DB-first inquiry journey passes. Hosted
staging now has the verified 001–014 ledger, current schema/RPC boundaries, and
byte-identical canonical private PDF/video assets. The remaining work is the
public provider and release proof: coordinated retirement of the compromised
legacy Supabase key, a distinct hosted `CRON_SECRET`, valid Resend/sender
configuration, verified administrator bootstrap, actual Cal.com event
publication, owner acceptance of the recovery cadence and alert routing, the
dispute-closure policy decision, the remaining mobile/keyboard/provider
journeys, a current public Preview repeat, live Stripe activation, and explicit
Production approval.
