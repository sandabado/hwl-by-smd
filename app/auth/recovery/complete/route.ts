import { cookies } from "next/headers"

import { completePasswordRecovery } from "@/lib/password-recovery"
import { createClient } from "@/lib/supabase/server"

export function POST(request: Request) {
  return completePasswordRecovery(request, {
    createClient,
    getCookieStore: cookies,
  })
}
