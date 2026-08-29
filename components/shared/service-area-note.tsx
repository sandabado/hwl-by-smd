import Link from "next/link"

const serviceAreas = [
  { label: "Palm Springs", href: "/palm-springs" },
  { label: "Joshua Tree", href: "/joshua-tree" },
  { label: "Yucca Valley", href: "/yucca-valley" },
  { label: "Desert Hot Springs", href: "/desert-hot-springs" },
] as const

export function ServiceAreaNote() {
  return (
    <section
      aria-labelledby="service-area-heading"
      className="border-t border-[var(--border)] bg-[var(--sanctuary-mist)]/55 px-6 py-12 text-center"
    >
      <h2
        className="text-xs font-medium tracking-[0.26em] text-[var(--accent)] uppercase"
        id="service-area-heading"
      >
        Desert service area
      </h2>
      <p className="mx-auto mt-4 max-w-3xl text-base leading-relaxed text-[var(--primary)]">
        Based in Palm Springs. Serving Palm Desert, Joshua Tree, Yucca Valley,
        Desert Hot Springs, Morongo Valley, and surrounding desert communities.
      </p>
      <nav
        aria-label="Explore service areas"
        className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2"
      >
        {serviceAreas.map((area) => (
          <Link
            className="text-sm text-[var(--muted-foreground)] underline-offset-4 hover:text-[var(--accent)] hover:underline"
            href={area.href}
            key={area.href}
          >
            {area.label}
          </Link>
        ))}
      </nav>
    </section>
  )
}
