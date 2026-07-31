import type { ReactNode } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { cn } from "@/lib/utils"

interface PreviewCardProps {
  actionLabel?: string
  children?: ReactNode
  className?: string
  description?: string
  detail?: ReactNode
  eyebrow?: string
  href?: string
  meta?: ReactNode
  title: string
}

export function PreviewCard({
  actionLabel = "Explore",
  children,
  className,
  description,
  detail,
  eyebrow,
  href,
  meta,
  title,
}: PreviewCardProps) {
  return (
    <article
      className={cn(
        "group/preview relative flex h-full flex-col overflow-hidden rounded-lg border border-[var(--border)] bg-white/55 p-6 shadow-[0_12px_40px_rgba(90,74,63,0)] transition-[transform,box-shadow,background-color] duration-300 ease-out outline-none focus-within:-translate-y-2 focus-within:shadow-[0_20px_50px_rgba(90,74,63,0.12)] hover:-translate-y-2 hover:bg-white/75 hover:shadow-[0_20px_50px_rgba(90,74,63,0.12)] focus-visible:-translate-y-2 focus-visible:shadow-[0_20px_50px_rgba(90,74,63,0.12)] focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] motion-reduce:transform-none motion-reduce:transition-none",
        className
      )}
      tabIndex={detail && !href ? 0 : undefined}
    >
      {children ? <div className="mb-5">{children}</div> : null}

      <div className="flex items-center justify-between gap-4">
        {eyebrow ? (
          <p className="text-xs font-medium tracking-[0.2em] text-[var(--accent)] uppercase">
            {eyebrow}
          </p>
        ) : (
          <span />
        )}
        {meta ? (
          <div className="text-xs text-[var(--muted-foreground)]">{meta}</div>
        ) : null}
      </div>

      <h3 className="mt-4 font-serif text-2xl leading-tight font-medium text-[var(--primary)] md:text-3xl">
        {title}
      </h3>
      {description ? (
        <p className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)]">
          {description}
        </p>
      ) : null}

      {detail ? (
        <div className="grid max-h-0 translate-y-2 grid-rows-[0fr] opacity-0 transition-[grid-template-rows,max-height,opacity,transform,margin] duration-300 ease-out group-focus-within/preview:mt-5 group-focus-within/preview:max-h-48 group-focus-within/preview:translate-y-0 group-focus-within/preview:grid-rows-[1fr] group-focus-within/preview:opacity-100 group-hover/preview:mt-5 group-hover/preview:max-h-48 group-hover/preview:translate-y-0 group-hover/preview:grid-rows-[1fr] group-hover/preview:opacity-100 group-focus/preview:mt-5 group-focus/preview:max-h-48 group-focus/preview:translate-y-0 group-focus/preview:grid-rows-[1fr] group-focus/preview:opacity-100 motion-reduce:transform-none motion-reduce:transition-none [@media(hover:none)]:mt-5 [@media(hover:none)]:max-h-48 [@media(hover:none)]:translate-y-0 [@media(hover:none)]:grid-rows-[1fr] [@media(hover:none)]:opacity-100">
          <div className="overflow-hidden">
            <div className="border-t border-[var(--border)] pt-4 text-sm leading-relaxed text-[var(--primary)]">
              {detail}
            </div>
          </div>
        </div>
      ) : null}

      {href ? (
        <Link
          className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-medium text-[var(--accent)] underline-offset-4 outline-none hover:underline focus-visible:underline"
          href={href}
        >
          {actionLabel}
          <ArrowRight
            aria-hidden="true"
            className="size-4 transition-transform duration-300 group-hover/preview:translate-x-1 motion-reduce:transform-none"
          />
        </Link>
      ) : null}
    </article>
  )
}
