// src/pages/AdminDashboard/Emergency.tsx
// The switches that stop parts of the platform in seconds. Every change asks
// for a reason and lands in the audit log. Read-only below super admin.
import { useCallback, useState } from 'react'
import toast from 'react-hot-toast'
import { adminService, type EmergencyUpdate } from '../../services/adminService'
import { PageTitle, Loading, EmptyState, AlertItem } from './shared'
import { useAdminRole, useLoad } from './hooks'
import { fullDateFromAny } from './format'
import { ReasonDialog } from './components/ReasonDialog'
import { KillSwitch } from './emergency/KillSwitch'
import { SwitchGrid } from './emergency/SwitchGrid'
import { Limits } from './emergency/Limits'
import { SignOutAll } from './emergency/SignOutAll'

type Pending =
  | { kind: 'update'; title: string; message: string; confirmLabel: string; changes: Omit<EmergencyUpdate, 'reason'> }
  | { kind: 'sign-out'; title: string; message: string; confirmLabel: string }

export default function Emergency() {
  const { isSuperAdmin } = useAdminRole()
  const fetcher = useCallback(() => adminService.getEmergency(), [])
  const { data, setData, loading, error } = useLoad(fetcher, 'Could not load the emergency switches')
  const [pending, setPending] = useState<Pending | null>(null)
  const [busy, setBusy] = useState(false)

  const confirm = async (reason: string) => {
    if (!pending) return
    setBusy(true)
    try {
      if (pending.kind === 'update') {
        setData(await adminService.updateEmergency({ ...pending.changes, reason }))
        toast.success('Saved')
      } else {
        const res = await adminService.signOutEveryone(reason)
        toast.success(`${res.signed_out} session${res.signed_out === 1 ? '' : 's'} signed out`)
      }
      setPending(null)
    } catch (e: any) {
      toast.error(e?.message || 'The change was not applied')
    } finally {
      setBusy(false)
    }
  }

  if (loading && !data) return <><PageTitle title="Emergency" /><Loading /></>
  if (!data) return <><PageTitle title="Emergency" /><EmptyState title="Emergency controls are not available" hint={error || 'The emergency endpoint did not answer.'} /></>

  const active = Object.entries(data.switches || {}).filter(([, on]) => on).map(([name]) => name)

  return (
    <div>
      <PageTitle
        title="Emergency"
        subtitle="Stop parts of the platform without a deploy. Every change is audited with its reason."
        right={
          <div className="text-right text-[0.76rem] text-[color:var(--ink-4)]">
            {data.updated_at ? (
              <>
                Last change {fullDateFromAny(data.updated_at)}
                {data.updated_by && <span className="block">by {data.updated_by}</span>}
              </>
            ) : (
              'No changes recorded yet'
            )}
          </div>
        }
      />

      {!isSuperAdmin && (
        <div className="mb-6">
          <AlertItem level="info" title="Read-only view" detail="Your role can see the switches but not change them. A super admin can." />
        </div>
      )}

      {active.length > 0 && !data.system_paused && (
        <div className="mb-6">
          <AlertItem level="warning" title={`${active.length} switch${active.length === 1 ? '' : 'es'} on`} detail={active.map(s => s.replace(/_/g, ' ')).join(', ')} />
        </div>
      )}

      <KillSwitch
        paused={data.system_paused}
        canEdit={isSuperAdmin}
        busy={busy}
        onChange={paused =>
          setPending({
            kind: 'update',
            title: paused ? 'Pause the platform' : 'Resume the platform',
            message: paused ? 'Every intent request will be refused with 503 until you resume.' : 'Intent requests will be accepted again.',
            confirmLabel: paused ? 'Pause platform' : 'Resume platform',
            changes: { system_paused: paused },
          })
        }
      />

      <SwitchGrid
        state={data}
        canEdit={isSuperAdmin}
        busy={busy}
        onChange={(name, on) =>
          setPending({
            kind: 'update',
            title: `${on ? 'Turn on' : 'Turn off'} ${name.replace(/_/g, ' ')}`,
            message: data.descriptions?.[name] || '',
            confirmLabel: on ? 'Turn on' : 'Turn off',
            changes: { switches: { [name]: on } },
          })
        }
      />

      <Limits
        state={data}
        canEdit={isSuperAdmin}
        busy={busy}
        onSaveCap={cap =>
          setPending({
            kind: 'update',
            title: cap === null ? 'Remove the trade cap' : 'Set the trade cap',
            message: cap === null ? 'Intents of any size will be accepted again.' : `Intents worth more than $${cap.toLocaleString()} will be refused.`,
            confirmLabel: 'Save cap',
            changes: { max_intent_usd: cap },
          })
        }
        onSaveMessage={message =>
          setPending({
            kind: 'update',
            title: message === null ? 'Clear the maintenance message' : 'Set the maintenance message',
            message: message === null ? 'The app banner will disappear unless the platform is paused.' : 'Users will see this in the app banner as soon as it is saved.',
            confirmLabel: 'Save message',
            changes: { maintenance_message: message },
          })
        }
      />

      <SignOutAll
        canEdit={isSuperAdmin}
        busy={busy}
        onClick={() =>
          setPending({
            kind: 'sign-out',
            title: 'Sign everyone out',
            message: 'Every session except yours ends now. People sign in again with their usual method.',
            confirmLabel: 'Sign everyone out',
          })
        }
      />

      <ReasonDialog
        open={!!pending}
        title={pending?.title || ''}
        message={pending?.message}
        confirmLabel={pending?.confirmLabel}
        busy={busy}
        onConfirm={confirm}
        onCancel={() => setPending(null)}
      />
    </div>
  )
}
