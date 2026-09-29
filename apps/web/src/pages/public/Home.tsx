import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  ClipboardCheck,
  Compass,
  Eye,
  GraduationCap,
  HeartHandshake,
  Mail,
  MapPin,
  ShieldCheck,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Listing, Training } from '@/api/types'
import logoLight from '@/assets/logo-light.png'
import { QueryState } from '@/components/PageState'
import { TrainingCard } from '@/components/TrainingCard'
import { Lede, PageTitle, Section, SectionTitle } from '@/components/layout/Section'
import { Badge } from '@/components/ui/badge'
import { ButtonLink } from '@/components/ui/button'
import { buttonVariants } from '@/components/ui/button-variants'
import { Card, CardDescription, CardTitle } from '@/components/ui/card'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useDirectory, useOpenTrainings, useSiteContent } from '@/hooks/queries'
import { formatDate } from '@/lib/format'
import { TRAINING_FORMAT } from '@/lib/status'

const HERO_POINTS = ['Online and in-person trainings', 'Directory reviewed by the Directorate', 'Resources for DBT teams']

const PILLARS: { icon: LucideIcon; title: string; text: string; to: string; cta: string }[] = [
  {
    icon: GraduationCap,
    title: 'DBT trainings',
    text: 'Workshops and intensives for clinicians and teams, online and in person, with registration on our partner platform.',
    to: '/trainings',
    cta: 'Browse trainings',
  },
  {
    icon: MapPin,
    title: 'Clinical directory',
    text: 'A searchable list of teams that attest to practicing comprehensive DBT with fidelity, reviewed by our Directorate.',
    to: '/directory',
    cta: 'Find a DBT team',
  },
  {
    icon: BookOpen,
    title: 'Resources',
    text: 'Forms, reading and links that support DBT teams and the people they serve, free to download.',
    to: '/resources',
    cta: 'See resources',
  },
]

const LISTING_STEPS: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: ClipboardCheck, title: 'Apply with an attestation', text: "Share your team's details and sign the DBT fidelity attestation." },
  { icon: ShieldCheck, title: 'Directorate review', text: 'The White Crane Directorate reviews every application.' },
  { icon: Users, title: 'Listed for a year', text: 'Approved teams appear in the public directory and renew annually.' },
]

/** Small uppercase label above a heading. */
function Eyebrow({ children }: { children: string }) {
  return <span className="text-xs font-semibold tracking-[0.12em] text-primary uppercase">{children}</span>
}

function IconTile({ icon: Icon, className }: { icon: LucideIcon; className?: string }) {
  return (
    <span aria-hidden className={`flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ${className ?? ''}`}>
      <Icon className="size-5" />
    </span>
  )
}

/**
 * Branded panel shown in the hero until the Board uploads a hero image (Landing content). Shows live
 * numbers and the next training, so it stays accurate as content changes.
 */
function HeroPanel({ trainings, teams }: { trainings?: Training[]; teams?: Listing[] }) {
  const next = trainings?.[0]
  return (
    <div className="relative h-[280px] overflow-hidden rounded-xl bg-linear-to-br from-navy to-teal lg:h-[340px]">
      <svg aria-hidden viewBox="0 0 480 340" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
        <g fill="none" stroke="var(--sky)" strokeOpacity="0.22">
          <circle cx="400" cy="70" r="60" />
          <circle cx="400" cy="70" r="110" />
          <circle cx="400" cy="70" r="160" />
          <circle cx="400" cy="70" r="210" />
        </g>
        <g fill="none" stroke="var(--mist)" strokeOpacity="0.25" strokeWidth="1.5">
          <path d="M0 260 C 90 220, 170 300, 260 255 S 420 210, 480 240" />
          <path d="M0 290 C 100 250, 180 330, 270 285 S 420 240, 480 270" />
        </g>
      </svg>
      <img src={logoLight} alt="" className="absolute top-6 left-6 h-10 w-auto opacity-90" />

      {(!!trainings?.length || !!teams?.length) && (
        <div className="absolute top-6 right-6 hidden flex-col gap-2 sm:flex">
          {!!trainings?.length && (
            <span className="rounded-full bg-white/12 px-3 py-1 text-[13px] text-white backdrop-blur-sm">
              <b>{trainings.length}</b> open {trainings.length === 1 ? 'training' : 'trainings'}
            </span>
          )}
          {!!teams?.length && (
            <span className="rounded-full bg-white/12 px-3 py-1 text-[13px] text-white backdrop-blur-sm">
              <b>{teams.length}</b> listed {teams.length === 1 ? 'team' : 'teams'}
            </span>
          )}
        </div>
      )}

      {next && (
        <Link
          to={`/trainings/${next.slug}`}
          className="absolute right-4 bottom-4 left-4 flex items-center gap-3 rounded-lg bg-background p-4 shadow-lg transition-transform hover:-translate-y-0.5 sm:right-auto sm:left-6 sm:w-80 lg:bottom-6"
        >
          <IconTile icon={CalendarDays} />
          <div className="min-w-0">
            <span className="text-xs font-semibold text-muted-foreground">Next training</span>
            <b className="block truncate text-foreground">{next.title}</b>
            <span className="text-[13px] text-muted-foreground">
              {formatDate(next.starts_at)} · {TRAINING_FORMAT[next.format]}
            </span>
          </div>
        </Link>
      )}
    </div>
  )
}

