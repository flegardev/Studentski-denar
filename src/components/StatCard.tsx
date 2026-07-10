import { SectionCard as Panel } from './SectionCard'

export function StatCard({ label, value, tone }: { label: string; value: string; tone?: 'good' | 'warn' }) {
  return (
    <Panel className="min-h-32">
      <p className="text-sm font-medium text-[var(--muted)]">{label}</p>
      <p className={`mt-3 break-words text-2xl font-semibold leading-tight ${tone === 'warn' ? 'text-red-700' : tone === 'good' ? 'text-[var(--brand)]' : ''}`}>
        {value}
      </p>
    </Panel>
  )
}
