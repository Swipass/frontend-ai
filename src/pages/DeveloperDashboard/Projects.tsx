// src/pages/DeveloperDashboard/Projects.tsx
import { useEffect, useState } from 'react'
import { platformService } from '../../services/platformService'
import toast from 'react-hot-toast'
import { PageTitle, Loading, EmptyState, CopyButton, ConfirmDialog, Field, inputCls, fmtUsd } from './shared'

export default function Projects() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [busy, setBusy] = useState(false)

  // Reveal-once secret. Holds either a freshly created key or a rotated one.
  const [revealed, setRevealed] = useState<{ key: string; name: string } | null>(null)
  const [confirmDel, setConfirmDel] = useState<any | null>(null)
  const [confirmRotate, setConfirmRotate] = useState<any | null>(null)

  const load = () =>
    platformService.listProjects().then(setProjects).catch(() => {}).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const create = async () => {
    if (!newName.trim()) return
    setBusy(true)
    try {
      const res = await platformService.createProject(newName.trim(), newDesc.trim() || undefined)
      setRevealed({ key: res.api_key, name: newName.trim() })
      setNewName(''); setNewDesc(''); setCreating(false)
      await load()
      toast.success('Project created')
    } catch (e: any) {
      toast.error(e?.message || 'Failed to create project')
    } finally {
      setBusy(false)
    }
  }

  const rotate = async (p: any) => {
    setBusy(true)
    try {
      const res = await platformService.regenerateKey(p.id)
      setRevealed({ key: res.api_key, name: p.name })
      setConfirmRotate(null)
      await load()
      toast.success('API key rotated')
    } catch (e: any) {
      toast.error(e?.message || 'Failed to rotate key')
    } finally {
      setBusy(false)
    }
  }

  const del = async (p: any) => {
    setBusy(true)
    try {
      await platformService.deleteProject(p.id)
      setConfirmDel(null)
      await load()
      toast.success('Project deleted')
    } catch (e: any) {
      toast.error(e?.message || 'Failed to delete project')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <PageTitle
        title="Projects"
        subtitle="Each project has its own API key and earnings."
        right={
          <button onClick={() => setCreating(v => !v)} className="sw-btn sw-btn-primary text-xs py-2 px-4">
            {creating ? 'Close' : '+ New Project'}
          </button>
        }
      />

      {revealed && (
        <div className="p-4 bg-dark-grey-2 border border-mid-grey rounded-lg mb-4">
          <div className="text-xs uppercase tracking-wider text-light-grey-1 mb-2">
            API key for {revealed.name}, shown once only. Store it now
          </div>
          <code className="font-mono text-sm text-almost-white break-all block mb-3">{revealed.key}</code>
          <div className="flex items-center gap-2">
            <CopyButton text={revealed.key} label="Copy Key" />
            <button
              onClick={() => setRevealed(null)}
              className="text-xs text-light-grey-1 hover:text-light-grey-3 font-mono"
            >
              I have saved it
            </button>
          </div>
        </div>
      )}

      {creating && (
        <div className="dash-card mb-4 space-y-3">
          <div className="font-display text-base font-semibold text-almost-white">Create Project</div>
          <Field label="Name">
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="My integration"
              onKeyDown={e => e.key === 'Enter' && create()}
              className={inputCls}
            />
          </Field>
          <Field label="Description (optional)">
            <input value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="What is this for?" className={inputCls} />
          </Field>
          <div className="flex gap-3">
            <button onClick={create} disabled={busy || !newName.trim()} className="sw-btn sw-btn-primary text-xs py-2 px-4 disabled:opacity-50">
              {busy ? '...' : 'Create'}
            </button>
            <button onClick={() => setCreating(false)} className="sw-btn sw-btn-ghost text-xs py-2 px-4">Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <Loading />
      ) : projects.length === 0 ? (
        <EmptyState title="No projects yet" hint="Create a project to generate an API key and start routing intents." />
      ) : (
        <div className="space-y-4">
          {projects.map(p => (
            <div key={p.id} className="dash-card">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
                <div>
                  <div className="font-display text-lg font-semibold text-almost-white">{p.name}</div>
                  <code className="text-xs text-light-grey-1 font-mono">{p.api_key_prefix || 'sw_...'}...</code>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs uppercase tracking-wider px-2 py-0.5 rounded ${
                      p.status === 'paused' ? 'bg-mid-grey text-almost-white' : 'bg-dark-grey-3 text-light-grey-2'
                    }`}
                  >
                    {p.status || 'active'}
                  </span>
                  <button
                    onClick={() => setConfirmRotate(p)}
                    className="text-xs border border-mid-grey rounded px-2 py-1 text-light-grey-1 hover:bg-dark-grey-3 transition"
                  >
                    Rotate Key
                  </button>
                  <button
                    onClick={() => setConfirmDel(p)}
                    className="text-xs text-light-grey-1 hover:text-light-grey-3 font-mono"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  ['Pending Balance', fmtUsd(p.pending_balance)],
                  ['Total Earned', fmtUsd(p.total_earned)],
                  ['Total Volume', fmtUsd(p.total_volume_usd, 0)],
                ].map(([l, v]) => (
                  <div key={l}>
                    <div className="text-xs uppercase tracking-wider text-light-grey-1 mb-0.5">{l}</div>
                    <div className="font-display text-base font-semibold text-light-grey-3">{v}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!confirmRotate}
        title="Rotate API key"
        message={
          <>Rotating the key for <b className="text-light-grey-3">{confirmRotate?.name}</b> immediately invalidates the current key. Any live integration using it will stop working until updated.</>
        }
        confirmLabel="Rotate Key"
        busy={busy}
        onConfirm={() => rotate(confirmRotate)}
        onCancel={() => setConfirmRotate(null)}
      />

      <ConfirmDialog
        open={!!confirmDel}
        title="Delete project"
        message={
          <>Delete <b className="text-light-grey-3">{confirmDel?.name}</b>? This revokes its API key and cannot be undone.</>
        }
        confirmLabel="Delete"
        busy={busy}
        onConfirm={() => del(confirmDel)}
        onCancel={() => setConfirmDel(null)}
      />
    </div>
  )
}
