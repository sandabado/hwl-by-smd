import { handlePreviewCommerceAlertSmoke } from "@/lib/commerce/preview-alert-smoke"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"
export const maxDuration = 15

export async function POST(request: Request) {
  return handlePreviewCommerceAlertSmoke(request)
}
