// src/pages/DeveloperDashboard/index.tsx
// Developer dashboard: navigation and routing inside the shared dashboard
// shell. Identity comes from useAuth. Each panel lives in its own file.
import type { ReactNode } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { DashShell, type DashNavItem } from '../../site/dashboard/DashShell'
import AccountPage from '../Account/AccountPage'
import Overview from './Overview'
import Projects from './Projects'
import ApiKeys from './ApiKeys'
import Usage from './Usage'
import Payouts from './Payouts'
import FeeShare from './FeeShare'
import Webhooks from './Webhooks'

const BASE = '/dashboard/developer'

const NAV: DashNavItem[] = [
  { label: 'Overview', path: '' },
  { label: 'Projects', path: 'projects' },
  { label: 'API Keys', path: 'keys' },
  { label: 'Usage & Analytics', path: 'usage' },
  { label: 'Payouts', path: 'payouts' },
  { label: 'Fee-share', path: 'fee-share' },
  { label: 'Webhooks', path: 'webhooks' },
  { label: 'Account', path: 'account' },
]

const page = (active: string, content: ReactNode) => (
  <DashShell area="developer" base={BASE} items={NAV} active={active}>
    {content}
  </DashShell>
)

export default function DeveloperDashboard() {
  return (
    <Routes>
      <Route path="/" element={page('', <Overview />)} />
      <Route path="projects" element={page('projects', <Projects />)} />
      <Route path="keys" element={page('keys', <ApiKeys />)} />
      <Route path="usage" element={page('usage', <Usage />)} />
      <Route path="payouts" element={page('payouts', <Payouts />)} />
      <Route path="fee-share" element={page('fee-share', <FeeShare />)} />
      <Route path="webhooks" element={page('webhooks', <Webhooks />)} />
      <Route path="account" element={page('account', <AccountPage />)} />
      {/* Settings grew into Account; keep old links working. */}
      <Route path="settings" element={<Navigate to={`${BASE}/account`} replace />} />
      <Route path="*" element={<Navigate to={BASE} replace />} />
    </Routes>
  )
}
