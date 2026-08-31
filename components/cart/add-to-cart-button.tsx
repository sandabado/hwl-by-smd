"use client"

import { Check, ShoppingBag } from "lucide-react"

import { useCart } from "@/components/cart/cart-provider"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function AddToCartButton({
  className,
  label = "Add LIFT to cart · $11.11",
  variant = "default",
}: {
  className?: string
  label?: string
  variant?: "default" | "outline"
}) {
  const { addLift, hasLift } = useCart()

  return (
    <Button
      aria-controls="site-cart-sheet"
      aria-haspopup="dialog"
      className={cn(
        "h-11 w-full rounded-full px-6",
        variant === "default"
          ? "bg-[var(--primary)] text-white hover:bg-[var(--accent)]"
          : "border-[var(--border)] bg-transparent text-[var(--primary)] hover:bg-[var(--muted)]",
        className
      )}
      onClick={addLift}
      type="button"
      variant={variant}
    >
      {hasLift ? (
        <Check className="size-4" aria-hidden="true" />
      ) : (
        <ShoppingBag className="size-4" aria-hidden="true" />
      )}
      {hasLift ? "In cart — View cart" : label}
    </Button>
  )
}
