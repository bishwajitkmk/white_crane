import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { api } from '@/api/endpoints'
import type { User } from '@/api/types'
import { ROLE_LABEL } from '@/auth/roles'
import { useSession } from '@/auth/session'
import { Field, FormError } from '@/components/forms/Field'
import { DashboardPage } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Card, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { changePasswordSchema, profileSchema, type ChangePasswordValues, type ProfileValues } from '@/lib/schemas'

export default function Account() {
  const { user } = useSession()
  if (!user) return null
  return (
    <DashboardPage title="My account">
      <div className="grid items-start gap-5 xl:grid-cols-2">
        <ProfileCard user={user} />
        <PasswordCard />
      </div>
    </DashboardPage>
  )
}

function ProfileCard({ user }: { user: User }) {
  const { setUser } = useSession()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileValues>({ resolver: zodResolver(profileSchema), defaultValues: { name: user.name, email: user.email } })
  const save = useMutation({
    mutationFn: api.admin.updateProfile,
    onSuccess: (u) => {
      setUser(u)
      reset({ name: u.name, email: u.email })
    },
  })

  return (
    <Card className="gap-4 p-6">
      <CardTitle>Profile</CardTitle>
      <form onSubmit={handleSubmit((v) => save.mutate(v))} className="flex flex-col gap-4" noValidate>
        <Field label="Name" error={errors.name}>
          <Input autoComplete="name" {...register('name')} />
        </Field>
        <Field label="Email" error={errors.email}>
          <Input type="email" autoComplete="email" {...register('email')} />
        </Field>
        <span className="text-xs text-muted-foreground">
          Role: {ROLE_LABEL[user.role]}. Contact a Board member to change roles.
        </span>
        <FormError error={save.error} />
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={save.isPending || !isDirty}>
            Save
          </Button>
          {save.isSuccess && !isDirty && <span className="text-[13px] text-success">Saved</span>}
        </div>
      </form>
    </Card>
  )
}

function PasswordCard() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordValues>({ resolver: zodResolver(changePasswordSchema) })
  const change = useMutation({
    mutationFn: (v: ChangePasswordValues) => api.admin.changePassword(v.current, v.password),
    onSuccess: () => reset({ current: '', password: '', confirm: '' }),
  })

  return (
    <Card className="gap-4 p-6">
      <CardTitle>Password</CardTitle>
      <form onSubmit={handleSubmit((v) => change.mutate(v))} className="flex flex-col gap-4" noValidate>
        <Field label="Current password" error={errors.current}>
          <Input type="password" autoComplete="current-password" {...register('current')} />
        </Field>
        <Field label="New password" error={errors.password} hint="At least 10 characters">
          <Input type="password" autoComplete="new-password" {...register('password')} />
        </Field>
        <Field label="Confirm new password" error={errors.confirm}>
          <Input type="password" autoComplete="new-password" {...register('confirm')} />
        </Field>
        <FormError error={change.error} />
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={change.isPending}>
            Update password
          </Button>
          {change.isSuccess && <span className="text-[13px] text-success">Password updated</span>}
        </div>
      </form>
    </Card>
  )
}
