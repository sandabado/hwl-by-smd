import { redirect } from "next/navigation"

import { requireAdmin } from "@/lib/admin-auth"

export const dynamic = "force-dynamic"

export default async function LegacyAdminRevenuePage() {
  await requireAdmin()
  redirect("/admin/store")
}
