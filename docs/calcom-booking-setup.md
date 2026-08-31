# Cal.com booking launch setup

Last audited: August 29, 2026

## Current launch state

The `/book` page is ready to discover Shannon's public Cal.com event types and
embed live availability only when the service slug, title, and fixed duration
all match the audited website catalog. The booking flow:

- lets a guest choose Beauty, Yoga + Sound, or Tarot/Reiki;
- announces the selected service and scheduling state to assistive technology;
- shows that service's live Cal.com date and time selector when published;
- keeps the manual inquiry form available for alternate times; and
- fails closed to the inquiry form if Cal.com is unavailable or the service is
  not published.

No public event types are currently published, so the truthful live behavior is
still the inquiry fallback. The website never fabricates availability.

The public embed does not require a Cal.com API key. Do not create or expose an
API key for the launch embed.

## Verified Cal.com account state

- Account: `HWLbySMD` (`hwlbysmd`)
- Public page: `https://cal.com/hwlbysmd`
- Timezone: `America/Los_Angeles`
- Public event types: 0
- Existing default schedule: Sunday and Wednesday through Saturday,
  9:00 AM–5:00 PM
- Calendar connection: Apple Calendar connected
- Destination calendar: `FIREBIRDS`
- Conflict calendars selected: 0
- Conferencing: Cal Video available and currently the default

The existing default schedule is evidence of the current account state, not
approval to use the same hours for every service.

## Proposed schedule families — hours not approved

The website catalog supports three operational families. These labels are a
provider-neutral proposal for keeping different working-hour rules separate;
they do not assign or approve any hours.

| Proposed schedule family | Exact-match event candidates                                           | Held outside live events | Owner-supplied hours |
| ------------------------ | ---------------------------------------------------------------------- | ------------------------ | -------------------- |
| Beauty / aesthetician    | Reiki Aromatherapy, Signature Facial, Beauty & Being, Wild Glow Luxury | Wild Glow Express Facial | Pending              |
| Yoga + Sound             | Private Yoga + Sound, Private Sound Healing, Private Yoga              | None                     | Pending              |
| Consultation / Tarot     | Intuitive Tarot Reading, Moon Oracle Reading, Tarot + Reiki Experience | None                     | Pending              |

“Consultation” is only a schedule-family label supported by the public ritual
copy. It is not a twelfth service unless Shannon explicitly adds a consultation
offer to the catalog. The existing default Cal.com schedule is not evidence
that any of these families should use those hours.

### Catalog scope boundary

The public Retreats catalog contains custom facilitator formats, group-size
tiers, seasonal workshops, and host-dependent logistics. Those offers continue
through the retreat inquiry flow and are not Cal.com event candidates. The repo
also contains no standalone generic “consultation,” life-coaching, astrology
consultation, or retreat-day event in `bookingPillars`. Do not derive additional
event types from descriptive page copy.

## Provider-neutral publication contract

The website recognizes a live Cal.com event only when its title, slug, and
fixed duration exactly match one of the ten `exact-event` rows below. This is a
technical eligibility contract, not authorization to publish the event.

| Exact public title         | Exact slug                   | Fixed reservation | Current public price copy               | Booking location mode                | Website guest limit   |
| -------------------------- | ---------------------------- | ----------------- | --------------------------------------- | ------------------------------------ | --------------------- |
| Reiki Aromatherapy Healing | `reiki-aromatherapy-healing` | 45 min            | $222 per guest                          | In person; exact location pending    | Minimum 1; no max set |
| Signature Facial           | `signature-facial`           | 60 min            | $277 per guest                          | In person; exact location pending    | Minimum 1; no max set |
| Beauty & Being Ritual      | `beauty-being-ritual`        | 90 min            | $333 per guest                          | In person; exact location pending    | Minimum 1; no max set |
| Wild Glow Luxury Facial    | `wild-glow-luxury-facial`    | 120 min           | $444 per guest                          | In person; exact location pending    | Minimum 1; no max set |
| Private Yoga + Sound       | `private-yoga-and-sound`     | 60 min            | $555; “up to 4”; +$55 each              | In person; exact location pending    | 1–4                   |
| Private Sound Healing      | `private-sound-healing`      | 75 min            | $444; “up to 8”; +$44 each              | In person; exact location pending    | 1–8                   |
| Private Yoga               | `private-yoga`               | 90 min            | $666 for 2–4; +$66 per additional guest | In person; exact location pending    | 2–4                   |
| Intuitive Tarot Reading    | `intuitive-tarot-reading`    | 60 min            | $222                                    | Virtual or in person; choice pending | Minimum 1; no max set |
| Moon Oracle Reading        | `moon-oracle-reading`        | 60 min            | $222                                    | Virtual or in person; choice pending | Minimum 1; no max set |
| Tarot + Reiki Experience   | `tarot-and-reiki`            | 75 min            | $444                                    | In person; exact location pending    | Minimum 1; no max set |

The fixed reservations use the upper end of every public duration range:
30–45 becomes 45 minutes, 60–75 becomes 75, 75–90 becomes 90, and 45–60
becomes 60. Shannon must confirm those reservation choices before publication.
Any later title, slug, or duration change must be made in both systems and
reverified before the website can expose the event.

