const memberRouteRoots = [
  "/the-den",
  "/library",
  "/course",
  "/lesson",
  "/account",
] as const

function isPathAtOrBelow(pathname: string, routeRoot: string) {
  return pathname === routeRoot || pathname.startsWith(`${routeRoot}/`)
}

export function isHostedAdminPage(pathname: string) {
  return (
    isPathAtOrBelow(pathname, "/admin") &&
    pathname !== "/admin/login" &&
    !isPathAtOrBelow(pathname, "/admin/api")
  )
}

export function requiresSupabaseSession(
  pathname: string,
  { demoAdminEnabled = false }: { demoAdminEnabled?: boolean } = {}
) {
  const isMemberPage = memberRouteRoots.some((routeRoot) =>
    isPathAtOrBelow(pathname, routeRoot)
  )

  return isMemberPage || (!demoAdminEnabled && isHostedAdminPage(pathname))
}

export function supabaseLoginUrl(requestUrl: URL) {
  const returnTo = `${requestUrl.pathname}${requestUrl.search}`
  const loginUrl = new URL("/login", requestUrl)
  loginUrl.searchParams.set("redirectTo", returnTo)
  return loginUrl
}
