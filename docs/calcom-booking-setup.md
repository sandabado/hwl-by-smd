# Cal.com booking launch setup

Last revised: September 10, 2026

## Current provider state

The canonical Cal.com account is `HWLbySMD` (`hwlbysmd`) in
`America/Los_Angeles`. A fresh Cal.com public API read returns all eleven
expected active public event types. `Wild Glow Express Facial` is provider
event `6981284`, with the exact title and `wild-glow-express-facial` slug, a
20-minute duration, and a free `0 USD` Cal.com price. The website offer remains
$111 for one person; it is not a group experience and has no minimum-four rule.

The `/book` page discovers public event types and exposes a live date/time
selector only when Cal.com's slug, title, and fixed duration exactly match the
website catalog and the event is free in Cal.com. If discovery is unavailable,
or if a provider record is missing or does not exactly match, that service
fails closed to its alternate request path. The website never guesses a Cal.com
URL or fabricates availability.

The public embed does not require a Cal.com API key. Do not create or expose an
API key for the launch embed.

## Current schedule families

| Cal.com schedule       | Provider ID | Weekly availability (Pacific)        | Assigned events                                                                                                        |
| ---------------------- | ----------: | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| HWL Beauty             |   `2303131` | Wednesday–Thursday, 10:00 AM–4:00 PM | Wild Glow Express Facial; Reiki Aromatherapy Healing; Signature Facial; Beauty & Being Ritual; Wild Glow Luxury Facial |
| HWL Yoga Sound         |   `2303132` | Friday–Saturday, 9:00 AM–2:00 PM     | Private Yoga + Sound; Private Sound Healing; Private Yoga                                                              |
| HWL Consultation Tarot |   `2303130` | Sunday, 12:00–5:00 PM                | Intuitive Tarot Reading; Moon Oracle Reading; Tarot + Reiki Experience                                                 |

“Consultation” is a schedule-family label, not an additional service. Custom
retreat formats, seasonal workshops, and host-dependent group experiences
continue through the inquiry flow and are not Cal.com event candidates.

## Current event catalog

| Exact public title         | Exact slug                   | Fixed reservation | Schedule               | Location mode                 | Per-event daily cap |
| -------------------------- | ---------------------------- | ----------------: | ---------------------- | ----------------------------- | ------------------: |
| Wild Glow Express Facial   | `wild-glow-express-facial`   |            20 min | HWL Beauty             | HWL Beauty location           |                   2 |
| Reiki Aromatherapy Healing | `reiki-aromatherapy-healing` |            45 min | HWL Beauty             | HWL Beauty location           |                   2 |
| Signature Facial           | `signature-facial`           |            60 min | HWL Beauty             | HWL Beauty location           |                   2 |
| Beauty & Being Ritual      | `beauty-being-ritual`        |            90 min | HWL Beauty             | HWL Beauty location           |                   2 |
| Wild Glow Luxury Facial    | `wild-glow-luxury-facial`    |           120 min | HWL Beauty             | HWL Beauty location           |                   2 |
| Private Yoga + Sound       | `private-yoga-and-sound`     |            60 min | HWL Yoga Sound         | Attendee address              |                   2 |
| Private Sound Healing      | `private-sound-healing`      |            75 min | HWL Yoga Sound         | Attendee address              |                   2 |
| Private Yoga               | `private-yoga`               |            90 min | HWL Yoga Sound         | Attendee address              |                   2 |
| Intuitive Tarot Reading    | `intuitive-tarot-reading`    |            60 min | HWL Consultation Tarot | Cal Video or attendee address |                   3 |
| Moon Oracle Reading        | `moon-oracle-reading`        |            60 min | HWL Consultation Tarot | Cal Video or attendee address |                   3 |
| Tarot + Reiki Experience   | `tarot-and-reiki`            |            75 min | HWL Consultation Tarot | Attendee address              |                   3 |

All eleven rows now return through Cal.com's public API. Wild Glow Express is
public and exact at event ID `6981284`, 20 minutes, and `0 USD`. Its provider UI
shows the HWL Beauty schedule, 60-minute buffers before and after, two days'
minimum notice, a two-bookings-per-day cap, and a rolling 30-day horizon. Its
preview says **Requires confirmation**; paid booking and seats are off. The
published durations use the upper end of a public duration range so Cal.com
never under-reserves Shannon's time. Any later title, slug, duration, or Cal
price change must be made in both systems and reverified before the website
exposes the changed event.

## Booking safeguards

The original ten events were verified with the safeguards below. For Wild Glow
Express, the September 7 provider review proves its schedule, limits, buffers,
payment/seat state, and intake configuration; its preview displays **Requires
confirmation**. The local website then completed the newly added event's full
request, organizer-confirmation, cancellation, and slot-release lifecycle.

