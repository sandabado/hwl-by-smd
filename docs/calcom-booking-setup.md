# Cal.com booking setup

Last audited: August 28, 2026

## Launch state

The active `/book` page uses Shannon's manual inquiry flow. It does not read
Cal.com availability or embed a calendar. Cal.com is retained only as a Phase
2 option after Shannon confirms a working schedule, conflict calendars, and
location rules.

- The website never fabricates availability.
- The manual inquiry form is the launch booking path for all services.
- No Cal.com event type should replace that flow without a separately approved
  Phase 2 implementation and browser verification.
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

| Website service            | Required Cal.com slug        | Fixed Phase 2 duration | Format               |
| -------------------------- | ---------------------------- | ---------------------- | -------------------- |
| Wild Glow Express Facial   | `wild-glow-express-facial`   | 20 min                 | In person            |
| Reiki Aromatherapy Healing | `reiki-aromatherapy-healing` | 45 min                 | In person            |
| Signature Facial           | `signature-facial`           | 60 min                 | In person            |
| Beauty & Being Ritual      | `beauty-being-ritual`        | 90 min                 | In person            |
| Wild Glow Luxury Facial    | `wild-glow-luxury-facial`    | 120 min                | In person            |
| Private Yoga + Sound       | `private-yoga-and-sound`     | 60 min                 | In person            |
| Private Sound Healing      | `private-sound-healing`      | 75 min                 | In person            |
| Private Yoga               | `private-yoga`               | 90 min                 | In person            |
| Intuitive Tarot Reading    | `intuitive-tarot-reading`    | 60 min                 | Virtual or in person |
| Moon Oracle Reading        | `moon-oracle-reading`        | 60 min                 | Virtual or in person |
| Tarot + Reiki Experience   | `tarot-and-reiki`            | 75 min                 | In person            |

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
2. Keep `/book?service=<slug>` on the manual inquiry flow until Phase 2 is
   explicitly approved and implemented.
3. Verify timezone display, location, duration, buffers, confirmation email,
   conflict blocking, rescheduling, and cancellation with a real test booking.
4. Remove the test booking and confirm that the slot becomes available again.
