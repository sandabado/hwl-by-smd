const AMBIENT_MOTION_EXCLUDED_ROUTES = [
  "/account",
  "/admin",
  "/auth",
  "/checkout",
  "/course",
  "/den",
  "/lesson",
  "/library",
  "/login",
  "/reset-password",
  "/the-den",
  "/update-password",
] as const

export function allowsAmbientMotion(pathname: string) {
  return !AMBIENT_MOTION_EXCLUDED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )
}
