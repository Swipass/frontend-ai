<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./assets/swipass-wordmark-dark.png">
    <img alt="Swipass" src="./assets/swipass-wordmark-light.png" width="240">
  </picture>
</p>

# Swipass Frontend

React 18 PWA. Universal Cross-Chain Intent & Execution Platform.

## Stack
- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** with XOT Grey palette
- **Three.js** + `@react-three/fiber` for WebGL landing scene
- **Framer Motion** for animations
- **Zustand** for state management
- **react-hot-toast** for notifications
- **vite-plugin-pwa** for PWA manifest + service worker

## Quick Start

```bash
cp .env.example .env
npm install
npm run dev
```

- Landing: http://localhost:5173/
- App: http://localhost:5173/app
- Docs: http://localhost:5173/docs
- Dev Dashboard: http://localhost:5173/dashboard/developer
- Admin Dashboard: http://localhost:5173/dashboard/admin

## Pointing the app at your API

The app reads its chains, tokens, provider ratings and fee rates from the
backend, so it needs to know where that is. Vite inlines `VITE_` variables into
the bundle **at build time**, which means the production value comes from the
build environment, not from a file in this repository:

- **Local:** `.env` with `VITE_API_URL=http://localhost:8000` (the dev server
  also proxies the API paths, so this works out of the box).
- **Production:** set `VITE_API_URL` in the Vercel project settings
  (Settings, Environment Variables) and redeploy. Editing a file here does not
  change what is live.

Three values have to agree, or sign-in and the app page fail in ways that look
unrelated to each other:

| Where | Value |
|---|---|
| Frontend `VITE_API_URL` | `https://<your-api-domain>` |
| Backend `ALLOWED_ORIGINS` | the frontend origin, e.g. `https://www.swipass.com` |
| Backend `OAUTH_REDIRECT_BASE_URL`, and the redirect URI registered with Google and GitHub | `https://<your-api-domain>`, callback `.../auth/callback/<provider>` |

If the API is unreachable the landing page and docs still render; the app page
reports that it cannot load its networks rather than showing a stale list.

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page, with real backend stats |
| `/app` | Command interface, wired to the full backend |
| `/docs` | Developer docs with 5-language code tabs |
| `/auth` | Sign-in for developers and admins (Google or GitHub) |
| `/dashboard/developer/*` | Project management, API keys, earnings, payouts |
| `/dashboard/admin/*` | System controls, transactions, providers, users |

## Search (SEO)

Everything search engines read comes from one registry, `src/seo/pages.ts`.

- The build (`build/seo/plugin.ts`) writes one HTML file per route with its own
  title, description, canonical URL, Open Graph and X card tags, JSON-LD, and a
  static content snapshot that crawlers can read without running JavaScript.
  It also writes `sitemap.xml`, `robots.txt`, `llms.txt` and the IndexNow key
  file, then fails the build if any of them is wrong.
- `useDocumentHead` applies the same tags on client-side navigation.
- `vercel.json` serves those files on clean URLs, returns a real 404 for
  unknown paths, and marks `/auth` and `/dashboard/*` `noindex`.
- `.github/workflows/indexnow.yml` tells IndexNow engines (Bing and others)
  which public pages changed after each production deployment. To submit every
  page by hand: `node scripts/indexnow.ts --all`.

To add a public page, add its `<Route>` in `src/App.tsx` and an entry in
`src/seo/pages.ts`. The canonical origin is `https://www.swipass.com`
(`src/seo/site.ts`), because `swipass.com` redirects there.

Search console ownership tokens (the HTML-tag method) live in
`SITE.verification` in `src/seo/site.ts` and are printed in every page's
`<head>`. The `SEO_GOOGLE_SITE_VERIFICATION` / `SEO_BING_SITE_VERIFICATION`
build variables override them.

The social preview image `public/og-image.png` is rendered from
`scripts/og/og-image.html`:

```bash
google-chrome --headless --hide-scrollbars --window-size=1200,630 \
  --virtual-time-budget=5000 --screenshot=public/og-image.png scripts/og/og-image.html
```

## Design System

Grey palette defined in `tailwind.config.js` and `src/index.css`:

```
--gray-50:  #0a0a0a  Background
--gray-100: #111111  Cards/panels
--gray-200: #1a1a1a  Hover surfaces
--gray-300: #2a2a2a  Borders/dividers
--gray-400: #404040  Mid-grey
--gray-500: #666666  Secondary text
--gray-600: #a3a3a3  Body text
--gray-700: #d4d4d4  Primary text
--gray-800: #e5e5e5  High contrast
--gray-900: #f5f5f5  Headlines/CTAs
```

Fonts: `Syne` (display), `DM Mono` (body), `Instrument Serif` (italic accents)

## Build

```bash
npm run build    # Production build to dist/
npm run preview  # Preview production build
```
