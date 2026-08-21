-- Align the seeded LIFT curriculum with Shannon's final approved PDF copy.
-- This additive migration preserves the published migration history while
-- safely updating fresh or previously migrated projects by lesson order.

update public.lessons as lesson
set
  title = approved.title,
  slug = approved.slug,
  description = approved.description,
  duration_seconds = approved.duration_seconds
from (
  values
    (
      1,
      'Prep the Skin',
      'prep-the-skin',
      $lift$Apply your serum, moisturizer, facial oil, lightweight oil, or another product that provides enough slip. Using broad sweeping strokes, distribute your product over the jaw, cheeks, forehead, and neck. Take a slow breath and let your touch become intentional before moving into the massage.

Supports: Smooth glide, even product application, and a mindful starting point.$lift$,
      90
    ),
    (
      2,
      'Jawline Lift',
      'jawline-lift',
      $lift$Starting at the chin, glide your knuckles or fingers along the jawline using gentle, upward sweeping motions toward the ear. Make 3 to 6 passes on each side, applying gentle yet firm pressure. Finish with small circular motions where the upper and lower jaw meet to release tension often held in the jaw.

Supports: Jawline definition, tension release, and lymphatic flow.$lift$,
      120
    ),
    (
      3,
      'Mid-Face Sculpt',
      'mid-face-sculpt',
      $lift$Starting beside the nose, gently scoop the cheek upward to find the natural contour beneath the cheekbone and at the orbital bone (under eye). Glide along the cheekbone toward the temple while your opposite hand traces behind to support the tissue. Repeat 3–6 passes on each side. Think of lifting up and out rather than pressing into the skin. If the scissor technique feels more natural, feel free to use that variation (see video).

Supports: Mid-face volume, cheek definition, circulation, and a naturally lifted appearance.$lift$,
      120
    ),
    (
      4,
      'Brow Lift',
      'brow-lift',
      $lift$Diagonal crosshatch — starting at the inner brow, place your fingers just beneath the brow bone and glide diagonally upward toward the opposite hairline. Repeat 3–6 passes. Full brow lift: work in sections along the brow — inner, middle, and outer — using upward strokes toward the hairline. Repeat 3–6 passes in each area.

Supports: A naturally lifted appearance through the eyes, improved circulation, and softer tension through the brow and forehead.$lift$,
      90
    ),
    (
      5,
      'Forehead Release',
      'forehead-release',
      $lift$Using alternating hands, glide upward across the forehead in sections — working from the brows toward the hairline. Next, create a gentle crosshatch pattern across the forehead. Pause over the "11s" and any areas of tension or expression lines, using small circular motions with gentle, sustained pressure before continuing. Repeat 3–6 passes in each area.

Supports: Relaxation through the forehead, healthy circulation, and the appearance of smoother skin.$lift$,
      90
    ),
    (
      6,
      'Lymphatic Sweep',
      'lymphatic-sweep',
      $lift$Starting at the center of the forehead near the hairline, glide your fingers along the outer edges of the face toward the ears. Finish by gently sweeping behind the ears. Repeat 3 times.

Supports: Lymphatic drainage, reduced puffiness, and healthy fluid movement.$lift$,
      120
    ),
    (
      7,
      'Neck Release',
      'neck-release',
      $lift$Place your hands at the center of the neck with your fingers extended and thumbs forming an "L." Glide one hand upward while the other glides downward, creating a continuous, flowing movement. Repeat 3 times.

Supports: Healthy lymphatic flow, improved circulation, and renewed vitality through the neck and jawline.$lift$,
      120
    )
) as approved(order_index, title, slug, description, duration_seconds)
where lesson.course_id = '5aa34592-e286-41a2-a94d-7f2479f7e0a1'
  and lesson.order_index = approved.order_index;
