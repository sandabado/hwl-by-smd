import type { CSSProperties } from "react"

import { cn } from "@/lib/utils"

type SectionDividerVariant = "fade" | "line" | "wave"

interface SectionDividerProps {
  className?: string
  from?: string
  to?: string
  variant?: SectionDividerVariant
}

export function SectionDivider({
  className,
  from = "transparent",
  to = "transparent",
  variant = "line",
}: SectionDividerProps) {
  if (variant === "fade") {
    const style = {
      background: `linear-gradient(to bottom, ${from}, ${to})`,
    } satisfies CSSProperties

    return (
      <div
        aria-hidden="true"
        className={cn("h-20 w-full", className)}
        style={style}
      />
    )
  }

  if (variant === "wave") {
    return (
      <div
        aria-hidden="true"
        className={cn("relative h-16 w-full overflow-hidden", className)}
      >
        <div className="absolute top-2 -left-[5%] h-12 w-[110%] rounded-[50%] border-b border-[var(--accent)]/35" />
        <div className="absolute top-5 -left-[5%] h-10 w-[110%] rounded-[50%] border-b border-[var(--border)]/90" />
      </div>
    )
  }

  return (
    <div
      aria-hidden="true"
      className={cn("flex h-12 items-center justify-center px-6", className)}
    >
      <span className="h-px w-full max-w-24 bg-[var(--border)]" />
      <span className="mx-4 size-1.5 rotate-45 bg-[var(--accent)]" />
      <span className="h-px w-full max-w-24 bg-[var(--border)]" />
    </div>
  )
}
