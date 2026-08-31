# Commerce Operations Runbook

## Scope and operating posture

This runbook covers the current HWL by SMD launch product only:

| Field               | Launch value                                   |
| ------------------- | ---------------------------------------------- |
| Product             | `LIFT — Video + PDF`                           |
| Product type        | `lift_guide`                                   |
| Catalog version     | `lift-complete-v2`                             |
| Checkout mode       | One-time `payment`                             |
| Currency and amount | USD $11.11 (`1111` cents)                      |
| Quantity            | `1`                                            |
| Payment method      | Card                                           |
| Fulfillment         | Authenticated access to the LIFT video and PDF |

There is no PDF-only, membership, recurring, or variable-quantity checkout in this launch architecture.

This document describes operations; it does not authorize a provider, database, environment, deployment, refund, or dispute mutation. Use the correct approval path before running any command or changing any external system. Never place API keys, webhook signing secrets, full webhook bodies, card data, or unnecessary customer PII in tickets, chat, screenshots, or evidence bundles.

Keep `COMMERCE_SALES_READY=false` until the target environment has passed its launch gates. A deployment being reachable is not evidence that commerce is ready.

Evidence is candidate-specific. Any change to the verifier, routes, migrations,
catalog, environment identity, or provider configuration after a successful
journey makes that historical check a prior-path result until the exact current
candidate is repeated.

## Authority boundaries

<!-- prettier-ignore -->
| Surface                                            | Authority                                                                                   |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Stripe Checkout Session, PaymentIntent, and Charge | Provider payment state                                                                      |
| `checkout_orders`                                  | Server-created checkout reservation, reconciliation limit, and fulfillment provenance      |
| `purchases`                                        | Application entitlement materialized after server-side verification                         |
| `stripe_events`                                    | Signed-webhook receipt/idempotency record for one deployment target, Stripe account, and mode |
| `checkout_reconciliation_jobs`                     | Durable exact-namespace recovery state, retry timing, lease state, and manual-review signal   |
| `checkout_reconciliation_attempts`                 | Immutable report/claim/finish evidence; never a substitute Stripe Event receipt               |
| Auth user and `stripe_customers`                   | Ownership binding between the signed-in user and Stripe customer in that exact namespace    |
| Protected media/storage routes                     | Fulfillment enforcement from exact-target server-side entitlement; launch checkout creates only the active LIFT purchase, while dormant membership-aware code remains closed to sales |
| Checkout success page                              | Read-only status display that may request constrained server reconciliation; never authority |

The browser does not decide product, amount, quantity, Stripe account, mode, purchase ownership, or fulfillment. Do not use a client-side success redirect, receipt screenshot, or customer statement as entitlement authority.

## Environment identity check

Before inspecting, replaying, or changing anything, record all of the following in the incident or launch evidence:

- Application environment: local, Preview, or Production.
- Expected Stripe account ID and whether the environment is test or live mode.
- Expected Supabase project/environment.
- Exact public site origin and webhook endpoint URL.
- Stripe Event ID (`evt_...`) and webhook endpoint ID (`we_...`) when applicable.
- Checkout order ID, Checkout Session ID (`cs_...`), PaymentIntent ID (`pi_...`), and Charge ID (`ch_...`) when available.

Stop if any account, mode, origin, or database identity is ambiguous. Never replay a live event into a test endpoint, a test event into a live endpoint, or an event belonging to a different Stripe account.

The current runtime boundary permits live mode only in a trusted Production deployment. Local work must use the explicit `development` namespace with test-mode keys, and Preview must remain test mode. Purchases, memberships, customers, Events, and orders are scoped by deployment target, Stripe account, and mode; a recovered order must also match the current `site_url` before its Session can be reused.

Development and Preview currently use the same Stripe sandbox account. A structurally valid Event for the other deployment target is therefore acknowledged with HTTP `200` without a database transition or `stripe_events` receipt in the receiving target. A metadata account or mode mismatch is not treated as foreign-target traffic: it fails processing and must alert/retry.

## Webhook contract

The launch webhook endpoint is:

```text
POST /api/stripe/webhook
```

Configure the endpoint for exactly these four event types:

