import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api, type InviteInfo } from '@/api/endpoints'
import { HOME_FOR_ROLE, ROLE_LABEL } from '@/auth/roles'
import { useSession } from '@/auth/session'
import { Field, FormError } from '@/components/forms/Field'
import { AuthCard } from '@/components/layout/AuthLayout'
import { PageLoader } from '@/components/PageState'
import { Button } from '@/components/ui/button'
import { Input, PasswordInput } from '@/components/ui/input'
import { acceptInviteSchema, type AcceptInviteValues } from '@/lib/schemas'

/** /invite/:token, the only way to create an account: a Board member invites, the invitee sets a password here. */
export default function AcceptInvite() {
  const { token = '' } = useParams()
  const invite = useQuery({ queryKey: ['invite', token], queryFn: () => api.auth.invite(token), retry: false })

  if (invite.isLoading) return <PageLoader />
  if (invite.error || !invite.data) {
    return (
      <AuthCard
        title="This invite link doesn't work"
        description="It may have expired (links last 7 days), been replaced by a newer invite, or already been used."
      >
        <p className="text-center text-[13px] text-muted-foreground">
          Ask the Board member who invited you to resend the invite from the Users page.
        </p>
        <Link to="/login" className="text-center text-[13px] font-semibold text-primary">
          Already set up? Sign in
        </Link>
      </AuthCard>
    )
  }
  return <AcceptForm token={token} invite={invite.data} />
}

function AcceptForm({ token, invite }: { token: string; invite: InviteInfo }) {
  const navigate = useNavigate()
  const { setUser } = useSession()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AcceptInviteValues>({
    resolver: zodResolver(acceptInviteSchema),
    defaultValues: { name: invite.name, password: '', confirm: '' },
  })
  const accept = useMutation({
    mutationFn: (v: AcceptInviteValues) => api.auth.acceptInvite(token, v.name, v.password),
    onSuccess: (user) => {
      setUser(user)
      navigate(HOME_FOR_ROLE[user.role], { replace: true })
    },
  })

  return (
    <AuthCard
      title="Welcome to White Crane"
      description={`${invite.invited_by} invited you as ${ROLE_LABEL[invite.role]}. Choose a password to finish setting up your account.`}
    >
      <form onSubmit={handleSubmit((v) => accept.mutate(v))} className="flex flex-col gap-4" noValidate>
        <Field label="Email">
          <Input value={invite.email} readOnly disabled />
        </Field>
        <Field label="Your name" error={errors.name}>
          <Input autoComplete="name" {...register('name')} />
        </Field>
        <Field label="Password" error={errors.password} hint="At least 10 characters">
          <PasswordInput autoComplete="new-password" autoFocus {...register('password')} />
        </Field>
        <Field label="Confirm password" error={errors.confirm}>
          <PasswordInput autoComplete="new-password" {...register('confirm')} />
        </Field>
        <FormError error={accept.error} />
        <Button type="submit" block disabled={accept.isPending}>
          {accept.isPending ? 'Setting up...' : 'Create account'}
        </Button>
      </form>
    </AuthCard>
  )
}
