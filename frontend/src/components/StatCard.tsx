import type { ReactNode } from 'react'
import { clsx } from '@/utils/clsx'

interface StatCardProps {
  label: string
  value: ReactNode
  icon?: ReactNode
  tone?: 'brand' | 'accent' | 'warning' | 'neutral'
  hint?: string
}

const toneClasses: Record<NonNullable<StatCardProps['tone']>, string> = {
  brand: 'from-brand-500 to-brand-600 text-white',
  accent: 'from-accent-500 to-accent-600 text-white',
  warning: 'from-amber-400 to-amber-500 text-white',
  neutral: 'from-slate-600 to-slate-700 text-white',
}

const glowClasses: Record<NonNullable<StatCardProps['tone']>, string> = {
  brand: 'bg-brand-100',
  accent: 'bg-accent-100',
  warning: 'bg-amber-100',
  neutral: 'bg-slate-200',
}

export function StatCard({ label, value, icon, tone = 'brand', hint }: StatCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition-shadow hover:shadow-md">
      <div
        className={clsx(
          'pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-60 blur-2xl transition-opacity group-hover:opacity-80',
          glowClasses[tone],
        )}
      />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-1.5 text-3xl font-extrabold tracking-tight text-slate-900">{value}</p>
          {hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
        </div>
        {icon && (
          <span
            className={clsx(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-lg shadow-sm',
              toneClasses[tone],
            )}
          >
            {icon}
          </span>
        )}
      </div>
    </div>
  )
}
