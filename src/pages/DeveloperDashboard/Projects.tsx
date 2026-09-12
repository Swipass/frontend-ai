// src/pages/DeveloperDashboard/Projects.tsx
// The developer's projects: create one, pause or resume it, rotate its key,
// delete it. Each project has its own API key and earnings.
import { useState } from 'react'
import toast from 'react-hot-toast'
import { platformService, type Project } from '../../services/platformService'
import { PageTitle, Loading, EmptyState, ConfirmDialog } from './shared'
import { useProjects } from './useProjects'
import { ProjectCard } from './components/ProjectCard'
import { CreateProjectForm } from './components/CreateProjectForm'
import { RevealedKey } from './components/RevealedKey'

type Pending = { kind: 'rotate' | 'delete' | 'pause'; project: Project } | null

export default function Projects() {
  const { projects, loading, reload } = useProjects()
  const [creating, setCreating] = useState(false)
  const [busy, setBusy] = useState(false)
  // Reveal-once secret: a freshly created key or a rotated one.
  const [revealed, setRevealed] = useState<{ key: string; name: string } | null>(null)
  const [pending, setPending] = useState<Pending>(null)

  const run = async (work: () => Promise<void>, fallback: string) => {
    setBusy(true)
    try {
      await work()
      setPending(null)
      await reload()
    } catch (e: any) {
      toast.error(e?.message || fallback)
    } finally {
      setBusy(false)
    }
  }

  const create = (name: string, description?: string) =>
    run(async () => {
      const res = await platformService.createProject(name, description)
      setRevealed({ key: res.api_key, name })
      setCreating(false)
      toast.success('Project created')
    }, 'Could not create the project')

  const rotate = (p: Project) =>
    run(async () => {
      const res = await platformService.regenerateKey(p.id)
      setRevealed({ key: res.api_key, name: p.name })
      toast.success('API key rotated')
    }, 'Could not rotate the key')

  const remove = (p: Project) =>
    run(async () => {
      await platformService.deleteProject(p.id)
      toast.success('Project deleted')
    }, 'Could not delete the project')

  const setStatus = (p: Project, status: 'active' | 'paused') =>
    run(async () => {
      await platformService.setProjectStatus(p.id, status)
      toast.success(status === 'paused' ? `${p.name} paused` : `${p.name} is live again`)
    }, 'Could not change the project status')

  const confirm = pending
  return (
    <div>
      <PageTitle
        title="Projects"
        subtitle="Each project has its own API key and earnings."
        right={
          <button type="button" onClick={() => setCreating(v => !v)} className={`h-10 ${creating ? 'pill pill-dark' : 'pill pill-light'}`}>
            {creating ? 'Close' : 'New project'}
          </button>
        }
      />

      {revealed && <RevealedKey name={revealed.name} secret={revealed.key} onDone={() => setRevealed(null)} />}
      {creating && <CreateProjectForm busy={busy} onCreate={create} onCancel={() => setCreating(false)} />}

      {loading ? (
        <Loading />
      ) : projects.length === 0 ? (
        <EmptyState title="No projects yet" hint="Create a project to generate an API key and start routing intents.">
          {!creating && (
            <button type="button" onClick={() => setCreating(true)} className="pill pill-light h-10">
              New project
            </button>
          )}
        </EmptyState>
      ) : (
        <div className="flex flex-col gap-4">
          {projects.map(p => (
            <ProjectCard
              key={p.id}
              project={p}
              busy={busy}
              onPause={() => setPending({ kind: 'pause', project: p })}
              onResume={() => setStatus(p, 'active')}
              onRotate={() => setPending({ kind: 'rotate', project: p })}
              onDelete={() => setPending({ kind: 'delete', project: p })}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={confirm?.kind === 'pause'}
        title="Pause project"
        message={
          <>
            While <b className="text-[color:var(--ink)]">{confirm?.project.name}</b> is paused, requests with its API key are refused. Its balance and history stay as they are, and you can resume it at any time.
          </>
        }
        confirmLabel="Pause"
        busy={busy}
        onConfirm={() => confirm && setStatus(confirm.project, 'paused')}
        onCancel={() => setPending(null)}
      />
      <ConfirmDialog
        open={confirm?.kind === 'rotate'}
        title="Rotate API key"
        message={
          <>
            Rotating the key for <b className="text-[color:var(--ink)]">{confirm?.project.name}</b> immediately invalidates the current key. Any live integration using it stops working until updated.
          </>
        }
        confirmLabel="Rotate key"
        busy={busy}
        onConfirm={() => confirm && rotate(confirm.project)}
        onCancel={() => setPending(null)}
      />
      <ConfirmDialog
        open={confirm?.kind === 'delete'}
        title="Delete project"
        message={
          <>
            Delete <b className="text-[color:var(--ink)]">{confirm?.project.name}</b>? This revokes its API key and cannot be undone.
          </>
        }
        confirmLabel="Delete"
        busy={busy}
        onConfirm={() => confirm && remove(confirm.project)}
        onCancel={() => setPending(null)}
      />
    </div>
  )
}
