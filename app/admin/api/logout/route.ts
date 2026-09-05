import { handleAdminLogout } from "@/lib/admin-logout"

export async function POST(request: Request) {
  return handleAdminLogout(request)
}
