"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import {
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  MapPin,
  X,
} from "lucide-react"

import { useBookingShelf } from "@/components/booking/booking-shelf-provider"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet"
import { getBookingServiceAction } from "@/lib/booking-services"

export function BookingShelf() {
  const {
    changeService,
    closeBookingShelf,
    completeSelection,
    isOpen,
    removeSelection,
    selected,
    setBookingShelfOpen,
  } = useBookingShelf()
  const titleRef = useRef<HTMLHeadingElement>(null)
  const emptyStateRef = useRef<HTMLDivElement>(null)
  const previouslyHadSelection = useRef(Boolean(selected))
  const action = selected ? getBookingServiceAction(selected.service) : null
  const hasLiveCalendar =
    selected?.service.calendarBooking.kind === "exact-event"

  useEffect(() => {
    if (isOpen && previouslyHadSelection.current && !selected) {
      window.requestAnimationFrame(() => emptyStateRef.current?.focus())
    }

    previouslyHadSelection.current = Boolean(selected)
  }, [isOpen, selected])

  return (
    <Sheet open={isOpen} onOpenChange={setBookingShelfOpen}>
      <SheetContent
        className="hwl-transaction-sheet z-[70] h-[100dvh] w-full gap-0 border-l border-[#d8c9b8] bg-[#faf7f2] p-0 text-[#2b2724] shadow-[-24px_0_80px_rgba(29,24,20,0.2)] data-[side=right]:w-full motion-reduce:animate-none motion-reduce:transition-none sm:max-w-[30rem]"
        id="site-booking-sheet"
        onCloseAutoFocus={(event) => event.preventDefault()}
        onOpenAutoFocus={(event) => {
          event.preventDefault()
          titleRef.current?.focus()
        }}
        overlayClassName="z-[65] bg-black/35 duration-200 supports-backdrop-filter:backdrop-blur-sm motion-reduce:animate-none motion-reduce:transition-none"
        showCloseButton={false}
        side="right"
      >
        <header className="relative shrink-0 border-b border-[#dfd3c6] px-6 pt-[max(1.5rem,env(safe-area-inset-top))] pb-5">
          <p className="text-[10px] font-semibold tracking-[0.24em] text-[#765538] uppercase">
            {selected ? "Selected for your visit" : "Your session shelf"}
          </p>
          <SheetTitle
            className="mt-2 pr-14 font-serif text-3xl font-medium text-[#2b2724] outline-none"
            ref={titleRef}
            tabIndex={-1}
          >
            {selected ? "Review your session" : "Choose a session"}
          </SheetTitle>
          <SheetDescription className="mt-2 text-sm leading-relaxed text-[#675b4d]">
            {selected
              ? hasLiveCalendar
                ? "Confirm the details, then see Shannon’s live dates and open times."
                : "Confirm the details, then share the timing your group needs."
              : "Select a Beauty, Body, or Being session to begin."}
          </SheetDescription>
          <Button
            aria-label="Close session shelf"
            className="absolute top-[max(1.25rem,env(safe-area-inset-top))] right-4 size-11 rounded-full text-[#2b2724] hover:bg-[#eee5da]"
            onClick={closeBookingShelf}
            size="icon-lg"
            type="button"
            variant="ghost"
          >
            <X aria-hidden="true" className="size-5" />
          </Button>
        </header>

        <div className="hwl-transaction-sheet__body min-h-0 flex-1 overflow-y-auto px-6 py-6">
          {selected ? (
            <div className="space-y-6">
              <article className="border-b border-[#dfd3c6] pb-6">
                <div className="flex items-start justify-between gap-4">
                  <p className="text-[10px] font-semibold tracking-[0.2em] text-[#765538] uppercase">
                    {selected.categoryLabel} session
                  </p>
                  <span className="rounded-full border border-[#d8c9b8] bg-white/55 px-3 py-1 text-[10px] font-medium tracking-[0.12em] text-[#675b4d] uppercase">
                    {selected.service.format}
                  </span>
                </div>

                <h3 className="mt-4 font-serif text-3xl leading-tight text-[#2b2724]">
                  {selected.service.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[#675b4d]">
                  {selected.service.description}
                </p>

                <dl className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-[#dfd3c6] bg-white/55 p-4">
                    <dt className="text-[10px] font-semibold tracking-[0.16em] text-[#765538] uppercase">
                      Session price
                    </dt>
                    <dd className="mt-2 font-serif text-2xl text-[#2b2724]">
                      {selected.service.price}
                    </dd>
                  </div>
                  <div className="rounded-2xl border border-[#dfd3c6] bg-white/55 p-4">
                    <dt className="flex items-center gap-2 text-[10px] font-semibold tracking-[0.16em] text-[#765538] uppercase">
                      <Clock3 aria-hidden="true" className="size-3.5" />
                      Time
                    </dt>
                    <dd className="mt-2 text-sm leading-6 text-[#2b2724]">
                      {selected.service.duration}
                    </dd>
                  </div>
                </dl>

                <button
                  className="mt-4 min-h-11 text-xs font-medium text-[#765538] underline decoration-[#765538]/35 underline-offset-4 hover:decoration-[#765538]"
                  onClick={removeSelection}
                  type="button"
                >
                  Remove selection
                </button>
              </article>

              <section
                aria-labelledby="booking-shelf-next-step"
                className="rounded-2xl border border-[#b79261]/25 bg-[#f4e8d6] p-5"
              >
                <span className="grid size-10 place-items-center rounded-full bg-white/60 text-[#765538]">
                  {hasLiveCalendar ? (
                    <CalendarDays aria-hidden="true" className="size-4.5" />
                  ) : (
                    <MapPin aria-hidden="true" className="size-4.5" />
                  )}
                </span>
                <h3
                  className="mt-4 font-serif text-xl text-[#2b2724]"
                  id="booking-shelf-next-step"
                >
                  {hasLiveCalendar
                    ? "Next: choose a date and time"
                    : "Next: tell Shannon about your group"}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#675b4d]">
                  {hasLiveCalendar
                    ? "Shannon’s current dates and open times appear on the next step in your local timezone. Every request remains pending until Shannon confirms it."
                    : "This group ritual is arranged by inquiry because timing depends on the group. Nothing is reserved until Shannon confirms it with you."}
                </p>
              </section>

              <ul className="space-y-3 text-sm text-[#51483f]">
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-[#52694d]/10 text-[#52694d]">
                    <Check aria-hidden="true" className="size-3" />
                  </span>
                  <span className="leading-relaxed">
                    Your service choice carries into the next step.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-[#52694d]/10 text-[#52694d]">
                    <Check aria-hidden="true" className="size-3" />
                  </span>
                  <span className="leading-relaxed">
                    No payment is collected when you request a time.
                  </span>
                </li>
              </ul>
            </div>
          ) : (
            <div
              className="flex min-h-full flex-col items-center justify-center py-12 text-center outline-none"
              ref={emptyStateRef}
              tabIndex={-1}
            >
              <span className="grid size-16 place-items-center rounded-full bg-[#eee5da] text-[#765538]">
                <CalendarDays aria-hidden="true" className="size-6" />
              </span>
              <h3 className="mt-6 font-serif text-3xl text-[#2b2724]">
                No session selected.
              </h3>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-[#675b4d]">
                Return to the service shelf and choose the care that meets the
                moment.
              </p>
              <Button
                className="mt-7 h-11 rounded-full bg-[#2b2724] px-6 text-white hover:bg-[#765538]"
                onClick={closeBookingShelf}
                type="button"
              >
                Continue browsing
              </Button>
            </div>
          )}
        </div>

        {selected && action ? (
          <footer
            className="shrink-0 border-t border-[#d8c9b8] bg-[#f7f1e9] px-6 pt-5"
            style={{
              paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))",
            }}
          >
            <Button
              asChild
              className="h-12 w-full rounded-full bg-[#2b2724] px-6 text-white hover:bg-[#765538]"
            >
              <Link href={action.href} onClick={completeSelection}>
                {hasLiveCalendar ? "See available dates & times" : action.label}
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </Button>
            <Button
              className="mt-2 h-11 w-full rounded-full text-[#765538] hover:bg-[#eee5da]"
              onClick={changeService}
              type="button"
              variant="ghost"
            >
              Choose a different service
            </Button>
            <p className="mt-3 text-center text-[11px] leading-5 text-[#675b4d]">
              {hasLiveCalendar
                ? "Available times are shown securely by Cal.com. Shannon confirms every appointment personally."
                : "Your group request goes directly to Shannon for personal follow-up and confirmation."}
            </p>
          </footer>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
