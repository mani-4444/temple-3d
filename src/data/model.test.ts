// @vitest-environment node
import { readFileSync, statSync } from 'node:fs'
import { NodeIO } from '@gltf-transform/core'
import { EXTMeshoptCompression, KHRMeshQuantization } from '@gltf-transform/extensions'
import { MeshoptDecoder } from 'meshoptimizer'
import { beforeAll, describe, expect, it } from 'vitest'
import type { Document } from '@gltf-transform/core'

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
