// src/site/ui.tsx
// Primitives of the public site design system.
import { useRef, type CSSProperties, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useInView } from './hooks'
import './site.css'

export function ArrowUpRight({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M5 11 11 5M6 5h5v5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function ArrowRight({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** Fades and lifts its children in when they scroll into view. */
export function Reveal({
  children,
  delay = 0,
  className = '',
  as: Tag = 'div',
}: {
  children: ReactNode
  delay?: number
  className?: string
  as?: 'div' | 'section' | 'li' | 'span'
}) {
  const ref = useRef<HTMLDivElement>(null)
  const shown = useInView(ref)
  const style = { '--reveal-delay': `${delay}ms` } as CSSProperties
  return (
    <Tag ref={ref as never} data-reveal={shown ? 'shown' : 'hidden'} style={style} className={className}>
      {children}
    </Tag>
  )
}

type PillVariant = 'light' | 'dark' | 'outline'

/** A pill button that routes internally, or opens an external URL. */
export function PillLink({
  to,
  variant = 'light',
  arrow = false,
  className = '',
  children,
}: {
  to: string
  variant?: PillVariant
  arrow?: boolean
  className?: string
  children: ReactNode
}) {
  const classes = `pill pill-${variant} ${className}`
  const content = (
    <>
      {children}
      {arrow && <ArrowUpRight />}
    </>
  )
  if (/^https?:\/\//.test(to)) {
    return (
      <a href={to} className={classes} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    )
  }
  return (
    <Link to={to} className={classes}>
      {content}
    </Link>
  )
}

/** Kicker, headline and optional lead paragraph for a section. */
export function SectionIntro({
  kicker,
  title,
  body,
  align = 'left',
  className = '',
}: {
  kicker: string
  title: ReactNode
  body?: ReactNode
  align?: 'left' | 'center'
  className?: string
}) {
  const centered = align === 'center'
  return (
    <div className={`${centered ? 'text-center mx-auto' : ''} max-w-3xl ${className}`}>
      <Reveal>
        <div className="kicker mb-5">{kicker}</div>
      </Reveal>
      <Reveal delay={80}>
        <h2 className="text-[2.1rem] leading-[1.05] sm:text-5xl md:text-[3.4rem] font-light tracking-[-0.035em] text-[color:var(--ink)]">
          {title}
        </h2>
      </Reveal>
      {body && (
        <Reveal delay={160}>
          <p className={`mt-6 text-[0.95rem] sm:text-base leading-relaxed text-[color:var(--ink-3)] ${centered ? 'mx-auto' : ''} max-w-xl`}>
            {body}
          </p>
        </Reveal>
      )}
    </div>
  )
}
