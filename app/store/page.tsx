import Image from "next/image"
import Link from "next/link"
import { Check, PlayCircle } from "lucide-react"

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
import { LIFT_STOREFRONT_PRODUCT } from "@/lib/storefront-product"
import { isProductCheckoutReady } from "@/lib/stripe"

export const metadata = createPageMetadata({
  title: "LIFT Video + PDF | HWL by SMD",
  description:
    "Bring home Shannon Mary Dixon's complete seven-movement LIFT facial massage ritual with the guided video and downloadable PDF.",
  path: "/store",
})

const liftFeatures = [
  "Complete seven-movement guided video",
  "Downloadable facial ritual PDF",
  "Private, account-based library access",
] as const

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
        className="flex min-h-[78svh] items-center"
        contentClassName="mx-auto w-full max-w-7xl px-6"
        padding="expansive"
        reveal={false}
        variant="gift-shop"
      >
        <div className="grid items-center gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:gap-20">
          <Reveal>
            <p className="text-xs font-medium tracking-[0.28em] text-[var(--accent)] uppercase">
              The HWL store · Available digitally
            </p>
            <BreathingText
              as="h1"
              className="mt-5 font-medium text-[var(--primary)]"
              size="hero"
            >
              {LIFT_STOREFRONT_PRODUCT.name}
            </BreathingText>
            <BreathingText
              className="mt-7 max-w-xl text-[var(--primary)]"
              size="subheading"
            >
              Seven movements. Five minutes. Your own two hands.
            </BreathingText>
            <p className="mt-7 max-w-xl text-base leading-8 text-[var(--muted-foreground)] md:text-lg">
              Learn Shannon&apos;s complete facial massage ritual with a guided
              video and a downloadable guide you can return to at home.
            </p>

            <div className="mt-8 flex items-end gap-3">
              <span className="font-serif text-5xl text-[var(--primary)]">
                {LIFT_STOREFRONT_PRODUCT.price}
              </span>
              <span className="pb-1 text-xs tracking-[0.16em] text-[var(--muted-foreground)] uppercase">
                One-time purchase
              </span>
            </div>

            <ul className="mt-8 space-y-3 text-sm text-[var(--muted-foreground)]">
              {liftFeatures.map((feature) => (
                <li className="flex items-start gap-3" key={feature}>
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-[var(--accent)]/10 text-[var(--accent)]">
                    <Check aria-hidden="true" className="size-3" />
                  </span>
                  <span className="leading-relaxed">{feature}</span>
                </li>
              ))}
            </ul>

            <div className="mt-9 max-w-sm">
              {access?.canAccessLift ? (
                <Button
                  asChild
                  className="min-h-12 w-full rounded-full bg-[var(--primary)] px-7 text-white hover:bg-[var(--accent)] sm:w-auto"
                >
                  <Link href="/course/lift-daily-facial-ritual">Open LIFT</Link>
                </Button>
              ) : (
                <AddToCartButton
                  className="min-h-12 px-7 sm:w-auto"
                  label={`Add LIFT to cart · ${LIFT_STOREFRONT_PRODUCT.price}`}
                />
              )}
            </div>

            <Link
              className="mt-5 inline-flex min-h-11 items-center text-sm font-medium text-[var(--accent)] underline decoration-[var(--accent)]/35 underline-offset-4 transition hover:decoration-[var(--accent)] focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-4 focus-visible:outline-none"
              href="/beauty/lift"
            >
              See the complete LIFT details
            </Link>

            <p
              className="mt-5 max-w-xl text-xs leading-6 text-[var(--muted-foreground)]"
              role={liftSalesReady ? undefined : "status"}
            >
              {liftSalesReady
                ? "Secure Stripe checkout. Your video and PDF appear in your private HWL library after payment confirmation."
                : "You can save LIFT to your cart. Checkout remains closed until the protected delivery and Stripe paths complete verification."}
            </p>
          </Reveal>

          <Reveal className="relative" delay={120}>
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-white/65 bg-[var(--muted)] shadow-[0_28px_80px_rgba(90,74,63,0.14)]">
              <Image
                alt={media.editorial.liftVideoPreview.alt}
                className="object-cover"
                fill
                preload
                sizes="(max-width: 1023px) 92vw, 50vw"
                src={media.editorial.liftVideoPreview.src}
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-[var(--primary)]/55 via-transparent to-transparent"
              />
              <div className="absolute right-6 bottom-6 left-6 flex items-center gap-3 text-white">
                <span className="grid size-11 shrink-0 place-items-center rounded-full border border-white/35 bg-white/12 backdrop-blur-sm">
                  <PlayCircle aria-hidden="true" className="size-5" />
                </span>
                <p className="text-xs font-medium tracking-[0.16em] uppercase">
                  Complete video + PDF · Private library access
                </p>
              </div>
            </div>
          </Reveal>
        </div>

        <PersonalUseLicense className="mx-auto mt-12 max-w-3xl" />
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
