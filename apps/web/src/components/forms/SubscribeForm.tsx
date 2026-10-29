import { useMutation } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/api/endpoints'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { FormError, HoneypotField } from './Field'

interface SubscribeFormProps {
  /** Stored on the subscriber row so the board can see where signups come from. */
  source: string
  className?: string
  consent?: boolean
}

/**
 * Footer sign-up, shown on every public page. Validated with the browser's own email check rather than the
 * form libraries, which keeps them out of the main bundle.
 */
export function SubscribeForm({ source, className, consent = true }: SubscribeFormProps) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [nickname, setNickname] = useState('')
  const [invalid, setInvalid] = useState(false)
  const subscribe = useMutation({
    mutationFn: () => api.public.subscribe(email.trim(), source, nickname),
    onSuccess: () => navigate('/subscribed'),
  })

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const ok = e.currentTarget.checkValidity()
    setInvalid(!ok)
    if (ok) subscribe.mutate()
  }

  return (
    <form onSubmit={submit} className={cn('flex w-full max-w-md flex-col gap-2', className)} noValidate>
      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="sr-only" htmlFor={`subscribe-${source}`}>
          Email address
        </label>
        <Input
          id={`subscribe-${source}`}
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={invalid ? true : undefined}
          className="rounded-full px-5"
        />
        <Button type="submit" disabled={subscribe.isPending} className="max-sm:w-full">
          Subscribe
        </Button>
      </div>
      {invalid && <span className="text-xs text-destructive">Enter a valid email address</span>}
      <HoneypotField name="nickname" value={nickname} onChange={(e) => setNickname(e.target.value)} />
      <FormError error={subscribe.error} />
      {consent && (
        <span className="text-[13px] text-muted-foreground">
          By subscribing you agree to receive occasional updates from White Crane. Unsubscribe at any time.
        </span>
      )}
    </form>
  )
}
