// src/components/landing/Footer.tsx
import { Link } from 'react-router-dom'
import { Wordmark } from '../Logo'

// Internal routes render as react-router Links; external destinations as anchors.
const internalLinks: [string, string][] = [
  ['App', '/app'],
  ['Docs', '/docs'],
  ['Dashboard', '/dashboard'],
]

const externalLinks: [string, string][] = [
  ['GitHub', 'https://github.com/Swipass'],
]

export function Footer() {
  return (
    <footer className="border-t border-dark-grey-3 py-8 md:py-12 px-6 bg-deepest-dark relative z-10">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <div className="flex items-center gap-2 font-display text-lg font-bold text-almost-white mb-2">
            <Wordmark textClassName="text-lg" />
          </div>
          <div className="text-xs text-light-grey-1">© {new Date().getFullYear()} Swipass. All rights reserved.</div>
        </div>
        <ul className="flex flex-wrap justify-center gap-6 text-xs uppercase tracking-wide text-light-grey-1">
          {internalLinks.map(([label, href]) => (
            <li key={label}>
              <Link to={href} className="hover:text-light-grey-3 transition-colors">{label}</Link>
            </li>
          ))}
          {externalLinks.map(([label, href]) => (
            <li key={label}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-light-grey-3 transition-colors"
              >
                {label}
              </a>
            </li>
          ))}
          {/* Discord community is not live yet, so this stays a clearly-labelled placeholder. */}
          <li>
            <span className="text-mid-grey cursor-default" title="Community server coming soon">
              Discord (soon)
            </span>
          </li>
        </ul>
      </div>
    </footer>
  )
}
