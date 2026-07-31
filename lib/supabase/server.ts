import "server-only"

import { createServerClient } from "@supabase/ssr"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

import {
  isSupabaseAdminConfigured,
  isSupabaseConfigured,
  publicEnv,
} from "@/lib/env"

export async function createClient() {
  if (!isSupabaseConfigured()) {
    return null
  }

  const cookieStore = await cookies()

  return createServerClient(publicEnv.supabaseUrl!, publicEnv.supabaseKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Server Components cannot write cookies. The root proxy refreshes
          // sessions before rendering and handles the write when needed.
        }
      },
    },
  })
}

export function createAdminClient() {
  if (!isSupabaseAdminConfigured()) {
    return null
  }

  return createSupabaseClient(
    publicEnv.supabaseUrl!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
