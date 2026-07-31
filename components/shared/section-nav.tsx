"use client"

import { useEffect, useState } from "react"

import { cn } from "@/lib/utils"

export interface SectionNavItem {
  id: string
  label: string
}

interface SectionNavProps {
  ariaLabel?: string
  className?: string
  sections: SectionNavItem[]
  stickyOffset?: number
}

export function SectionNav({
  ariaLabel = "On this page",
  className,
  sections,
  stickyOffset = 96,
}: SectionNavProps) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? "")

  useEffect(() => {
    const targets = sections
      .map((section) => document.getElementById(section.id))
      .filter((target): target is HTMLElement => Boolean(target))

    if (targets.length === 0) return

    const visibleSections = new Map<string, number>()
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visibleSections.set(entry.target.id, entry.boundingClientRect.top)
          } else {
            visibleSections.delete(entry.target.id)
          }
        })

        const nextActive = [...visibleSections.entries()].sort(
          (left, right) => Math.abs(left[1]) - Math.abs(right[1])
        )[0]?.[0]

        if (nextActive) {
          setActiveId(nextActive)
        }
      },
      {
        rootMargin: "-22% 0px -58% 0px",
        threshold: [0, 0.1, 0.5],
      }
    )

    targets.forEach((target) => observer.observe(target))
    return () => observer.disconnect()
  }, [sections])

  if (sections.length < 2) return null

  const goToSection = (
    event: React.MouseEvent<HTMLAnchorElement>,
    id: string
  ) => {
    const target = document.getElementById(id)
    if (!target) return

    event.preventDefault()
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
    const targetTop =
      target.getBoundingClientRect().top + window.scrollY - stickyOffset - 16

    window.scrollTo({
      top: Math.max(0, targetTop),
      behavior: reduceMotion ? "auto" : "smooth",
    })
    window.history.pushState(null, "", `#${encodeURIComponent(id)}`)
    setActiveId(id)
  }

  return (
    <nav
      aria-label={ariaLabel}
      className={cn("sticky z-30", className)}
      style={{ top: stickyOffset }}
    >
      <ol className="flex [scrollbar-width:none] gap-2 overflow-x-auto rounded-full border border-[var(--border)] bg-[var(--background)]/90 p-2 shadow-sm backdrop-blur md:hidden [&::-webkit-scrollbar]:hidden">
        {sections.map((section) => {
          const isActive = activeId === section.id

          return (
            <li className="shrink-0" key={section.id}>
              <a
                aria-current={isActive ? "location" : undefined}
                className={cn(
                  "block rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]",
                  isActive
                    ? "bg-[var(--primary)] text-[var(--background)]"
                    : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--primary)]"
                )}
                href={`#${encodeURIComponent(section.id)}`}
                onClick={(event) => goToSection(event, section.id)}
              >
                {section.label}
              </a>
            </li>
          )
        })}
      </ol>

      <ol className="hidden flex-col gap-1 rounded-lg border border-[var(--border)] bg-[var(--background)]/88 p-3 shadow-sm backdrop-blur md:flex">
        {sections.map((section) => {
          const isActive = activeId === section.id

          return (
            <li key={section.id}>
              <a
                aria-current={isActive ? "location" : undefined}
                className={cn(
                  "group flex items-center gap-3 rounded-md px-2 py-2 text-xs transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]",
                  isActive
                    ? "text-[var(--primary)]"
                    : "text-[var(--muted-foreground)] hover:text-[var(--primary)]"
                )}
                href={`#${encodeURIComponent(section.id)}`}
                onClick={(event) => goToSection(event, section.id)}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "size-1.5 shrink-0 rounded-full transition-[transform,background-color] duration-200",
                    isActive
                      ? "scale-150 bg-[var(--accent)]"
                      : "bg-[var(--border)] group-hover:bg-[var(--accent)]"
                  )}
                />
                <span>{section.label}</span>
              </a>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
