import Image from "next/image"

import { DoorCard } from "@/components/home/door-card"
import { HeroFilm } from "@/components/home/hero-film"
import { SITE_CONFIG } from "@/lib/constants"
import { media } from "@/lib/media"
import type { PublishedHomepageFeature } from "@/lib/site-content"

const supportingDoors = [
  {
    invitation: "Private sessions with Shannon.",
    truth: "Facials, yoga, sound, and tarot · private sessions from $222.",
    href: "/book",
  },
  {
    invitation: "A member's library and private line.",
    truth:
      "A growing library, LIFT, and private member messages · $11.11/month.",
    href: "/store#the-den",
  },
  {
    invitation: "Seasonal ceremonies and group experiences.",
    truth: "Seasonal workshops from $555 · private retreat days from $1,555.",
    href: "/retreats",
  },
] as const

export function HeroEntry({
  featuredExperience,
}: {
  featuredExperience: PublishedHomepageFeature
}) {
  return (
    <section
      aria-labelledby="home-entry-heading"
      className="home-root relative isolate h-[100svh] w-full overflow-hidden bg-[#1a1410]"
      data-home-landing=""
    >
      <div aria-hidden="true" className="home-doors-backdrop fixed inset-0">
        <Image
          alt=""
          className="home-doors-backdrop__image object-cover"
          fill
          preload
          quality={88}
          sizes="100vw"
          src={media.brand.windowPortrait.src}
        />
      </div>
      <HeroFilm source={media.motion.desertHero.src} />
      <div
        aria-hidden="true"
        className="home-doors-scrim fixed inset-0 z-[1]"
      />

      <div className="home-doors-layout relative z-10 mx-auto flex h-full w-full max-w-[1440px] flex-col items-center px-6 text-center">
        <header className="home-doors-introduction">
          <p className="home-doors-eyebrow">HWL BY SMD</p>
          <h1 className="home-doors-title" id="home-entry-heading">
            Come back to your whole body.
          </h1>
          <p className="home-doors-subtitle">Beauty · Movement · Ritual</p>
        </header>

        <nav aria-label="Choose your way in" className="home-doors-grid">
          <DoorCard
            href={featuredExperience.ctaHref}
            invitation={featuredExperience.headline}
            truth={featuredExperience.description}
          />
          {supportingDoors.map((door) => (
            <DoorCard {...door} key={door.href} />
          ))}
        </nav>
      </div>

      <footer className="home-doors-footer">
        <address className="not-italic">
          <span>Palm Springs, CA</span>
          <span aria-hidden="true"> · </span>
          <a href={`mailto:${SITE_CONFIG.email}`}>{SITE_CONFIG.email}</a>
          <span aria-hidden="true"> · </span>
          <a href={`tel:${SITE_CONFIG.phone.replace(/\D/g, "")}`}>
            {SITE_CONFIG.phone}
          </a>
        </address>
      </footer>
    </section>
  )
}
