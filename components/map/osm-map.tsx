"use client"

import dynamic from "next/dynamic"

export type OsmMapProps = {
  label: string
  latitude: number
  longitude: number
  radiusMeters?: number
  zoom?: number
}

const OsmMapClient = dynamic(() => import("./osm-map-client"), {
  ssr: false,
  loading: () => (
    <div
      aria-label="Loading service-area map"
      className="flex min-h-96 items-center justify-center bg-[var(--room-sage-wash)] text-sm text-[var(--muted-foreground)]"
      role="status"
    >
      Loading map…
    </div>
  ),
})

export function OsmMap(props: OsmMapProps) {
  return (
    <div
      aria-label={`${props.label} service-area map`}
      className="osm-map overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--room-sage-wash)] shadow-[0_24px_70px_rgba(43,39,36,0.1)]"
      role="region"
    >
      <OsmMapClient key={`${props.latitude}-${props.longitude}`} {...props} />
    </div>
  )
}
