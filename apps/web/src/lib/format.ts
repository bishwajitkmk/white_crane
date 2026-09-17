const dateFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
const timeFmt = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' })

export const formatDate = (iso: string | null | undefined) => (iso ? dateFmt.format(new Date(iso)) : '')
export const formatTime = (iso: string | null | undefined) => (iso ? timeFmt.format(new Date(iso)) : '')

export const formatShortDay = (iso: string) => {
  const d = new Date(iso)
  return { month: d.toLocaleString('en-US', { month: 'short' }).toUpperCase(), day: String(d.getDate()) }
}

export const formatTimeRange = (start: string | null, end: string | null) =>
  start && end ? `${formatTime(start)} to ${formatTime(end)}` : ''

export const daysUntil = (iso: string, from = new Date()) =>
  Math.ceil((new Date(iso).getTime() - from.getTime()) / 86_400_000)

export const formatBytes = (bytes: number | null) => {
  if (bytes == null) return ''
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export const relativeDays = (iso: string | null) => {
  if (!iso) return 'Never'
  const days = -daysUntil(iso)
  if (days <= 0) return 'Today'
  if (days === 1) return 'Yesterday'
  return `${days} days ago`
}

/** Splits "a\nb" text blocks from the CMS into paragraphs. */
export const paragraphs = (text: string) => text.split(/\n{2,}|\n/).filter((p) => p.trim() !== '')
