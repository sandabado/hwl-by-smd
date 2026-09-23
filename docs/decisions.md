# HWL BY SMD — DECISIONS LEDGER
**Repository:** `sandabado/hwl-by-smd`
**Last Updated:** 2026-09-23
**Status:** ACTIVE — launch preparation (live gates enforced)
**Revision:** 6

## 1. Executive Summary
Canonical ledger of architectural decisions, rejections, and pivots for the
Whole Body OS launch. Replaces fragmented chat history ("ultra chat") with a
single source of truth.
- **Goal:** Launch a high-converting, sovereign luxury wellness platform.
- **Constraint:** Zero tolerance for double-booking, payment fragmentation,
  or ambiguous user interfaces.
- **Verified state (2026-09-23 release cut):** Audited checkpoint and exact
  Preview deployment at SHA `5ed2aa4d80580cb87e1d44e6795cb49fabc7af9f`;
  frozen `release/1.0.0` was cut directly from that commit. Subsequent
  governance-only commits continue on checkpoint and do not move the frozen
  release or Preview deployment. Public Production serves older `403fc5f`
  (environment drift — see Gate 8).

---

## 2. Architectural Decisions (ADRs)

### ADR-001: Stripe Environment-Specific Accounts
**Status:** ✅ Approved
**Date:** 2026-09-23
**Decision:**
- **Production:** `HWLbySMD` (`acct_1U9cEIPTLuM8Maxa`) — sole live authority.
- **Development/Preview:** sandbox (`acct_1U9cEQAdcj2oNOF4`) — testing only,
  not authorized for Production by the launch authority.
**Implementation evidence:**
- Environment policy: `lib/commerce/launch-authority.ts`
- Account verification: `lib/stripe.ts`
- Fail-closed checkout: `app/api/checkout/route.ts`
**Catalog status:** Both accounts carry an active $11.11 one-time LIFT
product/price. Production webhook covers checkout completion/expiration,
refunds, and disputes.
**Caveat:** No live charge was found in the account history checked as of
September 23, and the live webhook shows no recent deliveries. Active
configuration does not prove the live payment path works — live-path
verification is part of the Production release procedure (ADR-007, Gate 7).
**Rejected alternative:** Hybrid Square + Stripe. *Reason: fragmentation;
sovereignty requires one stack.*

### ADR-002: Cal.com Booking Engine
**Status:** Public booking works; booking-history synchronization is not
configured.
**Date:** 2026-09-23
**Reality:**
- `cal.com/hwlbysmd` publishes **11 services** (5 Beauty, 3 Movement,
  3 Ritual) with real public availability; all require Shannon's manual
  confirmation; no Cal payments.
- New bookings land on `FIREBIRDS`. Conflict checking enabled for:
  FIREBIRDS, WHOLEBODY, LIONWOLF, ACTOR, YOGA, HWL. BILLS excluded.
- Site event lookup: `lib/calcom.ts`; local catalog: `lib/booking-services.ts`.
**Lifecycle gap:** No persistent developer webhook exists. Earlier lifecycle
testing used temporary Preview configuration, since retired. Booking history,
reschedules, cancellations, and released availability are unsynchronized
until (a) a persistent webhook is configured with its own flag, signing
secret, deployment target, and Supabase connection
(`app/api/calcom/webhook/route.ts`), and (b) the restricted `CALCOM_API_KEY`
is configured for Admin booking queues (`lib/bookings/calcom-admin.ts`
returns not-configured without it). Last Vercel inventory showed both the
key and signing secret absent — recheck before treating as current (Gate 3).
**Directive:** Do NOT re-create or re-publish event types (duplication risk).
**Rejected alternative:** Manual email booking. *Reason: scalability and UX.*

### ADR-003: Homepage — Three-World Editorial Model
**Status:** ✅ Approved (supersedes "Four Doors")
**Date:** 2026-09-23
**Decision:** The canonical checkpoint/Preview homepage is the scrollable
editorial three-world model (`components/home/hero-entry.tsx`): full-viewport
hero → Beauty · Body · Being worlds → dark LIFT feature ($11.11, cart CTA)
→ session pathways via `SelectBookingButton` → retreats → Shannon →
journal. Four Doors components remain as unrendered artifacts. The older
Production homepage (`403fc5f`) has not been separately audited; this ADR
describes the checkpoint candidate that Production will promote to.
**Rejected alternative:** Four Doors zero-scroll threshold. *Reason: hides
substantial content on short viewports.*

### ADR-004: Database & Migration Strategy
**Status:** ✅ Applied
**Date:** 2026-09-23
**Decision:** Staging `lkxppynmdfzljuptauxf` hosts migrations 001–021.
**Migration 011 supersedes 010**: single $11.11 video+PDF product
(`supabase/migrations/011_single_lift_offer.sql`). The retired two-product
split must not be reintroduced. Timestamped migration filenames preferred for
future provenance.

