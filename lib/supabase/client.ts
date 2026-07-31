"use client"

import { createBrowserClient } from "@supabase/ssr"

import { publicEnv } from "@/lib/env"

export function createClient() {
  if (!publicEnv.supabaseUrl || !publicEnv.supabaseKey) {
    return null
  }

  return createBrowserClient(publicEnv.supabaseUrl, publicEnv.supabaseKey)
}
