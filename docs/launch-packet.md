# HWL by SMD — Launch Packet

**Updated:** September 12, 2026

**Canonical domain:** `hwlbysmd.com`, changed by the owner on September 4.
Use `https://www.hwlbysmd.com` for website canonical URLs to match the existing
Vercel apex-to-www redirect, `https://preview.hwlbysmd.com` for the protected
custom Preview, and `hello@hwlbysmd.com` for the configured Preview sender. This
supersedes the old-domain setup instructions and approval request below;
historical `howlbysmd.com` observations are not new-domain verification.

## Current authority snapshot — read this first

All dated sections below remain evidence history. This table is the controlling
status for the current release decision.

| Surface              | Current authority                                                                                                                                           | Status                                                                                                                                                                                                                 |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Local candidate      | Clean `checkpoint/platform-overhaul-2026-08-20` at exact SHA `45b864c862df6ef43083c3d12f2b59785283d88e`, synchronized with its remote before this dated documentation correction | All 520 repository cases, lint, TypeScript, SEO for 21 pages, `git diff --check`, and the Next.js 16.3.4 Webpack production build pass. The documentation and CI corrections made after that verification are local until separately approved. |
| Preview              | READY deployment `dpl_DhAiuL4EMEZ3K3Rc7UK7Ctjt5Jim`, exact SHA `45b864c862df6ef43083c3d12f2b59785283d88e`, assigned to protected `preview.hwlbysmd.com` | The homepage and booking route render, all eleven services remain discoverable, and an Intuitive Tarot calendar currently exposes live times. This exact SHA still lacks a fresh end-to-end sandbox receipt and fulfillment canary. |
| Production           | Public aliases remain on independently recorded deployment `dpl_HMtiyuJNF5unFUY9K6uWkiWZ4y4i`, commit `6a260bcfa7c752562be264d1a077013fc8ff9f4d`, with commerce closed | No exact-`45b864c` Production deployment, alias reassignment, or sales opening is authorized. |
| Booking              | All 11 Cal.com services expose live dates and times with manual confirmation and no Cal payment                                                             | Cal still shows one Primary and one Unverified account email. Complete the pending `shannon@hwlbysmd.com` verification before relying on the private admin API identity.                                               |
| Booking history      | Cal.com still shows “Create your first webhook”; HWL booking-ledger readiness remains disabled                                                               | Public scheduling works, but My Account/Admin cannot promise synchronized lifecycle history until the signed webhook and request → confirm → reschedule → cancel canary pass.                                 |
| LIFT commerce        | One active $11.11 video + PDF product, strict checkout/webhook code, deterministic Stripe receipts, private media, and prior sandbox fulfillment evidence exist | The exact current candidate still needs a fresh approved sandbox purchase; Production still needs the owner-approved live $11.11 canary. Public sales remain closed.                                                  |
| Contact and retreats | Preview renders the durable inquiry path; recent Resend records show inquiry alerts to `shannon@hwlbysmd.com` as Delivered                                   | Human inbox handling remains unproved. Public Production inquiry collection stays closed until a monitored destination and end-to-end receipt are verified.                                                           |
| Release authority    | The owner approved only exact SHA `45b864c862df6ef43083c3d12f2b59785283d88e` for the checkpoint branch and Vercel Preview                                   | `main`, Production, public domains, provider roles, and open sales remain outside the current authorization.                                                                                                          |

## September 12 Exact-SHA Preview and Launch-Gate Recheck

- GitHub and the clean local checkpoint matched exact SHA
  `45b864c862df6ef43083c3d12f2b59785283d88e`; `main` remained unchanged.
  Vercel independently reports that SHA as the latest READY branch Preview and
  assigns `preview.hwlbysmd.com` to it.
- Fresh local verification passed all 520 repository cases, lint, TypeScript,
  SEO for 21 pages, and the 63-route Next.js 16.3.4 Webpack production build.
  The first parallel TypeScript invocation raced the build-generated `.next`
  types; the required sequential post-build invocation passed cleanly.
- The protected Preview homepage exposes LIFT in both the navigation and hero.
  Its booking route renders the Cal.com month selector and live Intuitive Tarot
  times in the visitor's timezone without taking payment.
- Cal.com still has zero webhooks. Its account UI still presents one Primary
  email and one Unverified email, so the pending Shannon identity change is not
  complete. Booking can operate publicly, but Den/Admin lifecycle history is
  not yet connected.
- Production Supabase still shows both approved administrator identities as
  unconfirmed and never signed in. Their profiles remain ordinary members.
  Resend shows Shannon's latest account confirmation Delivered and Ghosthand's
  confirmation Bounced; `ghosthand.studio` requires working human mail routing
  before it can be the recovery destination or initial super administrator.
- The next controlled sequence is: human email confirmations; audited role
  bootstrap; signed Cal webhook and lifecycle canary; exact-SHA alias-free,
  sales-closed Production deployment; one owner-approved live $11.11 purchase;
  and only then a separately approved public alias and sales opening.

## September 10 Booking, Brand, and Email Polish — Local Working Tree

This section records the current uncommitted local working tree. It does not
replace the immutable Preview evidence below and does not authorize a Preview
push, Production promotion, or `main` update.

- **Booking viewport:** the duplicate standalone booking hero and two-item step
  rail are removed. One compact, softly contrasted masthead now shares the
  global `max-w-7xl` content spine with every service section and card. The
  visible page keeps a single `h1`, category `h2` headings, 44-pixel category
  jump targets, and larger duration/format metadata.
- **Catalog visibility:** all eleven Beauty, Yoga + Sound, and Tarot + Reiki
  services render in the initial document. The category controls are jump
  links, not content filters, and every service has a distinct lightweight
  brand sigil rather than a repeated photograph.
- **Reiki appointment truth:** authenticated Cal.com event `6876527`
  (`reiki-aromatherapy-healing`) now uses the organizer location `HWL Beauty,
Palm Springs, CA`, displays that location on its booking page, remains free
  at booking, and requires Shannon's confirmation. The public form showed an
  available date/time selector plus only name, email, and optional notes; it
  did not ask for an attendee address or guest count. No appointment was
  submitted during this verification.
- **Schedule clarity:** before the embed, the website now restates the selected
  service, duration, price, Shannon Mary Dixon, and the safe location label.
  Cal.com's repeated event-detail panel is hidden so its live month grid and
  times begin within the first mobile viewport.
  Cal.com's native review state remains the single authority for the selected
  date/time and final `Confirm` action; the website does not add a competing
  submit control.
- **Purpose-built imagery:** the homepage Body door, retreat group-practice
  scene, seasonal editorial images, and Store hero now use existing
  offer-specific generated or editorial assets. The Store hero depicts the
  currently purchasable LIFT video rather than repeating a category image.
- **Transactional email presentation:** all direct Resend senders use one
  image-independent HWL by SMD HTML shell with a matching text alternative,
  accessible preheader/article structure, warm neutral and copper styling,
  one clear action, and restrained site footer. Provider identities,
  recipients, and readiness gates are unchanged.
- **Local verification:** rendered `/book` and the Reiki schedule route passed
  browser and accessibility-tree review; live Cal.com dates and times loaded.
  TypeScript, full ESLint, SEO validation, the Next.js 16.3.4 Webpack production
  build, all `492/492` executed repository boundary cases, the production
  dependency audit with zero known vulnerabilities, and `git diff --check`
  passed. The local development server remains available at
  `http://localhost:3000`.

## September 9 Security-Patched Preview Purchase — Current Candidate

This section records the current checkpoint and supersedes older Preview
deployment identifiers. It does not authorize a Production promotion or a
`main` push.

- **Exact candidate:** checkpoint commit
  `4ea17b40af05f43a32b9a3fdac65f986151d2869` updates Next.js and
  `eslint-config-next` to `16.3.4`, the transitive Sharp runtime to `0.35.4`,
  and the `js-yaml` override to `4.3.2`. Local lint, TypeScript, SEO, the full
  production build, all 356 launch-boundary tests, `git diff --check`, and the
  current production-dependency audit passed; the audit reported zero
  vulnerabilities. Exact-SHA GitHub Actions run `34405555776` passed the same
  locked-install, audit, test, and production-compile sequence. `main` was not
  pushed or merged.
- **Exact protected Preview:** Vercel deployment
  `dpl_7Vc1qbMZYRHoQDoxd2haNahQpucP`
  (`hwl-by-n0pjc3pn5-whole-body-earth.vercel.app`) was READY, named the exact
  checkpoint SHA in its Git metadata, and owned the protected
  `https://preview.hwlbysmd.com` branch alias during the E2E verification. Its
  real Preview build passed the environment gate with sandbox sales open,
  inquiries closed, and Cal.com booking history disabled. Vercel advances the
  branch alias on later checkpoint pushes, so resolve its current deployment
  separately instead of substituting the mutable alias for this immutable
  evidence ID. No Production alias or environment changed.
- **Hosted application canaries:** `/`, `/login`, and the Wild Glow booking
  route returned HTTP 200; anonymous `/library` and LIFT downloads redirected
  to login; anonymous LIFT video returned HTTP 401; and an unsigned Stripe
  webhook returned HTTP 400. The signed-in booking page rendered the exact
  Wild Glow Cal.com embed and an enabled 10:00am appointment time. Vercel
  reported no runtime errors during the verification window.
- **Approved sandbox purchase:** one signed-in staging user completed the
  `$11.11` LIFT purchase through hosted Stripe Checkout. Stripe independently
  reports a complete, paid, test-mode Checkout Session; a succeeded
  PaymentIntent; and a paid, unrefunded Charge, each for exactly 1,111 cents
  ($11.11 USD) and the exact `preview` / `lift-complete-v2` metadata. The
  hosted checkout route returned HTTP 200 and the signed Stripe webhook
  returned HTTP 200.
- **Durable fulfillment:** the exact Session maps to one `paid` Preview order
  and one `active` purchase in staging, under sandbox account
  `acct_1U9cEQAdcj2oNOF4`, Product `prod_VACTsFboJAEOF0`, and Price
  `price_1U9s49Adcj2oNOF4jcyMjyDB`. Fulfillment source is `webhook`; the order
  is fulfilled and has a PaymentIntent. Replaying the success page preserved
  exactly one order and one purchase.
- **Entitled delivery:** the purchaser's private library exposed the LIFT
  course. Its protected video endpoint issued a signed redirect; the browser
  loaded the 234.526-second video to ready state 4 and played it past 1.3
  seconds without media error. The lesson exposed its protected Download Guide
  control and the application issued its signed HTTP 307 download. The private
  source object independently returned HTTP 200 as a 6,036,808-byte
  `application/pdf` beginning `%PDF-`, SHA-256
  `652c3c6eb6e87a44d47e5326e4e3a385d3704596a19020bc75ae318c6c117ad6`.
  After purchase, the LIFT offer stopped presenting checkout and instead
  presented the unlocked library state.
- **Resend credential hygiene:** under the existing owner authorization, the
  legacy `Onboarding` API key was deleted in Resend. The current provider
  inventory contains exactly three named operational keys:
  `HWLbySMD Production Auth SMTP`, `HWLbySMD Production App`, and
  `HWLbySMD checkpoint Preview`. No token value was printed or committed. This
  cleanup does not by itself prove receipt in Shannon's human-monitored inbox.
- **Remaining release boundary:** Production remains on
  `dpl_HMtiyuJNF5unFUY9K6uWkiWZ4y4i` with `COMMERCE_SALES_READY=false`.
  Production promotion and the owner-driven live `$11.11` canary remain
  unapproved for this candidate. Public inquiries, human inbox receipt,
  administrator activation, and Cal.com booking-history sync retain their
  separately documented gates.

## September 9 Supabase Key-Retirement Revalidation — Current Authority

This section supersedes older deployment identifiers and every older statement
below that says the Production legacy Supabase API keys remain enabled.

- **Provider state:** Production project `qwprhsrwiihfllmgallr` exposes a single
  reversible control for the legacy JWT-based `anon` and `service_role` pair;
  Supabase does not expose separate per-key retirement controls. During the
  revalidation window the dashboard first reported that its JWT update was in
  progress. After that provider operation settled, it exposed **Re-enable
  JWT-based API keys**, confirming that the pair is disabled. No second mutation
  or rollback was attempted.
- **Direct key canaries:** the default modern `sb_publishable_...` key returned
  HTTP 200 from Auth settings. The default modern `sb_secret_...` key returned
  HTTP 200 from a bounded profile read and HTTP 200 from a private
  `member-content` listing containing one bounded result. Direct requests with
  the retired legacy `anon` and `service_role` keys each returned HTTP 401. No
  credential value was committed or retained in a temporary file.
- **Current application postflight:** the canonical Production site returned
  HTTP 200 for `/`, `/login`, and the Wild Glow booking page; HTTP 307 for
  anonymous `/library` and LIFT PDF requests; HTTP 401 for anonymous LIFT video;
  the intentional HTTP 503 for a valid same-origin checkout request while sales
  remain closed; and HTTP 400 for an unsigned Stripe webhook. The audit created
  no appointment, Checkout Session, payment, order, entitlement, or delivery
  mutation.
- **Current deployment:** both canonical domains resolve to READY Production
  deployment `dpl_HMtiyuJNF5unFUY9K6uWkiWZ4y4i`
  (`hwl-by-pybjd8mlv-whole-body-earth.vercel.app`), exact checkpoint commit
  `6a260bcfa7c752562be264d1a077013fc8ff9f4d` on
  `checkpoint/platform-overhaul-2026-08-20`. The 30-minute postflight window
  contained no Vercel warning- or error-level runtime logs.
- **Unchanged boundaries:** `COMMERCE_SALES_READY=false`; `main` remains
  untouched. Entitled-user playback/PDF delivery and the owner-driven live
  `$11.11` purchase remain separate launch canaries because no authenticated
  Production buyer session was available during this non-mutating revalidation.

## September 8 Supabase Production Key Cutover — Current Authority

This section supersedes every older statement below that says the legacy
Supabase `anon` or `service_role` keys remain enabled, that the canonical
domains resolve to `dpl_8JB23GVxaAFdLLbLUpmA5z8ukJNJ`, or that Vercel
Production has not been rebound to the modern Supabase keys.

- **Modern keys deployed first:** Vercel Production was rebound directly from
  the canonical Supabase Production project `qwprhsrwiihfllmgallr` to its
  default `sb_publishable_...` browser key and `sb_secret_...` server key. No
  credential value was printed or committed. A fresh closed-sales Production
  build completed READY as `dpl_BhFbR5o1q6uEjAapy3axhGD7Zd69`
  (`hwl-by-aat0clzct-whole-body-earth.vercel.app`) from documentation-only
  checkpoint `c8adca829e82852a522c886fd2255ecca392ed89`; its audited runtime remains
  application commit `c26164d1c91245a9c3194bc370081ad7937af129`.
- **Replacement-key canaries before retirement:** the modern publishable key
  returned HTTP 200 from the Production Auth settings endpoint. The modern
  secret key returned HTTP 200 for a bounded database read and HTTP 200 for a
  private `member-content` storage listing. The new Vercel candidate returned
  HTTP 200 for `/` and `/login`, HTTP 307 for the protected `/library` and PDF
  download paths, HTTP 401 for unauthenticated LIFT video, the intentional HTTP
  503 for same-origin checkout while sales are closed, and HTTP 400 for an
  unsigned Stripe webhook.
- **Dependency check:** the Supabase organization has no published OAuth apps.
  Its only authorized apps are three Codex grants. Supabase management access
  remained operational after the cutover, and the application data-plane
  checks use only the modern project keys.
- **Legacy retirement:** Supabase exposes one reversible project-level control
  for the legacy JWT-based pair, so `service_role` and `anon` could not be
  disabled sequentially. They were disabled atomically under the owner's
  approved rollback procedure. A direct post-cutover check proved both legacy
  keys are rejected as API keys with HTTP 401, while all three modern-key
  canaries remained HTTP 200. The dashboard now exposes the immediate
  **Re-enable JWT-based API keys** rollback action; no rollback was required.
- **Canonical promotion and postflight:** the verified candidate was promoted
  to Production. Both `www.hwlbysmd.com` and `hwlbysmd.com` resolve exactly to
  `dpl_BhFbR5o1q6uEjAapy3axhGD7Zd69`; the apex returns HTTP 308 to `www`, and
  `www` returns HTTP 200. The protected-route, media, checkout, and webhook
  postflight statuses match the pre-promotion results, and the cutover window
  contains no Vercel error-level runtime logs. The prior deployment
  `dpl_8JB23GVxaAFdLLbLUpmA5z8ukJNJ` remains the alias-only rollback target.
- **Unchanged release boundaries:** `COMMERCE_SALES_READY=false`; no Checkout
  Session, charge, webhook mutation, or live purchase was created during this
  cutover. Public inquiries and Cal.com booking-history sync retain their
  separately documented gates. `main` was not pushed or merged.

## September 7 Production Cutover — Current Authority

This section supersedes every older current-deployment and current-readiness
statement below. Historical observations remain available only as dated audit
evidence.

- **Live application:** runtime commit
  `c26164d1c91245a9c3194bc370081ad7937af129` is pushed only to
  `checkpoint/platform-overhaul-2026-08-20`; `main` was not pushed or merged.
  GitHub Actions run `34186973081` passed lint, TypeScript, SEO, all repository
  boundary suites, the Production dependency audit, and the provider-free
  Production compile for that exact SHA.
- **Exact Production deployment:** Vercel deployment
  `dpl_8JB23GVxaAFdLLbLUpmA5z8ukJNJ`
  (`hwl-by-mrgjmpa4v-whole-body-earth.vercel.app`) is READY. Its real
  Production-environment build passed for canonical project
  `qwprhsrwiihfllmgallr`, closed sales, closed inquiries, and disabled Cal.com
  booking history. Migration 016 remains unapplied and
  `CALCOM_BOOKING_LEDGER_READY=false`.
- **Canonical-domain cutover:** both `www.hwlbysmd.com` and `hwlbysmd.com` are
  assigned to that exact READY deployment. The apex returns HTTP 308 to `www`;
  `www` returns HTTP 200 without the Preview-only `x-robots-tag: noindex`
  header. The prior alias-only rollback target is
  `dpl_6TUjj1aEiJgyD3oLTDocdfZmnKAz`
  (`hwl-by-b02u4crd0-whole-body-earth.vercel.app`).
- **Public audit:** every one of the 23 canonical sitemap routes returned HTTP
  200 after cutover. The live LIFT page exposes canonical URL
  `https://www.hwlbysmd.com/beauty/lift`, canonical Product JSON-LD ID
  `#lift-video-pdf`, the single `$11.11` Video + PDF offer, and its complete
  Terms, Privacy, and Refund Policy links. `robots.txt`, `sitemap.xml`, and
  `llms.txt` all return HTTP 200. Post-audit deployment logs contain no warning-
  or error-level entries.
- **Booking proof:** the public website resolved the exact Wild Glow Express
  Facial at 20 minutes and `$111`, and rendered its live Cal.com month/date/time
  selector with request-only, no-payment, and manual-confirmation language.
  Fresh non-submitting browser checks also rendered live calendars for Private
  Yoga + Sound and Intuitive Tarot Reading. No appointment was created during
  the Production smoke test.
- **Stripe customer presentation:** canonical live account HWLbySMD now
  persists `shannon@hwlbysmd.com` as its customer-support email, the HWL contact
  URL, Terms URL, Privacy URL, and Refund Policy URL. Checkout is configured to
  display Terms/Privacy, the 14-days-from-purchase free-refund policy, support
  email, and support website; the phone is not selected for Checkout display.
- **Payment safety and remaining gate:** live LIFT checkout remains visibly and
  server-side closed. A same-origin Production canary returned the intentional
  HTTP 503 before authentication or provider mutation. The previously emitted
  legacy Production Supabase `service_role` JWT is still enabled and must be
  retired under its separately approved narrow key-deactivation and rollback
  procedure before `COMMERCE_SALES_READY=true`. Therefore no secure live-sale,
  live webhook, entitlement, or private-media fulfillment claim is made in
  this release.
- **Other closed features:** public inquiry collection remains HTTP 503 with
  the on-page direct-email fallback. The Cal.com booking-history webhook also
  remains HTTP 503 and The Den session-history navigation remains hidden. These
  gates do not prevent current Cal.com appointment requests or Shannon's
  launch-time manual post-appointment Stripe invoice/payment-link workflow.

## September 7 Booking Model Correction — Current Authority

This section supersedes every older **current-state** claim below that describes
Wild Glow Express as a group, minimum-four, or inquiry-only service; describes
only ten Cal.com event types; or expects appointment payment during booking.
Dated test records remain intact as historical evidence of what was true when
those checks ran.

