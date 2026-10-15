import { useGLTF, useProgress } from '@react-three/drei'
import { useCallback, useReducer, useState } from 'react'
import { AboutDialog } from './components/AboutDialog'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { NoWebGLNotice, NoWebGLPoster } from './components/NoWebGLNotice'
import { ScenePlaceholder } from './components/ScenePlaceholder'
import { ErrorNotice, LoadingOverlay } from './components/StatusOverlays'
import { TEMPLE_MODEL } from './data/temple'
import { useReducedMotion } from './hooks/useReducedMotion'
import { hasWebGL } from './lib/webgl'
import { TempleCanvas } from './scene/TempleCanvas'
import { explorationReducer, initialExplorationState } from './state/exploration'

type SceneStatus = 'loading' | 'ready' | 'error' | 'unsupported'

export default function App() {
  const [state, dispatch] = useReducer(explorationReducer, initialExplorationState)
  const [aboutOpen, setAboutOpen] = useState(false)
  const [status, setStatus] = useState<SceneStatus>(() => (hasWebGL() ? 'loading' : 'unsupported'))
  const [attempt, setAttempt] = useState(0)
  const { progress } = useProgress()
  const reducedMotion = useReducedMotion()
  const exploring = state.mode === 'explore'

  const onReady = useCallback(() => setStatus('ready'), [])
  const onError = useCallback((error: Error) => {
    console.warn('Temple model failed to load:', error.message)
    setStatus('error')
  }, [])
  const retry = () => {
    useGLTF.clear(TEMPLE_MODEL.url)
    setStatus('loading')
    setAttempt((n) => n + 1)
  }

  const heroStatus =
    status === 'loading'
      ? `Preparing the temple… ${Math.round(progress)}%`
      : status === 'error'
        ? 'The 3D model could not be loaded.'
        : undefined

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-basalt" data-scene-status={status}>
      <ScenePlaceholder />
      {status === 'unsupported' && <NoWebGLPoster />}

      {(status === 'loading' || status === 'ready') && (
        <div
          key={attempt}
          className={`absolute inset-0 transition-opacity duration-[1600ms] ease-[var(--ease-cinematic)] ${
            status === 'ready' ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <TempleCanvas
            mode={state.mode}
            focus={null}
            viewNonce={state.viewNonce}
            reducedMotion={reducedMotion}
            onReady={onReady}
            onError={onError}
          />
        </div>
      )}

      {/* Cinematic vignette; keeps overlay text legible over the scene */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 transition-opacity duration-1000 ${exploring ? 'opacity-40' : 'opacity-100'} bg-[linear-gradient(180deg,rgba(13,9,7,0.55)_0%,transparent_22%,transparent_50%,rgba(13,9,7,0.85)_100%),linear-gradient(90deg,rgba(13,9,7,0.7)_0%,transparent_55%)]`}
      />

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
          status={heroStatus}
        />

        {exploring && (
          <section aria-label="Exploration" className="pointer-events-none absolute inset-0 z-20">
            <div className="pointer-events-auto absolute bottom-6 left-4 flex flex-wrap gap-2 sm:left-8">
              <button type="button" className="btn btn-ghost" onClick={() => dispatch({ type: 'resetView' })} disabled={status !== 'ready'}>
                Reset view
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => dispatch({ type: 'exit' })}>
                Back to introduction
              </button>
            </div>
          </section>
        )}

        <div className="pointer-events-none absolute inset-0 z-20 grid place-items-center p-4">
          {exploring && status === 'loading' && <LoadingOverlay progress={progress} />}
          {status === 'error' && (
            <div className="pointer-events-auto">
              <ErrorNotice
                title="The temple model didn’t load"
                actions={
                  <button type="button" className="btn btn-primary" onClick={retry}>
                    Try again
                  </button>
                }
              >
                Check your connection and try again. If the problem continues, the model file may be
                missing from this deployment.
              </ErrorNotice>
            </div>
          )}
          {exploring && status === 'unsupported' && <NoWebGLNotice />}
        </div>
      </main>

      <AboutDialog open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </div>
  )
}
