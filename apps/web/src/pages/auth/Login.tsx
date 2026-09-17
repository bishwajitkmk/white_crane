import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { USE_MOCKS } from '@/api/client'
import { HOME_FOR_ROLE } from '@/auth/roles'
import { useSession } from '@/auth/session'
import { Field, FormError } from '@/components/forms/Field'
import { AuthCard } from '@/components/layout/AuthLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { loginSchema, type LoginValues } from '@/lib/schemas'

export default function Login() {
  const { user, signIn } = useSession()
  const navigate = useNavigate()
  const from = (useLocation().state as { from?: string } | null)?.from
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) })

  const login = useMutation({
    mutationFn: (v: LoginValues) => signIn(v.email, v.password),
    onSuccess: (u) => navigate(from ?? HOME_FOR_ROLE[u.role], { replace: true }),
  })

  if (user) return <Navigate to={HOME_FOR_ROLE[user.role]} replace />

  return (
    <AuthCard title="Sign in" description="Board, Trainers and Directorate only. No public sign-up.">
      <form onSubmit={handleSubmit((v) => login.mutate(v))} className="flex flex-col gap-4" noValidate>
        <Field label="Email" error={errors.email}>
          <Input type="email" autoComplete="email" placeholder="name@whitecrane.org" {...register('email')} />
        </Field>
        <Field label="Password" error={errors.password}>
          <Input type="password" autoComplete="current-password" {...register('password')} />
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
    </AuthCard>
  )
}
