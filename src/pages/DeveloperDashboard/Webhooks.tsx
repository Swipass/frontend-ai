// src/pages/DeveloperDashboard/Webhooks.tsx
// Where Swipass pushes a project's intent lifecycle events, the signing secret
// used to prove a delivery came from us, a test ping, and what we actually sent.
import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { platformService, type WebhookTestResult } from '../../services/platformService'
import { PageTitle, Loading, EmptyState, Section, Field, inputCls, CopyButton, Badge } from './shared'
import { useProjects, useProjectParam } from './useProjects'
import { ProjectSelect } from './components/ProjectSelect'
import { DeliveriesTable, type WebhookDelivery } from './components/DeliveriesTable'

const EVENTS = [
  ['intent.quoted', 'A route was selected and a transaction built for one of your users.'],
  ['intent.completed', 'The transaction settled. Carries the truth return: what landed versus what was quoted.'],
  ['intent.failed', 'The transaction did not settle.'],
  ['ping', 'Sent by the test button below, signed like every other event.'],
]

export default function Webhooks() {
  const { projects, loading } = useProjects()
  const [projectId, setProjectId] = useProjectParam(projects)
  const [url, setUrl] = useState('')
  const [savedUrl, setSavedUrl] = useState('')
  const [hasSecret, setHasSecret] = useState(false)
  const [revealed, setRevealed] = useState<string | null>(null)
  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([])
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [test, setTest] = useState<WebhookTestResult | null>(null)

  const loadProject = useCallback(async () => {
    if (!projectId) return
    setRevealed(null)
    setTest(null)
    try {
      const config = await platformService.getWebhook(projectId)
      setUrl(config.webhook_url || '')
      setSavedUrl(config.webhook_url || '')
      setHasSecret(!!config.has_secret)
    } catch {
      setUrl('')
      setSavedUrl('')
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
      setSavedUrl(config.webhook_url || '')
      toast.success(config.webhook_url ? 'Webhook endpoint saved' : 'Webhook removed')
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

  const sendTest = async () => {
    setTesting(true)
    setTest(null)
    try {
      const result = await platformService.testWebhook(projectId)
      setTest(result)
      // The ping is recorded like any delivery.
      const d = await platformService.listWebhookDeliveries(projectId).catch(() => null)
      if (d) setDeliveries(d.deliveries || [])
    } catch (e: any) {
      toast.error(e?.message || 'Could not send the test event')
    } finally {
      setTesting(false)
    }
  }

  const header = (
    <PageTitle
      title="Webhooks"
      subtitle="We POST every intent event to your endpoint, signed so you can verify it came from us."
      right={projects.length > 0 ? <ProjectSelect projects={projects} value={projectId} onChange={setProjectId} /> : undefined}
    />
  )

  if (loading) return <>{header}<Loading /></>
  if (projects.length === 0) {
    return (
      <>
        {header}
        <EmptyState title="No projects yet" hint="Create a project first, then point it at your endpoint." />
      </>
    )
  }

  return (
    <div>
      {header}

      <Section title="Endpoint" className="mb-5">
        <Field label="Endpoint URL" hint="Must be https, except http://localhost while you develop. Leave empty to stop delivery.">
          <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://your-app.example.com/swipass/webhook" className={inputCls} />
        </Field>
        <div className="mt-4 flex flex-wrap gap-2.5">
          <button type="button" onClick={save} disabled={saving} className="pill pill-light h-10 disabled:opacity-50">
            {saving ? 'Saving...' : 'Save endpoint'}
          </button>
          {hasSecret && (
            <button type="button" onClick={rotate} disabled={saving} className="pill pill-dark h-10 disabled:opacity-50">
              Rotate signing secret
            </button>
          )}
          <button type="button" onClick={sendTest} disabled={testing || !savedUrl} title={savedUrl ? undefined : 'Save an endpoint first'} className="pill pill-dark h-10 disabled:opacity-50">
            {testing ? 'Sending...' : 'Send test event'}
          </button>
        </div>

        {test && (
          <div role="status" className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-[0.82rem]">
            <Badge tone={test.delivered ? 'strong' : 'muted'}>{test.delivered ? 'Delivered' : 'Not delivered'}</Badge>
            <span className="f-mono text-[color:var(--ink-3)]">{test.status != null ? `HTTP ${test.status}` : 'No response'}</span>
            {test.error && <span className="text-[color:var(--ink-3)]">{test.error}</span>}
            {test.delivered && !test.error && <span className="text-[color:var(--ink-4)]">Your endpoint accepted a signed ping.</span>}
          </div>
        )}

        {revealed && (
          <div role="alert" className="mt-4 rounded-2xl border border-white/25 p-4">
            <div className="kicker mb-2">Signing secret, shown once</div>
            <div className="flex flex-wrap items-center gap-3">
              <code className="f-mono break-all text-[0.9rem] text-[color:var(--ink)]">{revealed}</code>
              <CopyButton text={revealed} />
            </div>
            <p className="mt-2 text-[0.78rem] leading-relaxed text-[color:var(--ink-3)]">
              Store it now. Verify a delivery by reading the X-Swipass-Signature header (t=timestamp,v1=hmac) and recomputing HMAC-SHA256 over "timestamp.body" with this secret.
            </p>
          </div>
        )}
      </Section>

      <Section title="Events" className="mb-5">
        {EVENTS.map(([name, description]) => (
          <div key={name} className="border-b border-white/[0.06] py-2.5 last:border-0">
            <code className="f-mono text-[0.78rem] text-[color:var(--ink)]">{name}</code>
            <p className="mt-1 text-[0.8rem] text-[color:var(--ink-3)]">{description}</p>
          </div>
        ))}
      </Section>

      <Section title="Recent deliveries">
        <DeliveriesTable rows={deliveries} />
      </Section>
    </div>
  )
}
