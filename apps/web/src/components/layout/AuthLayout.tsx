import type { ReactNode } from 'react'
import { Outlet } from 'react-router-dom'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { Logo } from './Logo'

export function AuthLayout() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-surface px-4 py-10">
      <Outlet />
    </main>
  )
}

export function AuthCard({ title, description, children }: { title: string; description: ReactNode; children: ReactNode }) {
  useDocumentTitle(title)
  return (
    <div className="flex w-full max-w-[440px] flex-col items-center gap-5 rounded-xl border bg-background p-6 text-center sm:p-8">
      <Logo />
      <h1 className="text-2xl">{title}</h1>
      <p className="text-muted-foreground">{description}</p>
      <div className="flex w-full flex-col gap-4 text-left">{children}</div>
    </div>
  )
}