- Destination calendar: `FIREBIRDS`.
- Conflict checks: `FIREBIRDS`, `WHOLEBODY`, `LIONWOLF`, `ACTOR`, `YOGA`, and
  `HWL`; `BILLS` is excluded.
- Every published event must require Shannon's confirmation **Always**; an
  unconfirmed request blocks its slot.
- Every published event must have 48 hours' minimum notice, 60 minutes before
  and after, and a rolling 30-calendar-day booking horizon.
- Guest invitations are hidden. Only Private Yoga + Sound, Private Sound
  Healing, and Private Yoga retain the required number question “How many
  people will participate, including you?” All eight direct individual services
  hide that question. The duplicate custom “Where will this session take
  place?” question is hidden on all eleven events; Cal.com's native location
  control is the single source of location truth.
- All five Beauty-catalog appointments use the fixed private HWL Beauty
  organizer location. The street address is not displayed before confirmation.
  Tarot + Reiki and the three movement events use an attendee-supplied address.
  Optional Notes remain available for access, parking, preparation, or
  accessibility details.
- Intuitive Tarot Reading and Moon Oracle Reading alone offer the choice of Cal
  Video or an attendee-supplied address. Tarot + Reiki and the three movement
  events use an attendee-supplied address. The four facial events and Reiki
  Aromatherapy stay fixed at HWL Beauty.
- Cal.com paid booking and seats must remain disabled for every event. One
  booking is a request for one party; Shannon confirms it manually. No payment
  is collected when the appointment is requested. Shannon arranges payment
  after the completed appointment.

All five Beauty-catalog services are flat individual appointments held at HWL
Beauty. No Beauty-catalog booking asks for a customer address or guest count;
the private street address is shared after Shannon confirms the request. The
three ritual services are also flat individual direct bookings; group ritual
and group Beauty requests belong in the Retreats inquiry flow.

The per-event daily caps are provider safety limits, not a proven aggregate cap
across every event in a schedule family. Required guest-count answers are
intake data, not Cal.com seat inventory or automatic group-price calculation.
Manual confirmation remains the authority for guest-count eligibility,
location, and final price.

The post-session payment email is **not automated yet**. Until a separately
reviewed completion action and Stripe invoice/payment-link workflow pass an
end-to-end test, Shannon must create and send the post-appointment payment
request manually. Cal.com confirmation does not create or send a Stripe payment
link.

## Catalog boundaries retained on the website

- `Private Yoga + Sound` says “up to 4 guests” and “+$55 each,” but does not
  state which guests are included in the $555 base price.
- `Private Sound Healing` says “up to 8 guests” and “+$44 each,” but does not
  state which guests are included in the $444 base price.
- `Private Yoga` says “$666 for 2–4 guests” and also “+$66 per additional
  guest,” while the website form caps the booking at four.
- Direct Beauty and ritual bookings are one-person services. Group Beauty or
  ritual requests are custom Retreats inquiries and are not represented by
  these Cal.com event types.

These phrases remain display and intake copy. They are not automated capacity
or payment rules. Cal.com collects no service payment; appointment payment is
handled after the completed session.

## Website handoff evidence and remaining end-to-end work

The dated evidence below is retained as history. References before September 7
to ten events, a minimum-four Wild Glow group, or an inquiry-only Wild Glow flow
describe the former catalog and do not override the current eleven-service
model above.

For the original ten-service configuration, provider setup and publication
were complete. On August 31, a local network-enabled `/book` run discovered all
ten public event types through the same server-side Cal.com request used by the
application. The embedded selector
then rendered genuine openings for all three schedule families: Beauty on a
Wednesday, Yoga + Sound on a Friday, and Consultation / Tarot on a Sunday. The
Signature Facial loading state resolved to a live calendar with enabled
dates and visible times; Private Yoga and Moon Oracle Reading also rendered
their family-specific dates and times. Wild Glow Express remained inquiry-only
with no Cal.com link or iframe. The page returned HTTP 200 and showed no Next.js
error overlay. At a 390×844 viewport, the Signature Facial calendar retained a
390-pixel client and scroll width, displayed enabled dates and six visible time
buttons, and produced no error overlay or horizontal overflow.

On September 4, the exact READY checkpoint Preview returned HTTP 200 for the
Signature Facial, Private Yoga, Moon Oracle Reading, and Wild Glow Express
booking routes. The three Cal-backed pages contained their exact public
`https://cal.com/hwlbysmd/<slug>` handoff and live-calendar copy; Wild Glow
Express contained inquiry-only copy and no Cal link. A fresh public provider
read returned all ten exact intended slugs. A privacy-focused aggregate scan
found no public conflict-calendar labels, attendee addresses, private notes, or
note templates. Distinct live public dates and times were also confirmed for
the Esthetician, Yoga, and Consultation schedule families.

