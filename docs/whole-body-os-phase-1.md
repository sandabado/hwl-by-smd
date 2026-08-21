# Whole Body OS - Phase 1 Foundation

> NOTE: This document references route names that have since been updated. /body is now /yoga. /being and /tarot are now /astrology. The architecture and design decisions described herein remain valid.

HWL by SMD is the flagship implementation and visual reference for the future
Whole Body OS platform. Phase 1 intentionally completes the public brand and
content experience before authentication, protected media, scheduling, and
commerce are introduced.

## Reusable Page Structure

Public experience pages use a shared composition:

1. `InteriorHero` for the editorial opening.
2. `PageSection` for consistent responsive spacing and reveal behavior.
3. `SectionHeading` for eyebrow, title, and supporting copy.
4. `OfferingCard` for products and services.
5. `BenefitGrid` and `AudienceGrid` for outcomes and fit.
6. `ProcessGrid` for arrival-to-integration journeys.
7. `InvestmentTable` for transparent pricing.
8. `TestimonialQuote` for social proof.
9. `FaqAccordion` for common questions.
10. `RelatedJournal` and `CtaBlock` for continued exploration.

These components are content-agnostic and can be reused for another wellness
brand without changing their internal layout.

## Current Brand Boundaries

- Brand contact and navigation content lives in `lib/constants.ts`.
- Curated media paths and accessible descriptions live in `lib/media.ts`.
- Global color and typography tokens live in `app/globals.css`.
- Cormorant Garamond and Inter are loaded once in `app/layout.tsx`.
- Page-specific offerings, benefits, FAQs, testimonials, and editorial content
  remain close to their routes during Phase 1.

## Phase 2 Extraction Targets

Before onboarding a second brand:

- Move brand identity, contact details, navigation, social links, theme tokens,
  and feature flags into a validated client configuration.
- Move service catalogs and pricing into structured tenant content.
- Add tenant-aware media and metadata helpers.
- Separate public brand components from authenticated member components.
- Add a tenant identifier to every persistent commerce and member record.

## Commerce and Member Phase

The next phase will add:

- Stripe products, subscriptions, Checkout, billing portal, and webhooks.
- Public customer authentication.
- Server-verified purchase and subscription entitlements.
- Protected video streaming and signed PDF access.
- Course, lesson, and progress records.
- Scheduling, intake, and private member communication.
- A spa-like member environment called The Den unless renamed.

No client-side flag or public file path should be treated as authorization.
Protected access must always be confirmed by the server.

## Forms

Public forms post to `/api/contact`. Production delivery uses Resend and the
values documented in `.env.example`. Until those values are present, the UI
provides an honest service-unavailable message and directs guests to contact
Shannon directly.
