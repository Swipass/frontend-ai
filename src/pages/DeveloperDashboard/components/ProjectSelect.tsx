// src/pages/DeveloperDashboard/components/ProjectSelect.tsx
import type { Project } from '../../../services/platformService'
import { selectCls } from '../shared'

export function ProjectSelect({
  projects,
  value,
  onChange,
}: {
  projects: Project[]
  value: string
  onChange: (id: string) => void
}) {
  return (
    <label className="inline-flex items-center">
      <span className="sr-only">Project</span>
      <select value={value} onChange={e => onChange(e.target.value)} className={`${selectCls} h-9 max-w-[14rem] px-3.5 text-[0.8rem]`}>
        {projects.map(p => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
    </label>
  )
}
