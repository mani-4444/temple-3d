import { useReducer, useState } from 'react'
import { AboutDialog } from './components/AboutDialog'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { ScenePlaceholder } from './components/ScenePlaceholder'
import { explorationReducer, initialExplorationState } from './state/exploration'

export default function App() {
  const [state, dispatch] = useReducer(explorationReducer, initialExplorationState)
  const [aboutOpen, setAboutOpen] = useState(false)
  const exploring = state.mode === 'explore'

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-basalt">
      {/* Stage: replaced by the 3D canvas in Phase 02 */}
      <ScenePlaceholder />

      <Header
        mode={state.mode}
        onHome={() => dispatch({ type: 'exit' })}
        onAbout={() => setAboutOpen(true)}
      />

      <main>
        <Hero
          visible={!exploring}
          onExplore={() => dispatch({ type: 'enter' })}
          onAbout={() => setAboutOpen(true)}
        />

        {exploring && (
          <section
            aria-label="Exploration"
            className="glass absolute bottom-6 left-1/2 z-20 w-[min(28rem,calc(100vw-2rem))] -translate-x-1/2 rounded-2xl p-5 text-sm text-ivory/80"
          >
            <p className="eyebrow">Exploration mode</p>
            <p className="mt-2">The interactive 3D temple loads here.</p>
            <button type="button" className="btn btn-ghost mt-4" onClick={() => dispatch({ type: 'exit' })}>
              Back to introduction
            </button>
          </section>
        )}
      </main>

      <AboutDialog open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </div>
  )
}
