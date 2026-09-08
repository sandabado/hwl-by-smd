"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Check, LockKeyhole, ShoppingBag, ShieldCheck, X } from "lucide-react"

import { useCart } from "@/components/cart/cart-provider"
import { CheckoutButton } from "@/components/payment/checkout-button"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet"
import { LIFT_STOREFRONT_PRODUCT } from "@/lib/storefront-product"

export function CartSheet() {
  const {
    checkoutAttemptId,
    checkoutCancelled,
    checkoutReady,
    clearCart,
    closeCart,
    hasLift,
    isOpen,
    removeLift,
    setCartOpen,
  } = useCart()
  const [checkoutPending, setCheckoutPending] = useState(false)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const emptyStateRef = useRef<HTMLDivElement>(null)
  const previouslyHadLift = useRef(hasLift)

  useEffect(() => {
    if (isOpen && previouslyHadLift.current && !hasLift) {
      window.requestAnimationFrame(() => emptyStateRef.current?.focus())
    }
    previouslyHadLift.current = hasLift
  }, [hasLift, isOpen])

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && checkoutPending) return
        setCartOpen(open)
      }}
    >
      <SheetContent
        className="hwl-transaction-sheet z-[70] h-[100dvh] w-full gap-0 border-l border-[#d8c9b8] bg-[#faf7f2] p-0 text-[#2b2724] shadow-[-24px_0_80px_rgba(29,24,20,0.2)] data-[side=right]:w-full motion-reduce:animate-none motion-reduce:transition-none sm:max-w-[28rem]"
        id="site-cart-sheet"
        onCloseAutoFocus={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => {
          if (checkoutPending) event.preventDefault()
        }}
        onOpenAutoFocus={(event) => {
          event.preventDefault()
          titleRef.current?.focus()
        }}
        onPointerDownOutside={(event) => {
          if (checkoutPending) event.preventDefault()
        }}
        overlayClassName="z-[65] bg-black/35 duration-200 supports-backdrop-filter:backdrop-blur-sm motion-reduce:animate-none motion-reduce:transition-none"
        showCloseButton={false}
        side="right"
      >
        <header className="relative shrink-0 border-b border-[#dfd3c6] px-6 pt-[max(1.5rem,env(safe-area-inset-top))] pb-5">
          <p className="text-[10px] font-semibold tracking-[0.24em] text-[#765538] uppercase">
            {hasLift ? "Added to your ritual" : "Your ritual shelf"}
          </p>
          <SheetTitle
            className="mt-2 pr-14 font-serif text-3xl font-medium text-[#2b2724] outline-none"
            ref={titleRef}
            tabIndex={-1}
          >
            Your cart
          </SheetTitle>
          <SheetDescription className="mt-2 text-sm leading-relaxed text-[#675b4d]">
            {hasLift
              ? checkoutReady
                ? "One complete digital practice, ready for secure checkout."
                : "One complete digital practice, saved in your cart while checkout receives its final verification."
              : "Your saved rituals will appear here."}
          </SheetDescription>
          <Button
            aria-label="Close cart"
            className="absolute top-[max(1.25rem,env(safe-area-inset-top))] right-4 size-11 rounded-full text-[#2b2724] hover:bg-[#eee5da]"
            disabled={checkoutPending}
            onClick={closeCart}
            size="icon-lg"
            type="button"
            variant="ghost"
          >
            <X className="size-5" aria-hidden="true" />
          </Button>
        </header>

        <div className="hwl-transaction-sheet__body min-h-0 flex-1 overflow-y-auto px-6 py-6">
          {hasLift ? (
            <div className="space-y-6">
              {checkoutCancelled ? (
                <div className="rounded-2xl border border-[#b79261]/30 bg-[#f4e8d6] px-4 py-3 text-sm leading-relaxed text-[#5f4934]">
                  Checkout canceled. Nothing was charged; your cart is still
                  here.
                </div>
              ) : null}

              <article className="grid grid-cols-[6.5rem_1fr] gap-4 border-b border-[#dfd3c6] pb-6">
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#e7d8c7]">
                  <Image
                    alt=""
                    className="object-cover"
                    fill
                    sizes="104px"
                    src={LIFT_STOREFRONT_PRODUCT.image}
                  />
                </div>
                <div className="flex min-w-0 flex-col">
                  <p className="text-[10px] font-semibold tracking-[0.18em] text-[#765538] uppercase">
                    One-time purchase
                  </p>
                  <h2 className="mt-2 font-serif text-xl leading-tight text-[#2b2724]">
                    {LIFT_STOREFRONT_PRODUCT.name}
                  </h2>
                  <p className="mt-2 text-xs leading-relaxed text-[#675b4d]">
                    {LIFT_STOREFRONT_PRODUCT.description}
                  </p>
                  <div className="mt-auto flex items-end justify-between gap-3 pt-4">
                    <button
                      className="min-h-11 text-xs font-medium text-[#765538] underline decoration-[#765538]/35 underline-offset-4 hover:decoration-[#765538]"
                      disabled={checkoutPending}
                      onClick={removeLift}
                      type="button"
                    >
                      Remove
                    </button>
                    <span className="font-serif text-xl text-[#2b2724]">
                      {LIFT_STOREFRONT_PRODUCT.price}
                    </span>
                  </div>
                </div>
              </article>

              <div>
                <p className="text-[10px] font-semibold tracking-[0.18em] text-[#765538] uppercase">
                  Everything included
                </p>
                <ul className="mt-4 space-y-3 text-sm text-[#51483f]">
                  {[
                    "Complete seven-movement guided video",
                    "Downloadable facial ritual PDF",
                    "Private, account-based library access",
                  ].map((item) => (
                    <li className="flex items-start gap-3" key={item}>
                      <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-[#765538]/10 text-[#765538]">
                        <Check className="size-3" aria-hidden="true" />
                      </span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-[#dfd3c6] bg-white/55 px-4 py-4 text-xs leading-relaxed text-[#675b4d]">
                No subscription. No shipping. Access appears in your private
                library after payment confirmation.
              </div>
            </div>
          ) : (
            <div
              className="flex min-h-full flex-col items-center justify-center py-12 text-center outline-none"
              ref={emptyStateRef}
              tabIndex={-1}
            >
              <span className="grid size-16 place-items-center rounded-full bg-[#eee5da] text-[#765538]">
                <ShoppingBag className="size-6" aria-hidden="true" />
              </span>
              <h2 className="mt-6 font-serif text-3xl text-[#2b2724]">
                Your cart is empty.
              </h2>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-[#675b4d]">
                Meet LIFT, Shannon&apos;s five-minute facial ritual with a
                guided video and downloadable PDF.
              </p>
              <Button
                asChild
                className="mt-7 h-11 rounded-full bg-[#2b2724] px-6 text-white hover:bg-[#765538]"
              >
                <Link href="/beauty/lift" onClick={closeCart}>
                  Explore LIFT
                </Link>
              </Button>
            </div>
          )}
        </div>

        {hasLift ? (
          <footer
            className="shrink-0 border-t border-[#d8c9b8] bg-[#f7f1e9] px-6 pt-5"
            style={{
              paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))",
            }}
          >
            <dl className="space-y-2 text-sm text-[#675b4d]">
              <div className="flex items-center justify-between gap-4">
                <dt>Subtotal</dt>
                <dd>{LIFT_STOREFRONT_PRODUCT.price}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt>Digital delivery</dt>
                <dd>Included</dd>
              </div>
              <div className="mt-3 flex items-end justify-between gap-4 border-t border-[#d8c9b8] pt-4 text-[#2b2724]">
                <dt className="font-medium">Total USD</dt>
                <dd className="font-serif text-3xl">
                  {LIFT_STOREFRONT_PRODUCT.price}
                </dd>
              </div>
            </dl>

            <div className="mt-5">
              {checkoutReady && checkoutAttemptId ? (
                <CheckoutButton
                  attemptId={checkoutAttemptId}
                  className="h-12 bg-[#2b2724] text-white hover:bg-[#765538]"
                  label="Continue to secure checkout · $11.11"
                  onInternalRedirect={clearCart}
                  onPendingChange={setCheckoutPending}
                  productId="lift_guide"
                />
              ) : checkoutReady ? (
                <Button
                  className="h-12 w-full rounded-full bg-[#2b2724] px-6 text-white"
                  disabled
                  type="button"
                >
                  Preparing your saved cart…
                </Button>
              ) : (
                <>
                  <Button
                    aria-describedby="cart-checkout-status"
                    className="h-12 w-full rounded-full bg-[#2b2724] px-6 text-white"
                    disabled
                    type="button"
                  >
                    <LockKeyhole className="size-4" aria-hidden="true" />
                    Secure checkout opening soon
                  </Button>
                  <p
                    className="mt-3 text-center text-xs leading-relaxed text-[#675b4d]"
                    id="cart-checkout-status"
                  >
                    Your cart is saved. Checkout opens after the protected files
                    and Stripe delivery path pass their final verification.
                  </p>
                </>
              )}
            </div>

            <div className="mt-4 flex items-center justify-center gap-2 text-[11px] leading-relaxed text-[#675b4d]">
              <ShieldCheck
                className="size-4 shrink-0 text-[#52694d]"
                aria-hidden="true"
              />
              <span>
                {checkoutReady
                  ? "Secure payment powered by Stripe."
                  : "Checkout will be powered by Stripe."}
              </span>
            </div>
            <div
              className="mt-3 text-center text-[11px] leading-relaxed text-[#675b4d]"
              inert={checkoutPending ? true : undefined}
            >
              <p>
                By continuing, you agree to the{" "}
                <Link
                  className="underline underline-offset-4"
                  href="/terms#digital-products-and-access"
                  onClick={closeCart}
                >
                  Terms &amp; personal-use license
                </Link>{" "}
                and acknowledge the{" "}
                <Link
                  className="underline underline-offset-4"
                  href="/privacy"
                  onClick={closeCart}
                >
                  Privacy Policy
                </Link>{" "}
                and{" "}
                <Link
                  className="underline underline-offset-4"
                  href="/refund-policy"
                  onClick={closeCart}
                >
                  Refund Policy
                </Link>
                .
              </p>
              <p className="mt-2">
                <Link
                  className="underline underline-offset-4"
                  href="/contact"
                  onClick={closeCart}
                >
                  Questions before purchasing?
                </Link>
              </p>
            </div>
          </footer>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
