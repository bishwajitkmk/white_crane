import { ArrowRight, Check, Mail } from 'lucide-react'
import type { SiteContent } from '@/api/types'
import { QueryState } from '@/components/PageState'
import { PersonCard } from '@/components/PersonCard'
import { RichText } from '@/components/RichText'
import { PageTitle, Section, SectionTitle } from '@/components/layout/Section'
import { ButtonLink } from '@/components/ui/button'
import { Card, CardDescription, CardTitle } from '@/components/ui/card'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { usePublicBoardMembers, useSiteContent } from '@/hooks/queries'
import { leadSentence, paragraphs, textBlocks } from '@/lib/format'

/** The three calls to action, shown near the top and again at the bottom of the page. */
function Actions() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      <ButtonLink to="/trainings">Explore Training</ButtonLink>
      <ButtonLink to="/contact?topic=consultation" variant="secondary">
        Consultation for Teams
      </ButtonLink>
      <ButtonLink to="/contact" variant="secondary">
        <Mail aria-hidden className="size-4" /> Contact White Crane
      </ButtonLink>
    </div>
  )
}

/** Intro paragraphs and lists of "What we do", with the list drawn as compact cards. */
function WhatWeDo({ text }: { text: string }) {
  return (
    <div className="flex flex-col gap-4">
      {textBlocks(text).map((block, i) =>
        block.type === 'p' ? (
          <p key={i} className="max-w-[720px] text-base text-muted-foreground">
            {block.text}
          </p>
        ) : (
          <ul key={i} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {block.items.map((item) => (
              <li key={item} className="flex gap-3 rounded-lg border bg-background p-4">
                <Check aria-hidden className="mt-0.5 size-5 shrink-0 text-primary" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ),
      )}
    </div>
  )
}

function AboutContent({ c }: { c: SiteContent }) {
  const values = paragraphs(c.values)
  return (
    <>
      <Section className="gap-8">
        <div className="grid items-start gap-8 lg:grid-cols-[3fr_2fr]">
          <div className="flex flex-col gap-5">
            <PageTitle>About White Crane</PageTitle>
            <RichText text={c.about_intro} />
            <Actions />
          </div>
          {c.mission && (
            <aside className="flex flex-col gap-3 rounded-lg bg-primary p-6 text-primary-foreground md:p-8">
              <h2 className="text-[13px] font-semibold uppercase tracking-wider text-primary-foreground/80">Our Mission</h2>
              {paragraphs(c.mission).map((p, i) => (
                <p key={i} className={i === 0 ? 'text-lg font-semibold leading-snug md:text-xl' : 'text-primary-foreground/90'}>
                  {p}
                </p>
              ))}
            </aside>
          )}
        </div>
      </Section>

      {c.what_we_do && (
        <Section alt>
          <SectionTitle>What We Do</SectionTitle>
          <WhatWeDo text={c.what_we_do} />
        </Section>
      )}

      {(c.who_we_serve || c.how_we_work) && (
        <Section>
          <div className="grid gap-10 lg:grid-cols-2">
            {c.who_we_serve && (
              <div className="flex flex-col gap-4">
                <SectionTitle>Who We Serve</SectionTitle>
                <RichText text={c.who_we_serve} />
              </div>
            )}
            {c.how_we_work && (
              <div className="flex flex-col gap-4">
                <SectionTitle>How We Work</SectionTitle>
                <RichText text={c.how_we_work} />
              </div>
            )}
          </div>
        </Section>
      )}

      {values.length > 0 && (
        <Section alt>
          <div className="flex flex-col gap-2">
            <SectionTitle>What Guides Us</SectionTitle>
            <p className="text-base text-muted-foreground">Our approach is rooted in several commitments:</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {values.map((line) => {
              const { lead, rest } = leadSentence(line)
              return (
                <Card key={line} className="gap-2 border-t-4 border-t-primary p-5">
                  {lead && <CardTitle>{lead}</CardTitle>}
                  <CardDescription>{rest}</CardDescription>
                </Card>
              )
            })}
          </div>
        </Section>
      )}
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

      <section className="bg-navy text-white">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-4 py-10 sm:px-6 md:py-14">
          <div className="flex max-w-2xl flex-col gap-2">
            <h2 className="text-[22px] text-white md:text-[26px]">Learn With White Crane</h2>
            {content.data?.about_closing && <p className="text-sidebar-foreground">{content.data.about_closing}</p>}
          </div>
          <Actions />
        </div>
      </section>
    </>
  )
}
