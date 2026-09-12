// src/seo/site.ts
// What Swipass says about itself to search engines, in one place.
//
// The canonical origin is the host that answers 200. On Vercel swipass.com
// redirects to www.swipass.com, so www is canonical. If the primary domain is
// ever flipped to the apex, change `origin` in the same deploy.
//
// Modules in src/seo import each other with explicit .ts extensions because
// scripts/indexnow.ts runs them directly under Node.

export const SITE = {
  origin: 'https://www.swipass.com',
  name: 'Swipass',
  tagline: 'Speak. Swipe. Settle.',
  description:
    'Swipass turns a plain-language command into a cross-chain swap, bridge or send. Connect a wallet, say what you need, and sign one transaction.',
  locale: 'en_US',
  logoPath: '/android-chrome-512x512.png',
  ogImage: {
    path: '/og-image.png',
    width: 1200,
    height: 630,
    alt: 'Swipass: DeFi in plain language. Speak. Swipe. Settle.',
  },
  sameAs: ['https://github.com/Swipass'],
  // Ownership tokens for the search consoles' HTML-tag method. Public by
  // design: they are printed in every page's <head>. The
  // SEO_*_SITE_VERIFICATION build variables override them.
  verification: {
    google: 'LQh5v2PuNcRphRowDnJB2bGIFTDjNujfoE7xqCr2U5g',
    bing: '',
  },
  // IndexNow ownership key. Public by design: the build serves it at /<key>.txt.
  indexNowKey: 'ca4cb2c3aebc0a4d5fa6b11e02bf8164',
} as const

export function absoluteUrl(path: string): string {
  return new URL(path, SITE.origin).toString()
}
