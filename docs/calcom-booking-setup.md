# Cal.com booking launch setup

Last verified: August 31, 2026

## Current provider state

The canonical Cal.com account is `HWLbySMD` (`hwlbysmd`) in
`America/Los_Angeles`. Its public profile at <https://cal.com/hwlbysmd> now
lists all ten exact-match website services as active public event types.
`Wild Glow Express Facial` remains inquiry-only and has no Cal.com event.

The `/book` page discovers public event types and exposes a live date/time
selector only when Cal.com's slug, title, and fixed duration exactly match the
website catalog. It keeps the manual inquiry path available for alternate times
and fails closed to that path if Cal.com is unavailable or a provider record
does not match. The website never fabricates availability.

The public embed does not require a Cal.com API key. Do not create or expose an
API key for the launch embed.

## Verified schedule families

| Cal.com schedule       | Provider ID | Weekly availability (Pacific)        | Assigned events                                                                              |
| ---------------------- | ----------: | ------------------------------------ | -------------------------------------------------------------------------------------------- |
| HWL Beauty             |   `2303131` | Wednesday–Thursday, 10:00 AM–4:00 PM | Reiki Aromatherapy Healing; Signature Facial; Beauty & Being Ritual; Wild Glow Luxury Facial |
| HWL Yoga Sound         |   `2303132` | Friday–Saturday, 9:00 AM–2:00 PM     | Private Yoga + Sound; Private Sound Healing; Private Yoga                                    |
| HWL Consultation Tarot |   `2303130` | Sunday, 12:00–5:00 PM                | Intuitive Tarot Reading; Moon Oracle Reading; Tarot + Reiki Experience                       |

“Consultation” is a schedule-family label, not an additional service. Custom
retreat formats, seasonal workshops, and host-dependent group experiences
continue through the inquiry flow and are not Cal.com event candidates.

## Verified event publication

| Exact public title         | Exact slug                   | Fixed reservation | Schedule               | Location mode                 | Per-event daily cap |
| -------------------------- | ---------------------------- | ----------------: | ---------------------- | ----------------------------- | ------------------: |
| Reiki Aromatherapy Healing | `reiki-aromatherapy-healing` |            45 min | HWL Beauty             | Attendee address              |                   2 |
| Signature Facial           | `signature-facial`           |            60 min | HWL Beauty             | Attendee address              |                   2 |
| Beauty & Being Ritual      | `beauty-being-ritual`        |            90 min | HWL Beauty             | Attendee address              |                   2 |
| Wild Glow Luxury Facial    | `wild-glow-luxury-facial`    |           120 min | HWL Beauty             | Attendee address              |                   2 |
| Private Yoga + Sound       | `private-yoga-and-sound`     |            60 min | HWL Yoga Sound         | Attendee address              |                   2 |
| Private Sound Healing      | `private-sound-healing`      |            75 min | HWL Yoga Sound         | Attendee address              |                   2 |
| Private Yoga               | `private-yoga`               |            90 min | HWL Yoga Sound         | Attendee address              |                   2 |
| Intuitive Tarot Reading    | `intuitive-tarot-reading`    |            60 min | HWL Consultation Tarot | Cal Video or attendee address |                   3 |
| Moon Oracle Reading        | `moon-oracle-reading`        |            60 min | HWL Consultation Tarot | Cal Video or attendee address |                   3 |
| Tarot + Reiki Experience   | `tarot-and-reiki`            |            75 min | HWL Consultation Tarot | Attendee address              |                   3 |

All ten rows are active and public. The published durations use the upper end
of every public duration range so Cal.com never under-reserves Shannon's time.
Any later title, slug, or duration change must be made in both systems and
reverified before the website exposes the changed event.

### Inquiry-only catalog row

| Exact public title       | Catalog slug               | Public timing           | Current public price | Website guest limit   |
| ------------------------ | -------------------------- | ----------------------- | -------------------- | --------------------- |
| Wild Glow Express Facial | `wild-glow-express-facial` | 15–20 minutes per guest | $111 per guest       | Minimum 4; no max set |

