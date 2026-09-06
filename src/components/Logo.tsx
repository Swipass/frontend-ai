// src/components/Logo.tsx
// The Swipass logo. The mark is two "i" stems capped by a single upward star
// point (only the top point of the star; the other points are omitted). The
// wordmark is "Swipass" with its "i" replaced by that stem-and-point glyph.
// Everything is monochrome and uses currentColor so it adapts to any surface.

export function LogoMark({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <rect x="23.5" y="31" width="5.5" height="19" rx="2.75" />
      <rect x="35" y="31" width="5.5" height="19" rx="2.75" />
      <path d="M32 8 C 33 19 34 26 40 31 L 24 31 C 30 26 31 19 32 8 Z" />
    </svg>
  )
}

// The branded lowercase "i": a stem capped by the upward star point. Scales with
// the surrounding font size (height in em) and sits on the text baseline.
function IGlyph() {
  return (
    <svg
      viewBox="0 0 22 52"
      fill="currentColor"
      aria-hidden="true"
      style={{ height: '1.04em', width: 'auto', margin: '0 -0.015em', transform: 'translateY(0.02em)' }}
    >
      <rect x="7.5" y="28" width="7" height="24" rx="3.2" />
      <path d="M11 4 C 11.7 18 12.2 23 16.5 27 L 5.5 27 C 9.8 23 10.3 18 11 4 Z" />
    </svg>
  )
}

// The full wordmark: "Sw" + branded "i" + "pass".
export function Wordmark({
  textClassName = 'text-lg',
  className = '',
}: {
  textClassName?: string
  className?: string
}) {
  return (
    <span
      className={`inline-flex items-baseline font-display font-extrabold tracking-tighter ${textClassName} ${className}`}
      aria-label="Swipass"
    >
      <span>Sw</span>
      <IGlyph />
      <span>pass</span>
    </span>
  )
}

// Backwards-compatible default: the wordmark.
export function Logo(props: { textClassName?: string; className?: string }) {
  return <Wordmark {...props} />
}
