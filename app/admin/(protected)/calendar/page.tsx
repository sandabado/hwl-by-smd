import { CalendarDays, Cloud, Clock3, Plus } from "lucide-react"

import {
  AdminPageHeader,
  AdminPanel,
  PanelHeading,
  PreviewPill,
  ReadOnlyButton,
  StatusPill,
} from "@/components/admin/admin-ui"
import { adminBookings } from "@/lib/admin-preview-data"
import { requireAdmin } from "@/lib/admin-auth"
import { getCalcomPublicEventTypes } from "@/lib/calcom"

export const dynamic = "force-dynamic"

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const
const calendarCells: Array<number | null> = [
  ...Array.from({ length: 6 }, () => null),
  ...Array.from({ length: 31 }, (_, index) => index + 1),
  ...Array.from({ length: 5 }, () => null),
]

const calendarEvents: Record<
  number,
  Array<{ label: string; tone: "beauty" | "movement" | "ritual" }>
> = {
  4: [{ label: "9:00 · Private yoga", tone: "movement" }],
  7: [{ label: "11:30 · Consultation", tone: "ritual" }],
  12: [{ label: "10:00 · Beauty ritual", tone: "beauty" }],
  18: [{ label: "1:30 · Sound bath", tone: "movement" }],
  22: [{ label: "4:00 · Coaching", tone: "ritual" }],
}

const eventTones = {
  beauty: "border-[#c5b39b] bg-[#c5b39b]/18 text-[#79644c]",
  movement: "border-[#84927d] bg-[#84927d]/15 text-[#586953]",
  ritual: "border-[#947582] bg-[#947582]/14 text-[#765b67]",
} as const

export default async function AdminCalendarPage() {
  await requireAdmin()
  const calcom = await getCalcomPublicEventTypes()
  const calProfileLinked = calcom.status === "available"
  const calPublishedEventCount = calcom.eventTypes.length

  return (
    <>
      <AdminPageHeader
        description="A spacious calendar for private work, group experiences, consultations, and protected rest."
        eyebrow="Time"
        title="Calendar"
      >
        <ReadOnlyButton>
          <Plus className="mr-2 inline size-3.5" aria-hidden="true" />
          Block time
        </ReadOnlyButton>
      </AdminPageHeader>

      <div className="mt-8 grid gap-5 2xl:grid-cols-[1.45fr_0.55fr]">
        <AdminPanel>
          <div className="flex flex-col justify-between gap-4 border-b border-[#ddd7cd] pb-5 sm:flex-row sm:items-center">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.2em] text-[#9d8464] uppercase">
                Sample month
              </p>
              <h2 className="mt-1 text-3xl">August 2026</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[#273029] px-4 py-2 text-xs text-white">
                Month
              </span>
              <ReadOnlyButton compact>Week</ReadOnlyButton>
              <ReadOnlyButton compact>Day</ReadOnlyButton>
              <PreviewPill />
            </div>
          </div>

          <div className="mt-5 overflow-x-auto">
            <div className="min-w-[760px]">
              <div className="grid grid-cols-7 border-y border-l border-[#d8d1c5]">
                {weekdays.map((day) => (
                  <div
                    className="border-r border-[#d8d1c5] px-3 py-2 text-center text-[9px] font-semibold tracking-[0.15em] text-[#838a83] uppercase"
                    key={day}
                  >
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 border-l border-[#d8d1c5]">
                {calendarCells.map((day, index) => (
                  <div
                    className="min-h-28 border-r border-b border-[#d8d1c5] bg-white/18 p-2"
                    key={`${day ?? "blank"}-${index}`}
                  >
                    {day && (
                      <>
                        <span className="text-[10px] text-[#727b72]">
                          {day}
                        </span>
                        <div className="mt-2 space-y-1.5">
                          {calendarEvents[day]?.map((event) => (
                            <div
                              className={`rounded-lg border px-2 py-1.5 text-[9px] leading-4 ${eventTones[event.tone]}`}
                              key={event.label}
                            >
                              {event.label}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-4 text-[10px] text-[#717a71]">
            <span className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-[#c5b39b]" />
              Beauty
            </span>
            <span className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-[#84927d]" />
              Movement
            </span>
            <span className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-[#947582]" />
              Ritual & coaching
            </span>
          </div>
        </AdminPanel>

        <div className="space-y-5">
          <AdminPanel>
            <PanelHeading
              detail="Public Cal.com booking profile"
              eyebrow="Booking"
              title="Cal.com status"
            />
            <div className="mt-5 flex items-center justify-between gap-3 rounded-2xl bg-[#f6f1e8]/60 p-4">
              <div className="flex items-center gap-3">
                <Cloud className="size-4 text-[#788178]" aria-hidden="true" />
                <span className="text-sm">HWL by SMD profile</span>
              </div>
              <StatusPill
                tone={
                  calProfileLinked && calPublishedEventCount > 0
                    ? "positive"
                    : "warning"
                }
              >
                {calProfileLinked && calPublishedEventCount > 0
                  ? "Live"
                  : calProfileLinked
                    ? "Setup needed"
                    : "Check needed"}
              </StatusPill>
            </div>
            <p className="mt-4 text-xs leading-5 text-[#7a827a]">
              {calProfileLinked
                ? `${calPublishedEventCount} published event ${calPublishedEventCount === 1 ? "type is" : "types are"} currently visible on the public profile. `
                : "The public profile could not be checked right now. "}
              This sample calendar does not read or change Shannon&apos;s
              personal calendars.
            </p>
          </AdminPanel>

          <AdminPanel>
            <div className="flex items-center justify-between gap-3">
              <PanelHeading eyebrow="Selected day" title="August 4" />
              <CalendarDays
                className="size-4 text-[#9d8464]"
                aria-hidden="true"
              />
            </div>
            <div className="mt-5 space-y-3">
              {adminBookings.slice(4).map((booking) => (
                <div
                  className="rounded-2xl border border-[#ddd7cd] bg-white/28 p-4"
                  key={booking.id}
                >
                  <p className="flex items-center gap-2 text-xs text-[#7b837b]">
                    <Clock3 className="size-3.5" aria-hidden="true" />
                    {booking.time} · {booking.duration}
                  </p>
                  <p className="mt-2 text-sm font-medium">{booking.service}</p>
                  <p className="mt-1 text-xs text-[#7b837b]">
                    {booking.client}
                  </p>
                </div>
              ))}
            </div>
          </AdminPanel>
        </div>
      </div>
    </>
  )
}
