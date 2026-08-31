"use client"

import { ShoppingBag } from "lucide-react"

import { useCart } from "@/components/cart/cart-provider"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function CartTrigger({
  className,
  compact = false,
}: {
  className?: string
  compact?: boolean
}) {
  const { hasLift, isOpen, openCart } = useCart()

  return (
    <Button
      aria-controls="site-cart-sheet"
      aria-expanded={isOpen}
      aria-haspopup="dialog"
      aria-label={hasLift ? "Cart, 1 item" : "Cart, empty"}
      className={cn(
        "relative h-11 rounded-full border border-[var(--accent)]/35 bg-transparent text-[var(--foreground)] hover:bg-[var(--accent)]/14 hover:text-[var(--foreground)]",
        compact ? "w-11 px-0" : "gap-2 px-3.5",
        className
      )}
      data-cart-trigger=""
      onClick={openCart}
      type="button"
      variant="ghost"
    >
      <ShoppingBag className="size-4.5" aria-hidden="true" />
      {!compact ? <span>Cart</span> : null}
      {hasLift ? (
        <span
          aria-hidden="true"
          className="absolute -top-1 -right-1 grid size-5 place-items-center rounded-full bg-[var(--accent)] text-[10px] font-semibold text-white shadow-sm"
        >
          1
        </span>
      ) : null}
    </Button>
  )
}
