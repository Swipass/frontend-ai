// src/pages/NotFoundPage.tsx
// Unknown URLs get Vercel's 404.html with a real 404 status, and this is what
// that page (or any unknown client-side route) renders. It used to redirect to
// the landing page, which search engines read as a soft 404.
import { Link } from 'react-router-dom'
import { Wordmark } from '../components/Logo'

export default function NotFoundPage() {
  return (
    <main className="min-h-screen bg-deepest-dark flex flex-col items-center justify-center text-center px-6 relative z-10">
      <Link to="/" className="text-almost-white mb-12">
        <Wordmark textClassName="text-2xl" />
      </Link>
      <div className="section-label mb-6">404</div>
      <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tighter text-almost-white leading-tight">
        Page not <span className="font-serif italic font-normal text-light-grey-2">found</span>
      </h1>
      <p className="mt-5 text-sm text-light-grey-1 max-w-sm leading-relaxed">
        The page you asked for does not exist or has moved.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 mt-9">
        <Link to="/app" className="sw-btn sw-btn-primary">Launch App</Link>
        <Link to="/" className="sw-btn sw-btn-ghost">Back to Home</Link>
      </div>
    </main>
  )
}
