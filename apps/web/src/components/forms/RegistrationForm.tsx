import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import type { RegistrationInput } from '@/api/types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input, Textarea } from '@/components/ui/input'
import { registrationSchema, type RegistrationValues } from '@/lib/schemas'
import { Field, FieldRow, FormError, HoneypotField } from './Field'

interface RegistrationFormProps {
  onSubmit: (input: RegistrationInput) => void
  pending: boolean
  error: unknown
}

export function RegistrationForm({ onSubmit, pending, error }: RegistrationFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegistrationValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: { full_name: '', email: '', phone: '', organization: '', role: '', notes: '', nickname: '' },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
      <Card className="gap-4 p-6">
        <FieldRow>
          <Field label="Full name" required error={errors.full_name}>
            <Input {...register('full_name')} autoComplete="name" />
          </Field>
          <Field label="Email" required error={errors.email} hint="Your confirmation is sent here.">
            <Input {...register('email')} type="email" autoComplete="email" />
          </Field>
        </FieldRow>
        <FieldRow>
          <Field label="Organization / team" error={errors.organization}>
            <Input {...register('organization')} autoComplete="organization" />
          </Field>
          <Field label="Role or credentials" error={errors.role} hint="For example LCSW, psychologist, peer specialist.">
            <Input {...register('role')} autoComplete="organization-title" />
          </Field>
        </FieldRow>
        <Field label="Phone" error={errors.phone}>
          <Input {...register('phone')} type="tel" autoComplete="tel" />
        </Field>
        <Field label="Anything the trainers should know?" error={errors.notes} hint="Accessibility needs, questions, dietary requirements.">
          <Textarea rows={3} {...register('notes')} />
        </Field>
      </Card>

      <HoneypotField {...register('nickname')} />
      <FormError error={error} />
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <span className="text-[13px] text-muted-foreground">
          Your details are shared only with White Crane and the trainers for this event.
        </span>
        <Button type="submit" disabled={pending}>
          {pending ? 'Registering...' : 'Register'}
        </Button>
      </div>
    </form>
  )
}