- **Wild Glow Express Facial:** the canonical offer is an individual
  appointment for one attendee, 20 minutes, $111, with the exact slug
  `wild-glow-express-facial`. Cal.com's public API now returns it as active
  public event `6981284`, with the exact title and slug, a 20-minute duration,
  and a free `0 USD` provider price. The same public read returns all eleven
  expected events.
- **Individual-service intake:** Wild Glow Express and Reiki Aromatherapy are
  one-person appointments. The website presents Reiki at a flat $222 with a
  maximum of one attendee, and its provider description says `$222 for one
  person`. For both events, provider guest-count and duplicate custom-location
  questions are hidden; Cal.com's built-in attendee-address field is required.
- **Appointment authority:** every appointment is a free Cal.com booking
  request. Shannon manually accepts or declines it. Cal.com seats and payments
  remain disabled, and the website does not collect Stripe payment while a
  client requests a date or time. Wild Glow Express uses the HWL Beauty
  schedule, 60-minute before/after buffers, two days' notice, a cap of two per
  day, and a rolling 30-day horizon. Its provider preview displays **Requires
  confirmation**.
- **Payment timing:** Shannon accepts payment after the appointment is
  complete. The application does **not yet** automate the completion-to-Stripe
  invoice/payment-link email. Until that workflow is implemented and verified
  end to end, the truthful operating path is a manually issued post-session
  Stripe invoice or payment link.
- **Evidence still required:** the provider API and settings checks now pass.
  The current local website resolved Wild Glow Express to the exact event,
  rendered live 20-minute availability, submitted one authorized request,
  surfaced it in Cal.com's unconfirmed queue, confirmed it through Shannon's
  organizer account, canceled it with a test reason, and showed the released
  slots again on a fresh load. No payment was collected and no test booking
  remains active. The deployed candidate still needs a non-submitting smoke
  check. Appointment completion and post-session payment automation remain a
  separate future lifecycle; launch uses Shannon's manual Stripe invoice or
  payment-link workflow after service.

## September 7 Unified Commerce + Booking UX — Current Preview Candidate

- **Exact application code:** commit
  `cd52772b816a414c349ce63d258ebd80274f21a8` is clean, synchronized only on
  `checkpoint/platform-overhaul-2026-08-20`, and passed GitHub Actions run
  `34176103707`. `main` was not pushed or merged.
- **Exact protected Preview:** Vercel deployment
  `dpl_62BPVaKeLH1x61GHsddCpzgBKo34`
  (`hwl-by-n91y6p9dt-whole-body-earth.vercel.app`) is READY Preview and its
  build log names branch `checkpoint/platform-overhaul-2026-08-20` and commit
  `cd52772`. `https://preview.hwlbysmd.com` is the protected branch entry and
  may advance through documentation-only descendants without changing the
  audited application code.
- **One interaction grammar, separate authorities:** products now move from an
  offer to a cart review sheet and then Stripe; sessions move from an offer to
  a session review sheet and then a dedicated Cal.com date/time step. Booking
  never enters the commerce cart, and the booking review explicitly states
  that no payment is collected when requesting a time. Closing a selected
  session preserves a header control for reopening it. Both header controls
  remain keyboard named, dialog aware, and usable at mobile and short/zoomed
  viewport heights.
- **Service and commerce signal:** canonical service shelves now appear high on
  Beauty, Body, and Being with price, duration, format, readiness, and one
  full-width next action. LIFT appears early on the homepage, Beauty page, and
  Store as the one available `$11.11` video-and-PDF product. The top navigation
  and public `llms.txt` expose the canonical LIFT, booking, service, retreat,
  and Store routes. Service CTAs retain canonical crawlable URLs and work as
  progressive-enhancement links when client scripting is unavailable.
- **Preview browser evidence:** the exact Preview rendered the shared Signature
  Facial review with its `$277/guest`, 60-minute, in-person details, then
  reached `/book?service=signature-facial#choose-time`. The embedded month
  calendar exposed six live times from `10:00am` through `3:00pm` in the tested
  session. The cart rendered one `LIFT — Video + PDF` item at `$11.11`, the
  secure Stripe checkout action, and the full legal-policy set. No booking,
  inquiry, or Checkout Session was submitted. The application emitted zero
  browser errors; one warning came from Cal.com's own client bundle.
- **Visual system:** simple editorial still lifes now identify Beauty, Body,
  and Being offers while Shannon remains the human presence throughout the
  site. Desktop, 390px mobile, and a 360px-high stress viewport showed no
  application-level horizontal overflow; both review sheets remained
  scrollable to their primary action.
- **Verification:** the Next.js 16.3.1 Webpack production build generated all
  62 routes. TypeScript, ESLint, SEO validation, and `git diff --check` pass.
  Focused suites pass 243 cases: Auth 55/55, booking 24/24, accessibility 6/6,
  commerce 74/74, inquiries 21/21, launch environment 44/44, and Preview
  release policy 19/19.
- **Release boundary:** this is Preview evidence only. No Production alias,
  Production environment value, provider object, live payment, Cal booking,
  public inquiry state, or `main` branch was changed by this UX release.

## September 7 Current Candidate — Launch Authority

This section is the current release truth. It supersedes conflicting deployment,
environment-inventory, administrator, and readiness statements in the dated
records below. Those records remain as historical evidence only.

- **Exact application code and Preview:** application commit
  `d00a0b48a36a1aff7cd69bec0fb7ef60960666ae` is clean, pushed only on
  `checkpoint/platform-overhaul-2026-08-20`, and passed GitHub Actions run
  `34152833811`. Its READY Preview is
  `dpl_EeMzfsFeC3wsk7En5Z8cYYS26BzF`
  (`hwl-by-9qynkdbl3-whole-body-earth.vercel.app`). Documentation-only
  descendant `6aab6396cd62cc13139d9f86b026ef0ececeb4ab` passed GitHub Actions run
  `34153186250` and deployed READY as `dpl_GYRcsXTCF7R5BHhXox27gSUuzxRt`.
  `https://preview.hwlbysmd.com` is the stable branch Preview entry and may move
  through later documentation-only descendants without changing the audited
  runtime application code. Any later runtime-code commit requires fresh
  verification. `main` remains untouched.
- **Public Production remains separate and closed:** `hwlbysmd.com` and
  `www.hwlbysmd.com` still resolve to older READY Production deployment
  `dpl_6TUjj1aEiJgyD3oLTDocdfZmnKAz`, source `a0152df52570197601260dbe02ffac88aa7988c8`.
  It has the older navigation, booking layout, and LIFT presentation. Its cart
  truthfully reports that secure checkout is opening soon. The 24 required
  encrypted Production environment-variable names are present, but name
  inventory is not secret-value, account-boundary, or end-to-end proof. No
  Production alias, environment value, provider object, or live-money state was
  changed in this pass.
- **Candidate experience:** the Preview has the enterprise navigation, the
  full-width two-step booking journey, a dedicated calendar step, canonical
  query/hash deep links and browser-Back behavior, stronger homepage and menu
  discovery for LIFT, and canonical LIFT Product structured data at
  `/beauty/lift`. Desktop and 390 x 844 mobile checks found no horizontal
  overflow or application console errors. The Preview cart contains one
  `LIFT — Video + PDF` item at `$11.11`, enables sandbox checkout, and presents
  the Terms and personal-use license, Privacy Policy, Refund Policy, and help
  link immediately beside the purchase control. The public `llms.txt` and
  explicit `OAI-SearchBot` policy expose only approved canonical public pages.
  The administrator API now requires a confirmed Supabase identity and a
  UUID-matched `is_admin=true` profile. No new Checkout Session was created
  during this verification.
- **Verification:** the Next.js 16.3.1 Webpack Production build completed all
  62 route/page entries. TypeScript, ESLint, and SEO validation pass for 21
  pages, 21 metadata records, and seven long-form documents. Focused boundary
  suites pass 241 cases: booking 22/22, accessibility 6/6, commerce 74/74,
  Auth 55/55, inquiries 21/21, launch environment 44/44, and Preview release
  19/19. Full and Production-only npm audits report zero vulnerabilities. The
  exact Preview rendered the updated LIFT cart and returned the expected
  `llms.txt` and `robots.txt`; its browser session emitted no warning or error
  entries.
- **Cal.com is public-booking operational:** the public API returns exactly the
  ten expected active event types, with no missing or unexpected service. All
  ten expose live openings in the current Preview, require manual confirmation,
  block pending slots, enforce 48 hours' notice and 60-minute before/after
  buffers, collect required guest-count and location answers, and use no Cal
  payment. Wild Glow Express intentionally remains inquiry-only. Slot selection
  reaches the attendee form on desktop and mobile; Confirm was not activated,
  so this pass created no booking. Private destination/conflict settings,
  Apple-calendar conflict injection, simultaneous confirmation, Shannon's
  organizer-mailbox receipt, and a fresh complete lifecycle on this exact
  Preview remain human/provider checks.
- **Supabase Production is healthy and isolated:** project
  `qwprhsrwiihfllmgallr` is `ACTIVE_HEALTHY` in `us-east-2`, and migration
  effects through 015 are observed. The private `member-content` bucket denies
  anonymous object access. Fresh signed streams for the canonical PDF
  (6,036,808 bytes, SHA-256
  `652c3c6eb6e87a44d47e5326e4e3a385d3704596a19020bc75ae318c6c117ad6`)
  and video (46,514,399 bytes, SHA-256
  `d3d3c7a390a4b8c199ae0970533c0c14ab4327ba7d3e53d7662c895d4860bf23`)
  match their canonical local files byte for byte. Production public Auth/media
  routes deny anonymous users. One durable inquiry is `received`, with its
  notification accepted by Resend; public inquiry collection remains paused,
  and monitored-mailbox receipt is not proven. Both approved Auth identities
  exist, but `shannon@hwlbysmd.com` and `admin@ghosthand.studio` remain
  email-unconfirmed, never signed in, and `is_admin=false`. Both will use the
  existing equal technical administrator grant after individual confirmation;
  Ghosthand's super-admin designation remains an operational governance role,
  not a second authorization tier. Legacy Supabase JWT keys remain enabled
  pending a verified modern-key cutover and explicit retirement.
- **Stripe live objects are ready, but live application commerce is not yet
  proven:** canonical account `acct_1U9cEIPTLuM8Maxa` has Payments and Payouts
  active. Active Product `prod_VCotDELRoHDnox`, one-time `$11.11` Price
  `price_1UCPFjPTLuM8MaxaTY48RO9e`, and four-event Production webhook
  `we_1UCPJEPTLuM8MaxawK9UgEHh` match the required LIFT metadata and canonical
  endpoint. There are zero live webhook deliveries and zero live application
  purchases, so payment-to-entitlement-to-private-media fulfillment is not yet
  proven. Stripe Checkout still does not display the approved public support
  contact, support URL, Terms/Privacy URLs, or refund-policy link. The sandbox
  webhook also needs repair: completed events returned HTTP 200, expired events
  returned HTTP 503, and its exposed Preview automation-bypass credential must
  be rotated, rebound, verified, and revoked under a narrow approval.

**Launch sequence from this checkpoint:** first complete Stripe's public
support/legal presentation and repair the isolated sandbox webhook credential;
then explicitly approve deploying this exact candidate as a Production build
with sales and inquiries still closed. Verify the closed candidate against the
Production Supabase ref, protected media, unsigned-webhook rejection, and the
reconciliation cron. Only after those checks should the owner separately
authorize one real `$11.11` purchase and live-sales enablement. Confirm the
Stripe event, order, purchase, entitlement, video, and PDF chain before leaving
sales open. Administrator invitation acceptance/elevation, monitored inquiry
receipt, public inquiry opening, and legacy-key retirement remain separately
controlled owner actions.

## September 6 Checkpoint Preview Verification — Current Authority

- **Exact code candidate:** commit
  `9c4ee8726c76dce5c38a4d83c2890cb8c4c72530` is pushed on
  `checkpoint/platform-overhaul-2026-08-20`. GitHub Actions run
  `34061716861`, job `101563292656`, completed successfully for that exact
  branch and SHA. The commit adds the fail-closed admin/inquiry boundary and
  aggregate-only commerce-recovery alert path described in the latest section
  below. `main` was not pushed or merged.
- **Exact protected Preview:** Vercel deployment
  `dpl_drJRbTBZbA4scmptFfE5QZU8nzxQ`
  (`hwl-by-ikzta8xgr-whole-body-earth.vercel.app`) is READY Preview for exact
  commit `9c4ee87`. `preview.hwlbysmd.com` resolves to that deployment. The
  Production aliases `hwlbysmd.com` and `www.hwlbysmd.com` remain separately
  assigned to `dpl_6TUjj1aEiJgyD3oLTDocdfZmnKAz`; this verification did not
  promote or alter Production.
- **Rendered Preview checks:** authenticated Vercel access reached the exact
  Preview application. The Intuitive Tarot page rendered the live September 27
  selector with all five 12:00–4:00 PM times. `/login` rendered its email entry
  surface, and a signed-out request for `/admin/inquiries` was denied and
  redirected to `/login?redirectTo=/admin`. `/beauty/lift` exposed exactly the
  single `$11.11` video-and-PDF offer; adding it opened the cart sheet with one
  `$11.11` line item and the secure-checkout action. No Checkout session,
  inquiry, booking, or provider notification was submitted in this pass.
- **Runtime observation:** after those checks, the exact deployment had zero
  warning logs, zero error logs, and zero 5xx responses in the queried recent
  30-minute window. This is bounded runtime evidence, not proof of an untested
  provider lifecycle.

## September 5 Launch Continuation — Superseded Snapshot

The following section records the earlier `b7b9a59` candidate and remains
useful historical evidence. The September 6 authority sections supersede it for
the current checkpoint and deployment identity.

- **Checkpoint baseline and candidate:** exact commit
  `b7b9a593fac4cafcd078378ee5768f47de0e67cd` is pushed on
  `checkpoint/platform-overhaul-2026-08-20`; local HEAD and its tracked remote
  match with zero divergence. GitHub CI run `33996903434` completed successfully
  for that exact SHA, including the September 5 Auth UX, dependency-lock, and
  real admin sign-out repairs. `main` remains untouched at
  `a6902607f42a3c66506758d4886fb4a2d61d99e2`.
- **Protected Preview:** `https://preview.hwlbysmd.com` is verified in Vercel
  and assigned only to the checkpoint branch. A September 5 Vercel inspection
  resolves it to READY Preview deployment
  `dpl_7qRayERhfuRsjBcX6mDW8zRwM42B`, created for exact checkpoint `b7b9a59`.
  Authoritative public DNS returns `CNAME cname.vercel-dns.com`; Vercel reports
  the domain correctly configured, and its certificate validates for the
  hostname.
  Anonymous requests redirect to Vercel SSO while authenticated Vercel access
  reaches the application with HTTP 200. Deployment Protection remains on. On
  September 5, the owner completed the private Vercel SSO and confirmed staging
  Supabase purchaser sign-in on this exact host, then completed the protected
  $11.11 sandbox purchase and private-media journey recorded below.
- **Preview configuration:** the branch-scoped configuration now has all 22
  required names, including the domain-restricted Resend credential and the
  dedicated Stripe sandbox webhook secret. The Preview launch preflight passed
  in sandbox-open mode. `COMMERCE_SALES_READY=true` is confined to this
  protected Preview; Production checkout remains closed.
- **Resend:** `hwlbysmd.com` is verified. The active sending credential is
  scoped to that domain and installed as a sensitive checkpoint-branch Preview
  variable. An authorized exact-Preview inquiry returned HTTP 200, persisted in
  staging with `notification_status=accepted`, rendered in the private admin
  inbox, and produced a Resend message marked sent and delivered. Shannon's
  independent mailbox receipt/open confirmation and an idempotent replay remain
  unverified.
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
  Auth suite passes 25/25, including a same-origin, fail-closed admin logout
  handler that terminates the real Supabase session while preserving the
  isolated localhost demo flow. On exact Preview deployment
  `dpl_7qRayERhfuRsjBcX6mDW8zRwM42B`, the temporary administrator used **Sign
  out**, reached `/login?redirectTo=/admin`, and remained denied when `/admin`
  was requested again. The repaired login and expired-reset
  states render locally. Production now has the exact canonical Site URL and
  sole Production callback allowlist entry recorded below. Hosted custom SMTP,
  link-tracking and rate-limit settings, a real non-team signup confirmation,
  password recovery delivery, and any separate staging/Preview callback review
  remain unverified.
- **Dependency audit:** the lockfile-only remediation reports zero npm
  advisories in both the full tree (560 dependencies) and the production graph
  (141 dependencies). The combined local gate and production build pass, and
  the exact candidate SHA passed checkpoint CI and deployed READY with the Auth
  repair.
- **Stripe:** canonical sandbox `acct_1U9cEQAdcj2oNOF4` still contains one
  active Complete LIFT Product, one one-time $11.11 USD (1,111-cent) Price, and the enabled
  four-event checkpoint webhook. The exact Preview's fresh paid Checkout,
  signed-webhook fulfillment, active purchase, and protected video/PDF delivery
  passed on September 5. The current-candidate refund, replay, and dispute
  exercises remain pending. The separate live HWLbySMD parent account
  `acct_1U9cEIPTLuM8Maxa` now shows no active tasks, Payments Active, and Payouts
  Active in the authenticated dashboard; only Cartes Bancaires is paused. This
  verifies the account-level activation state, not application commerce. Active
  live Product `prod_VCotDELRoHDnox`, one-time $11.11 USD Price
  `price_1UCPFjPTLuM8MaxaTY48RO9e`, and four-event webhook destination
  `we_1UCPJEPTLuM8MaxawK9UgEHh` now exist with the canonical metadata and exact
  Production URL. A dedicated live API key and the exact webhook signing secret
  are now stored in separate macOS Keychain records without being printed. A
  read-only API call using that key returned exact account
  `acct_1U9cEIPTLuM8Maxa` with charges, payouts, and submitted details all
  enabled; temporary plaintext files were deleted and the Dashboard secret was
  re-masked. Neither secret is installed in Vercel Production yet, the
  Production environment remains empty, and no Production checkout or live
  transaction has been tested.
- **Cal.com:** the ten intended `hwlbysmd` event types remain published with
  manual confirmation and no Cal payments. Fresh public checks show distinct
  available Esthetician, Yoga, and Consultation schedules. An authorized
  Signature Facial request submitted through the exact Preview, entered Cal's
  Unconfirmed queue, suppressed the requested time plus configured buffer
  slots, and was rejected after verification; the slots returned after cache
  delay. Destination/conflict configuration is verified, but the resulting
  Apple Calendar object and organizer/attendee mailbox receipts were not
  directly inspected.
- **Production:** `www.hwlbysmd.com` still serves the older Production artifact
  and its LIFT checkout fails closed. Dedicated Supabase project
  `qwprhsrwiihfllmgallr` in `us-east-2` now has migrations 001–014, a second
  no-op migration dry run, the two byte-verified private canonical LIFT assets,
  healthy Auth defaults, and no copied staging user, transaction, inquiry, or
  admin state. Its Auth Site URL is exactly `https://www.hwlbysmd.com`, with
  exactly one allowed redirect at `https://www.hwlbysmd.com/auth/callback`.
  Fresh, distinct Production-only inquiry-rate-limit and reconciliation-cron
  authorities are stored in separate Keychain records. The intended permanent
  Production administrators are exactly `shannon@hwlbysmd.com` and
  `admin@ghosthand.studio`; neither address currently exists in Production Auth,
  so no grant has been made. Each must accept an individual Auth invitation and
  confirm its mailbox before its matching profile is elevated.
  Production signup/recovery and SMTP E2E, Vercel Production configuration,
  application E2E, and candidate promotion remain pending.

The remaining launch-critical evidence is Shannon's independent mailbox
confirmation for inquiry delivery, a stable inquiry replay, direct inspection
of Cal's destination-calendar object and human booking emails, hosted Auth SMTP
plus non-team signup/recovery proof, the remaining commerce recovery/lifecycle
operations, installation of the already secured live Stripe credentials into a
complete fail-closed Vercel Production environment, the two confirmed permanent
admin accounts, a closed-gate Production application smoke test, and the owner's
explicit Production promotion approval. No Production checkout or live
transaction has been tested.

## September 5 Full Local Verification

- TypeScript, ESLint, SEO (21 pages, 21 metadata records, seven long-form
  documents), and the Next.js 16.3.1 Webpack production build all pass. The
  build printed 62 route/page entries.
- `npm run test:commerce`: **55/55 passed**, including the dedicated partial
  refund regression that retains active LIFT access without provider calls.
