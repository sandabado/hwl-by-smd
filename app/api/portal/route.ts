import { NextResponse } from "next/server"

import { getAuthenticatedUser } from "@/lib/access"
import { getSiteUrl } from "@/lib/env"
import { createClient } from "@/lib/supabase/server"
import { getStripe } from "@/lib/stripe"

export async function POST(request: Request) {
  const user = await getAuthenticatedUser()
  if (!user) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 })
  }

  const stripe = getStripe()
  const supabase = await createClient()
  if (!stripe || !supabase) {
    return NextResponse.json(
      { error: "Billing is not configured yet." },
      { status: 503 }
    )
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .maybeSingle()
  if (!profile?.stripe_customer_id) {
    return NextResponse.json(
      { error: "No billing profile was found." },
      { status: 404 }
    )
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${getSiteUrl(request.url)}/account`,
  })

  return NextResponse.json({ url: session.url })
}
