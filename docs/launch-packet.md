# HWL by SMD — Launch Packet

**Updated:** August 28, 2026
**Decision:** **Not ready for public commerce yet.** The public experience, manual booking UI, and two LIFT movement previews are locally verified, and the protected LIFT video is now in private Supabase staging storage. Stripe, the corrected canonical PDF, inquiry delivery, migration 010, and a real purchase-to-entitlement test remain open.
**Release boundary:** No commit, push, Preview deployment, Production environment change, or production promotion was performed.

## Executive Status

| Surface                    | Status                   | Evidence                                                                                                     |
| -------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------ |
| Public content and imagery | READY LOCALLY            | Production build, desktop browser, and 375 px browser checks pass                                            |
| Manual booking UI          | READY LOCALLY            | Exact service catalog, guest count, location, notice policy, and truthful formats render                     |
| Booking delivery           | BLOCKED                  | /api/contact safely returns 503 because the email provider is not configured                                 |
| Public LIFT previews       | READY LOCALLY            | Two silent, user-started movement clips pass desktop/mobile playback and range delivery checks               |
| LIFT private video         | READY IN STAGING STORAGE | Private object uploaded, downloaded, and hash-matched                                                        |
| LIFT PDF                   | BLOCKED                  | Attached candidate renders, but page 6 repeats the wrong support copy; canonical private path remains absent |
| Complete LIFT checkout     | BLOCKED                  | PDF, Stripe, local server credential, webhook, and entitlement E2E remain unverified                         |
| LIFT Guide checkout        | BLOCKED                  | PDF, Stripe, webhook, and entitlement E2E remain unverified                                                  |
| The Den subscription       | DEFERRED                 | Membership checkout remains intentionally disabled                                                           |
| Production release         | NOT AUTHORIZED           | Production Vercel state was not changed                                                                      |

## Completed in This Pass

- Added two distinct, user-started public LIFT movement previews with silent
  delivery, authored posters, one-at-a-time playback, and a direct checkout
  bridge after Movement 2.
- Reconciled all 11 booking services to Shannon's Retreat Experience Guide:
  - Beauty names and per-guest prices
  - Correct movement prices, durations, capacities, and added-guest rates
  - Tarot and Moon Oracle as virtual or in person
  - Tarot + Reiki as in person
- Added guest-count and location fields to the manual booking form.
- Added the 10–14 day preferred-notice policy without enforcing a false hard minimum.
- Fixed retreat inquiry email-data loss by allowing organization, guestCount, interests, and datePreference.
- Added Reiki Aromatherapy Healing and Zara K.'s supplied testimonial to Beauty.
- Aligned retreat starting prices, travel language, and Solstice & Equinox Ceremonies.
- Aligned Shannon's seven self-reported credential labels while retaining the independent-verification caveat.
- Added Palm Desert to the service-area copy and structured data.
- Made VTT captions an optional Phase 2 enhancement instead of a checkout gate.
- Added written-guide accessibility notes next to both protected LIFT player placements.
- Updated Cal.com documentation to match the manual launch flow and future Phase 2 durations.

## Canonical Booking Catalog

| Service                    | Duration  | Price                         | Format               |
| -------------------------- | --------- | ----------------------------- | -------------------- |
| Wild Glow Express Facial   | 15–20 min | $111/guest, minimum 4         | In person            |
| Reiki Aromatherapy Healing | 30–45 min | $222/guest                    | In person            |
| Signature Facial           | 60 min    | $277/guest                    | In person            |
| Beauty & Being Ritual      | 90 min    | $333/guest                    | In person            |
| Wild Glow Luxury Facial    | 120 min   | $444/guest                    | In person            |
| Private Yoga + Sound       | 60 min    | $555 up to 4, +$55/additional | In person            |
| Private Sound Healing      | 60–75 min | $444 up to 8, +$44/additional | In person            |
| Private Yoga               | 75–90 min | $666 for 2–4, +$66/additional | In person            |
| Intuitive Tarot Reading    | 45–60 min | $222                          | Virtual or in person |
| Moon Oracle Reading        | 45–60 min | $222                          | Virtual or in person |
| Tarot + Reiki Experience   | 60–75 min | $444                          | In person            |

## Supabase Staging Evidence

- Confirmed project: lkxppynmdfzljuptauxf
- Health: ACTIVE_HEALTHY
- Remote migration ledger: exactly 001–009
- Missing migration: 010_lift_pricing_alignment.sql
- Expected public schema present: 22 tables, 29 functions, 30 application triggers, 33 RLS policies
- Auth users: 2
- Matching profiles: 2
- Shannon identity shannonmarydixon@gmail.com: absent
- Active purchases: 0
- Active memberships: 0
- Bucket: member-content
- Bucket visibility: private

