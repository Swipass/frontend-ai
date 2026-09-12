// src/components/app/BottomSheet.tsx
import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from './shared'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  maxHeight?: string
}

export function BottomSheet({ open, onClose, title, children, maxHeight = '88vh' }: BottomSheetProps) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  // Rendered into <body> like every dialog, so no ancestor can clip or re-anchor it.
  return createPortal(
    <div className="site">
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 z-[400] bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />
      <div
        // A closed sheet stays mounted (so it can slide), but is not a dialog.
        role={open ? 'dialog' : undefined}
        aria-modal={open ? true : undefined}
        aria-hidden={!open}
        aria-label={title}
        className="fixed inset-x-0 bottom-0 z-[401] flex flex-col overflow-hidden rounded-t-[28px] border-t border-white/[0.1] bg-[#0d0d0d]/95 backdrop-blur-2xl transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          maxHeight,
          transform: open ? 'translateY(0)' : 'translateY(100%)',
          boxShadow: '0 -30px 80px -40px rgba(0,0,0,1)',
        }}
      >
        <div className="flex shrink-0 flex-col items-center px-5 pt-3">
          <div className="mb-3 h-1 w-10 rounded-full bg-white/20" />
          <div className="flex w-full items-center justify-between border-b border-white/[0.06] pb-3">
            <span className="kicker">{title}</span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="grid h-9 w-9 place-items-center rounded-full border border-white/[0.1] text-[color:var(--ink-2)]"
            >
              <Icon.Close size={14} />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-5 pt-4" style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))' }}>
          {children}
        </div>
      </div>
    </div>,
    document.body,
  )
}