<!-- prettier-ignore -->
| Event type                   | Current application transition                                                                                                                                                                                                                                                                                                                                                                                    |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `checkout.session.completed` | Fully re-retrieves and verifies the Session, line item, Price, Product, amount, currency, PaymentIntent, Charge, account, mode, metadata, stored owner, and reserved order. If the provider objects do not already show a refund or dispute, it creates the `active` purchase without overwriting a terminal tombstone and marks the checkout order `paid`.                                                       |
| `checkout.session.expired`   | Marks the matching checkout order `expired` only when it is still `creating` or `open`. It does not revoke an already paid purchase.                                                                                                                                                                                                                                                                              |
| `charge.refunded`            | Acts only when the signed Event Charge has `refunded=true`. It retrieves the PaymentIntent/latest Charge and validates metadata, order, amount, currency, target, account, and mode before upserting a refunded tombstone and repairing the exact order. A partial refund does not currently revoke access.                                                                                  |
| `charge.dispute.created`     | Retrieves and verifies the PaymentIntent/latest Charge, metadata, reserved order, amount, currency, account, and mode, then marks the purchase and order `disputed`, revoking access.                                                                                                                                                                                                                             |

The endpoint reads at most 1,000,000 bytes, returns HTTP `413` for a larger body, and verifies the Stripe signature against the raw request body before processing. It also rejects the wrong Stripe account or mode. Event receipt is idempotent on Event ID plus deployment target, account, and mode; a successfully recorded duplicate returns an already-processed response rather than repeating fulfillment.

Do not broaden the Dashboard subscription list “just in case.” A signed unexpected Event from the configured account/mode would currently be acknowledged and receipt-recorded without a commerce transition. Any new event type requires an explicit application transition, tests, operations policy, and runbook update.

### Endpoint setup and verification

For each environment:

1. Deploy with `COMMERCE_SALES_READY=false` first.
2. Confirm the exact public endpoint is HTTPS, publicly reachable by Stripe, and does not redirect.
3. Create or select the webhook endpoint in the correct Stripe account and mode.
4. Subscribe it to the exact four event types above.
5. Install the signing secret issued for that exact endpoint into that exact application environment. Do not reuse a Stripe CLI signing secret in Preview or Production.
6. Redeploy the environment so it receives the intended secret.
7. Send a sandbox delivery and confirm the endpoint returns HTTP `200`.
8. Confirm the corresponding `stripe_events` row uses the expected Event ID, deployment target, Stripe account ID, and mode. A valid foreign-target Event should instead have no row in this target.
9. Complete the end-to-end scenarios in this runbook before enabling sales.

An invalid or absent signature must return HTTP `400` and must not create a checkout, purchase, customer, or entitlement.

## Normal purchase flow

The expected one-time purchase sequence is:

1. An authenticated user starts checkout from the application.
2. The server validates same-origin, the authenticated user, the fixed product, the current Stripe account/mode, Price, Product, amount, currency, metadata, and media readiness.
3. The server reserves a `checkout_orders` row and creates one Stripe Checkout Session.
4. Stripe redirects the customer back with the Session ID after payment.
5. Stripe sends `checkout.session.completed` to the webhook independently of the browser redirect.
6. The webhook performs authoritative provider retrieval and verification.
7. The shared verifier materializes or repairs the purchase, transitions the exact order, sets paired provenance only if absent, and re-reads the final order. Only after that exact final-state verification does the webhook insert its Event receipt. Existing valid first-writer provenance is preserved.
8. If the browser reaches an owned pending order before the webhook finishes, the page makes one constrained authenticated reconciliation POST. That route invokes the same authoritative verifier and can idempotently repair a missing or partially recorded fulfillment.
9. Protected media routes grant access only from the exact-target current active purchase.
10. The success page labels the checkout `ready` when its two server-side reads observe an active purchase and matching paid order/provenance. Those reads are not an atomic snapshot; protected media independently re-evaluates entitlement before delivery.

The signed webhook remains the primary fulfillment mechanism. The redirect is not payment evidence and never grants access by itself. Closing the browser must not prevent webhook fulfillment, and a GET of the success URL never calls Stripe or writes entitlement.

The scheduled worker is a durable backstop for a permanently missed webhook or
browser recovery. It retrieves the provider Session itself and invokes the same
authoritative fulfillment/expiration logic; its presence does not weaken the
webhook-first contract or make a redirect authoritative.

## `paid_pending` operations