### Protected LIFT Video

| Property                        | Verified value                                                   |
| ------------------------------- | ---------------------------------------------------------------- |
| Local canonical path            | private-content/lift/complete-lift-v1.mp4                        |
| Staging object path             | member-content/lift/complete-lift-v1.mp4                         |
| Size                            | 46,514,399 bytes                                                 |
| Duration                        | 3:54.53                                                          |
| Video                           | H.264 High, 1920×1080, 23.976 fps, BT.709                        |
| Audio                           | AAC-LC, 48 kHz stereo, 129 kb/s                                  |
| Fast start                      | Confirmed                                                        |
| SHA-256                         | d3d3c7a390a4b8c199ae0970533c0c14ab4327ba7d3e53d7662c895d4860bf23 |
| Full decode                     | PASS                                                             |
| Visual contact-sheet review     | PASS                                                             |
| Hosted download hash comparison | PASS, exact match                                                |
| Direct public-object URL        | DENIED, HTTP 400                                                 |
| 60-second signed range request  | PASS, HTTP 206, bytes 0–1023/46,514,399                          |
| App anonymous video request     | DENIED, HTTP 401                                                 |

The earlier 65.3 MiB derivative is preserved locally as
private-content/lift/complete-lift-v1-65mb.mp4. The staging bucket's 50 MB
object limit rejected it, so the canonical derivative was optimized to 46.5 MB
without changing the bucket's security or size boundary.

### Public Movement Previews

The full 3:54 lesson remains private. Two silent 18.02-second derivatives are
public only for the two movements already promised as previews:

| Preview       | Public path                          |            Size | SHA-256                                                          |
| ------------- | ------------------------------------ | --------------: | ---------------------------------------------------------------- |
| Prep the Skin | video/lift/prep-the-skin-preview.mp4 | 2,022,329 bytes | 280a73883e6993ac464f3598d8fda6b335564e2e3a7d706fbd7f1b5bacd50d16 |
| Jawline Lift  | video/lift/jawline-lift-preview.mp4  | 1,820,531 bytes | 45d23c10e386dee6b86c70798ddb3e5167b3a00c993fea986d088438acd92ec9 |

Both are 960×540 H.264, contain no audio track, use authored posters, and do
not load until the visitor presses Play. Starting one pauses the other.

### LIFT PDF Candidate

The owner attached `/Users/cougarceleste/Downloads/lift-guide.pdf`.

- 11 pages; 6,095,657 bytes
- SHA-256: `cbf8ce496d2073886f769149a4a1d158c995c534a1b8f8b3356e52700e3a1ce9`
- Unencrypted; no JavaScript; all pages rendered for visual inspection
- Blocking content defect: page 6, `Jawline Lift`, repeats the `Prep the Skin`
  support line (`Smooth glide, even product application, and a mindful
starting point`) instead of the approved jawline support copy

The candidate was preserved in Downloads and was not copied to the canonical
private path or uploaded to staging.

### Migration State

Do not replay migrations 001–009. The linked database CLI currently times out
while initializing Supabase's temporary login role, so migration 010 was not
forced through a non-ledger-aware path.

- 008_existing_auth_profile_backfill.sql: d612fc01725a444e4e0583dba7234d424d2927d39dadb97b5daba25c9cb9b3e5
- 009_function_security_hardening.sql: 3f06f040d79026cca153d567f425568c90e9fb8d6bab401c768bbb45e566964f
- 010_lift_pricing_alignment.sql: 257f8bff692dcc54f94dfbd2cba2e657bc8e74490ce9ce9d69541370ed8723f9

The safe next database action is to apply only migration 010 through a working
ledger-aware Supabase path, then verify the recorded version and the two exact
pricing rows.

## Vercel State

Project: whole-body-earth/hwl-by-smd

Preview and Development now contain:

- CONTACT_TO_EMAIL
- LIFT_PDF_STORAGE_PATH
- LIFT_VIDEO_STORAGE_PATH
- COMMERCE_SALES_READY=false

Production was untouched. No Stripe, Supabase service-role, webhook, Resend, or
other secret provider values were added to Vercel.

### Stripe and Environment Readiness Audit

- Local `COMMERCE_SALES_READY` remains `false`.
- Local `STRIPE_PDF_PRICE_ID` is absent. The other Stripe-shaped local values
  are too short to be real provider credentials and were not API-verified.
- The local Supabase publishable key uses the current `sb_publishable_` format,
  but the server credential does not match either the current `sb_secret_`
  format or the legacy JWT format.
