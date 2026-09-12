// src/pages/AdminDashboard/emergency/SignOutAll.tsx
// Ends every dashboard session except the caller's own.
import { Section } from '../shared'
import { Note } from '../components/Controls'

export function SignOutAll({ canEdit, busy, onClick }: { canEdit: boolean; busy: boolean; onClick: () => void }) {
  return (
    <Section title="Sign everyone out" subtitle="Every developer and staff session ends at once; only your own stays signed in. Use it after a credential leak.">
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" disabled={!canEdit || busy} onClick={onClick} className="pill pill-outline h-10 disabled:opacity-40">
          Sign everyone out
        </button>
        {!canEdit && <Note>Only a super admin can do this.</Note>}
      </div>
    </Section>
  )
}
