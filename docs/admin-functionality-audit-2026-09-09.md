# HWL by SMD admin functionality audit

**Audit date:** September 9, 2026

**Repository:** `hwl-by-smd`

**Branch:** `checkpoint/platform-overhaul-2026-08-20`
**Scope:** admin information architecture, authorization, bookings, clients, inquiries, private messages, commerce, website publishing, settings, and the boundary between HWL and its providers.

## Executive decision

The admin should be a calm operating console for Shannon, not a second copy of every provider dashboard. The canonical navigation is:

1. Today
2. Bookings
3. Clients
4. Inbox
5. Money
6. Studio
7. Settings

This gives Shannon one place to understand the business while preserving a clear authority boundary:

- HWL owns the client-facing experience, verified client summaries, inquiry ledger, access entitlements, and governed website content.
- Cal.com owns availability and appointment mutations.
- Stripe owns products, prices, invoices, refunds, disputes, and payment mutations.
- Supabase owns authentication and HWL's private operational ledgers.
- Resend delivers notifications; it is not the inquiry system of record.

The current working tree replaces misleading sample dashboards with live read-only views or explicit redirects. It does **not** yet make HWL a complete write-capable CRM. That is deliberate: client edits, identity merges, appointment mutations, service invoicing, and message replies need stronger roles, audit records, idempotency, and recovery behavior before they are safe to expose.

## Environment and evidence boundary

The signed local admin preview is intentionally isolated from hosted private data. It can render and test the interface, but it must not use a service-role key to show real customer PII in a local demo session.

Therefore:

- Local browser proof establishes layout, navigation, route behavior, accessibility, and truthful locked states.
- Unit and integration-contract tests establish DTO validation, authorization boundaries, provider scoping, and fail-closed behavior.
- A connected Preview or Production admin session is still required to prove real private records from Supabase, Cal.com, and Stripe.
- Configuration presence is not the same as a successful provider request.

No provider, hosted database, Vercel environment, DNS record, payment object, appointment, Git remote, Preview deployment, or Production deployment is changed by this audit.

## Canonical admin route inventory

| Workspace        | Route                  | Current source                                                                                                        | What Shannon can do now                                                                      | Write authority                                       |
| ---------------- | ---------------------- | --------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| Today            | `/admin`               | Public provider status plus safe server configuration and reconciliation signals                                      | See operational readiness and take the correct next action                                   | Provider dashboards or separately gated HWL workflows |
| Bookings         | `/admin/bookings`      | Cal.com public catalog; private Cal.com booking queues when `CALCOM_API_KEY` is configured                            | Read unconfirmed, upcoming, past, and cancelled queues; open Cal.com                         | Cal.com                                               |
| Clients          | `/admin/clients`       | Verified Supabase profiles plus canonically scoped HWL commerce and optional relationship/booking ledgers             | Browse registered clients and open a client history                                          | Read-only in HWL                                      |
| Client record    | `/admin/clients/[id]`  | One verified profile, LIFT purchases, checkout attempts, optional bookings, optional conversations, learning progress | Review one client's known HWL history                                                        | Read-only in HWL                                      |
| Inbox: inquiries | `/admin/inquiries`     | Supabase inquiry ledger                                                                                               | Read website inquiries, delivery state, and submitted context; follow up by email            | Email client for now                                  |
| Inbox: messages  | `/admin/messages`      | Practitioner-scoped Supabase relationships and conversations                                                          | Read Shannon's real queue when the relationship schema contains eligible conversations       | Read-only in HWL                                      |
| Message thread   | `/admin/messages/[id]` | Practitioner-scoped Supabase conversation and message rows                                                            | Read a verified thread and move to the linked client record                                  | Read-only in HWL                                      |
| Money            | `/admin/store`         | Stripe products, prices, recent PaymentIntents and invoices, plus the HWL reconciliation ledger                       | Review sanitized operational status and open the correctly scoped Stripe dashboard           | Stripe                                                |
| Studio           | `/admin/website`       | Governed Supabase editorial schema with a gated homepage LIFT feature workflow                                        | Save a draft or publish the supported homepage feature only when all schema/media gates pass | HWL server action                                     |
| Settings         | `/admin/settings`      | Read-only configuration-presence and provider-authority map                                                           | Understand what is configured and where to manage it                                         | Vercel, Supabase, Cal.com, Stripe, Resend, or Mux     |

## Retired prototype routes

The following routes existed as attractive but fixture-backed screens. They should not be presented as operational features. They now redirect to the closest truthful workspace:

