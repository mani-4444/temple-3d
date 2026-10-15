import type { Mode } from '../state/exploration'

interface HeaderProps {
  mode: Mode
  onHome: () => void
  onAbout: () => void
}

export function Header({ mode, onHome, onAbout }: HeaderProps) {
  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-center justify-between px-4 pt-[max(1rem,env(safe-area-inset-top))] sm:px-8 sm:pt-6">
      <button
        type="button"
        onClick={onHome}
        className="pointer-events-auto group flex min-h-11 items-center gap-3 rounded-full py-1 pr-2 text-left"
        aria-label={mode === 'explore' ? 'Sanatan — return to introduction' : 'Sanatan — home'}
      >
        <Mark />
        <span className="font-display text-2xl leading-none font-semibold tracking-wide text-ivory">
          Sanatan
        </span>
      </button>

      <nav aria-label="Primary" className="pointer-events-auto flex items-center gap-2">
        {mode === 'explore' && (
          <button type="button" className="btn btn-ghost px-4" onClick={onHome}>
            <span aria-hidden="true">←</span>
            <span className="sm:hidden">Intro</span>
            <span className="hidden sm:inline">Introduction</span>
          </button>
        )}
        <button type="button" className="btn btn-ghost px-4" onClick={onAbout}>
          <span className="sm:hidden">About</span>
          <span className="hidden sm:inline">About &amp; credits</span>
        </button>
      </nav>
    </header>
  )
}

function Mark() {
  return (
    <svg viewBox="0 0 32 32" className="size-8 shrink-0" aria-hidden="true">
      <path
        d="M16 3c1.6 0 2.4 1.3 2.4 2.6 0 .9-.4 1.6-1 2h-2.8c-.6-.4-1-1.1-1-2C13.6 4.3 14.4 3 16 3z"
        fill="var(--color-gold)"
      />
      <path
        d="M12 9h8l1 4h-10zM10.5 14h11l1 5h-13zM9 20h14l1 5H8zM7 26h18v3H7z"
        fill="var(--color-gold)"
      />
    </svg>
  )
}
