import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
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
}

export function TempleCanvas({ state, reducedMotion, showHotspots, onSelect, onReady, onError }: TempleCanvasProps) {
  const exploring = state.mode === 'explore'
  const focus = getLandmark(state.selectedId)?.camera ?? null
  return (
    <Canvas
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
  )
}
