import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Check, PlayCircle, type LucideIcon } from "lucide-react"

import { AddToCartButton } from "@/components/cart/add-to-cart-button"
import { BreathingSection } from "@/components/shared/breathing-section"
import { BreathingText } from "@/components/shared/breathing-text"
import { FaqAccordion } from "@/components/shared/internal-page"
import { PersonalUseLicense } from "@/components/shared/personal-use-license"
import { Reveal } from "@/components/shared/reveal"
import { Button } from "@/components/ui/button"
import { getAuthenticatedUser, getMemberAccess } from "@/lib/access"
import { media } from "@/lib/media"
import { createPageMetadata } from "@/lib/seo"
import { isProductCheckoutReady } from "@/lib/stripe"

export const metadata = createPageMetadata({
  title: "Beauty Products, Magical Tools & Digital Guides | HWL by SMD",
  description:
    "Shop Shannon's beauty shelf, magical tools, and complete LIFT video and PDF ritual from HWL by SMD.",
  path: "/store",
})

const collections = [
  {
    id: "beauty-products",
    eyebrow: "The beauty shelf",
    title: "Beauty Products",
    description:
      "Professional and everyday beauty products selected by Shannon for thoughtful at-home care. The first collection is being gathered now.",
    image: media.experiences.beauty,
    href: "/contact",
    label: "Ask about beauty products",
  },
  {
    id: "magical-tools",
    eyebrow: "Tools for practice",
    title: "Magical Tools",
    description:
      "A home for the tarot, ritual, lunar, and sensory tools Shannon chooses to carry. The first collection is being gathered now.",
    image: media.experiences.ritualMoon,
    href: "/contact",
    label: "Ask about magical tools",
  },
] as const

type Offer = {
  cadence: string
  description: string
  eyebrow: string
  features: string[]
  featured: boolean
  icon: LucideIcon
  id: string
  label: string
  ownedHref: string
  price: string
  productId: "lift_guide"
  title: string
}

const offers: Offer[] = [
  {
    productId: "lift_guide",
    id: "lift-guide",
    eyebrow: "Streaming + PDF",
    title: "LIFT — Video + PDF",
    price: "$11.11",
    cadence: "one time",
    description:
      "A full video walkthrough of all seven movements plus the downloadable guide. Learn each technique by seeing it demonstrated.",
    features: [
      "Guided in-browser video",
      "Printable PDF",
      "Account-based access",
    ],
    label: "Add LIFT to cart · $11.11",
    featured: true,
    icon: PlayCircle,
    ownedHref: "/course/lift-daily-facial-ritual",
  },
]

function getFaqs({ liftReady }: { liftReady: boolean }) {
  return [
    {
      question: "Where will I find my purchase?",
      answer:
        "Create or sign in to your HWL account before checkout. Your purchase will appear in your private HWL library automatically after payment.",
    },
    {
      question: "What is included with LIFT?",
      answer: liftReady
        ? "Your purchase includes the complete guided video and downloadable PDF in your private HWL library."
        : "LIFT will include the complete guided video and downloadable PDF. Checkout opens only after both protected files and the full delivery path are verified.",
    },
    {
      question: "How does the PDF download work?",
      answer:
        "The download is delivered through your protected library. Its private link expires, so your purchase stays tied to your account.",
    },
    {
      question: "What is the refund policy?",
      answer:
        "Contact Shannon within 14 days to request a refund on a digital purchase. Review the Refund Policy for the complete terms.",
    },
  ]
}