- `npm run test:auth`: **25/25 passed** for stable, non-reflective login
  feedback, hostile redirect cases, same-origin admin logout enforcement,
  Supabase session termination, demo isolation, and sanitized failure behavior.
- `npm run test:preview-release`: **16/16 passed**, including the requirement
  that checkpoint CI retain Auth-boundary coverage.
- Launch-environment fixtures pass 26/26; booking passes 6/6; inquiries pass
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
  active Complete LIFT Product and one active one-time $11.11 USD (1,111-cent) Price, and its
  persistent checkpoint webhook remains enabled for the four approved event
  types. The two newest hardened-candidate Sessions remain expired/unpaid with
  no PaymentIntent. That September 4 snapshot did not verify the live parent;
  the current live-account status in the authority section above supersedes it.

**Launch decision:** **Not live yet.** The current working tree implements the
single $11.11 LIFT offer, protected fulfillment, a persistent cart, a guarded
Stripe Checkout path, durable scheduled reconciliation, private operations
visibility, and Cal.com-aware booking. The exact protected Preview now passes a
fresh real Stripe sandbox purchase, signed-webhook fulfillment, authenticated
library/course access, and canonical private video/PDF delivery. An earlier
implementation path separately passed refund, dispute, and replay exercises;
those lifecycle paths and scheduled recovery still require current-Preview
repeats. The DB-first inquiry journey also passes against the
isolated database. Hosted staging now has migrations 001–014 plus byte-verified
private video and PDF assets. The exact Preview now also passes database-first
inquiry persistence, Resend provider delivery, private admin review, and a
website-originated Cal.com request with pending-slot suppression and verified
rejection/cleanup. Human mailbox inspection, the current inquiry's idempotent
replay, direct destination-calendar object inspection, remaining commerce
lifecycle/recovery operations, and Production application E2E have not yet
passed their required launch checks. The dedicated Production database schema,
clean-state, private-storage, and signed-delivery bootstrap checks now pass as
recorded below; they do not constitute a Production checkout or live-money test.

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
  one active Product and one active Price: the one-time $11.11 USD (1,111-cent) Complete
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
| Locally verified                | FULL LOCAL PASS / HOSTED PROOF RECORDED SEPARATELY | The combined September 5 tree passes TypeScript, ESLint, SEO, the Next.js 16.3.1 Webpack build (62 printed route/page entries), 55 commerce, 26 launch-boundary, 16 Auth, 7 inquiry-boundary, 6 booking-boundary, 1 accessibility-markup, and 16 Preview-policy tests, plus zero-vulnerability full/production npm audits. Exact-SHA CI, deployment, and E2E evidence is recorded in the relevant hosted rows below; this row remains local evidence only |
| Supabase staging                | SCHEMA + PURCHASE + ASSETS + INQUIRY + ADMIN INBOX VERIFIED / RECOVERY PENDING | Project is healthy; the remote ledger contains migrations 001–014 and a current linked dry-run is a no-op. Hosted schema/RPC probes match the 012–014 boundaries. The exact Preview has a paid/fulfilled checkout order, its signed `checkout.session.completed` receipt, one active $11.11 USD purchase, and byte-verified private video/PDF delivery. Authorized inquiry `aeb5055b-9901-428d-96fa-1d8c4cc939ac` is durably `received` with notification accepted, provider receipt present, no error, and attempted/accepted timestamps; the sole staging administrator rendered that exact record. Scheduled recovery remains pending |
| Supabase Production             | SCHEMA + PRIVATE ASSETS + AUTH URLS VERIFIED / SMTP + APP E2E PENDING | Dedicated project `qwprhsrwiihfllmgallr` is healthy in `us-east-2`; migrations 001–014 are applied and a second dry run is a no-op. The private canonical PDF is 6,036,808 bytes with SHA-256 `652c3c6eb6e87a44d47e5326e4e3a385d3704596a19020bc75ae318c6c117ad6`; the private canonical video is 46,514,399 bytes with SHA-256 `d3d3c7a390a4b8c199ae0970533c0c14ab4327ba7d3e53d7662c895d4860bf23`, and signed range delivery returned HTTP 206. No staging users, profiles, transactions, inquiries, Stripe Events, or admin grants were copied. Auth health/defaults pass; Site URL is exactly `https://www.hwlbysmd.com` and the sole redirect allowlist entry is `https://www.hwlbysmd.com/auth/callback`. Custom SMTP and real signup/recovery E2E remain pending. The initially exposed database password was immediately rotated and the replacement connection was reverified without printing it |
| Stripe sandbox                  | PAID CHECKOUT + FULFILLMENT VERIFIED / LIFECYCLE PENDING | The canonical account is `acct_1U9cEQAdcj2oNOF4`; its active test Product/Price are one-time $11.11 USD (1,111 cents) and match the launch catalog. The exact Preview Checkout Session completed and was paid on September 5; its PaymentIntent succeeded, and the 1,111-cent charge was captured. At the September 5 verification snapshot, no refund or dispute was present. Signed-webhook fulfillment passed. Current-candidate refund, replay, dispute, and recovery exercises remain pending, and none of this proves the separate live account |
| Cal.com                         | EXACT-PREVIEW REQUEST + SLOT SUPPRESSION + REJECTION PASS / MAILBOX + CALENDAR OBJECT PENDING | `HWLbySMD` / `hwlbysmd` publicly lists the ten exact website event types. The exact Preview submitted Signature Facial UID `3oRjqkAqvsqh8Sctf731br` for September 9, 10:00–11:00 AM PDT with the required guest/location answers and no payment. It appeared Unconfirmed; 10:00 AM, 11:00 AM, and 12:00 PM were suppressed while pending. After rejection, no Upcoming booking remained, Canceled showed Rejected, and 10:00 AM–3:00 PM returned after cache delay. FIREBIRDS destination and six-calendar conflict settings are verified, but the Apple Calendar event object and human emails were not directly inspected. Wild Glow Express remains inquiry-only |
| Inquiry delivery                | PERSISTENCE + RESEND DELIVERY + ADMIN INBOX VERIFIED / HUMAN OPEN + REPLAY PENDING | Migration 013 is ledger-applied and its private tables/RPC boundary is present in staging. The exact Preview UI reported provider acceptance and Vercel logged `POST /api/contact` HTTP 200 on the exact deployment. Inquiry `aeb5055b-9901-428d-96fa-1d8c4cc939ac` is `received` with accepted notification state and provider receipt; its private admin deep link rendered the exact record and Email accepted. Resend message `eaa31c57-…` from `HWL by SMD <hello@hwlbysmd.com>` to Shannon's configured Gmail address is marked sent and delivered. Human mailbox opening and an idempotent replay were not verified |
| Supabase Auth email             | PRODUCTION URLS VERIFIED / SMTP + E2E PENDING | A fresh public settings read shows signup enabled and email confirmation required (`mailer_autoconfirm=false`). Production Site URL is exactly `https://www.hwlbysmd.com` and its redirect allowlist contains exactly `https://www.hwlbysmd.com/auth/callback`. Custom SMTP, verified-domain sending, staging/Preview callback configuration, rate limits, disabled link tracking, and real non-team-email delivery have not been proven |
| Authentication UX              | PURCHASER LOGIN VERIFIED / EMAIL E2E PENDING | Failed-link feedback is allowlisted and non-reflective, return paths are same-origin, and password update now requires a verified server session before the form renders. Auth tests pass 16/16 and signed-out states render locally. The confirmed purchaser login passed on the exact Preview; a real confirmation link and recovery link still need hosted verification |
| Scheduled recovery             | STAGING RUN VERIFIED / PREVIEW RUN PENDING | Migration 014 is ledger-applied and its private queue/attempt tables plus narrow service-role RPCs are present in staging. On August 31, an authenticated local worker run against hosted staging reported and claimed the two expired current-candidate sandbox orders, resolved both as terminal, and left both jobs complete with zero alerts, errors, or manual-review reasons. A distinct sensitive branch-scoped Preview `CRON_SECRET` exists; deployed Preview invocation, alert routing, and cadence acceptance remain pending |
| September 5 transaction-bearing Preview | DATED / PURCHASE + INQUIRY + BOOKING E2E PASS | Exact checkpoint `9912291ad5dc9dba98dec78bbf59409b4d1d4a28` passed GitHub CI run `33977575309` and was READY as `dpl_GWEuouuZBLZWKguy3HYY8bwgPRQN`; the custom Preview resolved to it during that test. The September 5 purchaser sign-in/payment/fulfillment/private-media journey, inquiry persistence/Resend delivery/admin review, and website-originated Cal request/pending-slot suppression/rejection cleanup passed. This is dated transactional evidence, not the current Preview deployment identity. Production stayed closed; `main` was untouched |
| Production / live money         | ACCOUNT + LIVE OBJECTS ACTIVE / APPLICATION COMMERCE CLOSED | Production publicly serves older commit `145112cd` and checkout truthfully returns 503. The launch validator pins Production to `qwprhsrwiihfllmgallr` and rejects staging or arbitrary refs; 26/26 launch-boundary tests pass. The authenticated canonical Stripe account `acct_1U9cEIPTLuM8Maxa` shows no active tasks, Payments Active, and Payouts Active; only Cartes Bancaires is paused. Active canonical live Product `prod_VCotDELRoHDnox`, $11.11 Price `price_1UCPFjPTLuM8MaxaTY48RO9e`, and exact four-event Production webhook `we_1UCPJEPTLuM8MaxawK9UgEHh` exist. Vercel Production environment inventory remains empty; neither live API nor webhook signing secret is installed, and no Production checkout or live transaction has been tested |

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
authenticated purchaser journey on the protected Preview. The exact Production
Site URL and sole Production callback entry are separately verified provider
configuration, as recorded below.

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
verifier, and scheduled-worker cases. These results alone do not constitute
public-Preview E2E. Separate September 5 evidence now proves the exact
Preview's purchaser browser journey and inquiry-administrator inbox access;
deployed cron/recovery proof and the remaining launch gates are still pending,
so Production sales remain closed.

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
access remains denied. The modern Supabase server credential authenticates.
The existing signed-in Preview administrator now opens the real hosted inquiry
ledger, while a fresh current inquiry submission and Resend acceptance/human
receipt still require end-to-end verification.

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
| September 5 Preview repository preflight before and after push      | PASS — local and tracked remote matched exact commit `9912291ad5dc9dba98dec78bbf59409b4d1d4a28`; GitHub CI run `33977575309` passed and Vercel resolved the custom Preview to READY deployment `dpl_GWEuouuZBLZWKguy3HYY8bwgPRQN`. This row is dated evidence; every later authorized checkpoint-only push must repeat exact synchronization, CI, and deployment/alias proof |
| `npm run test:commerce`                                             | PASS — 55 provider-free cases: 10 request/limit/namespace policy cases, 23 shared-verifier/expiry/repair cases including partial-refund retention, and 22 cron/scheduled-worker cases covering exact identity, fail-closed write ordering, customer-bookkeeping isolation, terminal monitoring, leases, report validation, deadline release, sanitized failure categories/responses, and replay repair |
| Targeted Prettier and `git diff --check`                            | PASS                                                                                                                                                                                                                                                                     |
| Changed/untracked launch-file secret-shape scan                     | PASS — no real Stripe, webhook, Supabase, Resend, or JWT secret-shaped values; every shape hit is an explicitly synthetic fixture in the launch/Preview test harness or the packet's redacted fixture note                                                                 |
| Prior `/book` fallback with 0 public Cal.com events                 | PASS — inquiry fallback, service switching, no iframe, no console errors; historical fallback proof only, because ten exact event types are now public                                                                                                                     |
| September 5 website → Cal.com booking journey                       | PREVIEW PASS / MAILBOX + DESTINATION OBJECT PENDING — `/book?service=signature-facial` retained the `$277 / guest` offer and submitted a September 9, 10:00–11:00 AM PDT request with required guest count `1`, a nonphysical Palm Springs launch-test location, and no payment. UID `3oRjqkAqvsqh8Sctf731br` appeared Unconfirmed with the submitted questions/notes; 10:00 AM, 11:00 AM, and 12:00 PM were suppressed while pending. The request was rejected after verification, no Upcoming booking remained, Canceled showed Rejected, and all 10:00 AM–3:00 PM slots returned after cache delay. FIREBIRDS destination configuration is verified, but the Apple Calendar event object and human emails were not directly inspected |
| August 31 real Cal.com booking lifecycle                            | PASS — a public Signature Facial request for September 3 entered the authenticated organizer queue as unconfirmed with required guest count and attendee address; the organizer manually confirmed it, rescheduled it from 10:00 to 11:00 AM Pacific with a stated test reason, and canceled it with a stated completion reason. The final provider page says the event is canceled; no Cal payment was configured or collected. Cal stated that lifecycle email was sent, but human inbox receipt remains unverified |
| August 31 live Cal.com selector at 390×844                          | PASS — `/book?service=signature-facial` rendered enabled dates and six visible time buttons; `innerWidth`, document client width, and document scroll width were all 390; no horizontal overflow or Next.js error overlay. Keyboard and mobile pointer/touch activation were not verified |
| August 31 `/beauty/lift` + cart at 390×844                          | PASS — browser inner width 390; document client/scroll width both 375; no horizontal overflow; full-height cart showed one $11.11 LIFT Video + PDF item, included assets, truthful closed-sales checkout, and Stripe/license/refund/help links; zero console errors             |
| August 31 inquiry-only Wild Glow booking at 390×844                 | PASS — `/book?service=wild-glow-express-facial` rendered guest minimum/default 4, inquiry-only explanation, timing choices, privacy notice, and no live calendar; document client/scroll width both 375; zero console errors                                                   |
| Local desktop/mobile axe sweep                                      | PASS — 18 public, store, legal, auth, and member-entry journeys at 1440×1000 and 390×844 produced zero WCAG 2 A/AA, 2.1 A/AA, or 2.2 AA axe violations after the contrast/progress fixes; six additional checkout-result, protected-auth, and password journeys passed at 390×844; no audited page overflowed or logged a console error |
| Local keyboard and reduced-motion checks                            | PASS — skip navigation moved focus to `main`; mobile navigation and the cart trapped focus, closed with Escape, and restored their triggers; keyboard service activation preserved focus; four representative routes reported zero active animations under reduced motion                                                                  |
| Remaining accessibility/provider verification at September 5       | **PARTIAL** — live Cal.com dates/times rendered for all three schedule families; the exact Preview Signature Facial request, pending-slot suppression, and rejection cleanup passed; a prior provider-level confirm/reschedule/cancel lifecycle passed; and purchaser login, paid-library content, inquiry delivery, and temporary-admin inbox passed. Keyboard/mobile Cal submission, deliberate external-calendar conflict blocking, direct Apple Calendar object inspection, organizer/attendee human email receipts, 200% zoom across every route, and a manual screen-reader journey remained unverified |
| September 5 local `/beauty/lift` browser verification               | PASS — rendered LIFT hero, accessible navigation, cart trigger, public preview, seven movement links, and $11.11 video+PDF copy; meaningful DOM present; no Next.js error overlay or browser warning/error logs                                                                                                                           |
| Local same-origin page probes                                       | PASS — `GET /`, `GET /book`, and `GET /beauty/lift` each returned HTTP 200                                                                                                                                                                                               |
| September 5 contact same-origin boundary                            | PREVIEW PASS — missing/foreign origins and malformed requests remained rejected. The authorized exact-Preview form submission returned provider-accepted UI, Vercel logged `POST /api/contact` HTTP 200, staging persisted the exact inquiry with accepted notification state and provider receipt, the private deep link rendered it, and Resend marked its message sent and delivered. Idempotent replay and human mailbox opening remained pending |
| Checkout same-origin boundary                                       | PASS — missing Origin and foreign Origin returned HTTP 403; the correct localhost Origin reached the route and returned a truthful HTTP 503 because sales are closed; no Session or charge was attempted                                                                 |
| Unsigned local Stripe webhook                                       | PASS — HTTP 400 before processing                                                                                                                                                                                                                                        |
| Unauthenticated local reconciliation cron                           | PASS — after a fresh local `CRON_SECRET` was installed, a request without its bearer returned HTTP 401 before Stripe, Supabase, report, or lease work; route tests also assert `no-store`                                                                                   |
| Stripe deployment-target namespace                                  | PASS — purchases, customers, Events, and orders coexist for development/Preview in one sandbox account; exact-target reads isolate them; valid foreign-target fulfillment performs no DB write; account/mode corruption rejects                                                                                                            |
| Stripe webhook body cap                                             | PASS — raw bytes use the exact signature `Buffer`; payloads above 1,000,000 bytes fail closed                                                                                                                                                                            |
| Financial-record foreign keys                                       | PASS — four profile relationships use `ON DELETE RESTRICT`; isolated Auth deletion raised a foreign-key violation and preserved the user and records                                                                                                                     |
| Trusted client-address resolver                                     | PASS — local fallback, local proxy, trusted Vercel forwarding, spoof rejection, missing deployed identity, and IPv6 cases matched the exact expected outputs                                                                                                             |
| September 5 Supabase linked migration inventory                     | APPLIED / NO-OP PASS — the hosted ledger contained 001–014, and a linked `supabase db push --dry-run` reported the database was up to date with no migration, seed, or role work pending                                                                                                                                                  |
| Hosted 012–014 schema/RPC boundary                                  | PASS — exact namespace columns and 012 tables/RPC are present; the 013 inquiry table and four RPCs are present with direct rate-table access denied; the 014 private queue/attempt tables and four RPCs are present with direct table reads denied; sanitized status RPC returned HTTP 200 and zero rows                             |
| Corrected canonical PDF in private staging storage                  | PASS — local and hosted `member-content/lift/lift-guide.pdf` are 6,036,808 bytes with SHA-256 `652c3c6eb6e87a44d47e5326e4e3a385d3704596a19020bc75ae318c6c117ad6`; signed GET returned HTTP 200 and byte-identical content; anonymous access returned HTTP 400                         |
| Fresh isolated Supabase reset, migrations 001–014                   | PASS — migrations 001–014 applied in disposable PostgreSQL 17.6; rollback-only schema/state assertions passed; the disposable database/container was removed and hosted staging was untouched                                                                                                                                            |
| Commerce DB isolation/replay assertions                             | PASS — rollback-only target coexistence/isolation; paid-write/provenance repair; refunded-over-disputed monotonicity; durable exact-namespace jobs; immutable attempts; lease-token CAS; bounded retries; monitoring; manual-review alerts; fixtures rolled back                                                                         |
| Concurrent reconciliation claim race                                | PASS — the existing browser claim CAS admitted one claimant; a separate two-session scheduled-queue `SKIP LOCKED` check returned zero rows while the only due row was leased elsewhere                                                                                                                                                |
| Targeted schema/RLS/function assertions                             | PASS — 14 migrations; browser commerce/inquiry/reconciliation access denied; service-role authority limited to the required server tables/RPCs; fixtures rolled back to zero                                                                                                                                                           |
| Concurrent inquiry limiter                                          | PASS — 20 simultaneous claims produced exactly 5 accepts, 15 rejects, and a stored count of 5                                                                                                                                                                            |
| Inquiry idempotency and notification state machine                  | PASS — same-ID record and notification races elected one creator/claimant; canonical mismatch consumed no claim; digest rotation preserved an identical retry; terminal accepted resisted downgrade; all five failure/pending categories and stale/completion CAS passed |
| Stripe sandbox Checkout → signed webhook → entitlement              | SEPTEMBER 5 PREVIEW PASS — the Session completed/paid on September 5 for $11.11 USD (1,111 cents); its PaymentIntent succeeded and charge was captured. The signed webhook produced a paid/fulfilled checkout order with zero reconciliation attempts, one active $11.11 purchase, and a `checkout.session.completed` receipt. The authenticated Preview redirected to the full seven-movement course, `/account` showed the purchaser and active September 5 purchase, `/library` listed LIFT, and the cart was empty |
| Entitled private media                                              | SEPTEMBER 5 PREVIEW PASS — `/api/video/lift` produced a private Supabase signed URL; the fresh asset request returned HTTP 206 with bytes `0-1023/46514399` as MP4. The canonical PDF returned HTTP 200 with 6,036,808 bytes and SHA-256 `652c3c6eb6e87a44d47e5326e4e3a385d3704596a19020bc75ae318c6c117ad6`; `/account` exposed the entitled `Download LIFT PDF` action |
| Full refund → entitlement revocation                                | PRIOR PATH PASS / SEPTEMBER 6 REPEAT PENDING — full 1111-cent sandbox refund; purchase/order became `refunded`; library, video, and PDF access closed; success page reported revocation before the latest shared-verifier hardening                                                                                                                  |
| Duplicate signed webhook replay                                     | PRIOR PATH PASS / SEPTEMBER 6 REPEAT PENDING — two replays returned HTTP 200 while event and purchase rows remained unique and terminal before the latest shared-verifier hardening                                                                                                                                                                  |
| Dispute and event-order safety                                      | PRIOR PATH PASS / SEPTEMBER 6 REPEAT PENDING — Stripe's dispute test card produced a sandbox Dispute; completion observed the terminal Charge, recorded `disputed`, denied all assets, and the later direct dispute event remained terminal before the latest shared-verifier hardening                                                              |
| Authenticated reconciliation on public Preview                      | NOT RUN AT THIS SNAPSHOT — route/auth/cookie/origin/client refresh and persistent webhook interaction still required the custom Preview boundary; provider-free shared-helper and isolated DB transition coverage passed locally                                                    |
| September 5 launch Preview browser journey                          | PARTIAL PASS — custom hostname DNS/TLS/exact deployment mapping, protected redirect, purchaser login, sandbox Checkout/fulfillment/private media, inquiry persistence/Resend delivery/admin review, and the exact-Preview Cal request/pending-slot suppression/rejection cleanup were verified. Keyboard/mobile post-login coverage, human mailboxes, direct destination-calendar object inspection, and remaining operations checks were pending |
| Inquiry persistence → Resend notification                           | SEPTEMBER 5 PREVIEW PASS / HUMAN OPEN + REPLAY PENDING — inquiry `aeb5055b-9901-428d-96fa-1d8c4cc939ac` persisted at `2026-09-05T17:10:59Z` with `received`/`accepted`, no error, provider receipt, and attempted/accepted timestamps. The exact admin deep link showed Email accepted. Resend message `eaa31c57-…` from the verified HWL sender to Shannon's configured Gmail address was marked sent and delivered at September 5, 10:11 AM. Human mailbox opening and a same-ID replay were not verified |
| Inquiry abuse, privacy, and admin boundaries                        | PASS — malformed/cross-origin/oversize payloads rejected; first five rate claims persisted and sixth returned 429; browser table reads denied; verified admin saw the record; anonymous admin denied                                                                     |
| Launch environment preflight                                        | PASS — 26/26 cases; explicit deployment target is mandatory; development/Preview closed and sandbox-open fixtures pass; canonical Production closed/open fixtures pass only with `qwprhsrwiihfllmgallr`; staging and arbitrary Production database refs, target mismatches, partial/live Preview config, and shared cron/inquiry secrets fail |
| September 5 configured launch environment                           | PREVIEW PURCHASE + INQUIRY + BOOKING E2E PASS / PRODUCTION CLOSED — the exact pushed checkpoint passed Preview post-push preflight with all 22 then-required branch-scoped names. Payment/fulfillment/private media, accepted Resend delivery/admin review, and the website-originated Cal request/cleanup were verified. This is a dated configuration snapshot; later Production and Preview authority sections supersede its inventory statements |
| First `c74fe61` automatic Preview build                             | EXPECTED FAIL-CLOSED — `dpl_3ZEfnCQJ9MxsYTS6zR98bEZvmiuo` stopped at the launch validator because `RESEND_API_KEY` and the then-incomplete hosted Stripe set were absent; application compilation/deployment did not proceed                                                    |
| September 5 Vercel Preview configuration inventory                  | PASS 22/22 THEN-REQUIRED NAMES / STRIPE + RESEND E2E PASS — all required records were sensitive and branch-scoped to `checkpoint/platform-overhaul-2026-08-20`, including the dedicated sandbox webhook secret and domain-scoped Resend key. READY deployment `dpl_GWEuouuZBLZWKguy3HYY8bwgPRQN` passed the validator, signed Stripe fulfillment, and accepted Resend delivery; the custom hostname resolved to it during that test. Later authority sections supersede this inventory |
| September 5 public Production safety probe                          | PASS — homepage HTTP 200; unauthenticated LIFT Checkout HTTP 503 with truthful not-ready copy; no charge attempted                                                                                                                                                       |
| Cal.com booking → availability suppression → rejection              | SEPTEMBER 5 PREVIEW PASS / DIRECT CALENDAR + MAILBOX PROOF PENDING — the exact Preview request appeared Unconfirmed, suppressed the appointment plus configured buffer slots, and was rejected/removed with the full day restored after cache delay. Calendar settings showed FIREBIRDS destination and conflict checks for FIREBIRDS, WHOLEBODY, LIONWOLF, HWL, YOGA, and ACTOR with BILLS off. The actual Apple Calendar event object, deliberate external-calendar conflict injection, and organizer/attendee mailbox receipt were not directly inspected |

