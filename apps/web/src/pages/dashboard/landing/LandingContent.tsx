import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { api } from '@/api/endpoints'
import type { SiteContent } from '@/api/types'
import { Field, FormError } from '@/components/forms/Field'
import { ImageUpload } from '@/components/forms/ImageUpload'
import { DashboardPage, Toolbar } from '@/components/layout/DashboardLayout'
import { QueryState } from '@/components/PageState'
import { Button, ButtonLink } from '@/components/ui/button'
import { Card, CardTitle } from '@/components/ui/card'
import { Input, Textarea } from '@/components/ui/input'
import { keys, useAdminContent, useInvalidatingMutation } from '@/hooks/queries'
import { landingContentSchema, type LandingContentValues } from '@/lib/schemas'

const FORMAT_HINT = 'A blank line starts a new paragraph. Start a line with "- " for a bullet or "1. " for a numbered item.'

const ABOUT_FIELDS: [Exclude<keyof LandingContentValues, 'hero_image_url' | 'trainer_credentials'>, string, number][] = [
  ['about_intro', 'About White Crane (introduction)', 8],
  ['mission', 'Our Mission (also shown on the home page)', 5],
  ['what_we_do', 'What We Do', 9],
  ['who_we_serve', 'Who We Serve', 8],
  ['how_we_work', 'How We Work', 8],
  ['values', 'What Guides Us (one per line: "Name. Explanation", also on the home page)', 8],
  ['about_closing', 'Learn With White Crane (closing)', 3],
]

export default function LandingContent() {
  const content = useAdminContent()
  return (
    <DashboardPage title="Site content">
      <QueryState query={content}>{(c) => <LandingContentForm content={c} />}</QueryState>
    </DashboardPage>
  )
}

function LandingContentForm({ content }: { content: SiteContent }) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors, isDirty },
  } = useForm<LandingContentValues>({ resolver: zodResolver(landingContentSchema), defaultValues: content })
  const save = useInvalidatingMutation(api.admin.updateContent, [keys.content])
  const heroImage = useWatch({ control, name: 'hero_image_url' })

  return (
    <form
      onSubmit={handleSubmit((v) => save.mutate(v, { onSuccess: (saved) => reset(saved) }))}
      className="flex flex-col gap-5"
      noValidate
    >
      <Toolbar>
        <span className="text-[13px] text-muted-foreground">
          {save.isSuccess && !isDirty ? 'Saved. Changes are live on the public site.' : 'Edits publish immediately to the public site.'}
        </span>
        <div className="flex gap-3">
          <ButtonLink to="/" target="_blank" variant="secondary">
            Preview
          </ButtonLink>
          <Button type="submit" disabled={save.isPending || !isDirty}>
            {save.isPending ? 'Saving...' : 'Save changes'}
          </Button>
        </div>
      </Toolbar>
      <FormError error={save.error} />
      <div className="grid items-start gap-5 xl:grid-cols-2">
        <Card className="gap-4 p-6">
          <CardTitle>Hero</CardTitle>
          <Field label="Headline" error={errors.hero_headline}>
            <Input {...register('hero_headline')} />
          </Field>
          <Field label="Subheading" error={errors.hero_subheading}>
            <Textarea {...register('hero_subheading')} />
          </Field>
          <Field label="Primary button label" error={errors.hero_cta_label}>
            <Input {...register('hero_cta_label')} />
          </Field>
          <ImageUpload
            label="Hero image"
            value={heroImage}
            onChange={(url) => setValue('hero_image_url', url, { shouldDirty: true })}
            hint="Shown beside the headline on the home page. Click Save changes to publish it."
          />
        </Card>
        <Card className="gap-4 p-6">
          <CardTitle>About page</CardTitle>
          <p className="text-[13px] text-muted-foreground">{FORMAT_HINT}</p>
          {ABOUT_FIELDS.map(([name, label, rows]) => (
            <Field key={name} label={label} error={errors[name]}>
              <Textarea rows={rows} {...register(name)} />
            </Field>
          ))}
        </Card>
        <Card className="gap-4 p-6">
          <CardTitle>Trainers page</CardTitle>
          <Field label="Credentialing standards" hint={FORMAT_HINT} error={errors.trainer_credentials}>
            <Textarea rows={12} {...register('trainer_credentials')} />
          </Field>
        </Card>
      </div>
    </form>
  )
}
