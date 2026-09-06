// src/components/app/StatsRow.tsx
import { C, displayFont } from './shared'

interface StatsRowProps {
  totalVolume: number
  settled: number
  total: number
  centered?: boolean
}

// Volume tile is hidden until a real (non-zero) value exists, so we never show
// a permanently-$0 stat.
export function StatsRow({ totalVolume, settled, total, centered = false }: StatsRowProps) {
  const tiles = [
    ...(totalVolume > 0 ? [{ val: `$${totalVolume.toFixed(0)}`, lbl: 'Volume' }] : []),
    { val: settled, lbl: 'Settled' },
    { val: total, lbl: 'Total' },
  ]

  return (
    <div style={{ display: 'flex', gap: centered ? '1rem' : '1.5rem' }}>
      {tiles.map(s => (
        <div
          key={s.lbl}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.15rem',
            ...(centered
              ? { flex: 1, alignItems: 'center', textAlign: 'center' as const }
              : {}),
          }}
        >
          <div
            style={{
              ...displayFont,
              fontSize: centered ? '1.1rem' : '0.95rem',
              fontWeight: 700,
              color: C.hi,
              letterSpacing: '-0.02em',
            }}
          >
            {s.val}
          </div>
          <div
            style={{
              fontSize: '0.58rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: C.muted,
            }}
          >
            {s.lbl}
          </div>
        </div>
      ))}
    </div>
  )
}
