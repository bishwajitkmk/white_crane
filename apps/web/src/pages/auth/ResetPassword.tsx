import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '@/api/endpoints'
import { Field, FormError } from '@/components/forms/Field'
import { AuthCard } from '@/components/layout/AuthLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { resetPasswordSchema, type ResetPasswordValues } from '@/lib/schemas'

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
    onSuccess: () => navigate('/login', { replace: true }),
  })

  return (
    <AuthCard title="Choose a new password" description="Link expires in 60 minutes.">
      <form onSubmit={handleSubmit((v) => reset.mutate(v))} className="flex flex-col gap-4" noValidate>
        <Field label="New password" error={errors.password} hint="At least 10 characters">
          <Input type="password" autoComplete="new-password" {...register('password')} />
        </Field>
        <Field label="Confirm password" error={errors.confirm}>
          <Input type="password" autoComplete="new-password" {...register('confirm')} />
        </Field>
        <FormError error={reset.error} />
        <Button type="submit" block disabled={reset.isPending}>
          Save password
        </Button>
      </form>
    </AuthCard>
  )
}
