# Whole Body OS — Phase 2

> NOTE: This document references route names that have since been updated. /body is now /yoga. /being and /tarot are now /astrology. The architecture and design decisions described herein remain valid.

Phase 2 adds the first production commerce and member layer to HWL by SMD.

## Experience architecture

### Public

- `/store` — LIFT PDF, Complete LIFT (video + PDF), and The Den membership
- `/lift` — public preview and direct purchase choices
- `/login` — sign in and account creation
- `/reset-password` and `/update-password` — recovery flow

### Member

- `/the-den` — personalized welcome, today’s ritual, private note, session CTA
- `/library` — entitled course collection, organized by practice
- `/course/[slug]` — ordered lesson path and progress
- `/lesson/[id]` — protected lesson playback, completion, private PDF download
- `/account` — membership, purchase history, billing portal, sign out

### Trusted server routes

- `POST /api/checkout` — creates a Stripe Checkout Session from server-owned prices
- `POST /api/stripe/webhook` — verifies signatures and grants/revokes entitlements
- `POST /api/portal` — creates the signed-in member’s Stripe billing portal
- `POST /api/progress` — saves the signed-in member’s lesson progress
- `GET /api/download/[lessonId]` — checks entitlement and creates an expiring PDF link
- `GET /api/video/lift` — checks LIFT entitlement and redirects to a 3,600-second signed URL for the private launch video
- `GET /api/video/lift/captions` — optional Phase 2 entitlement-checked redirect for a private captions file

## Access model

- A PDF purchase unlocks the protected LIFT download.
- A Video + PDF purchase unlocks the LIFT course and download.
- An active or trialing membership unlocks the full library.
- Authentication alone never grants paid content.
- The browser never submits a trusted user ID, price, or payment status.
- Stripe webhooks are the source of truth for purchases and membership state.
- Users can read their own purchase records, but only trusted server code can
  create or change them.

## Account setup

1. Create the Supabase project and apply
   `supabase/migrations/001_whole_body_os.sql`.
2. In Supabase Auth, set the production Site URL and add these redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3001/auth/callback`
   - `https://howlbysmd.com/auth/callback`
3. Upload the LIFT PDF to the private `member-content` bucket at the path in
   `LIFT_PDF_STORAGE_PATH`.
4. Transcode the supplied archival LIFT master to an approved web-delivery MP4,
   then upload it to the private `member-content` bucket at the path in
   `LIFT_VIDEO_STORAGE_PATH`. An approved VTT captions file may be added later
   at `LIFT_VIDEO_CAPTIONS_STORAGE_PATH`; Complete LIFT launch checkout requires
   the PDF and video, with captions tracked as a Phase 2 enhancement.
5. Create three Stripe prices:
   - $11.11 one-time — LIFT Guide PDF
   - $33.33 one-time — Complete LIFT, guided video + downloadable PDF
   - $11.11 monthly — The Den
6. Register the Stripe webhook URL:
   `https://howlbysmd.com/api/stripe/webhook`.
7. Subscribe the webhook to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
8. Configure the Stripe Customer Portal and brand Stripe Checkout to match HWL.
9. For launch, serve the private LIFT MP4 through the entitlement-checked
   `/api/video/lift` route and a native HTML5 player. The route creates a
   3,600-second signed redirect so browser range requests can seek within the
   protected object. The public preview must never be treated as paid delivery.
10. Keep the existing Mux signed-playback architecture for a future streaming
    phase. When that phase is approved, upload videos using a **signed** playback
    policy and store the signing key ID and base64-encoded private PEM separately
    from the Mux API token and secret.
11. Add the values listed in `.env.example` to `.env.local` and to the production
    host. Never paste service-role, Stripe secret, webhook, or Mux private keys
    into client code.
12. Verify the Resend sending domain and add its API key.

The steps above are a configuration sequence, not evidence of completion. As
of August 28, 2026, the high-resolution master is archival and not web-ready;
no transcode, hosted upload, environment mutation, or provider-backed playback
test is authorized or recorded by this document. Complete LIFT must remain
gated until the private object and the purchase-to-entitlement-to-playback flow
pass end-to-end verification.

## Content to prepare

- One cover image and short preparation note per course
- Launch-ready LIFT MP4, duration, captions, and transcript for the protected
  Supabase delivery path
- Mux signed playback ID per lesson when the future streaming phase is approved
- PDF storage path when a lesson includes a download
- The private welcome note from Shannon
- Booking link or Cal.com event types for:
  - 1:1 session
  - life coaching
  - consultation
  - private sound bath
  - private yoga
  - group consultation

## Next Whole Body OS module

The immediate member and commerce layer is intentionally separate from the
future practitioner control room. The next schema should add service offerings,
booking requests, intake forms, private member notes/messages, and Shannon’s
admin role before calendar sync or an admin dashboard is built.
