import { useId, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/input'
import { Placeholder } from '@/components/ui/placeholder'
import { IMAGE_ACCEPT, uploadFile } from '@/lib/upload'
import { cn } from '@/lib/utils'
import { FormError } from './Field'

interface ImageUploadProps {
  label: string
  value: string | null
  onChange: (url: string | null) => void
  hint?: string
  /** Size of the preview box, e.g. "h-[120px]" or "size-24". */
  previewClassName?: string
}

/** Pick an image, upload it immediately, and hand the stored URL to the form. Saving the form persists it. */
export function ImageUpload({ label, value, onChange, hint, previewClassName = 'h-[120px]' }: ImageUploadProps) {
  const inputId = useId()
  const input = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<unknown>(null)

  const pick = async (file: File | undefined) => {
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      onChange(await uploadFile(file))
    } catch (e) {
      setError(e)
    } finally {
      setUploading(false)
      if (input.current) input.current.value = ''
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={inputId}>{label}</Label>
      {value ? (
        <img src={value} alt="" className={cn('w-full rounded-md border object-cover', previewClassName)} />
      ) : (
        <Placeholder className={previewClassName}>{uploading ? 'Uploading...' : 'No image'}</Placeholder>
      )}
      <input
        ref={input}
        id={inputId}
        type="file"
        accept={IMAGE_ACCEPT}
        className="sr-only"
        onChange={(e) => pick(e.target.files?.[0])}
      />
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="secondary" disabled={uploading} onClick={() => input.current?.click()}>
          {uploading ? 'Uploading...' : value ? 'Replace image' : 'Upload image'}
        </Button>
        {value && (
          <Button size="sm" variant="ghost" disabled={uploading} onClick={() => onChange(null)}>
            Remove
          </Button>
        )}
      </div>
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      <FormError error={error} />
    </div>
  )
}
