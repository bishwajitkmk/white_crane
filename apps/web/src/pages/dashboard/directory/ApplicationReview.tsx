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
import { Textarea } from '@/components/ui/input'
import { keys, useApplication, useInvalidatingMutation } from '@/hooks/queries'
import { formatDate, formatTime } from '@/lib/format'
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
            <CardTitle>Contact person (private)</CardTitle>
            <KeyValues
              rows={[
                ['Name', a.contact_name],
                ['Email', <a href={`mailto:${a.contact_email}`} className="text-primary">{a.contact_email}</a>],
                ['Phone', a.contact_phone],
              ]}
            />
          </Card>
          <Card className="p-6">
            <CardTitle>Attestation</CardTitle>
            <p className="text-muted-foreground">
              Signed by {a.attestation_signed_name} on {formatDate(a.attestation_signed_at)} at {formatTime(a.attestation_signed_at)}.
              Attestation version {a.attestation_version}.
            </p>
          </Card>
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
                  Approve and publish listing
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
