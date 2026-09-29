import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { USE_MOCKS } from '@/api/client'
import { HOME_FOR_ROLE } from '@/auth/roles'
import { useSession } from '@/auth/session'
import { Field, FormError } from '@/components/forms/Field'
import { AuthCard, AuthNotice } from '@/components/layout/AuthLayout'
import { PageLoader } from '@/components/PageState'
import { Button } from '@/components/ui/button'
import { Input, PasswordInput } from '@/components/ui/input'
import { loginSchema, type LoginValues } from '@/lib/schemas'

/** Router state other pages pass to /login: where to return to, and a one-off message (e.g. after a reset). */
export interface LoginState {
  from?: string
  notice?: string
}

export default function Login() {
  const { user, isLoading, expired, signIn } = useSession()
  const navigate = useNavigate()
  const { from, notice } = (useLocation().state as LoginState | null) ?? {}
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) })

  const login = useMutation({
    mutationFn: (v: LoginValues) => signIn(v.email, v.password),
    onSuccess: (u) => navigate(from ?? HOME_FOR_ROLE[u.role], { replace: true }),
  })

  if (isLoading) return <PageLoader />
  if (user) return <Navigate to={HOME_FOR_ROLE[user.role]} replace />

  return (
    <AuthCard title="Sign in" description="For White Crane Board members, Trainers and Directorate reviewers.">
      {notice && <AuthNotice>{notice}</AuthNotice>}
      {!notice && expired && <AuthNotice tone="warn">Your session ended. Sign in again to continue.</AuthNotice>}
      <form onSubmit={handleSubmit((v) => login.mutate(v))} className="flex flex-col gap-4" noValidate>
        <Field label="Email" error={errors.email}>
          <Input type="email" autoComplete="email" placeholder="name@whitecrane.org" autoFocus {...register('email')} />
        </Field>
        <Field label="Password" error={errors.password}>
          <PasswordInput autoComplete="current-password" {...register('password')} />
        </Field>
        <FormError error={login.error} />
        <Button type="submit" block disabled={login.isPending}>
          {login.isPending ? 'Signing in...' : 'Sign in'}
        </Button>
        <Link to="/forgot-password" className="text-center text-[13px] font-semibold text-primary">
          Forgot your password?
        </Link>
        {USE_MOCKS && (
          <p className="rounded-md bg-surface p-3 text-xs text-muted-foreground">
            Mock mode: any password works. Try ronda@whitecrane.org (Board), t1@whitecrane.org (Trainer) or
            reviewer@directorate.org (Directorate).
          </p>
        )}
      </form>
      <p className="border-t pt-4 text-center text-[13px] text-muted-foreground">
        New to the team? Accounts are created by invitation. Ask a Board member to invite you.
        <br />
        Looking to list your DBT team?{' '}
        <Link to="/directory/apply" className="font-semibold text-primary">
          Apply to the directory
        </Link>
      </p>
    </AuthCard>
  )
}
