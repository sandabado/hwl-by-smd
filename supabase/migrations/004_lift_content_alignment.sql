-- Align existing LIFT course records with Shannon's approved seven-movement sequence.

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
      'Apply a product with enough slip. Use broad sweeping strokes over the jaw, cheeks, forehead, and neck. Take one slow breath and let your touch become intentional.',
      90
    ),
    (
      2,
      'Jawline Lift',
      'jawline-lift',
      'Starting at the chin, glide your knuckles or fingers along the jawline toward the ear with gentle upward sweeps. Make 3 to 6 passes on each side, then use small circles where the jaw meets to release tension.',
      120
    ),
    (
      3,
      'Mid-Face Sculpt',
      'mid-face-sculpt',
      'Starting beside the nose, gently scoop the cheek upward and glide along the cheekbone toward the temple. Repeat 3 to 6 passes on each side, thinking lift up and out rather than pressing in.',
      120
    ),
    (
      4,
      'Brow Lift',
      'brow-lift',
      'Begin beneath the inner brow and glide diagonally toward the opposite hairline. Then work the inner, middle, and outer brow in sections with upward strokes, repeating 3 to 6 passes.',
      90
    ),
    (
      5,
      'Forehead Release',
      'forehead-release',
      'Alternate hands as you glide from the brows toward the hairline, then create a gentle crosshatch pattern. Pause over areas of tension with small circles and gentle sustained pressure.',
      90
    ),
    (
      6,
      'Lymphatic Sweep',
      'lymphatic-sweep',
      'Starting at the center of the forehead near the hairline, glide along the outer edges of the face toward the ears. Finish by gently sweeping behind the ears. Repeat 3 times.',
      120
    ),
    (
      7,
      'Neck Drainage',
      'neck-drainage',
      'Working down from the ears, glide along the sides and front of the neck with gentle downward strokes toward the collarbones. Repeat 3 to 5 times to complete the lymphatic pathway.',
      120
    )
) as approved(order_index, title, slug, description, duration_seconds)
where lesson.course_id = '5aa34592-e286-41a2-a94d-7f2479f7e0a1'
  and lesson.order_index = approved.order_index;
