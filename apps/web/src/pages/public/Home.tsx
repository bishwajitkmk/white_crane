import {
  Anchor,
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  ClipboardCheck,
  Flower2,
  GraduationCap,
  Handshake,
  Mail,
  MapPin,
  Quote,
  ShieldCheck,
  Users,
  Waves,
  type LucideIcon,
} from 'lucide-react'
import { createElement, useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { Page, PublicListing, SiteContent, Training } from '@/api/types'
import { QueryState } from '@/components/PageState'
import { Reveal } from '@/components/Reveal'
import { TrainingCard } from '@/components/TrainingCard'
import { useHeroBand } from '@/components/layout/hero-band'
import { Eyebrow, Lede, PageTitle, Section, SectionTitle } from '@/components/layout/Section'
import { Badge } from '@/components/ui/badge'
import { ButtonLink } from '@/components/ui/button'
import { ON_DARK, buttonVariants } from '@/components/ui/button-variants'
import { Card, CardDescription, CardTitle } from '@/components/ui/card'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useDirectory, useOpenTrainings, useSiteContent } from '@/hooks/queries'
import { formatDate, leadSentence, paragraphs } from '@/lib/format'
import { TRAINING_FORMAT } from '@/lib/status'
import { cn } from '@/lib/utils'
import { valueIcon } from '@/lib/value-icons'

const HERO_POINTS = ['Online and in-person trainings', 'Directory reviewed by the Directorate', 'Resources for DBT teams']

const PILLARS: { icon: LucideIcon; title: string; text: string; points: string[]; to: string; cta: string }[] = [
  {
    icon: GraduationCap,
    title: 'DBT trainings',
    text: 'Workshops and intensives for clinicians and teams, online and in person, with registration on our partner platform.',
    points: ['Workshops and intensives', 'Online and in person', 'Taught by credentialed trainers'],
    to: '/trainings',
    cta: 'Browse trainings',
  },
  {
    icon: MapPin,
    title: 'Clinical directory',
    text: 'A searchable list of teams that attest to practicing comprehensive DBT with fidelity, reviewed by our Directorate.',
    points: ['Search by name or location', 'Reviewed by the Directorate', 'Renewed every year'],
    to: '/directory',
    cta: 'Find a DBT team',
  },
  {
    icon: BookOpen,
    title: 'Resources',
    text: 'Forms, reading and links that support DBT teams and the people they serve, free to download.',
    points: ['Forms, reading and links', 'Free to download', 'Curated for DBT teams'],
    to: '/resources',
    cta: 'See resources',
  },
]

const LISTING_STEPS: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: ClipboardCheck, title: 'Apply with an attestation', text: "Share your team's details and sign the DBT fidelity attestation." },
  { icon: ShieldCheck, title: 'Directorate review', text: 'The White Crane Directorate reviews every application.' },
  { icon: Users, title: 'Listed for a year', text: 'Approved teams appear in the public directory and renew annually.' },
]

function IconTile({ icon: Icon, className }: { icon: LucideIcon; className?: string }) {
  return (
    <span
      aria-hidden
      className={`flex size-11 shrink-0 items-center justify-center rounded-xl bg-sky/25 text-primary ring-1 ring-primary/5 ring-inset transition-all duration-300 ${className ?? ''}`}
    >
      <Icon className="size-5" />
    </span>
  )
}

const prefersReducedMotion = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

/** Index that advances every `ms` through `count` items, held while `paused` or under reduced motion. */
function useRotation(count: number, ms: number, paused = false) {
  const [index, setIndex] = useState(0)
  useEffect(() => {
    if (count < 2 || paused || prefersReducedMotion()) return
    const id = setTimeout(() => setIndex((i) => (i + 1) % count), ms)
    return () => clearTimeout(id)
  }, [count, ms, paused, index])
  return [count ? index % count : 0, setIndex] as const
}

/** Who the training is for, cycled in the hero (from "Who we serve"). */
const AUDIENCES = ['clinicians', 'treatment teams', 'behavioral health programs', 'community agencies']

/**
 * The four DBT skills modules, floating either side of the hero text (wide screens only). They sit level
 * with the eyebrow and the buttons, the narrow rows of the centred text, so they never cross the headline.
 */
