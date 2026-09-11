import Image from "next/image"
import Link from "next/link"
import { ArrowRight, CalendarDays, Clock3, MapPin, Play } from "lucide-react"

import { SelectBookingButton } from "@/components/booking/select-booking-button"
import { AddToCartButton } from "@/components/cart/add-to-cart-button"
import {
  getBookingPillar,
  getBookingServiceAction,
  type BookingPillarId,
} from "@/lib/booking-services"
import { media } from "@/lib/media"
import { LIFT_STOREFRONT_PRODUCT } from "@/lib/storefront-product"
import { isProductCheckoutReady } from "@/lib/stripe"
import { cn } from "@/lib/utils"

const presentationByPillar = {
  beauty: {
    accentClass: "text-[var(--accent)]",
    actionClass: "bg-[var(--primary)] text-white hover:bg-[var(--accent)]",
    cardClass:
      "border-[#d8c8b9]/72 bg-white/72 shadow-[0_18px_55px_rgba(112,84,77,0.08)] hover:border-[var(--accent)]/35 hover:shadow-[0_24px_70px_rgba(112,84,77,0.13)]",
    description:
      "Compare every facial ritual at a glance, or bring Shannon’s daily LIFT practice home today. Prices, timing, and the next step are always visible.",
    categoryLabel: "Beauty",
    eyebrow: "Beauty shop + sessions",
    image: media.editorial.beautyOfferings,
    imageLabel: "The beauty shelf",
    sectionClass:
      "bg-[linear-gradient(180deg,#f6ede6_0%,#faf7f2_48%,#f1ece5_100%)]",
    title: "Choose the care that meets the moment.",
  },
  movement: {
    accentClass: "text-[#68735f]",
    actionClass: "bg-[var(--primary)] text-white hover:bg-[#68735f]",
    cardClass:
      "border-[#839078]/20 bg-white/72 shadow-[0_18px_55px_rgba(67,79,61,0.08)] hover:border-[#68735f]/40 hover:shadow-[0_24px_70px_rgba(67,79,61,0.13)]",
    description:
      "Compare private movement and sound sessions without losing the thread. Each choice opens its own live calendar with the session already selected.",
    categoryLabel: "Body",
    eyebrow: "Body sessions",
    image: media.editorial.bodyOfferings,
    imageLabel: "The studio shelf",
    sectionClass:
      "bg-[linear-gradient(180deg,#e9ece4_0%,#f7f4ed_52%,#ecebe4_100%)]",
    title: "Choose the practice your body needs.",
  },
  ritual: {
    accentClass: "text-[#dcc5a5]",
    actionClass: "bg-[#dcc5a5] text-[#211c22] hover:bg-white",
    cardClass:
      "border-white/12 bg-white/[0.065] text-white shadow-[0_18px_55px_rgba(8,5,10,0.24)] hover:border-[#dcc5a5]/38 hover:bg-white/[0.09] hover:shadow-[0_24px_70px_rgba(8,5,10,0.34)]",
    description:
      "Tarot, astrology, and Reiki with timing, format, and investment visible before you choose.",
    categoryLabel: "Being",
    eyebrow: "Being",
    image: media.editorial.beingOfferings,
    imageLabel: "The ritual table",
    sectionClass:
      "bg-[radial-gradient(circle_at_80%_12%,rgba(122,78,111,0.25),transparent_32%),linear-gradient(180deg,#241e26_0%,#302631_100%)] text-white",
    title: "Choose what meets this season.",
  },
} as const

