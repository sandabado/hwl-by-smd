"use client"

import {
  Circle,
  MapContainer,
  Popup,
  TileLayer,
  ZoomControl,
} from "react-leaflet"

import type { OsmMapProps } from "@/components/map/osm-map"

export default function OsmMapClient({
  label,
  latitude,
  longitude,
  radiusMeters = 9000,
  zoom = 10,
}: OsmMapProps) {
  const center: [number, number] = [latitude, longitude]

  return (
    <MapContainer
      center={center}
      className="h-96 w-full"
      preferCanvas
      scrollWheelZoom={false}
      zoom={zoom}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Circle
        center={center}
        pathOptions={{
          color: "#627c65",
          fillColor: "#a9c2ae",
          fillOpacity: 0.2,
          opacity: 0.72,
          weight: 2,
        }}
        radius={radiusMeters}
      >
        <Popup>{label} general service area</Popup>
      </Circle>
      <ZoomControl position="bottomright" />
    </MapContainer>
  )
}
