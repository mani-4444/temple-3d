import { useState } from 'react'
import { TEMPLE_MODEL } from '../data/temple'

/** Shown instead of the 3D canvas when WebGL is unavailable: a still of the model plus guidance. */
export function NoWebGLPoster() {
  const [failed, setFailed] = useState(false)
  if (failed) return null
  return (
    <img
      src={TEMPLE_MODEL.posterUrl}
      alt="Still image of the 3D temple model: a tall tiered gateway tower inside a red-and-white striped enclosure wall, with a pillared hall and sanctum tower behind."
      onError={() => setFailed(true)}
      className="absolute inset-0 size-full object-cover"
    />
  )
}

export function NoWebGLNotice() {
  return (
    <div role="status" className="glass max-w-sm rounded-2xl p-5 text-sm leading-relaxed text-ivory/85">
      <p className="eyebrow">3D unavailable</p>
      <p className="mt-2">
        Your browser or device does not support WebGL, so the interactive model can’t be shown.
        You’re seeing a still image instead — every landmark description is still available.
      </p>
    </div>
  )
}