function LiftSpotlight({ checkoutReady }: { checkoutReady: boolean }) {
  return (
    <article className="mt-10 grid overflow-hidden rounded-[2rem] border border-white/65 bg-[var(--primary)] text-white shadow-[0_26px_75px_rgba(63,48,39,0.18)] sm:grid-cols-[11rem_1fr] lg:grid-cols-[15rem_1fr_auto]">
      <div className="relative min-h-52 sm:min-h-full">
        <Image
          alt="Shannon demonstrating a LIFT facial massage movement"
          className="object-cover"
          fill
          sizes="(max-width: 639px) 100vw, 240px"
          src={media.editorial.liftVideoPreview.src}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-[var(--primary)]/45 via-transparent to-transparent"
        />
        <span className="absolute bottom-4 left-4 grid size-10 place-items-center rounded-full border border-white/30 bg-white/14 backdrop-blur-sm">
          <Play aria-hidden="true" className="ml-0.5 size-4 fill-current" />
        </span>
      </div>

      <div className="p-6 sm:p-7 lg:p-8">
        <p className="text-[11px] font-medium tracking-[0.22em] text-[var(--accent-on-dark)] uppercase">
          {checkoutReady
            ? "Available now · Digital ritual"
            : "Digital ritual · Save to cart"}
        </p>
        <h3 className="mt-3 text-3xl leading-tight font-medium text-white md:text-4xl">
          {LIFT_STOREFRONT_PRODUCT.name}
        </h3>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/76">
          Shannon’s complete guided facial massage video and downloadable PDF.
          Learn all seven movements, then return whenever your skin needs care.
        </p>
        <Link
          className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-[var(--accent-on-dark)] underline-offset-4 hover:underline"
          href="/beauty/lift"
        >
          See what is included
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </div>

      <div className="flex flex-col justify-center border-t border-white/12 p-6 sm:col-span-2 sm:p-7 lg:col-span-1 lg:min-w-64 lg:border-t-0 lg:border-l lg:p-8">
        <p className="font-serif text-4xl text-white">
          {LIFT_STOREFRONT_PRODUCT.price}
        </p>
        <p className="mt-1 text-xs tracking-[0.16em] text-white/62 uppercase">
          One-time purchase
        </p>
        <AddToCartButton
          className="mt-5 bg-[var(--background)] text-[var(--primary)] hover:bg-[var(--accent)] hover:text-white"
          label={`Add LIFT to cart · ${LIFT_STOREFRONT_PRODUCT.price}`}
        />
        <p className="mt-3 text-center text-[11px] leading-5 text-white/55">
          {checkoutReady
            ? "Secure Stripe checkout · Account-based access"
            : "Checkout opens after final delivery verification"}
        </p>
      </div>
    </article>
  )
}

