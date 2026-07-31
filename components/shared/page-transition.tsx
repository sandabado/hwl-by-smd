"use client"

import { useEffect, useState } from "react"
import type { ReactNode } from "react"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

interface PageTransitionProps {
  children: ReactNode
  className?: string
}

function RouteReveal({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const animationFrame = window.requestAnimationFrame(() => {
      setIsVisible(true)
    })

    return () => window.cancelAnimationFrame(animationFrame)
  }, [])

  return (
    <div
      className={cn(
        "transition-[opacity,transform] duration-[400ms] ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
        className
      )}
      data-page-transition=""
    >
      {children}
    </div>
  )
}

export function PageTransition({ children, className }: PageTransitionProps) {
  const pathname = usePathname()

  return (
    <RouteReveal className={className} key={pathname}>
      {children}
    </RouteReveal>
  )
}
