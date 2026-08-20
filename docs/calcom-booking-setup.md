# Cal.com booking setup

Last audited: August 20, 2026

## What the website does

The `/book` page reads the public event types published under
`https://cal.com/hwlbysmd`.

- A service shows a live, event-specific Cal.com calendar when a published
  event type has the same slug as the website service.
- A service without a matching published event type keeps the booking-request
  fallback. The site never fabricates availability.
- No API key is required for this public read or for the Cal.com embed.
- `CALCOM_API_KEY`, if added for future server-side work, must remain server-only.

## Current account state

The authenticated read-only audit found:

- Account: `HWLbySMD` (`hwlbysmd`)
- Timezone: `America/Los_Angeles`
- Public event types: 0
- Default schedule: Monday through Friday, 9:00 AM–5:00 PM
- Calendar connection: Apple Calendar connected
- Conflict calendars selected: 0
- Destination calendar: configured
- Conferencing apps: 0

Do not publish event types until Shannon confirms the working schedule and at
least one real calendar is selected for conflict checking. Virtual services also
need an approved conferencing location.

## Required event-type slugs

Cal.com event types must use these exact slugs for the website to recognize
them.

| Website service                | Required Cal.com slug        | Website duration | Format    | Cal.com duration decision                       |
| ------------------------------ | ---------------------------- | ---------------- | --------- | ----------------------------------------------- |
| Wild Glow Express Facial       | `wild-glow-express-facial`   | 15–20 min        | In person | Confirm one fixed duration                      |
| Reiki Aromatherapy Healing     | `reiki-aromatherapy-healing` | 30–45 min        | In person | Confirm one fixed duration                      |
| Signature Facial               | `signature-facial`           | 60 min           | In person | 60 min                                          |
| HWL Beauty & Being Ritual      | `beauty-being-ritual`        | 90 min           | In person | 90 min                                          |
| Wild Glow Luxury Facial Ritual | `wild-glow-luxury-facial`    | 120 min          | In person | 120 min                                         |
| Private Yoga + Sound           | `private-yoga-and-sound`     | 60–75 min        | In person | Confirm one fixed duration                      |
| Private Sound Healing          | `private-sound-healing`      | 60 min           | In person | 60 min                                          |
| Private Yoga                   | `private-yoga`               | 75–90 min        | In person | Confirm one fixed duration                      |
| Intuitive Tarot Reading        | `intuitive-tarot-reading`    | 45–60 min        | Virtual   | Confirm one fixed duration and conferencing app |
| Moon Oracle Reading            | `moon-oracle-reading`        | 45–60 min        | Virtual   | Confirm one fixed duration and conferencing app |
| Tarot + Reiki Experience       | `tarot-and-reiki`            | 60–75 min        | Hybrid    | Confirm one fixed duration and location choices |

## Safe launch checklist

Complete these in Cal.com before publishing the first event type:

1. Confirm Shannon's actual weekly availability and date-specific overrides.
2. Select every Apple calendar that must prevent double-booking.
3. Confirm the destination calendar for new bookings.
4. Set minimum notice, booking horizon, buffers, and daily limits.
5. Configure the truthful location for each service. Connect an approved video
   provider before publishing virtual event types.
6. Set the exact fixed duration for every service currently shown as a range.
7. Confirm prices, payment timing, cancellation terms, and intake questions.
8. Publish one event type first, then verify its service on `/book` in desktop
   and mobile layouts before publishing the remaining services.

## Verification after each publish

1. Open the public Cal.com event URL and confirm that valid openings appear.
2. Open `/book?service=<slug>` and confirm that the live calendar replaces the
   request form for that service only.
3. Verify timezone display, location, duration, buffers, confirmation email,
   conflict blocking, rescheduling, and cancellation with a real test booking.
4. Remove the test booking and confirm that the slot becomes available again.
