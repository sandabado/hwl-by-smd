# HWL Preview Release Runbook

This runbook prepares one isolated, test-money-only Vercel Preview. It grants
no authority to push, deploy, change provider configuration, assign a domain,
or promote Production. Every provider or hosted-state step below requires
direct owner approval first.

The owner changed the launch domain to `hwlbysmd.com` on September 4, 2026.
Production canonicals use `https://www.hwlbysmd.com`, matching Vercel's existing
apex-to-www redirect. The custom Preview is now configured, TLS-valid, assigned
only to the checkpoint branch, and protected by Vercel SSO. Preserve existing
mail-forwarding records and the exact verified Resend sending records.

## September 14 Current Authority Snapshot

- The synchronized checkpoint branch and protected Preview use exact commit
  `f12656c5238667d6df71d8d123070a85539ea633`. Vercel deployment
  `dpl_BUrYS7iK2XfkUdAqdMhaGEaTssZQ` is READY/Preview and owns
  `preview.hwlbysmd.com`; GitHub Actions run `34851069600` passed. `main`, public
  Production aliases, live Stripe, and sales were not changed.
- Exact Preview HTTP and browser postflight checks now pass: `/index` returns
  exact
  query-preserving `308` redirects to `/`; raw `/` HTML has the canonical empty
  root and route-tree Flight segments; both the stable alias and immutable
  deployment hydrate the home surface without console errors or horizontal
  overflow. The September 13 React 418 hold is cleared only for this artifact.
- Preview remains deliberately sales-closed. Its Stripe sandbox Product and
  one-time $11.11 Price are active, the persistent Preview webhook subscribes
  to the exact four required events, and private staging media remains present.
  The latest completed sandbox purchase predates `f12656c`, so the current
  artifact still needs an owner-approved purchase, signed webhook,
  fulfillment/access, replay, refund, dispute, and recovery canary.
- Public Cal booking exposes all 11 manual-confirmation services with Cal
  payments disabled. Staging migrations 001–020 are present, but the exact
  Preview has neither `CALCOM_API_KEY` nor `CALCOM_WEBHOOK_SECRET`, its Cal
  ledger endpoint is disabled, the account still displays an Unverified email,
  and Cal has no webhook. Do not claim synchronized booking history until the
  signed request → confirmation → reschedule → cancellation lifecycle passes.
- Inquiry collection renders open in Preview and historical database-first plus
  Resend delivery evidence exists, but `f12656c` has no successful labeled
  inquiry submission. The local Resend credential fails provider validation;
  this does not prove the opaque deployed Preview credential is invalid.
- Four configuration names have both branch and general Preview definitions:
  `COMMERCE_SALES_READY`, `CONTACT_TO_EMAIL`, `LIFT_PDF_STORAGE_PATH`, and
  `LIFT_VIDEO_STORAGE_PATH`. The branch values currently win; reconcile the
  duplicates before deriving any Production configuration from Preview.
- A local, uncommitted hosted-root verifier repair now understands the pinned
  React Flight stream's coalesced, split, hint, and byte-length-framed rows. Its
  41 targeted cases, the 82-case Preview-release suite, TypeScript, lint,
  formatting, and captured exact-Preview HTML audit pass. It has not been
  committed, pushed, or deployed and therefore needs fresh scope approval.

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

The corrected canonical PDF has been visually reviewed and byte-verified with
the video in private staging storage. Preserve those exact objects. Neither the
PDF nor video belongs in Git or the Vercel deployment bundle.

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

## Hosted Preview verification order

Exact `f12656c` has immutable Preview identity plus closed-state, raw-root, and
fresh-browser evidence. Stripe and Preview inquiry provider proof belongs to
historical `d28be30`; a separate isolated Production inquiry canary is also
recorded in the launch packet. Fresh `f12656c` sandbox and inquiry canaries plus
the signed Cal lifecycle remain pending. Four duplicate Preview variable
definitions must be reconciled before Preview configuration can inform
Production. Preserve and reverify every candidate-scoped result after a new
checkpoint.

1. Obtain owner approval for migrations 012–014, the branch-scoped Preview
   variables, custom hostname, a dedicated Vercel automation-bypass secret,
   the persistent Stripe sandbox webhook, and Cal.com publication settings.
2. Apply and fingerprint-verify the hosted migrations.
3. Upload and verify the corrected PDF alongside the already reviewed private
   video; verify anonymous denial.
4. Prepare an immutable checkpoint commit on the named branch. Run the offline
   pre-push repository preflight, full tests including `npm run test:auth`,
   production build, dependency audits, secret scan, and `git diff --check`.
5. Push only the checkpoint branch after owner authorization. Never push or
   merge `main` as part of Preview preparation. Then run
   `npm run preflight:preview:post-push` and require exact synchronization
   before deploying that commit.
6. Deploy with closed sales. Assign `preview.hwlbysmd.com`, then prove the
   public application, inquiry fallback, booking fallback, protected routes,
   unsigned webhook rejection, and cron authorization rejection. Require
   `npm run verify:hosted-root` to pass, then require the hydrated sentinel,
   home-only header/breadcrumb behavior, and zero React hydration errors in a
   fresh extension-free browser.
7. Create the persistent sandbox webhook and install only its Preview signing
   secret. Redeploy closed, send a signed sandbox delivery, and verify its exact
   target/account/mode database receipt.
8. With owner approval, set `COMMERCE_SALES_READY=true` only in this Preview,
   redeploy, and run purchase, signed webhook, redirect reconciliation,
   entitlement, video, PDF, duplicate delivery, refund, dispute, and manual
   scheduled-recovery checks.
9. Publish the approved Cal.com pilot and verify the full date/time selector,
   confirmation flow, deliberate conflict suppression, the FIREBIRDS destination
   write, timezone, organizer/attendee human email receipt, mobile keyboard
   access, and fallback behavior.
10. Submit a real Preview inquiry and verify database receipt first, Resend
    notification second, duplicate/idempotency behavior, and admin visibility.
11. Restore `COMMERCE_SALES_READY=false` if any provider, entitlement, inquiry,
    booking, or isolation check fails.
12. Record the exact deployment ID, commit, hostname, sanitized provider IDs,
    HTTP results, database evidence, browser evidence, and remaining gaps in the
    launch packet.

## Production gate

Preview success is not Production approval. Do not assign Production aliases,
promote a deployment, run a live charge, or enable real money until the owner
separately approves the Production Supabase boundary, live provider
configuration, and final Preview evidence. The live Stripe account and
canonical $11.11 Product, Price, and webhook already exist; their presence is
not proof of credential validity, signed delivery, entitlement, or a successful
live purchase.
