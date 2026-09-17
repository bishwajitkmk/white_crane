import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { EmptyState, QueryState } from '@/components/PageState'
import { TrainingRow } from '@/components/TrainingCard'
import { PageTitle, Section } from '@/components/layout/Section'
import { Input, Select } from '@/components/ui/input'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useOpenTrainings } from '@/hooks/queries'
import type { TrainingFormat } from '@/api/types'

export default function TrainingsList() {
  useDocumentTitle('Trainings')
  const trainings = useOpenTrainings()
  const [search, setSearch] = useState('')
  const [month, setMonth] = useState('')
  const [format, setFormat] = useState<TrainingFormat | ''>('')

  const months = useMemo(
    () => [...new Set((trainings.data ?? []).map((t) => t.starts_at?.slice(0, 7)).filter(Boolean) as string[])].sort(),
    [trainings.data],
  )

  const filtered = (trainings.data ?? []).filter(
    (t) =>
      (!search || t.title.toLowerCase().includes(search.toLowerCase())) &&
      (!month || t.starts_at?.startsWith(month)) &&
      (!format || t.format === format),
  )

  return (
    <>
      <Section className="gap-4">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <PageTitle>Trainings</PageTitle>
          <Link to="/trainings/upcoming" className="font-semibold text-primary">
            See upcoming (not yet open)
          </Link>
        </div>
        <div className="flex flex-col gap-3 md:flex-row">
          <Input
            aria-label="Search trainings"
            placeholder="Search trainings"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="md:w-[360px]"
          />
          <Select aria-label="Month" value={month} onChange={(e) => setMonth(e.target.value)} className="md:w-40">
            <option value="">Any month</option>
            {months.map((m) => (
              <option key={m} value={m}>
                {new Date(`${m}-01T00:00:00`).toLocaleString('en-US', { month: 'long', year: 'numeric' })}
              </option>
            ))}
          </Select>
          <Select
            aria-label="Format"
            value={format}
            onChange={(e) => setFormat(e.target.value as TrainingFormat | '')}
            className="md:w-[220px]"
          >
            <option value="">Format: Online / In person</option>
            <option value="online">Online</option>
            <option value="in_person">In person</option>
          </Select>
        </div>
      </Section>
      <Section className="gap-4 pt-0 md:pt-0">
        <QueryState query={trainings}>
          {() =>
            filtered.length === 0 ? (
              <EmptyState>No trainings match those filters.</EmptyState>
            ) : (
              filtered.map((t) => <TrainingRow key={t.id} training={t} />)
            )
          }
        </QueryState>
      </Section>
    </>
  )
}
