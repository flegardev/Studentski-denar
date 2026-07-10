export function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-[var(--line)] bg-[var(--panel-muted)]/80 p-6 text-center">
      <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-[var(--brand)]/35" />
      <p className="font-semibold text-[var(--ink)]">{title}</p>
      <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-[var(--muted)]">{text}</p>
    </div>
  )
}
