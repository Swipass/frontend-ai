// src/pages/DeveloperDashboard/useProjects.ts
// The signed-in developer's projects, and the one a page is looking at. The
// choice lives in the URL (?project=), so a link from the overview opens the
// right project and a reload keeps it.
import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { platformService, type Project } from '../../services/platformService'

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(
    () =>
      platformService
        .listProjects()
        .then(list => setProjects(list || []))
        .catch((e: Error) => toast.error(e?.message || 'Could not load your projects'))
        .finally(() => setLoading(false)),
    []
  )

  useEffect(() => {
    reload()
  }, [reload])

  return { projects, setProjects, loading, reload }
}

export function useProjectParam(projects: Project[]): [string, (id: string) => void] {
  const [params, setParams] = useSearchParams()
  const wanted = params.get('project') || ''
  const selected = projects.some(p => p.id === wanted) ? wanted : projects[0]?.id || ''

  const select = useCallback(
    (id: string) =>
      setParams(
        prev => {
          const next = new URLSearchParams(prev)
          next.set('project', id)
          return next
        },
        { replace: true }
      ),
    [setParams]
  )

  return [selected, select]
}