const SKILLS: { icon: LucideIcon; label: string; className: string; delay: string }[] = [
  { icon: Flower2, label: 'Mindfulness', className: 'top-[19%] left-[6%]', delay: '0s' },
  { icon: Handshake, label: 'Interpersonal effectiveness', className: 'top-[21%] right-[3%]', delay: '1.5s' },
  { icon: Waves, label: 'Emotion regulation', className: 'top-[59%] left-[2%]', delay: '3s' },
  { icon: Anchor, label: 'Distress tolerance', className: 'top-[61%] right-[6%]', delay: '4.5s' },
]

/** Moves with the pointer by `depth` px at most, for a light parallax. */
function Parallax({ depth, className, children }: { depth: number; className?: string; children: ReactNode }) {
  return (
    <div
      className={cn('transition-transform duration-500 ease-out', className)}
      style={{ transform: `translate(calc(var(--px, 0) * ${depth}px), calc(var(--py, 0) * ${depth}px))` }}
    >
      {children}
    </div>
  )
}

/** Next open trainings, one at a time, with dots to jump between them. Pauses while hovered. */
function TrainingCarousel({ trainings, className }: { trainings: Training[]; className?: string }) {
  const [hover, setHover] = useState(false)
  const slides = trainings.slice(0, 4)
  const [current, setCurrent] = useRotation(slides.length, 5000, hover)
  const next = slides[current]
  if (!next) return null

  return (
    <div className={className} onPointerEnter={() => setHover(true)} onPointerLeave={() => setHover(false)}>
      <Link
        key={next.id}
        to={`/trainings/${next.slug}`}
        className="group swap-in flex items-center gap-3.5 rounded-2xl border border-white bg-white/90 p-4 text-foreground shadow-lifted backdrop-blur-md transition-transform duration-300 hover:-translate-y-1"
      >
        <IconTile icon={CalendarDays} className="group-hover:bg-primary group-hover:text-primary-foreground" />
        <div className="min-w-0 flex-1">
          <span className="text-[13px] font-semibold text-accent">{current === 0 ? 'Next training' : 'Coming up'}</span>
          <b className="block truncate">{next.title}</b>
          <span className="text-sm text-muted-foreground">
            {formatDate(next.starts_at)} · {TRAINING_FORMAT[next.format]}
          </span>
        </div>
        <ArrowRight aria-hidden className="size-4 shrink-0 text-primary transition-transform group-hover:translate-x-1" />
      </Link>
      {slides.length > 1 && (
        <div className="mt-3 flex justify-center gap-1.5">
          {slides.map((t, i) => (
            <button
              key={t.id}
              type="button"
              aria-label={`Show ${t.title}`}
              aria-current={i === current}
              onClick={() => setCurrent(i)}
              className={cn('h-1.5 cursor-pointer rounded-full transition-all duration-300', i === current ? 'w-6 bg-primary' : 'w-1.5 bg-primary/25 hover:bg-primary/50')}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Full-width hero under a transparent header. Behind the centred text, softly blurred: the crane inside
 * turning orbits, the four DBT skills modules and drifting waves, all shifting slightly with the pointer.
 * A hero image uploaded by the Board replaces the scene.
 */
function Hero({ c, trainings, teams }: { c: SiteContent; trainings?: Training[]; teams?: Page<PublicListing> }) {
  useHeroBand()
  const ref = useRef<HTMLElement>(null)

  const onMove = (e: PointerEvent<HTMLElement>) => {
    const el = ref.current
    // Mouse only: on touch screens this would fire while scrolling and repaint the whole scene.
    if (!el || e.pointerType !== 'mouse' || prefersReducedMotion()) return
    const box = el.getBoundingClientRect()
    el.style.setProperty('--px', (((e.clientX - box.left) / box.width) * 2 - 1).toFixed(3))
    el.style.setProperty('--py', (((e.clientY - box.top) / box.height) * 2 - 1).toFixed(3))
  }
  const onLeave = () => {
    ref.current?.style.setProperty('--px', '0')
    ref.current?.style.setProperty('--py', '0')
  }

  return (
    <section
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className="mesh relative overflow-hidden"
    >
      <div aria-hidden className="mesh-grid absolute inset-0 [mask-image:radial-gradient(ellipse_75%_65%_at_50%_0%,black,transparent)]" />
      {c.hero_image_url ? (
        <>
          <img src={c.hero_image_url} alt="" className="absolute inset-0 h-full w-full object-cover md:blur-[2px]" />
          <div aria-hidden className="absolute inset-0 bg-white/75" />
        </>
      ) : (
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <svg viewBox="0 0 1440 700" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
            <g fill="none" stroke="var(--sky)" strokeOpacity="0.6" strokeWidth="1.5" className="drift">
              <path d="M0 580 C 260 510, 520 660, 780 580 S 1260 500, 1440 560" />
              <path d="M0 625 C 280 555, 540 705, 800 625 S 1270 545, 1440 605" />
            </g>
          </svg>
          <Parallax depth={12} className="absolute inset-0">
            <div className="absolute top-1/2 left-1/2 size-0 opacity-60">
              <div className="orbit absolute -top-[190px] -left-[190px] size-[380px] rounded-full border border-dashed border-teal/35">
                <span className="absolute -top-1 left-1/2 size-2.5 -translate-x-1/2 rounded-full bg-teal shadow-[0_0_14px_var(--sky)]" />
              </div>
              <div className="orbit-reverse absolute -top-[280px] -left-[280px] size-[560px] rounded-full border border-teal/20">
                <span className="absolute top-1/2 -right-1 size-2 -translate-y-1/2 rounded-full bg-sage" />
              </div>
              <div className="pulse-ring absolute -top-[380px] -left-[380px] size-[760px]">
                <svg viewBox="0 0 760 760" className="size-full" fill="none" stroke="var(--teal)">
                  <circle cx="380" cy="380" r="375" />
                </svg>
              </div>
              <div className="absolute -top-28 -left-28 size-56 rounded-full border border-teal/15 bg-white/60 shadow-[0_0_120px_-10px_var(--sky)]" />
            </div>
          </Parallax>
          <div className="relative mx-auto h-full max-w-[1200px]">
            {SKILLS.map((skill) => (
              <Parallax key={skill.label} depth={24} className={cn('absolute hidden xl:block', skill.className)}>
                <span
                  className="float flex items-center gap-2 rounded-full border border-white bg-white/85 py-1.5 pr-4 pl-1.5 text-sm font-semibold whitespace-nowrap text-foreground shadow-soft"
                  style={{ ['--d' as string]: skill.delay }}
                >
                  <span className="flex size-6 items-center justify-center rounded-full bg-sky/40 text-primary">
                    <skill.icon className="size-3.5" />
                  </span>
                  {skill.label}
                </span>
              </Parallax>
            ))}
          </div>
        </div>
      )}
      {/* Fades the scene into the white section below, so the hero has no hard bottom edge. */}
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-b from-transparent to-white" />
      {/* A soft white pool behind the text keeps it readable over the scene. */}
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_45%_50%_at_center,rgb(255_255_255/0.8),transparent)]" />

      <div className="relative mx-auto flex max-w-[1200px] flex-col items-center gap-10 px-4 pt-36 pb-20 sm:px-6 md:pt-44 md:pb-24 lg:min-h-[800px] lg:justify-center">
        <div className="stagger flex max-w-[940px] flex-col items-center gap-6 text-center">
          <span className="flex items-center gap-2.5 rounded-full border border-white bg-white/80 px-4 py-1.5 font-label text-[15px] font-semibold tracking-[0.14em] text-accent uppercase shadow-soft md:backdrop-blur-sm">
            <span className="relative flex size-2">
              <span className="absolute inset-0 animate-ping rounded-full bg-sage" />
              <span className="relative size-2 rounded-full bg-sage" />
            </span>
            DBT training &amp; clinical directory
          </span>
          <PageTitle className="text-[44px] sm:text-[58px] lg:text-[68px]">{c.hero_headline}</PageTitle>
          <Lede className="max-w-[680px] md:text-xl">{c.hero_subheading}</Lede>
          <RotatingAudience />
          <div className="mt-2 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
            <ButtonLink to="/trainings" className="group h-12 px-7 text-base">
              {c.hero_cta_label} <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
            </ButtonLink>
            <ButtonLink to="/directory" variant="secondary" className="group h-12 px-7 text-base">
              <MapPin aria-hidden className="size-4 text-teal transition-transform group-hover:-translate-y-0.5" /> Find a DBT Team
            </ButtonLink>
          </div>
          <ul className="mt-2 flex flex-col items-center gap-2.5 text-[15px] text-muted-foreground sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-6">
            {HERO_POINTS.map((point) => (
              <li key={point} className="flex items-center gap-1.5">
                <Check aria-hidden className="size-4 text-sage" /> {point}
              </li>
            ))}
            {!!teams?.total && (
              <li className="flex items-center gap-1.5">
                <Check aria-hidden className="size-4 text-sage" /> <b className="text-foreground">{teams.total}</b> listed {teams.total === 1 ? 'team' : 'teams'}
              </li>
            )}
          </ul>
        </div>

        {!!trainings?.length && <TrainingCarousel trainings={trainings} className="w-full sm:w-[380px]" />}
      </div>
    </section>
  )
}

/** "Built for clinicians", cycling through who the training is for. */
function RotatingAudience() {
  const [i] = useRotation(AUDIENCES.length, 2600)
  return (
    <p className="text-lg text-muted-foreground">
      Built for{' '}
      <span key={i} className="swap-in inline-block font-semibold text-foreground underline decoration-sky decoration-[3px] underline-offset-[6px]">
        {AUDIENCES[i]}
      </span>
    </p>
  )
}

/** A sine wave of period `len` across 2400 units, so the row can scroll by half its width and loop seamlessly. */
function wavePath(amp: number, len: number) {
  let d = `M0 ${amp}`
  for (let x = 0; x < 2400; x += len) d += ` q ${len / 4} ${-amp} ${len / 2} 0 t ${len / 2} 0`
  return d
}

const WAVE_ROWS = [
  { top: '14%', amp: 6, len: 200, dur: '16s', opacity: 0.05, reverse: false },
  { top: '32%', amp: 10, len: 300, dur: '22s', opacity: 0.04, reverse: true },
  { top: '50%', amp: 4, len: 120, dur: '12s', opacity: 0.05, reverse: false },
  { top: '68%', amp: 8, len: 240, dur: '19s', opacity: 0.04, reverse: true },
  { top: '86%', amp: 12, len: 400, dur: '26s', opacity: 0.04, reverse: false },
]

/** Faint flowing waves that fade in and start moving only while the parent `group` is hovered. */
function HoverWaves() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 opacity-0 transition-opacity max-md:hidden md:blur-[3px] duration-700 group-hover:opacity-100">
      {WAVE_ROWS.map((row) => (
        <svg
          key={row.top}
          viewBox={`0 0 2400 ${row.amp * 2}`}
          preserveAspectRatio="none"
          className={cn('wave-row absolute left-0 w-[200%] overflow-visible', row.reverse && 'wave-row-reverse')}
          style={{ top: row.top, height: row.amp * 2, ['--dur' as string]: row.dur }}
        >
          <path d={wavePath(row.amp, row.len)} fill="none" stroke="var(--sky)" strokeOpacity={row.opacity} strokeWidth="3" vectorEffect="non-scaling-stroke" />
        </svg>
      ))}
    </div>
  )
}

/**
 * The values as one white panel split by hairlines, two or three across. Each value fades up once as it
 * scrolls in; on hover its cell tints and the icon fills navy.
 */
function ValueGrid({ values }: { values: string[] }) {
  return (
    <ul className="grid gap-px overflow-hidden rounded-3xl border bg-border shadow-soft sm:grid-cols-2">
      {values.map((line, i) => {
        const { lead, rest } = leadSentence(line)
        return (
          <li key={line} className="flex bg-background">
            <Reveal index={i % 2} className="group flex flex-1 gap-4 p-6 transition-colors duration-300 hover:bg-surface md:p-8">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-sky/25 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                {createElement(valueIcon(lead), { 'aria-hidden': true, className: 'size-5' })}
              </span>
              <div className="flex flex-col gap-1.5">
                {lead && <h4 className="text-lg font-semibold">{lead}</h4>}
                <p className="text-muted-foreground">{rest}</p>
              </div>
            </Reveal>
          </li>
        )
      })}
    </ul>
  )
}

/** Mission statement band, then the values as cards that fan out from a stack on scroll. */
function MissionValues({ mission, values }: { mission: string; values: string[] }) {
  return (
    <section className="relative overflow-hidden border-y border-border/60 bg-surface">
      <div aria-hidden className="mesh-grid absolute inset-0 [mask-image:radial-gradient(ellipse_60%_70%_at_0%_100%,black,transparent)]" />
      <div aria-hidden className="absolute -right-40 -bottom-40 size-[480px] rounded-full bg-sky/25 blur-3xl" />
      <div className="relative mx-auto flex max-w-[1200px] flex-col gap-12 px-4 py-14 sm:px-6 md:py-24">
        <div className="flex flex-col gap-4">
          <Eyebrow>Who we are</Eyebrow>
          <SectionTitle>Mission and Values</SectionTitle>
        </div>

        <Reveal>
          <div className="group relative overflow-hidden rounded-3xl bg-linear-to-br from-ink via-navy to-teal p-7 text-white shadow-lifted md:p-12">
            <HoverWaves />
            <span aria-hidden className="drift absolute -top-24 -right-24 size-72 rounded-full border border-sky/25" />
            <span aria-hidden className="drift absolute -top-10 -right-10 size-44 rounded-full border border-sky/20" style={{ animationDelay: '-7s' }} />
            <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between md:gap-10">
              <div className="flex max-w-3xl flex-col gap-4">
                <span className="flex items-center gap-2 font-label text-[15px] font-semibold tracking-[0.16em] text-sky uppercase">
                  <Quote aria-hidden className="size-4" /> Our Mission
                </span>
                <p className="text-[22px] leading-snug font-medium tracking-[-0.015em] text-balance md:text-[30px]">{mission}</p>
              </div>
              <Link
                to="/about"
                className="group/link flex shrink-0 items-center gap-1.5 self-start rounded-full border border-white/25 bg-white/10 px-5 py-2.5 font-semibold md:backdrop-blur-sm transition-colors hover:bg-white/20 md:self-end"
              >
                More about White Crane <ArrowRight aria-hidden className="size-4 transition-transform group-hover/link:translate-x-1" />
              </Link>
            </div>
          </div>
        </Reveal>

        {values.length > 0 && (
          <div className="grid gap-8 pt-4 lg:grid-cols-[300px_1fr] lg:gap-14">
            <div className="flex flex-col gap-3 lg:sticky lg:top-32 lg:self-start">
              <h3 className="text-[28px] font-semibold md:text-[32px]">What guides us</h3>
              <p className="text-lg leading-relaxed text-muted-foreground">
                The commitments behind every training, consultation and listing.
              </p>
            </div>
            <ValueGrid values={values} />
          </div>
        )}
      </div>
    </section>
  )
}

function DirectoryPreview({ teams }: { teams?: Page<PublicListing> }) {
  return (
    <Card className="lift gap-0 overflow-hidden p-0 shadow-lifted">
      <div className="flex items-center justify-between gap-3 border-b px-6 py-5">
        <b className="text-lg font-semibold">Listed DBT teams</b>
        {!!teams?.total && <Badge variant="acc">{teams.total} listed</Badge>}
      </div>
      {teams?.items.length ? (
        <ul className="flex flex-col">
          {teams.items.map((t) => (
            <li key={t.id} className="group flex items-center gap-3 border-b px-6 py-4 transition-colors last:border-b-0 hover:bg-surface">
              <IconTile icon={MapPin} className="size-9 group-hover:bg-primary group-hover:text-primary-foreground" />
              <div className="min-w-0">
                <b className="block truncate">{t.agency_name}</b>
                <span className="text-sm text-muted-foreground">{t.location}</span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="px-5 py-8 text-center text-muted-foreground">Approved teams will appear here.</p>
      )}
      <Link to="/directory" className="group flex items-center justify-center gap-1.5 border-t px-6 py-4 font-semibold text-primary hover:bg-surface">
        Search the directory <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
      </Link>
    </Card>
  )
}

export default function Home() {
  useDocumentTitle('')
  const content = useSiteContent()
  const trainings = useOpenTrainings()
  const directory = useDirectory({ limit: 3 }) // the preview shows three teams and the total

  return (
    <>
      <QueryState query={content}>
        {(c) => (
          <>
            <Hero c={c} trainings={trainings.data} teams={directory.data} />

            <section className="relative overflow-hidden">
              <div aria-hidden className="mesh-grid absolute inset-0 [mask-image:radial-gradient(ellipse_55%_60%_at_100%_0%,black,transparent)]" />
              <div aria-hidden className="drift absolute -top-32 -left-32 size-[420px] rounded-full bg-sky/20 blur-3xl max-md:hidden" />
              <div aria-hidden className="absolute -right-32 bottom-0 size-80 rounded-full bg-sage/10 blur-3xl" />
              <div className="relative mx-auto flex max-w-[1200px] flex-col gap-12 px-4 py-14 sm:px-6 md:py-24">
                <div className="grid gap-4 lg:grid-cols-2 lg:items-end">
                  <div className="flex flex-col gap-4">
                    <Eyebrow>What we do</Eyebrow>
                    <SectionTitle>Supporting DBT practice, from training to referral</SectionTitle>
                  </div>
                  <Lede className="lg:justify-self-end lg:text-right">
                    Three ways we support clinicians, teams and the people looking for them.
                  </Lede>
                </div>
                <div className="grid gap-6 md:grid-cols-3">
                  {PILLARS.map((p, i) => (
                    <Reveal key={p.title} index={i} className="flex">
                      <Card className="group lift relative flex-1 gap-4 overflow-hidden p-7 md:p-8">
                        <span
                          aria-hidden
                          className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-linear-to-r from-teal to-sky transition-transform duration-500 group-hover:scale-x-100"
                        />
                        <span
                          aria-hidden
                          className="pointer-events-none absolute -right-12 -bottom-12 size-40 rounded-full bg-sky/30 opacity-0 blur-2xl max-md:hidden transition-opacity duration-500 group-hover:opacity-100"
                        />
                        <span
                          aria-hidden
                          className="absolute top-5 right-6 text-4xl font-bold text-primary/10 transition-colors duration-300 group-hover:text-primary/25"
                        >
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <IconTile icon={p.icon} className="size-12 group-hover:-rotate-6 group-hover:bg-primary group-hover:text-primary-foreground" />
                        <CardTitle className="text-xl">{p.title}</CardTitle>
                        <CardDescription>{p.text}</CardDescription>
                        <ul className="flex flex-col gap-2 text-[15px]">
                          {p.points.map((point) => (
                            <li key={point} className="flex items-center gap-2">
                              <Check aria-hidden className="size-4 shrink-0 text-sage" /> {point}
                            </li>
                          ))}
                        </ul>
                        {/* The link's ::after covers the card, so the whole card is clickable. */}
                        <Link
                          to={p.to}
                          className="mt-auto flex items-center gap-1.5 border-t pt-5 font-semibold text-primary after:absolute after:inset-0"
                        >
                          {p.cta} <ArrowRight aria-hidden className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                        </Link>
                      </Card>
                    </Reveal>
                  ))}
                </div>
              </div>
            </section>

            <MissionValues mission={paragraphs(c.mission)[0] ?? ''} values={paragraphs(c.values)} />
          </>
        )}
      </QueryState>

      <Section>
        <div className="flex items-end justify-between gap-4">
          <div className="flex flex-col gap-4">
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
                {list.slice(0, 3).map((t, i) => (
                  <Reveal key={t.id} index={i} className="flex">
                    <TrainingCard training={t} />
                  </Reveal>
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
            <div className="flex flex-col gap-4">
              <Eyebrow>For clients and referrers</Eyebrow>
              <SectionTitle>DBT Clinical Directory</SectionTitle>
              <Lede>Find an approved DBT team near you, or apply to have your team listed.</Lede>
            </div>
            <ol className="flex flex-col gap-5">
              {LISTING_STEPS.map((step, i) => (
                <li key={step.title} className="group flex items-start gap-3.5">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground ring-4 ring-primary/0 transition-all duration-300 group-hover:scale-110 group-hover:ring-primary/15">
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

      <section className="px-4 pb-14 sm:px-6 md:pb-24">
        <div className="relative mx-auto max-w-[1200px] overflow-hidden rounded-3xl bg-linear-to-br from-ink via-navy to-teal text-white shadow-lifted">
          <div aria-hidden className="absolute -top-32 -right-24 size-96 rounded-full bg-sky/30 blur-3xl" />
          <div aria-hidden className="absolute -bottom-40 -left-20 size-80 rounded-full bg-sage/25 blur-3xl" />
          <div className="relative flex flex-col gap-8 px-7 py-12 md:flex-row md:items-center md:justify-between md:px-14 md:py-16">
            <div className="flex max-w-xl flex-col gap-3">
              <h2 className="text-[30px] text-white md:text-[40px]">Questions about training or the directory?</h2>
              <p className="text-lg text-white/80">
                We're happy to help teams and clinicians find the right next step. Send us a message and a member of
                the Board will get back to you.
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
              <Link to="/contact" className={buttonVariants({ variant: 'secondary', className: 'h-12 border-white px-7 text-base' })}>
                <Mail aria-hidden className="size-4" /> Contact us
              </Link>
              <Link to="/trainings" className={buttonVariants({ variant: 'secondary', className: cn(ON_DARK, 'h-12 px-7 text-base') })}>
                Browse trainings
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