- Vercel Preview and Development contain only the four non-provider values
  listed above. Neither environment contains Stripe credentials, Stripe Price
  IDs, or a Supabase server credential. Production contains none of these
  launch values.
- The current redirect-based Stripe Checkout implementation does not require a
  browser publishable key. It requires the server secret, webhook secret, and
  two verified one-time Price IDs.
- Use the direct webhook URL
  `https://www.howlbysmd.com/api/stripe/webhook`. The apex URL returns HTTP 308,
  and Stripe treats redirected webhook delivery as a failure.
- Subscribe the one-time launch endpoint to at least
  `checkout.session.completed` and `charge.refunded`. The handler verifies and
  fulfills completed checkouts and revokes active purchases after a full
  refund.
- The Den subscription is intentionally disabled in the current catalog and is
  not part of this launch.
- Enable `COMMERCE_SALES_READY=true` first only in a coherent test Preview using
  Stripe test credentials, staging Supabase, and the corrected PDF. Production
  remains `false` until the entire Preview purchase and revocation journey
  passes and the owner gives separate release approval.

The active Git branch is `checkpoint/platform-overhaul-2026-08-20`, not
`main`. The audited commerce work and migration 010 remain uncommitted, so no
direct `origin/main` push is assumed.

## Test Evidence

| Check                            | Result                                                                  |
| -------------------------------- | ----------------------------------------------------------------------- |
| TypeScript                       | PASS — npm run typecheck                                                |
| ESLint                           | PASS — npm run lint                                                     |
| SEO validation                   | PASS — 21 pages, 21 metadata records, 7 long-form documents             |
| Production build                 | PASS — Next.js 16.3.1, 62 static pages generated                        |
| Diff whitespace                  | PASS — git diff --check                                                 |
| Desktop booking browser          | PASS — exact catalog, selection, new fields, no overflow                |
| 375 px booking browser           | PASS — no overflow or framework overlay                                 |
| Beauty desktop/mobile browser    | PASS — five offers, exact names, no overflow                            |
| LIFT previews desktop/mobile     | PASS — two distinct players, no overflow or framework overlay           |
| Preview deferred loading         | PASS — both movement videos remained at readyState 0 before user action |
| Preview playback handoff         | PASS — user-started playback works and one-at-a-time behavior is active |
| Preview HTTP range delivery      | PASS — both returned HTTP 206 for bytes 0–1023                          |
| Browser console errors           | PASS — none observed on checked routes                                  |
| Anonymous protected video        | PASS — 401                                                              |
| Anonymous protected PDF          | PASS — 307 login redirect                                               |
| Entitled protected video         | NOT RUN — staging has no entitlement fixture                            |
| Purchase → webhook → entitlement | NOT RUN — Stripe is not configured                                      |
| Booking email delivery           | BLOCKED — provider configuration missing                                |

## Remaining Launch Blockers

1. Correct the page 6 `Jawline Lift` support line to `Jawline definition,
tension release, and lymphatic flow.` Re-export and reattach the PDF. After
   full render verification, put it at private-content/lift/lift-guide.pdf and
   upload it to member-content/lift/lift-guide.pdf.
2. Replace the invalid local Supabase server credential and add the correct
   staging credential to Vercel Preview/Development without exposing it.
3. Apply only migration 010 through a ledger-aware path.
4. Decide and configure inquiry delivery:
   - valid Resend key, verified sender, and CONTACT_FROM_EMAIL, or
   - an explicitly approved additive inquiries-table migration.
5. Confirm the intended Stripe test account; create exact $11.11 PDF and $33.33
   Complete LIFT Prices plus a test webhook at the direct `www` URL subscribed
   to `checkout.session.completed` and `charge.refunded`.
6. Create or identify an ordinary staging customer, complete a test purchase,
   and verify webhook idempotency, entitlement, signed PDF/video access, range
   seeking, and refund revocation.
7. Create Shannon's admin profile only after her exact Auth identity exists;
   do not create a duplicate or guess a UUID.
8. Deploy a Preview release candidate and repeat the full journey there.
9. Present Preview evidence for owner approval before any Production env change
   or promotion.

## Current Launch Recommendation

Keep COMMERCE_SALES_READY=false. The site is visually ready and the private
video layer is now real, but opening sales before the PDF, Stripe, webhook,
server credential, and fulfillment journey pass would sell access the site
cannot yet guarantee.

No claim is made that the written PDF is a full transcript or that deferring
captions establishes WCAG conformance. English VTT captions remain a documented
Phase 2 accessibility enhancement.
