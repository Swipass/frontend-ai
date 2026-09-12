// src/pages/AdminDashboard/components/ReasonDialog.tsx
// A confirm dialog for audited changes: it will not confirm without a reason,
// which the backend records next to the action. Extra fields go in `children`.
import { useEffect, useState, type ReactNode } from 'react'
import { Modal, Field, inputCls } from '../shared'

export function ReasonDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  busy,
  disabled,
  children,
  onConfirm,
  onCancel,
}: {
  open: boolean
  title: string
  message?: ReactNode
  confirmLabel?: string
  busy?: boolean
  /** Blocks confirming while an extra field is invalid. */
  disabled?: boolean
  children?: ReactNode
  onConfirm: (reason: string) => void
  onCancel: () => void
}) {
  const [reason, setReason] = useState('')
  useEffect(() => {
    if (open) setReason('')
  }, [open])

  const ready = reason.trim().length >= 3 && !disabled && !busy

  return (
    <Modal open={open} title={title} onClose={onCancel}>
      {message && <p className="mb-5 text-[0.9rem] leading-relaxed text-[color:var(--ink-3)]">{message}</p>}
      <div className="flex flex-col gap-4">
        {children}
        <Field label="Reason" hint="Recorded in the audit log with this change.">
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            rows={3}
            placeholder="Why this change is being made"
            className={`${inputCls} resize-y`}
            autoFocus
          />
        </Field>
      </div>
      <div className="mt-6 flex justify-end gap-2.5">
        <button type="button" onClick={onCancel} className="pill pill-dark h-10">
          Cancel
        </button>
        <button type="button" onClick={() => ready && onConfirm(reason.trim())} disabled={!ready} className="pill pill-light h-10 disabled:opacity-50">
          {busy ? 'Working...' : confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