The success page displays `paid_pending` only when all of the following are true:

- The visitor is authenticated.
- The Session ID has the expected Stripe Checkout shape.
- A server-created order binds that exact Session to the authenticated user, launch product, catalog, configured Price/Product, deployment target, Stripe account, and mode.
- The order is eligible for verification and either the purchase is absent or the purchase/order/provenance record is incomplete.

`paid_pending` means “the owned checkout still needs authoritative server verification or order repair.” It does **not** claim that Stripe reports payment. The page GET is read-only and grants no access.

The small client reconciler makes one `POST /api/checkout/reconcile` request per Session in the loaded browser runtime, then refreshes the page at most once after an HTTP-success response. It does not retry in a loop. The route requires an explicit same Origin, JSON content, and a body of at most 512 bytes containing exactly `{ "sessionId": "cs_..." }`; it authenticates the user and pre-binds the order by Session, user, product, catalog, target, account, mode, Price, and Product before any Stripe request. Metadata must name the same pre-bound order ID and user.

The server permits at most three authenticated reconciliation claims per order, with at least 60 seconds between claims. A compare-and-swap on `reconciliation_attempt_count` admits only one concurrent claimant. A reserved attempt is consumed even if account/provider verification later fails; the signed webhook remains independent of this browser fallback and can still fulfill or repair the order.

Authenticated reconciliation re-retrieves and validates the same Session, line item, Price, Product, amount, currency, PaymentIntent, Charge, metadata, account, mode, owner, and order chain used by `checkout.session.completed`. It preserves refunded/disputed terminal state. If provenance is absent, reconciliation may record `authenticated_reconciliation` with its paired time after the verified purchase/order transition; otherwise it preserves the first valid source/time. It never fabricates a Stripe Event and never inserts a `stripe_events` row.

When a customer reports `paid_pending`:

1. Do not tell the customer that access is ready, and do not ask them to pay again.
2. Preserve the Session ID and the time the state was observed. Allow the page's single automatic attempt to finish; do not repeatedly reload during the 60-second cooldown or ask the customer to pay again.
3. In the correct Stripe account and mode, verify the Session, PaymentIntent, Charge, amount, currency, and payment state.
4. Open the `checkout.session.completed` Event and inspect its delivery history for the exact application endpoint.
5. Inspect application logs for the Event ID and the webhook response.
6. Inspect `checkout_orders`, `stripe_events`, `purchases`, and `stripe_customers` using the identifiers from Stripe. Verify deployment target, account, and mode on every row that carries them. Check reconciliation attempt count/time and fulfillment source/time on the order.
7. Resolve the underlying configuration, migration, validation, database, or endpoint failure before replaying the Event.
8. If the authenticated fallback did not safely finish, replay the original signed Event to the same correct endpoint using the Dashboard procedure below. Do not edit Stripe metadata to force an invalid Event through validation.
9. Verify the Event delivery returns HTTP `200`, the order is `paid`, exactly one current purchase is `active`, fulfillment provenance is present, and authenticated media access succeeds.
10. Verify an anonymous user and a different authenticated user remain denied.

If replay returns an already-processed response but the order, provenance, purchase, or access state remains inconsistent, escalate. Do not delete the `stripe_events` row or directly insert an active purchase as a retry mechanism. A paid order with `fulfillment_source=authenticated_reconciliation` can legitimately have no `stripe_events` row; record that as recovered missed-delivery evidence, not as a fabricated Event receipt.

Migration 014 adds a scheduled durable recovery path for persistent or
exhausted browser fallback failures. The worker is not an excuse to loop the
browser request or to delete/rewrite evidence: it uses its own queue, leases,
retry budget, and immutable attempt ledger. Persistent inconsistency or eight
consecutive failures transitions to `manual_review` with `alert_pending=true`;
an operator must resolve that condition rather than forcing fulfillment.

## Stripe Dashboard event inspection and replay

Dashboard labels may appear under **Workbench** or **Developers**, depending on the Stripe Dashboard version.

