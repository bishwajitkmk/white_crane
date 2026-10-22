import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import type { ContactInput, ContactTopic } from '@/api/types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input, Select, Textarea } from '@/components/ui/input'
import { contactSchema, type ContactValues } from '@/lib/schemas'
import { CONTACT_TOPIC } from '@/lib/status'
import { Field, FieldRow, FormError, HoneypotField } from './Field'

interface ContactFormProps {
  topic: ContactTopic
  onSubmit: (input: ContactInput) => void
  pending: boolean
  error: unknown
}

export function ContactForm({ topic, onSubmit, pending, error }: ContactFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', email: '', organization: '', topic, message: '', nickname: '' },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
      <Card className="gap-4 p-6">
        <FieldRow>
          <Field label="Name" required error={errors.name}>
            <Input {...register('name')} autoComplete="name" />
          </Field>
          <Field label="Email" required error={errors.email} hint="We reply to this address.">
            <Input {...register('email')} type="email" autoComplete="email" />
          </Field>
        </FieldRow>
        <FieldRow>
          <Field label="Organization / team" error={errors.organization}>
            <Input {...register('organization')} autoComplete="organization" />
          </Field>
          <Field label="Topic" error={errors.topic}>
            <Select {...register('topic')}>
              {Object.entries(CONTACT_TOPIC).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
        </FieldRow>
        <Field
          label="Message"
          required
          error={errors.message}
          hint="For team consultation, tell us a little about your team and what you're looking for."
        >
          <Textarea rows={6} {...register('message')} />
        </Field>
      </Card>

      <HoneypotField {...register('nickname')} />
      <FormError error={error} />
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <span className="text-[13px] text-muted-foreground">Your message goes to the White Crane Board.</span>
        <Button type="submit" disabled={pending}>
          {pending ? 'Sending...' : 'Send message'}
        </Button>
      </div>
    </form>
  )
}
