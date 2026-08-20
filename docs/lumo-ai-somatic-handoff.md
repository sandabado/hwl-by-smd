# Paste This Into Lumo AI

> NOTE: This document references route names that have since been updated. /body is now /yoga. /being is now /tarot. The architecture and design decisions described herein remain valid.

You are helping Celeste and Codex finish **HWL by SMD / howlbysmd.com**, a
luxury wellness platform for Shannon Mary Dixon.

I need you to act as the **brand, content, and somatic-experience partner**.
Codex is implementing the code. Help us make decisions, finalize content, map
imagery, and catch anything that does not feel like Shannon.

## The latest direction

The newest visual brief supersedes the previous public-site styling:

> Each page is a room in Shannon’s house. The site should be felt, not merely
> read.

The public rooms are:

| Route          | Room          | Feeling                        |
| -------------- | ------------- | ------------------------------ |
| `/`            | Living Room   | Warm, welcoming, first breath  |
| `/about`       | Kitchen       | Intimate, vulnerable, lived-in |
| `/beauty`      | Bathroom      | Cleansing, reflective, soft    |
| `/yoga`        | Studio        | Grounded, spacious, in motion  |
| `/tarot`       | Altar Room    | Mystical, quiet, reverent      |
| `/retreats`    | Sunroom       | Expansive, airy, horizon-led   |
| `/beauty/lift` | Dressing Room | Private, focused, ritualistic  |
| `/journal`     | Library       | Thoughtful, warm, ordered      |
| `/store`       | Gift Shop     | Tactile, simple, inviting      |
| `/the-den`     | Sanctuary     | Sacred, safe, private          |

The visual rules are:

- Sacred whitespace.
- Less copy; every sentence must earn its place.
- Images behave like windows, not decoration.
- Slow fades, soft drift, and breath-like parallax.
- Organic grain, paper, water, glass, fabric, and candlelight textures.
- No autoplay audio.
- No flashy motion.
- Mobile must feel equally spacious.
- Accessibility and performance remain non-negotiable.

## Important: preserve what already works

This is a **visual and content evolution**, not a backend reset.

Do not recommend replacing or removing the systems already built:

- Next.js 16 / React 19 / Tailwind v4 application.
- Supabase authentication, database, RLS, and entitlements.
- Stripe Checkout, subscription, portal, and webhook architecture.
- Mux signed in-browser video.
- Private PDF delivery.
- The Den, library, courses, lessons, progress, and account.
- Whole Body OS admin.
- Connection Hub, private conversations, Journeys, preferences, pacing, and
  relationship-health alerts.

The final operating philosophy remains relationship-first:

- Every invitation is contextual and consent-based.
- Members choose when and how to continue.
- Promotions remain inside the relevant room or resource.
- Quiet is treated as a valid form of participation.
- When a member signals pain, struggle, help, urgency, or emergency, scheduled
  messages pause so a person can respond with care.
- Journeys are consent-based and human-paced.
- The goal is trust, replies, care, continuity, and invitations that fit the
  relationship.

## What Codex has already built

### Public platform

- Exact Beauty · Yoga · Tarot navigation.
- Responsive desktop and mobile header.
- Permanent legacy-route redirects.
- Rebuilt Home, About, Beauty, Yoga, Tarot, Retreats, LIFT, Store, Journal,
  Book, Contact, Privacy, and Terms routes.
- Branded footer.
- Responsive section navigation, parallax, reveals, pull quotes, dividers,
  counters, page transitions, breadcrumbs, loading, errors, and 404.
- Canonicals, JSON-LD, robots, sitemap, and branded Open Graph art.
- Accessibility foundation: skip link, focus states, reduced motion, improved
  contrast, semantic page structure.

### Imagery

Eleven lightweight WebP images are currently curated into the code:

- Shannon standing in a neutral movement pose.
- Shannon smiling beside a studio window.
- Warm portrait of Shannon.
- Outdoor/destination portrait.
- Blush peony.
- Boat-pose movement image.
- Seated eagle/restorative movement image.
- Seated side stretch.
- Wolf and moon.
- Moon over dark forest.
- Dried botanicals.

The entire optimized image library is approximately 548 KB.

Additional original images supplied by Celeste include more neutral movement
poses, close body/skin detail, black activewear portraits, and moon/nature
imagery. Codex can process more of them once the final room-to-image map is
approved.

### Products and member access

- LIFT PDF — **$3.33** one-time.
- LIFT Video + PDF — **$5.55** one-time and the featured starting product.
- The Den — **$11.11/month**.
- Ownership-aware Store states.
- Authenticated paid access.
- Protected Mux lessons.
- Protected PDF.
- Stripe webhook entitlement sync.

### Whole Body OS and Connection Engine

