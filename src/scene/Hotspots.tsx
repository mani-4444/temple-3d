import { Html } from '@react-three/drei'
import { LANDMARKS } from '../data/landmarks'

interface HotspotsProps {
  selectedId: string | null
  onSelect: (id: string) => void
}

/**
 * Numbered markers anchored to each landmark in 3D space (real DOM buttons, so keyboard-reachable).
 * While a landmark is focused only its marker is shown, so others don't float over close-up geometry.
 */
export function Hotspots({ selectedId, onSelect }: HotspotsProps) {
  return (
    <>
      {LANDMARKS.map((l, i) => {
        const active = l.id === selectedId
        if (selectedId && !active) return null
        return (
          <Html key={l.id} position={[...l.anchor]} center zIndexRange={[15, 10]} wrapperClass="hotspot">
            <button
              type="button"
              onClick={() => onSelect(l.id)}
              aria-pressed={active}
              aria-label={`${i + 1} ${l.term} — ${l.role}`}
              className={`group relative flex size-11 items-center justify-center rounded-full transition-transform duration-300 ease-[var(--ease-cinematic)] hover:scale-110 ${
                active ? 'scale-110' : ''
              }`}
            >
              <span
                aria-hidden="true"
                className={`absolute inset-1.5 rounded-full border backdrop-blur-sm transition-colors duration-300 ${
                  active
                    ? 'border-gold bg-gold text-night'
                    : 'border-ivory/70 bg-night/55 text-ivory group-hover:border-gold'
                }`}
              />
              <span aria-hidden="true" className={`relative text-xs font-semibold ${active ? 'text-night' : 'text-ivory'}`}>
                {i + 1}
              </span>
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-full ml-1 rounded-full bg-night/75 px-2.5 py-1 text-xs whitespace-nowrap text-ivory opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
              >
                {l.term}
              </span>
            </button>
          </Html>
        )
      })}
    </>
  )
}