| Former route family                                            | Redirect target                       | Reason                                                                                                                 |
| -------------------------------------------------------------- | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `/admin/members`, `/admin/members/[id]`                        | `/admin/clients`                      | The new client directory is backed by verified profiles; sample members are removed.                                   |
| `/admin/calendar`, `/admin/bookings/[id]`                      | `/admin/bookings`                     | Cal.com is the appointment authority; fake detail/calendar controls are removed.                                       |
| `/admin/revenue`, `/admin/store/[id]`                          | `/admin/store`                        | Stripe and the scoped HWL ledger are the money authority; sample revenue/product detail is removed.                    |
| `/admin/connection`                                            | `/admin/messages`                     | The real practitioner-scoped inbox replaces the sample connection console.                                             |
| `/admin/content/**`, `/admin/courses/**`, `/admin/journeys/**` | `/admin/website`                      | Those screens were prototype editors with fixture records. The currently governed publishing workflow lives in Studio. |
| `/admin/campaigns/**`                                          | `/admin/website` or `/admin/messages` | Campaign pages were aliases of fixture journey/connection workspaces.                                                  |

The underlying database tables for courses, journeys, relationships, and conversations may exist. A table is not a finished product capability: a safe admin editor also needs authorization, validation, audit history, lifecycle rules, and tested delivery.

## Capability audit

### 1. Admin identity and permissions

**Implemented**

- Every protected admin route re-establishes server-side authentication.
- Hosted access requires a confirmed Supabase user whose own `profiles` row has `is_admin = true`.
- The local demo-admin path is development-only and is barred from hosted PII reads.
- The active administrator identity and environment authority are visible in the shell.

**Missing**

- There is no persisted distinction between `super_admin`, `administrator`, support, editor, or finance roles. The database currently has one `is_admin` boolean.
- There is no general admin mutation audit log.
- The requested operating distinction—`admin@ghosthand.studio` as super admin and `shannon@hwlbysmd.com` as permanent admin—is not yet represented as role capabilities in application code.

**Decision**

Keep current views read-only unless a mutation already has a narrowly governed server action. Add capabilities and an append-only audit log before exposing client, booking, message, or money writes.

### 2. Bookings

**Implemented**

- The booking page can make four server-only Cal.com reads: unconfirmed, upcoming, past, and cancelled.
- Only a narrow appointment DTO reaches the UI: booking ID, service, dates, first attendee identity/timezone, status, event slug, and a sanitized location label.
- Meeting URLs, intake answers, phone numbers, provider credentials, and raw payloads are not rendered.
- The provider request times out, does not cache, and fails closed.
- Cal.com remains the visible handoff for confirmations, rescheduling, cancellations, and full appointment detail.

**Missing or gated**

- A server-only `CALCOM_API_KEY` is required for private booking queues.
- Migration `016_calcom_booking_ledger.sql` and the canonical Cal.com webhook must be active before durable booking history appears on client records.
- Cal.com confirm/cancel/reschedule mutations are not available inside HWL.
- There is no link between a completed booking and a Stripe invoice or payment.
- Post-appointment payment-link delivery is still a manual operator workflow.

**Decision**

Launch with read in HWL and manage in Cal.com. Add appointment mutations only after same-origin protection, per-action authorization, idempotency, an append-only audit trail, and rollback/recovery behavior are in place.

### 3. Clients

**Implemented**

- `/admin/clients` is a real registered-client directory, not a fixture member list.
- Operator accounts are excluded from client counts.
- One client record combines the confirmed profile with canonically scoped LIFT purchases, checkout attempts, optional Cal.com ledger history, optional consent-based conversations, and aggregate learning progress.
- Commerce rows must match the expected Stripe account, deployment target, and livemode.
- Stripe customer IDs, checkout-session IDs, payment method data, intake metadata, and provider secrets are not exposed.
- Website inquiries remain separate and are never silently merged by matching an unverified email string.

**Missing**

- Guest bookings and unregistered service clients do not yet have a canonical HWL client identity.
- There is no safe merge/claim workflow between an inquiry, guest booking, Stripe customer, and confirmed Supabase profile.
- Shannon cannot yet edit names, contact preferences, consent, notes, tags, or care details.
- There is no dedicated service-payment history because booking-to-invoice linkage does not exist.
- There is no retention policy for profiles, care notes, or booking history.

**Decision**

Keep the first client view read-only. Next create an explicit guest-client identity and audited claim/merge workflow; never infer identity from matching email alone.

### 4. Inquiries

**Implemented**

- Website inquiries are written to Supabase first.
- The admin inbox reads the private ledger only after real hosted admin authorization.
- Email notification state is visible, so a failed or unknown Resend notification does not erase the inquiry.
- The UI provides an email follow-up handoff without pretending that the reply is synchronized into HWL.
- Pagination and DTO validation are bounded and fail closed.

**Missing**

- Inquiry status changes, assignment, internal notes, and resolution are not yet editable in HWL.
- Replies sent in an email client are not ingested or displayed as a conversation history.
- Mailbox receipt still requires provider-side evidence in the target environment.

### 5. Messages and chat

