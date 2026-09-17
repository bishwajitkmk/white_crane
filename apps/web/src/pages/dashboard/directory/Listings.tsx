import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { api } from '@/api/endpoints'
import type { Listing } from '@/api/types'
import { DataTable } from '@/components/DataTable'
import { Field, FieldRow, FormError } from '@/components/forms/Field'
import { DashboardPage, Toolbar } from '@/components/layout/DashboardLayout'
import { QueryState } from '@/components/PageState'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Input, Select } from '@/components/ui/input'
import { keys, useInvalidatingMutation, useListings } from '@/hooks/queries'
import { formatDate } from '@/lib/format'
import { listingSchema, type ListingValues } from '@/lib/schemas'
import { listingStatus } from '@/lib/status'

const stateOf = (location: string) => location.split(',').pop()?.trim() ?? ''

export default function Listings() {
  const listings = useListings()
  const [search, setSearch] = useState('')
  const [state, setState] = useState('')
  const [managing, setManaging] = useState<Listing | null>(null)

  const all = listings.data ?? []
  const states = [...new Set(all.map((l) => stateOf(l.location)))].sort()
  const visibleCount = all.filter((l) => listingStatus(l).variant !== 'bad').length
  const rows = all.filter((l) => l.agency_name.toLowerCase().includes(search.toLowerCase()) && (!state || stateOf(l.location) === state))

  return (
    <DashboardPage title="Published listings">
      <Toolbar>
        <span className="text-[13px] text-muted-foreground">{visibleCount} teams shown on the public directory.</span>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input aria-label="Search listings" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} className="h-[38px] sm:w-[220px]" />
          <Select aria-label="State" value={state} onChange={(e) => setState(e.target.value)} className="h-[38px] py-0 sm:w-[140px]">
            <option value="">State: All</option>
            {states.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>
        </div>
      </Toolbar>
      <QueryState query={listings}>
        {() => (
          <DataTable
            rows={rows}
            rowKey={(l) => l.id}
            empty="No listings match."
            columns={[
              { header: 'Agency', cell: (l) => <span className="font-semibold">{l.agency_name}</span> },
              { header: 'Location', cell: (l) => l.location },
              { header: 'Published', cell: (l) => formatDate(l.published_at) },
              { header: 'Renewal due', cell: (l) => formatDate(l.renewal_due_at) },
              { header: 'Status', cell: (l) => <Badge variant={listingStatus(l).variant}>{listingStatus(l).label}</Badge> },
              { header: '', cell: (l) => <Button variant="link" onClick={() => setManaging(l)}>Manage</Button> },
            ]}
          />
        )}
      </QueryState>
      <Dialog open={managing !== null} onClose={() => setManaging(null)} title="Manage listing" variant="drawer">
        {managing && <ManageListing listing={managing} onDone={() => setManaging(null)} />}
      </Dialog>
    </DashboardPage>
  )
}

function ManageListing({ listing, onDone }: { listing: Listing; onDone: () => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ListingValues>({
    resolver: zodResolver(listingSchema),
    defaultValues: { ...listing, renewal_due_at: listing.renewal_due_at.slice(0, 10) },
  })
  const update = useInvalidatingMutation(
    (input: Partial<Listing>) => api.admin.updateListing(listing.id, input),
    [keys.listings],
  )

  return (
    <form
      onSubmit={handleSubmit((v) => update.mutate({ ...v, renewal_due_at: `${v.renewal_due_at}T00:00:00` }, { onSuccess: onDone }))}
      className="flex flex-col gap-4"
      noValidate
    >
      <p className="text-muted-foreground">Edit public fields, set the renewal date, or hide the team from the directory. Listings are never deleted.</p>
      <Field label="Agency" required error={errors.agency_name}>
        <Input {...register('agency_name')} />
      </Field>
      <FieldRow>
        <Field label="Location" required error={errors.location}>
          <Input {...register('location')} />
        </Field>
        <Field label="Renewal due" required error={errors.renewal_due_at}>
          <Input type="date" {...register('renewal_due_at')} />
        </Field>
      </FieldRow>
      <Field label="Website" error={errors.website}>
        <Input type="url" {...register('website')} />
      </Field>
      <Field label="Public contact" error={errors.public_contact}>
        <Input {...register('public_contact')} />
      </Field>
      <FormError error={update.error} />
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={update.isPending}>
          Save
        </Button>
        <Button variant="secondary" disabled={update.isPending} onClick={() => update.mutate({ hidden: !listing.hidden }, { onSuccess: onDone })}>
          {listing.hidden ? 'Show on directory' : 'Hide from directory'}
        </Button>
        <Link to={`/dashboard/applications/${listing.application_id}`} className="self-center px-2 font-semibold text-primary">
          View application
        </Link>
      </div>
    </form>
  )
}
