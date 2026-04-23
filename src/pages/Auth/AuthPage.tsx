import { useState } from 'react'
import { Link } from 'react-router-dom'
import { SignIn, SignUp } from '@clerk/clerk-react'

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin')

  return (
    <div className="min-h-screen flex items-center justify-center bg-deepest-dark font-mono p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-md bg-dark-grey-1 border border-dark-grey-3 rounded-xl p-6 sm:p-8 text-center">
        <Link to="/" className="flex items-center justify-center gap-2 font-display text-lg font-extrabold text-almost-white tracking-tighter mb-6">
          Swipass
        </Link>

        {/* Tabs */}
        <div className="flex border-b border-dark-grey-3 mb-6">
          <button
            onClick={() => setActiveTab('signin')}
            className={`flex-1 py-3 font-display text-sm font-semibold transition-all duration-200 cursor-none ${
              activeTab === 'signin'
                ? 'text-almost-white border-b-2 border-light-grey-3'
                : 'text-light-grey-1 border-b-2 border-transparent'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setActiveTab('signup')}
            className={`flex-1 py-3 font-display text-sm font-semibold transition-all duration-200 cursor-none ${
              activeTab === 'signup'
                ? 'text-almost-white border-b-2 border-light-grey-3'
                : 'text-light-grey-1 border-b-2 border-transparent'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Clerk sign‑in or sign‑up */}
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
                formFieldInput: 'w-full bg-dark-grey-2 border border-mid-grey rounded px-3 py-2 text-sm font-mono text-light-grey-3 focus:outline-none focus:border-light-grey-1',
                footer: 'hidden',
                socialButtonsBlockButton: 'bg-dark-grey-2 border border-mid-grey text-light-grey-3 hover:bg-dark-grey-3',
                socialButtonsBlockButtonText: 'text-light-grey-3',
                dividerLine: 'bg-mid-grey',
                dividerText: 'text-light-grey-1',
                formFieldLabel: 'text-light-grey-2 text-left text-xs',
                formFieldAction: 'text-light-grey-1 text-xs',
                identityPreview: 'bg-dark-grey-2 border-mid-grey',
                identityPreviewText: 'text-light-grey-3',
                otpCodeFieldInput: 'bg-dark-grey-2 border-mid-grey text-light-grey-3',
                formResendCodeLink: 'text-light-grey-1',
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
                formFieldInput: 'w-full bg-dark-grey-2 border border-mid-grey rounded px-3 py-2 text-sm font-mono text-light-grey-3 focus:outline-none focus:border-light-grey-1',
                footer: 'hidden',
                socialButtonsBlockButton: 'bg-dark-grey-2 border border-mid-grey text-light-grey-3 hover:bg-dark-grey-3',
                socialButtonsBlockButtonText: 'text-light-grey-3',
                dividerLine: 'bg-mid-grey',
                dividerText: 'text-light-grey-1',
                formFieldLabel: 'text-light-grey-2 text-left text-xs',
                formFieldAction: 'text-light-grey-1 text-xs',
                identityPreview: 'bg-dark-grey-2 border-mid-grey',
                identityPreviewText: 'text-light-grey-3',
                otpCodeFieldInput: 'bg-dark-grey-2 border-mid-grey text-light-grey-3',
                formResendCodeLink: 'text-light-grey-1',
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

        {/* Help footer and back button */}
        <div className="mt-6 p-3 border border-dark-grey-3 rounded-md">
          <p className="text-xs text-light-grey-1">
            Need help? <Link to="/docs" className="text-light-grey-3 underline">Read the docs</Link>
          </p>
        </div>
        <Link to="/" className="sw-btn sw-btn-ghost w-full justify-center mt-4">← Back to Home</Link>
      </div>
    </div>
  )
}