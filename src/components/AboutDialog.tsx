import { useEffect, useRef } from 'react'

interface AboutDialogProps {
  open: boolean
  onClose: () => void
}

export function AboutDialog({ open, onClose }: AboutDialogProps) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        // Click on the backdrop (the dialog element itself) closes it.
        if (e.target === e.currentTarget) onClose()
      }}
      aria-labelledby="about-title"
      className="glass m-auto max-h-[85dvh] w-[min(36rem,calc(100vw-2rem))] overflow-y-auto rounded-2xl p-0 text-ivory backdrop:bg-night/70 backdrop:backdrop-blur-sm"
    >
      <div className="p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">About</p>
            <h2 id="about-title" className="mt-2 font-display text-3xl font-medium">
              Sanatan
            </h2>
          </div>
          <button type="button" className="btn btn-ghost size-11 p-0" onClick={onClose} aria-label="Close about dialog">
            <svg viewBox="0 0 20 20" className="size-4" aria-hidden="true">
              <path d="M5 5l10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.8" />
            </svg>
          </button>
        </div>

        <div className="mt-5 space-y-4 text-sm leading-relaxed text-ivory/80">
          <p>
            Sanatan is an interactive 3D exploration of a temple composed from the vocabulary of
            South Indian Dravidian architecture: a tiered gateway tower (gopuram), a flagstaff
            (dhvajastambha), a pillared hall (mandapa), the tower over the sanctum (vimana) and a
            stepped temple tank.
          </p>
          <p>
            <strong className="text-ivory">The temple is fictional.</strong> It is an original,
            stylised model built for this project and does not reproduce any specific historic
            temple. Descriptions explain general architectural terms and link to their sources.
          </p>

          <h3 className="pt-2 font-display text-xl text-ivory">Credits</h3>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Temple model: original work, generated procedurally for this project
              (<code className="text-sand">scripts/build-temple-model.mjs</code>).
            </li>
            <li>
              Typefaces: Cormorant Garamond (Christian Thalmann) and Inter (Rasmus Andersson), SIL
              Open Font License 1.1, via Fontsource.
            </li>
            <li>
              Built with React, Three.js, React Three Fiber and Drei (MIT).
            </li>
          </ul>
          <p className="text-xs text-sand/80">
            Full credits and licences: <code>docs/ASSET_CREDITS.md</code> in the repository.
          </p>
        </div>
      </div>
    </dialog>
  )
}
