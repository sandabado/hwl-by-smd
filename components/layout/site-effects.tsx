"use client"

import { usePathname } from "next/navigation"

import { ScrollProgress } from "@/components/layout/scroll-progress"
import { BackToTop } from "@/components/shared/back-to-top"
import { CursorGlow } from "@/components/shared/cursor-glow"

export function SiteEffects() {
  const pathname = usePathname()

  if (pathname.startsWith("/admin")) return null

  return (
    <>
      <ScrollProgress />
      <CursorGlow />
      <BackToTop />
    </>
  )
}
