# HWL by SMD — User Journey Map

**Status:** Draft for review
**Scope:** Current public Production behavior and the checkpoint implementation
where noted. This is a journey map, not a release approval or a claim that every
provider integration is live.

## Operating rules

- Follow the fail-closed, no-fake-availability, and gated-sales rules in
  `docs/decisions.md` (ADR-002 and ADR-007). Cal.com is the scheduling authority;
  Stripe is the payment authority.
- LIFT uses the onsite cart shelf and server-controlled Checkout path (ADR-006).
  Never replace it with a raw Stripe link or imply a closed checkout succeeded.
- Distinguish what a customer can see from what has been verified end to end.
  A rendered route or provider calendar is not proof of booking, payment, email,
  entitlement, or lifecycle synchronization.
- Status labels below: **Available** = observed in the public Production site or
  present in the repository; **Conditional** = requires provider setup or a
  separate verification; **Not available** = absent, paused, or redirects to a
  different path in the audited implementation.

## 1. Guest

- **User Type:** Visitor without an HWL account.
- **Goal:** Understand the work, then either explore LIFT or request a session.
- **Entry Point:** Homepage `/`.
- **Critical Path:**
  1. Choose the LIFT link or a service pathway from the homepage.
  2. **LIFT:** Visit `/beauty/lift`, review the video + PDF offer, add it to the
     onsite cart, and inspect the cart shelf before checkout.
  3. **Booking:** Visit `/book`, select a service, and view Shannon's live
     Cal.com dates and times in the chosen service's booking step.
  4. For booking, provide only the service-relevant details and request the
     selected time. Shannon's confirmation is required; Cal.com collects no
     service payment.
- **Failure Points (What if they get stuck?):**
  - If a Cal schedule cannot be retrieved, do not show guessed times. Offer the
    truthful Cal.com or contact fallback shown by the site.
  - On audited Production, `/store` states that Checkout is closed pending
    protected delivery and Stripe verification. A LIFT cart is not a completed
    purchase; stop at this gate and do not imply payment or access was granted.
  - If the requested service or time is unavailable, offer another published
    option or a direct contact path; do not submit an alternate time on the
    guest's behalf.
- **Success Criteria:** The guest reaches a truthful service/product decision;
  an actual booking request is acknowledged by Cal.com and awaits Shannon's
  confirmation, or (after the separately approved commerce gates pass) Stripe
  confirms payment and the account receives the entitled LIFT access. The last
  purchase outcome is **not currently available in public Production**.

## 2. Member / Account Holder

- **User Type:** Authenticated account holder, including a LIFT purchaser. An
  account is not by itself proof of an active paid membership.
- **Goal:** Find entitled practices, view account details, and return to
  sessions without losing the intended destination.
- **Entry Point:** `/login`, or a protected destination such as `/the-den`,
  `/library`, `/course/[slug]`, or `/account`.
- **Critical Path:**
  1. Sign in; protected routes return the visitor to sign-in when needed.
  2. Continue to The Den (`/the-den`) or directly to the requested protected
     destination.
  3. Open The Library (`/library`) and use only the content allowed by the
     account's verified entitlement (for example, LIFT after a fulfilled
     purchase).
  4. Use `/account` to manage account/profile preferences, or `/book` to begin
     another session.
  5. **Connection Hub status:** The requested private member messaging step is
     not currently a working member-facing journey. `/the-den/messages` and
     `/the-den/connection` redirect to `/contact?notice=connection`; the
     conversation API also requires an active Den membership and configured
     relationship storage. Treat `/contact` as a contact path, not a private
     account conversation. Do not promise a connected message history until
     its member UI, schema, permissions, and mail notifications are verified.
- **Failure Points (What if they get stuck?):**
  - An expired or invalid sign-in/recovery link returns to the password-reset
    flow; request a fresh link and use the newest message.
  - If a purchase is absent from the Library, do not grant access manually from
    a screenshot or email. Check the authoritative Stripe payment and
    entitlement/reconciliation state through the approved support process.
  - If the Connection Hub is unavailable, direct the user to the public contact
    form and be clear that it is not private member chat.
- **Success Criteria:** The account holder sees only content supported by a
  verified entitlement; account actions preserve safe return paths; a support
  route is available without fabricating private messages or membership state.

## 3. Client

- **User Type:** Person booking a one-to-one or group service with Shannon.
- **Goal:** Choose a suitable service and time, receive Shannon's decision,
  attend, then receive the appropriate post-session payment/follow-up.
