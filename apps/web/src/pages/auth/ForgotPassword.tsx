import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { api } from '@/api/endpoints'
import { Field, FormError } from '@/components/forms/Field'
import { AuthCard } from '@/components/layout/AuthLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { forgotPasswordSchema, type ForgotPasswordValues } from '@/lib/schemas'

export default function ForgotPassword() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({ resolver: zodResolver(forgotPasswordSchema) })
  const forgot = useMutation({ mutationFn: (v: ForgotPasswordValues) => api.auth.forgot(v.email) })

  return (
    <AuthCard title="Reset your password" description="Enter your email. If an account exists we send a reset link.">
      {forgot.isSuccess ? (
        <p role="status" className="rounded-md bg-success/10 p-3 text-center text-success">
          Check your inbox. The link expires in 60 minutes.
        </p>
      ) : (
        <form onSubmit={handleSubmit((v) => forgot.mutate(v))} className="flex flex-col gap-4" noValidate>
          <Field label="Email" error={errors.email}>
            <Input type="email" autoComplete="email" placeholder="name@whitecrane.org" {...register('email')} />
          </Field>
          <FormError error={forgot.error} />
          <Button type="submit" block disabled={forgot.isPending}>
            Send reset link
          </Button>
        </form>
      )}
      <Link to="/login" className="text-center text-[13px] font-semibold text-primary">
        Back to sign in
      </Link>
    </AuthCard>
  )
}