1. Select the correct Stripe account.
2. Set the Dashboard to **Test mode** or **Live mode** to match the application environment.
3. Open **Workbench/Developers → Events** and search for the exact `evt_...` ID. Do not select an event only by customer email or approximate time.
4. Verify the Event type, livemode value, object IDs, amount, currency, and creation time.
5. Open the Event’s webhook delivery history.
6. Select the exact `we_...` endpoint and compare its URL to the recorded target origin.
7. Capture the previous attempt time, HTTP status, and sanitized response/error for the evidence record.
8. After the underlying fault is corrected, choose **Resend** or **Retry** for that endpoint delivery.
9. Confirm the new delivery returns HTTP `200`.
10. Perform the database, access, and evidence checks for the Event type. A `200` response alone is not proof of fulfillment.

Stripe can retry failed live deliveries. The application’s Event receipt is designed to make a repeated delivery safe; never work around idempotency by deleting receipt or commerce rows.

## Stripe CLI inspection and replay

These examples contact Stripe and require an authenticated CLI with authorization for the intended account. They are documentation, not permission to run provider calls. Confirm the installed CLI’s syntax before use:

```bash
stripe version
stripe events resend --help
```

The CLI normally targets test mode. Use its explicit `--live` option only for a separately authorized Production inspection/replay, and re-check the account and mode before every live command.

Retrieve the exact Event and related objects in the selected account/mode:

```bash
stripe events retrieve evt_REPLACE_ME
stripe checkout sessions retrieve cs_REPLACE_ME
stripe payment_intents retrieve pi_REPLACE_ME
stripe charges retrieve ch_REPLACE_ME
```

Replay an Event to an already registered webhook endpoint:

```bash
stripe events resend evt_REPLACE_ME --webhook-endpoint=we_REPLACE_ME
```

Before pressing Enter, independently compare both IDs to the evidence record and confirm the CLI is authenticated to the expected account. After replay, verify the Dashboard delivery, application logs, database state, and access behavior; CLI success output alone is not sufficient.

For local sandbox development, receive only the four launch event types:

```bash
stripe listen \
  --events checkout.session.completed,checkout.session.expired,charge.refunded,charge.dispute.created \
  --forward-to http://localhost:3000/api/stripe/webhook
```

Before starting the listener, run `stripe whoami` and require the exact
`HWLbySMD sandbox · sandbox` context. Do not pass `--api-key`; command-line
arguments are visible to local process inspection. Use the `whsec_...` printed
by `stripe listen` only as the local `STRIPE_WEBHOOK_SECRET`, then restart the
local application so the new signing secret is loaded. Conduct a fresh
test-mode purchase for local validation. Do not forward or replay a Production
live-mode Event to localhost.

## Database verification

Use read-only queries first through an authorized server or administrator channel. Browser roles have no direct commerce-table reads. Because the service role bypasses RLS, scope every lookup by the explicit user, deployment target, Stripe account, and mode as well as its object identifiers. The following examples intentionally select only operational fields; adapt placeholders without adding secrets or broad customer exports.

```sql
select
  id,
  user_id,
  deployment_target,
  product_type,
  catalog_version,
  checkout_attempt_id,
  status,
  stripe_checkout_session_id,
  stripe_payment_intent_id,
  stripe_account_id,
  stripe_livemode,
  stripe_product_id,
  stripe_price_id,
  fulfillment_source,
  fulfilled_at,
  reconciliation_attempt_count,
  last_reconciliation_attempt_at,
  site_url,
  expires_at,
  created_at,
  updated_at
from public.checkout_orders
where (
    id = 'ORDER_UUID_REPLACE_ME'
    or stripe_checkout_session_id = 'cs_REPLACE_ME'
  )
  and stripe_account_id = 'acct_REPLACE_ME'
  and stripe_livemode = false
  and deployment_target = 'preview';
```

```sql
select
  id,
  user_id,
  product_type,
  catalog_version,
  amount_paid,
  currency,
  status,
  stripe_checkout_session_id,
  stripe_payment_intent_id,
  stripe_account_id,
  stripe_livemode,
  stripe_product_id,
  stripe_price_id,
  deployment_target,
  purchased_at
from public.purchases
where (
    stripe_checkout_session_id = 'cs_REPLACE_ME'
    or stripe_payment_intent_id = 'pi_REPLACE_ME'
  )
  and deployment_target = 'preview'
  and stripe_account_id = 'acct_REPLACE_ME'
  and stripe_livemode = false;
```

