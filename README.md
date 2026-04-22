# Swipass Frontend

React 18 PWA — Universal Cross-Chain Intent & Execution Platform.

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

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page — exact conversion of index.html with real backend stats |
| `/app` | Command interface — exact conversion of app.html with full backend |
| `/docs` | Developer docs with 5-language code tabs |
| `/auth` | Clerk authentication |
| `/dashboard/developer/*` | Project management, API keys, earnings, payouts |
| `/dashboard/admin/*` | System controls, transactions, providers, users |

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
