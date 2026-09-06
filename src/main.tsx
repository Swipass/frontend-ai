// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { captureTokenFromUrl } from './services/auth'
import App from './App'
import './index.css'

// Capture the OAuth session token the backend appends to the redirect URL.
captureTokenFromUrl()

const queryClient = new QueryClient()

// The wallet context is mounted per route (see WalletProvider), because it
// needs the backend's chain list and the marketing pages must not wait on it.
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
)
