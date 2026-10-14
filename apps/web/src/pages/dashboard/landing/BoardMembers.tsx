import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useSearchParams } from 'react-router-dom'
import { api } from '@/api/endpoints'
import type { BoardMember, MemberKind } from '@/api/types'
import { Field, FormError } from '@/components/forms/Field'
import { ImageUpload } from '@/components/forms/ImageUpload'
import { DashboardPage, Toolbar } from '@/components/layout/DashboardLayout'
import { EmptyState, QueryState } from '@/components/PageState'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Input, Textarea } from '@/components/ui/input'
import { Placeholder } from '@/components/ui/placeholder'
import { Tabs } from '@/components/ui/tabs'
import { keys, useBoardMembers, useInvalidatingMutation } from '@/hooks/queries'
import { boardMemberSchema, type BoardMemberValues } from '@/lib/schemas'

const KINDS = {
  board: { tab: 'Board of Directors', noun: 'member', page: 'About page', empty: 'No board members yet.' },
  trainer: { tab: 'Trainers', noun: 'trainer', page: 'Trainers page', empty: 'No trainers yet.' },
} satisfies Record<MemberKind, { tab: string; noun: string; page: string; empty: string }>

export default function BoardMembers() {
  const [params, setParams] = useSearchParams()
  const kind: MemberKind = params.get('kind') === 'trainer' ? 'trainer' : 'board'
  const labels = KINDS[kind]
  const members = useBoardMembers(kind)
  const [editing, setEditing] = useState<BoardMember | 'new' | null>(null)
  const invalidate = [keys.boardMembers]
  const reorder = useInvalidatingMutation(api.admin.reorderBoardMembers, invalidate)
  const remove = useInvalidatingMutation(api.admin.deleteBoardMember, invalidate)

  const move = (list: BoardMember[], index: number, delta: number) => {
    const ids = list.map((m) => m.id)
    const [id] = ids.splice(index, 1)
    ids.splice(index + delta, 0, id)
    reorder.mutate(ids)
  }

  return (
    <DashboardPage title="Board & trainers">
      <Tabs
        value={kind}
        onChange={(k) => setParams(k === 'board' ? {} : { kind: k }, { replace: true })}
        options={(Object.keys(KINDS) as MemberKind[]).map((k) => ({ value: k, label: KINDS[k].tab }))}
      />
      <Toolbar>
        <span className="text-[13px] text-muted-foreground">Shown on the {labels.page} in this order.</span>
        <Button onClick={() => setEditing('new')}>Add {labels.noun}</Button>
      </Toolbar>
      <QueryState query={members}>
        {(list) =>
          list.length === 0 ? (
            <EmptyState>{labels.empty}</EmptyState>
          ) : (
            <ul className="flex flex-col gap-3">
              {list.map((m, i) => (
                <li key={m.id} className="flex flex-wrap items-center gap-4 rounded-lg border bg-background p-4">
                  <div className="flex flex-col">
                    <Button variant="ghost" size="icon" className="size-6" aria-label={`Move ${m.name} up`} disabled={i === 0 || reorder.isPending} onClick={() => move(list, i, -1)}>
                      <ArrowUp className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="size-6" aria-label={`Move ${m.name} down`} disabled={i === list.length - 1 || reorder.isPending} onClick={() => move(list, i, 1)}>
                      <ArrowDown className="size-4" />
                    </Button>
                  </div>
                  {m.photo_url ? (
                    <img src={m.photo_url} alt="" className="size-14 rounded-md object-cover" />
                  ) : (
                    <Placeholder className="size-14">Photo</Placeholder>
                  )}
                  <div className="flex min-w-40 flex-1 flex-col gap-0.5">
                    <b>{m.name}</b>
                    <span className="text-[13px] text-muted-foreground">
                      {[m.role, m.bio.split('\n')[0]].filter(Boolean).join('. ')}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => setEditing(m)}>
                      Edit
                    </Button>
                    <Button
                      variant="secondary"
                      disabled={remove.isPending}
                      onClick={() => confirm(`Remove ${m.name} from the ${labels.page}?`) && remove.mutate(m.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )
        }
      </QueryState>
      <Dialog open={editing !== null} onClose={() => setEditing(null)} title={`${editing === 'new' ? 'Add' : 'Edit'} ${labels.noun}`} variant="drawer">
        {editing !== null && (
          <MemberForm kind={kind} member={editing === 'new' ? undefined : editing} onDone={() => setEditing(null)} />
        )}
      </Dialog>
    </DashboardPage>
  )
}

function MemberForm({ kind, member, onDone }: { kind: MemberKind; member?: BoardMember; onDone: () => void }) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<BoardMemberValues>({
    resolver: zodResolver(boardMemberSchema),
    defaultValues: member
      ? { kind: member.kind, name: member.name, role: member.role, bio: member.bio, photo_url: member.photo_url }
      : { kind, name: '', role: '', bio: '', photo_url: null },
  })
  const photo = useWatch({ control, name: 'photo_url' })
  const save = useInvalidatingMutation(
    (v: BoardMemberValues) => (member ? api.admin.updateBoardMember(member.id, v) : api.admin.createBoardMember(v)),
    [keys.boardMembers],
  )

  return (
    <form onSubmit={handleSubmit((v) => save.mutate(v, { onSuccess: onDone }))} className="flex flex-col gap-4" noValidate>
      <Field label="Name" required error={errors.name}>
        <Input {...register('name')} />
      </Field>
      <Field label="Role / credentials" error={errors.role}>
        <Input {...register('role')} />
      </Field>
      <Field label="Bio" hint="A blank line starts a new paragraph. The first paragraph shows until visitors expand the bio." error={errors.bio}>
        <Textarea rows={10} {...register('bio')} />
      </Field>
      <ImageUpload
        label="Photo"
        value={photo}
        onChange={(url) => setValue('photo_url', url, { shouldDirty: true })}
        previewClassName="size-32"
        hint="Square photos work best."
      />
      <FormError error={save.error} />
      <div>
        <Button type="submit" disabled={save.isPending}>
          Save
        </Button>
      </div>
    </form>
  )
}
