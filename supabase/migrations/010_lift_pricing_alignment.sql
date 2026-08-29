-- Align the canonical LIFT editorial copy with the owner-confirmed prices from
-- August 28, 2026. This is intentionally additive because migration 007 is
-- already recorded in the hosted ledger.

begin;

update public.content_sections
set body = 'LIFT Guide · $11.11 one time. Complete video + guide · $33.33.'
where entry_id = '71000000-0000-4000-8000-000000000001'
  and section_key = 'primary-feature'
  and body = 'Guided video + downloadable PDF · $11.11 one time.';

update public.featured_slots
set description = 'LIFT Guide · $11.11 one time. Complete video + guide · $33.33.'
where feature_key = 'lift-daily-ritual'
  and slot_key = 'homepage.primary-feature'
  and description = 'Guided video + downloadable PDF · $11.11 one time.';

commit;
