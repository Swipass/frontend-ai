// src/pages/DeveloperDashboard/Webhooks.tsx
// Where Swipass pushes a project's intent lifecycle events, the signing secret
// used to prove a delivery came from us, and what we actually sent.
import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { platformService } from '../../services/platformService'
import {
  PageTitle, Loading, EmptyState, Field, inputCls, CopyButton,
} from './shared'

const EVENTS = [
  ['intent.quoted', 'A route was selected and a transaction built for one of your users.'],
  ['intent.completed', 'The transaction settled. Carries the truth return: what landed versus what was quoted.'],
  ['intent.failed', 'The transaction did not settle.'],
]

export default function Webhooks() {
  const [projects, setProjects] = useState<any[]>([])
  const [projectId, setProjectId] = useState('')
  const [url, setUrl] = useState('')
  const [hasSecret, setHasSecret] = useState(false)
  const [revealed, setRevealed] = useState<string | null>(null)
  const [deliveries, setDeliveries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    platformService
      .listProjects()
      .then(list => {
        setProjects(list || [])
        if (list?.length) setProjectId(list[0].id)
      })
      .catch(() => setProjects([]))
      .finally(() => setLoading(false))
  }, [])

  const loadProject = useCallback(async () => {
    if (!projectId) return
    setRevealed(null)
    try {
      const config = await platformService.getWebhook(projectId)
      setUrl(config.webhook_url || '')
      setHasSecret(!!config.has_secret)
    } catch {
      setUrl('')
      setHasSecret(false)
    }
    try {
      const d = await platformService.listWebhookDeliveries(projectId)
      setDeliveries(d.deliveries || [])
    } catch {
      setDeliveries([])
    }
  }, [projectId])

  useEffect(() => {
    loadProject()
  }, [loadProject])

  const save = async () => {
    setSaving(true)
    try {
      const config = await platformService.setWebhook(projectId, url.trim() || null)
      setHasSecret(!!config.has_secret)
      if (config.secret) setRevealed(config.secret)
      toast.success(config.webhook_url ? 'Webhook endpoint saved' : 'Webhook removed')
      loadProject()
    } catch (e: any) {
      toast.error(e?.message || 'Could not save the webhook')
    } finally {
      setSaving(false)
    }
  }

  const rotate = async () => {
    setSaving(true)
    try {
      const config = await platformService.rotateWebhookSecret(projectId)
      setRevealed(config.secret || null)
      toast.success('New signing secret issued. The previous one no longer verifies.')
    } catch (e: any) {
      toast.error(e?.message || 'Could not rotate the secret')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Loading />
  if (projects.length === 0)
    return (
      <div>
        <PageTitle title="Webhooks" subtitle="Get told what happened, without polling." />
        <EmptyState title="No projects yet" hint="Create a project first, then point it at your endpoint." />
      </div>
    )

  return (
    <div>
      <PageTitle
        title="Webhooks"
        subtitle="We POST every intent event to your endpoint, signed so you can verify it came from us."
        right={
          <select
            value={projectId}
            onChange={e => setProjectId(e.target.value)}
            className="bg-dark-grey-2 border border-mid-grey rounded px-3 py-2 text-xs text-light-grey-2 font-mono focus:outline-none"
          >
            {projects.map(p => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        }
      />

      <div className="dash-card mb-6">
        <Field
          label="Endpoint URL"
          hint="Must be https, except http://localhost while you develop. Leave empty to stop delivery."
        >
          <input
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://your-app.example.com/swipass/webhook"
            className={inputCls}
          />
        </Field>
        <div className="flex flex-wrap gap-3 mt-4">
          <button onClick={save} disabled={saving} className="sw-btn sw-btn-primary text-xs py-2 px-4 disabled:opacity-40">
            {saving ? 'Saving...' : 'Save endpoint'}
          </button>
          {hasSecret && (
            <button onClick={rotate} disabled={saving} className="sw-btn sw-btn-ghost text-xs py-2 px-4">
              Rotate signing secret
            </button>
          )}
        </div>

        {revealed && (
          <div className="mt-4 border border-mid-grey rounded p-4">
            <div className="text-xs uppercase tracking-wider text-light-grey-1 mb-2">
              Signing secret, shown once
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <code className="font-mono text-sm text-almost-white break-all">{revealed}</code>
              <CopyButton text={revealed} />
            </div>
            <p className="text-xs text-light-grey-1 mt-2 leading-relaxed">
              Store it now. Verify a delivery by reading the X-Swipass-Signature header (t=timestamp,v1=hmac) and
              recomputing HMAC-SHA256 over "timestamp.body" with this secret.
            </p>
          </div>
        )}
      </div>

      <div className="dash-card mb-6">
        <div className="font-display text-base font-semibold text-almost-white mb-3">Events</div>
        {EVENTS.map(([name, description]) => (
          <div key={name} className="border-b border-dark-grey-3 py-2 last:border-0">
            <code className="font-mono text-xs text-light-grey-3">{name}</code>
            <p className="text-xs text-light-grey-1 mt-1">{description}</p>
          </div>
        ))}
      </div>

      <div className="font-display text-base font-semibold text-almost-white mb-3">Recent deliveries</div>
      {deliveries.length === 0 ? (
        <EmptyState
          title="No deliveries yet"
          hint="Once your endpoint is set, every intent event and our attempts to deliver it appear here."
        />
      ) : (
        <div className="border border-dark-grey-3 rounded-lg overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-dark-grey-2 text-light-grey-1 text-xs uppercase tracking-wider">
              <tr>
                <th className="p-3 text-left">Time</th>
                <th className="p-3 text-left">Event</th>
                <th className="p-3 text-left">Result</th>
                <th className="p-3 text-left">Attempts</th>
                <th className="p-3 text-left">Intent</th>
              </tr>
            </thead>
            <tbody>
              {deliveries.map(d => (
                <tr key={d.id} className="border-b border-dark-grey-3 hover:bg-dark-grey-2">
                  <td className="p-3 text-light-grey-1 whitespace-nowrap">
                    {d.created_at ? new Date(d.created_at).toLocaleString() : '-'}
                  </td>
                  <td className="p-3 font-mono text-xs text-light-grey-3">{d.event}</td>
                  <td className="p-3 text-light-grey-2">
                    {d.delivered ? `Delivered (${d.response_status})` : d.error || 'Failed'}
                  </td>
                  <td className="p-3 text-light-grey-1">{d.attempts}</td>
                  <td className="p-3 font-mono text-xs text-light-grey-1 break-all">{d.intent_id || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
