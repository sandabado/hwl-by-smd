import { LocationLandingPage } from "@/components/locations/location-landing-page"
import { LOCATION_PAGES } from "@/lib/location-pages"
import { createPageMetadata } from "@/lib/seo"

const page = LOCATION_PAGES["desert-hot-springs"]

export const metadata = createPageMetadata({
  ...page.metadata,
  path: page.path,
})

export default function DesertHotSpringsPage() {
  return <LocationLandingPage data={page} />
}
