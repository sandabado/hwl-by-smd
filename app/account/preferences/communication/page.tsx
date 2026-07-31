import Link from "next/link"
import type { Metadata } from "next"
import { ArrowLeft, HeartHandshake } from "lucide-react"

import {
  ConnectionPreferencesForm,
  type ConnectionPreferences,
} from "@/components/account/connection-preferences-form"
import { requireAccess } from "@/lib/access"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Connection Preferences | HWL by SMD",
  description: "Choose the cadence and boundaries that feel right for you.",
  robots: { index: false, follow: false },
}

const defaults: ConnectionPreferences = {
  bookingInvites: true,
  guidanceCadence: "weekly",
  shareProgress: true,
}

export default async function CommunicationPreferencesPage() {
  const { user } = await requireAccess(
    "authenticated",
    "/account/preferences/communication"
  )
  const supabase = await createClient()
  const { data } = supabase
    ? await supabase
        .from("connection_preferences")
        .select("guidance_cadence, booking_invites, share_progress")
        .eq("user_id", user.id)
        .maybeSingle()
    : { data: null }

  const initialPreferences: ConnectionPreferences = data
    ? {
        bookingInvites: Boolean(data.booking_invites),
        guidanceCadence:
          data.guidance_cadence === "daily" ||
          data.guidance_cadence === "relevant"
            ? data.guidance_cadence
            : "weekly",
        shareProgress: Boolean(data.share_progress),
      }
    : defaults

  return (
    <section className="member-atmosphere min-h-screen px-6 py-14 md:py-20">
      <div className="mx-auto max-w-4xl">
        <Link
          className="inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)] transition hover:text-[var(--primary)]"
          href="/account"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to account
        </Link>
        <HeartHandshake
          aria-hidden="true"
          className="mt-10 size-6 text-[var(--accent)]"
        />
        <p className="mt-5 text-xs tracking-[0.28em] text-[var(--accent)] uppercase">
          Respect your energy
        </p>
        <h1 className="mt-4 text-5xl font-medium text-[var(--primary)] md:text-7xl">
          Connection preferences
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[var(--muted-foreground)]">
          Choose what feels supportive. You can pause a Journey, change the
          rhythm, or step back at any time—without losing your place.
        </p>
        <div className="mt-12">
          <ConnectionPreferencesForm initialPreferences={initialPreferences} />
        </div>
      </div>
    </section>
  )
}
