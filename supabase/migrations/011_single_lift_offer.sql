-- Supersede the split LIFT pricing introduced by migration 010. LIFT launches
-- as one $11.11 purchase containing both the guided video and downloadable PDF.
-- The narrow value guards preserve any later editorial changes.

begin;

update public.content_sections
set body = 'Guided video + downloadable PDF · $11.11 one time.'
where entry_id = '71000000-0000-4000-8000-000000000001'
  and section_key = 'primary-feature'
  and body in (
    'Guided video + downloadable PDF · $11.11 one time.',
    'LIFT Guide · $11.11 one time. Complete video + guide · $33.33.'
  );

update public.featured_slots
set description = 'Guided video + downloadable PDF · $11.11 one time.'
where feature_key = 'lift-daily-ritual'
  and slot_key = 'homepage.primary-feature'
  and description in (
    'Guided video + downloadable PDF · $11.11 one time.',
    'LIFT Guide · $11.11 one time. Complete video + guide · $33.33.'
  );

commit;
