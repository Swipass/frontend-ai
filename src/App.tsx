// src/App.tsx

import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import { Toaster } from 'react-hot-toast'
import { SignedIn, SignedOut } from '@clerk/clerk-react'
import LandingPage from './pages/LandingPage'
import AppPage from './pages/AppPage'
import DeveloperDashboard from './pages/DeveloperDashboard'
import AdminDashboard from './pages/AdminDashboard'
import DocsPage from './pages/DocsPage'
import AuthPage from './pages/Auth/AuthPage'

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

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <Navigate to="/auth" replace />
      </SignedOut>
    </>
  )
}

export default function App() {
  return (
    <>
      <div className="noise-overlay" />
      <Cursor />
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
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={<AppPage />} />
        <Route path="/docs" element={<DocsPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route
          path="/dashboard/developer/*"
          element={
            <ProtectedRoute>
              <DeveloperDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin/*"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/dashboard" element={<Navigate to="/dashboard/developer" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}