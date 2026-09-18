"use client"

import { ScrollProgress } from "@/components/layout/scroll-progress"
import { useHydratedPathname } from "@/components/layout/use-hydrated-pathname"
import { BackToTop } from "@/components/shared/back-to-top"
import { CursorGlow } from "@/components/shared/cursor-glow"
import { ScrollBreath } from "@/components/shared/scroll-breath"
import { allowsAmbientMotion } from "@/lib/motion-policy"

export function SiteEffects() {
  const pathname = useHydratedPathname()

  if (pathname === null) return null

  const allowAmbientMotion = allowsAmbientMotion(pathname)

  if (
    pathname === "/" ||
    pathname.startsWith("/admin") ||
    !allowAmbientMotion
  ) {
    return null
  }

  return (
    <>
      <ScrollProgress />
      <ScrollBreath />
      <CursorGlow />
      <BackToTop />
    </>
  )
}
