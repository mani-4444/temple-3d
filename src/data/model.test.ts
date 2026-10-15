// @vitest-environment node
import { readFileSync, statSync } from 'node:fs'
import { getBounds, NodeIO } from '@gltf-transform/core'
import { EXTMeshoptCompression, KHRMeshQuantization } from '@gltf-transform/extensions'
import { MeshoptDecoder } from 'meshoptimizer'
import { beforeAll, describe, expect, it } from 'vitest'
import type { bbox, Document } from '@gltf-transform/core'
import { LANDMARKS } from './landmarks'
import type { Vec3 } from './types'

const MODEL_PATH = 'public/models/temple.glb'
let doc: Document

beforeAll(async () => {
  await MeshoptDecoder.ready
  const io = new NodeIO()
    .registerExtensions([EXTMeshoptCompression, KHRMeshQuantization])
    .registerDependencies({ 'meshopt.decoder': MeshoptDecoder })
  doc = await io.readBinary(new Uint8Array(readFileSync(MODEL_PATH)))
})

describe('temple.glb', () => {
  it('stays within the asset budget (≤ 3 MB)', () => {
    expect(statSync(MODEL_PATH).size).toBeLessThan(3 * 1024 * 1024)
  })

  it('contains the named architectural nodes', () => {
    const names = doc.getRoot().listNodes().map((n) => n.getName())
    for (const required of ['gopuram', 'gopuram_crown', 'dhvajastambha', 'mandapa', 'vimana', 'pushkarini', 'prakara', 'ground']) {
      expect(names).toContain(required)
    }
  })

  it('has PBR materials for stone, plaster and gilding', () => {
    const materials = doc.getRoot().listMaterials().map((m) => m.getName())
    expect(materials).toEqual(expect.arrayContaining(['granite', 'stucco', 'gold']))
  })
})

const inside = (p: Vec3, b: bbox, pad = 0) =>
  p.every((v, i) => v >= b.min[i] - pad && v <= b.max[i] + pad)

function boundsOf(name: string): bbox {
  const node = doc.getRoot().listNodes().find((n) => n.getName() === name)
  if (!node) throw new Error(`node ${name} not found`)
  return getBounds(node)
}

describe('landmarks', () => {
  it('has four to six landmarks with unique ids', () => {
    expect(LANDMARKS.length).toBeGreaterThanOrEqual(4)
    expect(LANDMARKS.length).toBeLessThanOrEqual(6)
    expect(new Set(LANDMARKS.map((l) => l.id)).size).toBe(LANDMARKS.length)
  })

  it.each(LANDMARKS.map((l) => [l.id, l] as const))('%s is bound to a model node and anchored on it', (_, l) => {
    expect(inside(l.anchor, boundsOf(l.nodeName), 1.5)).toBe(true)
    expect(l.sources.length).toBeGreaterThan(0)
  })

  it.each(LANDMARKS.map((l) => [l.id, l] as const))('%s camera pose stays outside the buildings', (_, l) => {
    const solids = ['gopuram', 'gopuram_crown', 'dhvajastambha', 'mandapa', 'vimana', 'pushkarini']
    for (const name of solids) expect(inside(l.camera.position, boundsOf(name), 0.5), `inside ${name}`).toBe(false)
    expect(l.camera.position[1]).toBeGreaterThan(2)
  })
})
