import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { Toolbar } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input, Label, Select, Textarea } from '@/components/ui/input'
import { Placeholder } from '@/components/ui/placeholder'
import { trainingSchema, type TrainingValues } from '@/lib/schemas'
import { slugify } from '@/lib/training'
import { cn } from '@/lib/utils'
import { Field, FieldRow, FormError } from './Field'

interface TrainingFormProps {
  defaultValues: TrainingValues
  breadcrumb: string
  onSubmit: (input: TrainingValues) => void
  onDelete?: () => void
  pending: boolean
  error: unknown
}

export function TrainingForm({ defaultValues, breadcrumb, onSubmit, onDelete, pending, error }: TrainingFormProps) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, dirtyFields },
  } = useForm<TrainingValues>({ resolver: zodResolver(trainingSchema), defaultValues })

  const [status, slug] = useWatch({ control, name: ['status', 'slug'] })

  // Keep the slug in sync with the title until someone edits the slug by hand.
  const titleField = register('title', {
    onChange: (e) => {
      if (!defaultValues.slug && !dirtyFields.slug) setValue('slug', slugify(e.target.value))
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
      <Toolbar>
        <span className="text-[13px] text-muted-foreground">Trainings &nbsp;/&nbsp; {breadcrumb}</span>
        <div className="flex flex-wrap gap-3">
          {onDelete && (
            <Button variant="secondary" onClick={onDelete} disabled={pending}>
              Delete
            </Button>
          )}
          <Button type="submit" disabled={pending}>
            {pending ? 'Saving...' : 'Save and publish'}
          </Button>
        </div>
      </Toolbar>
      <FormError error={error} />

      <div className="grid items-start gap-5 xl:grid-cols-[1fr_380px]">
        <Card className="gap-4 p-6">
          <Field label="Title" required error={errors.title}>
            <Input {...titleField} />
          </Field>
          <FieldRow>
            <Field label="Date" required={status === 'open'} error={errors.date}>
              <Input type="date" {...register('date')} />
            </Field>
            <Field label="Start time" error={errors.start_time}>
              <Input type="time" {...register('start_time')} />
            </Field>
            <Field label="End time" error={errors.end_time}>
              <Input type="time" {...register('end_time')} />
            </Field>
          </FieldRow>
          <Field label="Description" error={errors.description}>
            <Textarea rows={4} {...register('description')} />
          </Field>
          <Field label="Objectives" error={errors.objectives}>
            <Textarea rows={4} {...register('objectives')} />
          </Field>
          <Field label="Agenda" error={errors.agenda}>
            <Textarea rows={4} {...register('agenda')} />
          </Field>
          <Field label="Trainer names" error={errors.trainers}>
            <Input {...register('trainers')} />
          </Field>
        </Card>

        <Card className="gap-4 p-6">
          <div className="flex flex-col gap-1.5">
            <span className="text-[13px] font-semibold">Status</span>
            <div className="flex gap-2" role="radiogroup" aria-label="Status">
              {(['open', 'upcoming'] as const).map((s) => (
                <Button
                  key={s}
                  size="sm"
                  role="radio"
                  aria-checked={status === s}
                  variant={status === s ? 'default' : 'secondary'}
                  onClick={() => setValue('status', s, { shouldDirty: true })}
                >
                  {s === 'open' ? 'Open' : 'Upcoming'}
                </Button>
              ))}
            </div>
          </div>
          <Field
            label="Registration URL"
            error={errors.registration_url}
            hint="Leave blank for Upcoming trainings. The Register button on the public page stays hidden until set."
          >
            <Input type="url" placeholder="https://ceu-manager.example/event/..." {...register('registration_url')} />
          </Field>
          <Field
            label="Expected timing"
            error={errors.expected_label}
            hint="Shown for upcoming trainings without a date."
            className={cn(status === 'open' && 'hidden')}
          >
            <Input placeholder="Spring 2027" {...register('expected_label')} />
          </Field>
          <Field label="Format" error={errors.format}>
            <Select {...register('format')}>
              <option value="online">Online</option>
              <option value="in_person">In person</option>
            </Select>
          </Field>
          <Field label="Slug" error={errors.slug} hint={`/trainings/${slug}`}>
            <Input {...register('slug')} />
          </Field>
          <div className="flex flex-col gap-1.5">
            <Label>Cover image</Label>
            <Placeholder className="h-[120px]">Upload (presigned R2 upload)</Placeholder>
          </div>
        </Card>
      </div>
    </form>
  )
}

