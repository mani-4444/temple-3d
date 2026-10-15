interface HeroProps {
  visible: boolean
  onExplore: () => void
  onAbout: () => void
  /** Short status shown under the CTA while the scene prepares (e.g. "Loading temple… 42%"). */
  status?: string
}

export function Hero({ visible, onExplore, onAbout, status }: HeroProps) {
  return (
    <section
      aria-labelledby="hero-title"
      inert={!visible}
      className={`absolute inset-x-0 bottom-0 z-20 px-4 pb-[max(2rem,env(safe-area-inset-bottom))] transition-all duration-700 ease-[var(--ease-cinematic)] sm:px-8 sm:pb-14 lg:px-14 ${
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0'
      }`}
    >
      <div className="max-w-2xl">
        <p className="eyebrow">An interactive study in Dravidian architecture</p>
        <h1
          id="hero-title"
          className="mt-4 font-display text-[clamp(3.25rem,10vw,7.5rem)] leading-[0.9] font-medium text-ivory"
        >
          Sanatan
        </h1>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-ivory/80 sm:text-lg">
          Move along the axis of a South Indian temple — from the towering gateway, past the
          flagstaff and pillared hall, to the tower above the sanctum — in real-time 3D.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button type="button" className="btn btn-primary px-6" onClick={onExplore}>
            Explore the temple
            <svg viewBox="0 0 20 20" className="size-4" aria-hidden="true">
              <path d="M4 10h11m-4-4 4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.8" />
            </svg>
          </button>
          <button type="button" className="btn btn-ghost" onClick={onAbout}>
            About this model
          </button>
        </div>

        <p className="mt-6 max-w-md text-xs leading-relaxed text-sand/80">
          An original model inspired by Dravidian temple architecture — not a replica of any
          specific temple.
          {status && (
            <span className="mt-1 block text-ivory/70" aria-live="polite">
              {status}
            </span>
          )}
        </p>
      </div>
    </section>
  )
}
