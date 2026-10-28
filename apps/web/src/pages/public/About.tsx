import {
  ArrowRight,
  BookMarked,
  Briefcase,
  Compass,
  FlaskConical,
  Gauge,
  Globe,
  Mail,
  MessagesSquare,
  Presentation,
  Quote,
  Scale,
  Users,
  UsersRound,
  type LucideIcon,
} from 'lucide-react'
import type { SiteContent } from '@/api/types'
import { QueryState } from '@/components/PageState'
import { PersonCard } from '@/components/PersonCard'
import { Reveal } from '@/components/Reveal'
import { RichText } from '@/components/RichText'
import { Rings } from '@/components/layout/PageHero'
import { PageTitle, Section, SectionTitle } from '@/components/layout/Section'
import { useHeroBand } from '@/components/layout/hero-band'
import { ButtonLink } from '@/components/ui/button'
import { ON_DARK } from '@/components/ui/button-variants'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { usePublicBoardMembers, useSiteContent } from '@/hooks/queries'
import { leadSentence, paragraphs, textBlocks } from '@/lib/format'
import { valueIcon } from '@/lib/value-icons'
import { cn } from '@/lib/utils'

/** Small uppercase label above a heading. */
function Eyebrow({ children, className }: { children: string; className?: string }) {
  return <span className={cn('text-xs font-semibold tracking-[0.12em] text-primary uppercase', className)}>{children}</span>
}


/** The three calls to action, shown in the pale header band and again on the navy band at the bottom. */
function Actions({ onDark = false }: { onDark?: boolean }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      <ButtonLink to="/trainings" variant={onDark ? 'secondary' : 'default'}>
        Explore Training
      </ButtonLink>
      <ButtonLink to="/contact?topic=consultation" variant="secondary" className={cn(onDark && ON_DARK)}>
        Consultation for Teams
      </ButtonLink>
      <ButtonLink to="/contact" variant="secondary" className={cn(onDark && ON_DARK)}>
        <Mail aria-hidden className="size-4" /> Contact White Crane
      </ButtonLink>
    </div>
  )
}

/** Three short takeaways of the intro, so the page can be skimmed before the full text. */
const GLANCE: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: FlaskConical, title: 'Evidence-based', text: "Grounded in Dr. Marsha Linehan's DBT model and current research." },
  { icon: Compass, title: 'Practical and rigorous', text: 'Training shaped by decades of clinical practice.' },
  { icon: Globe, title: 'Accessible', text: 'Across settings, locations and levels of resources.' },
]