The trusted client-address resolver assertion returned this exact value:

```text
{local:'local-development',localProxy:'203.0.113.8',previewForged:null,previewTrusted:'203.0.113.9',vercelOverride:null,productionMissing:null,ipv6:'2001:db8::1'}
```

This proves the local resolver behavior only: deployed Vercel traffic accepts
the platform-owned `x-vercel-forwarded-for` boundary and does not fall back to
caller-controlled generic proxy headers. It does not prove a hosted request
path until the same boundary is exercised on the launch Preview.

### Launch-environment fixture proof

`npm run test:launch-env` passed these 26 synthetic cases:

1. `development closed`
2. `preview closed without Stripe provider values`
3. `preview sandbox open`
4. `retired Preview domain fails`
5. `legacy browser fallback fails`
6. `legacy browser shadow fails`
7. `legacy server key fails`
8. `missing explicit target fails`
9. `target mismatch fails`
10. `partial Stripe set fails`
11. `live Stripe key in Preview fails`
12. `wrong Preview Stripe account fails`
13. `wrong Preview Stripe price fails`
14. `missing Resend key fails`
15. `missing cron secret fails`
16. `short cron secret fails`
17. `shared cron and inquiry secrets fail`
18. `unapproved sender domain fails`
19. `retired sender domain fails`
20. `noncanonical Production origin fails: https://howlbysmd.com`
21. `noncanonical Production origin fails: https://www.howlbysmd.com`
22. `noncanonical Production origin fails: https://hwlbysmd.com`
23. `canonical Production database passes with sales closed`
24. `canonical Production database and live Stripe fixture pass`
25. `noncanonical Production Supabase project fails: https://lkxppynmdfzljuptauxf.supabase.co`
26. `noncanonical Production Supabase project fails: https://mismatched-project.supabase.co`

The harness also confirmed that no synthetic secret appeared in validator
output. This is configuration-shape proof only; it does not prove provider
objects, hosted variables, webhook reachability, or delivery.

## Supabase Staging — Verified and Pending

**Project:** `lkxppynmdfzljuptauxf`

**Health:** `ACTIVE_HEALTHY`

**Bucket:** `member-content`, private

### Verified staging state

- The HWL provider inventory now contains two intentionally isolated projects:
  staging `lkxppynmdfzljuptauxf` and dedicated Production
  `qwprhsrwiihfllmgallr`. This section describes staging only; the verified
  Production boundary is recorded separately below.
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
- The confirmed staging profile `jesse@wholebody.earth`
  (`5ea7fc5c-6e4d-476c-b301-eb9f9c8ce942`) was promoted from
  `is_admin=false` to `is_admin=true` through an exact one-row service-role
  update. A final count-only read found exactly one administrator.
- The existing signed-in Preview session opened `/admin/inquiries` and rendered
  the real inquiry ledger with the one stored record. An anonymous request was
  intercepted by Vercel SSO with HTTP 302, so the route was not publicly
  exposed through the protected Preview.
- This temporary role is project-global and has no TTL. It does not alter LIFT
  entitlement and must be manually demoted after testing or replaced by the
  approved permanent administrator before launch operations are handed off.

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
| `scripts/validate-launch-env.ts`                |      14,211 | `04c86b9f8a3742a940be8370e22cf42825b381e1bd7ccb92006c169165f1387b` |

These hashes identify the source and test bytes that passed the 55
provider-free commerce cases, 26 launch-environment cases, and rollback-only
database assertions. They complement, but do not create, the separate current
Preview Stripe and asset-delivery evidence recorded below.

- `012_commerce_launch_safety.sql` is **ledger-applied**. Hosted OpenAPI exposes
  its exact namespace columns on purchases, memberships, and Stripe Events;
  `stripe_customers` and `checkout_orders` remain reachable only through the
  intended service boundary, and `has_active_den_membership` is present. The
  earlier zero-commerce count is superseded by the September 5 exact-Preview
  proof: one paid/fulfilled checkout order, one active $11.11 purchase, and one
  signed `checkout.session.completed` receipt in the Preview sandbox namespace.
- `013_inquiries.sql` is **ledger-applied**. The private
  `inquiry_submission_limits` object exists, direct service-role table access
  returns the intended HTTP 403 / SQLSTATE `42501`, and all four narrow inquiry
  RPCs are present. The current single hosted inquiry is durably retained in
  `failed/provider_rejected` state from the pre-replacement-key test; a fresh
  accepted delivery remains pending. Live collection also requires an
  owner-approved inquiry retention and purge policy.
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

## Supabase Production — Schema and Storage Verified

**Project:** `qwprhsrwiihfllmgallr`

**Region:** `us-east-2`

**Health:** `ACTIVE_HEALTHY`

**Bucket:** `member-content`, private

- This is the owner-approved dedicated `HWLbySMD Production` boundary. The
  launch validator pins Production to this exact ref and rejects the staging
  ref or an arbitrary project ref.
- Migrations 001 through 014 were applied in order. A second migration dry run
  reported the remote database up to date with no migration, seed, or role work
  pending. No database reset, migration-history repair, seed import, or staging
  data copy was used.
- The migration-owned catalog contains the one published LIFT course and its
  seven canonical lessons. Production contains no copied staging Auth users,
  profiles, purchases, inquiries, checkout orders, Stripe Event receipts, or
  administrator grants.
- The canonical PDF is private at `member-content/lift/lift-guide.pdf`. A
  signed GET returned HTTP 200 and exactly 6,036,808 bytes with SHA-256
  `652c3c6eb6e87a44d47e5326e4e3a385d3704596a19020bc75ae318c6c117ad6`.
- The canonical video is private at
  `member-content/lift/complete-lift-v1.mp4`. A complete download returned
  exactly 46,514,399 bytes with SHA-256
  `d3d3c7a390a4b8c199ae0970533c0c14ab4327ba7d3e53d7662c895d4860bf23`;
  a signed range request returned HTTP 206 for bytes `0-1023/46514399` as
  `video/mp4`. Direct anonymous object access failed closed.
- Auth health returned HTTP 200. Signup is enabled, email confirmation is
  required, and the default Auth boundary is healthy. The Site URL is exactly
  `https://www.hwlbysmd.com`, and the redirect allowlist contains exactly one
  entry: `https://www.hwlbysmd.com/auth/callback`. Production custom SMTP and
  real signup-confirmation and password-recovery E2E remain pending.
- During bootstrap, the initial generated database password appeared in
  diagnostic process output. It was immediately treated as compromised and
  rotated. The replacement was stored without printing it, and the successful
  second no-op migration dry run reverified the rotated connection. No secret
  value is recorded in this packet.
- These checks verify Production schema, clean-state isolation, private object
  integrity, and signed object delivery. They do not verify Vercel Production
  configuration, Production application authentication, checkout, webhook
  fulfillment, entitlement, inquiry delivery, or any live Stripe transaction.

## Canonical Stripe Boundary

The authenticated Stripe account switcher and Stripe API establish this public
identifier chain:

| Object                  | Public identifier                | Verified state                                              |
| ----------------------- | -------------------------------- | ----------------------------------------------------------- |
| Live parent account     | `acct_1U9cEIPTLuM8Maxa`          | `HWLbySMD`; no active tasks; Payments/Payouts Active        |
| Live Product            | `prod_VCotDELRoHDnox`            | Active canonical LIFT Product                               |
| Live Price              | `price_1UCPFjPTLuM8MaxaTY48RO9e` | Active, live, one-time $11.11 USD                           |
| Production webhook      | `we_1UCPJEPTLuM8MaxawK9UgEHh`    | Active exact-URL four-event destination                     |
| Canonical child sandbox | `acct_1U9cEQAdcj2oNOF4`          | `HWLbySMD sandbox (HWLbySMD)` beneath the canonical parent  |
| Sandbox Product         | `prod_VACTsFboJAEOF0`            | Active LIFT Product                                         |
| Sandbox Price           | `price_1U9s49Adcj2oNOF4jcyMjyDB` | Active, `livemode=false`, one-time $11.11 USD (1,111 cents) |

The sandbox Price metadata is verified as:

- `hwl_product_id=lift_guide`
- `catalog_version=lift-complete-v2`
- `delivery=video_and_pdf`

The current read-only Stripe API check returned HTTP 200 for the refreshed
local sandbox secret and resolved to canonical account
`acct_1U9cEQAdcj2oNOF4`. It reconfirmed the Price as `active=true`,
`livemode=false`, `type=one_time`, `currency=usd`, and `unit_amount=1111` for
Product `prod_VACTsFboJAEOF0`. Secret values are intentionally omitted. This is
current sandbox provider-object and identity evidence. The distinct hosted
Checkout, signed-webhook, and fulfillment evidence is recorded immediately
below; neither evidence set is live-money proof.

A fresh authenticated read of the exact live parent account
`acct_1U9cEIPTLuM8Maxa` shows no active tasks, Payments Active, and Payouts
Active. Only Cartes Bancaires is paused. This supersedes the earlier 10%
onboarding snapshot. Active Product `prod_VCotDELRoHDnox` and active one-time
$11.11 USD Price `price_1UCPFjPTLuM8MaxaTY48RO9e` each carry exactly:

- `catalog_version=lift-complete-v2`
- `delivery=video_and_pdf`
- `hwl_product_id=lift_guide`

Active Production webhook destination `we_1UCPJEPTLuM8MaxawK9UgEHh` uses API
version `2026-08-26.dahlia`, targets exactly
`https://www.hwlbysmd.com/api/stripe/webhook`, and listens to exactly:

- `checkout.session.completed`
- `checkout.session.expired`
- `charge.refunded`
- `charge.dispute.created`

This verifies live account and provider-object configuration only. The webhook
signing secret remains hidden and uninstalled, the live API secret is not
connected, Vercel Production has no environment records, and no Production
checkout, charge, refund, dispute, or other live transaction has been tested.

The sandbox API-key page was verified in the authenticated Stripe session. The
standard test secret was rotated after each credential-exposure boundary, and
`.env.local` now contains only the final replacement. A second read-only API
check with that final key reconfirmed the exact account, Price, and Product. No
live key was viewed or changed, and no secret value appears in this packet.

The Stripe CLI was authorized directly to `HWLbySMD sandbox · sandbox`
instead of the live parent context. A restricted localhost listener was verified
for exactly `checkout.session.completed`, `checkout.session.expired`,
`charge.refunded`, and `charge.dispute.created`, forwarding to
`http://localhost:3000/api/stripe/webhook`; current process liveness is not
claimed here. Its signing secret is installed only in local `.env.local`, and
the dev server was restarted afterward. The recorded process inspection found
neither `--api-key` nor an API key value in its arguments. A separate enabled
persistent sandbox endpoint now targets
the stable checkpoint alias with a dedicated, non-default Vercel automation
bypass and exactly `checkout.session.completed`, `checkout.session.expired`,
`charge.refunded`, and `charge.dispute.created`. Its fresh signing secret is a
sensitive exact-branch Preview variable; the localhost CLI secret was not
reused. Deployment Protection remains enabled and the unqualified endpoint
returns 401. The latest READY deployment includes the complete branch-scoped
configuration. Its signed delivery, database receipt, and current-candidate
purchase passed on September 5 as recorded below. Local
`STRIPE_LIVEMODE=false` and `COMMERCE_SALES_READY=false` keep the local payment
boundary in test mode and keep local sales closed.

The exact replay, refund, dispute, evidence, and incident procedure is recorded
in [`docs/commerce-operations.md`](commerce-operations.md). That runbook is an
operating boundary, not permission to perform a provider mutation.

### September 5 exact Preview purchase and fulfillment

- The authenticated protected Preview created an $11.11 USD (1,111-cent)
  sandbox Checkout Session. Stripe records it as completed and paid on
  September 5; the PaymentIntent succeeded, the charge received and captured
  all 1,111 cents. At the September 5 verification snapshot, it was neither
  refunded nor disputed.
- The persistent exact-Preview webhook delivered a signed
  `checkout.session.completed` event. Hosted staging records its receipt, a
  paid and fulfilled checkout order with zero reconciliation attempts, and one
  active $11.11 USD purchase.
- The authenticated success path redirected to the complete seven-movement
  course. `/account` identified the confirmed purchaser, showed the active
  September 5 purchase and `Download LIFT PDF`; `/library` listed LIFT; and the
  post-purchase cart was empty.
- `/api/video/lift` returned a private Supabase signed URL. A fresh media
  request returned HTTP 206, MP4 bytes `0-1023/46514399`. The canonical PDF
  returned HTTP 200 with 6,036,808 bytes and SHA-256
  `652c3c6eb6e87a44d47e5326e4e3a385d3704596a19020bc75ae318c6c117ad6`.
- This proves the exact protected Preview's sandbox payment and fulfillment
  path. It does not prove live Stripe, Production, a current-candidate refund
  or dispute lifecycle, scheduled recovery, Cal.com submission, or Resend
  delivery.

### Prior Stripe isolated E2E evidence

The following real sandbox proof was completed before the latest shared
fulfillment-verifier hardening. It remains valuable integration evidence, but
its refund, replay, and dispute exercises remain prior-path evidence. The
September 5 transaction-bearing Preview's paid Checkout and fulfillment path
repeated; its refund, replay, dispute, and recovery paths did not.

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
  run. The canonical PDF is now byte-verified both in private staging storage
  and through the September 5 exact-Preview entitled delivery path above.
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
   packet. Preserve the now-passing exact-Preview Checkout/webhook/fulfillment
   proof and repeat the current-candidate refund, replay, and dispute paths.
2. Preserve the now-applied 001–014 ledger and no-op dry-run evidence; repeat
   schema, privilege, queue, and lease behavior through the deployed application
   boundary without reapplying or repairing migration history.
3. Preserve the verified modern Supabase server credential and canonical
   private PDF/video paths in encrypted branch-scoped Preview configuration;
   the purchase/delivery path now passes on the public custom Preview hostname.
   Repeat its refund and revocation path separately.
4. Preserve the enabled persistent Preview webhook and its four exact
   subscriptions and the now-verified signed delivery plus
   target/account/mode database receipt on the September 5 transaction-bearing
   deployment.
5. Exercise the authenticated `paid_pending` reconciliation path on the public
   Preview, including exact auth/origin/order binding, one POST/refresh, the
   60-second cooldown and three-claim ceiling, no fabricated Event receipt, and
   partial-order replay repair. Then exercise the migration-014 scheduled path:
   report, lease, missed-webhook repair, active monitoring, terminal revocation,
   retry exhaustion/manual review, stale-token rejection, and private admin
   visibility. The checkpoint now contains an aggregate-only Resend alert path,
   but its dedicated owner destination still must be selected, configured, and
   provider-tested before Production sales open. `alert_pending` remains the
   durable authority when notification is delayed or unavailable.
6. Implement and verify the accepted dispute-resolution runbook. The current
   `charge.dispute.created` behavior suspends access in `disputed` status
   pending manual review; no automatic `charge.dispute.closed` path or audited
   operator restoration control exists after a won dispute.
7. Preserve the now-active canonical live account, Product, Price, metadata,
   and exact four-event webhook boundary; securely install coherent
   Production-only API and webhook signing secrets, then run the minimal
   real-money smoke test only after separate Production approval.

The latest signed-in live-account check shows no active tasks, Payments Active,
and Payouts Active, with only Cartes Bancaires paused. The canonical live LIFT
Product, one-time $11.11 Price, and exact four-event Production webhook are
active. No private value was copied into this packet; the signing secret remains
hidden and uninstalled, the live API secret is not connected, and no Production
checkout or transaction has been tested. Provider-object readiness must not be
reported as end-to-end live-money readiness.

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

Provider publication and website discovery/embed handoff are complete. On the
exact protected Preview, an authorized Signature Facial request for September
9, 10:00–11:00 AM PDT was submitted as `HWL Launch Verification` using the
confirmed purchaser email, guest count `1`, and a nonphysical Palm Springs
launch-test location. No Cal payment was configured or collected. Cal UID
`3oRjqkAqvsqh8Sctf731br` appeared Unconfirmed with the submitted questions and
notes. While pending, public availability suppressed 10:00 AM, 11:00 AM, and
12:00 PM. The request was rejected after verification; no Upcoming booking
remained, Canceled showed Rejected, and all 10:00 AM–3:00 PM slots returned
after cache delay.

