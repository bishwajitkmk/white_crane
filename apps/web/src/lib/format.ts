const dateFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
const timeFmt = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' })

export const formatDate = (iso: string | null | undefined) => (iso ? dateFmt.format(new Date(iso)) : '')
/** For date-only values (YYYY-MM-DD): read as a local date, so US time zones don't show the day before. */
export const formatDay = (day: string | null | undefined) => (day ? dateFmt.format(new Date(`${day}T00:00:00`)) : '')
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

export type TextBlock = { type: 'p'; text: string } | { type: 'ul' | 'ol'; items: string[] }

/**
 * Reads a CMS text block: each line is a paragraph, except lines starting "- " (bullets) or "1. " (numbered
 * items), which group with their neighbours into a list.
 */
export function textBlocks(text: string): TextBlock[] {
  const blocks: TextBlock[] = []
  for (const raw of text.split('\n')) {
    const line = raw.trim()
    if (!line) continue
    const item = /^(?:(-|\*)|\d+[.)])\s+(.*)$/.exec(line)
    if (!item) {
      blocks.push({ type: 'p', text: line })
      continue
    }
    const type = item[1] ? 'ul' : 'ol'
    const last = blocks.at(-1)
    if (last?.type === type) last.items.push(item[2])
    else blocks.push({ type, items: [item[2]] })
  }
  return blocks
}

/** "Name. Explanation" lines (e.g. values) split into their bold lead and the rest. */
export function leadSentence(line: string): { lead: string; rest: string } {
  const match = /^(.{1,60}?)[.:]\s+(.+)$/.exec(line.trim())
  return match ? { lead: match[1], rest: match[2] } : { lead: '', rest: line.trim() }
}