function DirectoryPreview({ teams }: { teams?: Listing[] }) {
  return (
    <Card className="gap-0 p-0 shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b px-5 py-4">
        <b>Listed DBT teams</b>
        {!!teams?.length && <Badge variant="acc">{teams.length} listed</Badge>}
      </div>
      {teams?.length ? (
        <ul className="flex flex-col">
          {teams.slice(0, 3).map((t) => (
            <li key={t.id} className="flex items-center gap-3 border-b px-5 py-3.5 last:border-b-0">
              <IconTile icon={MapPin} className="size-9" />
              <div className="min-w-0">
                <b className="block truncate">{t.agency_name}</b>
                <span className="text-[13px] text-muted-foreground">{t.location}</span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="px-5 py-8 text-center text-muted-foreground">Approved teams will appear here.</p>
      )}
      <Link to="/directory" className="flex items-center justify-center gap-1.5 border-t px-5 py-3.5 text-[13px] font-semibold text-primary hover:bg-surface">
        Search the directory <ArrowRight className="size-4" />
      </Link>
    </Card>
  )
}

export default function Home() {
  useDocumentTitle('')
  const content = useSiteContent()
  const trainings = useOpenTrainings()
  const directory = useDirectory('', '')

  return (
    <>
      <QueryState query={content}>
        {(c) => (
          <>
            <Section alt className="md:py-20">
              <div className="grid items-center gap-10 lg:grid-cols-[1fr_480px] lg:gap-12">
                <div className="flex flex-col gap-4">
                  <Eyebrow>DBT training &amp; clinical directory</Eyebrow>
                  <PageTitle>{c.hero_headline}</PageTitle>
                  <Lede>{c.hero_subheading}</Lede>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <ButtonLink to="/trainings">{c.hero_cta_label}</ButtonLink>
                    <ButtonLink to="/directory" variant="secondary">
                      Find a DBT Team
                    </ButtonLink>
                  </div>
                  <ul className="mt-2 flex flex-col gap-2 text-[13px] text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-x-5">
                    {HERO_POINTS.map((point) => (
                      <li key={point} className="flex items-center gap-1.5">
                        <Check aria-hidden className="size-4 text-sage" /> {point}
                      </li>
                    ))}
                  </ul>
                </div>
                {c.hero_image_url ? (
                  <img src={c.hero_image_url} alt="" className="h-[220px] w-full rounded-xl object-cover lg:h-[340px]" />
                ) : (
                  <HeroPanel trainings={trainings.data} teams={directory.data} />
                )}
              </div>
            </Section>

            <Section>
              <div className="flex flex-col gap-2">
                <Eyebrow>What we do</Eyebrow>
                <SectionTitle>Supporting DBT practice, from training to referral</SectionTitle>
              </div>
              <div className="grid gap-6 md:grid-cols-3">
                {PILLARS.map((p) => (
                  <Card key={p.title} className="gap-3 p-6 transition-shadow hover:shadow-md">
                    <IconTile icon={p.icon} />
                    <CardTitle className="text-lg">{p.title}</CardTitle>
                    <CardDescription>{p.text}</CardDescription>
                    <Link to={p.to} className="mt-auto flex items-center gap-1.5 pt-1 text-[13px] font-semibold text-primary hover:underline">
                      {p.cta} <ArrowRight aria-hidden className="size-4" />
                    </Link>
                  </Card>
                ))}
              </div>
            </Section>

            <Section alt>
              <div className="flex flex-col gap-2">
                <Eyebrow>Who we are</Eyebrow>
                <SectionTitle>Mission, Vision, Values</SectionTitle>
              </div>
              <div className="grid gap-6 md:grid-cols-3">
                {(
                  [
                    ['Mission', c.mission, Compass],
                    ['Vision', c.vision, Eye],
                    ['Values', c.values, HeartHandshake],
                  ] as const
                ).map(([title, text, icon]) => (
                  <Card key={title} className="gap-3 border-t-4 border-t-primary p-6">
                    <div className="flex items-center gap-3">
                      <IconTile icon={icon} className="size-10" />
                      <CardTitle className="text-lg">{title}</CardTitle>
                    </div>
                    <CardDescription className="whitespace-pre-line">{text}</CardDescription>
                  </Card>
                ))}
              </div>
            </Section>
          </>
        )}
      </QueryState>

      <Section>
        <div className="flex items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <Eyebrow>Learn with us</Eyebrow>
            <SectionTitle>Upcoming Trainings</SectionTitle>
          </div>
          <Link to="/trainings" className="hidden items-center gap-1.5 font-semibold text-primary hover:underline sm:flex">
            View all trainings <ArrowRight aria-hidden className="size-4" />
          </Link>
        </div>
        <QueryState query={trainings}>
          {(list) =>
            list.length ? (
              <div className="grid gap-6 md:grid-cols-3">
                {list.slice(0, 3).map((t) => (
                  <TrainingCard key={t.id} training={t} />
                ))}
              </div>
            ) : (
              <Card className="items-center p-8 text-center">
                <CardDescription>
                  New dates are announced regularly.{' '}
                  <Link to="/trainings/upcoming" className="font-semibold text-primary">
                    See what's coming next
                  </Link>
                </CardDescription>
              </Card>
            )
          }
        </QueryState>
        <Link to="/trainings" className="font-semibold text-primary sm:hidden">
          View all trainings
        </Link>
      </Section>

      <Section alt>
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_420px] lg:gap-14">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Eyebrow>For clients and referrers</Eyebrow>
              <SectionTitle>DBT Clinical Directory</SectionTitle>
              <Lede>Find an approved DBT team near you, or apply to have your team listed.</Lede>
            </div>
            <ol className="flex flex-col gap-4">
              {LISTING_STEPS.map((step, i) => (
                <li key={step.title} className="flex items-start gap-3.5">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-[13px] font-semibold text-primary-foreground">
                    {i + 1}
                  </span>
                  <div>
                    <b className="flex items-center gap-2">
                      <step.icon aria-hidden className="size-4 text-primary" /> {step.title}
                    </b>
                    <span className="text-muted-foreground">{step.text}</span>
                  </div>
                </li>
              ))}
            </ol>
            <div className="flex flex-col gap-3 sm:flex-row">
              <ButtonLink to="/directory">Search Directory</ButtonLink>
              <ButtonLink to="/directory/apply" variant="secondary">
                Apply as a Team
              </ButtonLink>
            </div>
          </div>
          <DirectoryPreview teams={directory.data} />
        </div>
      </Section>

      <section className="bg-navy text-white">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between md:py-14">
          <div className="flex max-w-xl flex-col gap-2">
            <h2 className="text-[22px] text-white md:text-[26px]">Questions about training or the directory?</h2>
            <p className="text-sidebar-foreground">
              We're happy to help teams and clinicians find the right next step. Email us at{' '}
              <a href="mailto:info@whitecrane.org" className="font-semibold text-white underline underline-offset-2">
                info@whitecrane.org
              </a>
              .
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a href="mailto:info@whitecrane.org" className={buttonVariants({ variant: 'secondary' })}>
              <Mail aria-hidden className="mr-2 size-4" /> Email us
            </a>
            <Link to="/trainings" className={buttonVariants({ className: 'border-white/30' })}>
              Browse trainings
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