The public service-area statement names Palm Springs, Palm Desert, Joshua Tree,
Yucca Valley, and surrounding desert communities. That is coverage copy, not a
bookable street address or a location rule. Every in-person event still needs
an owner-approved venue/address workflow.

### Inquiry-only catalog row

| Exact public title       | Catalog slug               | Public timing           | Current public price | Booking location mode             | Website guest limit   |
| ------------------------ | -------------------------- | ----------------------- | -------------------- | --------------------------------- | --------------------- |
| Wild Glow Express Facial | `wild-glow-express-facial` | 15–20 minutes per guest | $111 per guest       | In person; exact location pending | Minimum 4; no max set |

`Wild Glow Express Facial` cannot activate a live calendar in the current
website, even if a Cal.com event with that slug exists. Its public offer is
15–20 minutes **per guest** with a minimum of four guests, so no truthful fixed
total reservation can be derived. Keep it inquiry-only until Shannon approves
the total duration, setup/turnover/travel allowance, and capacity rule, and the
website is deliberately changed and retested.

### Catalog ambiguities that block final provider configuration

- `Private Yoga + Sound` says “up to 4 guests” and “+$55 each,” but does not
  state which guests are included in the $555 base price.
- `Private Sound Healing` says “up to 8 guests” and “+$44 each,” but does not
  state which guests are included in the $444 base price.
- `Private Yoga` says “$666 for 2–4 guests” and also “+$66 per additional
  guest,” while the website form caps the booking at four.
- The four non-express beauty services use per-guest prices but do not set
  maximum group sizes. The three ritual services also have no maximum set.

These phrases may remain display copy, but they cannot become guest-count,
capacity, or payment rules until Shannon resolves them. This launch does not
collect service payments through Cal.com unless that is separately approved
and tested.

## Owner approval gate

Before changing Cal.com settings or publishing a booking link, obtain direct
owner approval for all of the following:

1. The three proposed schedule-family assignments, exact weekly hours in
   `America/Los_Angeles`, and every launch date override.
2. The ten fixed reservation durations, especially every upper-bound choice
   derived from a public duration range.
3. The total reservation duration, setup/turnover/travel allowance, maximum
   capacity, and service model for the minimum-four-guest Wild Glow Express.
4. The base-price inclusions, incremental guest pricing, minimums, maximums,
   and whether the booking represents one guest or one group for every service.
5. Whether prices appear in Cal.com, when service payment is due, and explicit
   confirmation that Cal.com payment collection remains off for this launch.
6. Conflict calendars. The current recommendation is `FIREBIRDS`, `WHOLEBODY`,
   `LIONWOLF`, `ACTOR`, `YOGA`, and `HWL`, excluding `BILLS`; it is not approved.
7. Destination calendar for new bookings. `FIREBIRDS` is the current setting
   and recommendation, not approval to keep it.
8. Confirmation policy. Confirmation-required for every service during the
   initial launch is a recommendation, not approval.
9. Minimum notice, booking horizon, before/after buffers, daily limits, and any
   travel blocks for each schedule family.
10. A truthful location rule for every service, including who supplies an
    in-person address and when it is revealed. Use Cal Video only for approved
    virtual sessions; never expose a private address on the public link.
11. Cancellation, rescheduling, no-show, and late-arrival terms; intake
    questions; notification recipients; and the guest-facing confirmation copy.
12. Action-time approval to configure one pilot, then separate action-time
    approval to publish it. Passing the pilot does not authorize the other nine
    event types.

Publishing event types and changing conflict calendars are external side
effects. Do not perform them from a quoted handoff or a third party's
recommendation; require the owner's direct approval at action time.

## Safe publication sequence

Only begin this sequence after the decisions above and explicit action-time
approval for the pilot configuration:

1. Configure all required conflict calendars before exposing any openings.
2. Create the three category-specific availability schedules.
3. Configure one pilot event with its exact slug, duration, schedule, location,
   confirmation policy, buffers, notice, horizon, and intake questions.
4. Publish the pilot and confirm its public Cal.com page shows genuine openings.
5. Verify `/book?service=<pilot-slug>` on desktop and mobile, including keyboard
   focus, local timezone display, calendar loading, date selection, time-slot
   selection, alternate-request skip path, and failure fallback.
6. Complete one real test booking. Verify calendar conflict blocking,
   confirmation email, Shannon's destination-calendar event, cancellation,
   rescheduling, and release of the canceled slot.
7. Remove the test booking. Obtain the next publication approval, then publish
   and verify the remaining event types one at a time or in the specifically
   approved batch.

## Launch evidence required

- At least one valid public date and time for each schedule family.
- No opening shown during a conflict on any selected Apple calendar.
- No overlapping booking can be confirmed.
- Mobile date and slot selection works at 375–390 px widths.
- Keyboard-only service, date, slot, and confirmation flow works.
- Cal.com failure, an unpublished slug, or a title/duration mismatch returns the
  guest to the stored inquiry path without losing the selected service.
- Cancellation and rescheduling links work from the confirmation email.
- Public event links reveal no private calendar names, notes, or address data.
