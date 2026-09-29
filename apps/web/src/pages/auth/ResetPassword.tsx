import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ApiError } from '@/api/client'
import { api } from '@/api/endpoints'
import { Field, FormError } from '@/components/forms/Field'
import { AuthCard } from '@/components/layout/AuthLayout'
import { Button } from '@/components/ui/button'
import { PasswordInput } from '@/components/ui/input'
import { resetPasswordSchema, type ResetPasswordValues } from '@/lib/schemas'
import type { LoginState } from './Login'

export default function ResetPassword() {
  const { token = '' } = useParams()
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordValues>({ resolver: zodResolver(resetPasswordSchema) })
  const reset = useMutation({
    mutationFn: (v: ResetPasswordValues) => api.auth.reset(token, v.password),
    onSuccess: () =>
      navigate('/login', {
        replace: true,
        state: { notice: 'Password updated. Sign in with your new password.' } satisfies LoginState,
      }),
  })
  // 400 = link expired, already used, or replaced by a newer one.
  const linkDead = reset.error instanceof ApiError && reset.error.status === 400

  return (
    <AuthCard title="Choose a new password" description="Reset links expire after 60 minutes and work once.">
      <form onSubmit={handleSubmit((v) => reset.mutate(v))} className="flex flex-col gap-4" noValidate>
        <Field label="New password" error={errors.password} hint="At least 10 characters">
          <PasswordInput autoComplete="new-password" autoFocus {...register('password')} />
        </Field>
        <Field label="Confirm password" error={errors.confirm}>
          <PasswordInput autoComplete="new-password" {...register('confirm')} />
        </Field>
        <FormError error={reset.error} />
        {linkDead ? (
          <Link to="/forgot-password" className="text-center text-[13px] font-semibold text-primary">
            Request a new reset link
          </Link>
        ) : (
          <Button type="submit" block disabled={reset.isPending}>
            {reset.isPending ? 'Saving...' : 'Save password'}
          </Button>
        )}
      </form>
      <Link to="/login" className="text-center text-[13px] font-semibold text-primary">
        Back to sign in
      </Link>
    </AuthCard>
  )
}