### ADR-005: LIFT Curriculum Structure
**Status:** ✅ Approved
**Decision:** Shannon's exact 7-step sequence (Prep the Skin → Jawline Lift
→ Mid-Face Sculpt → Brow Lift → Forehead Release → Lymphatic Sweep → Neck
Release; Glow Finish optional). First two movements public, remainder
access-gated (`app/lift/page.tsx`).
**Provenance:** Authoritative assets are the private Supabase objects:
- PDF: `member-content/lift/lift-guide.pdf`
  SHA-256 `652c3c6eb6e87a44d47e5326e4e3a385d3704596a19020bc75ae318c6c117ad6`
- MP4: `member-content/lift/complete-lift-v1.mp4`
  SHA-256 `d3d3c7a390a4b8c199ae0970533c0c14ab4327ba7d3e53d7662c895d4860bf23`

Shannon's original authored PDF is the source document but is not a tracked
repository asset. Captions/transcript are an unscheduled post-launch
accessibility follow-up; assign a target window during the first post-launch
planning session and record it in `worklog.md` (Follow-up 6).

### ADR-006: LIFT Purchase Flow
**Status:** ✅ Approved
**Date:** 2026-09-23
**Decision:** Onsite cart and checkout initiation, followed by
Stripe-hosted payment. Flow: **`/beauty/lift` (canonical route; `/lift` is
an alternate)** → AddToCartButton → cart provider/sheet → `/api/checkout`
→ Stripe hosted Checkout → entitlement + delivery. Page metadata sets
`/beauty/lift` as canonical (`app/lift/page.tsx`); `/lift` re-exports the
same page. Raw Stripe links are prohibited (bypass gates, verification,
entitlements).

### ADR-007: Commerce Fail-Closed Principle & Canary Sequence
**Status:** ✅ Approved
**Decision:** All sales surfaces fail closed — checkout requires
`COMMERCE_SALES_READY=true` (`launch-authority.ts`). Release sequences:

**Preview sandbox canary:**
1. Close Gate 1 (rotate Preview Stripe bypass; treat current value as
   compromised).
2. Enable `COMMERCE_SALES_READY` **only on the protected Preview sandbox**.
3. Run the exact-SHA purchase canary against the current frozen
   `release/1.0.0` head (at this release cut,
   `5ed2aa4d80580cb87e1d44e6795cb49fabc7af9f`): test purchase reaches the
   correct library, signed video, and PDF download.
4. Reclose the Preview flag.

**Production live-path canary:**
1. Deploy the exact current `release/1.0.0` head
   (`5ed2aa4d80580cb87e1d44e6795cb49fabc7af9f` at this release cut) to
   Production as an **alias-free, closed candidate**
   (not reachable via `www.hwlbysmd.com` or any public alias). This does
   NOT close Gate 8 — public aliases stay on `403fc5f` until step 3.
2. Securely route the live Stripe webhook to the protected candidate (the
   existing live webhook targets `www.hwlbysmd.com` and would otherwise
   exercise the old deployment). Under separately approved canary
   procedures: briefly enable `COMMERCE_SALES_READY` on the candidate,
   process exactly one live test charge, verify webhook delivery,
   entitlement creation, and library/media access; then refund, and verify
   the refund webhook event and access revocation. Reclose the flag
   immediately after.
3. Only after canary evidence is recorded: promote public aliases from
   `403fc5f` to that same exact release SHA (this closes Gate 8), making the
   public sales-opening decision (Gate 7) eligible.
4. **Cost acknowledgment:** the live charge-and-refund canary incurs Stripe
   processing fees that may not be returned. The canary approval must name
   the payer and acknowledge the expected cost before execution.

**Directive:** The flag is never left enabled outside an active, approved
canary window, and never exposed publicly via unprotected URLs.

### ADR-008: Frozen Release Branches
**Status:** ✅ Approved
**Date:** 2026-09-23
**Decision:** Releases are cut as frozen branches directly from audited
checkpoint SHAs. `release/1.0.0` forks directly from
`5ed2aa4d80580cb87e1d44e6795cb49fabc7af9f` without cherry-pick or amendment.
The exact-SHA canary for Gate 2 targets the current head of
`release/1.0.0`; the branch head must be recorded and verified before each
canary. New implementation work continues on
`checkpoint/platform-overhaul-2026-08-20`. The release branch receives changes
only by an explicit decision naming the exact change and its audit evidence.
Any change to the release branch resets its exact-SHA canary gate. This ADR
supersedes the moving checkpoint and hard-coded canary candidate SHA references
in ADR-007 and Gate 2 for future canary execution; the safety gates and
closed-sales requirements in ADR-007 remain in force.

**Context:** Within one day, the candidate moved from `c639305` to `a7e3a98`
to `5ed2aa4` while the ledger's canary target was being documented. A frozen
release branch prevents a moving checkpoint from silently changing the
promotion candidate.

**Operational evidence:** At cut, local checkpoint, origin checkpoint, exact
Preview deployment `dpl_3cE9FZLnW1woGqDFaHyXT7NBDkZX`, and
`release/1.0.0` all identified
`5ed2aa4d80580cb87e1d44e6795cb49fabc7af9f`. The release ref was pushed to
origin. Any later checkpoint-only documentation commits do not change that
release ref.