- **Entry Point:** A service card or `/book`.
- **Critical Path:**
  1. Select a listed service. All services remain visible by default; do not
     hide categories behind a tab.
  2. Review duration, price, format, location policy, and the displayed date
     and time. Fixed-location facials/Reiki use HWL Beauty; private street
     details are shared after confirmation. Tarot services may be virtual or
     in person according to their Cal configuration.
  3. Select a real Cal.com opening and submit the provider's service-relevant
     intake. A booking is a request until Shannon manually confirms it.
  4. Follow the confirmation/reschedule/cancel links in the provider's booking
     messages, with Cal.com remaining the scheduling source of truth.
  5. Attend the session.
  6. For services, Shannon currently creates and sends a customer-specific
     Stripe invoice or payment link **manually after the appointment**. The
     client completes payment through Stripe. Automatic post-session billing
     email and service-payment history inside The Den are not implemented.
  7. Shannon follows up through the operational channel she has verified; do
     not imply an automated follow-up message unless delivery is confirmed.
- **Failure Points (What if they get stuck?):**
  - No live Cal slots: show no substitute availability; use the listed direct
    provider/contact fallback.
  - Pending request: explain that the requested time awaits Shannon's
    confirmation; do not call it confirmed.
  - Reschedule/cancellation not reflected in HWL history: manage it in Cal.com.
    The Admin booking queue and HWL booking ledger require separate provider
    credentials/configuration and are not currently proven in Production.
  - Invoice or payment mismatch: stop manual re-collection and reconcile in
    Stripe before sending another payment request.
- **Success Criteria:** Cal.com has the correct confirmed/cancelled appointment;
  the client receives provider notices; post-session invoice status is visible
  in Stripe; any later HWL account history reflects only synchronized,
  authoritative records. Production lifecycle/mailbox synchronization has not
  yet been fully canaried.

## 4. Admin (Shannon / Super Admin)

- **User Type:** Authorized `administrator` or `super_admin`.
- **Goal:** Run daily bookings, understand a client's verified history, and
  review or manage money in the system of record.
- **Entry Point:** `/login`, then `/admin` for authorized admins on the
  checkpoint implementation. Public Production at `403fc5f` predates the
  checkpoint's admin-default post-login routing; verify the exact deployed
  behavior before relying on this entry path.
- **Critical Path:**
  1. Sign in with the intended administrator identity; protected admin routes
     independently enforce the admin role.
  2. Start at `/admin` for operational status and navigate to Bookings,
     Clients, Messages, and Store as needed.
  3. **Bookings:** use Cal.com for authoritative scheduling changes. HWL's
     private queue needs a restricted `CALCOM_API_KEY`; booking lifecycle
     history separately needs an enabled signed webhook and database ledger.
     If the HWL queue says setup needed/unavailable, manage in Cal.com rather
     than trusting an empty HWL list.
  4. **Clients:** `/admin/clients` and a client record show registered account
     details and supported linked activity (purchases/checkouts, bookings,
     learning, and consent-based conversations where available). There is no
     client-notes editor in the audited implementation; keep clinical/private
     notes out of this record until an approved, appropriately protected notes
     capability exists.
  5. **Invoices / Revenue:** `/admin/store` provides a read-only summary of
     verified Stripe products, prices, recent payments/invoices, and
     reconciliation status where configured. Create/edit products, refunds,
     disputes, payouts, and customer-specific invoices in Stripe. Post-session
     service invoices are currently manual. `/admin/revenue` redirects to
     `/admin/store`; it is not a separate revenue workspace.
  6. **Messages:** use `/admin/messages` for the configured operational inbox
     and consent-based conversations; website inquiries are not automatically
     joined to a client solely by matching email.
- **Failure Points (What if they get stuck?):**
  - A role lookup or provider key failure must fail closed; do not promote a
    member or use sample records as a substitute.
  - Cal queues absent: use Cal.com directly. Stripe summary unavailable: use
    Stripe directly. Reconciliation warning: stop repeated charges and follow
    the payment incident procedure in `docs/runbook.md`.
  - A missing client note is not evidence that no care conversation occurred;
    the feature is not implemented. Use Shannon's approved secure record
    process outside HWL until one is adopted.
- **Success Criteria:** Shannon can reach the admin center, find real provider
  records (or a clear, non-deceptive setup state), and conduct money-changing
  actions in Stripe. No appointment, payment, message, or client note is
  fabricated or silently synchronized.

## Audit notes (2026-09-23)

- Public Production `403fc5f` serves the homepage, LIFT, Booking, and Store
  routes. Homepage links tested by same-origin `HEAD` returned HTTP 200; the
  signed-out `/the-den`, `/library`, and `/account` routes redirect to `/login`
  as expected.
- Homepage images loaded after scrolling; 11 images were complete and none had
  a zero natural width. The Production homepage emitted React hydration error
  418 in this browser session. The checkpoint includes hydration hardening,
  but a fresh-cache exact-Preview canary must show zero 418 before promotion.
- The public Cal embed returned real available slots for a selected service.
  No slot was submitted, no booking was created, and no lifecycle or mailbox
  delivery was tested in this audit.
- Production `/store` explicitly says checkout remains closed. The public cart
  and product presentation are not proof of a successful purchase.
- Live-state checks do not verify protected Production accounts, private
  records, provider credentials, or all mobile/accessibility conditions.
