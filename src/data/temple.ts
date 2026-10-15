import type { CameraPose } from './types'

/**
 * The temple model. To swap in another asset, change `url`, update the landmark records in
 * `landmarks.ts` (node names and camera poses), and credit the asset in docs/ASSET_CREDITS.md.
 */
export const TEMPLE_MODEL = {
  url: '/models/temple.glb',
  /** Static still of the model, used when WebGL is unavailable. */
  posterUrl: '/images/temple-poster.jpg',
  /** Node names in the GLB that only receive shadows (large flat ground). */
  groundNodes: ['ground'],
} as const

/** Wide establishing shot used behind the hero. */
export const LANDING_POSE: CameraPose = {
  position: [-46, 10, 78],
  target: [2, 15, 4],
}

/** Default exploration pose ("Reset view"). */
export const OVERVIEW_POSE: CameraPose = {
  position: [-52, 38, 70],
  target: [0, 6, -4],
}

/** Limits for free exploration (metres / radians). */
export const CAMERA_LIMITS = {
  minDistance: 6,
  maxDistance: 140,
  maxPolarAngle: Math.PI * 0.47,
  /** Orbit target is clamped inside this box so the user cannot lose the temple. */
  targetBounds: { min: [-40, 0, -45] as const, max: [40, 30, 60] as const },
}
