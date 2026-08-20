import type { ComponentProps } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type BreathVariant = "primary" | "secondary" | "ghost"

export type BreathingButtonProps = ComponentProps<typeof Button> & {
  breathing?: boolean
  breathVariant?: BreathVariant
}

const variantClasses: Record<BreathVariant, string> = {
  primary:
    "border-transparent bg-[var(--accent)] text-white hover:bg-[var(--primary)]",
  secondary:
    "border-[var(--accent)] bg-transparent text-[var(--accent)] hover:bg-[var(--accent)]/8 hover:text-[var(--primary)]",
  ghost:
    "border-transparent bg-transparent text-[var(--muted-foreground)] hover:bg-[var(--muted)]/45 hover:text-[var(--primary)]",
}

export function BreathingButton({
  breathing,
  breathVariant = "primary",
  className,
  variant,
  ...props
}: BreathingButtonProps) {
  const shouldBreathe = breathing ?? breathVariant !== "ghost"
  const baseVariant =
    variant ??
    (breathVariant === "secondary"
      ? "outline"
      : breathVariant === "ghost"
        ? "ghost"
        : "default")

  return (
    <Button
      className={cn(
        "breathing-button",
        variantClasses[breathVariant],
        className
      )}
      data-breathing={shouldBreathe ? "true" : "false"}
      variant={baseVariant}
      {...props}
    />
  )
}
