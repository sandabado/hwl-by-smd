# HWL Preview Release Runbook

This runbook prepares one isolated, test-money-only Vercel Preview. It grants
no authority to push, deploy, change provider configuration, assign a domain,
or promote Production. Every provider or hosted-state step below requires
direct owner approval first.

The owner changed the launch domain to `hwlbysmd.com` on September 4, 2026.
Production canonicals use `https://www.hwlbysmd.com`, matching Vercel's existing
apex-to-www redirect. The custom Preview below is a required target, not an
already configured hostname. Keep the existing sandbox branch-alias webhook
until the new Preview hostname, environment, Auth redirects, and webhook have
been coherently configured and verified. Preserve existing mail-forwarding
records when adding the new domain's exact Resend sending records.

## Fixed Preview boundary

| Boundary            | Required Preview value                    |
| ------------------- | ----------------------------------------- |
| Git branch          | `checkpoint/platform-overhaul-2026-08-20` |
| Stable origin       | `https://preview.hwlbysmd.com`           |
| Deployment target   | `preview`                                 |
| Stripe mode         | Sandbox/test only                         |
| Stripe account      | `acct_1U9cEQAdcj2oNOF4`                   |
| Stripe Product      | `prod_VACTsFboJAEOF0`                     |
| Stripe Price        | `price_1U9s49Adcj2oNOF4jcyMjyDB`          |
| Supabase            | Staging project `lkxppynmdfzljuptauxf`    |
| Production mutation | Forbidden during Preview preparation      |

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

The service secret must remain server-only. Migrations 012–014 must be
owner-approved, applied in order, and fingerprint-verified before the Preview
application uses their tables or RPCs.

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

Create a dedicated Vercel **Protection Bypass for Automation** secret only
after approval, keep Deployment Protection enabled globally, and install the
persistent sandbox endpoint with the secret in its query parameter:

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
bypass must remain protected. Creating or rotating this bypass is a hosted
security change and requires owner approval.

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

The corrected canonical PDF must be visually reviewed before upload. Neither
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

## Hosted Preview verification order

1. Obtain owner approval for migrations 012–014, the branch-scoped Preview
   variables, custom hostname, a dedicated Vercel automation-bypass secret,
   the persistent Stripe sandbox webhook, and Cal.com publication settings.
2. Apply and fingerprint-verify the hosted migrations.
3. Upload and verify the corrected PDF alongside the already reviewed private
   video; verify anonymous denial.
4. Prepare an immutable checkpoint commit on the named branch. Run the offline
   pre-push repository preflight, full tests, production build, secret scan,
   and `git diff --check`.
5. Push only the checkpoint branch after owner authorization. Never push or
   merge `main` as part of Preview preparation. Then run
   `npm run preflight:preview:post-push` and require exact synchronization
   before deploying that commit.
6. Deploy with closed sales. Assign `preview.hwlbysmd.com`, then prove the
   public application, inquiry fallback, booking fallback, protected routes,
   unsigned webhook rejection, and cron authorization rejection.
7. Create the persistent sandbox webhook and install only its Preview signing
   secret. Redeploy closed, send a signed sandbox delivery, and verify its exact
   target/account/mode database receipt.
8. With owner approval, set `COMMERCE_SALES_READY=true` only in this Preview,
   redeploy, and run purchase, signed webhook, redirect reconciliation,
   entitlement, video, PDF, duplicate delivery, refund, dispute, and manual
   scheduled-recovery checks.
9. Publish the approved Cal.com pilot and verify the full date/time selector,
   confirmation flow, conflict calendars, destination calendar, timezone,
   mobile keyboard access, and fallback behavior.
10. Submit a real Preview inquiry and verify database receipt first, Resend
    notification second, duplicate/idempotency behavior, and admin visibility.
11. Restore `COMMERCE_SALES_READY=false` if any provider, entitlement, inquiry,
    booking, or isolation check fails.
12. Record the exact deployment ID, commit, hostname, sanitized provider IDs,
    HTTP results, database evidence, browser evidence, and remaining gaps in the
    launch packet.

## Production gate

Preview success is not Production approval. Do not create live Stripe objects,
install live credentials, assign Production aliases, promote a deployment, or
enable real money until the owner separately approves the Production Supabase
boundary, live provider configuration, and final Preview evidence.
