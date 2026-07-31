# Whole Body OS — Phase 2

Phase 2 adds the first production commerce and member layer to HWL by SMD.

## Experience architecture

### Public

- `/store` — LIFT PDF, LIFT Video + PDF, and The Den membership
- `/lift` — public preview and direct purchase choices
- `/login` — sign in and account creation
- `/reset-password` and `/update-password` — recovery flow

### Member

- `/the-den` — personalized welcome, today’s ritual, private note, session CTA
- `/library` — entitled course collection, organized by practice
- `/course/[slug]` — ordered lesson path and progress
- `/lesson/[id]` — protected Mux player, completion, private PDF download
- `/account` — membership, purchase history, billing portal, sign out

### Trusted server routes

- `POST /api/checkout` — creates a Stripe Checkout Session from server-owned prices
- `POST /api/stripe/webhook` — verifies signatures and grants/revokes entitlements
- `POST /api/portal` — creates the signed-in member’s Stripe billing portal
- `POST /api/progress` — saves the signed-in member’s lesson progress
- `GET /api/download/[lessonId]` — checks entitlement and creates an expiring PDF link

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
4. Create three Stripe prices:
   - $3.33 one-time — LIFT PDF
   - $5.55 one-time — LIFT Video + PDF
   - $11.11 monthly — The Den
5. Register the Stripe webhook URL:
   `https://howlbysmd.com/api/stripe/webhook`.
6. Subscribe the webhook to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
7. Configure the Stripe Customer Portal and brand Stripe Checkout to match HWL.
8. Upload videos to Mux using a **signed** playback policy. Create a Mux signing
   key and store its key ID and base64-encoded private PEM separately from the
   Mux API token and secret.
9. Add the values listed in `.env.example` to `.env.local` and to the production
   host. Never paste service-role, Stripe secret, webhook, or Mux private keys
   into client code.
10. Verify the Resend sending domain and add its API key.

## Content to prepare

- One cover image and short preparation note per course
- Mux signed playback ID, duration, captions, and transcript per lesson
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
