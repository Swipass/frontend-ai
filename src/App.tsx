// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { useAuth } from './hooks/useAuth'
import { useDocumentHead } from './seo/useDocumentHead'

// Each page is its own chunk, fetched only when that route is visited. The
// landing page is the front door and must stay light: without this, every
// visitor downloaded wagmi/viem/RainbowKit and both dashboards (a 1.7MB
// bundle) before the landing page could even paint, which is what made every
// page feel slow on mobile regardless of which one it was.
//
// WalletProvider carries the same weight (it pulls in wagmi/viem/RainbowKit)
// and is lazy for the same reason: only /app and the dashboards ever mount it.
const WalletProvider = lazy(() =>
  import('./components/WalletProvider').then(m => ({ default: m.WalletProvider }))
)
const LandingPage = lazy(() => import('./pages/LandingPage'))
const AppPage = lazy(() => import('./pages/AppPage'))
const DeveloperDashboard = lazy(() => import('./pages/DeveloperDashboard'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const DocsPage = lazy(() => import('./pages/DocsPage'))
const AuthPage = lazy(() => import('./pages/Auth/AuthPage'))
const ForgotPasswordPage = lazy(() => import('./pages/Auth/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('./pages/Auth/ResetPasswordPage'))
const VerifyEmailPage = lazy(() => import('./pages/Auth/VerifyEmailPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))
const IntegrationsPage = lazy(() => import('./pages/IntegrationsPage'))

function RouteFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-deepest-dark">
      <div className="w-6 h-6 border-2 border-mid-grey border-t-almost-white rounded-full animate-spin" />
    </div>
  )
}

// Pointer-based check: touch devices get the native cursor, never the custom one.
function isCoarsePointer() {
  return typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
}

function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const mx = useRef(0), my = useRef(0)
  const rx = useRef(0), ry = useRef(0)

  useEffect(() => {
    const move = (e: MouseEvent) => {
      mx.current = e.clientX; my.current = e.clientY
      if (dotRef.current)
        dotRef.current.style.transform = `translate(${e.clientX}px,${e.clientY}px) translate(-50%,-50%)`
    }
    const hover = () => document.body.classList.add('cursor-hover')
    const unhover = () => document.body.classList.remove('cursor-hover')
    document.addEventListener('mousemove', move)
    document.querySelectorAll('a,button,[role=button]').forEach(el => {
      el.addEventListener('mouseenter', hover)
      el.addEventListener('mouseleave', unhover)
    })
    let raf: number
    const animate = () => {
      rx.current += (mx.current - rx.current) * 0.13
      ry.current += (my.current - ry.current) * 0.13
      if (ringRef.current)
        ringRef.current.style.transform = `translate(${rx.current}px,${ry.current}px) translate(-50%,-50%)`
      raf = requestAnimationFrame(animate)
    }
    animate()
    return () => {
      document.removeEventListener('mousemove', move)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <>
      <div id="cursor-dot" ref={dotRef} />
      <div id="cursor-ring" ref={ringRef} />
    </>
  )
}

function ProtectedRoute({ children, requireAdmin }: { children: React.ReactNode; requireAdmin?: boolean }) {
  const { isLoaded, isSignedIn, isAdmin } = useAuth()
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-deepest-dark">
        <div className="w-6 h-6 border-2 border-mid-grey border-t-almost-white rounded-full animate-spin" />
      </div>
    )
  }
  if (!isSignedIn) return <Navigate to="/auth" replace />
  if (requireAdmin && !isAdmin) return <Navigate to="/dashboard/developer" replace />
  return <>{children}</>
}

export default function App() {
  // Touch devices keep the native cursor; the custom cursor is desktop-only.
  const [coarse] = useState(isCoarsePointer())
  useDocumentHead()
  return (
    <>
      <div className="noise-overlay" />
      {!coarse && <Cursor />}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#1a1a1a',
            color: '#d4d4d4',
            border: '1px solid #2a2a2a',
            fontFamily: 'DM Mono, monospace',
            fontSize: '0.75rem',
          },
        }}
      />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/app"
            element={
              <WalletProvider>
                <AppPage />
              </WalletProvider>
            }
          />
          <Route path="/docs" element={<DocsPage />} />
          <Route path="/integrations" element={<IntegrationsPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/auth/forgot" element={<ForgotPasswordPage />} />
          <Route path="/auth/reset" element={<ResetPasswordPage />} />
          <Route path="/auth/verify" element={<VerifyEmailPage />} />
          <Route
            path="/dashboard/developer/*"
            element={
              <ProtectedRoute>
                <WalletProvider>
                  <DeveloperDashboard />
                </WalletProvider>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin/*"
            element={
              <ProtectedRoute requireAdmin>
                <WalletProvider>
                  <AdminDashboard />
                </WalletProvider>
              </ProtectedRoute>
            }
          />
          <Route path="/dashboard" element={<Navigate to="/dashboard/developer" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </>
  )
}
