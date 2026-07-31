import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type BreathingTextElement = "blockquote" | "h1" | "h2" | "h3" | "h4" | "p"
type BreathingTextSize = "body" | "caption" | "heading" | "hero" | "subheading"

interface BreathingTextProps {
  as?: BreathingTextElement
  children: ReactNode
  className?: string
  size?: BreathingTextSize
}

const sizeClasses: Record<BreathingTextSize, string> = {
  hero: "text-5xl leading-[0.98] tracking-[0.035em] md:text-6xl lg:text-7xl",
  heading: "text-4xl leading-[1.08] md:text-5xl",
  subheading: "text-xl leading-[1.65] md:text-2xl",
  body: "text-lg leading-[var(--type-leading)] md:text-xl",
  caption: "text-sm leading-normal tracking-[0.14em]",
}

export function BreathingText({
  as: Tag = "p",
  children,
  className,
  size = "body",
}: BreathingTextProps) {
  return (
    <Tag
      className={cn("text-[var(--foreground)]", sizeClasses[size], className)}
    >
      {children}
    </Tag>
  )
}
