// src/components/app/HistoryContent.tsx
import React from 'react'
import { C, Icon } from './shared'

interface HistoryContentProps {
  commandHistory: any[]
}

export function HistoryContent({ commandHistory }: HistoryContentProps) {
  if (commandHistory.length === 0)
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          padding: '3rem 1.5rem',
          color: C.mid,
          textAlign: 'center',
        }}
      >
        <div style={{ opacity: 0.3 }}>
          <Icon.Clock size={32} />
        </div>
        <p style={{ fontSize: '0.78rem', lineHeight: 1.5, margin: 0, color: C.muted }}>
          Your command history
          <br />
          will appear here
        </p>
      </div>
    )

  return (
    <>
      {commandHistory.map((item, i) => (
        <div
          key={item.id}
          style={{
            padding: '0.9rem 0',
            borderBottom: `1px solid ${C.border}`,
            borderLeft: i === 0 ? `2px solid ${C.label}` : '2px solid transparent',
            paddingLeft: '0.75rem',
            transition: 'all 0.3s',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              marginBottom: '0.35rem',
            }}
          >
            {item.fromChain && (
              <span
                style={{
                  padding: '0.1rem 0.4rem',
                  background: C.surface2,
                  borderRadius: 3,
                  fontSize: '0.62rem',
                  color: C.body,
                }}
              >
                {item.fromChain}
              </span>
            )}
            {item.toChain && (
              <>
                <span style={{ color: C.mid, fontSize: '0.6rem' }}>→</span>
                <span
                  style={{
                    padding: '0.1rem 0.4rem',
                    background: C.surface2,
                    borderRadius: 3,
                    fontSize: '0.62rem',
                    color: C.body,
                  }}
                >
                  {item.toChain}
                </span>
              </>
            )}
          </div>
          <div
            style={{
              fontSize: '0.78rem',
              color: C.label,
              lineHeight: 1.4,
              marginBottom: '0.4rem',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {item.command}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontSize: '0.62rem',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color:
                  item.status === 'completed'
                    ? C.body
                    : item.status === 'failed'
                    ? C.mid
                    : C.muted,
              }}
            >
              <span
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: '50%',
                  flexShrink: 0,
                  background:
                    item.status === 'completed'
                      ? C.body
                      : item.status === 'failed'
                      ? C.mid
                      : C.muted,
                  ...(item.status === 'pending'
                    ? { animation: 'pulseDot 1.5s infinite' }
                    : {}),
                }}
              />
              {item.status}
            </span>
          </div>
        </div>
      ))}
    </>
  )
}