---

## 3. Rejected Paths (Anti-Patterns)

| Idea | Reason for Rejection |
|---|---|
| Glassmorphism/frost effects | Cold, corporate; reduces readability |
| Zero-scroll homepage confinement | Hides worlds/LIFT/booking/journal on short viewports |
| Hybrid payments (Square + Stripe) | Fragmentation; blocks sovereign stack |
| Raw Stripe payment links for LIFT | Bypasses gates, verification, entitlements |
| Re-creating Cal.com event types | Duplicates 11 working published services |
| Treating migration 010 as canonical | Superseded by 011 (single offer) |
| Fake availability UI | Users must never see unreservable times |
| Leaving `COMMERCE_SALES_READY` enabled outside an approved, protected canary window (Preview or Production) | Uncontrolled exposure of the payment path |

---

## 4. Launch Gates vs. Post-Launch Follow-Ups

**Gates (blocking launch):**

| # | Gate | Owner | Detail |
|---|---|---|---|
| 1 | **Preview Stripe bypass rotation** | Engineer | Rotation unproven; treat as compromised until replacement + revocation evidence recorded. Must close before Gate 2. |
| 2 | **Exact-SHA sandbox purchase canary** | Engineer | Test purchase reaches library, video, and download at the current exact `release/1.0.0` head. At this cut: `5ed2aa4d80580cb87e1d44e6795cb49fabc7af9f`; any release-branch change resets the canary (ADR-008). |
| 3 | **Cal.com lifecycle + Admin integration** | Engineer | Configure persistent webhook (flag, signing secret, deployment target, Supabase connection) AND restricted `CALCOM_API_KEY` for Admin booking queues. Recheck Vercel env inventory — both were absent last check. Canary must verify BOTH (a) webhook ingestion/lifecycle synchronization and (b) the live Admin booking queue — they require separate credentials and configuration. |
| 4 | **Inquiry delivery canary** | Engineer | Fresh canary on current candidate + confirmed human mailbox receipt (public route currently fails closed). |
| 5 | **Administrator sign-in canary** | Engineer | Hosted sign-in and role routing verified for the intended Production account. |
| 7 | **Production sales opening** | You + Shannon | Explicit release decision, eligible only after the protected Production live-path canary (ADR-007) passes. |
| 8 | **Production deployment parity** | You | Production promotes `403fc5f` to the exact approved `release/1.0.0` candidate. At this cut: `5ed2aa4d80580cb87e1d44e6795cb49fabc7af9f`. Gate 8 closes only AFTER the Production live-path canary passes; aliases must not move before evidence is recorded. |

**Post-launch follow-ups (tracked, not blocking):**

| # | Item | Owner | Detail |
|---|---|---|---|
| 6 | **LIFT captions/transcript** | Engineer | Video + PDF delivered and verified; captions are a Phase 2 accessibility improvement (`app/course/[slug]/page.tsx`). Scheduling: **unscheduled** post-launch follow-up; assign a target window during the first post-launch planning session and record it in `worklog.md`. |

---

## 5. Protocol for Future Changes

1. No code change is "done" until recorded here.
2. Every commit references its ADR (e.g., `feat: implement ADR-007`).
3. Reversed decisions logged as "ADR-X Revoked" with reason.
4. Codex audits all doc revisions against the codebase before commit.

---

## 6. Current Reality Snapshot (2026-09-23 release-cut verification)

- **Checkpoint/release/Preview at cut:** checkpoint HEAD and frozen
  `release/1.0.0` were `5ed2aa4d80580cb87e1d44e6795cb49fabc7af9f`;
  immutable Preview deployment `dpl_3cE9FZLnW1woGqDFaHyXT7NBDkZX` is READY at
  that exact SHA. A fresh-cache full homepage traversal hydrated successfully
  with 11/11 images, no overflow, and zero browser console errors. This is
  Preview-only evidence; subsequent governance commits continue on checkpoint.
  **Production:** `403fc5f` remains on the public aliases; the same fresh
  homepage audit reproduced React hydration error 418 there.
- **Stripe:** Two valid env-specific accounts; catalogs live; no live charge
  or webhook deliveries found in Production history checked as of Sept 23;
  sales closed.
- **Cal.com:** 11 published services, real availability, conflict checks on;
  no persistent webhook; Admin API key absent per last Vercel inventory.
- **Supabase:** Staging is through migration 021; private PDF + MP4 are hosted
  and verified. Production is claimed in later launch-packet notes to be
  through 021, but this audit could not query its ledger or schema because no
  usable Production-scoped read-only database credential was available. Treat
  Production schema state as **unverified / blocked**, not as a confirmed
  migration level.
- **Homepage:** Three-world editorial model on checkpoint/Preview.
- **Risk Level:** MEDIUM (infrastructure verified; rotation, canaries,
  webhook + Admin key, and Production promotion outstanding).
