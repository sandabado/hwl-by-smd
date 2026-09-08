"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"

import type { BookingPillarId, BookingService } from "@/lib/booking-services"

export type BookingShelfSelection = Readonly<{
  categoryLabel: string
  pillarId: BookingPillarId
  service: BookingService
}>

type BookingShelfContextValue = {
  changeService: () => void
  closeBookingShelf: () => void
  completeSelection: () => void
  isOpen: boolean
  removeSelection: () => void
  selectService: (selection: BookingShelfSelection) => void
  selected: BookingShelfSelection | null
  setBookingShelfOpen: (open: boolean) => void
}

const BookingShelfContext = createContext<BookingShelfContextValue | null>(null)

export function BookingShelfProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<BookingShelfSelection | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [announcement, setAnnouncement] = useState({ message: "", nonce: 0 })
  const returnFocusRef = useRef<HTMLElement | null>(null)

  const announce = useCallback((message: string) => {
    setAnnouncement((current) => ({
      message,
      nonce: current.nonce + 1,
    }))
  }, [])

  const rememberFocus = useCallback(() => {
    if (document.activeElement instanceof HTMLElement) {
      returnFocusRef.current = document.activeElement
    }
  }, [])

  const restoreFocus = useCallback(() => {
    const target =
      returnFocusRef.current ??
      Array.from(
        document.querySelectorAll<HTMLElement>("[data-booking-trigger]")
      ).find((element) => element.offsetParent !== null)

    returnFocusRef.current = null
    if (!target?.isConnected) return

    window.requestAnimationFrame(() => target.focus())
  }, [])

  const selectService = useCallback(
    (selection: BookingShelfSelection) => {
      rememberFocus()
      setSelected(selection)
      setIsOpen(true)
      announce(
        `${selection.service.title} selected. Review the session details before choosing a time.`
      )
    },
    [announce, rememberFocus]
  )

  const closeBookingShelf = useCallback(() => {
    setIsOpen(false)
    restoreFocus()
  }, [restoreFocus])

  const setBookingShelfOpen = useCallback(
    (open: boolean) => {
      if (open) {
        rememberFocus()
        setIsOpen(true)
        return
      }

      setIsOpen(false)
      restoreFocus()
    },
    [rememberFocus, restoreFocus]
  )

  const removeSelection = useCallback(() => {
    const title = selected?.service.title
    setSelected(null)
    announce(
      title
        ? `${title} removed from your session shelf.`
        : "Your session shelf is empty."
    )
  }, [announce, selected?.service.title])

  const changeService = useCallback(() => {
    setSelected(null)
    setIsOpen(false)
    announce("Session selection cleared. Choose another service.")
    restoreFocus()
  }, [announce, restoreFocus])

  const completeSelection = useCallback(() => {
    setSelected(null)
    setIsOpen(false)
    returnFocusRef.current = null
  }, [])

  const value = useMemo(
    () => ({
      changeService,
      closeBookingShelf,
      completeSelection,
      isOpen,
      removeSelection,
      selectService,
      selected,
      setBookingShelfOpen,
    }),
    [
      changeService,
      closeBookingShelf,
      completeSelection,
      isOpen,
      removeSelection,
      selectService,
      selected,
      setBookingShelfOpen,
    ]
  )

  return (
    <BookingShelfContext.Provider value={value}>
      {children}
      <span
        aria-atomic="true"
        aria-live="polite"
        className="sr-only"
        key={announcement.nonce}
      >
        {announcement.message}
      </span>
    </BookingShelfContext.Provider>
  )
}

export function useBookingShelf() {
  const bookingShelf = useContext(BookingShelfContext)

  if (!bookingShelf) {
    throw new Error("useBookingShelf must be used inside BookingShelfProvider.")
  }

  return bookingShelf
}
