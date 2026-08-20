import type { Metadata } from "next"

import { ConnectionHub } from "@/components/member/connection-hub"
import { MemberNavigation } from "@/components/member/member-navigation"
import { requireAccess } from "@/lib/access"
import { getConnectionHubData } from "@/lib/connection-data"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Connection Hub | The Den | HWL by SMD",
  description:
    "Your private journeys, check-ins, and conversations with Shannon.",
  robots: { index: false, follow: false },
}

export default async function ConnectionHubPage() {
  const { access, user } = await requireAccess(
    "membership_only",
    "/the-den/connection"
  )
  const hub = await getConnectionHubData(user.id)

  return (
    <section className="member-atmosphere min-h-screen px-6 py-10 md:py-14">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-xs tracking-[0.3em] text-[var(--accent)] uppercase">
              The Den · Connection Hub
            </p>
            <h1 className="mt-3 text-5xl font-medium text-[var(--primary)] md:text-7xl">
              A conversation,
              <br />
              <em className="font-normal">not a broadcast.</em>
            </h1>
          </div>
          <MemberNavigation hasMembership />
        </div>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[var(--muted-foreground)]">
          Follow your guided journeys, ask questions, and keep Shannon&apos;s
          notes close. This is a quiet line between the two of you.
        </p>
        <div className="mt-12">
          <ConnectionHub
            canDownloadLift={access.canDownloadLift}
            initialData={hub}
          />
        </div>
      </div>
    </section>
  )
}
