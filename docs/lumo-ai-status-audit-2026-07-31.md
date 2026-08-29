# HWL by SMD / Whole Body OS

> NOTE: This document references route names that have since been updated. /body is now /yoga. /being and /tarot are now /astrology. The architecture and design decisions described herein remain valid.

> PRICING UPDATE — August 28, 2026: current owner-confirmed pricing is
> **$11.11 one-time** for the LIFT Guide, **$33.33 one-time** for Complete
> LIFT, and **$11.11/month** for The Den. The $3.33, $5.55, and $11.11
> Complete LIFT figures below are retained only as a historical record of the
> July 31 snapshot and must not be used for current sales or Stripe
> configuration.

## Final Local Build Update for Lumo AI

**Updated:** July 31, 2026  
**Repository:** `sandabado/hwl-by-smd`  
**Primary domain:** `howlbysmd.com`  
**Local preview:** `http://localhost:3001`  
**Source of truth:** the local working tree in
`/Users/cougarceleste/Websites/hwl-by-smd`

This replaces the earlier progress audit. The room-based experience is now
implemented. The backend was preserved and aligned to the relationship-first
direction. The work remains local and uncommitted; it has not been pushed or
deployed from this working tree.

## Executive Summary

HWL by SMD is now a ten-room digital home rather than a conventional wellness
marketing site:

| Route          | Room          | State                                                           |
| -------------- | ------------- | --------------------------------------------------------------- |
| `/`            | Living Room   | Complete locally                                                |
| `/about`       | Kitchen       | Complete locally; credentials remain visibly unverified         |
| `/beauty`      | Bathroom      | Complete locally                                                |
| `/yoga`        | Studio        | Complete locally                                                |
| `/astrology`   | Altar Room    | Complete locally                                                |
| `/retreats`    | Sunroom       | Complete locally                                                |
| `/beauty/lift` | Dressing Room | Complete locally; technique copy remains a marked draft         |
| `/journal`     | Library       | Complete locally; briefs remain drafts                          |
| `/store`       | Gift Shop     | Complete locally; production checkout needs final configuration |
| `/the-den`     | Sanctuary     | Complete locally; real member data needs production services    |

The public experience is spacious, editorial, and somatic. Images act as
windows. Motion is restrained and honors reduced-motion preferences. The
authenticated member area, commerce, protected video/PDF delivery, admin, and
Connection/Journey systems remain intact.

## 1. Public Experience Completed

### Global architecture

- Primary navigation is About, Beauty, Yoga + Sound, Astrology, Retreats, Store, Book, and account access.
- Store products are available through the footer and contextual room links.
- The mobile menu is a full-screen accessible sheet.
- Public room routes do not carry redundant breadcrumb or sticky-page chrome.
- Legacy experience and LIFT routes permanently redirect to canonical rooms.
- Privacy, Terms, contact, login, password recovery, 404, loading, and error
  states are present.

### The rooms

**Living Room — Home**

- Opens with “There is nothing wrong with you.”
- Introduces Beauty, Yoga + Sound, and Astrology without statistics or a process funnel.
- Includes one verified Grace R. testimonial, the LIFT invitation, and a quiet
  invitation into the work.

**Kitchen — About**

- Tells Shannon’s story through Ice Rink → Beauty → Body → Being → integration.
- Keeps the tone intimate and lived-in.
- Lists modalities without publishing credentials that have not been verified.
- Structured data avoids unconfirmed professional titles or licenses.

**Bathroom — Beauty**

- Uses reflection, cleansing, skin, and care as the room language.
- Presents facial, lymphatic, consultation, and LIFT pathways without invented
  public service prices or medical promises.

**Studio — Yoga**

- Uses breath, movement, sound, and nervous-system support.
- Presents private yoga, sound, and coaching/consultation pathways.
- Contains no fabricated testimonials or persona claims.

**Altar Room — Astrology**

- Uses moon, candle, quiet, ritual, tarot, and astrology imagery.
- Offers private and group ritual pathways without invented pricing.
- Includes clear general-wellness and spiritual-service boundaries.

**Sunroom — Retreats**