Cal settings show new events added to `FIREBIRDS` and conflicts checked against
`FIREBIRDS`, `WHOLEBODY`, `LIONWOLF`, `HWL`, `YOGA`, and `ACTOR`, with `BILLS`
off. This verifies provider configuration and pending-request slot suppression,
not direct creation of an Apple Calendar event object or a deliberate external
calendar conflict. Organizer/attendee mailbox receipt and keyboard/mobile
submission remain unverified. The earlier provider-level manual confirmation,
reschedule, cancellation, and released-slot test remains separate prior-path
evidence.

## Inquiry and Resend State

### September 5 state

- Resend domain `hwlbysmd.com` is verified. Its DKIM TXT, `send` and `rsend`
  CNAMEs, and DMARC resolve publicly while the domain's pre-existing receiving
  records remain intact.
- The replacement Resend credential is sending-only, restricted to
  `hwlbysmd.com`, and installed as a sensitive variable only for the checkpoint
  branch Preview. The READY deployment passed the environment validator with
  all 22 then-required names.
- Safe exact-Preview probes reject missing/foreign origins, non-JSON input, and
  malformed payloads before persistence or notification. Inquiry helper tests
  pass 7/7.
- Hosted staging retains one earlier synthetic inquiry with failed notification
  status and no inquiry was lost. The confirmed purchaser profile is now the
  sole, temporary staging administrator.
- Authorized inquiry `aeb5055b-9901-428d-96fa-1d8c4cc939ac` was submitted at
  `2026-09-05T17:10:59Z`. The Preview UI reported provider acceptance, and
  exact deployment `dpl_GWEuouuZBLZWKguy3HYY8bwgPRQN` logged
  `POST /api/contact` HTTP 200.
- Its Supabase row is `received` with notification `accepted`, no error,
  attempted and accepted timestamps, and a provider receipt. The signed-in
  administrator deep link rendered that exact record and `Email accepted`.
- Resend message `eaa31c57-…`, from
  `HWL by SMD <hello@hwlbysmd.com>` to Shannon's configured Gmail address, is
  marked sent and delivered at September 5, 10:11 AM. This is provider delivery
  evidence; Shannon's independent mailbox opening remains unconfirmed.
- No idempotent replay of this current submission was run. Stable same-ID replay
  therefore remains a separate E2E check.
- The temporary project-global administrator grant has no TTL and must be
  manually removed after testing or replaced by the approved permanent
  administrator. Its removal does not revoke the purchaser's LIFT entitlement.

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
- At that historical checkpoint, the protected inquiry inbox was implemented
  and the server credential was operational, but no hosted administrator
  identity existed to prove real inbox access.
- At that historical checkpoint, hosted staging had zero administrator
  profiles, and the exact configured Shannon contact address had no profile
  row. The then-required action was to name and verify an administrator and
  separately approve the narrow privilege change. This was superseded by the
  September 5 temporary-admin verification recorded in Current state above.
- The full isolated journey passed with email deliberately unconfigured: a
  valid request persisted first, notification audit became
  `not_configured/configuration_missing`, and the route returned HTTP 202 with
  `received: true`. Five rate-limited requests persisted and the sixth returned
  HTTP 429; direct anon/authenticated table reads were denied; a verified admin
  could read the durable record; an anonymous admin request was redirected.
- A fresh hosted staging submission also returned HTTP 202 and persisted one
  inquiry. Its Resend notification was rejected and the durable row moved to
  `notification_status=failed`; no inquiry was lost. At that historical
  checkpoint, hosted staging had zero administrator profiles, so the row was
  not yet available to a verified human inbox user.

The safe launch target is: save the inquiry first, return success after that
save, and use Resend only to notify Shannon. A Resend outage must not lose the
inquiry.

## September 5 Preview Release Candidate — Dated Transaction Evidence

### Dated external baseline and requirements

- Exact pushed checkpoint `9912291ad5dc9dba98dec78bbf59409b4d1d4a28` on
  `checkpoint/platform-overhaul-2026-08-20` passed GitHub CI run `33977575309`.
  Vercel deployment `dpl_GWEuouuZBLZWKguy3HYY8bwgPRQN` is READY for that exact
  SHA, and a fresh inspection resolves `preview.hwlbysmd.com` to it. Re-resolve
  the branch alias after any later push rather than treating this deployment ID
  as permanently current. The current September 6 deployment identity is
  recorded at the top of this packet.
- `preview.hwlbysmd.com` is verified, correctly CNAME-configured, TLS-valid,
  and follows the latest READY checkpoint deployment. Deployment Protection
  redirects anonymous traffic to Vercel SSO; authenticated Vercel access reaches
  application HTTP 200.
- All 22 required branch-scoped configuration names exist. Runtime probes show
  the single `$11.11` LIFT offer with `checkoutReady:true`, an anonymous
  same-origin checkout reaching the login boundary rather than readiness 503,
  hostile origins rejected, non-launch membership closed, and unsigned webhook
  input rejected.
- At that checkpoint, private Vercel SSO, the confirmed staging purchaser
  login, and the Stripe purchase/fulfillment journey passed on the exact custom
  hostname. The
  inquiry persistence/Resend/admin journey and Cal request/slot-suppression/
  rejection cleanup also pass there. Remaining Preview work includes human
  mailbox confirmation, inquiry replay, direct Cal destination-object proof,
  and the post-login keyboard/mobile and operations checks.

### Historical first-attempt evidence (superseded where noted)

At that point, checkpoint `c74fe61` was pushed to
`origin/checkpoint/platform-overhaul-2026-08-20`; the then-local documentation
commits were not yet pushed. The first automatic Preview,
`dpl_3ZEfnCQJ9MxsYTS6zR98bEZvmiuo`, failed safely at the launch environment
validator before application compilation. At that moment both
`RESEND_API_KEY` and the persistent `STRIPE_WEBHOOK_SECRET` were absent, so the
validator rejected the incomplete provider configuration. The last Ready
Preview at that point was `dpl_AhkgfivPDCowE55gCFdewiC6ax7d` at older commit
`555cead`; it was not the launch candidate.

At that first-attempt checkpoint, twenty-one of the 22 required variables
existed as sensitive records scoped only to
`checkpoint/platform-overhaul-2026-08-20`:

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
not value-correctness or runtime evidence. At that time, `RESEND_API_KEY` was the
only missing required name. Marketplace terms had been accepted, but Marketplace
Free resource creation was rejected because that plan was disabled; the direct
Resend Free account/key was still pending. The hosted Stripe signing secret
belonged to the dedicated persistent sandbox endpoint; the ephemeral localhost
Stripe CLI authority was not copied into Preview.

At that moment, Production had zero environment-variable records and
`preview.hwlbysmd.com` was not assigned to a deployment. The checkpoint branch
alone was pushed; no custom-domain, DNS, `main`, or Production mutation
occurred.

### Preview policy and the next checkpoint at that time

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
any Preview action. Its 16/16 policy fixtures pass and require Auth boundary
tests to remain in CI. The last explicitly recorded clean repository-only
post-push preflight in this dated section passed on exact checkpoint `9912291`,
where local HEAD matched its tracked upstream. At that time all 22 then-required
branch-scoped Preview names existed and the deployed sandbox-open environment
preflight passed. Every later candidate must repeat clean repository/full
validation for its own reviewed checkpoint. Passing repository or configuration
policy is not permission to push `main`, promote Production, or change a
provider.

This validator proves configuration shape only. Hosted staging schema and asset
existence are verified separately above; signed-webhook/paid entitlement,
inquiry/Resend delivery, and Cal.com submission now have distinct exact-Preview
proof. Their explicitly listed residual human-mailbox, replay, and
destination-object checks remain separate gates. Staging and Production now use
separate HWL Supabase projects. The validator pins Production to
`qwprhsrwiihfllmgallr` and rejects the staging or an arbitrary ref; the
Production environment inventory remains empty. The dedicated Production
project's migration, clean-state, and private-asset checks pass, but the
Production application profile intentionally remains closed until its Auth,
SMTP, environment, webhook, and E2E gates pass. The optional captions path is
empty by default and may remain unset until a VTT object and its signed route
pass.

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
3. Preserve the verified Vercel SSO and confirmed staging-purchaser login proof
   on `preview.hwlbysmd.com`; never share credentials in chat.
4. Preserve the passing cart, sandbox Checkout, signed webhook, entitlement,
   video, and PDF proof. Exercise reconciliation, duplicate/replay,
   partial/full refund, dispute, scheduled recovery, and the private
   reconciliation-admin status view on that exact host.
5. Submit one valid inquiry and prove database-first receipt, Resend acceptance,
   stable retry/idempotency, and Shannon's human receipt. Preserve the passing
   temporary-admin ledger view and protected anonymous boundary, then manually
   demote the temporary administrator after testing or execute the separately
   approved permanent-admin handoff.
6. Complete a website-originated Cal.com booking and prove manual confirmation,
   deliberate conflict suppression, the FIREBIRDS destination write,
   cancellation/rescheduling, organizer/attendee human emails, keyboard/mobile
   interaction, and fallback behavior.
7. Preserve the verified Production Site URL and sole Production callback
   entry. Configure and verify Supabase custom SMTP, review any separate
   staging/Preview callback boundary, then prove signup confirmation and
   password recovery with a non-team address.
8. Restore `COMMERCE_SALES_READY=false` if any provider, access, notification,
   calendar, isolation, accessibility, or operational check fails.

No direct push to `main` is authorized or required for this workflow.

## Production and Live Payments — Pending

Production remains closed until all of the following are true:

- The owner approved a dedicated `HWLbySMD Production` Supabase boundary.
  Project `qwprhsrwiihfllmgallr` was created on September 5 in `us-east-2`, and
  the validator now pins Production to that exact ref. Its modern API-key pair
  is held in Keychain without being printed. Migrations 001–014 are applied and
  a second dry run is a no-op. The canonical private PDF and video are uploaded
  and byte/range verified. Auth health/defaults pass, and no staging user,
  transaction, inquiry, or temporary-admin state was copied. Production Auth
  uses exact Site URL `https://www.hwlbysmd.com` and the sole redirect allowlist
  entry `https://www.hwlbysmd.com/auth/callback`. Custom SMTP,
  signup/recovery E2E, and application E2E remain pending.
- Vercel Production currently has zero environment-variable names. Install a
  separately scoped, coherent Production set only after the new database,
  protected storage, Auth, and sender boundaries are verified. Keep
  `COMMERCE_SALES_READY=false` throughout the closed Production smoke test.

- The canonical live Stripe account `acct_1U9cEIPTLuM8Maxa` now reports no
  active tasks, Payments Active, and Payouts Active; only Cartes Bancaires is
  paused. This clears the account-activation gate, not the application-commerce
  gates below.
- Active live Product `prod_VCotDELRoHDnox` and active one-time $11.11 USD
  Price `price_1UCPFjPTLuM8MaxaTY48RO9e` carry the exact canonical LIFT metadata
  on both objects.
- Active live webhook destination `we_1UCPJEPTLuM8MaxawK9UgEHh` targets exactly
  `https://www.hwlbysmd.com/api/stripe/webhook`, uses API version
  `2026-08-26.dahlia`, and subscribes only to `checkout.session.completed`,
  `checkout.session.expired`, `charge.refunded`, and
  `charge.dispute.created`. Its signing secret is secured in Keychain but is not
  yet installed in Vercel Production, so no Production delivery is claimed.
- Production does **not** yet have the coherent live Stripe, Production
  Supabase, inquiry, and sender environment required by the launch validator.
  The private storage boundary is verified independently; it does not make the
  application environment complete.
- The exact Preview candidate has passed all end-to-end tests.
- Migration 014 is applied. Its deployed cron, durable retry/manual-review
  behavior, and private admin status view still need to pass in the exact
  Production namespace.
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
were previously approved and read-verified. The current hardened application's
exact-Preview paid Checkout and fulfillment journey now passes. These approvals
remain outstanding:

1. **Stripe live credentials and release:** the canonical account, $11.11
   Product/Price, metadata, and exact four-event webhook are active. The owner
   approved secure retrieval and Vercel Production installation of the live API
   and webhook secrets while sales remain closed; both are now secured in
   Keychain and installation awaits the complete sender configuration. The
   minimal live smoke transaction and opening sales still require separate
   approval after the closed-gate Production app passes. Active provider objects
   are not transaction proof.
2. **Inquiry retention:** choose and publish a specific retention period and
   purge cadence before live inquiry collection; no automatic-deletion claim
   will be made until that policy and implementation are verified.
3. **Permanent administrator handoff and temporary cleanup:** the owner chose
   exactly `shannon@hwlbysmd.com` and `admin@ghosthand.studio` as permanent
   Production administrators. Neither account exists in Production Auth yet;
   configure SMTP, send separate invitations, require confirmation, and elevate
   only the exact matching UUID/profile pairs. Staging now has exactly one
   administrator: the owner-approved, confirmed `jesse@wholebody.earth`
   profile. Its real Preview inquiry-inbox access is verified, and an anonymous
   request was intercepted by Vercel SSO. Because the role is project-global
   and has no TTL, manually demote this temporary profile after remaining
   Preview testing or explicitly retain it through launch and schedule immediate
   post-launch demotion. Demotion does not affect its LIFT entitlement.
4. **Supabase Auth delivery:** preserve the verified Production Site URL
   `https://www.hwlbysmd.com` and its sole callback
   `https://www.hwlbysmd.com/auth/callback`. Configure custom SMTP from the
   verified HWL sender domain, review any separate staging/Preview callback
   boundary, disable SMTP link tracking, review Auth rate limits, and verify
   signup confirmation plus password recovery with a non-team address.
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
   The owner-approved sandbox payment now proves signed delivery, staging
   receipt, fulfillment, and private media. Reconfirm at action time the valid
   inquiry and Cal.com booking submissions needed to prove Resend acceptance,
   destination-calendar behavior, and human notifications.
8. **Production:** separately approve live environment configuration and
   promotion after reviewing the tested Preview packet.
9. **Git:** no `main` push is authorized. Any later request to merge or push
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
- Private Supabase Auth review configuring custom SMTP while preserving the
  now-verified canonical Production Site URL and sole callback allowlist entry;
  also confirm disabled link tracking and appropriate email rate limits, then
  run one non-team signup-confirmation and password-recovery delivery test.
- Distinct `INQUIRY_RATE_LIMIT_SECRET` and `CRON_SECRET` values are installed as
  sensitive checkpoint-branch Preview records. Production still needs its own
  independently generated values after separate approval; neither value may be
  copied into source, this packet, or another environment.
- Production-only live Stripe API secret and the existing webhook destination's
  hidden signing secret; neither is installed yet, and sandbox credentials must
  never be copied into the Production namespace.
- Shannon's cancellation, rescheduling, no-show, and late-arrival terms for the
  now-published Cal.com services.

## Launch Sequence

1. Preserve the verified staging ledger 001–014, current no-op dry-run,
   commerce/inquiry/reconciliation schema boundaries, and byte-identical private
   PDF/video evidence; do not reapply or repair migration history.
2. Preserve the dedicated Production project's verified 001–014 ledger,
   second no-op dry run, empty user/transaction/admin boundary, and
   byte/range-verified private canonical assets. Preserve its exact canonical
   Site URL and sole callback allowlist entry; complete custom SMTP and real
   signup/recovery E2E without copying staging data.
3. Preserve the September 5 transaction-bearing Preview's passing Stripe
   sandbox purchase, signed webhook, entitlement, and canonical media proof as
   dated evidence. Repeat purchase, refund, dispute, and replay on the current
   candidate; run the scheduled
   report/repair/monitoring path and verify the private reconciliation-admin
   status view and manual-review alert routing.
4. Repeat DB-first inquiry receipt on staging, then verify the configured Resend
   delivery without making email the receipt boundary.
5. After the administrator-dependent Preview tests, manually demote the
   temporary `jesse@wholebody.earth` grant or complete the separately approved
   permanent-admin handoff. Re-read the exact profile and total administrator
   count; if the temporary role is explicitly retained through launch, perform
   and verify the demotion immediately afterward.
6. Preserve the published Cal.com configuration and test all three schedule
   families through the website, including conflict blocking, manual
   confirmation, cancellation, rescheduling, and notification delivery.
7. Preserve the reviewed, pushed checkpoint candidate and its READY protected
   Preview; complete the remaining post-login end-to-end and accessibility
   checks on that exact deployment.
8. Preserve the verified live Stripe account, Product, Price, metadata, and
   exact four-event webhook boundary. Securely install the live API and webhook
   signing secrets in a coherent Production-only environment without attempting
   a transaction.
9. Present the final Preview evidence. Promote to Production only after the
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
  verification. The September 5 transaction-bearing Preview passed canonical
  Stripe sandbox purchase, signed-webhook fulfillment, active entitlement, and
  canonical private video/PDF delivery. The current Preview still needs purchase,
  refund, dispute, replay, and scheduled-recovery exercises. The isolated DB-first
  inquiry journey passes. Hosted
staging now has the verified 001–014 ledger, current schema/RPC boundaries, and
byte-identical canonical private PDF/video assets. Dedicated Production
Supabase now has the same 001–014 migration boundary, a second no-op dry run,
clean user/transaction/admin state, and byte/range-verified private canonical
assets. Its Auth health/defaults pass, while custom SMTP and real
signup/recovery E2E remain pending. Its Site URL is exactly
`https://www.hwlbysmd.com`, and its sole redirect allowlist entry is
`https://www.hwlbysmd.com/auth/callback`. The canonical Stripe live account
reports no active tasks and Payments/Payouts Active, with only Cartes Bancaires
paused; its canonical live Product, one-time $11.11 Price, and exact four-event
webhook are active with matching metadata. The webhook signing secret remains
hidden and uninstalled, the live API secret is not connected, the Production
environment is empty, and no Production checkout or transaction has been
tested. The remaining work is the public provider and release proof:
coordinated retirement of the compromised staging legacy Supabase key,
deployed cron execution, valid inquiry delivery and human inbox receipt,
temporary-administrator cleanup or permanent-admin handoff, Cal.com website
booking E2E, owner acceptance of the recovery cadence and alert routing, the
dispute manual review/resolution runbook, the remaining post-login
mobile/keyboard/provider journeys on the current protected Preview, secure live
Stripe credential installation, closed-gate Production application E2E, and
explicit Production approval.

## September 5 Production Preparation — Dated Evidence Record

This section supersedes older point-in-time statements above that say Vercel
Production is empty, live provider credentials are uninstalled, or Supabase
custom SMTP is pending. It does not supersede the separate gates for moving the
public domain, opening sales, or running a live-money transaction.

The owner explicitly approved two restricted Resend Production keys, the
Production Supabase SMTP save, a closed-sales Vercel Production configuration,
and invitations for exactly `shannon@hwlbysmd.com` and
`admin@ghosthand.studio`.

Completed and verified:

- Resend has two distinct sending-only keys, both restricted to the verified
  `hwlbysmd.com` domain: `HWLbySMD Production App` and
  `HWLbySMD Production Auth SMTP`. Their values are stored only in macOS
  Keychain under separate accounts. The one-time local transfer files were
  deleted and the browser automation session that held their values was reset.
- Dedicated Supabase Production project `qwprhsrwiihfllmgallr` has custom SMTP
  enabled and persisted with sender `HWL by SMD <hello@hwlbysmd.com>`, host
  `smtp.resend.com`, port `465`, username `resend`, and a 60-second minimum
  interval. The password field is intentionally unreadable after save. The
  canonical Site URL and sole callback remain `https://www.hwlbysmd.com` and
  `https://www.hwlbysmd.com/auth/callback`.
- Vercel Production contains the exact 22-name launch contract as sensitive,
  Production-only records. It uses the dedicated Production Supabase project,
  canonical live Stripe account/Product/Price/webhook, canonical private LIFT
  paths, Production Resend application key, independent inquiry and cron
  secrets, and canonical Cal.com profile. `COMMERCE_SALES_READY=false` and
  `STRIPE_LIVEMODE=true` remain deliberate and coherent.
- The actual remotely injected Vercel Production environment passed the launch
  preflight in closed-sales mode. SEO validated 21 pages, 21 metadata records,
  and seven long-form documents; Next.js 16.3.1 compiled and generated all 62
  routes.
- Source commit `d4e8023` adds server-side `token_hash` verification for
  allowlisted `type=invite` callbacks while preserving browser-initiated PKCE
  code exchange. Invite success removes the token from the URL and requires an
  authenticated session before `/update-password` renders its form. External
  `next` destinations and unsupported token types fail closed. The Auth suite
  passes 34/34, and booking 6/6, inquiries 7/7, commerce 55/55, launch-env 26
  cases, TypeScript, ESLint, SEO, and a complete local Production build pass.
