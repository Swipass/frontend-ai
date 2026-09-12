// src/pages/DeveloperDashboard/ApiKeys.tsx
// One key per project. Keys are shown once, at creation or rotation.
import { useState } from 'react'
import toast from 'react-hot-toast'
import { platformService, type Project } from '../../services/platformService'
import { PageTitle, Loading, EmptyState, ConfirmDialog, DataTable, StatusBadge, timeAgo, type Column } from './shared'
import { useProjects } from './useProjects'
import { RevealedKey } from './components/RevealedKey'

export default function ApiKeys() {
  const { projects, loading, reload } = useProjects()
  const [busy, setBusy] = useState(false)
  const [revealed, setRevealed] = useState<{ key: string; name: string } | null>(null)
  const [confirmRotate, setConfirmRotate] = useState<Project | null>(null)

  const rotate = async (p: Project) => {
    setBusy(true)
    try {
      const res = await platformService.regenerateKey(p.id)
      setRevealed({ key: res.api_key, name: p.name })
      setConfirmRotate(null)
      await reload()
      toast.success('API key rotated')
    } catch (e: any) {
      toast.error(e?.message || 'Could not rotate the key')
    } finally {
      setBusy(false)
    }
  }

  const columns: Column<Project>[] = [
    { key: 'name', header: 'Project', render: p => <span className="text-[color:var(--ink)]">{p.name}</span> },
    { key: 'prefix', header: 'Key prefix', className: 'f-mono text-[0.78rem]', render: p => p.api_key_prefix },
    { key: 'status', header: 'Status', render: p => <StatusBadge status={p.status || 'active'} /> },
    { key: 'last', header: 'Last used', className: 'f-mono whitespace-nowrap', render: p => timeAgo(p.last_request_at) },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: p => (
        <button type="button" onClick={() => setConfirmRotate(p)} disabled={busy} className="pill pill-dark h-8 disabled:opacity-50">
          Rotate
        </button>
      ),
    },
  ]

  return (
    <div>
      <PageTitle title="API Keys" subtitle="One key per project. Rotate a key if it may have been exposed." />

      <div className="dash-card mb-5 text-[0.84rem] leading-relaxed text-[color:var(--ink-3)]">
        Keys are secret and shown only once at creation or rotation. Send yours as the <code className="f-mono text-[color:var(--ink-2)]">X-API-Key</code> header on every{' '}
        <code className="f-mono text-[color:var(--ink-2)]">/v1/intent</code> request. Rotating replaces the key instantly and cannot be undone.
      </div>

      {revealed && <RevealedKey name={revealed.name} secret={revealed.key} onDone={() => setRevealed(null)} />}

      {loading ? (
        <Loading />
      ) : (
        <DataTable columns={columns} rows={projects} rowKey={p => p.id} empty={<EmptyState title="No API keys yet" hint="Create a project on the Projects page to generate your first key." />} />
      )}

      <ConfirmDialog
        open={!!confirmRotate}
        title="Rotate API key"
        message={
          <>
            Rotating the key for <b className="text-[color:var(--ink)]">{confirmRotate?.name}</b> invalidates the current key immediately. Update any live integration right after.
          </>
        }
        confirmLabel="Rotate key"
        busy={busy}
        onConfirm={() => confirmRotate && rotate(confirmRotate)}
        onCancel={() => setConfirmRotate(null)}
      />
    </div>
  )
}