- Frames retreats as collaborative, host-led partnerships.
- Includes a three-step process, four service categories, three custom-proposal
  formats, and clear responsibility/logistics disclosures.
- Avoids package-price theater and fake retreat proof.

**Dressing Room — LIFT**

- Presents seven movements with scroll-linked progress.
- Steps 1–2 are public previews; steps 3–7 are genuinely access-gated.
- The three confirmed products are $3.33 PDF, $5.55 Video + PDF, and $11.11/mo
  membership.
- Ownership-aware states replace purchase prompts for entitled members.
- Technique, benefits, welcome language, and the final PDF remain explicitly
  marked for Shannon’s review where necessary.

**Library — Journal**

- Functional Beauty, Yoga, Astrology, and Retreat Living filters.
- Nine honest draft briefs instead of fake publication dates or fake links.
- Newsletter capture is implemented through the server email route.

**Gift Shop — Store**

- Only the three confirmed digital products are shown.
- The $5.55 Video + PDF choice is labeled “Recommended,” not “Most Popular.”
- Purchase, access, refund, and membership language is direct and transparent.

**Sanctuary — The Den**

- Greets the member quietly and prioritizes continuing their actual practice.
- Shows journeys, progress, pause/resume controls, membership, library access,
  and the private Connection Hub.
- Removes task-like quick actions and promotion-heavy dashboard language.

## 2. Somatic Design System Completed

Shared room primitives now include:

- Breathing sections and breathing text.
- Parallax windows and responsive parallax images.
- Motion-safe wrappers and reveal behavior.
- Ambient light and subtle texture overlays.
- LIFT sequence progress.
- Room-specific tokens for cream, charcoal, clay, glass, paper, moonlight,
  fabric, and candle warmth.
- Global keyboard focus and reduced-motion rules.

Eleven user-supplied images were selected, renamed, and compressed to WebP.
The complete optimized library is approximately 548 KB. No additional stock
imagery was introduced.

## 3. Commerce and Access

The three-product Stripe model is implemented server-side:

| Product            |        Price | Type         | Environment variable         |
| ------------------ | -----------: | ------------ | ---------------------------- |
| LIFT PDF Guide     |        $3.33 | One-time     | `STRIPE_PDF_PRICE_ID`        |
| LIFT Video + PDF   |        $5.55 | One-time     | `STRIPE_LIFT_GUIDE_PRICE_ID` |
| The Den Membership | $11.11/month | Subscription | `STRIPE_MEMBERSHIP_PRICE_ID` |

Implemented safeguards:

- The browser cannot supply trusted prices, identities, or entitlements.
- Stripe Checkout and Customer Portal are server-created.
- Webhook signatures are verified.
- Webhook events are recorded idempotently.
- Purchases and subscription state synchronize into Supabase entitlements.
- Authentication alone does not unlock paid content.
- Private PDFs use short-lived Supabase Storage signed URLs.
- Mux playback uses a server-created signed JWT when signing configuration is
  complete.

Production payment status must still be described as **not live** until all
three real Stripe price IDs are present and the full test-mode purchase matrix
passes.

## 4. Member Platform and Whole Body OS

### Member platform

- Supabase email/password authentication and recovery flows.
- Protected account, Den, library, course, and lesson routes.
- Entitlement-aware course and PDF access.
- Mux in-browser player with branded controls.
- Lesson completion and progress tracking.
- Membership and billing state.
- Connection Preferences.

### Whole Body OS admin

- Spa-like protected admin shell.
- Dashboard, members, bookings, revenue, calendar, courses, lessons, content,
  store, messages, Connection, Journeys, and settings.
- Relationship-centered language replaces acquisition language.
- Legacy `/admin/campaigns/*` URLs remain only as protected compatibility
  redirects.
- Development-only preview admin fails closed outside local development.

Most non-Connection admin sections remain polished operational previews rather
than complete production CRUD screens. They are intentionally labeled and do
not pretend sample data was saved.

## 5. Connection and Journeys

The relationship engine is implemented in code and migration SQL:

- Private member/practitioner conversations and unread state.
- Member and practitioner replies with authorization and relationship checks.
- Contextual booking CTA generation.
- Consent-based Journey opt-in, pause, and resume.
- Maximum seven milestones per Journey.
- Maximum two active Journeys per member.
- No booking or product invitation in the first three milestones.
- At least 24 hours of quiet after a Journey.
- Maximum three automated messages in a rolling seven-day window.
- Individual and global pause controls.
- Private practitioner notes.
- Nightly relationship-health scan.
- Support language creates an alert, pauses an associated Journey, and asks a
  human to respond; it never sends an automated care response.

Privacy language now discloses that member messages may be automatically
scanned for a small set of support-related terms for the sole purpose of
pausing scheduled communication and alerting Shannon.

## 6. Truth and Language Integrity

The final pass removed or avoided:

- Invented service prices.
- Invented testimonials.
- Unverified credential and licensure claims.
- Fake publication dates and article links.
- Fake popularity labels.
- Scarcity and countdown language.
- Lead-scoring or extraction-oriented relationship language.
- Automatic replies to expressions of struggle or urgency.

Still awaiting Shannon’s direct confirmation:

- Exact credentials, schools, dates, and legally safe public titles.
- Final service names, durations, formats, and prices.
- Final LIFT movement instructions, benefits, contraindications, welcome, and
  sign-off.
- Final journal articles and personal stories.
- Final retreat inclusions and host responsibilities.

## 7. Validation Completed

The integrated working tree passed on July 31, 2026:

- `npm run lint`
- `npm run typecheck`
- `npm run build`
- Production compilation and TypeScript validation.
- Static generation of all 53 statically generated pages in the build.
- Prettier check across `app`, `components`, `lib`, `docs`, `supabase`, and
  `vercel.json`.
- `git diff --check`.

The in-app browser was not available to Codex for the final visual pass. The
existing Next development process is listening on `http://localhost:3001`, so
desktop/mobile visual inspection, keyboard navigation, and Lighthouse/axe
remain explicit human/browser QA items rather than claimed results.

## 8. Production Configuration Still Required

Names only; no secret values are included here.

Missing or not yet verified locally/for production:

- `STRIPE_PDF_PRICE_ID`
- `LIFT_PDF_STORAGE_PATH` backed by a real private Supabase object
- `MUX_SIGNING_KEY_ID`
- Real Mux signed playback IDs for lessons
- `NEXT_PUBLIC_CALCOM_URL`
- `CRON_SECRET`
- `CONTACT_TO_EMAIL`
- `CONTACT_FROM_EMAIL`
- Supabase migrations applied to the intended hosted project
- Shannon’s real production admin profile
- Production environment parity in Vercel
- Stripe purchase/webhook tests
- Resend sending-domain test
- Cal.com booking test
- Mux signed playback test
- Private PDF entitlement test

The local Supabase, Stripe, Mux API, and Resend variables that are present do
not prove the corresponding production accounts or deployed environment are
correctly configured.

## 9. Git and Deployment State

- Current branch: `main`.
- Local HEAD and `origin/main`: `b6771c7`.
- The complete platform work is still uncommitted in the working tree.
- Nothing from this working tree has been pushed or deployed.
- Do not reset, clean, checkout, or overwrite the working tree.

## Recommended Launch Order

1. Have Celeste and Shannon visually review all ten rooms at localhost.
2. Confirm the truth-sensitive copy listed above.
3. Apply the three Supabase migrations to a test project.
4. Upload the approved private PDF and real videos; seed courses and lessons.
5. Add the missing environment values locally and in Vercel.
6. Run the complete Stripe, auth, entitlement, Mux, PDF, email, booking, cron,
   Connection, Journey, and support-alert test matrix.
7. Run desktop/mobile, keyboard, screen-reader, Lighthouse, and axe QA.
8. Commit in intentional chunks, push, deploy, attach `howlbysmd.com`, and
   repeat the smoke tests in production.

## Bottom Line

The platform has been invented and implemented. What remains is verification,
real content and credentials, external-service configuration, production data,
integration testing, and deployment. Preserve the rooms, the quiet, and the
relationship-first operating philosophy while completing those steps.
