// src/components/app/BottomSheet.tsx
import React, { useEffect } from 'react'
import { C, uppercaseLabel, borderBottom, Icon } from './shared'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  maxHeight?: string
}

export function BottomSheet({
  open,
  onClose,
  title,
  children,
  maxHeight = '88vh',
}: BottomSheetProps) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
          zIndex: 400,
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'all' : 'none',
          transition: 'opacity 0.3s',
        }}
      />
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: C.panel,
          borderTop: `1px solid ${C.border}`,
          borderRadius: '16px 16px 0 0',
          zIndex: 401,
          maxHeight,
          transform: open ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.4s cubic-bezier(0.16,1,0.3,1)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '0.75rem 1.25rem 0',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 40,
              height: 4,
              background: C.mid,
              borderRadius: 2,
              marginBottom: '0.75rem',
            }}
          />
          <div
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              ...borderBottom,
              paddingBottom: '0.75rem',
            }}
          >
            <span style={{ ...uppercaseLabel, fontSize: '0.65rem', letterSpacing: '0.14em' }}>
              {title}
            </span>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: C.muted,
                cursor: 'pointer',
                padding: '0.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon.Close size={16} />
            </button>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.25rem 2rem' }}>
          {children}
        </div>
      </div>
    </>
  )
}