- Isolated Production-target deployment
  `dpl_eML5nygjGV8cZ5w4aouU43yLHKn8` is READY at
  `https://hwl-by-ebzq8pkcz-whole-body-earth.vercel.app`. It was created with
  custom-domain assignment skipped. Home, LIFT, booking, login, and anonymous
  password routes return HTTP 200 with the new presentation; anonymous account
  and library routes redirect to login; anonymous video and captions return
  401; anonymous PDF delivery redirects to login; an invalid invite token
  redirects to sanitized login feedback without retaining the token; unsigned
  Stripe webhook traffic returns 400; and a same-origin valid LIFT checkout
  request returns the intended closed-sales 503 before authentication or Stripe
  Session creation. Error/fatal runtime log count was zero during this smoke
  pass.
- The public `www.hwlbysmd.com` alias still resolves to legacy deployment
  `dpl_6uHzaSNDmqeU1Zmk6CZ5Jg6Yt8f5`. No custom domain moved, no Production
  checkout Session or charge was created, sales were not opened, and `main`
  was not pushed.
- A fresh trusted read of the dedicated Production project returned zero Auth
  users, zero profiles, and zero administrators. Neither approved permanent
  administrator email exists yet, so no role elevation is possible before the
  invitation and human-confirmation steps.

The two approved invitation emails have not been sent yet. Supabase's current
Invite User template still uses `{{ .ConfirmationURL }}`, which returns an
implicit-flow fragment that is incompatible with the app's SSR PKCE client.
Sending now could consume a one-time invitation without establishing the
secure cookie needed to choose a password. Before sending:

1. Save a Production Invite User template whose link targets
   `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=invite&next=/update-password`.
2. Obtain explicit owner approval to assign the already tested closed-sales
   deployment to `www.hwlbysmd.com`; this is a public Production promotion but
   does not open payments.
3. Re-smoke the canonical domain with sales closed, then send the two exact
   invitations.
4. Each human accepts the link and chooses their own password. No operator
   creates, stores, or shares an administrator password.
5. Re-read each confirmed Auth UUID and its matching profile email, dry-run the
   exact one-row elevation, then grant `is_admin=true` only to those two
   owner-approved identities. Verify both admin sessions and real sign-out.

Opening payments remains a later, separate approval. After the closed-domain
Auth, inquiry, booking, and administrator tests pass, change
`COMMERCE_SALES_READY=true` only under that approval and conduct the separately
approved $11.11 live-money smoke transaction.

## September 5 Read-Only Operational Audit — Dated Evidence Record

This addendum supersedes older point-in-time statements about current Cal.com
publication, Production inquiry infrastructure, and checkpoint CI. It records
read-only verification only: no booking, inquiry, email, invitation, alias
change, Checkout Session, or charge was created.

Checkpoint and deployment evidence:

- Pre-addendum checkpoint `f114e74` was synchronized with
  `origin/checkpoint/platform-overhaul-2026-08-20`, and its GitHub Actions run
  `34000326727` completed successfully. Audit-only addendum commit `19f822f`
  was then pushed to the same checkpoint branch; run `34000972709` also
  completed successfully in 1 minute 22 seconds. Lint, TypeScript, SEO, launch
  and Preview environment policy, inquiry, booking, accessibility, Auth,
  commerce, dependency audit, and Production compile steps all passed.
- The closed-sales isolated Production-target deployment remains
  `dpl_eML5nygjGV8cZ5w4aouU43yLHKn8`, READY in `iad1`, with zero error/fatal
  runtime logs in the audited window. It was built from runtime source commit
  `d4e8023`; the two later checkpoint commits modify this launch packet only.
- `www.hwlbysmd.com` has not been reassigned. It still serves legacy deployment
  `dpl_6uHzaSNDmqeU1Zmk6CZ5Jg6Yt8f5`, so no Production invitation or
  transactional E2E should be started there yet.

Cal.com evidence at that snapshot:

- The public `hwlbysmd` profile and event-types API expose exactly ten intended
  events, all public and exact-matched by the website: Reiki Aromatherapy
  Healing (45 minutes), Signature Facial (60), Beauty & Being Ritual (90),
  Wild Glow Luxury Facial (120), Private Yoga + Sound (60), Private Sound
  Healing (75), Private Yoga (90), Intuitive Tarot Reading (60), Moon Oracle
  Reading (60), and Tarot + Reiki Experience (75).
- Every event reports an always-confirm policy, blocks its requested slot while
  unconfirmed, has seats disabled, and reports a zero Cal.com price. The event
  copy truthfully says payment is arranged separately. Every event requires
  attendee name, email, guest count, and session location. Tarot and Moon offer
  Cal Video or attendee address; the other eight request attendee address.
- All ten events retain 48-hour notice, 60-minute buffers before and after, and
  a rolling 30-day window. Public slot queries in
  `America/Los_Angeles` returned real availability for all three schedule
  families. Representative current results were Signature Facial with 42 slots
  across seven dates, Private Yoga with 12 slots across six dates, and Moon
  Oracle Reading with 10 slots across two Sundays in the queried window.
- Browser accessibility-tree inspection confirmed enabled date and time
  controls, timezone presentation, duration, location mode, and the visible
  `Requires confirmation` state. Intuitive Tarot exposed Sunday times from
  noon through 4:00 PM; Private Yoga exposed Friday times at 9:00 AM, 10:30 AM,
  and noon. No slot was selected or submitted.
- `Wild Glow Express Facial` remains intentionally inquiry-only because the
  catalog specifies 15–20 minutes per guest with a four-person minimum rather
  than a truthful fixed reservation duration. The website exposes no guessed
  Cal.com event for it.
- Public evidence cannot independently prove private destination-calendar or
  conflict-calendar settings. Earlier authenticated provider evidence records
  `FIREBIRDS` as destination, the approved six conflict calendars, and the
  completed request, suppression, rejection, confirmation, reschedule,
  cancellation, and slot-release exercises. Current human mailbox delivery,
  direct Apple Calendar object creation, deliberate external conflict blocking,
  keyboard submission, and mobile touch submission remain outstanding.

Production inquiry evidence at that snapshot:

- The isolated candidate's contact endpoint has no successful Production POST
  history; the only observed request was a safe GET returning 405. Production
  `public.inquiries` contains zero rows. This audit intentionally sent no email
  and introduced no personal data.
- Production Supabase Auth health and settings return 200, email Auth is
  enabled, and automatic email confirmation is disabled. Anonymous reads of
  both inquiry tables are denied.
- Applied migration 013 retains the intended least-privilege boundary: direct
  service-role SELECT is limited to `public.inquiries`; the private rate-limit
  table denies direct reads even to service role; and only the four narrow
  record, claim, stale, and completion RPCs are executable by service role.
  The local inquiry boundary suite passes 7/7.
- `/api/contact` validates same-origin JSON, a 16 KB body ceiling, UUIDv4
  submission identity, field lengths, and service prerequisites before durable
  receipt. It persists first, then claims one notification attempt with a
  deterministic idempotency key. Ambiguous provider outcomes remain
  `audit_unknown` instead of being presented as delivered or automatically
  duplicated.
- A full Production inquiry pass still requires the canonical alias on this
  candidate, at least one confirmed permanent administrator, an approved and
  published retention/purge procedure, and one explicitly authorized test
  submission. That single test must prove HTTP 200 with notification
  `accepted`, exactly one matching database row, exactly one Resend acceptance,
  one human mailbox receipt without submitted PII in the alert body, signed-in
  access to the same record, and signed-out denial.

No public-release boundary changed during this audit. The next ordered gate is
still: save the token-hash invitation template; separately approve and assign
the tested closed-sales candidate to `www.hwlbysmd.com`; re-smoke the canonical
domain; send the two already approved invitations; have both humans choose
their own passwords; and elevate only the exact confirmed UUID/profile pairs.
Opening sales and a real $11.11 transaction remain separate later approvals.

## September 5 Inquiry-Retention Safety Addendum — Dated Evidence Record

This addendum supersedes the preceding inquiry-retention and invitation-template
status only. It does not authorize migration 015, a public alias change, an
invitation, opening inquiry collection, opening sales, or a live charge.

- The owner approved one inquiry policy: website inquiry content becomes
  eligible for deletion 12 months after submission and is purged during a
  monthly review operated by `admin@ghosthand.studio`; holds are limited to
  active service, legal, safety, or dispute needs; pseudonymous rate-limit
  fingerprints use a 30-day cutoff; the intake limit is five accepted
  submissions per client identity per hour; and journal requests remain
  private consent inquiries rather than mailing-list subscriptions.
- Migration 015 is a reviewed local candidate but remains unapplied. It adds
  constrained hold state, owner/postgres-only review and exact-set purge
  functions, deterministic 30-day fingerprint cleanup, a database-enforced
  five-request ceiling, and an append-only aggregate run ledger. Its
  provider-free contract suite passes, while the rollback-only transactional
  SQL suite remains unexecuted until an isolated database or separately
  authorized staging application is available.
- The public Privacy page now states the approved eligibility, monthly purge,
  hold, fingerprint, journal-consent, and managed-backup boundaries with an
  effective date of September 5, 2026. The operating runbook keeps inquiry
  collection closed until migration proof, owner/postgres operator access, the
  private append-only decision log, monthly reminder ownership, and provider
  backup expiry are evidenced.
- A separate build-time gate,
  `NEXT_PUBLIC_INQUIRY_COLLECTION_READY`, now fails closed unless its value is
  exact lowercase `true`. When closed, `/api/contact` returns HTTP 503 with
  `received:false` and `Cache-Control:no-store` before reading the body or
  constructing persistence/provider clients. Contact, retreat, journal, and
  alternate-time booking forms render truthful paused states; live Cal.com
  dates and times remain available.
- Local browser evidence confirms Signature Facial still exposes enabled Cal
  dates and six time buttons while alternate-time collection is absent.
  Contact, retreat, and journal surfaces expose no inquiry controls. A local
  same-origin POST returned the expected no-store 503 and the server recorded
  no successful submission.
- Local verification passes: inquiry tests 16/16, launch-environment fixtures
  32/32, booking tests 6/6, accessibility test 1/1, full ESLint, TypeScript,
  formatting, diff checks, SEO 21 pages / 21 metadata records / 7 long-form
  documents, and the Next.js 16.3.1 Webpack Production build with all 62 routes.
- A new `.vercelignore` prevents local secrets, all `private-content` paid
  media, local QA captures, generated review files, and local build/tool state
  from entering CLI deployment bundles. The final dry manifest contained 412
  source files and zero private-content, local-QA, PEM, or key-like paths; only
  the intentionally public `.env.example` remained.
- Exactly one branch-scoped Preview record and one Production record now exist
  for `NEXT_PUBLIC_INQUIRY_COLLECTION_READY`, both created as sensitive
  records. Vercel CLI does not return sensitive values through `env run`, so
  their exact build-time value must be proven by the next remote validator log;
  no readiness claim relies on the CLI's redacted empty result.
- The Supabase Invite User template is now saved and reload-verified with the
  secure token-hash callback to `/auth/callback` and
  `next=/update-password`. No invitation has been sent.
- Before and after these changes, both `www.hwlbysmd.com` and `hwlbysmd.com`
  still resolve to legacy READY Production deployment
  `dpl_6uHzaSNDmqeU1Zmk6CZ5Jg6Yt8f5`. The public alias was not moved, sales
  remain closed, no live Checkout Session or charge was created, and no
  invitation or inquiry was sent.

The next safe engineering step is a checkpoint-only commit, push, green CI,
and a fresh isolated Production-targeted deployment built with both sales and
inquiry collection closed. Because public readiness flags are fixed at build
time, the earlier candidate `dpl_eML5nygjGV8cZ5w4aouU43yLHKn8` must not be
promoted. Assigning a new candidate to the public alias requires a fresh exact
owner approval after its deployment ID and closed-state smoke evidence are
presented.

## September 6 Closed-Sales Production Cutover — Production Evidence Record

This addendum supersedes earlier statements about the public aliases, the
current checkpoint commit, the isolated Production candidate, and exact Stripe
Product/Price binding proof. It does not open sales or inquiry collection,
authorize a live charge, apply migration 015, grant an administrator role, or
claim end-to-end Production email delivery.

Release source and validation:

- Checkpoint commit `a0152df52570197601260dbe02ffac88aa7988c8` pins the
  verified live Stripe Product `prod_VCotDELRoHDnox` and one-time $11.11 Price
  `price_1UCPFjPTLuM8MaxaTY48RO9e` in the launch validator. Production builds
  now reject any different encrypted Product or Price value even while sales
  remain closed. Runtime checkout behavior was not changed.
- The commit is synchronized only with
  `origin/checkpoint/platform-overhaul-2026-08-20`; `main` was not pushed.
  GitHub Actions run `34044940931` completed successfully for the exact commit.
  Its lint, TypeScript, SEO, launch/Preview policy, inquiry, booking,
  accessibility, Auth, commerce, dependency-audit, and Production compile
  steps all passed.
- Local verification also passed: launch environment 36/36, ESLint,
  TypeScript, SEO for 21 pages / 21 metadata records / seven long-form
  documents, and the Next.js 16.3.1 Webpack Production build with all 62
  routes.

Production deployment and public cutover:

- Production-target deployment `dpl_6TUjj1aEiJgyD3oLTDocdfZmnKAz` is READY
  in `iad1`. It was built with `--skip-domain` from the exact checkpoint
  commit before public assignment. Its remotely injected Production
  environment passed the strengthened exact Stripe binding validator with
  `COMMERCE_SALES_READY=false` and
  `NEXT_PUBLIC_INQUIRY_COLLECTION_READY=false`.
- Under fresh owner direction to show the new site live, only
  `hwlbysmd.com` and `www.hwlbysmd.com` were reassigned from legacy deployment
  `dpl_6uHzaSNDmqeU1Zmk6CZ5Jg6Yt8f5` to the new deployment. Both aliases were
  then resolved independently back to `dpl_6TUjj1aEiJgyD3oLTDocdfZmnKAz`.
  The apex redirects to the canonical `https://www.hwlbysmd.com` origin.
- Home, LIFT, booking, and login return HTTP 200 from both public hostnames.
  The public homepage rendered the approved Shannon-led hero and navigation;
  the LIFT page rendered one $11.11 Video + PDF offer and an accessible cart
  sheet. Browser inspection reported zero application console errors on the
  homepage and LIFT surface.
- The public rollback gate passed: a valid same-origin LIFT checkout POST
  returns the intended closed-sales HTTP 503; a same-origin contact POST
  returns the intended closed-inquiry HTTP 503 with `received:false`; and
  anonymous LIFT video access returns HTTP 401. No Checkout Session, charge,
  inquiry row, or email was created. The deployment reported no error or fatal
  runtime logs in the audited window, so no alias rollback was required.

Booking evidence on the public site:

- `/book` exposes all eleven catalog services truthfully: ten exact Cal.com
  event types and the intentionally inquiry-only Wild Glow Express Facial.
  Selecting Signature Facial loaded its embedded, keyboard-addressable
  September calendar with enabled dates and six visible times from 10:00 AM
  through 3:00 PM, plus a direct Cal.com fallback link and an email fallback
  while website inquiries remain paused.
- Current provider reads show exactly ten public `hwlbysmd` event types, all
  requiring manual confirmation and using no Cal-native payments. Beauty,
  Yoga/Sound, and Tarot schedule families expose the approved live
  availability in `America/Los_Angeles`.
- No fresh appointment was submitted during this cutover. Human notification,
  destination/conflict-calendar behavior, confirmation, reschedule, and
  cancellation remain current Production lifecycle evidence gaps.
- The embedded Cal.com client emits four provider-side warnings, including a
  deprecated styling-prop warning and Cal-owned preload/client warnings. It
  emits no browser errors, and these warnings do not block date/time selection.

Provider state after cutover:

- Live Stripe account `acct_1U9cEIPTLuM8Maxa`, Product
  `prod_VCotDELRoHDnox`, one-time $11.11 Price
  `price_1UCPFjPTLuM8MaxaTY48RO9e`, and the four-event Production webhook are
  active. The deployment build now proves its encrypted Product/Price bindings
  exactly. No live payment has occurred, so live checkout, webhook,
  entitlement, signed delivery, refund, or dispute behavior is not yet proven.
- Supabase Production project `qwprhsrwiihfllmgallr` is healthy in
  `us-east-2`. Schema effects for migrations 010–014 are live. The private
  `member-content` bucket contains the canonical 6,036,808-byte PDF and
  46,514,399-byte MP4; signed range reads return 206, direct anonymous reads
  are denied, and the object sizes match the local canonical assets.
- Migration 015 is not applied. Its retention columns, aggregate run table,
  and owner-only retention RPCs are absent. Its existing-row maximum-count
  precondition could not be inspected with the deliberately least-privilege
  service credential; application will therefore rely on the migration's
  atomic constraint check if separately authorized.
- Neither `shannon@hwlbysmd.com` nor `admin@ghosthand.studio` exists in
  Production Auth or profiles. The two previously approved invitations were
  not sent because a current read of the Production Site URL and redirect
  allowlist was unavailable. The secure token-hash Invite User template was
  previously saved and verified, but a fresh Dashboard check is required
  before consuming the one-time links.
- Resend currently reports `hwlbysmd.com` Verified, two distinct restricted
  Production sending keys, and zero Production key usage. Production inquiry
  and Auth SMTP delivery therefore remain configured-but-unproven, not green.

Security follow-up:

- During the read-only Stripe sandbox audit, a stored Preview webhook URL
  returned its Vercel automation-bypass query credential and an audit mapper
  displayed that credential in model-visible output. No Stripe API key,
  webhook signing secret, Production credential, payment data, or customer
  data was exposed. The value is not reproduced here.
- Treat that Preview bypass credential as compromised. Before relying on the
  Preview webhook again, create a replacement automation-bypass secret, update
  only the sandbox Preview Stripe endpoint, verify without returning the URL or
  query string, and revoke the old bypass. Production aliases and the
  Production webhook are unaffected.

Next ordered gates:

1. Sign in to the Production Supabase Dashboard and re-verify the canonical
   Site URL and callback allowlist; then send the two already approved exact
   invitations. Each human chooses their own password before any exact-UUID
   administrator elevation.
2. Separately approve and apply migration 015, verify its least-privilege
   boundary, and establish the owner-operated monthly retention procedure
   before opening website inquiry collection.
3. Separately approve the Preview bypass rotation and sandbox webhook URL
   update described above.
4. Submit and cancel one authorized Cal.com test appointment to prove the
   current human notification and calendar lifecycle.
5. Only after those operational gates, separately approve opening Production
   sales and complete one owner-driven $11.11 live purchase through webhook,
   entitlement, video/PDF delivery, and refund-state verification.

## September 6 Cal.com Production Lifecycle Proof — Cal Evidence Record

This addendum supersedes earlier statements that the current Production
booking lifecycle was untested. It does not prove Shannon's organizer-mailbox
receipt, a direct FIREBIRDS calendar-object inspection, or any Cal-native
payment flow.

- The owner authorized a temporary public-site booking using
  `admin@ghosthand.studio`. The Production `/book` experience submitted an
  Intuitive Tarot Reading request for Sunday, September 27, 2026 from
  12:00–1:00 PM Pacific with Cal Video, guest count `1`, a clearly non-client
  virtual test location, and launch-verification notes.
- The attendee confirmation page stated that the request still required host
  approval. The authenticated organizer queue showed exactly one matching
  Unconfirmed booking. Shannon's host-side **Confirm** action succeeded and
  generated a Cal Video meeting.
- A fresh public availability read then showed only 3:00 PM and 4:00 PM for
  that date, proving that the confirmed noon booking and its configured
  60-minute before/after buffers suppressed conflicting times.
- The organizer rescheduled the confirmed appointment to 1:00–2:00 PM with a
  stated launch-test reason. Cal's success page stated that an updated email
  calendar invitation was sent to everyone, and a fresh public availability
  read showed only 4:00 PM, proving the rescheduled appointment and buffers
  were active.
- The organizer canceled the temporary appointment with a stated completion
  reason. Cal's final page reported **This event is canceled**; the organizer
  dashboard showed no upcoming bookings and retained the test lifecycle in
  Canceled history. A cache-busted public availability read restored all five
  Sunday slots from 12:00 PM through 4:00 PM.
- A later authenticated provider-side reinspection confirmed that Cal's
  **Canceled** bookings view still retains both the original 12:00 PM request
  and the rescheduled 1:00 PM lifecycle entry for `Ghosthand Admin Test`, with
  the launch-verification note and generated Cal Video meeting links. This
  closes the Cal-dashboard persistence check; it is not evidence of Shannon's
  separate organizer-mailbox delivery or the FIREBIRDS calendar object.
