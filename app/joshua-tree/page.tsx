import { LocationLandingPage } from "@/components/locations/location-landing-page"
import { LOCATION_PAGES } from "@/lib/location-pages"
import { createPageMetadata } from "@/lib/seo"

const page = LOCATION_PAGES["joshua-tree"]

export const metadata = createPageMetadata({
  ...page.metadata,
  path: page.path,
})

export default function JoshuaTreePage() {
  return <LocationLandingPage data={page} />
}
