import {
  AdminShell,
  type AdminDeploymentTarget,
} from "@/components/admin/admin-shell"
import { requireAdmin } from "@/lib/admin-auth"

export const dynamic = "force-dynamic"

function getAdminDeploymentTarget(): AdminDeploymentTarget {
  const vercelEnvironment = process.env.VERCEL_ENV

  if (
    vercelEnvironment === "production" ||
    vercelEnvironment === "preview" ||
    vercelEnvironment === "development"
  ) {
    return vercelEnvironment
  }

  if (vercelEnvironment !== undefined) return "unknown"

  if (process.env.NODE_ENV === "development") return "local"
  if (process.env.NODE_ENV === "test") return "test"
  if (process.env.NODE_ENV === "production") return "production-runtime"

  return "unknown"
}

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const access = await requireAdmin()

  return (
    <AdminShell
      adminEmail={access.email}
      adminRole={access.role}
      adminSource={access.source}
      deploymentTarget={getAdminDeploymentTarget()}
    >
      {children}
    </AdminShell>
  )
}
