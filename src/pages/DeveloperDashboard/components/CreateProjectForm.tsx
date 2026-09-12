// src/pages/DeveloperDashboard/components/CreateProjectForm.tsx
import { useState } from 'react'
import { Field, inputCls } from '../shared'

export function CreateProjectForm({ busy, onCreate, onCancel }: { busy: boolean; onCreate: (name: string, description?: string) => void; onCancel: () => void }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const submit = () => {
    if (name.trim()) onCreate(name.trim(), description.trim() || undefined)
  }
  return (
    <div className="dash-card mb-5">
      <h2 className="mb-4 text-[1.02rem] text-[color:var(--ink)]">New project</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Name">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="My integration" onKeyDown={e => e.key === 'Enter' && submit()} className={inputCls} autoFocus />
        </Field>
        <Field label="Description (optional)">
          <input value={description} onChange={e => setDescription(e.target.value)} placeholder="What is this for?" onKeyDown={e => e.key === 'Enter' && submit()} className={inputCls} />
        </Field>
      </div>
      <div className="mt-4 flex gap-2.5">
        <button type="button" onClick={submit} disabled={busy || !name.trim()} className="pill pill-light h-10 disabled:opacity-50">
          {busy ? 'Creating...' : 'Create project'}
        </button>
        <button type="button" onClick={onCancel} className="pill pill-dark h-10">
          Cancel
        </button>
      </div>
    </div>
  )
}
