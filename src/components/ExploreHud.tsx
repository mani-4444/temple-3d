import { LANDMARKS } from '../data/landmarks'

interface ExploreHudProps {
  selectedId: string | null
  canReset: boolean
  onSelect: (id: string) => void
  onReset: () => void
}

/** Landmark navigator (left rail on desktop, chip strip on mobile), reset action and control hints. */
export function ExploreHud({ selectedId, canReset, onSelect, onReset }: ExploreHudProps) {
  return (
    <>
      <nav
        aria-label="Landmarks"
        className="pointer-events-auto absolute inset-x-0 bottom-0 z-30 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:inset-x-auto lg:bottom-6 lg:left-6 lg:w-72 lg:px-0 lg:pb-0"
      >
        <div className="glass hidden rounded-2xl p-3 lg:block">
          <p className="eyebrow px-2 pt-1 pb-2">Landmarks</p>
          <ol className="space-y-0.5">
            {LANDMARKS.map((l, i) => {
              const active = l.id === selectedId
              return (
                <li key={l.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(l.id)}
                    aria-pressed={active}
                    className={`flex min-h-11 w-full items-center gap-3 rounded-xl px-2 py-1.5 text-left transition-colors duration-200 ${
                      active ? 'bg-gold/15 text-ivory' : 'text-ivory/75 hover:bg-ivory/5 hover:text-ivory'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`grid size-7 shrink-0 place-items-center rounded-full border text-[0.7rem] font-semibold tabular-nums ${
                        active ? 'border-gold bg-gold text-night' : 'border-ivory/30'
                      }`}
                    >
                      {i + 1}
                    </span>
                    <span className="min-w-0">
                      <span className="block font-display text-lg leading-tight">{l.term}</span>
                      <span className="block text-xs text-ivory/55">{l.role}</span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ol>
          <div className="mt-2 border-t border-ivory/10 pt-3">
            <button type="button" className="btn btn-ghost w-full" onClick={onReset} disabled={!canReset}>
              <ResetIcon /> Reset view
            </button>
          </div>
        </div>

        {/* Mobile / tablet chip strip */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            type="button"
            className="btn btn-ghost size-11 shrink-0 p-0"
            onClick={onReset}
            disabled={!canReset}
            aria-label="Reset view"
          >
            <ResetIcon />
          </button>
          <ol className="flex snap-x gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none]">
            {LANDMARKS.map((l, i) => {
              const active = l.id === selectedId
              return (
                <li key={l.id} className="snap-start">
                  <button
                    type="button"
                    onClick={() => onSelect(l.id)}
                    aria-pressed={active}
                    className={`btn min-h-11 shrink-0 px-4 whitespace-nowrap ${active ? 'btn-primary' : 'btn-ghost'}`}
                  >
                    <span aria-hidden="true" className="tabular-nums opacity-70">
                      {i + 1}
                    </span>
                    {l.term}
                  </button>
                </li>
              )
            })}
          </ol>
        </div>
      </nav>

      {selectedId === null && (
        <p className="pointer-events-none absolute inset-x-0 bottom-[5rem] z-20 px-4 text-center text-xs text-ivory/70 [text-shadow:0_1px_8px_rgb(0_0_0/0.6)] lg:bottom-8 lg:left-80 lg:right-6">
          <span className="hidden sm:inline">Drag to orbit · Scroll to zoom · Right-drag to pan · Click a landmark or numbered marker</span>
          <span className="sm:hidden">Drag to orbit · Pinch to zoom · Two fingers to pan</span>
        </p>
      )}
    </>
  )
}

function ResetIcon() {
  return (
    <svg viewBox="0 0 20 20" className="size-4" aria-hidden="true">
      <path d="M4 10a6 6 0 1 0 2-4.5M4 3.5V7h3.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}
