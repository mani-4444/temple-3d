import { CameraControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { Box3, Vector3 } from 'three'
import { CAMERA_LIMITS, LANDING_POSE, OVERVIEW_POSE } from '../data/temple'
import type { CameraPose } from '../data/types'
import type { Mode } from '../state/exploration'

interface CameraRigProps {
  mode: Mode
  /** Pose to focus, or null for the overview. */
  focus: CameraPose | null
  /** Changes whenever the user asks to reset the view. */
  viewNonce: number
  reducedMotion: boolean
}

const landingAzimuth = Math.atan2(
  LANDING_POSE.position[0] - LANDING_POSE.target[0],
  LANDING_POSE.position[2] - LANDING_POSE.target[2],
)

function lookAt(controls: CameraControls, pose: CameraPose, animate: boolean) {
  return controls.setLookAt(...pose.position, ...pose.target, animate)
}

/**
 * Owns all camera motion. React only tells it *what* to look at; transitions, damping and the
 * landing-shot sway happen imperatively inside camera-controls / useFrame (no per-frame React state).
 */
export function CameraRig({ mode, focus, viewNonce, reducedMotion }: CameraRigProps) {
  const ref = useRef<CameraControls>(null)
  const size = useThree((s) => s.size)
  const sway = useRef(0)

  // Limits and boundary are static.
  useEffect(() => {
    const c = ref.current
    if (!c) return
    const { min, max } = CAMERA_LIMITS.targetBounds
    c.setBoundary(new Box3(new Vector3(...min), new Vector3(...max)))
    c.boundaryEnclosesCamera = false
  }, [])

  // Respond to mode / selection / reset.
  useEffect(() => {
    const c = ref.current
    if (!c) return
    const animate = !reducedMotion
    c.smoothTime = 0.9
    if (mode === 'landing') {
      sway.current = 0
      void lookAt(c, LANDING_POSE, animate && viewNonce > 0)
    } else {
      void lookAt(c, focus ?? OVERVIEW_POSE, animate)
    }
  }, [mode, focus, viewNonce, reducedMotion])

  // Frame the landing shot so the temple sits beside the hero copy on wide screens.
  useEffect(() => {
    const c = ref.current
    if (!c) return
    const wide = size.width >= 900
    const offset = mode === 'landing' ? (wide ? [-9, 0, 0] : [0, -4, 0]) : [0, 0, 0]
    void c.setFocalOffset(offset[0], offset[1], offset[2], !reducedMotion)
  }, [mode, size.width, reducedMotion])

  // Slow cinematic sway in the landing shot (disabled for reduced motion).
  useFrame((_, delta) => {
    const c = ref.current
    if (!c || mode !== 'landing' || reducedMotion || c.active) return
    sway.current += delta
    const az = landingAzimuth + Math.sin(sway.current * 0.12) * 0.22
    void c.rotateTo(az, c.polarAngle, false)
  })

  return (
    <CameraControls
      ref={ref}
      makeDefault
      enabled={mode === 'explore'}
      minDistance={CAMERA_LIMITS.minDistance}
      maxDistance={CAMERA_LIMITS.maxDistance}
      maxPolarAngle={CAMERA_LIMITS.maxPolarAngle}
      dollyToCursor
      draggingSmoothTime={0.12}
    />
  )
}
