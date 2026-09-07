import { NAV_ITEMS } from "./constants"

export interface NavItem {
  label: string
  href: string
}

export const MAIN_NAV: NavItem[] = NAV_ITEMS

export const BOOKING_NAV_ITEM = {
  label: "Book a Session",
  href: "/book",
} as const satisfies NavItem

export const ACCOUNT_NAV_LABEL = "My Account"

export function isCurrentPath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function getActiveMainNavHref(pathname: string) {
  return MAIN_NAV.filter((item) => isCurrentPath(pathname, item.href)).sort(
    (left, right) => right.href.length - left.href.length
  )[0]?.href
}
