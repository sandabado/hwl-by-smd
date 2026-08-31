# Paste This Into Lumo AI

> NOTE: This document references route names that have since been updated. /body is now /yoga. /being and /tarot are now /astrology. The architecture and design decisions described herein remain valid.

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
| `/astrology`   | Altar Room    | Mystical, quiet, reverent      |
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
- Entitlement-checked private video delivery for launch, with the existing Mux
  signed-playback architecture preserved for a future streaming phase.
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

- Exact Beauty · Yoga + Sound · Astrology navigation.
- Responsive desktop and mobile header.
- Permanent legacy-route redirects.
- Rebuilt Home, About, Beauty, Yoga + Sound, Astrology, Retreats, LIFT, Store, Journal,
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

- LIFT — **$11.11** one-time, including the complete guided video and
  downloadable PDF in one purchase.
- No PDF-only product is offered.
- The Den membership is deferred and has no checkout yet.
- Ownership-aware Store states.
- Authenticated paid access.
- Protected lessons; Complete LIFT uses the local private-video launch path and
  Mux remains the future streaming architecture.
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
- Initial course list under Beauty, Yoga, and Astrology.
- Suggested lesson titles only; do not write fake credentials or results.

### 6. Journal starter set

Give nine article briefs:

- At least two per Beauty, Yoga, Astrology, and Retreat Living.
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

## Appendix D — LIFT launch delivery boundary

- The supplied master is
  `/Users/cougarceleste/Downloads/FACIAL LIFT VIDEO FINAL HIGH RES.mov`:
  3,310,422,032 bytes; 3:54.526; 1920×1080 at 23.976p; Apple ProRes 422 with
  48 kHz stereo LPCM audio; SHA-256
  `2e1a37fe5de424b26ac600fa03701b7c6137bfc01ef057b250f461ac60de2039`.
- Treat that file as an archival master, not a browser-delivery asset. The
  existing public preview is a separate 10-second, 480×272 H.264/AAC file and
  must not be delivered as the paid Complete LIFT video.
- The local launch design keeps an approved web MP4 private in Supabase
  `member-content` at the environment-owned `LIFT_VIDEO_STORAGE_PATH`.
  `/api/video/lift` checks authentication and LIFT entitlement before issuing
  a 3,600-second signed redirect to a native HTML5 player. An optional private
  VTT captions file can use `LIFT_VIDEO_CAPTIONS_STORAGE_PATH` and the matching
  entitlement-checked captions route. Launch checkout requires the PDF and
  video; English captions remain a Phase 2 enhancement.
- Keep the future signed Mux architecture intact. Do not activate Complete
  LIFT until the transcode, private upload, provider configuration, public
  denial, entitled playback, seeking, expiry, checkout, webhook entitlement,
  and refund-revocation paths have been verified end to end.
- No transcode, hosted upload, provider mutation, deployment, or paid-flow E2E
  is authorized or claimed by this handoff.

## Appendix E — Personal-use and IP language

- Use the brand names **HWL by SMD** and **LIFT** consistently. A `™` symbol may
  communicate a claimed mark; it must not be described as a registration or as
  proof of ownership.
- LIFT digital purchases should grant one purchaser a limited,
  non-transferable license for personal use. The purchaser may access the
  included guide and video and make reasonable personal or accessibility
  copies. They may not share, publish, publicly upload, resell, redistribute,
  record, or use the materials to provide a commercial class or service
  without written permission.
- Ownership language must be qualified: original content owned by Shannon Mary
  Dixon is protected, while photographs, licensed media, and other third-party
  materials remain the property of their respective owners and are used under
  license, permission, or applicable law.
- Keep member reminders warm and brief: the practice was created by Shannon for
  the purchaser’s personal use; please do not copy, record, share, or
  redistribute it. Avoid threatening enforcement copy.
- Final Terms, refund language, trademark usage, and rights-clearance claims
  require professional legal review before public commerce launch.
