import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { ACESFilmicToneMapping, PCFSoftShadowMap } from 'three'
import { LANDING_POSE } from '../data/temple'
import type { CameraPose } from '../data/types'
import type { Mode } from '../state/exploration'
import { CameraRig } from './CameraRig'
import { Lighting } from './Lighting'
import { SceneErrorBoundary } from './SceneErrorBoundary'
import { TempleModel } from './TempleModel'

interface TempleCanvasProps {
  mode: Mode
  focus: CameraPose | null
  viewNonce: number
  reducedMotion: boolean
  onReady: () => void
  onError: (error: Error) => void
}

export function TempleCanvas({ mode, focus, viewNonce, reducedMotion, onReady, onError }: TempleCanvasProps) {
  return (
    <Canvas
      shadows={{ type: PCFSoftShadowMap }}
      dpr={[1, 1.75]}
      camera={{ fov: 38, near: 0.5, far: 1500, position: [...LANDING_POSE.position] }}
      gl={{ antialias: true, powerPreference: 'high-performance', toneMapping: ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
      aria-label="Interactive 3D temple. Drag to orbit, scroll or pinch to zoom, right-drag or two-finger drag to pan."
    >
      <SceneErrorBoundary onError={onError}>
        <Lighting />
        <Suspense fallback={null}>
          <TempleModel onReady={onReady} />
        </Suspense>
      </SceneErrorBoundary>
      <CameraRig mode={mode} focus={focus} viewNonce={viewNonce} reducedMotion={reducedMotion} />
    </Canvas>
  )
}
