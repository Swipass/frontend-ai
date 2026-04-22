// src/pages/Auth/AuthPage.tsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { SignIn, SignUp } from '@clerk/clerk-react'

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin')

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--gray-50)', fontFamily:"'DM Mono',monospace", padding:'2rem' }}>
      <div style={{ width:'100%', maxWidth:480, background:'var(--gray-100)', border:'1px solid var(--gray-300)', borderRadius:12, padding:'2rem', textAlign:'center' }}>
        <Link to="/" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem', fontFamily:"'Syne',sans-serif", fontSize:'1.1rem', fontWeight:800, color:'var(--gray-900)', letterSpacing:'-0.03em', marginBottom:'1.5rem' }}>
          <div style={{ width:24, height:24, border:'1.5px solid var(--gray-500)', borderRadius:5, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.55rem', color:'var(--gray-500)' }}>SW</div>
          Swipass
        </Link>

        {/* Tabs */}
        <div style={{ display:'flex', borderBottom:'1px solid var(--gray-300)', marginBottom:'1.5rem' }}>
          <button
            onClick={() => setActiveTab('signin')}
            style={{
              flex:1,
              padding:'0.75rem 1rem',
              background:'none',
              border:'none',
              fontFamily:"'Syne',sans-serif",
              fontSize:'0.85rem',
              fontWeight:600,
              color: activeTab === 'signin' ? 'var(--gray-900)' : 'var(--gray-500)',
              borderBottom: activeTab === 'signin' ? '2px solid var(--gray-700)' : '2px solid transparent',
              cursor:'none',
              transition:'all 0.2s',
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => setActiveTab('signup')}
            style={{
              flex:1,
              padding:'0.75rem 1rem',
              background:'none',
              border:'none',
              fontFamily:"'Syne',sans-serif",
              fontSize:'0.85rem',
              fontWeight:600,
              color: activeTab === 'signup' ? 'var(--gray-900)' : 'var(--gray-500)',
              borderBottom: activeTab === 'signup' ? '2px solid var(--gray-700)' : '2px solid transparent',
              cursor:'none',
              transition:'all 0.2s',
            }}
          >
            Create Account
          </button>
        </div>

        {/* Conditional rendering of Clerk components */}
        {activeTab === 'signin' ? (
          <SignIn
            routing="path"
            path="/auth"
            signUpUrl="/auth"
            fallbackRedirectUrl="/dashboard/developer"
            appearance={{
              elements: {
                rootBox: 'w-full',
                card: 'shadow-none bg-transparent p-0',
                headerTitle: 'hidden',
                headerSubtitle: 'hidden',
                formButtonPrimary: 'sw-btn sw-btn-primary w-full justify-center',
                formFieldInput: 'w-full bg-gray-800 border border-gray-600 rounded p-2 text-sm font-mono text-gray-200 focus:outline-none focus:border-gray-400',
                footer: 'hidden',
                socialButtonsBlockButton: 'bg-gray-800 border border-gray-600 text-gray-200 hover:bg-gray-700',
                socialButtonsBlockButtonText: 'text-gray-200',
                dividerLine: 'bg-gray-700',
                dividerText: 'text-gray-400',
                formFieldLabel: 'text-gray-300 text-left text-xs',
                formFieldAction: 'text-gray-400 text-xs',
                identityPreview: 'bg-gray-800 border-gray-600',
                identityPreviewText: 'text-gray-200',
                otpCodeFieldInput: 'bg-gray-800 border-gray-600 text-gray-200',
                formResendCodeLink: 'text-gray-400',
                formFieldErrorText: 'text-red-400 text-xs',
              },
              variables: {
                colorBackground: 'var(--gray-100)',
                colorInputBackground: 'var(--gray-800)',
                colorInputText: 'var(--gray-200)',
                colorText: 'var(--gray-300)',
                colorTextSecondary: 'var(--gray-500)',
                colorPrimary: 'var(--gray-500)',
                colorDanger: '#ef4444',
                borderRadius: '0.375rem',
                fontFamily: "'DM Mono', monospace",
              },
            }}
          />
        ) : (
          <SignUp
            routing="path"
            path="/auth"
            signInUrl="/auth"
            fallbackRedirectUrl="/dashboard/developer"
            appearance={{
              elements: {
                rootBox: 'w-full',
                card: 'shadow-none bg-transparent p-0',
                headerTitle: 'hidden',
                headerSubtitle: 'hidden',
                formButtonPrimary: 'sw-btn sw-btn-primary w-full justify-center',
                formFieldInput: 'w-full bg-gray-800 border border-gray-600 rounded p-2 text-sm font-mono text-gray-200 focus:outline-none focus:border-gray-400',
                footer: 'hidden',
                socialButtonsBlockButton: 'bg-gray-800 border border-gray-600 text-gray-200 hover:bg-gray-700',
                socialButtonsBlockButtonText: 'text-gray-200',
                dividerLine: 'bg-gray-700',
                dividerText: 'text-gray-400',
                formFieldLabel: 'text-gray-300 text-left text-xs',
                formFieldAction: 'text-gray-400 text-xs',
                identityPreview: 'bg-gray-800 border-gray-600',
                identityPreviewText: 'text-gray-200',
                otpCodeFieldInput: 'bg-gray-800 border-gray-600 text-gray-200',
                formResendCodeLink: 'text-gray-400',
                formFieldErrorText: 'text-red-400 text-xs',
              },
              variables: {
                colorBackground: 'var(--gray-100)',
                colorInputBackground: 'var(--gray-800)',
                colorInputText: 'var(--gray-200)',
                colorText: 'var(--gray-300)',
                colorTextSecondary: 'var(--gray-500)',
                colorPrimary: 'var(--gray-500)',
                colorDanger: '#ef4444',
                borderRadius: '0.375rem',
                fontFamily: "'DM Mono', monospace",
              },
            }}
          />
        )}

        <div style={{ marginTop:'1.5rem', padding:'0.75rem', border:'1px solid var(--gray-300)', borderRadius:8 }}>
          <p style={{ fontSize:'0.7rem', color:'var(--gray-500)', margin:0 }}>
            Need help? <Link to="/docs" style={{ color:'var(--gray-700)', textDecoration:'underline' }}>Read the docs</Link>
          </p>
        </div>
        <Link to="/" className="sw-btn sw-btn-ghost" style={{ marginTop:'1rem', justifyContent:'center', width:'100%' }}>← Back to Home</Link>
      </div>
    </div>
  )
}