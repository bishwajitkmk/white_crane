import { Link } from 'react-router-dom'

interface StatCardProps {
  label: string
  value: number | string
  note: string
  to?: string
}

export function StatCard({ label, value, note, to }: StatCardProps) {
  const body = (
    <>
      <span className="text-[13px] text-muted-foreground">{label}</span>
      <b className="block text-[28px] leading-tight">{value}</b>
      <small className="text-xs text-muted-foreground">{note}</small>
    </>
  )
  const className = 'block rounded-lg border bg-background p-5'
  return to ? (
    <Link to={to} className={`${className} hover:border-primary`}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  )
}
