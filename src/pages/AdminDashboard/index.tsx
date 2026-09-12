// src/pages/AdminDashboard/index.tsx
// Admin dashboard: navigation and routing inside the shared dashboard shell.
// The route is already guarded (admin only) in App.tsx. Each panel lives in
// its own file.
import type { ReactNode } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { DashShell, type DashNavItem } from '../../site/dashboard/DashShell'
import AccountPage from '../Account/AccountPage'
import Overview from './Overview'
import Emergency from './Emergency'
import Health from './Health'
import Transactions from './Transactions'
import Providers from './Providers'
import Analytics from './Analytics'
import Users from './Users'
import AdminProjects from './Projects'
import Finance from './Finance'
import ControlPlane from './ControlPlane'
import Audit from './Audit'
import Traces from './Traces'
import Team from './Team'

const BASE = '/dashboard/admin'

const NAV: DashNavItem[] = [
  { label: 'Overview', path: '' },
  { label: 'Emergency', path: 'emergency' },
  { label: 'Health', path: 'health' },
  { label: 'Transactions', path: 'transactions' },
  { label: 'Traces', path: 'traces' },
  { label: 'Providers', path: 'providers' },
  { label: 'Analytics', path: 'analytics' },
  { label: 'Users', path: 'users' },
  { label: 'Projects', path: 'projects' },
  { label: 'Finance', path: 'finance' },
  { label: 'Team', path: 'team' },
  { label: 'Control Plane', path: 'control' },
  { label: 'Audit', path: 'audit' },
  { label: 'Account', path: 'account' },
]

const page = (active: string, content: ReactNode) => (
  <DashShell area="admin" base={BASE} items={NAV} active={active}>
    {content}
  </DashShell>
)

export default function AdminDashboard() {
  return (
    <Routes>
      <Route path="/" element={page('', <Overview />)} />
      <Route path="emergency" element={page('emergency', <Emergency />)} />
      <Route path="health" element={page('health', <Health />)} />
      <Route path="transactions" element={page('transactions', <Transactions />)} />
      <Route path="traces" element={page('traces', <Traces />)} />
      <Route path="providers" element={page('providers', <Providers />)} />
      <Route path="analytics" element={page('analytics', <Analytics />)} />
      <Route path="users" element={page('users', <Users />)} />
      <Route path="projects" element={page('projects', <AdminProjects />)} />
      <Route path="finance" element={page('finance', <Finance />)} />
      <Route path="team" element={page('team', <Team />)} />
      <Route path="control" element={page('control', <ControlPlane />)} />
      <Route path="audit" element={page('audit', <Audit />)} />
      <Route path="account" element={page('account', <AccountPage />)} />
      <Route path="*" element={<Navigate to={BASE} replace />} />
    </Routes>
  )
}
