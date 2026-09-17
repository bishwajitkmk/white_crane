import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '@/api/endpoints'
import { HOME_FOR_ROLE, ROLE_LABEL } from '@/auth/roles'
import { useSession } from '@/auth/session'
import { Field, FormError } from '@/components/forms/Field'
import { AuthCard } from '@/components/layout/AuthLayout'
import { ErrorState, PageLoader } from '@/components/PageState'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { acceptInviteSchema, type AcceptInviteValues } from '@/lib/schemas'

export default function AcceptInvite() {
  const { token = '' } = useParams()
  const navigate = useNavigate()
  const { setUser } = useSession()
  const invite = useQuery({ queryKey: ['invite', token], queryFn: () => api.auth.invite(token), retry: false })
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AcceptInviteValues>({ resolver: zodResolver(acceptInviteSchema) })
  const accept = useMutation({
    mutationFn: (v: AcceptInviteValues) => api.auth.acceptInvite(token, v.name, v.password),
    onSuccess: (user) => {
      setUser(user)
      navigate(HOME_FOR_ROLE[user.role], { replace: true })
    },
  })

  if (invite.isLoading) return <PageLoader />
  if (invite.error || !invite.data) return <ErrorState error={new Error('This invite link is invalid or has expired.')} />

  return (
    <AuthCard
      title="Welcome to White Crane"
      description={`You were invited as ${ROLE_LABEL[invite.data.role]} by ${invite.data.invited_by}. Set a password to finish.`}
    >
      <form onSubmit={handleSubmit((v) => accept.mutate(v))} className="flex flex-col gap-4" noValidate>
        <Field label="Name" error={errors.name}>
          <Input autoComplete="name" {...register('name')} />
        </Field>
        <Field label="Email (read only)">
          <Input value={invite.data.email} readOnly disabled />
        </Field>
        <Field label="Password" error={errors.password} hint="At least 10 characters">
          <Input type="password" autoComplete="new-password" {...register('password')} />
        </Field>
        <FormError error={accept.error} />
        <Button type="submit" block disabled={accept.isPending}>
          Create account
        </Button>
      </form>
    </AuthCard>
  )
}
