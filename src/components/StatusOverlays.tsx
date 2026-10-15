import type { ReactNode } from 'react'

interface LoadingOverlayProps {
  /** Real load progress 0–100, or null when unknown. */
  progress: number | null
  label?: string
}

export function LoadingOverlay({ progress, label = 'Loading the temple' }: LoadingOverlayProps) {
  const pct = progress === null ? null : Math.round(progress)
  return (
    <div
      role="status"
      aria-live="polite"
      className="glass pointer-events-none flex w-64 flex-col gap-3 rounded-2xl px-5 py-4"
    >
      <div className="flex items-baseline justify-between text-xs tracking-wide text-ivory/80">
        <span>{label}…</span>
        {pct !== null && <span className="tabular-nums">{pct}%</span>}
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct ?? undefined}
        className="h-0.5 overflow-hidden rounded-full bg-ivory/15"
      >
        <div
          className={`h-full bg-gold transition-[width] duration-300 ${pct === null ? 'w-1/3 animate-pulse' : ''}`}
          style={pct === null ? undefined : { width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

interface ErrorNoticeProps {
  title: string
  children: ReactNode
  actions?: ReactNode
}

export function ErrorNotice({ title, children, actions }: ErrorNoticeProps) {
  return (
    <div role="alert" className="glass max-w-md rounded-2xl p-6 text-left">
      <p className="eyebrow text-vermilion">Something went wrong</p>
      <h2 className="mt-2 font-display text-2xl text-ivory">{title}</h2>
      <div className="mt-3 text-sm leading-relaxed text-ivory/80">{children}</div>
      {actions && <div className="mt-5 flex flex-wrap gap-3">{actions}</div>}
    </div>
  )
}