`Wild Glow Express Facial` cannot activate a live calendar in the current
website. Its duration is per guest, so a truthful fixed reservation cannot be
derived without a separately approved total duration and capacity rule.

## Verified booking safeguards

- Destination calendar: `FIREBIRDS`.
- Conflict checks: `FIREBIRDS`, `WHOLEBODY`, `LIONWOLF`, `ACTOR`, `YOGA`, and
  `HWL`; `BILLS` is excluded.
- Every event requires Shannon's confirmation **Always**; an unconfirmed
  request blocks its slot.
- Every event has 48 hours' minimum notice, 60 minutes before and after, and a
  rolling 30-calendar-day booking horizon.
- Guest invitations are hidden. Each event uses the required number question
  “How many people will participate, including you?” and the required long-text
  question “Where will this session take place?”
- Intuitive Tarot Reading and Moon Oracle Reading alone offer the choice of Cal
  Video or an attendee-supplied address. All other events use an
  attendee-supplied address.
- Cal.com paid booking and seats are disabled for every event. One booking is a
  request for one party; Shannon confirms logistics and price separately.

The per-event daily caps are provider safety limits, not a proven aggregate cap
across every event in a schedule family. Required guest-count answers are
intake data, not Cal.com seat inventory or automatic group-price calculation.
Manual confirmation remains the authority for guest-count eligibility,
location, and final price.

## Catalog boundaries retained on the website

- `Private Yoga + Sound` says “up to 4 guests” and “+$55 each,” but does not
  state which guests are included in the $555 base price.
- `Private Sound Healing` says “up to 8 guests” and “+$44 each,” but does not
  state which guests are included in the $444 base price.
- `Private Yoga` says “$666 for 2–4 guests” and also “+$66 per additional
  guest,” while the website form caps the booking at four.
- The four non-express beauty services use per-guest prices without a published
  maximum group size; the three ritual services also have no published maximum.

These phrases remain display and intake copy. They are not automated capacity
or payment rules, and Cal.com collects no service payment for this launch.

## Website handoff evidence and remaining end-to-end work

Provider configuration and publication are complete. On August 31, a local
network-enabled `/book` run discovered all ten public event types through the
same server-side Cal.com request used by the application. The embedded selector
then rendered genuine openings for all three schedule families: Beauty on a
Wednesday, Yoga + Sound on a Friday, and Consultation / Tarot on a Sunday. The
Signature Facial loading state resolved to a live calendar with enabled
dates and visible times; Private Yoga and Moon Oracle Reading also rendered
their family-specific dates and times. Wild Glow Express remained inquiry-only
with no Cal.com link or iframe. The page returned HTTP 200 and showed no Next.js
error overlay. At a 390×844 viewport, the Signature Facial calendar retained a
390-pixel client and scroll width, displayed enabled dates and six visible time
buttons, and produced no error overlay or horizontal overflow.

The following customer-journey evidence is still required:

- A selected conflict on each approved Apple calendar removes the opening.
- Overlapping bookings cannot both be confirmed.
- The website's live embedded date/slot flow works by keyboard and by mobile
  pointer/touch, including actual date and time activation, with the correct
  local-timezone guidance.
- A real request reaches Shannon's `FIREBIRDS` calendar, remains pending until
  manually confirmed, and sends the expected guest and owner notifications.
- Confirmation, cancellation, and rescheduling work; canceling releases the
  slot.
- Cal.com failure, an unpublished slug, or a title/duration mismatch returns
  the visitor to the stored inquiry path without losing the selected service.
- Public event links reveal no private calendar names, notes, or address data.

Complete and remove any test bookings after verification. Publication and the
verified website handoff are not evidence that conflict handling, messaging,
cancellation, rescheduling, or a completed booking has passed end to end.