- Spa-like admin shell and operating previews.
- Members, bookings, revenue, courses, content, store, calendar, and settings.
- Relationship command center.
- Journey composer, templates, and trust-based insights.
- Private member Connection Hub.
- Member replies and read state.
- Practitioner-only replies.
- In-chat booking CTA generator.
- Connection Preferences.
- Max seven journey milestones.
- The first three messages remain devoted to care.
- Max two active journeys per member.
- A quiet day after a journey.
- Individual and global pause.
- Nightly human-support alerts.

## Honest current state

- The work is local and has not yet been committed, pushed, or deployed from
  this working tree.
- The latest somatic visual redesign is now being implemented.
- Most admin areas are high-fidelity read-only operational previews; they are
  not all production CRUD screens yet.
- Real Supabase migrations still need to be applied to a test/production
  project.
- Real course lessons and Mux playback IDs need to be seeded.
- Stripe, Mux, Resend, Cal.com, and cron still need final production
  configuration and end-to-end testing.
- Missing/unverified configuration currently includes:
  - Stripe PDF price ID.
  - Mux signing key ID.
  - Cal.com public URL.
  - Cron secret.
- Final full lint, typecheck, production build, responsive QA, accessibility
  QA, and Lighthouse testing will happen after the somatic pages settle.

## What I need from you, Lumo

Please respond with **one organized decision packet**, not another broad website
concept.

### 1. Final copy, room by room

For each room, give:

- Final eyebrow, H1, and one-line subtitle.
- No more than 120 words of essential body copy.
- One primary CTA and one optional secondary CTA.
- One pull quote that sounds like Shannon.
- What existing copy should be cut.

Keep the voice warm, intimate, wise, unforced, and specific. Avoid generic
wellness phrases, hype, scarcity, “transformation” clichés, or promises that
sound medical.

### 2. Image and video map

Use the current image inventory above and tell us:

- Which exact image belongs in each room.
- Which images should not be used.
- Which additional original image type we should process.
- The smallest missing photo/video shot list.

For missing motion, specify:

- Page.
- Shot.
- Orientation.
- Ideal duration.
- Whether it can be a silent loop.
- Safe crop area for mobile.

Examples we already know may be missing:

- Beauty water/skin close-up.
- Yoga slow movement loop.
- Tarot candle/altar loop.
- Retreat horizon landscape.
- LIFT hands preparing oil.
- Journal/library/paper atmosphere.
- Store tactile product still life.
- Den fabric/velvet sanctuary texture.

### 3. Real service catalog

Give a clean table with:

- Pillar.
- Exact service name.
- One-line description.
- Duration.
- Price or “starting at.”
- Virtual/in-person/group availability.
- “Best for” label.
- Booking destination.

We need final truth for:

- 1:1 sessions.
- Life coaching.
- Consultation.
- Private sound bath.
- Private yoga.
- Private consultation.
- Group consultation.
- Beauty/facial/lymphatic offerings.
- Tarot, astrology, and ritual.
- Retreat partnership formats.

Do not invent prices. Mark anything Celeste/Shannon must confirm.

### 4. Shannon facts that need confirmation

Return a short questionnaire for:

- Exact professional bio.
- Credential names, schools, and years.
- Years of experience.
- Preferred public location language.
- Correct business email and Instagram handle.
- Any medical/aesthetic licensure language that is legally safe to publish.
- The real origin story behind Ice Rink → Beauty → Body → Being.
- Pronunciation or capitalization preferences.

### 5. Product and member content

Provide:

- Final 7 LIFT movement names.
- One-sentence instruction for each.
- One safe common-mistake note for preview steps 1–2.
- Seven physical benefits written without medical overclaiming.
- “Beyond Skin Deep” paragraph.
- Shannon’s LIFT welcome note and sign-off.
- The Den welcome note.
- Initial course list under Beauty, Yoga, and Tarot.
- Suggested lesson titles only; do not write fake credentials or results.

### 6. Journal starter set

Give nine article briefs:

- At least two per Beauty, Yoga, Tarot, and Retreat Living.
- Title.
- 1-sentence thesis.
- 3-part outline.
- Suggested current image.
- Whether Shannon needs to provide a personal story.

These remain drafts until Shannon approves them.

### 7. Trust and safety language

Review and improve:

- Connection Hub response-time promise.
- “Not monitored continuously / not emergency support” message.
- Facial/yoga/tarot/astrology disclaimers.
- Digital product refund wording.
- Retreat scope and host-responsibility wording.
- Privacy language around private notes, progress, and support alerts.

Do not offer legal advice; flag what requires a lawyer.

## Format your response like this

1. **Top 10 decisions Celeste should answer first**
2. **Room-by-room final copy table**
3. **Image/video assignment table**
4. **Service catalog with confirmation flags**
5. **LIFT + Den content packet**
6. **Journal starter briefs**
7. **Safety/legal review list**
8. **Anything that feels off-brand or overloaded**

Be decisive. Preserve the working platform. Help us remove noise and make every
room feel unmistakably like Shannon.
