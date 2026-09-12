// src/seo/pages.ts
// The route registry for search. Every route the build emits HTML for is
// listed here once; the sitemap, each route's <head>, the crawler snapshot,
// the structured data and IndexNow submissions are all derived from it.
// Adding a public page means an entry here plus its <Route> in App.tsx.

export type SchemaBlock = 'webApplication' | 'faq' | 'techArticle' | 'breadcrumbs'
export type SnapshotBlock = 'features' | 'faq'

export interface SeoPage {
  id: string
  /** Route path. With `prefix`, every path below it resolves to this page. */
  path: string
  prefix?: boolean
  /** File in dist/ that serves the route (Vercel cleanUrls drops the .html). */
  file: string
  /** Short name used in breadcrumbs and links. */
  label: string
  title: string
  description: string
  /** Indexable pages are listed in the sitemap; the rest are served noindex. */
  indexable: boolean
  /** Heading and copy crawlers read before JavaScript runs. Mirrors the page. */
  heading: string
  summary: string[]
  snapshot?: SnapshotBlock[]
  schema?: SchemaBlock[]
  /** Repo paths (a trailing / means a folder) whose changes change this page. */
  sources: string[]
}

/** Repo paths that shape every page, so a change there touches all of them. */
export const SHARED_SOURCES = [
  'index.html',
  'public/',
  'src/seo/',
  'src/App.tsx',
  'src/index.css',
  'src/components/Logo.tsx',
  'src/site/site.css',
  'src/site/ui.tsx',
  'src/site/hooks.ts',
  'src/site/SiteNav.tsx',
  'src/site/SiteFooter.tsx',
]

export const PAGES: SeoPage[] = [
  {
    id: 'home',
    path: '/',
    file: 'index.html',
    label: 'Home',
    title: 'Swipass | Cross-Chain Swaps and Bridging in Plain Language',
    description:
      'Swap, bridge and send crypto across chains by saying what you want. Swipass compares live routes across providers and hands you one transaction to sign.',
    indexable: true,
    heading: 'DeFi in plain language.',
    summary: [
      'Swipass turns a plain-language command into a cross-chain swap, bridge or send. Connect a wallet, say what you need, and Swipass finds the optimal route and settles it.',
      'It is non-custodial: every transaction is signed from your own wallet, and end users need no account or sign-up. Developers integrate the same flow through one REST endpoint and earn a share of the fees their users generate.',
    ],
    snapshot: ['features', 'faq'],
    schema: ['webApplication', 'faq'],
    sources: ['src/pages/LandingPage.tsx', 'src/site/landing/', 'src/content/'],
  },
  {
    id: 'app',
    path: '/app',
    file: 'app.html',
    label: 'App',
    title: 'Swipass App | Swap and Bridge Crypto Across Chains',
    description:
      'Connect a wallet and type a command like "bridge 1 ETH from Arbitrum to Polygon". Swipass finds the best route across providers. No account needed.',
    indexable: true,
    heading: 'Swipass App',
    summary: [
      'Type or speak what you want to do, for example "Bridge 1 ETH from Arbitrum to Polygon". Swipass parses the intent, compares quotes from every connected liquidity provider, and prepares one transaction for your wallet to sign.',
      'You can send to a different address on the destination chain. Swipass never holds your funds and never asks for a private key.',
    ],
    schema: ['webApplication', 'breadcrumbs'],
    sources: ['src/pages/AppPage.tsx', 'src/components/app/', 'src/components/WalletProvider.tsx'],
  },
  {
    id: 'docs',
    path: '/docs',
    file: 'docs.html',
    label: 'Docs',
    title: 'Swipass API Docs | Cross-Chain Intent API for Developers',
    description:
      'Build cross-chain swaps and bridges into your product with one REST endpoint. Parse plain-language intents, get simulated quotes and earn a share of fees.',
    indexable: true,
    heading: 'Swipass API Developer Documentation',
    summary: [
      'Swipass turns a plain-language command into an executed cross-chain swap, bridge, or send. Your product sends the command to one endpoint; Swipass parses it, sources quotes from every connected liquidity provider, and returns ready-to-sign calldata.',
      'Every quote offered has been pre-flight simulated against live chain state, and the guaranteed amount is the on-chain floor the user is promised. Developers create an API key in the dashboard and earn a share of the platform fee on every transaction they route.',
      'The documentation covers authentication, the JavaScript and Python SDKs, a quick start, endpoints, the execution flow, token approvals, webhooks, traces, bringing your own LLM, destination addresses, providers, fees and revenue sharing, and error codes.',
    ],
    schema: ['techArticle', 'breadcrumbs'],
    sources: ['src/pages/DocsPage.tsx'],
  },
  {
    id: 'auth',
    path: '/auth',
    file: 'auth.html',
    label: 'Sign in',
    title: 'Sign In | Swipass',
    description: 'Sign in to the Swipass developer and admin dashboards with Google or GitHub.',
    indexable: false,
    heading: 'Sign in to Swipass',
    summary: ['Developers and admins sign in with Google or GitHub. End users do not need an account.'],
    sources: [],
  },
  {
    id: 'dashboard',
    path: '/dashboard',
    prefix: true,
    file: 'dashboard.html',
    label: 'Dashboard',
    title: 'Dashboard | Swipass',
    description: 'Manage Swipass projects, API keys, usage, webhooks and payouts.',
    indexable: false,
    heading: 'Swipass Dashboard',
    summary: ['Sign in to manage your projects, API keys, usage and payouts.'],
    sources: [],
  },
]

/** Served by Vercel with a 404 status for any path no file or rewrite matches. */
export const NOT_FOUND_PAGE: SeoPage = {
  id: 'not-found',
  path: '/404',
  file: '404.html',
  label: 'Not found',
  title: 'Page Not Found | Swipass',
  description: 'This page does not exist on Swipass.',
  indexable: false,
  heading: 'Page not found',
  summary: ['The page you asked for does not exist or has moved.'],
  sources: [],
}

export const INDEXABLE_PAGES = PAGES.filter((page) => page.indexable)

export function resolvePage(pathname: string): SeoPage {
  const path = pathname.replace(/\/+$/, '') || '/'
  return (
    PAGES.find((page) => page.path === path || (page.prefix && path.startsWith(`${page.path}/`))) ??
    NOT_FOUND_PAGE
  )
}