```sql
select
  id,
  event_type,
  deployment_target,
  stripe_account_id,
  stripe_livemode,
  processed_at
from public.stripe_events
where id = 'evt_REPLACE_ME'
  and deployment_target = 'preview'
  and stripe_account_id = 'acct_REPLACE_ME'
  and stripe_livemode = false;
```

For scheduled recovery, prefer the service-role-only sanitized status RPC used
by `/admin/store`; never expose the queue tables through a browser role:

```sql
select *
from public.get_checkout_reconciliation_status(
  'preview',
  'acct_REPLACE_ME',
  false,
  50
);
```

The returned fields are limited to order UUID, queue state, claim/failure
counts, attempt/check times, sanitized outcome/error categories,
`alert_pending`, and manual-review machine reason. Use Stripe's authorized
provider surfaces for financial/customer details; do not expand this RPC into
a PII export.

If a listed commerce column, queue, constraint, or RPC is absent, stop and
verify the migration ledger and exact migration-012/migration-014 fingerprints.
Do not adapt around schema drift or change schema/row state during verification.

### Completed checkout pass criteria

- Exactly one order is associated with the Session and has status `paid`, the matching PaymentIntent ID, and a non-null paired fulfillment source/time.
- Exactly one current purchase for the owner/product/catalog/target/account/mode is `active`.
- Stripe amount is `1111` cents, `purchases.amount_paid` is `11.11`, currency is `usd`, product type is `lift_guide`, and catalog is `lift-complete-v2`.
- The application Session and PaymentIntent IDs agree with Stripe; the Stripe Charge belongs to that PaymentIntent and the expected account/mode.
- Webhook fulfillment has one Event receipt for the expected Event ID/target/account/mode. Authenticated and scheduled recovery create no Event receipt; they record their own source only when provenance was absent and otherwise preserve the first valid provenance pair.
- The owner can access both protected video and PDF.
- An anonymous user and another authenticated user cannot access either asset.

## Refund operations and verification

Issuing a refund is a separate authorized provider mutation. This runbook describes what to verify after an authorized refund; it does not grant refund authority.

### Full refund

Expected behavior after `charge.refunded` reports a full refund:

1. Stripe delivers `charge.refunded` to the correct endpoint.
2. The endpoint re-retrieves the PaymentIntent/latest Charge, verifies the signed Event, target, account, mode, metadata, order, amount, and currency, then returns HTTP `200` after writing or updating the refunded tombstone and repairing the order.
3. The purchase becomes `refunded`.
4. The matching checkout order becomes `refunded`.
5. Video and PDF access are denied to the former owner.
6. The success/status surface reports revoked/refunded rather than ready.
7. A replay of the same Event remains idempotent and does not create another purchase or transition back to active.

Verify in Stripe that the Charge is fully refunded and that `amount_refunded` covers the original Charge amount. Then verify the Event receipt, order, purchase, logs, and authenticated/anonymous access behavior.

### Partial refund

Stripe may emit `charge.refunded` for a partial refund, but the current application acts only when the signed Event Charge reports a full refund; the out-of-order tombstone path additionally confirms that state by provider retrieval. A partial refund therefore leaves the current entitlement active.

Before Production, the commerce owner must either:

- Prohibit partial refunds for this product operationally; or
- Approve and implement a specific partial-refund entitlement policy, with tests and updated customer/support language.

Do not manually label a partial refund as a full refund or alter metadata to trigger revocation.

## Dispute operations and verification

On `charge.dispute.created`, the current conservative behavior is immediate revocation:

1. Stripe delivers the Event to the correct endpoint.
2. The endpoint re-retrieves and verifies the PaymentIntent/latest Charge, metadata, reserved order, account, mode, product, amount, and currency.
3. The purchase becomes `disputed`.
4. The checkout order becomes `disputed`.
5. Video and PDF access are denied.
6. Replaying `checkout.session.completed` does not restore access over the terminal dispute state.

Verify the dispute and Charge in Stripe, the `charge.dispute.created` delivery and Event receipt, the order and purchase state, and denied media access.

### Dispute restoration is an unresolved owner policy

The current webhook does not handle `charge.dispute.closed` and does not automatically restore a disputed purchase. Do not infer a restoration policy from Stripe’s dispute outcome, and do not restore access with ad hoc SQL or by replaying the original completion Event.

The owner must choose and formally approve one of these directions before any restoration feature is implemented:

