// src/pages/DeveloperDashboard/ApiKeys.tsx
import { useEffect, useState } from 'react'
import { platformService } from '../../services/platformService'
import toast from 'react-hot-toast'
import { PageTitle, Loading, EmptyState, CopyButton, ConfirmDialog } from './shared'

export default function ApiKeys() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [revealed, setRevealed] = useState<{ key: string; name: string } | null>(null)
  const [confirmRotate, setConfirmRotate] = useState<any | null>(null)

  const load = () =>
    platformService.listProjects().then(setProjects).catch(() => {}).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

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

  return (
    <div>
      <PageTitle title="API Keys" subtitle="One key per project. Rotate a key if it may have been exposed." />

      <div className="dash-card mb-4">
        <div className="text-xs text-light-grey-1 leading-relaxed">
          Keys are secret and shown only once at creation or rotation. Send yours as the
          {' '}<code className="bg-dark-grey-2 px-1 rounded text-light-grey-2">X-API-Key</code> header on every
          {' '}<code className="bg-dark-grey-2 px-1 rounded text-light-grey-2">/v1/intent</code> request. Rotating
          replaces the key instantly and cannot be undone.
        </div>
      </div>

      {revealed && (
        <div className="p-4 bg-dark-grey-2 border border-mid-grey rounded-lg mb-4">
          <div className="text-xs uppercase tracking-wider text-light-grey-1 mb-2">
            New key for {revealed.name}, shown once only. Store it now
          </div>
          <code className="font-mono text-sm text-almost-white break-all block mb-3">{revealed.key}</code>
          <div className="flex items-center gap-2">
            <CopyButton text={revealed.key} label="Copy Key" />
            <button onClick={() => setRevealed(null)} className="text-xs text-light-grey-1 hover:text-light-grey-3 font-mono">
              I have saved it
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <Loading />
      ) : projects.length === 0 ? (
        <EmptyState title="No API keys yet" hint="Create a project on the Projects page to generate your first key." />
      ) : (
        <div className="border border-dark-grey-3 rounded-lg overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-dark-grey-2 text-light-grey-1 text-xs uppercase tracking-wider">
              <tr>
                <th className="p-3 text-left">Project</th>
                <th className="p-3 text-left">Key Prefix</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(p => (
                <tr key={p.id} className="border-b border-dark-grey-3 hover:bg-dark-grey-2">
                  <td className="p-3 font-display font-semibold text-almost-white">{p.name}</td>
                  <td className="p-3"><code className="text-xs text-light-grey-2 font-mono">{p.api_key_prefix || 'sw_...'}...</code></td>
                  <td className="p-3 text-light-grey-1 uppercase tracking-wider text-xs">{p.status || 'active'}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => setConfirmRotate(p)}
                      className="text-xs border border-mid-grey rounded px-2 py-1 text-light-grey-1 hover:bg-dark-grey-3 transition"
                    >
                      Rotate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={!!confirmRotate}
        title="Rotate API key"
        message={
          <>Rotating the key for <b className="text-light-grey-3">{confirmRotate?.name}</b> invalidates the current key immediately. Update any live integration right after.</>
        }
        confirmLabel="Rotate Key"
        busy={busy}
        onConfirm={() => rotate(confirmRotate)}
        onCancel={() => setConfirmRotate(null)}
      />
    </div>
  )
}
