import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { api } from '@/api/endpoints'
import type { SiteContent } from '@/api/types'
import { Field, FormError } from '@/components/forms/Field'
import { DashboardPage, Toolbar } from '@/components/layout/DashboardLayout'
import { QueryState } from '@/components/PageState'
import { Button, ButtonLink } from '@/components/ui/button'
import { Card, CardTitle } from '@/components/ui/card'
import { Input, Label, Textarea } from '@/components/ui/input'
import { Placeholder } from '@/components/ui/placeholder'
import { keys, useAdminContent, useInvalidatingMutation } from '@/hooks/queries'
import { landingContentSchema, type LandingContentValues } from '@/lib/schemas'

export default function LandingContent() {
  const content = useAdminContent()
  return (
    <DashboardPage title="Landing content">
      <QueryState query={content}>{(c) => <LandingContentForm content={c} />}</QueryState>
    </DashboardPage>
  )
}

function LandingContentForm({ content }: { content: SiteContent }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<LandingContentValues>({ resolver: zodResolver(landingContentSchema), defaultValues: content })
  const save = useInvalidatingMutation(api.admin.updateContent, [keys.content])

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
          <div className="flex flex-col gap-1.5">
            <Label>Hero image</Label>
            <Placeholder className="h-[120px]">Upload / replace image</Placeholder>
          </div>
        </Card>
        <Card className="gap-4 p-6">
          <CardTitle>Mission, Vision, Values</CardTitle>
          <Field label="Mission" error={errors.mission}>
            <Textarea rows={4} {...register('mission')} />
          </Field>
          <Field label="Vision" error={errors.vision}>
            <Textarea rows={4} {...register('vision')} />
          </Field>
          <Field label="Values" error={errors.values}>
            <Textarea rows={4} {...register('values')} />
          </Field>
        </Card>
      </div>
    </form>
  )
}
