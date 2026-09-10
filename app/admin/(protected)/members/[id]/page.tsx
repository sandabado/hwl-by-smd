import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function AdminMemberDetailRedirect({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  redirect(`/admin/clients/${encodeURIComponent(id)}`)
}
