// src/components/landing/Navbar.tsx
import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const onScroll = () => {
      navRef.current?.classList.toggle('scrolled', window.scrollY > 60)
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navItems = ['Features', 'How It Works', 'Developers', 'Security', 'FAQ']

  return (
    <>
      <nav
        ref={navRef}
        className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 md:px-8 py-4 flex items-center justify-between border-b border-transparent transition-all duration-300 nav-scrolled"
      >
        <style>{`.nav-scrolled.scrolled { background: rgba(10,10,10,0.85); backdrop-filter: blur(20px); border-color: var(--gray-300) !important; padding: 1rem 2rem !important; }`}</style>
        <Link
          to="/"
          className="flex items-center gap-2 font-display text-xl sm:text-2xl font-extrabold text-almost-white tracking-tighter"
        >
          Swipass
        </Link>

        <ul className="hidden md:flex gap-6 lg:gap-8">
          {navItems.map((item) => (
            <li key={item}>
              <a
                href={`#${item.toLowerCase().replace(' ', '-')}`}
                className="text-xs lg:text-sm uppercase tracking-wide text-light-grey-1 hover:text-light-grey-3 transition-colors"
              >
                {item}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden md:flex gap-3">
          <Link to="/docs" className="sw-btn sw-btn-ghost">For Developers</Link>
          <Link to="/app" className="sw-btn sw-btn-primary">Launch App</Link>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-almost-white w-8 h-8 flex items-center justify-center border border-dark-grey-3 rounded"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </nav>

      {mobileMenuOpen && (
        <div className="fixed inset-x-0 top-16 z-50 bg-dark-grey-1 border-b border-dark-grey-3 p-4 md:hidden">
          <ul className="flex flex-col gap-3 mb-4">
            {navItems.map((item) => (
              <li key={item}>
                <a
                  href={`#${item.toLowerCase().replace(' ', '-')}`}
                  className="block py-2 text-sm uppercase tracking-wide text-light-grey-1"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex gap-3">
            <Link to="/docs" className="sw-btn sw-btn-ghost w-full justify-center" onClick={() => setMobileMenuOpen(false)}>For Developers</Link>
            <Link to="/app" className="sw-btn sw-btn-primary w-full justify-center" onClick={() => setMobileMenuOpen(false)}>Launch App</Link>
          </div>
        </div>
      )}
    </>
  )
}