export function ServiceOfferingsSection({
  pillarId,
}: {
  pillarId: BookingPillarId
}) {
  const pillar = getBookingPillar(pillarId)
  const presentation = presentationByPillar[pillarId]
  const isDark = pillarId === "ritual"

  return (
    <section
      aria-labelledby={`${pillarId}-offerings-heading`}
      className={cn(
        "relative overflow-hidden px-6 py-20 md:py-28",
        presentation.sectionClass
      )}
      id="offerings"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid items-end gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(26rem,1.15fr)] lg:gap-16">
          <div className="max-w-2xl">
            <p
              className={cn(
                "text-xs font-medium tracking-[0.28em] uppercase",
                presentation.accentClass
              )}
            >
              {presentation.eyebrow}
            </p>
            <h2
              className={cn(
                "mt-5 text-4xl leading-[1.05] font-medium md:text-6xl",
                isDark ? "text-white" : "text-[var(--primary)]"
              )}
              id={`${pillarId}-offerings-heading`}
            >
              {presentation.title}
            </h2>
            <p
              className={cn(
                "mt-6 text-base leading-8 md:text-lg",
                isDark ? "text-white/66" : "text-[var(--muted-foreground)]"
              )}
            >
              {presentation.description}
            </p>
          </div>

          <figure className="relative aspect-[5/3] w-full min-w-0 overflow-hidden rounded-[2rem] border border-white/45 shadow-[0_24px_70px_rgba(47,36,31,0.14)]">
            <Image
              alt={presentation.image.alt}
              className="object-cover"
              fill
              sizes="(max-width: 1023px) 100vw, 52vw"
              src={presentation.image.src}
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-black/28 via-transparent to-transparent"
            />
            <figcaption className="absolute right-5 bottom-5 rounded-full border border-white/30 bg-[#211c22]/46 px-4 py-2 text-[10px] font-medium tracking-[0.2em] text-white uppercase backdrop-blur-md">
              {presentation.imageLabel}
            </figcaption>
          </figure>
        </div>

        {pillarId === "beauty" ? (
          <LiftSpotlight checkoutReady={isProductCheckoutReady("lift_guide")} />
        ) : null}

        <ol
          className={cn(
            "mt-10 grid items-stretch gap-4",
            pillar.services.length > 3
              ? "md:grid-cols-2 xl:grid-cols-3"
              : "md:grid-cols-3"
          )}
        >
          {pillar.services.map((service, index) => {
            const action = getBookingServiceAction(service)

            return (
              <li className="h-full" key={service.slug}>
                <article
                  className={cn(
                    "flex h-full flex-col rounded-[1.5rem] border p-6 transition duration-300 motion-safe:hover:-translate-y-0.5 md:p-7",
                    presentation.cardClass
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <span
                      className={cn(
                        "text-[11px] font-medium tracking-[0.22em] uppercase",
                        presentation.accentClass
                      )}
                    >
                      {presentation.categoryLabel}{" "}
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={cn(
                        "rounded-full border px-3 py-1 text-[10px] font-medium tracking-[0.12em] uppercase",
                        isDark
                          ? "border-white/14 bg-white/[0.06] text-white/68"
                          : "border-[var(--border)] bg-white/46 text-[var(--muted-foreground)]"
                      )}
                    >
                      {service.format}
                    </span>
                  </div>

                  <h3
                    className={cn(
                      "mt-5 text-3xl leading-tight font-medium",
                      isDark ? "text-white" : "text-[var(--primary)]"
                    )}
                  >
                    {service.title}
                  </h3>

                  <dl>
                    <div className="mt-5">
                      <dt className="sr-only">Price</dt>
                      <dd
                        className={cn(
                          "font-serif text-3xl",
                          isDark ? "text-[#f1dfc5]" : "text-[var(--primary)]"
                        )}
                      >
                        {service.price}
                      </dd>
                    </div>
                    <div className="mt-3">
                      <dt className="sr-only">Duration and guest details</dt>
                      <dd
                        className={cn(
                          "flex items-start gap-2 text-xs leading-5",
                          isDark
                            ? "text-white/62"
                            : "text-[var(--muted-foreground)]"
                        )}
                      >
                        <Clock3
                          aria-hidden="true"
                          className={cn(
                            "mt-0.5 size-3.5 shrink-0",
                            presentation.accentClass
                          )}
                        />
                        <span>{service.duration}</span>
                      </dd>
                    </div>
                  </dl>

                  <p
                    className={cn(
                      "mt-5 flex-1 text-sm leading-7",
                      isDark
                        ? "text-white/66"
                        : "text-[var(--muted-foreground)]"
                    )}
                  >
                    {service.description}
                  </p>

                  <div
                    className={cn(
                      "mt-6 flex items-center gap-2 border-t pt-4 text-xs",
                      isDark
                        ? "border-white/10 text-white/56"
                        : "border-[var(--border)] text-[var(--muted-foreground)]"
                    )}
                  >
                    {action.kind === "book" ? (
                      <CalendarDays
                        aria-hidden="true"
                        className={cn("size-3.5", presentation.accentClass)}
                      />
                    ) : (
                      <MapPin
                        aria-hidden="true"
                        className={cn("size-3.5", presentation.accentClass)}
                      />
                    )}
                    <span>
                      {action.kind === "book"
                        ? "Live availability · Shannon confirms"
                        : "Retreat groups · Shannon confirms timing"}
                    </span>
                  </div>

                  <SelectBookingButton
                    className={cn(
                      "mt-5 min-h-12 w-full rounded-full px-6",
                      presentation.actionClass
                    )}
                    pillarId={pillarId}
                    service={service}
                  />
                </article>
              </li>
            )
          })}
        </ol>

        <p
          className={cn(
            "mt-7 text-center text-xs leading-6",
            isDark ? "text-white/52" : "text-[var(--muted-foreground)]"
          )}
        >
          Session pricing is shown before scheduling. Cal.com is used only to
          choose and request a time; Shannon confirms every appointment.
        </p>
        {pillarId === "ritual" ? (
          <p className="mx-auto mt-3 max-w-3xl text-center text-xs leading-6 text-white/52">
            Readings support reflection and self-inquiry. They are not
            predictions, psychological counseling, medical care, or financial
            advice.
          </p>
        ) : null}
      </div>
    </section>
  )
}
