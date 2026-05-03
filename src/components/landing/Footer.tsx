// src/components/landing/Footer.tsx
import { Link } from 'react-router-dom'

const links = [
  ['Docs', '/docs'], ['Dashboard', '/dashboard'], ['GitHub', '#'], ['Discord', '#'], ['Privacy', '#'], ['Terms', '#'],
]

export function Footer() {
  return (
    <footer className="border-t border-dark-grey-3 py-8 md:py-12 px-6 bg-deepest-dark relative z-10">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <div className="flex items-center gap-2 font-display text-lg font-bold text-almost-white mb-2">
            Swipass
          </div>
          <div className="text-xs text-light-grey-1">© {new Date().getFullYear()} Swipass. All rights reserved.</div>
        </div>
        <ul className="flex flex-wrap justify-center gap-6 text-xs uppercase tracking-wide text-light-grey-1">
          {links.map(([label, href]) => (
            <li key={label}><Link to={href} className="hover:text-light-grey-3 transition-colors">{label}</Link></li>
          ))}
        </ul>
      </div>
    </footer>
  )
}