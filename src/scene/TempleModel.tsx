import { useGLTF } from '@react-three/drei'
import { useLayoutEffect } from 'react'
import { Mesh } from 'three'
import { TEMPLE_MODEL } from '../data/temple'

interface TempleModelProps {
  onReady: () => void
}

export function TempleModel({ onReady }: TempleModelProps) {
  // Meshopt-compressed GLB; Draco is not used so no external decoder is fetched.
  const { scene } = useGLTF(TEMPLE_MODEL.url, false, true)

  useLayoutEffect(() => {
    scene.traverse((obj) => {
      if (!(obj instanceof Mesh)) return
      const isGround = (TEMPLE_MODEL.groundNodes as readonly string[]).includes(obj.parent?.name ?? '')
      obj.castShadow = !isGround
      obj.receiveShadow = true
    })
    onReady()
  }, [scene, onReady])

  return <primitive object={scene} />
}
