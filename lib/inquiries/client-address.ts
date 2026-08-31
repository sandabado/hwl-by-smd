import { isIP } from "node:net"

type InquiryRuntimeEnvironment = {
  HWL_DEPLOYMENT_TARGET?: string
  NODE_ENV?: string
  VERCEL?: string
}

function firstValidAddress(headers: Array<string | null>) {
  for (const header of headers) {
    if (!header) continue

    for (const entry of header.split(",")) {
      const address = entry.trim()
      if (isIP(address)) return address
    }
  }

  return null
}

function isVercelDeployment(environment: InquiryRuntimeEnvironment) {
  const target = environment.HWL_DEPLOYMENT_TARGET?.trim().toLowerCase()
  return (
    environment.VERCEL === "1" ||
    target === "preview" ||
    target === "production"
  )
}

export function resolveInquiryClientIdentity(
  request: Request,
  environment: InquiryRuntimeEnvironment = process.env
) {
  const deployedToVercel = isVercelDeployment(environment)

  // Vercel overwrites this header at its network boundary. Deployed traffic
  // must never fall back to generic forwarding headers, because outside that
  // trusted boundary a caller could choose their own rate-limit identity.
  const address = deployedToVercel
    ? firstValidAddress([request.headers.get("x-vercel-forwarded-for")])
    : firstValidAddress([
        request.headers.get("x-vercel-forwarded-for"),
        request.headers.get("x-real-ip"),
        request.headers.get("x-forwarded-for"),
      ])

  if (address) return address
  if (!deployedToVercel && environment.NODE_ENV === "development") {
    return "local-development"
  }

  return null
}
