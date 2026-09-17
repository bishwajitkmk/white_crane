import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { api } from '@/api/endpoints'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { subscribeSchema, type SubscribeValues } from '@/lib/schemas'
import { cn } from '@/lib/utils'
import { FormError } from './Field'

interface SubscribeFormProps {
  /** Stored on the subscriber row so the board can see where signups come from. */
  source: string
  className?: string
  consent?: boolean
}

export function SubscribeForm({ source, className, consent = true }: SubscribeFormProps) {
  const navigate = useNavigate()
  const { register, handleSubmit, formState } = useForm<SubscribeValues>({ resolver: zodResolver(subscribeSchema) })
  const subscribe = useMutation({
    mutationFn: (v: SubscribeValues) => api.public.subscribe(v.email, source),
    onSuccess: () => navigate('/subscribed'),
  })

  return (
    <form onSubmit={handleSubmit((v) => subscribe.mutate(v))} className={cn('flex w-full max-w-md flex-col gap-2', className)} noValidate>
      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="sr-only" htmlFor={`subscribe-${source}`}>
          Email address
        </label>
        <Input
          id={`subscribe-${source}`}
          type="email"
          placeholder="email@address"
          autoComplete="email"
          aria-invalid={formState.errors.email ? true : undefined}
          {...register('email')}
        />
        <Button type="submit" disabled={subscribe.isPending} className="max-sm:w-full">
          Subscribe
        </Button>
      </div>
      {formState.errors.email && <span className="text-xs text-destructive">{formState.errors.email.message}</span>}
      <FormError error={subscribe.error} />
      {consent && (
        <span className="text-xs text-muted-foreground">
          By subscribing you agree to receive occasional updates from White Crane. Unsubscribe at any time.
        </span>
      )}
    </form>
  )
}