export default async function StorePage() {
  const user = await getAuthenticatedUser()
  const access = user ? await getMemberAccess(user.id) : null
  const liftSalesReady = isProductCheckoutReady("lift_guide")
  const faqs = getFaqs({ liftReady: liftSalesReady })
  return (
    <>
      <BreathingSection
        background="gradient"
        className="flex min-h-[64svh] items-center"
        contentClassName="mx-auto grid w-full max-w-7xl items-center gap-14 px-6 lg:grid-cols-[1.2fr_0.8fr]"
        padding="standard"
        reveal={false}
        variant="gift-shop"
      >
        <Reveal>
          <BreathingText
            as="h1"
            className="font-medium text-[var(--primary)]"
            size="hero"
          >
            Beauty, ritual, and practice for home.
          </BreathingText>
          <BreathingText
            className="mt-7 text-[var(--primary)]"
            size="subheading"
          >
            Shannon&apos;s store, gathered with care.
          </BreathingText>
          <BreathingText
            className="mt-7 max-w-3xl text-[var(--muted-foreground)]"
            size="body"
          >
            Explore beauty products, magical tools, and Shannon&apos;s complete
            LIFT ritual. The first physical collections are being gathered now.
          </BreathingText>
          <div className="mt-10 flex flex-wrap gap-4">
            <Button
              asChild
              className="min-h-12 rounded-full bg-[var(--primary)] px-7 text-white hover:bg-[var(--accent)]"
            >
              <Link href="#beauty-products">Explore the Store</Link>
            </Button>
            <Button
              asChild
              className="min-h-12 rounded-full border-[var(--border)] bg-white/30 px-7 text-[var(--primary)] hover:bg-white/70"
              variant="outline"
            >
              <Link href="#digital-practice">Digital Practice</Link>
            </Button>
          </div>
        </Reveal>

        <Reveal className="relative min-h-96" delay={120}>
          <div className="absolute inset-x-0 top-4 mx-auto h-64 w-64 rounded-full border border-[var(--accent)]/28 bg-[radial-gradient(circle_at_34%_28%,rgba(255,255,255,0.9),rgba(196,168,130,0.2)_55%,transparent_70%)]" />
          <div className="absolute inset-x-0 bottom-14 h-px bg-[var(--primary)]/18 shadow-[0_22px_35px_rgba(90,74,63,0.18)]" />
          <div className="absolute inset-x-8 bottom-16 flex items-end justify-center gap-4">
            <span className="h-36 w-16 rounded-t-full rounded-b-md border border-[var(--primary)]/15 bg-[var(--primary)]/88" />
            <span className="h-24 w-28 rounded-sm border border-[var(--primary)]/12 bg-[#d9c0a6]" />
            <span className="h-44 w-20 rounded-t-[2.5rem] rounded-b-lg border border-[var(--primary)]/12 bg-white/62" />
          </div>
          <p className="absolute inset-x-0 bottom-0 text-center text-[10px] font-medium tracking-[0.24em] text-[var(--muted-foreground)] uppercase">
            A small shelf of practice
          </p>
        </Reveal>
      </BreathingSection>

      <BreathingSection
        background="cool"
        contentClassName="mx-auto max-w-7xl px-6"
        variant="gift-shop"
      >
        <div className="max-w-3xl">
          <p className="text-xs font-medium tracking-[0.28em] text-[var(--accent)] uppercase">
            Shop by collection
          </p>
          <BreathingText
            as="h2"
            className="mt-5 font-medium text-[var(--primary)]"
            size="heading"
          >
            A shelf for the things Shannon actually uses.
          </BreathingText>
          <p className="mt-6 text-base leading-[1.9] text-[var(--muted-foreground)]">
            The physical shop has two homes. Each item will arrive with the
            details you need to choose it with confidence.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {collections.map((collection) => (
            <article
              className="group relative min-h-[32rem] overflow-hidden rounded-[2rem] border border-white/65 bg-[var(--muted)] shadow-[0_26px_70px_rgba(90,74,63,0.1)]"
              id={collection.id}
              key={collection.id}
            >
              <Image
                alt={collection.image.alt}
                className="object-cover transition duration-[1200ms] ease-out motion-safe:group-hover:scale-[1.025]"
                fill
                sizes="(max-width: 1023px) 100vw, 50vw"
                src={collection.image.src}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--primary)]/95 via-[var(--primary)]/40 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-7 text-[var(--background)] md:p-10">
                <p className="text-xs font-medium tracking-[0.22em] text-[var(--accent-on-dark)] uppercase">
                  {collection.eyebrow}
                </p>
                <h3 className="mt-4 font-serif text-4xl text-white md:text-5xl">
                  {collection.title}
                </h3>
                <p className="mt-5 max-w-xl text-sm leading-[1.85] text-white/76 md:text-base">
                  {collection.description}
                </p>
                <Link
                  className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-full border border-white/38 bg-white/10 px-5 py-2 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white hover:text-[var(--primary)]"
                  href={collection.href}
                >
                  {collection.label}
                  <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </BreathingSection>

      <BreathingSection
        background="warm"
        contentClassName="mx-auto max-w-7xl px-6"
        id="digital-practice"
        variant="gift-shop"
      >
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <p className="text-xs font-medium tracking-[0.28em] text-[var(--accent)] uppercase">
            Available digitally
          </p>
          <BreathingText
            as="h2"
            className="mt-5 font-medium text-[var(--primary)]"
            size="heading"
          >
            One complete digital practice.
          </BreathingText>
        </div>
        <PersonalUseLicense className="mx-auto mb-12 max-w-3xl" />
        <div className="mx-auto max-w-2xl">
          {offers.map((offer, index) => {
            const Icon = offer.icon
            const owned = access?.canAccessLift

            return (
              <Reveal as="article" delay={index * 80} key={offer.productId}>
                <div
                  className={
                    offer.featured
                      ? "relative flex h-full min-h-[38rem] flex-col overflow-hidden rounded-[2rem] border border-[var(--accent)] bg-[var(--primary)] p-8 text-[var(--background)] shadow-[0_32px_85px_rgba(63,48,39,0.2)] lg:-translate-y-5"
                      : "relative flex h-full min-h-[38rem] flex-col overflow-hidden rounded-[2rem] border border-[var(--border)] bg-white/52 p-8 text-[var(--primary)]"
                  }
                  id={offer.id}
                >
                  {offer.featured ? (
                    <span className="absolute top-7 right-7 rounded-full bg-[var(--accent)] px-3 py-1 text-[10px] font-semibold tracking-[0.18em] text-white uppercase">
                      First release
                    </span>
                  ) : null}

                  <span
                    className={
                      offer.featured
                        ? "grid size-14 place-items-center rounded-full border border-white/16 bg-white/8 text-[var(--accent-on-dark)]"
                        : "grid size-14 place-items-center rounded-full border border-[var(--accent)]/22 bg-[var(--muted)]/50 text-[var(--accent)]"
                    }
                  >
                    <Icon className="size-6" aria-hidden="true" />
                  </span>
                  <p
                    className={
                      offer.featured
                        ? "mt-9 text-xs font-medium tracking-[0.22em] text-[var(--accent-on-dark)] uppercase"
                        : "mt-9 text-xs font-medium tracking-[0.22em] text-[var(--accent)] uppercase"
                    }
                  >
                    {offer.eyebrow}
                  </p>
                  <h2 className="mt-5 text-4xl leading-tight font-medium">
                    {offer.title}
                  </h2>
                  <div className="mt-5 flex items-end gap-2">
                    <span className="font-serif text-5xl">{offer.price}</span>
                    <span className="pb-1 text-xs opacity-72">
                      {offer.cadence}
                    </span>
                  </div>
                  <p className="mt-7 text-sm leading-[1.85] opacity-78">
                    {offer.description}
                  </p>
                  <ul className="mt-8 flex-1 space-y-4 text-sm">
                    {offer.features.map((feature) => (
                      <li className="flex items-start gap-3" key={feature}>
                        <Check
                          className={
                            offer.featured
                              ? "mt-0.5 size-4 shrink-0 text-[var(--accent-on-dark)]"
                              : "mt-0.5 size-4 shrink-0 text-[var(--accent)]"
                          }
                          aria-hidden="true"
                        />
                        <span className="leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-9">
                    {owned ? (
                      <Button
                        asChild
                        className={
                          offer.featured
                            ? "h-11 w-full rounded-full bg-[var(--background)] px-6 text-[var(--primary)] hover:bg-[var(--accent)] hover:text-white"
                            : "h-11 w-full rounded-full px-6"
                        }
                        variant={offer.featured ? "default" : "outline"}
                      >
                        <Link href={offer.ownedHref}>Access Now</Link>
                      </Button>
                    ) : (
                      <AddToCartButton
                        className={
                          offer.featured
                            ? "bg-[var(--background)] text-[var(--primary)] hover:bg-[var(--accent)] hover:text-white"
                            : undefined
                        }
                        label={offer.label}
                        variant={offer.featured ? "default" : "outline"}
                      />
                    )}
                  </div>
                </div>
              </Reveal>
            )
          })}
        </div>

        <p className="mx-auto mt-10 max-w-2xl text-center text-xs leading-[1.8] text-[var(--muted-foreground)]">
          {liftSalesReady
            ? "One purchase unlocks the complete LIFT video and downloadable PDF inside your private HWL library."
            : "Sales are closed until the private video, PDF, entitlement, webhook, and delivery paths have been verified together."}
        </p>
      </BreathingSection>

      <BreathingSection
        background="cool"
        contentClassName="mx-auto max-w-5xl px-6"
        variant="gift-shop"
      >
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-medium tracking-[0.28em] text-[var(--accent)] uppercase">
            A little clarity
          </p>
          <BreathingText
            as="h2"
            className="mt-5 font-medium text-[var(--primary)]"
            size="heading"
          >
            Questions
          </BreathingText>
        </div>
        <div className="mt-10">
          <FaqAccordion items={faqs} />
        </div>
      </BreathingSection>
    </>
  )
}
