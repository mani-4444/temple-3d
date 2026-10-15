import { useGLTF } from '@react-three/drei'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { useLayoutEffect, useRef } from 'react'
import { Color, Mesh, MeshStandardMaterial, type Object3D } from 'three'
import { LANDMARKS } from '../data/landmarks'
import { TEMPLE_MODEL } from '../data/temple'

interface TempleModelProps {
  selectedId: string | null
  interactive: boolean
  reducedMotion: boolean
  onSelect: (id: string) => void
  onReady: () => void
}

const HIGHLIGHT = new Color('#ff9440')
const nodeToLandmark = new Map(LANDMARKS.map((l) => [l.nodeName, l.id]))

/** Walks up from a hit mesh to the landmark node it belongs to. */
function landmarkIdOf(obj: Object3D | null): string | null {
  for (let o = obj; o; o = o.parent) {
    const id = nodeToLandmark.get(o.name)
    if (id) return id
  }
  return null
}

export function TempleModel({ selectedId, interactive, reducedMotion, onSelect, onReady }: TempleModelProps) {
  // Meshopt-compressed GLB; Draco is not used so no external decoder is fetched.
  const { scene } = useGLTF(TEMPLE_MODEL.url, false, true)
  const hovered = useRef<string | null>(null)
  const landmarkMaterials = useRef(new Map<string, MeshStandardMaterial[]>())

  useLayoutEffect(() => {
    // Landmark nodes get their own material instances so they can glow independently.
    const map = landmarkMaterials.current
    map.clear()
    for (const l of LANDMARKS) {
      const mats: MeshStandardMaterial[] = []
      scene.getObjectByName(l.nodeName)?.traverse((obj) => {
        if (obj instanceof Mesh && obj.material instanceof MeshStandardMaterial) {
          if (!obj.userData.highlightable) {
            obj.material = obj.material.clone()
            obj.material.emissive = HIGHLIGHT.clone()
            obj.userData.highlightable = true
          }
          obj.material.emissiveIntensity = 0
          mats.push(obj.material)
        }
      })
      map.set(l.id, mats)
    }

    scene.traverse((obj) => {
      if (!(obj instanceof Mesh)) return
      const isGround = (TEMPLE_MODEL.groundNodes as readonly string[]).includes(obj.parent?.name ?? '')
      obj.castShadow = !isGround
      obj.receiveShadow = true
    })
    onReady()
  }, [scene, onReady])

  useFrame((_, delta) => {
    const k = reducedMotion ? 1 : 1 - Math.exp(-delta * 6)
    for (const [id, mats] of landmarkMaterials.current) {
      const target = id === selectedId ? 0.16 : interactive && id === hovered.current ? 0.07 : 0
      // Per-frame three.js mutation is the intended R3F pattern (no React re-render).
      // oxlint-disable-next-line react/immutability
      for (const m of mats) m.emissiveIntensity += (target - m.emissiveIntensity) * k
    }
  })

  const setHover = (id: string | null) => {
    hovered.current = id
    document.body.style.cursor = id ? 'pointer' : ''
  }

  return (
    <primitive
      object={scene}
      onPointerMove={(e: ThreeEvent<PointerEvent>) => {
        if (!interactive) return
        e.stopPropagation()
        const id = landmarkIdOf(e.object)
        if (id !== hovered.current) setHover(id)
      }}
      onPointerOut={() => setHover(null)}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        // Ignore clicks that were really orbit drags.
        if (!interactive || e.delta > 6) return
        e.stopPropagation()
        const id = landmarkIdOf(e.object)
        if (id) onSelect(id)
      }}
    />
  )
}
