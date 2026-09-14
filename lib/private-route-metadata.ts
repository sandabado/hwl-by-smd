import type { Metadata } from "next"

export const PRIVATE_ROUTE_ROBOTS = {
  index: false,
  follow: false,
} satisfies NonNullable<Metadata["robots"]>
