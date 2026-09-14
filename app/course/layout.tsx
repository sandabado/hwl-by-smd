import type { Metadata } from "next"

import { PRIVATE_ROUTE_ROBOTS } from "@/lib/private-route-metadata"

export const metadata: Metadata = {
  robots: PRIVATE_ROUTE_ROBOTS,
}

export default function CourseLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return children
}