**What happened to the old feature**

The former Messages and Connection screens displayed imported sample conversations. They were not proof that Shannon or a client could exchange a real message. The real relationship schema does exist, but the customer routes currently redirect to Contact and migration `005_connection_membership_boundary.sql` requires an active Den membership for client conversation access.

**Implemented in this working tree**

- The admin inbox reads only relationships assigned to the signed-in practitioner.
- Conversation summaries and message threads are validated into narrow DTOs.
- Local demo sessions cannot read hosted messages.
- The interface never substitutes a sample conversation when the schema, identity, or provider read is unavailable.
- Reply controls are intentionally absent from the real read view.
- The dormant administrator reply endpoint is explicitly fail-closed behind `ADMIN_CLIENT_MESSAGING_READY=false`; the launch validator also requires that exact closed value for this candidate.
- Member reply and read-receipt routes require an explicit exact same-origin request and enforce their JSON body limit while streaming, including when `Content-Length` is absent or false.
- Long threads load the newest 500 messages in chronological reading order and disclose when earlier history is not loaded.

**Missing before chat is a usable business feature**

- A product decision on entitlement: LIFT purchaser, service client, Den member, or an explicit combination.
- Re-enabled client routes with tested RLS for the chosen entitlement.
- Atomic, idempotent reply and mark-read behavior.
- Privacy-light notification email that never includes sensitive message content.
- Delivery/read semantics, retention/deletion policy, attachment policy, abuse controls, archive/resolve behavior, and administrator audit history.
- A verified way for Shannon and a client to exchange a message end to end in Preview.
- Before replies are opened, replace the existing non-atomic administrator write sequence with an audited workflow that includes replay protection and client notification.

**Decision**

Expose the real read-only queue now, labelled honestly. Do not call it live chat. Keep the dormant reply endpoint closed, then replace it with an atomic, idempotent, notified, and audited workflow after the entitlement mismatch is resolved.

### 6. Money, payments, and products

**Implemented**

- The Money workspace verifies the expected Stripe account and livemode before reading any provider data.
- It displays sanitized products, active prices, recent payment intent status, recent invoice status, and the HWL checkout-reconciliation queue.
- Account mismatch fails closed.
- Provider links are account-qualified and mode-qualified.
- Full customer identity, cards, payment methods, addresses, metadata, and credentials stay out of the UI.

**Missing**

- Product, price, refund, dispute, invoice, and payment mutations remain in Stripe.
- Service invoices are not automatically created or sent after a completed appointment.
- There is no canonical `booking -> invoice -> payment -> client` ledger.
- Clients cannot yet see service invoices/payment history in the Den.
- Opening live LIFT sales still requires the separate owner-approved live-payment and fulfillment canary; an admin screen is not launch proof.

**Decision**

Keep Stripe as the money mutation authority. Build a narrow, auditable "request payment after appointment" workflow only after the service-payment ledger exists; avoid cloning the whole Stripe dashboard.

### 7. Studio and content

**Implemented**

- One governed homepage LIFT feature can be drafted and published through a server action when migration 007, media provenance, accessibility, and publication gates all pass.
- Local preview is read-only.
- Layout is not freely mutable from the admin.

**Not implemented**

- General page, course, lesson, journey, media-library, or campaign management.
- Draft preview isolation for every page.
- Full editorial roles, approvals, scheduling, rollback, and revision comparison.

The legacy editor screens were prototypes and now redirect to Studio rather than presenting fake save/publish controls.

### 8. Settings

Settings is now a read-only authority map. It reports configuration presence without rendering values, explains which provider owns each change, and links to provider control planes. It does not present inert Save, Configure, team, billing, or notification controls.

## Client 360: what Shannon can and cannot see

| Client information                                           | Current state                                                                        |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| Confirmed profile name, email, join date                     | Available for registered, non-admin profiles                                         |
| LIFT purchase status and value                               | Available when the row matches canonical commerce scope                              |
| Checkout attempt history                                     | Available when the row matches canonical commerce scope                              |
| LIFT learning progress                                       | Available when the progress schema is readable                                       |
| Cal.com booking history                                      | Available only after migration 016 and the canonical webhook populate linked records |
| Current Cal.com queues                                       | Available separately in Bookings when `CALCOM_API_KEY` is configured                 |
| Consent-based conversation summaries                         | Available when real relationship/conversation rows exist                             |
| Website inquiries                                            | Available separately in Inbox; intentionally not auto-joined                         |
| Stripe service invoices and payments                         | Not linked to bookings or client records yet                                         |
| Phone, preferences, consent, care notes, tags                | No governed client-profile model/editor yet                                          |
| Guest identity across inquiry, booking, payment, and account | No canonical merge/claim workflow yet                                                |

## Security and privacy findings

### Passed in design/code

