import { redirect } from "next/navigation"

import { requireAdmin } from "@/lib/admin-auth"

export const dynamic = "force-dynamic"

/**
 * Legacy preview product routes used sample records and disabled controls.
 * The verified Stripe catalog now lives on the parent Payments page, while
 * product mutations remain in Stripe Dashboard.
 */
export default async function AdminProductDetailPage() {
  await requireAdmin()
  redirect("/admin/store")
}