On September 6, the current public Production site completed a full Intuitive
Tarot Reading lifecycle for the authorized test attendee at
`admin@ghosthand.studio`. The noon request entered Cal's unconfirmed queue,
was manually confirmed by the authenticated organizer, and generated a Cal
Video meeting. Public availability then suppressed the appointment plus its
configured buffers. The organizer rescheduled it to 1:00 PM with a stated test
reason; Cal reported that the updated calendar invitation was emailed to
everyone, and public availability moved the suppression with the booking. The
organizer then canceled it with a stated completion reason. The organizer
dashboard returned to zero upcoming bookings, Canceled history retained the
test lifecycle, and all five Sunday slots from noon through 4:00 PM returned.
The owner subsequently confirmed that the attendee calendar invitation arrived
at `admin@ghosthand.studio`. No test appointment remains active and no Cal
payment was collected.

A later authenticated provider-side reinspection confirmed that Cal's
**Canceled** bookings view still retains both the original noon request and the
rescheduled 1:00 PM lifecycle entry for `Ghosthand Admin Test`, including the
launch-verification note and generated Cal Video meeting links. This confirms
provider-dashboard persistence; it does not independently prove Shannon's
organizer-mailbox delivery or the FIREBIRDS calendar object.

A fresh non-submitting Production keyboard check then activated September 27
and the 12:00 PM slot with Enter inside the embedded calendar. Cal rendered the
attendee form with its required name, email, location, guest-count, notes, Back,
and Confirm controls. Back was also activated with Enter; all five Sunday slots
remained available afterward. Confirm was never activated, so this check created
no booking. Runtime output contained no errors and only two Cal-owned warnings.

A subsequent non-submitting Production mobile-viewport pointer check at
390×844 opened the same website embed, advanced to October, selected October 11,
and selected the noon appointment. The required attendee form rendered inside
the embed. Activating Back returned to October 11 with all five noon-through-4:00
PM slots available; the organizer dashboard still reported zero Upcoming and
zero Unconfirmed bookings. This passes browser-level responsive pointer
activation for month, date, time, and Back controls without creating a booking.
Physical iOS or Android touch hardware remains a separate field check.

On September 7, the current local candidate discovered the exact Wild Glow
Express provider event and rendered Shannon's genuine September availability
with 20-minute times beginning at 10:00 AM. An authorized request for September
16 at 10:00 AM was submitted through the website for
`admin@ghosthand.studio`. The Cal.com form asked only for name, email, the
required attendee address, and optional notes; it showed no guest-count,
duplicate-location, seat, or payment step. The website displayed its booking
receipt, the request appeared in Cal.com's **Unconfirmed** queue, and Shannon's
organizer account successfully confirmed it. The organizer then canceled the
test with an explicit launch-verification reason. Cal.com returned to zero
upcoming test bookings, and the released 10:00 and 10:20 AM openings reappeared
on a fresh website load. No payment was collected. This proves the complete
local application-to-provider lifecycle without leaving a test appointment
active; the deployed candidate still requires a non-submitting smoke check.

An August 31 direct/provider Signature Facial test separately entered the
unconfirmed queue, was manually confirmed, rescheduled, canceled, and released
its slot.

The following customer-journey evidence is still required:

- Verify that the deployed candidate resolves Wild Glow Express to the exact
  provider event and renders its live embedded dates and times. Do not create a
  second test request unless provider state has changed.
- A selected conflict on each approved Apple calendar removes the opening.
- Overlapping bookings cannot both be confirmed.
- Confirm the already passing responsive embed on at least one physical iOS or
  Android touchscreen and recheck the visible local-timezone guidance there.
  Desktop keyboard and 390×844 browser-level pointer activation now pass as
  recorded above.
- Directly inspect the resulting `FIREBIRDS` calendar object and the organizer
  inbox. Attendee delivery is confirmed by the owner for
  `admin@ghosthand.studio`; Shannon's organizer-mailbox receipt has not been
  independently inspected.
- Cal.com failure, an unpublished slug, or a title/duration mismatch returns
  the visitor to the stored inquiry path without losing the selected service.
- Public event links reveal no private calendar names, notes, or address data.

Complete and remove any test bookings after verification. Publication,
deployed handoff, and historical provider lifecycle evidence are not proof that
current conflict handling, messaging, or the exact Preview's complete booking
journey has passed end to end.