- Private provider keys remain server-only.
- Local demo sessions cannot use service-role access to hosted PII.
- Cal.com, Stripe, Supabase, and Resend remain distinct authorities.
- Cal.com administrator reads verify the exact `hwlbysmd` profile and `shannon@hwlbysmd.com` account before any booking PII request.
- Stripe reads fail closed on account/mode mismatch.
- Inquiry emails are not treated as verified identity.
- Provider payloads are mapped to narrow UI DTOs.
- Sample operational records are removed from canonical admin paths.
- Admin conversation mutation endpoints now require same-origin requests and bounded streamed JSON bodies.
- Migration 017 is prepared to replace broad administrator relationship reads with practitioner-correlated policies and does not add a super-administrator bypass.

### Still required

- Role/capability model for super admin vs permanent admin.
- Append-only mutation audit log.
- Owner-approved hosted application and verification of migrations 016 and 017, including the signed Cal.com webhook lifecycle in each intended environment.
- Service-payment linkage and replay-safe invoice delivery.
- Chat entitlement decision and end-to-end messaging canary.
- Retention/deletion schedules for profiles, booking history, conversations, and future care notes.
- Production browser/provider verification after a Preview deployment of this exact code.

## Verification completed for this working tree

- TypeScript: passed.
- ESLint: passed with zero errors and zero warnings.
- Automated checks: 470 passed across admin authorization, messages, client privacy, bookings, Cal.com webhook boundaries, commerce, Stripe reads and fulfillment, inquiries, accessibility, navigation, environment/release policy, relationship-policy structure, and legacy-route truthfulness.
- SEO validation: 21 pages, 21 metadata records, and 7 long-form documents passed.
- Production dependency audit: zero vulnerabilities reported for production dependencies.
- Next.js 16 production build: passed; 63 static pages generated and dynamic admin routes compiled.
- Isolated database proof: migrations 014–017 applied to a disposable local Supabase database; the Cal.com booking-ledger lifecycle and practitioner-boundary SQL harnesses both passed and rolled back every fixture/assertion transaction.
- Desktop browser pass at 1280 x 720: all eight canonical admin surfaces returned 200, displayed the expected heading and seven-item navigation, had no horizontal overflow, and showed no fixture/sample label.
- Mobile browser pass at 375 x 667: all eight canonical admin surfaces returned 200, displayed the expected heading and menu control, and had no horizontal overflow.
- Mobile navigation: dialog semantics, current Inbox state on the Messages route, Escape close, body-scroll restoration, and trigger-focus restoration passed.
- Redirect browser canaries passed for Members to Clients, Calendar to Bookings, Revenue to Money, Connection to Messages, Content to Studio, and Campaign Conversations to Messages.
- Fresh browser console pass: zero errors.
- The local development server remains available at `http://localhost:3002`.

These checks do not prove hosted private data, provider mutations, Preview environment variables, or Production deployment. Those require a Preview deployment and provider-side evidence for this exact revision.

The 470-check total includes static verification that both database harnesses are transactional and rollback-only. The separate database executions add real local SQL proof but do not represent hosted application, provider configuration, or Production evidence; migrations 016 and 017 remain unapplied to hosted Supabase.

## Recommended delivery sequence

### Phase 1 — calm, truthful read console

1. Complete the seven-item navigation and retire every fixture route.
2. Verify Today, Bookings, Clients, Inbox, Money, Studio, and Settings on desktop and mobile.
3. Deploy to Preview only.
4. Sign in as both approved operators and verify authorization, private reads, empty states, and account scoping.

### Phase 2 — complete the client history spine

1. Apply and verify migration 016 in the intended environment.
2. Configure and verify the Cal.com webhook with replay and out-of-order event tests.
3. Introduce a canonical guest-client record and explicit account claim/merge workflow.
4. Add a service-payment ledger linking booking, Stripe customer, invoice/payment, and confirmed client.
5. Surface service booking and payment history in Clients and the Den.

### Phase 3 — safe management actions

1. Add roles/capabilities and an append-only admin audit log.
2. Add confirm, request-reschedule, and cancel booking actions with idempotency and clear provider outcomes.
3. Add a narrow post-appointment payment-request workflow.
4. Decide chat entitlement, restore the client inbox, and add atomic reply/read operations plus privacy-light notification.
5. Add governed client notes/preferences only after consent, access, retention, and deletion rules are approved.

## Launch judgment

The new admin is appropriate as a **read-oriented operating console** once this exact branch passes build, route, desktop/mobile, and connected Preview verification. It is not yet a complete CRM or unified provider-control plane.

Do not claim the following until separately proven:

- Cal.com booking history in Client records
- automatic post-appointment payment requests
- client-visible service payment history
- two-way in-app chat
- role separation between super admin and permanent admin
- live LIFT checkout/fulfillment readiness
- Production deployment of these admin changes
