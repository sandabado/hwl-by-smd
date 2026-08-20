import Link from "next/link"
import { ArrowRight, MapPin } from "lucide-react"

import { OsmMap } from "@/components/map/osm-map"
import { JsonLd } from "@/components/seo/json-ld"
import { BreathingSection } from "@/components/shared/breathing-section"
import { BreathingText } from "@/components/shared/breathing-text"
import { Reveal } from "@/components/shared/reveal"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { LocationPageData } from "@/lib/location-pages"
import { absoluteUrl, SITE_URL, type JsonLdNode } from "@/lib/seo"

function createLocationServiceJsonLd(data: LocationPageData): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${absoluteUrl(data.path)}#service-area`,
    name: `HWL by SMD wellness services in ${data.city}`,
    description: data.introParagraphs[0],
    url: absoluteUrl(data.path),
    serviceType:
      "Facial rituals, private yoga, sound baths, tarot readings, and retreat wellness programming",
    areaServed: {
      "@type": "Place",
      name: data.city,
      containedInPlace: {
        "@type": "State",
        name: "California",
      },
    },
    provider: { "@id": `${SITE_URL}/#organization` },
  }
}

export function LocationLandingPage({ data }: { data: LocationPageData }) {
  return (
    <>
      <JsonLd
        data={createLocationServiceJsonLd(data)}
        id={`${data.city.toLowerCase().replaceAll(" ", "-")}-service-schema`}
      />

      <BreathingSection
        background="gradient"
        className="flex min-h-[78svh] items-center"
        contentClassName="mx-auto w-full max-w-5xl px-6 text-center"
        padding="expansive"
        reveal={false}
        variant="sunroom"
      >
        <Reveal>
          <p className="text-xs font-medium tracking-[0.28em] text-[var(--accent)] uppercase">
            Desert service area · {data.city}
          </p>
          <BreathingText
            as="h1"
            className="mx-auto mt-6 max-w-4xl font-medium text-[var(--primary)]"
            size="hero"
          >
            {data.heroTitle}
          </BreathingText>
          <div className="mx-auto mt-8 max-w-3xl space-y-5 text-base leading-[1.9] text-[var(--muted-foreground)] md:text-lg">
            {data.introParagraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              asChild
              className="min-h-12 rounded-full bg-[var(--primary)] px-7 text-white hover:bg-[var(--accent)]"
            >
              <Link href="/book">
                Begin a conversation <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Button
              asChild
              className="min-h-12 rounded-full border-[var(--border)] bg-white/50 px-7"
              variant="outline"
            >
              <Link href="#services">Explore services</Link>
            </Button>
          </div>
        </Reveal>
      </BreathingSection>

      <BreathingSection
        background="warm"
        contentClassName="mx-auto max-w-7xl px-6"
        id="services"
        variant="living-room"
      >
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-medium tracking-[0.26em] text-[var(--accent)] uppercase">
            Ways to work with Shannon
          </p>
          <h2 className="mt-5 text-4xl leading-tight font-medium text-[var(--primary)] md:text-5xl">
            Care shaped around the person and the place.
          </h2>
        </div>
        <div className="mt-14 grid gap-5 md:grid-cols-2">
          {data.services.map((service, index) => (
            <Reveal delay={(index % 2) * 80} key={service.title}>
              <Card className="h-full rounded-[1.75rem] border-[var(--border)] bg-white/55 p-7 shadow-none">
                <h3 className="text-3xl font-medium text-[var(--primary)]">
                  {service.title}
                </h3>
                <p className="mt-4 flex-1 text-sm leading-[1.85] text-[var(--muted-foreground)]">
                  {service.description}
                </p>
                <Link
                  className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-[var(--accent)] underline-offset-4 hover:underline"
                  href={service.href}
                >
                  {service.title === "Book"
                    ? "Request a session"
                    : `Explore ${service.title}`}
                  <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
              </Card>
            </Reveal>
          ))}
        </div>
      </BreathingSection>

      <BreathingSection
        background="cool"
        contentClassName="mx-auto grid max-w-7xl items-center gap-14 px-6 lg:grid-cols-[0.82fr_1.18fr]"
        variant="studio"
      >
        <div>
          <div className="flex items-center gap-2 text-xs font-medium tracking-[0.24em] text-[var(--accent)] uppercase">
            <MapPin aria-hidden="true" className="size-4" />
            {data.city}, California
          </div>
          <h2 className="mt-5 text-4xl leading-tight font-medium text-[var(--primary)] md:text-5xl">
            {data.placeHeading}
          </h2>
          <div className="mt-7 space-y-5 text-base leading-[1.9] text-[var(--muted-foreground)]">
            {data.placeParagraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <p className="mt-7 text-xs leading-relaxed text-[var(--muted-foreground)]">
            The map shows the general service area, not a public studio address.
            Session location and format are confirmed during booking.
          </p>
        </div>
        <OsmMap
          label={data.city}
          latitude={data.map.lat}
          longitude={data.map.lng}
          radiusMeters={data.map.radius}
          zoom={data.map.zoom}
        />
      </BreathingSection>

      <BreathingSection
        background="dark"
        contentClassName="mx-auto max-w-4xl px-6 text-center"
        variant="sanctuary"
      >
        <p className="text-xs font-medium tracking-[0.28em] text-[var(--accent-on-dark)] uppercase">
          A quieter way to begin
        </p>
        <h2 className="mt-5 text-4xl font-medium text-[var(--background)] md:text-5xl">
          {data.closing.heading}
        </h2>
        <p className="mx-auto mt-7 max-w-2xl text-base leading-[1.9] text-[var(--background)]/78">
          {data.closing.body}
        </p>
        <Button
          asChild
          className="mt-9 min-h-12 rounded-full bg-[var(--accent-on-dark)] px-7 text-[var(--sanctuary-ink)] hover:bg-white"
        >
          <Link href="/book">
            Book with Shannon <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </BreathingSection>
    </>
  )
}
