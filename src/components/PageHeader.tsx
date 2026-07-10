import type { ReactNode } from 'react'

export function PageHeader({
  title,
  eyebrow,
  children,
}: {
  title: string
  eyebrow: string
  children?: ReactNode
}) {
  return (
    <header className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[var(--brand)]">{eyebrow}</p>
        <h1 className="mt-1 text-3xl font-semibold leading-tight text-[var(--ink)] sm:text-4xl">{title}</h1>
      </div>
      {children}
    </header>
  )
}
