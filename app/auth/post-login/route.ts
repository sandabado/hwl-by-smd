import { handlePostLogin } from "@/lib/post-login"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  return handlePostLogin(request)
}
