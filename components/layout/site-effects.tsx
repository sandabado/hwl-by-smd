"use client"

import { usePathname } from "next/navigation"

import { ScrollProgress } from "@/components/layout/scroll-progress"
import { BackToTop } from "@/components/shared/back-to-top"
import { CursorGlow } from "@/components/shared/cursor-glow"
import { ScrollBreath } from "@/components/shared/scroll-breath"
import { allowsAmbientMotion } from "@/lib/motion-policy"

export function SiteEffects() {
  const pathname = usePathname()
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