- The owner confirmed that the attendee calendar invitation arrived at
  `admin@ghosthand.studio`. This closes the attendee human-mailbox gate; it
  does not independently prove delivery to Shannon's organizer mailbox.
- A subsequent non-submitting Production keyboard check activated September 27
  and the 12:00 PM slot with Enter inside the embedded Cal frame. The complete
  attendee-details form appeared, and Enter on Back restored all five available
  times. Confirm was never activated, so no booking was created. Runtime output
  contained no errors and only two Cal-owned warnings. Mobile pointer/touch
  activation remains a separate evidence gap.
- No Cal.com payment was configured or collected. The complete
  request → manual confirmation → reschedule → cancellation → released-slot
  lifecycle passes on the public Production booking surface. Human inspection
  of Shannon's organizer inbox and direct inspection of the FIREBIRDS calendar
  object remain separate evidence gaps.

## September 6 Security and Migration Follow-up — Dated Evidence Record

- The owner-approved Preview automation-bypass rotation completed without
  rollback. A replacement credential passed the protected route probe; only
  the sandbox webhook URL was updated; the same idempotent Stripe test event
  returned HTTP 200 before and after the old credential was revoked; the old
  credential was then rejected while the replacement remained valid.
  Production Stripe, domains, aliases, deployments, environment variables,
  signing secrets, application code, and `main` were untouched.
- The exact migration 015 candidate passed its 16 inquiry-policy tests and a
  full transactional staging rehearsal ending in `ROLLBACK`; the test request
  returned HTTP 201 and staging retained neither schema nor ledger effects.
- Production now contains exact ledger versions 001–015. The ordinary
  `us-east-2` session-pooler path timed out before authentication even with the
  rotated password and DNS-over-HTTPS, but a credential-safe native dry run
  through the reachable transaction-pooler endpoint listed only
  `015_inquiry_retention.sql`. The already-approved exact migration then applied
  successfully; a second native dry run returned `upToDate:true` with no
  pending migrations, and the remote ledger lists matching local/remote
  versions 001 through 015. Catalog-only verification confirms the two
  retention columns, RLS-enabled aggregate run table, partial index, validated
  constraints, triggers, SECURITY INVOKER functions, fixed function settings,
  and the intended absence of PUBLIC/anon/authenticated/service-role authority.
  Aggregate counts remain zero for inquiries, submission limits, and retention
  runs, with no inquiry content read.
- The database password was sourced ephemerally from its existing Keychain
  item through `PGPASSWORD`; it never appeared in command arguments, stdout,
  or a file. The Management API, direct SQL, and manual migration-ledger edits
  were not used, so local version `015` remains the canonical remote version.
- Fresh exact-working-tree safety suites pass: booking 14/14, commerce 55/55,
  and inquiries 16/16. Production sales and website inquiry collection remain
  fail-closed while their separate launch gates are completed.
- A fresh authenticated live Stripe read at `2026-09-06T19:41:15.548Z`
  confirms the canonical `HWLbySMD` account
  `acct_1U9cEIPTLuM8Maxa` has payments, payouts, card payments, and transfers
  active with no disabled reason. Product `prod_VCotDELRoHDnox` and one-time
  USD 1,111-cent Price `price_1UCPFjPTLuM8MaxaTY48RO9e` are active and carry
  the exact `lift-complete-v2`, `video_and_pdf`, and `lift_guide` metadata. The
  enabled webhook `we_1UCPJEPTLuM8MaxawK9UgEHh` targets exactly
  `https://www.hwlbysmd.com/api/stripe/webhook` and subscribes only to the four
  approved checkout/refund/dispute events. Complete live-mode listings contain
  zero Checkout Sessions, PaymentIntents, charges, refunds, or disputes and
  zero captured amount. This proves configuration readiness, not a live sale;
  the application commerce gate remains closed.
- An authenticated Production Supabase read confirms Pro-plan managed daily
  physical database backups with PITR disabled and a rolling seven-day
  customer-accessible recovery window. Completed restore points were visible
  at `2026-09-05 18:34:35 UTC` and `2026-09-06 07:58:54 UTC`. Seven days is the
  recovery boundary, not an exact provider-attested physical-erasure timestamp.
  Database restores do not restore Supabase Storage object bodies, and any
  restore or clone from before an inquiry purge must remain closed until the
  retention purge is rerun and verified.
- A fresh authenticated Production dashboard read shows exactly one Auth user
  and one UUID-matched profile for each of `shannon@hwlbysmd.com` and
  `admin@ghosthand.studio`. Both Auth records still show no confirmation and no
  sign-in; both profiles remain `is_admin=false`. Shannon's invitation is
  provider-delivered. Delivery of the Ghosthand invitation was delayed, and an
  earlier authenticated diagnostic rendered that message's one-time invite URL.
  It was not opened, used, or persisted in the repository; the Ghosthand
  invitation is treated as compromised and must be invalidated and reissued
  before acceptance. Administrator elevation remains prohibited until each
  exact Auth user is independently confirmed.

## September 6 Runtime, Dependency, and Cal Resilience Refresh — Superseded Candidate Record

- A fresh Production deployment read at approximately `2026-09-06T20:30Z`
  confirms `dpl_6TUjj1aEiJgyD3oLTDocdfZmnKAz` remains READY in `iad1` from
  checkpoint commit `a0152df52570197601260dbe02ffac88aa7988c8`. Both public
  aliases resolve to it, and the apex redirects to canonical `www`. Home,
  LIFT, booking, login, contact, and store returned HTTP 200. Checkout and
  inquiry collection remain intentionally closed, while anonymous video and
  PDF access remain denied or redirected to sign-in.
- The exact deployment lifetime log scan contained five non-fatal outbound
  `fetch failed` events (`ETIMEDOUT`, `ECONNRESET`, or `UND_ERR_SOCKET`) on
  otherwise successful page requests; one explicitly named `api.cal.com`.
  No commerce-route runtime errors, fatal events, or unexpected 5xx responses
  were present. The public calendar was available during the subsequent live
  browser check, but transient Cal discovery failure could temporarily remove
  a live calendar from a service page.
- The checkpoint now contains a narrow Cal resilience repair: when the public
  event-type discovery request succeeds, its exact slug, title, and duration
  matches remain authoritative; only when discovery is unavailable do the ten
  catalogued exact-event services use their known direct Cal.com URLs. An
  available empty provider response remains empty, and inquiry-only Wild Glow
  never receives a guessed calendar. Booking tests pass 20/20, TypeScript and
  ESLint pass, the Production build passed, and a local browser check rendered
  the Intuitive Tarot calendar with five September 27 appointment times and no
  application errors. Checkpoint code commit
  `183fafb7d94158b916e10046688c150aa2e373de` is pushed without touching
  `main`; GitHub CI run `34058763334` passed every step, including the 20-case
  booking suite and Production compile. Exact-SHA Preview deployment
  `dpl_Byncu496TCeRSDPdrPz6hFVvgWRj` is READY and assigned to
  `preview.hwlbysmd.com`. The protected Preview rendered the same live calendar,
  direct Cal.com fallback, and five appointment times with no application
  errors; only the two previously observed Cal-owned warnings remained. Its
  post-check error-log scan returned no events.
- A fresh registry audit of clean, synced checkpoint `322bc18867158405a292c502fd7a14e7a74a6dc6`
  reported zero advisories in both the full 560-record dependency tree and the
  141-dependency Production graph. GitHub's default branch remains the older
  `main` commit `a6902607f42a3c66506758d4886fb4a2d61d99e2` and currently has
  24 open Dependabot alerts (11 high, 12 moderate, one low). Those alerts apply
  to the stale default-branch lockfile, not this checkpoint or the deployed
  candidate. Clearing the GitHub banner requires a separately authorized,
  reviewed merge to `main`; this launch continuation does not push `main`.
- Production returns HSTS, `nosniff`, SAMEORIGIN framing, strict-origin
  referrer handling, and a restrictive camera/microphone/geolocation policy.
  It does not yet send a Content Security Policy. That is a high-priority
  defense-in-depth follow-up rather than a standalone launch blocker on the
  present evidence. A generic enforced policy is not being added during
  launch: it could break Next bootstrap and JSON-LD, Cal's script/iframe,
  Supabase Auth and signed media, Mux, or OpenStreetMap. Introduce a
  privacy-safe report-only policy in Preview, exercise every provider flow,
  then narrow and enforce it separately.
- A same-session Production Auth refresh still shows both intended permanent
  accounts unconfirmed and never signed in. `admin@ghosthand.studio` therefore
  still needs an owner-approved in-place reinvite that invalidates the exposed
  former token; neither profile may receive `is_admin=true` until its exact
  Auth record is independently confirmed.

## September 6 Cal Provider Confirmation and Safety Candidate — Current Authority

- A fresh Production browser read of
  `/book?service=intuitive-tarot-reading` rendered the live September 27
  calendar and all five 12:00–4:00 PM appointment choices. A fresh authenticated
  Cal.com provider read then confirmed that **Canceled** history retains both
  the original noon request and its rescheduled 1:00 PM lifecycle entry for
  `Ghosthand Admin Test`, including the launch-verification note and generated
  Cal Video links. Combined with the already-confirmed attendee invitation and
  restored public slots, the public selector → manual confirmation → reschedule
  → cancel → released-inventory test passes. No test booking remains active and
  Cal collected no payment. Shannon's organizer-mailbox receipt, the direct
  FIREBIRDS calendar object, and a real mobile tap-through remain separate
  evidence gaps.
- The local checkpoint candidate now tests the private inquiry boundary beside
  the service-role read. A confirmed Supabase Auth user must own the exact
  UUID-matched `is_admin=true` profile; signed-out, unconfirmed, non-admin,
  mismatched, and demo identities cannot reach live inquiry data. The DAL
  returns only the fields rendered by the inbox and rejects malformed rows.
- The local checkpoint candidate also adds aggregate-only commerce recovery
  alerts through the existing restricted Resend sender. The dedicated
  `COMMERCE_ALERT_TO_EMAIL` never falls back to the public inquiry recipient;
  strict single-recipient validation gates Production-open builds. Messages
  contain only environment, aggregate counts, and the protected admin-store
  link. Idempotency is scoped to the privacy-safe digest of the complete
  canonical payload, UTC day, and environment so exact retries deduplicate
  without colliding with changed same-day state or routing. Known
  durable alerts still attempt notification when later reconciliation work
  fails, and the network timeout is bounded by the 60-second function envelope.
  Alert failure remains nonfatal because the database signal is authoritative.
- Current local verification passes: booking 20/20, Auth 40/40, inquiries
  21/21, commerce 74/74, launch-environment 41 cases, Preview policy 16/16,
  TypeScript, ESLint, SEO, and the complete 62-route Next.js 16.3.1 Production
  build. The Auth and alert changes are pushed at exact commit `9c4ee87`, passed
  exact-SHA CI run `34061716861`, and are deployed READY on exact protected
  Preview `dpl_drJRbTBZbA4scmptFfE5QZU8nzxQ`. The rendered signed-out Auth
  boundary passes there, but the commerce-alert provider delivery and a
  confirmed-admin inquiry read on this exact candidate remain untested.
  Production sales and website inquiry collection remain closed. Before sales
  open, the owner must name the commerce-alert recipient; missed-cron detection
  and alert acknowledgement remain separate operational follow-ups.

## September 6 Isolated Closed-Sales Production Candidate — Current Deployment Evidence

- Clean, upstream-synchronized checkpoint
  `f90f723b8a440d1ee1443d9b7ebf7374af34bdd9` was uploaded through the Vercel
  CLI as isolated Production-target deployment
  `dpl_5kVoUdY95gDGhBTN2HLw7b45iorN` at
  `hwl-by-lgumivcke-whole-body-earth.vercel.app`. Vercel reports target
  `production` and state `READY`. Because this was a manual CLI upload, Vercel
  exposes no Git SHA in the deployment metadata; exact-source provenance is
  the clean local checkout and operator record rather than Vercel-attested Git
  metadata.
- The remote build reported no `.env.local`, passed the actual encrypted
  Production environment contract in **closed sales** mode, reported website
  inquiry collection closed, validated 21 pages / 21 metadata records / seven
  long-form documents, compiled with Next.js 16.3.1, completed TypeScript, and
  generated all 62 route/page entries. The only build warning is the already
  recorded optional LIFT captions follow-up.
- Public traffic was not moved. `hwlbysmd.com` and `www.hwlbysmd.com` remain
  assigned to `dpl_6TUjj1aEiJgyD3oLTDocdfZmnKAz`, while
  `preview.hwlbysmd.com` remains assigned to exact tested Preview
  `dpl_drJRbTBZbA4scmptFfE5QZU8nzxQ`. The isolated candidate has only the
  project-default Vercel alias.
- Authenticated `vercel curl` checks against the isolated candidate returned
  HTTP 200 for `/`, `/beauty/lift`,
  `/book?service=intuitive-tarot-reading`, and `/login`.
- A valid same-origin `lift_guide` checkout request returned the intended
  closed-sales HTTP 503 before authentication, database reservation, or Stripe
  Session creation. A same-origin contact request returned the intended
  closed-inquiry HTTP 503 with `received:false` before body parsing,
  persistence, or Resend delivery.
- Anonymous LIFT video and captions reads returned HTTP 401. Anonymous PDF
  delivery returned HTTP 307 to `/login?redirectTo=/library` without following
  the redirect. An unsigned Stripe webhook returned HTTP 400 with the expected
  missing-signature response, proving the runtime commerce configuration is
  present while reaching no provider or database transition. Unauthenticated
  commerce and relationship-health cron requests each returned HTTP 401 before
  either job ran.
- The post-probe runtime scan found zero error-level events and zero
  warning-level events. Its four 5xx entries were the two deliberately repeated
  checkout/contact HTTP 503 safety canaries; there were no unexpected 5xx
  responses.
- At the time this isolated candidate built, Production and checkpoint-branch
  Preview each contained the same 23 required pre-open environment-variable
  names and lacked `COMMERCE_ALERT_TO_EMAIL`. On September 6 the owner approved
  `admin@ghosthand.studio` as the exact commerce-recovery alert recipient,
  consistent with that identity's operational-super-admin and migration-015
  inquiry-retention-operator responsibilities. The value was added as
  sensitive server-side configuration to Production and only the checkpoint
  Preview branch; fresh name-only Vercel inventories show it as `Encrypted` in
  both exact scopes without exposing the value. Shannon's separate
  permanent-site-admin and Stripe public-contact roles do not replace that
  routing decision. Existing immutable deployments do not receive later
  environment changes. The checkpoint Preview credential was aligned to the
  local protected-test value and a fresh Preview rebuild consumed the updated
  branch snapshot; no Production deployment consumed either change. Sales,
  website inquiry collection, Production promotion, live payment, and
  administrator elevation remain closed.
- Commit `9878c7b4361cb43fc75173c6ad929ebf09b00ea1` passed CI run
  `34068152717` and built as READY Preview
  `hwl-by-oieo38us1-whole-body-earth.vercel.app`. A Preview-only temporary
  commerce-alert probe returned HTTP 401 without its exact bearer and performed
  no provider call. After the branch-only credential refresh, the rebuilt
  Preview `hwl-by-2wm3j1m0v-whole-body-earth.vercel.app` returned HTTP 200 with
  only `{ "kind": "accepted" }` for the authorized aggregate alert. One exact
  same-day retry returned the same sanitized result. The restricted
  `HWLbySMD checkpoint Preview` Resend key recorded one new `/emails` POST with
  HTTP 200 rather than two; its linked email shows the expected Preview subject,
  `sent` status, one pending-alert count, zero manual-review count, the protected
  `/admin/store` review path, and no customer, order, payment, or provider
  identifier. This proves accepted, idempotent provider submission, not human
  delivery: `ghosthand.studio` still has no MX record. The temporary route was
  removed immediately after this evidence. Clean commit
  `2b0300a7f0e42cae08770f70aa4712240bfd6f77` passed CI run `34069185243` and
  built as READY Preview `hwl-by-aw07246k8-whole-body-earth.vercel.app`. Its
  home, LIFT, selected-service booking, and login routes each returned HTTP 200;
  the retired probe returned HTTP 404 on both that exact deployment and
  `preview.hwlbysmd.com`.
- A fresh authenticated Production Supabase read reconfirmed Site URL
  `https://www.hwlbysmd.com`, the sole redirect URL
  `https://www.hwlbysmd.com/auth/callback`, the token-hash Invite User template,
  and enabled custom SMTP through `smtp.resend.com` on port 465. A bounded
  two-email SQL count returned exactly one Auth row, one profile, and one
  UUID/email match for each approved administrator identity. Both remain
  pending invitations with zero confirmed users, zero prior sign-ins, and zero
  profiles with `is_admin=true`; the total Production administrator count is
  zero. The query returned no tokens, timestamps, passwords, sessions, raw
  metadata, UUIDs, or unrelated identities. The owner subsequently approved an
  in-place Ghosthand reinvitation. The existing user's filtered Auth log records
  one new `/invite` request completed with HTTP 200, and Resend records one new
  `You've been invited` message to the same address at
  `2026-09-06 23:26:34.393000+00`. That newest message has status
  `delivery delayed`; a fresh DNS query returned no MX record for
  `ghosthand.studio`, so human receipt is not yet proved and no additional
  resend is authorized while the provider attempt remains active. No deletion
  or elevation was performed. Authority is resolved:
  `admin@ghosthand.studio` remains the operational super admin and the exact
  migration-015 inquiry-retention operator, while `shannon@hwlbysmd.com` is the
  permanent site administrator. The application itself has one administrator
  tier, `public.profiles.is_admin`; “operational super admin” describes
  governance and operating authority, not a second application privilege tier.
  Neither profile may be elevated until that exact human accepts their own
  invitation and the matching Auth identity is independently confirmed.
- An aggregate-only Production inquiry query returned zero `inquiries`, zero
  `inquiry_submission_limits`, and zero `inquiry_retention_runs`. No inquiry
  content was selected and no row was written. The unsaved SQL audit tabs were
  discarded after the checks.
- In the canonical live Stripe account, the public business/support email was
  observed blank. The owner selected `shannon@hwlbysmd.com` as that public
  Stripe contact, but an automated form fill was not completed. No provider
  update is claimed; saving and rereading the value remains pending human/UI
  completion. This public Stripe contact is separate from the commerce-alert
  destination and the application's administrator tier.
- Public Resend DNS remains present and the authenticated provider dashboard
  reports `hwlbysmd.com` verified. The restricted Production Auth SMTP key
  shows recent use, while the separate restricted Production App key still
  shows no activity. This proves SMTP provider use, not human receipt of both
  invitations or application inquiry/commerce-alert delivery. The compromised
  former Ghosthand invitation/link must not be accepted. The newly issued
  replacement invitation is the only acceptable link, but Resend currently
  reports its delivery as delayed and `ghosthand.studio` currently has no MX
  record. Neither identity may be elevated before the corresponding human
  acceptance and independent Auth confirmation.
- A fresh authenticated Cal.com recheck confirmed zero Upcoming and zero
  Unconfirmed bookings. Canceled history still retains the authorized
  `Ghosthand Admin Test` noon request and rescheduled 1:00 PM lifecycle. The
  current Production embed and direct public event page both exposed five
  September 27 Sunday openings from noon through 4:00 PM Pacific for Intuitive
  Tarot Reading. The noon slot opened the attendee form with manual
  confirmation, Cal Video or attendee-address location, required attendee
  email, guest-count and session-location fields, and no Cal payment. The check
  backed out without activating Confirm; no new request was created and the
  organizer queues remained empty.
- A follow-up 390×844 Production browser check exercised the embedded Cal.com
  calendar with pointer activation: next-month navigation, October 11 date
  selection, noon time selection, the required attendee form, and Back all
  worked. October 11 retained all five noon-through-4:00 PM openings afterward,
  and the organizer still showed zero Upcoming and zero Unconfirmed bookings.
  This closes browser-level mobile pointer activation without claiming a
  physical-device touch test.

## September 6 Current-Checkpoint Closed-Sales Candidate Rebuild

- Clean checkpoint `c226155814e2cf0012c702f4e796525cf81573b4` was uploaded
  as isolated Production-target deployment
  `dpl_9pXgahHvEuTjRjsem6joeLhTWHCN` at
  `hwl-by-hgeiorkx2-whole-body-earth.vercel.app`. Vercel reports target
  `production`, region `iad1`, and state `READY`. The deployment received only
  the project-default Vercel alias; `hwlbysmd.com` and `www.hwlbysmd.com`
  remained on the existing public deployment, and `preview.hwlbysmd.com`
  remained on the exact tested Preview. No custom domain was reassigned.
