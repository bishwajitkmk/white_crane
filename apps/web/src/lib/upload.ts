import { api } from '@/api/endpoints'
import { ApiError } from '@/api/client'

export const IMAGE_ACCEPT = 'image/png,image/jpeg,image/gif,image/webp'
const MAX_MB = 25

/**
 * Presign, PUT the file straight to storage (R2 in production, the API's local store in dev),
 * and return the public URL to save on the record.
 */
export async function uploadFile(file: File): Promise<string> {
  if (file.size > MAX_MB * 1024 * 1024) throw new ApiError(413, `Files are limited to ${MAX_MB} MB.`)
  const contentType = file.type || 'application/octet-stream'
  const { upload_url, public_url } = await api.admin.presignUpload(file.name, contentType)
  // Mock mode returns no upload_url; keep the file in the browser so previews still work.
  if (!upload_url) return URL.createObjectURL(file)

  const res = await fetch(upload_url, { method: 'PUT', body: file, headers: { 'Content-Type': contentType } })
  if (!res.ok) {
    const data = await res.json().catch(() => null)
    throw new ApiError(res.status, typeof data?.detail === 'string' ? data.detail : `Upload failed (${res.status})`)
  }
  return public_url
}

/** Mirrors ALLOWED_EXTENSIONS in apps/api/app/services/storage.py. */
export const FILE_ACCEPT = '.png,.jpg,.jpeg,.gif,.webp,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.rtf,.zip'
