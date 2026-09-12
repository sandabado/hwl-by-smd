"use server"

import { revalidatePath } from "next/cache"

import {
  handoffShannonAdministratorWithDependencies,
  type ShannonAdminHandoffState,
} from "@/lib/admin-role-handoff"

export async function handoffShannonAdministratorAction(
  _previousState: ShannonAdminHandoffState,
  formData: FormData
): Promise<ShannonAdminHandoffState> {
  const result = await handoffShannonAdministratorWithDependencies(
    formData.get("confirmation")
  )

  if (result.status === "success") {
    revalidatePath("/admin/settings/access")
  }

  return result
}
