// src/pages/AdminDashboard/Projects.tsx
import { useEffect, useState } from 'react'
import { adminService } from '../../services/platformService'
import toast from 'react-hot-toast'
import { PageTitle, Loading, EmptyState, StatusDot, ConfirmDialog, fmtUsd } from './shared'

export default function AdminProjects() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [confirmPause, setConfirmPause] = useState<any | null>(null)

  const load = () =>
    adminService.listProjects().then(d => setProjects(d.projects || d.items || [])).catch(() => setProjects([])).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const doPause = async (p: any) => {
    const paused = p.status !== 'paused'
    setBusy(true)
    try {
      await adminService.pauseProject(p.id, paused)
      setProjects(prev => prev.map(x => (x.id === p.id ? { ...x, status: paused ? 'paused' : 'active' } : x)))
      setConfirmPause(null)
      toast.success(paused ? 'Project paused' : 'Project resumed')
    } catch (e: any) {
      toast.error(e?.message || 'Failed to update project')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <PageTitle title="Projects" subtitle={`${projects.length} projects across all developers.`} />

      {loading ? (
        <Loading />
      ) : projects.length === 0 ? (
        <EmptyState title="No projects" hint="No developer projects exist yet." />
      ) : (
        <div className="border border-dark-grey-3 rounded-lg overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-dark-grey-2 text-light-grey-1 text-xs uppercase tracking-wider">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Owner</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Volume</th>
                <th className="p-3 text-left">Earned</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(p => (
                <tr key={p.id} className="border-b border-dark-grey-3 hover:bg-dark-grey-2">
                  <td className="p-3 font-display font-semibold text-almost-white">{p.name}</td>
                  <td className="p-3 text-light-grey-1 break-all">{p.owner_email || p.user_email || '-'}</td>
                  <td className="p-3">
                    <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-light-grey-1">
                      <StatusDot ok={p.status !== 'paused'} />
                      {p.status || 'active'}
                    </span>
                  </td>
                  <td className="p-3 text-light-grey-2">{fmtUsd(p.total_volume_usd, 0)}</td>
                  <td className="p-3 text-light-grey-2">{fmtUsd(p.total_earned)}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => setConfirmPause(p)}
                      className="text-xs border border-mid-grey rounded px-2 py-1 text-light-grey-1 hover:bg-dark-grey-3 transition"
                    >
                      {p.status === 'paused' ? 'Resume' : 'Pause'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={!!confirmPause}
        title={confirmPause?.status === 'paused' ? 'Resume project' : 'Pause project'}
        message={
          confirmPause?.status === 'paused'
            ? <>Resume <b className="text-light-grey-3">{confirmPause?.name}</b>? Its API key will start accepting intents again.</>
            : <>Pause <b className="text-light-grey-3">{confirmPause?.name}</b>? Its API key will be rejected until resumed.</>
        }
        confirmLabel={confirmPause?.status === 'paused' ? 'Resume' : 'Pause'}
        busy={busy}
        onConfirm={() => doPause(confirmPause)}
        onCancel={() => setConfirmPause(null)}
      />
    </div>
  )
}
