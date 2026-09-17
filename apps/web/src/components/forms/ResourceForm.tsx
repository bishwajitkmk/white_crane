import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { api } from '@/api/endpoints'
import type { Resource, ResourceInput } from '@/api/types'
import { Button } from '@/components/ui/button'
import { Input, Select, Textarea } from '@/components/ui/input'
import { RESOURCE_CATEGORY } from '@/lib/status'
import { resourceSchema, type ResourceValues } from '@/lib/schemas'
import { Field, FormError } from './Field'

interface ResourceFormProps {
  resource?: Resource
  onSubmit: (input: ResourceInput) => void
  onDelete?: () => void
  pending: boolean
  error: unknown
}

export function ResourceForm({ resource, onSubmit, onDelete, pending, error }: ResourceFormProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<unknown>(null)
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<ResourceValues>({
    resolver: zodResolver(resourceSchema),
    defaultValues: resource
      ? { title: resource.title, description: resource.description, category: resource.category, kind: resource.kind, url: resource.url }
      : { title: '', description: '', category: 'forms', kind: 'file', url: '' },
  })
  const [kind, url] = useWatch({ control, name: ['kind', 'url'] })

  const upload = async (file: File) => {
    setUploading(true)
    setUploadError(null)
    try {
      const { upload_url, public_url } = await api.admin.presignUpload(file.name, file.type)
      if (upload_url) await fetch(upload_url, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } })
      setValue('url', public_url, { shouldValidate: true, shouldDirty: true })
    } catch (e) {
      setUploadError(e)
    } finally {
      setUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <Field label="Title" required error={errors.title}>
        <Input {...register('title')} />
      </Field>
      <Field label="Description" error={errors.description}>
        <Textarea {...register('description')} />
      </Field>
      <div className="flex gap-2">
        <Button size="sm" variant={kind === 'file' ? 'default' : 'secondary'} onClick={() => setValue('kind', 'file')}>
          Upload file
        </Button>
        <Button size="sm" variant={kind === 'link' ? 'default' : 'secondary'} onClick={() => setValue('kind', 'link')}>
          External link
        </Button>
      </div>
      {kind === 'file' ? (
        <Field label="File" error={errors.url} hint={url ? `Current: ${url}` : 'PDF, DOCX or image.'}>
          <Input
            type="file"
            className="h-auto border-dashed py-5"
            disabled={uploading}
            onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
          />
        </Field>
      ) : (
        <Field label="URL" required error={errors.url}>
          <Input type="url" placeholder="https://" {...register('url')} />
        </Field>
      )}
      <Field label="Category" error={errors.category}>
        <Select {...register('category')}>
          {Object.entries(RESOURCE_CATEGORY).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </Field>
      <FormError error={uploadError ?? error} />
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={pending || uploading}>
          {uploading ? 'Uploading...' : 'Save'}
        </Button>
        {onDelete && (
          <Button variant="secondary" onClick={onDelete} disabled={pending}>
            Delete
          </Button>
        )}
      </div>
    </form>
  )
}
