import { CameraControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { Box3, MathUtils, PerspectiveCamera, Vector3 } from 'three'
import { CAMERA_LIMITS, LANDING_POSE, LANDING_POSE_NARROW, OVERVIEW_POSE, OVERVIEW_POSE_NARROW } from '../data/temple'
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

const azimuthOf = (pose: CameraPose) =>
  Math.atan2(pose.position[0] - pose.target[0], pose.position[2] - pose.target[2])

function lookAt(controls: CameraControls, pose: CameraPose, animate: boolean) {
  return controls.setLookAt(...pose.position, ...pose.target, animate)
}

const KEY_ROTATE = MathUtils.degToRad(12)
const KEY_DOLLY = 8
const KEY_TRUCK = 4

/**
 * Owns all camera motion. React only tells it *what* to look at; transitions, damping and the
 * landing-shot sway happen imperatively inside camera-controls / useFrame (no per-frame React state).
 */
export function CameraRig({ mode, focus, viewNonce, reducedMotion }: CameraRigProps) {
  const ref = useRef<CameraControls>(null)
  const size = useThree((s) => s.size)
  const getState = useThree((s) => s.get)
  const sway = useRef(0)
  const exploring = mode === 'explore'
  const narrow = size.width / size.height < 1
  const landingPose = narrow ? LANDING_POSE_NARROW : LANDING_POSE
  const overviewPose = narrow ? OVERVIEW_POSE_NARROW : OVERVIEW_POSE

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
    if (mode === 'landing') {
      sway.current = 0
      void lookAt(c, landingPose, animate && viewNonce > 0)
    } else {
      void lookAt(c, focus ?? overviewPose, animate)
    }
  }, [mode, focus, viewNonce, reducedMotion, landingPose, overviewPose])

  // Compose around the HTML overlays: beside the hero copy on wide landing shots, and above the
  // bottom-sheet panel when a landmark is focused on narrow screens.
  useEffect(() => {
    const c = ref.current
    if (!c) return
    const wide = size.width >= 1024
    let offset: [number, number, number] = [0, 0, 0]
    if (mode === 'landing') offset = wide ? [-9, 0, 0] : [0, 0, 0]
    else if (focus && !wide) offset = [0, 0.16 * new Vector3(...focus.position).distanceTo(new Vector3(...focus.target)), 0]
    void c.setFocalOffset(...offset, !reducedMotion)
  }, [mode, focus, size.width, reducedMotion])

  // Portrait screens are narrow horizontally: widen the lens while exploring so close-ups fit.
  useEffect(() => {
    const camera = getState().camera
    if (!(camera instanceof PerspectiveCamera)) return
    camera.fov = exploring && narrow ? 52 : 38
    camera.updateProjectionMatrix()
    getState().invalidate()
  }, [getState, exploring, narrow])

  // Keyboard orbit / zoom / pan when the canvas has focus (core controls are not mouse-only).
  useEffect(() => {
    const canvas = getState().gl.domElement
    canvas.tabIndex = exploring ? 0 : -1
    canvas.setAttribute('role', 'application')
    canvas.setAttribute('aria-roledescription', '3D view')
    canvas.setAttribute(
      'aria-label',
      'Temple 3D view. Arrow keys orbit, Shift plus arrow keys pan, plus and minus zoom.',
    )
    const onKey = (e: KeyboardEvent) => {
      const c = ref.current
      if (!c || !exploring) return
      const animate = !reducedMotion
      const k = e.key
      if (e.shiftKey && k.startsWith('Arrow')) {
        const dx = k === 'ArrowLeft' ? -KEY_TRUCK : k === 'ArrowRight' ? KEY_TRUCK : 0
        const dy = k === 'ArrowUp' ? KEY_TRUCK : k === 'ArrowDown' ? -KEY_TRUCK : 0
        void c.truck(dx, -dy, animate)
      } else if (k === 'ArrowLeft') void c.rotate(-KEY_ROTATE, 0, animate)
      else if (k === 'ArrowRight') void c.rotate(KEY_ROTATE, 0, animate)
      else if (k === 'ArrowUp') void c.rotate(0, -KEY_ROTATE, animate)
      else if (k === 'ArrowDown') void c.rotate(0, KEY_ROTATE, animate)
      else if (k === '+' || k === '=') void c.dolly(KEY_DOLLY, animate)
      else if (k === '-' || k === '_') void c.dolly(-KEY_DOLLY, animate)
      else return
      e.preventDefault()
    }
    canvas.addEventListener('keydown', onKey)
    return () => canvas.removeEventListener('keydown', onKey)
  }, [getState, exploring, reducedMotion])

  // Slow cinematic sway in the landing shot (disabled for reduced motion).
  useFrame((_, delta) => {
    const c = ref.current
    if (!c || mode !== 'landing' || reducedMotion || c.active) return
    sway.current += delta
    const az = azimuthOf(landingPose) + Math.sin(sway.current * 0.12) * 0.22
    void c.rotateTo(az, c.polarAngle, false)
  })

  return (
    <CameraControls
      ref={ref}
      makeDefault
      enabled={exploring}
      smoothTime={0.9}
      draggingSmoothTime={0.12}
      minDistance={CAMERA_LIMITS.minDistance}
      maxDistance={CAMERA_LIMITS.maxDistance}
      maxPolarAngle={CAMERA_LIMITS.maxPolarAngle}
      dollyToCursor
    />
  )
}