- The remote build consumed the current 24-name Production environment,
  including encrypted `COMMERCE_ALERT_TO_EMAIL`, and found no local
  `.env.local`. The actual remote launch validator passed in Production closed
  mode with `COMMERCE_SALES_READY=false` and
  `NEXT_PUBLIC_INQUIRY_COLLECTION_READY=false`. SEO validation covered 21
  pages, 21 metadata records, and seven long-form documents; Next.js 16.3.1
  compiled successfully, TypeScript passed, and all 62 route/page entries were
  generated. The only build warning remains the optional LIFT captions storage
  follow-up.
- Authenticated deployment-protection smoke checks returned HTTP 200 for `/`,
  `/beauty/lift`, `/book?service=intuitive-tarot-reading`, and `/login`. A valid
  same-origin `lift_guide` checkout request returned the intentional closed-sales
  HTTP 503 before authentication or Stripe access. A valid same-origin contact
  request returned the intentional closed-inquiry HTTP 503 with
  `received:false` before persistence or Resend access. Anonymous LIFT video
  returned HTTP 401; anonymous PDF delivery returned HTTP 307 to the scoped
  library login; an unsigned Stripe webhook returned HTTP 400; and both cron
  endpoints returned HTTP 401 without their bearer.
- The post-smoke deployment log read returned zero error-level and zero
  warning-level events. Its complete 5xx result contained only the two expected
  safety canaries: one `/api/checkout` HTTP 503 and one `/api/contact` HTTP 503.
  No live Checkout Session, payment, booking, inquiry row, provider email,
  entitlement, reconciliation run, or administrator change was created.
- Stripe still does not display a saved public customer-support email in the
  canonical live account. The owner reconfirmed
  `shannon@hwlbysmd.com` as the canonical Stripe business and customer-support
  email. The provider form remains a human-completion gate: save that exact
  value and reread it before opening sales. Do not change Stripe login,
  representative, payout ownership, or purchaser receipt addressing.

## September 6 Isolated Production Inquiry Delivery Proof

- A separate one-off Production-target deployment
  `dpl_39p34r8PwjQD6Sq1hCtN9sUJ7886` was built from checkpoint
  `e9d4a2b5263ecc50c709b742029aa1a3e83f0115` at
  `hwl-by-p31dou91d-whole-body-earth.vercel.app`. Only that immutable deployment
  received build-time and runtime
  `NEXT_PUBLIC_INQUIRY_COLLECTION_READY=true` overrides. The global Production
  environment remained closed, sales remained closed, and neither public HWL
  custom domain moved. Both the deployment URL and the project-default Vercel
  alias redirect anonymous visitors to Vercel SSO, so the open test surface is
  not publicly reachable.
- One clearly labeled launch-verification inquiry with submission receipt
  `8d758562-2a7a-4910-9af6-3d0d86f39f76` returned HTTP 200 with
  `received:true` and notification `accepted`. One exact replay returned the
  same terminal receipt. A service-key read that selected only audit fields for
  that receipt returned exactly one Production row: source `website-inquiry`,
  status `received`, notification `accepted`, no error code, and a present
  provider receipt. No contact details or message content were selected.
- Resend recorded exactly one new `HWL by SMD · New private inquiry` message for
  the two identical requests. It was sent from the restricted HWL sender to the
  configured Shannon mailbox and reached provider status `delivered` at
  September 6, 5:47 PM Pacific. The email contains only the private inquiry ID,
  source, protected admin-inbox link, and the explicit omission notice; it does
  not include submitted contact details or message content. This proves durable
  Production persistence, provider acceptance and delivery, and replay
  idempotency. Human opening and confirmed-admin rendering remain pending.
- The one-off deployment reported zero error-level and zero warning-level
  runtime events after the accepted request and replay. Public Production still
  renders the paused inquiry experience and its API remains fail-closed until a
  separately approved build is created with the public readiness flag enabled.

## September 6 Production Legacy Supabase-Key Incident

- During a masked API-key inventory intended to support the aggregate inquiry
  audit, Supabase CLI unexpectedly emitted the dedicated Production project's
  complete legacy `service_role` JWT without the documented reveal flag. The
  value is not repeated, committed, or used by this application; it may remain
  in restricted execution-audit output and must now be treated as compromised.
- The current repository and launch validator require modern
  `sb_publishable_…` and `sb_secret_…` credentials and explicitly reject legacy
  JWT-shaped application keys. Both current remote Production builds passed
  that validator. The repository contains no JWT-shaped key, the dedicated
  Production project reports zero Edge Functions, and the app has no identified
  mobile, desktop, worker, or third-party Supabase client. These checks support
  legacy-key retirement but cannot prove the absence of an undocumented
  external caller.
- Supabase documents legacy-key deactivation as reversible. The next security
  action requires explicit owner approval: deactivate the legacy anon and
  `service_role` API keys for Production project `qwprhsrwiihfllmgallr`, then
  immediately re-smoke Auth, inquiry persistence, private asset access, and the
  closed-sales candidate. Re-enable only as an alias-free rollback if a verified
  dependency fails. Do not rotate the Auth JWT signing key as part of this
  narrower action.

## September 6 Administrator-Mail Routing Recheck

- Resend's authenticated Receiving inbox contains the delivered Supabase
  invitation addressed to `shannon@hwlbysmd.com`. This proves the domain's
  current AWS inbound SMTP MX can receive mail into the Resend workspace. The
  private one-time invitation link was not opened, copied, or exposed; Shannon
  must accept it herself and choose her own password before any administrator
  elevation. Resend Receiving is a dashboard/API inbox, not a conventional
  human mailbox or forwarding destination, so long-term support-email handling
  still needs an explicit operating decision.
- `ghosthand.studio` remains on Porkbun nameservers with no MX. Its root DNS
  includes a Proton verification token, which is consistent with a previously
  started custom-domain setup but does not prove current paid-account access.
  The preferred permanent fix is to complete that Proton configuration if the
  owner can access it; the fastest fallback is a Porkbun `admin` forwarding
  rule to an explicitly named monitored inbox. Do not use Resend inbound as the
  Ghosthand human mailbox, and do not issue another Supabase invitation until a
  cross-provider test message reaches the selected destination.
- A fresh sanitized Auth read still finds exactly the two approved Production
  identities, both unconfirmed and never signed in. Their two matching profiles
  both remain `is_admin=false`, and the total administrator count remains zero.

## September 6 Evening Launch Recheck

- The checkpoint worktree remains clean and exactly synchronized with
  `origin/checkpoint/platform-overhaul-2026-08-20` at
  `c6e578518bb2d9272769dbf2f91f950083066c5b`. `main` and `origin/main` remain
  unchanged at `a6902607f42a3c66506758d4886fb4a2d61d99e2`. GitHub CI run
  `34071737636` passed for the exact checkpoint SHA. A fresh local pass also
  completed ESLint, TypeScript, all 218 Auth/booking/commerce/inquiry/launch
  boundary tests, the repository-only synchronized Preview preflight, SEO for
  21 pages and 21 metadata records, and the Next.js 16.3.1 Webpack Production
  build with all 62 route/page entries.
- The complete 11-page canonical LIFT guide was rendered again from
  `private-content/lift/lift-guide.pdf`. All pages are legible and free of
  clipping or overlap defects. Page 6 contains the corrected Jawline Lift
  support statement; page 9 contains distinct Lymphatic Sweep and Neck Release
  instructions. Its current 6,036,808-byte SHA-256 remains
  `652c3c6eb6e87a44d47e5326e4e3a385d3704596a19020bc75ae318c6c117ad6`,
  matching the previously byte-verified private Production object. No PDF was
  edited or re-exported.
- A fresh public Cal.com API read returned exactly ten visible event types. All
  titles, slugs, fixed reservation lengths, and three approved schedule IDs
  still match the website catalog. Every event still uses 48 hours' notice,
  60-minute before/after buffers, `always` confirmation that blocks unconfirmed
  requests, zero Cal payment, required `guestCount` and `locationDetails`
  questions, and the approved per-family daily caps. The current public
  Production embed rendered the Intuitive Tarot attendee form with Cal Video
  or attendee-address choice and its two required custom questions; Confirm was
  not activated and no booking was created.
- Public `hwlbysmd.com` and `www.hwlbysmd.com` still resolve to older READY
  Production deployment `dpl_6TUjj1aEiJgyD3oLTDocdfZmnKAz` at source
  `a0152df52570197601260dbe02ffac88aa7988c8`. The current exact-checkpoint
  Preview is READY at `dpl_4d2GYhrrXWc3dURugWtxCFbqBdnJ` and remains behind
  Vercel sign-in protection. The intended closed-sales Production candidate
  remains READY at `dpl_9pXgahHvEuTjRjsem6joeLhTWHCN`, source
  `c226155814e2cf0012c702f4e796525cf81573b4`, with no HWL custom alias. The
  public site and intended candidate both validate as live Stripe mode with
  sales and inquiry collection closed. Their public pages return HTTP 200;
  same-origin checkout and inquiry canaries return the intentional HTTP 503.
- The canonical live Stripe account remains Active with Payments and Payouts
  capabilities active. Its Complete LIFT Product and exact one-time USD $11.11
  Price remain active with the required `lift_guide` / `video_and_pdf`
  metadata. The clean Production webhook remains active at the canonical public
  path for the four required events, but it has zero deliveries this week and
  there are still zero live payments. Therefore no live checkout, webhook,
  entitlement, or delivery success is claimed. Stripe still shows blank public
  support email, support URL, Privacy URL, and Terms URL, with its refund/legal/
  support display toggles off. The owner has selected
  `shannon@hwlbysmd.com` as the Stripe business/customer-support email; it must
  still be saved and reread in Stripe without altering the separate login,
  representative, or payout identities.
- The sandbox retains exactly three $11.11 test PaymentIntents: one intact
  success, one disputed, and one fully refunded. Its current webhook health is
  not green: three `checkout.session.completed` deliveries returned HTTP 200,
  while six `checkout.session.expired` attempts returned HTTP 503. During this
  read-only audit the stored Preview endpoint rendered its Vercel automation-
  bypass query credential into restricted tool output. The value is not
  repeated or present in the repository and must be treated as compromised.
  Before another sandbox lifecycle rehearsal, rotate only that Preview
  automation-bypass credential, update only the sandbox webhook destination and
  any authorized automation client, prove signed HTTP 200 delivery, and revoke
  the old credential. Live Stripe keys, the live webhook signing secret,
  Production aliases, and Production environment are outside this incident.
- Production Supabase still has the legacy JWT anon/service-role keys enabled.
  A modern-secret aggregate read reconfirmed exactly one Auth user and one
  profile for each approved identity. `shannon@hwlbysmd.com` remains the
  permanent administrator and `admin@ghosthand.studio` the operational super
  admin/retention operator; both are still unconfirmed, have never signed in,
  and remain `is_admin=false`. The isolated Production inquiry proof remains
  exactly one durable `received` row with notification `accepted` and no error.
  Public inquiry collection remains closed. Legacy-key retirement, both human
  invitation acceptances, exact-identity elevation, public inquiry opening, the
  closed-candidate alias move, and the first owner-driven live $11.11 purchase
  all remain explicit launch gates.

## September 6 Stripe Business Email Clarification and Launch Recheck

- The owner identified `shannon@hwlbysmd.com` as Shannon's canonical HWLbySMD
  Stripe business email in addition to her permanent site-administrator
  identity. This does not change the separate Stripe representative, login, or
  payout identities. It also does not silently reroute the website's existing
  inquiry-recipient setting; that delivery path remains unchanged pending an
  explicit mailbox or forwarding decision and end-to-end receipt proof.
- This owner selection is not Stripe persistence evidence. A fresh
  sanitized live-account read still found the public support email, support
  URL, Privacy URL, and Terms URL blank, with the refund/legal/support Checkout
  display controls off. The separate Stripe representative email was observed
  unchanged and was not treated as the owner-selected customer-facing business
  contact. A human must save the four approved public-details values and enable
  the three display controls before the first live sale.
- The same read reconfirmed the active live $11.11 one-time LIFT Price, active
  Product, clean four-event Production webhook, zero live webhook deliveries,
  and zero live payments. No live Checkout Session, charge, entitlement, or
  fulfillment proof exists yet. The sandbox webhook remains enabled for the
  four exact events, but its compromised Preview-bypass destination was not
  inspected or replayed; rotation still requires the previously stated narrow
  approval.
- Public Vercel aliases still resolve to READY deployment
  `dpl_6TUjj1aEiJgyD3oLTDocdfZmnKAz` at source
  `a0152df52570197601260dbe02ffac88aa7988c8`. The protected Preview remained
  READY at `dpl_A1DBaVXCsbU648xpEwfNJiY5Rkys`, exact source
  `50159f4a75f3e5e61ee6262d6d38e7e89d19ab65` before this clarification.
  Public checkout and inquiry canaries remained intentionally closed;
  authenticated Preview checkout stopped at scoped login and created no order
  or Session.
- Cal.com still exposes exactly ten catalog-matching event types with live
  time selection, required guest-count and location questions, manual
  confirmation, 48-hour notice, one-hour buffers, approved per-family daily
  caps, and no Cal payment. A fresh public interaction reached the attendee
  form and backed out without submitting. Supabase Production remains current
  through migration 015, but both legacy JWT keys are still enabled and both
  approved administrator identities remain unconfirmed, never signed in, and
  `is_admin=false`. No provider, alias, payment, booking, invitation, or
  privilege mutation was made during these rereads.

## September 8 Overnight Launch Audit

- The checkpoint branch now centralizes the runtime launch authority for the
  exact public site, dedicated Production Supabase project, canonical live
  Stripe account, one active LIFT Product, one active one-time $11.11 Price,
  private LIFT PDF/video objects, Resend sender, recovery recipient, and
  deployment target. Runtime checks reject placeholders, whitespace-padded
  values, legacy Supabase JWT keys, noncanonical Stripe mode or identifiers,
  unsafe or duplicate storage paths, and missing or reused operational
  secrets. Closing `COMMERCE_SALES_READY` blocks only new Checkout Sessions;
  signed webhook intake, reconciliation, refund/dispute handling, fulfillment,
  and existing-order inspection remain available.
- The final local authority snapshot passes all 116 commerce checks and all 54
  launch-environment fixtures, plus TypeScript, ESLint, and `git diff --check`.
  The complete accessibility (6/6), Auth (55/55), booking (85/85), inquiry
  (21/21), Preview policy (19/19), and 21-page SEO suites also pass. The fresh
  Next.js 16.3.1 Webpack Production build after the final authority edits also
  passes, generating all 63 static entries. The offline dependency
  audit reports zero cached vulnerabilities; a fresh registry-backed audit was
  not authorized and is not claimed.
- The current booking catalog contains eleven published Cal.com services with
  live date/time selection, local-timezone display, required attendee location
  and guest-count questions where applicable, manual Shannon confirmation,
  and no Cal payment. Wild Glow Express Facial is an individual 20-minute,
  $111 in-person booking, not a group or per-guest retreat service. The website
  intentionally collects no payment while reserving an appointment.
- Automatic post-appointment invoicing is not implemented. For this launch,
  Shannon must manually create and send a Stripe Invoice or Payment Link after
  completing a service. A future Cal.com-to-Stripe workflow must prove
  idempotency, amount authority, cancellation handling, and email delivery
  before it can replace this manual boundary.
- Production Supabase is on modern publishable and secret keys. Direct Auth,
  database, and private-storage canaries passed with the modern keys; the
  retired legacy anon and `service_role` keys returned HTTP 401. The two
  approved administrator identities still require human acceptance/sign-in
  and exact-identity elevation: `admin@ghosthand.studio` as operational super
  admin and `shannon@hwlbysmd.com` as permanent HWL administrator. Neither is
  currently a proven active administrator.
- The canonical live Stripe Product and one-time $11.11 Price are active and
  the four-event Production webhook is configured, but there is still no live
  Checkout charge or signed live webhook delivery. Public sales must remain
  closed until one owner-driven purchase proves Checkout, webhook HTTP 200,
  durable paid order, entitlement, private video range playback, PDF delivery,
  wrong-user denial, and duplicate suppression. A full-refund/revocation test
  requires separate authorization. Partial refunds retain access; full refunds
  revoke access; disputed purchases remain suspended for manual review.
- The tax treatment of the $11.11 digital product still requires an owner or
  accountant decision; Checkout does not silently enable Stripe Tax. The
  recovery recipient `admin@ghosthand.studio` has not passed human mailbox
  receipt proof and previously had no MX, so it cannot yet be treated as a
  reliable operations alert destination. Production reconciliation and an
  external missed-cron monitor must also be proven; the owner must accept the
  daily Hobby recovery cadence or approve a faster paid cadence.
- Durable inquiry persistence plus Resend provider delivery was proven in an
  isolated Production canary, but the public inquiry route remains fail-closed
  and human mailbox receipt remains unproven. Vercel's current agent credential
  exposes encrypted Production environment values only as redacted values, so
  the deployed closed candidate—not local inspection—is the source of truth for
  exact Production configuration.
- Captions for the LIFT video remain a documented accessibility follow-up. They
  do not weaken payment authorization or private-media access, but they should
  be completed before calling the full member experience accessibility-complete.
- Release sequence: commit and push only
  `checkpoint/platform-overhaul-2026-08-20`, wait for exact-SHA CI, deploy and
  verify a sales-closed candidate, then move only the exact tested closed
  candidate to the canonical aliases. Public sales stay closed. A separate,
  protected, alias-free open candidate and the owner-driven live-purchase
  canary are required before activating canonical checkout. `main` is not part
  of this release.

## September 10 Booking + Operations Candidate — Current Authority

This section supersedes earlier current-state statements about facial location,
direct-service guest intake, catalog payment basis, canonical inquiry routing,
and local verification counts. Older dated sections remain historical evidence.

- **Owner-approved service model:** Wild Glow Express Facial, Reiki Aromatherapy
  Healing, Signature Facial, Beauty & Being Ritual, and Wild Glow Luxury Facial
  are flat, one-person appointments held at HWL Beauty. The private street
  address is shared after Shannon confirms the request. Intuitive Tarot, Moon
  Oracle, and Tarot + Reiki are also flat, one-person direct bookings. Group
  Beauty and ritual work belongs in the Retreats inquiry journey.
- **Minimal intake:** those eight individual services do not ask for party size.
  The five fixed-location Beauty events do not ask clients for an address. Only
  Private Yoga + Sound, Private Sound Healing, and Private Yoga retain a
  bounded guest-count question and attendee location. The duplicate custom
  location question is disabled for all eleven events; Cal.com's native
  location control remains the provider source of truth.
- **Provider evidence boundary:** the four facial event types were previously
  saved in Cal.com with the private organizer location label
  `HWL Beauty — address shared after confirmation`. Reiki Aromatherapy now
  requires the same organizer location and a fresh non-submitting form smoke
  showing name, email, and optional notes only—no guest-count or
  attendee-address field—before this provider correction is release-ready. No
  appointment or payment is required to verify that intake boundary.
- **Website containment:** the catalog now carries an explicit location policy,
  so fixed-location behavior is no longer inferred from display copy. The
  fallback inquiry form uses that policy, preserves signed-in name/email, fixes
  every Beauty-catalog location to HWL Beauty, and hides guest count for
  individual services.
- **Canonical private email routing:** inquiry, relationship-alert, and Journey
  reply-to paths admit only `shannon@hwlbysmd.com`; altered, padded, or missing
  recipients fail closed or omit the optional reply-to.
- **Current local proof:** the focused suites pass 489 cases: accessibility 7,
  admin 18, Auth 97, booking 117, commerce 149, inquiries 21, launch-environment
  fixtures 57, Preview policy 20, and relationship boundaries 3. TypeScript,
  ESLint, SEO for 21 pages, `git diff --check`, and the Next.js 16.3.4 Webpack
  production build all pass; the build generated 63 routes.
- **Release boundary:** these September 10 changes are local until an immutable
  checkpoint commit is pushed and a fresh exact-commit Preview is deployed and
  canaried. `main` and Production remain outside this candidate. Cal.com public
  discovery cannot attest intake/location settings, so the non-submitting
  provider smoke remains a required release artifact.
- **Payment boundary:** LIFT checkout and fulfillment are isolated from future
  service invoicing. Unknown, mismatched, or inactive same-application Stripe
  flows fail without a webhook receipt. Automatic post-appointment payment
  email remains unimplemented; Shannon's truthful launch workflow is still a
  manually issued Stripe Invoice or Payment Link after completing the service.
