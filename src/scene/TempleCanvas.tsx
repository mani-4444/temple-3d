import { useProgress } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Suspense, useEffect } from 'react'
import { ACESFilmicToneMapping, PCFShadowMap } from 'three'
import { getLandmark } from '../data/landmarks'
import { LANDING_POSE } from '../data/temple'
import type { ExplorationState } from '../state/exploration'
import { CameraRig } from './CameraRig'
import { Hotspots } from './Hotspots'
import { Lighting } from './Lighting'
import { SceneErrorBoundary } from './SceneErrorBoundary'
import { TempleModel } from './TempleModel'

interface TempleCanvasProps {
  state: ExplorationState
  reducedMotion: boolean
  showHotspots: boolean
  onSelect: (id: string) => void
  onReady: () => void
  onError: (error: Error) => void
  /** Real loading progress (0–100) from the three.js loading manager. */
  onProgress: (progress: number) => void
}

function ProgressReporter({ onProgress }: { onProgress: (progress: number) => void }) {
  const progress = useProgress((s) => s.progress)
  useEffect(() => onProgress(progress), [progress, onProgress])
  return null
}

export function TempleCanvas({ state, reducedMotion, showHotspots, onSelect, onReady, onError, onProgress }: TempleCanvasProps) {
  const exploring = state.mode === 'explore'
  const focus = getLandmark(state.selectedId)?.camera ?? null
  return (
    <>
      <ProgressReporter onProgress={onProgress} />
      <Canvas
        // Continuous rendering only for the animated landing shot; otherwise render on demand
        // (camera-controls and the highlight fade request frames while they move).
        frameloop={state.mode === 'landing' && !reducedMotion ? 'always' : 'demand'}
        shadows={{ type: PCFShadowMap }}
        dpr={[1, 1.75]}
        camera={{ fov: 38, near: 0.5, far: 1500, position: [...LANDING_POSE.position] }}
        gl={{ antialias: true, powerPreference: 'high-performance', toneMapping: ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
      >
        <SceneErrorBoundary onError={onError}>
          <Lighting />
          <Suspense fallback={null}>
            <TempleModel
              selectedId={state.selectedId}
              interactive={exploring}
              reducedMotion={reducedMotion}
              onSelect={onSelect}
              onReady={onReady}
            />
            {exploring && showHotspots && <Hotspots selectedId={state.selectedId} onSelect={onSelect} />}
          </Suspense>
        </SceneErrorBoundary>
        <CameraRig mode={state.mode} focus={focus} viewNonce={state.viewNonce} reducedMotion={reducedMotion} />
      </Canvas>
    </>
  )
}
