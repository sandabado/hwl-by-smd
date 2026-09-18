"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

export function resolveHydratedPathname(
  pathname: string,
  committedPathname: string | null
) {
  return pathname === committedPathname ? pathname : null
}

export function useHydratedPathname() {
  const pathname = usePathname()
  const [committedPathname, setCommittedPathname] = useState<string | null>(
    null
  )

  useEffect(() => {
    let active = true

    window.queueMicrotask(() => {
      if (active) setCommittedPathname(pathname)
    })

    return () => {
      active = false
    }
  }, [pathname])

  return resolveHydratedPathname(pathname, committedPathname)
}
