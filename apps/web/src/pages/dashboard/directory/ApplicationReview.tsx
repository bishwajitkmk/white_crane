import { useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '@/api/endpoints'
import type { Application, DecisionAction } from '@/api/types'
import { Field, FormError } from '@/components/forms/Field'
import { DashboardPage, Toolbar } from '@/components/layout/DashboardLayout'
import { QueryState } from '@/components/PageState'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardTitle } from '@/components/ui/card'
import { Select, Textarea } from '@/components/ui/input'
import { keys, useApplication, useInvalidatingMutation, useListings } from '@/hooks/queries'
import { PRACTICE_GROUPS, RESIDENTIAL_ITEMS, type AttestationItem } from '@/lib/attestation'
import { formatDate, formatDay, formatTime } from '@/lib/format'
import { APPLICATION_STATUS } from '@/lib/status'

export default function ApplicationReview() {
  const { id = '' } = useParams()
  const application = useApplication(id)

  return (
    <DashboardPage title="Review application">
      <QueryState query={application}>{(a) => <Review application={a} />}</QueryState>
    </DashboardPage>
  )
}

function KeyValues({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-[160px_1fr]">
      {rows.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="text-[13px] text-muted-foreground">{k}</dt>
          <dd className="m-0 mb-2 sm:mb-0">{v || '—'}</dd>
        </div>
      ))}
    </dl>
  )
}

