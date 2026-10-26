import { ArrowRight } from 'lucide-react'
import { useMemo, useState } from 'react'
import { EmptyState, QueryState } from '@/components/PageState'
import { TrainingRow } from '@/components/TrainingCard'
import { PageHero } from '@/components/layout/PageHero'
import { Section } from '@/components/layout/Section'
import { ButtonLink } from '@/components/ui/button'
import { ON_DARK } from '@/components/ui/button-variants'
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
      <PageHero
        eyebrow="Learn with us"
        title="Trainings"
        lede="Workshops and intensives for clinicians and teams, online and in person."
      >
        <div className="flex flex-wrap gap-3">
          <ButtonLink to="/trainings/upcoming" variant="secondary" size="sm" className={`group ${ON_DARK}`}>
            See upcoming (not yet open) <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
          </ButtonLink>
          <ButtonLink to="/trainers" variant="secondary" size="sm" className={`group ${ON_DARK}`}>
            Meet our trainers <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
          </ButtonLink>
        </div>
      </PageHero>
      <Section className="gap-4">
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
