import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2 } from 'lucide-react'
import type { ReactNode } from 'react'
import { useFieldArray, useForm, useWatch, type FieldError, type UseFormRegisterReturn } from 'react-hook-form'
import type { ApplicationInput } from '@/api/types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input, Textarea } from '@/components/ui/input'
import {
  ATTESTATION_INTRO,
  ATTESTATION_STATEMENT,
  DBT_SERVICES,
  PRACTICE_GROUPS,
  RESIDENTIAL_ITEMS,
  requiredItems,
  type AttestationItem,
} from '@/lib/attestation'
import { formatDate } from '@/lib/format'
import { answerKey, applicationSchema, type ApplicationValues } from '@/lib/schemas'
import { cn } from '@/lib/utils'
import { Field, FieldRow, FormError, HoneypotField } from './Field'

interface ApplicationFormProps {
  onSubmit: (input: ApplicationInput) => void
  pending: boolean
  error: unknown
}

const emptyMember = { name: '', affiliation: '', email: '', joined_on: '' }

export function ApplicationForm({ onSubmit, pending, error }: ApplicationFormProps) {
  const {
    register,
    control,
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
      program_address: '',
      services: [],
      services_other: '',
      team_members: [emptyMember],
      first_consultation_on: '',
      residential: '',
      answers: {},
      comments_residential: '',
      comments_practices: '',
      additional_info: '',
      attested: false,
      attestation_signed_name: '',
      attestation_signed_title: '',
      nickname: '',
    },
  })
  const team = useFieldArray({ control, name: 'team_members' })

  const residential = useWatch({ control, name: 'residential' }) === 'yes'
  const answers = useWatch({ control, name: 'answers' })
  const required = requiredItems(residential)
  const answered = required.filter((i) => answers[answerKey(i.id)]).length

  const submit = handleSubmit((v) => {
    onSubmit({
      agency_name: v.agency_name,
      location: v.location,
      website: v.website,
      public_contact: v.public_contact,
      contact_name: v.contact_name,
      contact_email: v.contact_email,
      contact_phone: v.contact_phone,
      program_address: v.program_address,
      services: v.services_other ? [...v.services, v.services_other] : v.services,
      team_members: v.team_members,
      first_consultation_on: v.first_consultation_on,
      residential,
      answers: Object.fromEntries(required.map((i) => [i.id, v.answers[answerKey(i.id)] === 'yes'])),
      comments_residential: residential ? v.comments_residential : '',
      comments_practices: v.comments_practices,
      additional_info: v.additional_info,
      attestation_signed_name: v.attestation_signed_name,
      attestation_signed_title: v.attestation_signed_title,
      nickname: v.nickname,
    })
  })

  const question = (item: AttestationItem) => (
    <YesNo
      key={item.id}
      label={item.id}
      text={item.text}
      registration={register(`answers.${answerKey(item.id)}`)}
      error={errors.answers?.[answerKey(item.id)]}
    />
  )

  return (
    <form onSubmit={submit} className="flex flex-col gap-5" noValidate>
      <Card className="gap-3 p-6">
        {ATTESTATION_INTRO.map((p) => (
          <p key={p} className="text-muted-foreground">
            {p}
          </p>
        ))}
      </Card>

      <Card className="gap-4 p-6">
        <SectionHeading title="1. Program and team information" />
        <Field label="Name of organization / agency / team" required error={errors.agency_name}>
          <Input {...register('agency_name')} autoComplete="organization" />
        </Field>
        <FieldRow>
          <Field label="Team Leader name" required error={errors.contact_name}>
            <Input {...register('contact_name')} autoComplete="name" />
          </Field>
          <Field label="Team Leader email" required error={errors.contact_email}>
            <Input {...register('contact_email')} type="email" autoComplete="email" />
          </Field>
        </FieldRow>
        <FieldRow>
          <Field label="Team Leader phone" error={errors.contact_phone}>
            <Input {...register('contact_phone')} type="tel" autoComplete="tel" />
          </Field>
          <Field label="Website" error={errors.website}>
            <Input {...register('website')} type="url" placeholder="https://" />
          </Field>
        </FieldRow>
        <Field label="Program address" hint="Street, city, state, ZIP. Not shown publicly." error={errors.program_address}>
          <Textarea rows={2} {...register('program_address')} autoComplete="street-address" />
        </Field>
        <FieldRow>
          <Field label="Directory location (city, state)" required hint="Shown on your public listing." error={errors.location}>
            <Input {...register('location')} />
          </Field>
          <Field label="Public contact (email or phone)" required hint="Shown on your public listing." error={errors.public_contact}>
            <Input {...register('public_contact')} />
          </Field>
        </FieldRow>

        <fieldset className="flex flex-col gap-2" aria-invalid={errors.services ? true : undefined}>
          <legend className="mb-1.5 text-[13px] font-semibold">
            DBT service(s) provided<span className="text-destructive"> *</span>
          </legend>
          <div className="grid gap-x-4 gap-y-2 sm:grid-cols-2">
            {DBT_SERVICES.map((s) => (
              <label key={s} className="flex items-start gap-2.5">
                <input type="checkbox" value={s} className="mt-0.5 size-[18px] shrink-0 accent-primary" {...register('services')} />
                <span>{s}</span>
              </label>
            ))}
          </div>
          <Input {...register('services_other')} aria-label="Other DBT service" placeholder="Other (describe)" className="mt-1 sm:max-w-[420px]" />
          <ErrorText error={errors.services} />
        </fieldset>

        <Field label="Date of first weekly consultation team meeting" required error={errors.first_consultation_on} className="sm:max-w-[280px]">
          <Input {...register('first_consultation_on')} type="date" />
        </Field>
        <YesNo
          text="The DBT program is offered in a residential or inpatient setting."
          registration={register('residential')}
          error={errors.residential}
        />
      </Card>

      <Card className="gap-4 p-6">
        <SectionHeading title="2. Team members" description="Everyone on the DBT consultation team, including the Team Leader." />
        <ol className="flex flex-col gap-4">
          {team.fields.map((member, i) => {
            const e = errors.team_members?.[i]
            return (
              <li key={member.id} className="flex flex-col gap-3 rounded-md border p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-semibold text-muted-foreground">Team member {i + 1}</span>
                  {team.fields.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => team.remove(i)} aria-label={`Remove team member ${i + 1}`}>
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                </div>
                <FieldRow>
                  <Field label="Name" required error={e?.name}>
                    <Input {...register(`team_members.${i}.name`)} />
                  </Field>
                  <Field label="Agency / private practice / facility" required error={e?.affiliation}>
                    <Input {...register(`team_members.${i}.affiliation`)} />
                  </Field>
                </FieldRow>
                <FieldRow>
                  <Field label="Email" required error={e?.email}>
                    <Input {...register(`team_members.${i}.email`)} type="email" />
                  </Field>
                  <Field label="Date joined the team" required error={e?.joined_on}>
                    <Input {...register(`team_members.${i}.joined_on`)} type="date" />
                  </Field>
                </FieldRow>
              </li>
            )
          })}
        </ol>
        <Button type="button" variant="secondary" className="self-start" onClick={() => team.append(emptyMember)}>
          <Plus className="size-4" /> Add team member
        </Button>
      </Card>

      {residential && (
        <Card className="gap-4 p-6">
          <SectionHeading title="3. Residential and inpatient programs" />
          <div className="flex flex-col divide-y">{RESIDENTIAL_ITEMS.map(question)}</div>
          <Field
            label='Comments on any "No" responses'
            hint="List the item number, explain, and describe the plan to address it."
            error={errors.comments_residential}
          >
            <Textarea rows={3} {...register('comments_residential')} />
          </Field>
        </Card>
      )}

      <Card className="gap-4 p-6">
        <SectionHeading
          title={`${residential ? 4 : 3}. Program practices`}
          description="Answer each statement based on current program practice."
          aside={`${answered} of ${required.length} answered`}
        />
        {PRACTICE_GROUPS.map((group) => (
          <section key={group.title} className="flex flex-col">
            <h3 className="border-b pb-2 text-[13px] font-semibold tracking-wide text-muted-foreground uppercase">{group.title}</h3>
            <div className="flex flex-col divide-y">{group.items.map(question)}</div>
          </section>
        ))}
        <Field
          label='Comments on any "No" responses'
          hint="List the item number, explain, and describe the plan to address it."
          error={errors.comments_practices}
        >
          <Textarea rows={4} {...register('comments_practices')} />
        </Field>
      </Card>

      <Card className="gap-4 p-6">
        <SectionHeading title={`${residential ? 5 : 4}. Attestation and signature`} />
        <p className="rounded-md bg-surface p-4 text-muted-foreground">{ATTESTATION_STATEMENT}</p>
        <label className="flex items-start gap-2.5">
          <input type="checkbox" className="mt-0.5 size-[18px] shrink-0 accent-primary" {...register('attested')} />
          <span>I attest to the statement above.</span>
        </label>
        <ErrorText error={errors.attested} />
        <FieldRow>
          <Field label="Typed name (serves as signature)" required error={errors.attestation_signed_name}>
            <Input {...register('attestation_signed_name')} autoComplete="name" />
          </Field>
          <Field label="Title / role" required error={errors.attestation_signed_title}>
            <Input {...register('attestation_signed_title')} autoComplete="organization-title" />
          </Field>
        </FieldRow>
        <p className="text-[13px] text-muted-foreground">Date: {formatDate(new Date().toISOString())}, recorded when you submit.</p>
        <Field label="Any other information you wish to provide" error={errors.additional_info}>
          <Textarea rows={3} {...register('additional_info')} />
        </Field>
      </Card>

      <HoneypotField {...register('nickname')} />
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

function SectionHeading({ title, description, aside }: { title: string; description?: string; aside?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-xl font-semibold">{title}</h2>
        {aside && <span className="text-[13px] text-muted-foreground">{aside}</span>}
      </div>
      {description && <p className="text-muted-foreground">{description}</p>}
    </div>
  )
}

function ErrorText({ error }: { error?: { message?: string } }) {
  return error?.message ? <span className="text-xs text-destructive">{error.message}</span> : null
}

/** One attestation statement answered Yes or No. */
function YesNo({ label, text, registration, error }: { label?: string; text: ReactNode; registration: UseFormRegisterReturn; error?: FieldError }) {
  return (
    <fieldset className="flex flex-col gap-2 py-3 sm:flex-row sm:items-start sm:gap-6" aria-invalid={error ? true : undefined}>
      <legend className="sr-only">
        {label && `${label}. `}
        {text}
      </legend>
      <p aria-hidden="true" className="flex flex-1 gap-2">
        {label && <span className="min-w-7 font-semibold text-muted-foreground">{label}.</span>}
        <span>{text}</span>
      </p>
      <div className="flex shrink-0 flex-col items-start gap-1 sm:items-end">
        <div className="flex gap-2">
          {(['yes', 'no'] as const).map((value) => (
            <label
              key={value}
              className={cn(
                'flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 has-checked:border-primary has-checked:bg-primary/10 has-focus-visible:outline-2 has-focus-visible:outline-ring',
                error && 'border-destructive',
              )}
            >
              <input type="radio" value={value} className="accent-primary" {...registration} />
              {value === 'yes' ? 'Yes' : 'No'}
            </label>
          ))}
        </div>
        <ErrorText error={error} />
      </div>
    </fieldset>
  )
}