1. **Retain the conservative current behavior.** A disputed entitlement remains revoked indefinitely. The owner handles any exceptional customer remedy outside automated restoration.
2. **Add an automated closed-dispute policy.** Define exactly which verified provider outcome may restore access, add `charge.dispute.closed` handling, re-check refund and other dispute state, preserve terminal-state ordering, and test idempotency and out-of-order delivery.
3. **Add an audited manual restoration workflow.** Build a privileged server-side operation that records actor, reason, provider evidence, prior state, and resulting state. Direct table edits are not an acceptable workflow.

Until the owner selects and ships another policy, option 1 is the operative behavior: disputed access stays revoked.

## Event ordering and replay safety

Stripe delivery can be delayed, repeated, or out of order. Operationally:

- A completed checkout must not reactivate a purchase already marked `refunded` or `disputed`.
- An expired Session must not downgrade a paid order.
- A repeated Event must not create duplicate entitlement.
- A refund or dispute must be traced through the Charge → PaymentIntent → application metadata/reserved-order chain; completed fulfillment additionally verifies the Checkout Session and its line item.
- Do not manufacture a new Event, edit metadata, delete receipts, or rewrite commerce rows to force a desired transition.

When delivery order looks wrong, preserve all Event IDs and provider creation times, inspect each delivery separately, and verify the final terminal state and access behavior.

## Alerts and incident evidence

### Minimum alert coverage for Production

Production monitoring must surface:

- Any live webhook HTTP `5xx` immediately.
- Repeated live webhook HTTP `400` responses, especially signature, account, or mode failures.
- Any customer-reported or persistently observed `paid_pending` state.
- A paid Stripe Session without a matching `paid` order and current `active` purchase.
- An order remaining `creating` or `open` beyond the documented checkout/recovery window.
- An Event receipt without the expected order/purchase transition.
- A full refund or dispute whose entitlement remains active.
- A webhook, checkout, or validation attempt for the wrong Stripe account or mode.
- A sudden increase in checkout creation failures or duplicate-session recovery failures.
- Any reconciliation job entering `manual_review` or retaining
  `alert_pending=true`.
- A cron authorization/configuration failure, missed expected invocation, or a
  run that repeatedly reaches its internal deadline.

The owner must set the on-call destinations, response owner, and numeric/time thresholds before Production. Until those thresholds exist, treat every customer-reported or repeatedly observed live `paid_pending`, webhook `5xx`, verified full-refund mismatch, or dispute mismatch as an incident requiring immediate review. A single transient `paid_pending` render can be the normal redirect/webhook race; persistence is the failure signal.

### Evidence required for each launch test or incident

Record:

- Environment, application commit/deployment identifier, UTC timestamp, and operator.
- Stripe account ID and test/live mode; never the API key.
- Event type and Event ID, or an explicit note that this was authenticated reconciliation with no fabricated Event.
- Endpoint ID and sanitized endpoint URL.
- Delivery attempt timestamp, HTTP status, and sanitized response/error.
- Checkout order, Session, PaymentIntent, and Charge IDs.
- Product type, catalog version, amount, and currency.
- Before/after order and purchase statuses.
- Whether the owner, another authenticated user, and an anonymous user could access video and PDF.
- Relevant sanitized application log correlation.
- Replay reason, approver, operator, and result when a replay occurred.

Do not store signing secrets, bearer tokens, raw card/payment details, full webhook payloads, or unnecessary customer PII in the evidence bundle.

## Automated reconciliation: implemented locally, hosted rehearsal pending

The current working tree implements the durable backstop, but migration 014 is
not applied to hosted staging and the exact Preview/Production journey has not
been rehearsed. This is therefore an implemented local control, not current
hosted recovery evidence.

The endpoint is:

```text
GET /api/cron/commerce-reconciliation
Authorization: Bearer <CRON_SECRET>
```

Operational contract:

- `CRON_SECRET` is server-only, distinct per environment, at least 32
  characters, and compared exactly with a timing-safe check. Missing, short, or
  incorrect authorization fails before Stripe or Supabase work.
- The worker verifies the configured Stripe account and application
  target/account/mode before it reports or leases any job.
- It first invokes the service-role-only report RPC and validates every returned
  row. Only sanitized aggregate counts are returned by the HTTP route; customer
  identity and Stripe object IDs never appear in its response.
