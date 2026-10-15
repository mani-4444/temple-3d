import { useGLTF } from '@react-three/drei'
import { TEMPLE_MODEL } from '../data/temple'

/** Drops the cached (possibly failed) model load so a retry fetches it again. */
export function clearTempleModelCache() {
  useGLTF.clear(TEMPLE_MODEL.url)
}
