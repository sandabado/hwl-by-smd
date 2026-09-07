export const HOMEPAGE_LIFT_FEATURE = {
  key: "lift-daily-ritual",
  slot: "homepage.primary-feature",
  ctaHref: "/beauty/lift",
} as const

type HomepageLiftFeatureDestination = {
  key: string
  ctaHref: string
}

export function isCanonicalHomepageLiftFeatureDestination(
  feature: HomepageLiftFeatureDestination
) {
  return (
    feature.key === HOMEPAGE_LIFT_FEATURE.key &&
    feature.ctaHref === HOMEPAGE_LIFT_FEATURE.ctaHref
  )
}

export function getCanonicalHomepageLiftHref(
  feature: HomepageLiftFeatureDestination
) {
  return isCanonicalHomepageLiftFeatureDestination(feature)
    ? feature.ctaHref
    : HOMEPAGE_LIFT_FEATURE.ctaHref
}