- It claims at most 10 due jobs per run with a 120-second opaque UUID lease. The
  database uses `FOR UPDATE SKIP LOCKED`; only the exact active lease token may
  finish a claim.
- A 45-second internal deadline starts before provider preflight. If the report
  consumes the budget, no work is leased. When the deadline reaches remaining
  claims, their leases are closed with a retryable machine category instead of
  being abandoned.
- Provider retrieval is server-authoritative. An open Session returns to
  bounded retry; an expired Session uses the shared expiration path; a complete
  Session uses the same Checkout/PaymentIntent/Charge/Price/Product verifier as
  the webhook; verified refund/dispute state remains terminal.
- Verified active work moves to `monitoring` for a 24-hour recheck. Terminal
  orders become `complete`. Retryable failures use one-, two-, four-, eight-,
  sixteen-, thirty-two-, then sixty-minute delays. The eighth consecutive
  failure becomes durable `manual_review`/`alert_pending`.
- Identity/database inconsistency moves directly to `manual_review`. The worker
  never fabricates a Stripe Event or writes `stripe_events`.
- `/admin/store` reads a service-role-only sanitized status RPC after verified
  Supabase admin authentication. It shows recovery, monitoring, and
  manual-review machine state; demo admins never read hosted payment records.

The deployed schedule in `vercel.json` is `17 15 * * *` (once daily), matching
the current Vercel Hobby-plan limit. That job is a recovery backstop, not an
immediate fulfillment SLA: signed webhooks remain primary and the bounded
authenticated page recovery remains the near-term customer-session fallback.
Before Production commerce is enabled, the owner must either accept and
document the daily recovery delay or upgrade to Pro and verify a 15-minute
schedule. In both cases, alert routing needs a named human destination and a
missed-cron check; `alert_pending` alone does not notify anyone.

Preview must validate sandbox checkout, webhook, authenticated fallback,
scheduled report/repair/monitoring/terminal/manual-review flows, stale-token
rejection, private admin visibility, and alert routing. Production commerce
must remain closed until migration 014 is applied, `CRON_SECRET` is installed,
the exact deployed schedule is observed, and the end-to-end rehearsal is
retained with sanitized evidence.

## Launch verification matrix

### Preview, sandbox account and staging data

- [ ] Migrations 012–014 are applied in order and their ledger, constraints, RLS, grants, queue, lease CAS, and service-role-only RPCs are verified in the intended staging Supabase project.
- [ ] The Preview hostname, Supabase project, Stripe test account, and `livemode=false` form one coherent environment.
- [ ] The public webhook endpoint is registered with its exact signing secret and the four exact events.
- [ ] The fixed Price/Product/metadata and the canonical video/PDF assets pass server readiness checks.
- [ ] A fresh authenticated $11.11 purchase produces one paid order and one active purchase.
- [ ] Duplicate checkout attempts reuse/recover safely and do not create multiple open Sessions.
- [ ] Replay of `checkout.session.completed` is idempotent.
- [ ] A deliberately interrupted delivery produces `paid_pending`; one authenticated reconciliation claim safely materializes or repairs access, records authenticated provenance, and creates no `stripe_events` row.
- [ ] A post-purchase failure replay repairs order status, PaymentIntent, and provenance without a duplicate purchase.
- [ ] Development-target Events delivered to the shared Preview sandbox endpoint return HTTP `200` without a Preview ledger write; wrong account/mode metadata fails closed.
- [ ] The original signed Event replay remains idempotent and independently repairs fulfillment after authenticated attempts are exhausted.
- [ ] A missed webhook is reported, leased, and repaired by scheduled reconciliation without a fabricated `stripe_events` row or duplicate purchase.
- [ ] Scheduled monitoring observes active, refunded, disputed, and expired provider state and preserves the correct active/terminal database state.
- [ ] Retry exhaustion and identity/database inconsistency enter durable manual review; the private admin view surfaces only sanitized machine state and the configured human alert destination is exercised.
- [ ] Missing/short/wrong cron authorization fails before provider/database work; concurrent/stale lease tokens fail closed; the deployed schedule is observed.
- [ ] Full refund revokes both media assets; partial-refund behavior is explicitly accepted or prohibited.
- [ ] Dispute creation revokes both media assets and remains terminal.
- [ ] Anonymous and wrong-user access remain denied throughout.
- [ ] Alert routing and the evidence template have an owner.

