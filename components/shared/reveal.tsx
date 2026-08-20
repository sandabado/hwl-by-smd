import type { CSSProperties, ReactNode } from "react"

import { cn } from "@/lib/utils"

type RevealElement = "article" | "div" | "li" | "section"

interface RevealProps {
  as?: RevealElement
  children: ReactNode
  className?: string
  delay?: number
}

export function Reveal({
  as = "div",
  children,
  className,
  delay = 0,
}: RevealProps) {
  const style = {
    "--reveal-delay": `${Math.min(800, Math.max(0, delay))}ms`,
  } as CSSProperties

  const sharedProps = {
    className: cn("somatic-reveal", className),
    "data-reveal": "visible",
    style,
  }

  if (as === "article") {
    return <article {...sharedProps}>{children}</article>
  }

  if (as === "li") {
    return <li {...sharedProps}>{children}</li>
  }

  if (as === "section") {
    return <section {...sharedProps}>{children}</section>
  }

  return <div {...sharedProps}>{children}</div>
}
