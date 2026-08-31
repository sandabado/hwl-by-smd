"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { usePathname } from "next/navigation"

const CART_STORAGE_KEY = "hwl-cart-v1"
const CHECKOUT_ATTEMPT_PATTERN = /^[a-zA-Z0-9-]{16,80}$/

type CartContextValue = {
  addLift: () => void
  checkoutAttemptId: string | null
  checkoutCancelled: boolean
  checkoutReady: boolean
  clearCart: () => void
  closeCart: () => void
  hasLift: boolean
  isOpen: boolean
  openCart: () => void
  removeLift: () => void
  setCartOpen: (open: boolean) => void
}

type StoredCart = {
  checkoutAttemptId: string
  items: ["lift_guide"]
  version: 1
}

const CartContext = createContext<CartContextValue | null>(null)

function createCheckoutAttemptId() {
  return typeof window.crypto.randomUUID === "function"
    ? window.crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2).padEnd(12, "0")}`
}

function readStoredCart(value: string | null) {
  if (!value) return { checkoutAttemptId: null, hasLift: false }

  try {
    const parsed = JSON.parse(value) as Partial<StoredCart>
    const hasLift =
      parsed.version === 1 &&
      Array.isArray(parsed.items) &&
      parsed.items.length === 1 &&
      parsed.items[0] === "lift_guide"
    if (!hasLift) return { checkoutAttemptId: null, hasLift: false }

    const checkoutAttemptId =
      typeof parsed.checkoutAttemptId === "string" &&
      CHECKOUT_ATTEMPT_PATTERN.test(parsed.checkoutAttemptId)
        ? parsed.checkoutAttemptId
        : createCheckoutAttemptId()
    return { checkoutAttemptId, hasLift: true }
  } catch {
    return { checkoutAttemptId: null, hasLift: false }
  }
}

function writeStoredCart(
  hasLift: boolean,
  checkoutAttemptId: string | null = null
) {
  try {
    if (hasLift && checkoutAttemptId) {
      const storedCart: StoredCart = {
        checkoutAttemptId,
        items: ["lift_guide"],
        version: 1,
      }
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(storedCart))
    } else {
      window.localStorage.removeItem(CART_STORAGE_KEY)
    }
  } catch {
    // The cart remains usable for this visit when storage is blocked.
  }
}

export function CartProvider({
  checkoutReady,
  children,
}: {
  checkoutReady: boolean
  children: ReactNode
}) {
  const pathname = usePathname()
  const [hasLift, setHasLift] = useState(false)
  const [checkoutAttemptId, setCheckoutAttemptId] = useState<string | null>(
    null
  )
  const [hydrated, setHydrated] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [checkoutCancelled, setCheckoutCancelled] = useState(false)
  const [announcement, setAnnouncement] = useState({ message: "", nonce: 0 })
  const returnFocusRef = useRef<HTMLElement | null>(null)

  const announce = useCallback((message: string) => {
    setAnnouncement((current) => ({ message, nonce: current.nonce + 1 }))
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
        document.querySelectorAll<HTMLElement>("[data-cart-trigger]")
      ).find((element) => element.offsetParent !== null)
    returnFocusRef.current = null

    if (!target?.isConnected) return
    window.requestAnimationFrame(() => target.focus())
  }, [])

  const openCart = useCallback(() => {
    rememberFocus()
    setIsOpen(true)
  }, [rememberFocus])

  const closeCart = useCallback(() => {
    setIsOpen(false)
    restoreFocus()
  }, [restoreFocus])

  const setCartOpen = useCallback(
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

  const addLift = useCallback(() => {
    const nextAttemptId =
      hasLift && checkoutAttemptId
        ? checkoutAttemptId
        : createCheckoutAttemptId()
    setCheckoutCancelled(false)
    announce(
      hasLift ? "LIFT is already in your cart." : "LIFT added to your cart."
    )
    writeStoredCart(true, nextAttemptId)
    setCheckoutAttemptId(nextAttemptId)
    setHasLift(true)
    openCart()
  }, [announce, checkoutAttemptId, hasLift, openCart])

  const removeLift = useCallback(() => {
    setCheckoutCancelled(false)
    writeStoredCart(false)
    setCheckoutAttemptId(null)
    setHasLift(false)
    announce("LIFT removed. Your cart is empty.")
  }, [announce])

  const clearCart = useCallback(() => {
    setCheckoutCancelled(false)
    writeStoredCart(false)
    setCheckoutAttemptId(null)
    setHasLift(false)
    setIsOpen(false)
  }, [])

  useEffect(() => {
    let active = true

    window.queueMicrotask(() => {
      if (!active) return

      try {
        const storedCart = readStoredCart(
          window.localStorage.getItem(CART_STORAGE_KEY)
        )
        setCheckoutAttemptId(storedCart.checkoutAttemptId)
        setHasLift(storedCart.hasLift)
      } catch {
        setCheckoutAttemptId(null)
        setHasLift(false)
      }
      setHydrated(true)
    })

    const syncCart = (event: StorageEvent) => {
      if (event.key !== CART_STORAGE_KEY) return
      const storedCart = readStoredCart(event.newValue)
      setCheckoutAttemptId(storedCart.checkoutAttemptId)
      setHasLift(storedCart.hasLift)
    }

    window.addEventListener("storage", syncCart)
    return () => {
      active = false
      window.removeEventListener("storage", syncCart)
    }
  }, [])

  useEffect(() => {
    if (!hydrated) return

    writeStoredCart(hasLift, checkoutAttemptId)
  }, [checkoutAttemptId, hasLift, hydrated])

  useEffect(() => {
    if (!hydrated) return

    let active = true
    window.queueMicrotask(() => {
      if (!active) return

      const search = new URLSearchParams(window.location.search)
      const shouldOpen = search.get("cart") === "open"
      const wasCancelled = search.get("checkout") === "cancelled"
      if (shouldOpen) {
        setIsOpen(true)
      }
      if (wasCancelled) {
        if (hasLift) {
          const nextAttemptId = createCheckoutAttemptId()
          writeStoredCart(true, nextAttemptId)
          setCheckoutAttemptId(nextAttemptId)
        }
        setCheckoutCancelled(true)
        announce("Checkout canceled. Nothing was charged; your cart is saved.")
      }
      if (shouldOpen || wasCancelled) {
        search.delete("cart")
        search.delete("checkout")
        const query = search.toString()
        window.history.replaceState(
          window.history.state,
          "",
          `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`
        )
      }
    })

    return () => {
      active = false
    }
  }, [announce, hasLift, hydrated, pathname])

  const value = useMemo(
    () => ({
      addLift,
      checkoutAttemptId,
      checkoutCancelled,
      checkoutReady,
      clearCart,
      closeCart,
      hasLift,
      isOpen,
      openCart,
      removeLift,
      setCartOpen,
    }),
    [
      addLift,
      checkoutAttemptId,
      checkoutCancelled,
      checkoutReady,
      clearCart,
      closeCart,
      hasLift,
      isOpen,
      openCart,
      removeLift,
      setCartOpen,
    ]
  )

  return (
    <CartContext.Provider value={value}>
      {children}
      <span
        aria-atomic="true"
        aria-live="polite"
        className="sr-only"
        key={announcement.nonce}
      >
        {announcement.message}
      </span>
    </CartContext.Provider>
  )
}

export function useCart() {
  const cart = useContext(CartContext)
  if (!cart) {
    throw new Error("useCart must be used inside CartProvider.")
  }
  return cart
}
