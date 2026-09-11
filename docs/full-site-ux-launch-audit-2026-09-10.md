# HWL by SMD — Full-site UX and launch audit

Date: 2026-09-10

Candidate branch: `checkpoint/platform-overhaul-2026-08-20`

Last committed checkpoint at audit start: `d1f3f49`

Authority: the local working tree is the current design candidate. It is not yet an immutable Preview release and is not Production proof.

## Launch experience

The intended launch spine is intentionally small:

1. Discover Beauty, Body, Being, LIFT, Retreats, or Shannon.
2. Book an appointment through Shannon's live Cal.com availability without paying at booking.
3. Receive confirmation, reschedule, and cancellation communication through Cal.com.
4. Pay for completed appointments through a payment link Shannon sends afterward.
5. Buy the single $11.11 LIFT video + PDF product through the site's cart and Stripe Checkout.
6. Sign into My Account to reach purchased content and available client history.

Membership, journals that are not already published, physical products, and broader Den community features are outside the launch promise.

## Current evidence

| Journey                       | Current state                                             | Evidence or remaining proof                                                                                                                                                                          |
| ----------------------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Homepage discovery            | Local pass                                                | One hero action, three whole-card worlds, one LIFT purchase action, three exact booking pathways, Retreats, Shannon, and three published notes.                                                      |
| Journal                       | Local pass                                                | Three complete articles only: Palm Springs tarot, Joshua Tree sound, and Palm Springs desert skincare. No placeholder or paused journal content. Each article preserves its matching booking intent. |
| Service selection             | Local pass                                                | All 11 services are visible by default and use full-card accessible selection controls.                                                                                                              |
| Live availability             | Provider pass                                             | All 11 service links exposed Cal.com dates and times in read-only testing.                                                                                                                           |
| Individual-service intake     | Local/provider pass                                       | Wild Glow Express does not ask group questions. Facial and Reiki location copy points to HWL Beauty.                                                                                                 |
| Booking request               | Partial provider pass                                     | One zero-payment Intuitive Tarot QA request was created for `accounts@wholebody.earth` and later appeared as Rejected in Cal.com, so it is no longer active.                                         |
| Confirm → reschedule → cancel | Not yet proven end to end                                 | Current request was not confirmed or rescheduled before rejection. A clean lifecycle run still needs exact provider and email evidence.                                                              |
| Booking emails                | Not yet proven                                            | Mailbox receipt was not inspected. Cal.com owns attendee and organizer booking emails.                                                                                                               |
| Cal organizer identity        | Accepted temporary exception                              | Cal currently displays `wholebodymastery@pm.me` for the host. The owner approved changing this later; the target remains `shannon@hwlbysmd.com`.                                                     |
| HWL booking ledger            | Blocked                                                   | The canonical Cal account has no configured webhook, and the site ledger remains disabled without Cal API/webhook credentials and the release flag.                                                  |
| Cart and LIFT shelf           | Local UI implemented                                      | One $11.11 video + PDF product, cart icon, and purchase shelf exist. The store is being reduced to that one shippable product.                                                                       |
| Stripe Checkout               | Code tests pass; live candidate proof missing             | A new exact-candidate sandbox checkout and webhook fulfillment run still requires the explicit owner payment confirmation gate. No live charge is implied by code tests.                             |
| LIFT delivery                 | Previously proven in staging; exact release proof pending | Signed MP4 delivery and access denial were proven earlier. Re-run video and PDF entitlement canaries against the exact release deployment.                                                           |
| Contact and retreat inquiry   | Local pass, Preview proof pending                         | Inquiry collection is currently disabled. Public surfaces now use a direct email path and no longer expose an internal paused state.                                                                 |
| Admin clients                 | Partial                                                   | The client directory surface exists, but a complete cross-provider booking, purchase, payment, and profile timeline depends on the Cal ledger and current Stripe synchronization.                    |
| Admin booking management      | Partial                                                   | Shannon is directed to Cal.com for confirmation, rescheduling, and cancellation. Native HWL management is not a launch promise.                                                                      |
| Post-appointment payment      | Manual                                                    | Shannon sends the payment link after the appointment. Automatic post-session invoice/email delivery is not yet implemented.                                                                          |

## Local improvements in the current candidate

- Simplified the homepage hierarchy and removed competing hero actions.
- Made LIFT a direct primary-navigation destination and a prominent homepage offer.
- Replaced the paused journal experience with three genuine published articles.
- Added article-specific booking links so service intent survives the transition.
- Reduced Beauty to its decision-making essentials: one hero action, LIFT plus facial choices, one testimonial, and the FAQ.
- Removed unbuyable physical collections from Store; its single launch product is LIFT.
- Replaced closed public inquiry forms with direct, human email paths instead of internal paused-state language.
- Removed the booking stepper, category tabs, repeated instructions, large empty header treatment, and decorative card weight.
- Preserved all-service visibility, keyboard focus, touch targets, semantic headings, and live-region feedback.
- Made the scheduling step lead with the selected service and immediately expose live dates and times.
- Removed Cal.com's repeated event-detail panel so the mobile scheduling viewport reaches Shannon's calendar without losing the site's own concise service summary.
- Added distinct lightweight service sigils rather than repeating the same photography.
- Added a restrained shared email brand shell for application-owned Resend messages.
- Re-ran the production dependency audit on September 11; it reported zero known vulnerabilities.

## Must close before Production promotion

1. Create an immutable commit from the reviewed candidate and deploy that exact SHA to Preview.
2. Run desktop and mobile route, keyboard, zoom, reduced-motion, and console-error checks against Preview.
3. Run one approved Stripe sandbox checkout from cart through webhook fulfillment, library access, signed video/PDF delivery, refund policy behavior, and logged-out denial.
4. Configure and verify the Cal webhook/ledger if booking history is promised inside My Account or Admin at launch. Otherwise keep the interface honest that lifecycle management remains in Cal.com.
5. Complete one clean booking request → confirm → reschedule → cancel test, including attendee and organizer email receipts and final calendar cleanup.
6. Verify the new Contact and Retreat direct-email actions on the exact Preview deployment. Do not reopen the durable inquiry form until its database and notification path are proven there.
7. Confirm the two intended admin accounts and their roles in the exact Production Supabase project.
8. Obtain final owner/legal review of the locally reconciled Privacy, Terms, Refund, and Health Disclaimer copy before Production promotion.
9. Reintroduce specific credentials only after the owner verifies the exact title and supporting authority; the local candidate no longer publishes unverified credential claims or an internal warning.
10. Obtain fresh owner approval for Preview publication and, after exact-deployment evidence, a separate Production promotion approval. Do not push `main`.

## Minimal public information architecture

- Primary navigation: Beauty · Body · Being · LIFT · Retreats · About
- Utility navigation: Book a Session · Cart icon · My Account icon
- Homepage: one hero action → three worlds → LIFT → exact session pathways → Retreats → Shannon → published notes
- Service pages: short hero → exact service list → one proof section → concise FAQ
- Store: LIFT only until another product is genuinely purchasable
- Contact: live availability plus one direct email path
- My Account: purchases and content first; booking history only when the Cal ledger is live

## Accepted follow-up

- Change the Cal.com host/account email from `wholebodymastery@pm.me` to `shannon@hwlbysmd.com` after launch. This is explicitly deferred, not considered complete.