Preview readiness does not authorize live keys, live mode, Production data, or Production activation.

### Production

- [ ] Every Preview scenario above has passed with retained sanitized evidence.
- [ ] Production Supabase, Stripe live account, live Price/Product, site origin, and webhook endpoint are independently identified and verified.
- [ ] Production secrets are installed only in Production and are not copied from local or Preview.
- [ ] Migration 014, the authenticated cron route, durable reconciliation, private admin visibility, human alert routing, and missed-cron monitoring are deployed, tested, and rehearsed in the exact Production namespace.
- [ ] The owner has accepted the Hobby daily recovery delay or a Pro 15-minute schedule has been installed and verified.
- [ ] Refund, partial-refund, and dispute ownership/policies are approved.
- [ ] Live webhook alerting and paid-without-fulfillment detection are active.
- [ ] A closed-sales Production deployment passes environment and endpoint checks.
- [ ] A separately authorized live smoke transaction passes checkout, fulfillment, access, refund/revocation, evidence, and accounting checks.
- [ ] Only after all gates pass is `COMMERCE_SALES_READY=true` authorized for Production.

## Incident containment

If commerce state is uncertain:

1. Set or keep `COMMERCE_SALES_READY=false` through the normal authorized deployment path to prevent new checkout creation.
2. Keep the webhook endpoint online so existing paid Sessions, refunds, and disputes can still be received.
3. Record and inspect any already-open Checkout Sessions. Disabling new sales does not invalidate Sessions already created; expiring provider Sessions is a separate authorized action.
4. Preserve failed delivery history, Event IDs, logs, and database rows.
5. Correct the root cause, then replay only the exact failed Event to the exact endpoint.
6. Verify provider, database, and access state before resolving the incident.

Never delete `stripe_events`, `checkout_orders`, `purchases`, or customer bindings as containment or retry. Never disable the webhook while paid Sessions or revocation events may still arrive.

## Code and schema references

- Launch catalog and Stripe validation: [`../lib/stripe.ts`](../lib/stripe.ts)
- Server checkout creation: [`../app/api/checkout/route.ts`](../app/api/checkout/route.ts)
- Signed webhook and state transitions: [`../app/api/stripe/webhook/route.ts`](../app/api/stripe/webhook/route.ts)
- Shared authoritative Stripe/DB fulfillment: [`../lib/commerce/stripe-fulfillment.ts`](../lib/commerce/stripe-fulfillment.ts)
- Authenticated reconciliation boundary: [`../app/api/checkout/reconcile/route.ts`](../app/api/checkout/reconcile/route.ts)
- One-shot pending-state client: [`../components/payment/paid-checkout-reconciler.tsx`](../components/payment/paid-checkout-reconciler.tsx)
- Scheduled reconciliation route: [`../app/api/cron/commerce-reconciliation/route.ts`](../app/api/cron/commerce-reconciliation/route.ts)
- Scheduled reconciliation worker: [`../lib/commerce/scheduled-reconciliation.ts`](../lib/commerce/scheduled-reconciliation.ts)
- Private admin reconciliation DTO: [`../lib/commerce/admin-reconciliation.ts`](../lib/commerce/admin-reconciliation.ts)
- Purchase-backed access: [`../lib/access.ts`](../lib/access.ts)
- Success and `paid_pending` display: [`../app/checkout/success/page.tsx`](../app/checkout/success/page.tsx)
- Commerce schema and state constraints: [`../supabase/migrations/012_commerce_launch_safety.sql`](../supabase/migrations/012_commerce_launch_safety.sql)
- Durable reconciliation queue and RPCs: [`../supabase/migrations/014_commerce_reconciliation.sql`](../supabase/migrations/014_commerce_reconciliation.sql)
- Deployed cron schedule: [`../vercel.json`](../vercel.json)
- Launch environment validator: [`../scripts/validate-launch-env.ts`](../scripts/validate-launch-env.ts)
- Current launch evidence and gates: [`launch-packet.md`](launch-packet.md)

Update this runbook whenever the event subscription list, product/catalog, price, supported payment behavior, commerce state machine, environment topology, reconciliation design, or entitlement policy changes.