function TeamMembers({ application: a }: { application: Application }) {
  return (
    <Card className="p-6">
      <CardTitle>Team members ({a.team_members.length})</CardTitle>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="text-[13px] text-muted-foreground">
            <tr>
              <th className="py-1.5 pr-4 font-normal">Name</th>
              <th className="py-1.5 pr-4 font-normal">Agency / practice</th>
              <th className="py-1.5 pr-4 font-normal">Email</th>
              <th className="py-1.5 font-normal whitespace-nowrap">Joined team</th>
            </tr>
          </thead>
          <tbody>
            {a.team_members.map((m, i) => (
              <tr key={i} className="border-t">
                <td className="py-2 pr-4 font-semibold">{m.name}</td>
                <td className="py-2 pr-4">{m.affiliation}</td>
                <td className="py-2 pr-4">
                  <a href={`mailto:${m.email}`} className="text-primary">{m.email}</a>
                </td>
                <td className="py-2 whitespace-nowrap">{formatDay(m.joined_on)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function Attestation({ application: a }: { application: Application }) {
  const signed = `Signed by ${a.attestation_signed_name}${a.attestation_signed_title ? ` (${a.attestation_signed_title})` : ''} on ${formatDate(a.attestation_signed_at)} at ${formatTime(a.attestation_signed_at)}. Attestation version ${a.attestation_version}.`
  const ids = Object.keys(a.answers)
  if (ids.length === 0) {
    // Submitted before the Attestation of DBT Practice checklist existed.
    return (
      <Card className="p-6">
        <CardTitle>Attestation</CardTitle>
        <p className="text-muted-foreground">{signed}</p>
      </Card>
    )
  }

  const groups = [
    ...(a.residential ? [{ title: 'Residential and inpatient programs', items: RESIDENTIAL_ITEMS }] : []),
    ...PRACTICE_GROUPS,
  ]
  const noItems = groups.flatMap((g) => g.items).filter((i) => a.answers[i.id] === false)
  const comments = [
    ['Residential and inpatient comments', a.comments_residential],
    ['Program practices comments', a.comments_practices],
    ['Other information', a.additional_info],
  ].filter(([, text]) => text)

  return (
    <Card className="gap-4 p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <CardTitle>Attestation of DBT practice</CardTitle>
        <Badge variant={noItems.length ? 'warn' : 'ok'}>
          {ids.length - noItems.length} of {ids.length} Yes
        </Badge>
      </div>

      {noItems.length > 0 && (
        <div className="flex flex-col gap-2">
          <h5 className="text-[13px] font-semibold">Answered No</h5>
          <ul className="flex flex-col gap-2">
            {noItems.map((item) => (
              <AnswerRow key={item.id} item={item} yes={false} />
            ))}
          </ul>
        </div>
      )}

      {comments.map(([label, text]) => (
        <div key={label} className="flex flex-col gap-1">
          <h5 className="text-[13px] font-semibold">{label}</h5>
          <p className="whitespace-pre-line">{text}</p>
        </div>
      ))}

      <details className="group">
        <summary className="cursor-pointer text-[13px] font-semibold text-primary">Show all {ids.length} answers</summary>
        <div className="mt-3 flex flex-col gap-4">
          {groups.map((g) => (
            <section key={g.title} className="flex flex-col gap-2">
              <h5 className="text-[13px] font-semibold tracking-wide text-muted-foreground uppercase">{g.title}</h5>
              <ul className="flex flex-col gap-2">
                {g.items.map((item) => (
                  <AnswerRow key={item.id} item={item} yes={a.answers[item.id]} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      </details>

      <p className="text-[13px] text-muted-foreground">{signed}</p>
    </Card>
  )
}

function AnswerRow({ item, yes }: { item: AttestationItem; yes: boolean | undefined }) {
  return (
    <li className="flex items-start gap-3">
      <Badge variant={yes === undefined ? 'acc' : yes ? 'ok' : 'bad'} className="mt-0.5 w-10 text-center">
        {yes === undefined ? '—' : yes ? 'Yes' : 'No'}
      </Badge>
      <span>
        <span className="font-semibold text-muted-foreground">{item.id}.</span> {item.text}
      </span>
    </li>
  )
}

/** Teams re-attest every year: a renewal application renews an existing listing instead of creating one. */
function Renewal({ application: a, decided }: { application: Application; decided: boolean }) {
  const listings = useListings()
  const link = useInvalidatingMutation(
    (listingId: string | null) => api.admin.linkRenewal(a.id, listingId),
    [keys.applications, keys.application(a.id)],
  )
  const linked = listings.data?.find((l) => l.id === a.renews_listing_id)

  return (
    <Card className="gap-3 border-primary/40 p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <CardTitle>Annual renewal</CardTitle>
        <Badge variant={a.renews_listing_id ? 'acc' : 'warn'}>{a.renews_listing_id ? 'Linked to listing' : 'No listing linked'}</Badge>
      </div>
      {linked ? (
        <p className="text-muted-foreground">
          Renews <span className="font-semibold text-foreground">{linked.agency_name}</span> ({linked.location}), last attested{' '}
          {formatDate(linked.attested_at)}, renewal due {formatDate(linked.renewal_due_at)}. Approving updates that listing with
          these details and sets the next renewal one year out.
        </p>
      ) : (
        <p className="text-muted-foreground">
          {a.renewal ? 'The team says this is a renewal, but no listing matched their Team Leader email or agency name. ' : ''}
          Without a linked listing, approving publishes a new listing.
        </p>
      )}
      {!decided && (
        <Field label="Listing this renews">
          <Select
            value={a.renews_listing_id ?? ''}
            disabled={link.isPending || !listings.data}
            onChange={(e) => link.mutate(e.target.value || null)}
          >
            <option value="">None: approve as a new listing</option>
            {listings.data?.map((l) => (
              <option key={l.id} value={l.id}>
                {l.agency_name} ({l.location}), due {formatDate(l.renewal_due_at)}
              </option>
            ))}
          </Select>
        </Field>
      )}
      <FormError error={link.error} />
    </Card>
  )
}

function Review({ application: a }: { application: Application }) {
  const [note, setNote] = useState('')
  const decide = useInvalidatingMutation(
    (action: DecisionAction) => api.admin.decide(a.id, action, note),
    [keys.applications, keys.listings],
  )
  const status = APPLICATION_STATUS[a.status]
  const decided = a.status === 'approved' || a.status === 'declined'

  const act = (action: DecisionAction) => {
    if (action === 'decline' && !confirm(`Decline ${a.agency_name}? The applicant is emailed.`)) return
    decide.mutate(action, { onSuccess: () => setNote('') })
  }

  return (
    <>
      <Toolbar>
        <div className="flex items-center gap-3">
          <span className="text-[13px] text-muted-foreground">
            <Link to="/dashboard/applications" className="hover:text-primary">
              Applications
            </Link>
            &nbsp;/&nbsp; {a.agency_name}
          </span>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>
        <span className="text-[13px] text-muted-foreground">Submitted {formatDate(a.submitted_at)}</span>
      </Toolbar>

      <div className="grid items-start gap-5 xl:grid-cols-[1fr_380px]">
        <div className="flex flex-col gap-4">
          {(a.renewal || a.renews_listing_id) && <Renewal application={a} decided={decided} />}
          <Card className="p-6">
            <CardTitle>Team details (public if approved)</CardTitle>
            <KeyValues
              rows={[
                ['Agency', a.agency_name],
                ['Location', a.location],
                ['Website', a.website && <a href={a.website} target="_blank" rel="noreferrer" className="text-primary">{a.website.replace(/^https?:\/\//, '')}</a>],
                ['Public contact', a.public_contact],
              ]}
            />
          </Card>
          <Card className="p-6">
            <CardTitle>Team Leader and program (private)</CardTitle>
            <KeyValues
              rows={[
                ['Team Leader', a.contact_name],
                ['Email', <a href={`mailto:${a.contact_email}`} className="text-primary">{a.contact_email}</a>],
                ['Phone', a.contact_phone],
                ['Program address', a.program_address && <span className="whitespace-pre-line">{a.program_address}</span>],
                ['DBT services', a.services.length > 0 && <ul>{a.services.map((s) => <li key={s}>{s}</li>)}</ul>],
                ['Residential / inpatient', a.answers && Object.keys(a.answers).length > 0 ? (a.residential ? 'Yes' : 'No') : ''],
                ['First consultation team meeting', formatDay(a.first_consultation_on)],
              ]}
            />
          </Card>
          {a.team_members.length > 0 && <TeamMembers application={a} />}
          <Attestation application={a} />
        </div>

        <div className="flex flex-col gap-4">
          <Card className="gap-3 p-6">
            <CardTitle>Decision</CardTitle>
            {decided ? (
              <p className="text-muted-foreground">
                {status.label} on {formatDate(a.reviewed_at)}.
              </p>
            ) : (
              <>
                <Field label="Note to applicant (sent by email)">
                  <Textarea rows={4} value={note} onChange={(e) => setNote(e.target.value)} />
                </Field>
                <FormError error={decide.error} />
                <Button disabled={decide.isPending} onClick={() => act('approve')}>
                  {a.renews_listing_id ? 'Approve and renew listing' : 'Approve and publish listing'}
                </Button>
                <Button variant="secondary" disabled={decide.isPending || !note.trim()} onClick={() => act('request-info')} title={note.trim() ? undefined : 'Add a note describing what is needed'}>
                  Request more information
                </Button>
                <Button variant="destructive" disabled={decide.isPending} onClick={() => act('decline')}>
                  Decline
                </Button>
              </>
            )}
          </Card>
          <Card className="gap-1.5 p-6">
            <CardTitle>Activity</CardTitle>
            <ol className="flex flex-col gap-1.5">
              {a.activity.map((e, i) => (
                <li key={i} className="text-[13px] text-muted-foreground">
                  <span className="mr-2 font-semibold">{formatDate(e.at)}</span>
                  {e.message}
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </div>
    </>
  )
}
