import {
  handleCommerceReconciliationCron,
  runScheduledCommerceReconciliation,
} from "@/lib/commerce/scheduled-reconciliation"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"
export const maxDuration = 60

export async function GET(request: Request) {
  return handleCommerceReconciliationCron(
    request,
    runScheduledCommerceReconciliation
  )
}
