import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import type { ApplicationInput } from '@/api/types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { applicationSchema, type ApplicationValues } from '@/lib/schemas'
import { Field, FieldRow, FormError } from './Field'

/** Placeholder until Ronda supplies the legal / clinical attestation wording (PRD section 2). */
const ATTESTATION_TEXT = [
  'Attestation text supplied by White Crane.',
  'Our team provides comprehensive DBT including individual therapy, skills training, between-session coaching and a weekly consultation team.',
  'All team members have completed intensive DBT training or equivalent, and the team monitors adherence to the treatment model.',
]

interface ApplicationFormProps {
  onSubmit: (input: ApplicationInput) => void
  pending: boolean
  error: unknown
}

export function ApplicationForm({ onSubmit, pending, error }: ApplicationFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ApplicationValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      agency_name: '',
      location: '',
      website: '',
      public_contact: '',
      contact_name: '',
      contact_email: '',
      contact_phone: '',
      attested: false,
      attestation_signed_name: '',
    },
  })

  const submit = handleSubmit((values) => {
    const { attested, ...input } = values
    void attested
    onSubmit(input)
  })

  return (
    <form onSubmit={submit} className="flex flex-col gap-5" noValidate>
      <Card className="gap-4 p-6">
        <h2 className="text-xl font-semibold">1. Team details</h2>
        <FieldRow>
          <Field label="Agency / team name" required error={errors.agency_name}>
            <Input {...register('agency_name')} autoComplete="organization" />
          </Field>
          <Field label="Location (city, state)" required error={errors.location}>
            <Input {...register('location')} />
          </Field>
        </FieldRow>
        <FieldRow>
          <Field label="Website" error={errors.website}>
            <Input {...register('website')} type="url" placeholder="https://" />
          </Field>
          <Field label="Public contact (email or phone)" required error={errors.public_contact}>
            <Input {...register('public_contact')} />
          </Field>
        </FieldRow>
      </Card>

      <Card className="gap-4 p-6">
        <h2 className="text-xl font-semibold">2. Contact person (not shown publicly)</h2>
        <FieldRow>
          <Field label="Name" required error={errors.contact_name}>
            <Input {...register('contact_name')} autoComplete="name" />
          </Field>
          <Field label="Email" required error={errors.contact_email}>
            <Input {...register('contact_email')} type="email" autoComplete="email" />
          </Field>
        </FieldRow>
        <Field label="Phone" error={errors.contact_phone}>
          <Input {...register('contact_phone')} type="tel" autoComplete="tel" />
        </Field>
      </Card>

      <Card className="gap-4 p-6">
        <h2 className="text-xl font-semibold">3. DBT fidelity attestation</h2>
        <div tabIndex={0} className="flex max-h-44 flex-col gap-2 overflow-y-auto rounded-md bg-surface p-4 text-muted-foreground">
          {ATTESTATION_TEXT.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
        <label className="flex items-start gap-2.5">
          <input type="checkbox" className="mt-0.5 size-[18px] accent-primary" {...register('attested')} />
          <span>I attest on behalf of my team that the statements above are accurate.</span>
        </label>
        {errors.attested && <span className="text-xs text-destructive">{errors.attested.message}</span>}
        <Field label="Typed signature (full name)" required error={errors.attestation_signed_name}>
          <Input {...register('attestation_signed_name')} />
        </Field>
      </Card>

      <FormError error={error} />
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <span className="text-[13px] text-muted-foreground">Fields marked * must be completed.</span>
        <Button type="submit" disabled={pending}>
          {pending ? 'Submitting...' : 'Submit application'}
        </Button>
      </div>
    </form>
  )
}
