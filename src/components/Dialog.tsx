// src/components/Dialog.tsx
// Every modal in the product goes through this.
//
// It renders into <body> through a portal, so no page, card or animation it is
// opened from can clip it, re-anchor it or stack it under the header. (A
// transform or filter left on any ancestor makes `position: fixed` behave like
// `absolute`, which is how a dialog ends up half under the page header.) The
// backdrop itself scrolls, so a dialog taller than the screen is still
// readable from top to bottom. Escape closes it, the page behind stops
// scrolling, and focus returns to wherever it was when the dialog closes.
import { useEffect, useRef, type MouseEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

let openDialogs = 0

export function Dialog({
  open,
  onClose,
  label,
  scope = 'site',
  className = '',
  children,
}: {
  open: boolean
  onClose: () => void
  /** Accessible name, usually the dialog's title. */
  label?: string
  /** Style scope for the portal root (the dialog leaves its page's scope behind). */
  scope?: string
  /** Classes for the panel: width, surface, padding. */
  className?: string
  children: ReactNode
}) {
  const panelRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef(onClose)
  closeRef.current = onClose

  useEffect(() => {
    if (!open) return
    const returnFocus = document.activeElement as HTMLElement | null
    openDialogs += 1
    document.body.style.overflow = 'hidden'
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeRef.current()
    }
    document.addEventListener('keydown', onKey)
    panelRef.current?.focus({ preventScroll: true })
    return () => {
      document.removeEventListener('keydown', onKey)
      openDialogs -= 1
      if (openDialogs === 0) document.body.style.overflow = ''
      returnFocus?.focus?.({ preventScroll: true })
    }
  }, [open])

  if (!open) return null

  const closeOnBackdrop = (event: MouseEvent) => {
    if (event.target === event.currentTarget) closeRef.current()
  }

  return createPortal(
    <div
      className={`${scope} fixed inset-0 z-[1000] overflow-y-auto overscroll-contain bg-black/70 backdrop-blur-sm`}
      onMouseDown={closeOnBackdrop}
    >
      <div className="flex min-h-full items-start justify-center p-4 sm:items-center sm:p-6" onMouseDown={closeOnBackdrop}>
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={label}
          tabIndex={-1}
          className={`dialog-in relative w-full outline-none ${className}`}
        >
          {children}
        </div>
      </div>
    </div>,
    document.body,
  )
}