function IntroHeader({ c }: { c: SiteContent }) {
  useHeroBand()
  const [lead, ...more] = paragraphs(c.about_intro)
  return (
    <>
      <section className="airy relative overflow-hidden">
        <Rings />
        <div className="relative mx-auto grid max-w-[1200px] items-center gap-10 px-4 pt-28 pb-24 sm:px-6 md:pt-36 md:pb-32 lg:grid-cols-[3fr_2fr] lg:gap-14">
          <div className="flex flex-col gap-5">
            <Eyebrow>About us</Eyebrow>
            <PageTitle>About White Crane</PageTitle>
            {lead && <p className="max-w-[620px] text-lg leading-relaxed text-muted-foreground">{lead}</p>}
            <Actions />
          </div>
          {c.mission && (
            <aside className="relative flex flex-col gap-3 rounded-xl border bg-white/80 p-6 shadow-lg shadow-navy/5 md:backdrop-blur-sm md:p-8">
              <span className="flex size-10 items-center justify-center rounded-full bg-sky/40 text-primary">
                <Quote aria-hidden className="size-5" />
              </span>
              <h2 className="text-[13px] font-semibold tracking-wider text-primary uppercase">Our Mission</h2>
              {paragraphs(c.mission).map((p, i) => (
                <p key={i} className={i === 0 ? 'text-lg leading-snug font-semibold md:text-xl' : 'text-muted-foreground'}>
                  {p}
                </p>
              ))}
            </aside>
          )}
        </div>
      </section>

      {/* Takeaway cards overlap the header band, then the rest of the intro reads below them. */}
      <div className="relative mx-auto -mt-14 flex max-w-[1200px] flex-col gap-10 px-4 pb-8 sm:px-6 md:-mt-20 md:pb-14">
        <div className="grid gap-4 md:grid-cols-3">
          {GLANCE.map((g, i) => (
            <Reveal key={g.title} index={i} className="flex">
              <div className="group lift flex flex-1 items-start gap-4 rounded-xl border bg-background p-5 shadow-lg shadow-navy/5">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-all duration-300 group-hover:-rotate-6 group-hover:bg-primary group-hover:text-primary-foreground">
                  <g.icon aria-hidden className="size-5" />
                </span>
                <div className="flex flex-col gap-1">
                  <b>{g.title}</b>
                  <span className="text-[13px] text-muted-foreground">{g.text}</span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        {more.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 md:gap-10">
            {more.map((p, i) => (
              <Reveal key={i} index={i}>
                <p className="border-l-2 border-sky pl-5 text-base leading-relaxed text-muted-foreground">{p}</p>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

/** Decorative icons for the "What we do" items, in order; they cycle if the Board adds more. */
const SERVICE_ICONS: LucideIcon[] = [Presentation, BookMarked, MessagesSquare, UsersRound, Gauge, Briefcase]

/** "What we do": intro text on the left, each listed service as an icon card on the right. */
function WhatWeDo({ text }: { text: string }) {
  const blocks = textBlocks(text)
  const intro = blocks.flatMap((b) => (b.type === 'p' ? [b.text] : []))
  const items = blocks.flatMap((b) => (b.type === 'p' ? [] : b.items))

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_2fr] lg:gap-12">
      <div className="flex flex-col gap-4 lg:sticky lg:top-8 lg:self-start">
        <Eyebrow>Our services</Eyebrow>
        <SectionTitle>What We Do</SectionTitle>
        {intro.map((p, i) => (
          <p key={i} className={i === 0 ? 'text-base text-muted-foreground' : 'font-semibold'}>
            {p}
          </p>
        ))}
      </div>
      <ul className="grid gap-4 sm:grid-cols-2">
        {items.map((item, i) => {
          const Icon = SERVICE_ICONS[i % SERVICE_ICONS.length]
          return (
            <li key={item} className="flex">
              <Reveal index={i % 2} className="flex flex-1">
                <div className="group lift relative flex flex-1 flex-col gap-4 overflow-hidden rounded-xl border bg-background p-5 md:p-6">
                  {/* A soft wash rises from the bottom on hover. */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 translate-y-full bg-linear-to-t from-sky/25 via-sky/10 to-transparent transition-transform duration-500 ease-out group-hover:translate-y-0"
                  />
                  <div className="relative flex items-start justify-between gap-3">
                    <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:-translate-y-0.5 group-hover:-rotate-6 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-lg group-hover:shadow-primary/30">
                      <Icon aria-hidden className="size-5" />
                    </span>
                    <span aria-hidden className="text-2xl font-bold text-primary/15 transition-colors duration-300 group-hover:text-primary/40">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <span className="relative font-semibold leading-snug">{item}</span>
                </div>
              </Reveal>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/**
 * "Who we serve" and "How we work" as two contrasting cards. The first paragraph of each is pulled out
 * as a highlight; a large faint icon in the corner turns and grows on hover.
 */
function StoryCard({ icon: Icon, eyebrow, title, text, dark = false, index }: { icon: LucideIcon; eyebrow: string; title: string; text: string; dark?: boolean; index: number }) {
  const [lead, ...rest] = paragraphs(text)
  return (
    <Reveal index={index} className="flex">
      <article
        className={cn(
          'group lift relative flex flex-1 flex-col gap-5 overflow-hidden rounded-2xl border p-6 md:p-8',
          dark ? 'border-navy bg-linear-to-br from-navy to-teal text-white' : 'bg-background',
        )}
      >
        <Icon
          aria-hidden
          className={cn(
            'pointer-events-none absolute -right-8 -bottom-8 size-48 transition-transform duration-700 ease-out group-hover:scale-110 group-hover:-rotate-12',
            dark ? 'text-white/6' : 'text-primary/6',
          )}
        />
        <div className="relative flex items-center gap-3">
          <span
            className={cn(
              'flex size-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110',
              dark ? 'bg-white/12 text-sky' : 'bg-primary/10 text-primary',
            )}
          >
            <Icon aria-hidden className="size-6" />
          </span>
          <div className="flex flex-col">
            <Eyebrow className={dark ? 'text-sky' : undefined}>{eyebrow}</Eyebrow>
            <h2 className={cn('text-[22px] md:text-[26px]', dark && 'text-white')}>{title}</h2>
          </div>
        </div>
        {lead && (
          <p
            className={cn(
              'relative rounded-lg p-4 text-base leading-relaxed font-semibold',
              dark ? 'bg-white/10 text-white' : 'bg-surface text-foreground',
            )}
          >
            {lead}
          </p>
        )}
        {rest.length > 0 && <RichText text={rest.join('\n')} className={cn('relative', dark && 'text-sidebar-foreground')} />}
      </article>
    </Reveal>
  )
}

function Values({ values }: { values: string[] }) {
  return (
    <Section alt className="relative">
      <div className="flex flex-col items-center gap-2 text-center">
        <Eyebrow>Our values</Eyebrow>
        <SectionTitle>What Guides Us</SectionTitle>
        <p className="text-base text-muted-foreground">Our approach is rooted in several commitments:</p>
      </div>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {values.map((line, i) => {
          const { lead, rest } = leadSentence(line)
          const Icon = valueIcon(lead)
          return (
            <Reveal key={line} index={i % 3} className="flex">
              <div className="group lift flex flex-1 flex-col items-center gap-3 rounded-xl border bg-background px-6 pt-8 pb-6 text-center">
                {/* Rings ripple out from the icon on hover, echoing the circles in the page header. */}
                <span className="relative mb-2 flex size-14 items-center justify-center">
                  <span aria-hidden className="absolute inset-0 rounded-full border border-primary/30 opacity-0 transition-all duration-500 group-hover:scale-[1.35] group-hover:opacity-100" />
                  <span aria-hidden className="absolute inset-0 rounded-full border border-sky/50 opacity-0 transition-all delay-100 duration-700 group-hover:scale-[1.7] group-hover:opacity-100" />
                  <span className="relative flex size-14 items-center justify-center rounded-full bg-linear-to-br from-primary/10 to-sky/30 text-primary transition-all duration-300 group-hover:from-teal group-hover:to-navy group-hover:text-white">
                    <Icon aria-hidden className="size-6" />
                  </span>
                </span>
                {lead && <h3 className="text-base font-semibold transition-colors group-hover:text-primary">{lead}</h3>}
                <p className="text-muted-foreground">{rest}</p>
              </div>
            </Reveal>
          )
        })}
      </div>
    </Section>
  )
}

function AboutContent({ c }: { c: SiteContent }) {
  const values = paragraphs(c.values)
  return (
    <>
      <IntroHeader c={c} />

      {c.what_we_do && (
        <Section alt className="md:py-16">
          <WhatWeDo text={c.what_we_do} />
        </Section>
      )}

      {(c.who_we_serve || c.how_we_work) && (
        <Section className="md:py-16">
          <div className="grid items-stretch gap-6 lg:grid-cols-2">
            {c.who_we_serve && <StoryCard icon={Users} eyebrow="Our community" title="Who We Serve" text={c.who_we_serve} index={0} />}
            {c.how_we_work && <StoryCard icon={Scale} eyebrow="Our approach" title="How We Work" text={c.how_we_work} dark index={1} />}
          </div>
        </Section>
      )}

      {values.length > 0 && <Values values={values} />}
    </>
  )
}

export default function About() {
  useDocumentTitle('About')
  const content = useSiteContent()
  const members = usePublicBoardMembers('board')

  return (
    <>
      <QueryState query={content}>{(c) => <AboutContent c={c} />}</QueryState>

      <Section>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionTitle>Board of Directors</SectionTitle>
          <ButtonLink to="/trainers" variant="link">
            Meet our trainers <ArrowRight aria-hidden className="size-4" />
          </ButtonLink>
        </div>
        <QueryState query={members}>
          {(list) => (
            <div className="grid items-start gap-6 md:grid-cols-2">
              {list.map((m) => (
                <PersonCard key={m.id} person={m} />
              ))}
            </div>
          )}
        </QueryState>
      </Section>

      <section className="relative overflow-hidden bg-navy text-white">
        <Rings />
        <div className="relative mx-auto flex max-w-[1200px] flex-col gap-6 px-4 py-10 sm:px-6 md:py-14">
          <div className="flex max-w-2xl flex-col gap-2">
            <h2 className="text-[22px] text-white md:text-[26px]">Learn With White Crane</h2>
            {content.data?.about_closing && <p className="text-sidebar-foreground">{content.data.about_closing}</p>}
          </div>
          <Actions onDark />
        </div>
      </section>
    </>
  )
}
