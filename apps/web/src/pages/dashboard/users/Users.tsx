import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { useSearchParams } from 'react-router-dom'
import { api } from '@/api/endpoints'
import type { Role } from '@/api/types'
import { ROLE_LABEL } from '@/auth/roles'
import { DataTable } from '@/components/DataTable'
import { Field, FieldRow, FormError } from '@/components/forms/Field'
import { DashboardPage, Toolbar } from '@/components/layout/DashboardLayout'
import { QueryState } from '@/components/PageState'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { keys, useInvalidatingMutation, useUsers } from '@/hooks/queries'
import { relativeDays } from '@/lib/format'
import { inviteSchema, type InviteValues } from '@/lib/schemas'

export default function Users() {
  const users = useUsers()
  const [params, setParams] = useSearchParams()
  const inviting = params.get('invite') === '1'
  const setInviting = (open: boolean) => setParams(open ? { invite: '1' } : {})
  const resend = useInvalidatingMutation(api.admin.resendInvite, [keys.users])

  return (
    <DashboardPage title="Users">
      <Toolbar>
        <span className="text-[13px] text-muted-foreground">
          Roles: Board (everything), Trainer (trainings), Directorate (directory).
        </span>
        <Button size="sm" onClick={() => setInviting(true)}>
          Invite user
        </Button>
      </Toolbar>
      <QueryState query={users}>
        {(rows) => (
          <DataTable
            rows={rows}
            rowKey={(u) => u.id}
            columns={[
              { header: 'Name', cell: (u) => <span className="font-semibold">{u.name}</span> },
              { header: 'Email', cell: (u) => u.email },
              { header: 'Role', cell: (u) => <Badge variant="acc">{ROLE_LABEL[u.role]}</Badge> },
              { header: 'Status', cell: (u) => (u.status === 'active' ? <Badge variant="ok">Active</Badge> : <Badge variant="warn">Invited</Badge>) },
              { header: 'Last sign in', cell: (u) => relativeDays(u.last_sign_in_at) },
              {
                header: '',
                cell: (u) =>
                  u.status === 'invited' ? (
                    <Button variant="link" disabled={resend.isPending} onClick={() => resend.mutate(u.id)}>
                      {resend.isSuccess && resend.variables === u.id ? 'Invite sent' : 'Resend invite'}
                    </Button>
                  ) : null,
              },
            ]}
          />
        )}
      </QueryState>
      <Dialog open={inviting} onClose={() => setInviting(false)} title="Invite user">
        <InviteForm onDone={() => setInviting(false)} />
      </Dialog>
    </DashboardPage>
  )
}

function InviteForm({ onDone }: { onDone: () => void }) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<InviteValues>({ resolver: zodResolver(inviteSchema), defaultValues: { name: '', email: '', role: 'directorate' } })
  const invite = useInvalidatingMutation(api.admin.inviteUser, [keys.users])
  const role = useWatch({ control, name: 'role' })

  return (
    <form onSubmit={handleSubmit((v) => invite.mutate(v, { onSuccess: onDone }))} className="flex flex-col gap-4" noValidate>
      <FieldRow>
        <Field label="Name" required error={errors.name}>
          <Input {...register('name')} />
        </Field>
        <Field label="Email" required error={errors.email}>
          <Input type="email" {...register('email')} />
        </Field>
      </FieldRow>
      <div className="flex flex-col gap-1.5">
        <span className="text-[13px] font-semibold">Role</span>
        <div className="flex gap-2" role="radiogroup" aria-label="Role">
          {(Object.keys(ROLE_LABEL) as Role[]).map((r) => (
            <Button key={r} size="sm" role="radio" aria-checked={role === r} variant={role === r ? 'default' : 'secondary'} onClick={() => setValue('role', r)}>
              {ROLE_LABEL[r]}
            </Button>
          ))}
        </div>
      </div>
      <span className="text-xs text-muted-foreground">Sends an email with a one-time link. Expires in 7 days.</span>
      <FormError error={invite.error} />
      <div>
        <Button type="submit" disabled={invite.isPending}>
          Send invite
        </Button>
      </div>
    </form>
  )
}
