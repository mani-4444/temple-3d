import { LANDMARKS, type Landmark } from '../data/landmarks'

interface LandmarkPanelProps {
  landmark: Landmark
  onSelect: (id: string) => void
  onClose: () => void
}

export function LandmarkPanel({ landmark, onSelect, onClose }: LandmarkPanelProps) {
  const index = LANDMARKS.findIndex((l) => l.id === landmark.id)
  const prev = LANDMARKS[(index - 1 + LANDMARKS.length) % LANDMARKS.length]
  const next = LANDMARKS[(index + 1) % LANDMARKS.length]
  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <aside
      aria-labelledby="landmark-title"
      className="glass pointer-events-auto absolute inset-x-3 bottom-[5.25rem] z-30 flex max-h-[min(46dvh,30rem)] flex-col overflow-hidden rounded-2xl animate-[panel-in_500ms_var(--ease-cinematic)] lg:inset-x-auto lg:top-24 lg:right-6 lg:bottom-6 lg:max-h-none lg:w-[25rem]"
    >
      <div className="flex items-start justify-between gap-3 px-5 pt-5 sm:px-6">
        <p className="eyebrow">
          <span className="tabular-nums">{pad(index + 1)} / {pad(LANDMARKS.length)}</span>
          <span className="mx-2 text-ivory/30">·</span>
          {landmark.role}
        </p>
        <button type="button" className="btn btn-ghost -mt-2 -mr-2 size-11 shrink-0 p-0" onClick={onClose} aria-label="Close landmark panel">
          <svg viewBox="0 0 20 20" className="size-4" aria-hidden="true">
            <path d="M5 5l10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.8" />
          </svg>
        </button>
      </div>

      <div className="overflow-y-auto overscroll-contain px-5 pb-4 sm:px-6">
        <h2 id="landmark-title" aria-live="polite" className="font-display text-4xl leading-tight font-medium text-ivory">
          {landmark.term}
        </h2>
        <p className="mt-3 text-[0.95rem] leading-relaxed text-ivory/90">{landmark.summary}</p>
        {landmark.details.map((d) => (
          <p key={d} className="mt-3 text-sm leading-relaxed text-ivory/70">
            {d}
          </p>
        ))}

        <div className="mt-5 rounded-xl border border-gold/25 bg-gold/[0.06] p-4">
          <p className="text-[0.6875rem] font-semibold tracking-[0.18em] text-gold uppercase">In this model</p>
          <p className="mt-1.5 text-sm leading-relaxed text-ivory/80">{landmark.inThisModel}</p>
        </div>

        <div className="mt-5">
          <p className="text-[0.6875rem] font-semibold tracking-[0.18em] text-sand/80 uppercase">Sources</p>
          <ul className="mt-1.5 space-y-1 text-sm">
            {landmark.sources.map((s) => (
              <li key={s.url}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sand underline decoration-sand/40 underline-offset-4 hover:text-ivory hover:decoration-ivory"
                >
                  {s.label}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <nav aria-label="Landmark sequence" className="flex items-center justify-between gap-2 border-t border-ivory/10 px-3 py-3 sm:px-4">
        <button type="button" className="btn min-h-11 px-3 text-ivory/80 hover:text-ivory" onClick={() => onSelect(prev.id)}>
          <span aria-hidden="true">←</span> {prev.term}
        </button>
        <button type="button" className="btn min-h-11 px-3 text-ivory/80 hover:text-ivory" onClick={() => onSelect(next.id)}>
          {next.term} <span aria-hidden="true">→</span>
        </button>
      </nav>
    </aside>
  )
}
