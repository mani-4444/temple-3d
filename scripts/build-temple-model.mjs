// Builds public/models/temple.glb — an ORIGINAL, procedurally generated temple inspired by
// South Indian Dravidian architecture. It is not a replica of any specific temple.
//
//   npm run build:model
//
// Coordinate system: Y up, metres. The temple axis runs along Z: the gateway (gopuram) faces +Z,
// the sanctum tower (vimana) sits toward -Z. Each landmark is a named top-level node so the app
// can highlight it: gopuram, gopuram_crown, dhvajastambha, mandapa, vimana, pushkarini.
// Geometry is merged per node+material to keep draw calls low. No image textures are used;
// surface variation comes from vertex colours (COLOR_0) multiplied with PBR material colours.
import { mkdir, writeFile } from 'node:fs/promises'
import { NodeIO } from '@gltf-transform/core'
import { EXTMeshoptCompression, KHRMeshQuantization } from '@gltf-transform/extensions'
import { dedup, meshopt, prune } from '@gltf-transform/functions'
import { MeshoptEncoder } from 'meshoptimizer'
import * as THREE from 'three'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'
import { mergeGeometries, mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

// --- Node polyfill: GLTFExporter uses FileReader to assemble the GLB ------------------------
globalThis.FileReader ??= class {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then((buf) => {
      this.result = buf
      this.onloadend?.()
    })
  }
}

// --- Deterministic randomness ---------------------------------------------------------------
function mulberry32(seed) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rand = mulberry32(1987)
const range = (a, b) => a + (b - a) * rand()

// --- Materials ------------------------------------------------------------------------------
const std = (name, color, roughness, metalness = 0) =>
  new THREE.MeshStandardMaterial({ name, color, roughness, metalness, vertexColors: true })

const MAT = {
  granite: std('granite', 0xb7a089, 0.92),
  stucco: std('stucco', 0xe2b98a, 0.86),
  sculpture: std('sculpture', 0xd3a477, 0.8),
  recess: std('recess', 0x2a1c14, 1),
  gold: std('gold', 0xe8b04f, 0.32, 1),
  limewash: std('limewash', 0xf0e6d4, 0.9),
  ochre: std('ochre', 0xb4492c, 0.88),
  paving: std('paving', 0x9d8a74, 0.95),
  earth: std('earth', 0x6e5640, 1),
  water: std('water', 0x2c4a48, 0.06, 0.1),
}

// --- Geometry collection --------------------------------------------------------------------
/** @type {Map<string, Map<string, THREE.BufferGeometry[]>>} node -> material -> geometries */
const parts = new Map()
const stack = [new THREE.Matrix4()]
let currentNode = 'ground'

function inNode(name, fn) {
  const prev = currentNode
  currentNode = name
  fn()
  currentNode = prev
}

function withMatrix(m, fn) {
  stack.push(stack.at(-1).clone().multiply(m))
  fn()
  stack.pop()
}

const T = (x = 0, y = 0, z = 0, ry = 0, s = 1) =>
  new THREE.Matrix4().compose(
    new THREE.Vector3(x, y, z),
    new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), ry),
    new THREE.Vector3(s, s, s),
  )

function noise(p) {
  return (
    0.5 +
    0.25 * Math.sin(p.x * 1.7 + p.z * 0.9) * Math.sin(p.y * 1.3 + p.x * 0.6) +
    0.25 * Math.sin(p.z * 3.1 - p.y * 2.3 + p.x * 0.4)
  )
}

/**
 * Add a geometry (already shaped, base at its local origin) to the current node.
 * opts: x,y,z (position), ry (yaw), sx,sy,sz (scale), flat (flat shading), tone (brightness), ao
 */
function add(mat, geo, { x = 0, y = 0, z = 0, ry = 0, rx = 0, rz = 0, sx = 1, sy = 1, sz = 1, flat = true, tone, ao = true } = {}) {
  let g = geo.index ? geo.toNonIndexed() : geo.clone()
  g.deleteAttribute('uv')
  const local = new THREE.Matrix4().compose(
    new THREE.Vector3(x, y, z),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, 'YXZ')),
    new THREE.Vector3(sx, sy, sz),
  )
  g.applyMatrix4(stack.at(-1).clone().multiply(local))
  if (flat) g.computeVertexNormals()
  else g.normalizeNormals()

  const base = tone ?? range(0.86, 1)
  const pos = g.getAttribute('position')
  const colors = new Float32Array(pos.count * 3)
  const p = new THREE.Vector3()
  for (let i = 0; i < pos.count; i++) {
    p.fromBufferAttribute(pos, i)
    const occlusion = ao ? 0.7 + 0.3 * THREE.MathUtils.smoothstep(p.y, -0.5, 2.2) : 1
    const v = Math.min(1, base * (0.9 + 0.1 * noise(p)) * occlusion)
    colors.set([v, v * 0.985, v * 0.965], i * 3)
  }
  g.setAttribute('color', new THREE.BufferAttribute(colors, 3))

  const byMat = parts.get(currentNode) ?? new Map()
  parts.set(currentNode, byMat)
  const list = byMat.get(mat.name) ?? []
  byMat.set(mat.name, list)
  list.push(g)
}

// --- Primitive shapes (base at y = 0, centred on x/z) ----------------------------------------
const box = (w, h, d) => new THREE.BoxGeometry(w, h, d).translate(0, h / 2, 0)

/** Rectangular frustum: bottom w×d, top (w·t)×(d·t). */
function frustum(w, h, d, t) {
  const r = Math.SQRT1_2
  return new THREE.CylinderGeometry(r * t, r, 1, 4, 1)
    .rotateY(Math.PI / 4)
    .translate(0, 0.5, 0)
    .scale(w, h, d)
}

const cyl = (rTop, rBottom, h, seg = 8) =>
  new THREE.CylinderGeometry(rTop, rBottom, h, seg, 1).translate(0, h / 2, 0)

/** Half-cylinder vault along X, flat side down. */
const barrel = (len, r, seg = 10) =>
  new THREE.CylinderGeometry(r, r, len, seg, 1, false, 0, Math.PI).rotateZ(Math.PI / 2)

const dome = (r, seg = 8, rings = 4) => new THREE.SphereGeometry(r, seg, rings, 0, Math.PI * 2, 0, Math.PI / 2)

/** Horseshoe arch (half torus) in the XY plane, facing ±Z. */
const arch = (R, tube) => new THREE.TorusGeometry(R, tube, 5, 10, Math.PI)

const figure = (r, len) => new THREE.CapsuleGeometry(r, len, 2, 6).translate(0, len / 2 + r, 0)

const kalashaProfile = [
  [0, 0], [0.24, 0], [0.3, 0.08], [0.44, 0.3], [0.5, 0.5], [0.44, 0.7], [0.24, 0.84], [0.16, 0.92],
  [0.27, 1.0], [0.13, 1.08], [0.09, 1.3], [0.04, 1.5], [0, 1.6],
].map(([r, y]) => new THREE.Vector2(r, y))
const kalashaGeo = new THREE.LatheGeometry(kalashaProfile, 12)

function kalasha(x, y, z, scale) {
  add(MAT.gold, kalashaGeo, { x, y, z, sx: scale, sy: scale, sz: scale, flat: false, tone: 1, ao: false })
}

// --- Architectural elements -----------------------------------------------------------------

/** Moulded base (adhishthana): stacked bands with alternating insets. Returns top height. */
function plinth(mat, w, d, h, { x = 0, y = 0, z = 0 } = {}) {
  const bands = [
    [0, 0.16], [0.12, 0.2], [0.26, 0.1], [0.08, 0.24], [0.3, 0.1], [0.04, 0.2],
  ]
  let cy = y
  for (const [inset, frac] of bands) {
    const bh = h * frac
    add(mat, box(w - inset * 2, bh, d - inset * 2), { x, y: cy, z })
    cy += bh
  }
  return cy
}

/** Kapota: projecting, downward-curving cornice approximated by an inverted frustum. */
function kapota(mat, w, d, h, overhang, { x = 0, y = 0, z = 0 } = {}) {
  const t = w / (w + overhang * 2)
  add(mat, frustum(w + overhang * 2, h, d + overhang * 2, t), { x, y, z })
}

/** Kuta: small square pavilion with a domed roof (corner element of a hara). */
function kuta(s, x, y, z, bodyMat, roofMat) {
  add(bodyMat, box(s * 0.8, s * 0.55, s * 0.8), { x, y, z })
  kapota(roofMat, s * 0.8, s * 0.8, s * 0.12, s * 0.1, { x, y: y + s * 0.55, z })
  add(roofMat, dome(s * 0.42), { x, y: y + s * 0.67, z, sy: 1.15 })
  add(MAT.gold, cyl(0.02 * s, s * 0.08, s * 0.25, 6), { x, y: y + s * 1.1, z, tone: 1, ao: false })
}

/** Shala: oblong pavilion with a barrel-vaulted roof (along local X, rotated by ry). */
function shala(s, len, x, y, z, ry, bodyMat, roofMat) {
  withMatrix(T(x, y, z, ry), () => {
    add(bodyMat, box(len, s * 0.55, s * 0.7))
    add(roofMat, barrel(len * 0.95, s * 0.33), { y: s * 0.55, sy: 1.25 })
    add(roofMat, arch(s * 0.34, s * 0.06), { x: len * 0.48, y: s * 0.55, ry: Math.PI / 2 })
    add(roofMat, arch(s * 0.34, s * 0.06), { x: -len * 0.48, y: s * 0.55, ry: Math.PI / 2 })
  })
}

/** Hara: parapet of miniature pavilions around the edge of a storey (kutas at corners, shalas between). */
function hara(w, d, y, s, bodyMat, roofMat) {
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) kuta(s, sx * (w / 2 - s * 0.4), y, sz * (d / 2 - s * 0.4), bodyMat, roofMat)
  const span = (L) => {
    const n = Math.max(0, Math.floor((L - 2 * s) / (s * 2.1)))
    return Array.from({ length: n }, (_, i) => -L / 2 + s + (i + 0.5) * ((L - 2 * s) / n))
  }
  for (const px of span(w)) for (const sz of [-1, 1]) shala(s, s * 1.3, px, y, sz * (d / 2 - s * 0.35), 0, bodyMat, roofMat)
  for (const pz of span(d)) for (const sx of [-1, 1]) shala(s, s * 1.3, sx * (w / 2 - s * 0.35), y, pz, Math.PI / 2, bodyMat, roofMat)
}

/** Pilasters and sculpted figures on the four faces of a storey. `skip(x)` leaves a bay free. */
function faceDecor(w, d, y, h, { pilasterMat, figureMat, spacing = 1.0, skip = () => false, faces = ['front', 'back', 'left', 'right'] }) {
  for (const face of faces) {
    const alongX = face === 'front' || face === 'back'
    const L = alongX ? w : d
    const off = (alongX ? d : w) / 2
    const sign = face === 'front' || face === 'right' ? 1 : -1
    const n = Math.max(1, Math.floor((L - 0.6) / spacing))
    const step = (L - 0.6) / n
    for (let i = 0; i <= n; i++) {
      const u = -L / 2 + 0.3 + i * step
      const pos = alongX ? { x: u, z: sign * (off + 0.04) } : { x: sign * (off + 0.04), z: u }
      if (!skip(u)) add(pilasterMat, box(alongX ? 0.2 : 0.16, h, alongX ? 0.16 : 0.2), { ...pos, y })
      const uf = u + step / 2
      if (i < n && figureMat && !skip(uf)) {
        const fpos = alongX ? { x: uf, z: sign * (off + 0.14) } : { x: sign * (off + 0.14), z: uf }
        add(figureMat, figure(0.15, h * 0.42), { ...fpos, y: y + h * 0.16 })
      }
    }
  }
}

// --- Gopuram (gateway tower) ----------------------------------------------------------------
function gopuram(cz) {
  const W = 16
  const D = 10
  const door = 4.4
  withMatrix(T(0, 0, cz), () => {
    inNode('gopuram', () => {
      const top = plinth(MAT.granite, W + 1.2, D + 1.2, 1.4)
      const wallH = 7
      const side = (W - door) / 2
      for (const sx of [-1, 1]) add(MAT.granite, box(side, wallH, D), { x: sx * (door / 2 + side / 2), y: top })
      add(MAT.granite, box(door, 1.2, D), { y: top + wallH - 1.2 })
      // Door frame and the dark passage beyond the threshold
      for (const sz of [-1, 1]) {
        for (const sx of [-1, 1]) add(MAT.granite, box(0.45, wallH - 1.2, 0.3), { x: sx * (door / 2 + 0.1), y: top, z: sz * (D / 2 + 0.1) })
        add(MAT.granite, box(door + 0.6, 0.45, 0.3), { y: top + wallH - 1.4, z: sz * (D / 2 + 0.1) })
      }
      add(MAT.recess, box(door - 0.1, 0.05, D - 0.4), { y: top + wallH - 1.25 })
      faceDecor(W, D, top, wallH - 0.3, { pilasterMat: MAT.granite, figureMat: MAT.sculpture, spacing: 1.25, skip: (u) => Math.abs(u) < door / 2 + 0.5 })
      let y = top + wallH
      kapota(MAT.granite, W, D, 0.6, 0.5, { y })
      y += 0.6

      // Seven diminishing storeys (talas) of plaster-faced superstructure
      const tiers = 7
      for (let i = 0; i < tiers; i++) {
        const w = W * 0.92 - i * 1.45
        const d = D * 0.82 - i * 0.62
        const h = 2.7 - i * 0.09
        add(MAT.stucco, frustum(w, h, d, 0.965), { y })
        // Central projecting bay with an opening, front and back
        const bw = Math.max(1.4, w * 0.2)
        for (const sz of [-1, 1]) {
          add(MAT.stucco, box(bw, h * 0.92, 0.5), { y, z: sz * (d / 2) })
          add(MAT.recess, box(bw * 0.5, h * 0.55, 0.1), { y: y + h * 0.12, z: sz * (d / 2 + 0.22) })
          add(MAT.stucco, arch(bw * 0.3, 0.07), { y: y + h * 0.67, z: sz * (d / 2 + 0.27) })
        }
        faceDecor(w * 0.97, d * 0.97, y, h * 0.9, {
          pilasterMat: MAT.stucco,
          figureMat: MAT.sculpture,
          spacing: 0.95,
          skip: (u) => Math.abs(u) < bw / 2 + 0.25,
        })
        y += h
        kapota(MAT.stucco, w * 0.965, d * 0.965, 0.32, 0.2, { y })
        y += 0.32
        hara(w * 0.965 + 0.2, d * 0.965 + 0.2, y, 0.85 - i * 0.03, MAT.stucco, MAT.stucco)
        y += 0.05
      }

      // Platform for the crowning vault
      const wt = W * 0.92 - tiers * 1.45 + 0.6
      const dt = D * 0.82 - tiers * 0.62 + 0.4
      add(MAT.stucco, box(wt, 0.5, dt), { y })
      y += 0.5
      inNode('gopuram_crown', () => {
        // Barrel-vaulted (shala) crown with horseshoe gable ends and a row of kalashas
        const r = dt * 0.5
        add(MAT.stucco, barrel(wt, r, 14), { y, sy: 1.35 })
        for (const sx of [-1, 1]) {
          add(MAT.stucco, arch(r * 1.02, 0.28), { x: sx * (wt / 2 + 0.05), y, ry: Math.PI / 2, sy: 1.35 })
          add(MAT.sculpture, figure(0.35, 0.9), { x: sx * (wt / 2 + 0.1), y: y + 0.2 })
        }
        add(MAT.stucco, box(wt * 0.92, 0.25, 0.5), { y: y + r * 1.3 })
        const count = 7
        for (let k = 0; k < count; k++) {
          const kx = -wt * 0.4 + (k * wt * 0.8) / (count - 1)
          kalasha(kx, y + r * 1.3 + 0.2, 0, 1.15)
        }
      })
    })
  })
}

// --- Dhvajastambha (flagstaff) and bali pitha (offering altar) --------------------------------
function dhvajastambha(cz) {
  inNode('dhvajastambha', () => {
    withMatrix(T(0, 0, cz), () => {
      let y = plinth(MAT.granite, 2.8, 2.8, 1.0)
      y = plinth(MAT.granite, 1.8, 1.8, 0.7, { y })
      add(MAT.gold, cyl(0.42, 0.62, 0.45, 12), { y, flat: false, tone: 1, ao: false })
      y += 0.45
      const poleH = 12
      add(MAT.gold, cyl(0.15, 0.21, poleH, 14), { y, flat: false, tone: 1, ao: false })
      for (let k = 1; k < 10; k++) add(MAT.gold, cyl(0.25, 0.25, 0.1, 14), { y: y + k * 1.15, flat: false, tone: 0.9, ao: false })
      y += poleH
      // Three projecting fins near the top, facing the sanctum
      for (let k = 0; k < 3; k++) add(MAT.gold, box(0.14, 0.34, 1.1), { y: y - 1.6 + k * 0.5, z: -0.6, tone: 0.95, ao: false })
      kalasha(0, y, 0, 0.5)
    })
  })
  inNode('balipitha', () => {
    withMatrix(T(0, 0, cz + 3.4), () => {
      const top = plinth(MAT.granite, 1.8, 1.8, 0.6)
      const lotus = new THREE.LatheGeometry(
        [[0, 0], [0.55, 0], [0.75, 0.25], [0.6, 0.45], [0.35, 0.5], [0, 0.5]].map(([r, h]) => new THREE.Vector2(r, h)),
        16,
      )
      add(MAT.granite, lotus, { y: top, flat: false })
    })
  })
}

// --- Pillar ---------------------------------------------------------------------------------
function pillar(x, y, z, h = 5) {
  const k = h / 5
  let cy = y
  const seg = (geo, hh) => {
    add(MAT.granite, geo, { x, y: cy, z })
    cy += hh
  }
  seg(box(0.7, 0.9 * k, 0.7), 0.9 * k)
  seg(cyl(0.29, 0.29, 0.9 * k, 8), 0.9 * k)
  seg(box(0.66, 0.7 * k, 0.66), 0.7 * k)
  seg(cyl(0.27, 0.27, 0.9 * k, 8), 0.9 * k)
  seg(box(0.6, 0.5 * k, 0.6), 0.5 * k)
  seg(cyl(0.18, 0.2, 0.25 * k, 8), 0.25 * k)
  add(MAT.granite, new THREE.SphereGeometry(0.38, 8, 4).scale(1, 0.5, 1).translate(0, 0.19, 0), { x, y: cy, z })
  cy += 0.38 * k
  seg(box(0.82, 0.12 * k, 0.82), 0.12 * k)
  add(MAT.granite, box(1.5, 0.3 * k, 0.36), { x, y: cy, z })
  add(MAT.granite, box(0.36, 0.3 * k, 1.5), { x, y: cy, z })
}

// --- Mandapa (pillared hall) ----------------------------------------------------------------
function mandapa(z0, z1) {
  inNode('mandapa', () => {
    const W = 16
    const D = z1 - z0
    const cz = (z0 + z1) / 2
    const top = plinth(MAT.granite, W, D, 1.4, { z: cz })
    // Front steps
    for (let s = 0; s < 3; s++) add(MAT.granite, box(5 - s * 0.2, 1.4 - s * 0.45, 0.6), { z: z1 + 1.5 - s * 0.6 })
    for (const sx of [-1, 1]) add(MAT.granite, box(0.5, 1.6, 2.2), { x: sx * 2.8, z: z1 + 1.0 })
    const xs = [-6.75, -4.05, -1.35, 1.35, 4.05, 6.75]
    const zs = Array.from({ length: 5 }, (_, i) => z0 + 1.4 + (i * (D - 2.8)) / 4)
    for (const px of xs) for (const pz of zs) pillar(px, top, pz)
    const roofY = top + 5
    add(MAT.granite, box(W + 0.4, 0.45, D + 0.4), { y: roofY, z: cz })
    kapota(MAT.granite, W + 0.4, D + 0.4, 0.55, 0.55, { y: roofY + 0.45, z: cz })
    add(MAT.granite, box(W + 0.2, 0.3, D + 0.2), { y: roofY + 1.0, z: cz })
    withMatrix(T(0, 0, cz), () => hara(W, D, roofY + 1.3, 0.8, MAT.stucco, MAT.stucco))
  })
}

// --- Vimana (tower over the sanctum) --------------------------------------------------------
/** Builds a vimana in the current node; the shrine faces +Z. Returns total height. */
function vimanaShape({ S = 12, talas = 3, withDoor = false, figures = true, lite = false }) {
  let y = plinth(MAT.granite, S, S, 1.6)
  const wall = S - 1.6
  const wallH = 5.2
  add(MAT.granite, box(wall, wallH, wall), { y })
  faceDecor(wall, wall, y, wallH - 0.2, {
    pilasterMat: MAT.granite,
    figureMat: null,
    spacing: 1.3,
    skip: (u) => Math.abs(u) < 1.2,
  })
  // Devakoshtha niches with deity figures on the three outer walls (and the doorway in front)
  for (const [face, ry] of [['left', -Math.PI / 2], ['right', Math.PI / 2], ['back', Math.PI], ['front', 0]]) {
    withMatrix(T(0, 0, 0, ry), () => {
      const z = wall / 2
      if (face === 'front' && !withDoor) return
      add(MAT.granite, box(2.0, wallH * 0.75, 0.3), { y: y + 0.4, z: z + 0.1 })
      add(MAT.recess, box(1.3, wallH * 0.6, 0.1), { y: y + 0.6, z: z + 0.22 })
      if (figures && face !== 'front') add(MAT.sculpture, figure(0.32, 1.5), { y: y + 0.75, z: z + 0.3 })
      add(MAT.granite, arch(0.75, 0.12), { y: y + 0.6 + wallH * 0.6, z: z + 0.25 })
    })
  }
  y += wallH
  kapota(MAT.granite, wall, wall, 0.7, 0.55, { y })
  y += 0.7
  if (!lite) hara(wall + 0.6, wall + 0.6, y, 1.0, MAT.granite, MAT.granite)

  let w = wall * 0.86
  for (let i = 0; i < talas; i++) {
    const h = 2.3 - i * 0.15
    add(MAT.granite, frustum(w, h, w, 0.96), { y })
    if (!lite) faceDecor(w * 0.97, w * 0.97, y, h * 0.85, { pilasterMat: MAT.granite, figureMat: figures ? MAT.sculpture : null, spacing: 1.1, skip: (u) => Math.abs(u) < 0.7 })
    for (const ry of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) {
      withMatrix(T(0, 0, 0, ry), () => {
        add(MAT.granite, box(1.3, h * 0.9, 0.4), { y, z: w / 2 * 0.98 })
        add(MAT.recess, box(0.6, h * 0.5, 0.1), { y: y + h * 0.15, z: w / 2 * 0.98 + 0.2 })
      })
    }
    y += h
    kapota(MAT.granite, w * 0.96, w * 0.96, 0.35, 0.25, { y })
    y += 0.35
    if (!lite) hara(w * 0.96 + 0.3, w * 0.96 + 0.3, y, 0.85, MAT.granite, MAT.granite)
    w -= wall * 0.17
  }
  // Griva (neck), octagonal shikhara dome with four horseshoe nasis, and the stupi finial
  const gr = w * 0.42
  add(MAT.granite, cyl(gr, gr * 1.1, 1.3, 8), { y, ry: Math.PI / 8 })
  y += 1.3
  const dr = w * 0.62
  add(MAT.granite, dome(dr, 8, 5), { y, sy: 1.05, ry: Math.PI / 8 })
  for (const ry of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) {
    withMatrix(T(0, 0, 0, ry), () => add(MAT.granite, arch(dr * 0.45, 0.16), { y: y + 0.1, z: dr * 0.86 }))
  }
  y += dr * 1.05
  add(MAT.granite, cyl(0.35, 0.5, 0.3, 8), { y: y - 0.1 })
  kalasha(0, y + 0.15, 0, 1.25)
  return y + 2.1
}

function vimana(cz) {
  inNode('vimana', () => {
    withMatrix(T(0, 0, cz), () => vimanaShape({ S: 12, talas: 3 }))
    // Ardha mandapa (antechamber) linking the sanctum to the pillared hall
    const z0 = cz + 5.6
    const z1 = cz + 12.6
    const zc = (z0 + z1) / 2
    const top = plinth(MAT.granite, 9, z1 - z0, 1.6, { z: zc })
    add(MAT.granite, box(8, 4.4, z1 - z0), { y: top, z: zc })
    faceDecor(8, z1 - z0, top, 4.2, { pilasterMat: MAT.granite, figureMat: MAT.sculpture, spacing: 1.2, faces: ['left', 'right'] })
    add(MAT.recess, box(1.8, 3.2, 0.1), { y: top, z: z1 + 0.02 })
    kapota(MAT.granite, 8, z1 - z0, 0.55, 0.45, { y: top + 4.4, z: zc })
    withMatrix(T(0, 0, zc), () => hara(8.6, z1 - z0 + 0.6, top + 4.95, 0.75, MAT.granite, MAT.granite))
  })
}

// --- Subsidiary shrines (part of the courtyard, not landmarks) ------------------------------
function subsidiaryShrine(x, z, ry, s) {
  inNode('shrines', () => withMatrix(T(x, 0, z, ry, s), () => vimanaShape({ S: 12, talas: 2, withDoor: true, figures: false, lite: true })))
}

// --- Pushkarini (stepped temple tank) with a central pavilion -------------------------------
function pushkarini(cx, cz, size) {
  inNode('pushkarini', () => {
    withMatrix(T(cx, 0, cz), () => {
      const depth = 3.4
      const steps = 6
      const tread = 0.85
      for (let k = 0; k < steps; k++) {
        const outer = size / 2 - k * tread
        const topY = -k * (depth / steps) - 0.02
        const h = depth + topY
        for (const s of [-1, 1]) {
          add(MAT.granite, box(outer * 2, h, tread), { y: -depth, z: s * (outer - tread / 2) })
          add(MAT.granite, box(tread, h, outer * 2 - tread * 2), { y: -depth, x: s * (outer - tread / 2) })
        }
      }
      const inner = size - steps * tread * 2
      add(MAT.granite, box(inner, 0.2, inner), { y: -depth })
      add(MAT.water, new THREE.PlaneGeometry(size - 2, size - 2).rotateX(-Math.PI / 2), { y: -1.55, tone: 1, ao: false, flat: false })
      // Low kerb with openings at the centre of each side
      const kerbLen = size / 2 - 1.6
      for (const ry of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) {
        withMatrix(T(0, 0, 0, ry), () => {
          for (const s of [-1, 1]) add(MAT.granite, box(kerbLen, 0.5, 0.45), { x: s * (1.6 + kerbLen / 2), z: size / 2 + 0.25 })
        })
      }
      // Central pavilion (mandapam) rising from the water
      add(MAT.granite, box(2.8, depth - 1.1, 2.8), { y: -depth })
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) pillar(sx * 1.0, -1.1 + 0.0, sz * 1.0, 2.6)
      add(MAT.granite, box(3.0, 0.3, 3.0), { y: 1.5 })
      kapota(MAT.granite, 3.0, 3.0, 0.3, 0.25, { y: 1.8 })
      add(MAT.stucco, box(1.6, 0.6, 1.6), { y: 2.1 })
      add(MAT.stucco, dome(1.0, 8, 4), { y: 2.7, sy: 1.1, ry: Math.PI / 8 })
      kalasha(0, 3.75, 0, 0.5)
    })
  })
}

// --- Prakara (enclosure wall) with red-and-white striped faces --------------------------------
function prakara(x0, x1, z0, z1, gateHalf) {
  inNode('prakara', () => {
    const H = 5.4
    const th = 1.2
    const runs = [
      // [start, end, fixed, alongX]
      [x0, x1, z0, true],
      [x0, -gateHalf, z1, true],
      [gateHalf, x1, z1, true],
      [z0, z1, x0, false],
      [z0, z1, x1, false],
    ]
    for (const [a, b, fixed, alongX] of runs) {
      const L = b - a
      const mid = (a + b) / 2
      const at = (u, w, h, y, mat, d = th) =>
        add(mat, alongX ? box(w, h, d) : box(d, h, w), alongX ? { x: u, y, z: fixed } : { x: fixed, y, z: u })
      at(mid, L, 0.7, 0, MAT.granite, th + 0.3)
      const n = Math.round(L / 1.1)
      for (let i = 0; i < n; i++) at(a + (i + 0.5) * (L / n), L / n, H - 1.5, 0.7, i % 2 ? MAT.ochre : MAT.limewash)
      at(mid, L, 0.5, H - 0.8, MAT.granite, th + 0.2)
      at(mid, L, 0.3, H - 0.3, MAT.limewash, th + 0.5)
    }
    for (const x of [x0, x1]) {
      for (const z of [z0, z1]) {
        add(MAT.granite, box(2.6, H + 1.2, 2.6), { x, z })
        kapota(MAT.granite, 2.6, 2.6, 0.35, 0.25, { x, y: H + 1.2, z })
        add(MAT.stucco, dome(1.2, 8, 4), { x, y: H + 1.55, z, sy: 1.1, ry: Math.PI / 8 })
        kalasha(x, H + 2.85, z, 0.45)
      }
    }
  })
}

// --- Ground, courtyard paving and processional path -----------------------------------------
function ground(bounds, hole) {
  inNode('ground', () => {
    // Earth: a large square with a hole for the tank, built from four rectangles
    const R = 130
    const rects = [
      [-R, R, -R, hole.z0],
      [-R, R, hole.z1, R],
      [-R, hole.x0, hole.z0, hole.z1],
      [hole.x1, R, hole.z0, hole.z1],
    ]
    for (const [ax, bx, az, bz] of rects)
      add(MAT.earth, box(bx - ax, 0.02, bz - az), { x: (ax + bx) / 2, y: -0.02, z: (az + bz) / 2, ao: false, tone: 0.95 })
    // Paving slabs inside the enclosure, skipping the tank
    const slab = 3
    for (let x = bounds.x0; x < bounds.x1; x += slab) {
      for (let z = bounds.z0; z < bounds.z1; z += slab) {
        const cx = x + slab / 2
        const cz = z + slab / 2
        if (cx > hole.x0 - 0.5 && cx < hole.x1 + 0.5 && cz > hole.z0 - 0.5 && cz < hole.z1 + 0.5) continue
        add(MAT.paving, new THREE.PlaneGeometry(slab - 0.12, slab - 0.12).rotateX(-Math.PI / 2), {
          x: cx, y: 0.03, z: cz, ao: false, tone: range(0.78, 1), flat: false,
        })
      }
    }
    // Processional path leading out of the gateway
    for (let z = bounds.z1; z < bounds.z1 + 45; z += 2) {
      for (const x of [-2.5, -0.5, 1.5]) {
        add(MAT.paving, new THREE.PlaneGeometry(1.9, 1.9).rotateX(-Math.PI / 2), { x: x + 0.5, y: 0.03, z: z + 1, ao: false, tone: range(0.72, 0.92), flat: false })
      }
    }
  })
}

// --- Compose the temple ---------------------------------------------------------------------
const bounds = { x0: -33, x1: 33, z0: -36, z1: 27 }
const tank = { cx: -20, cz: -6, size: 14 }
const tankHole = { x0: tank.cx - tank.size / 2, x1: tank.cx + tank.size / 2, z0: tank.cz - tank.size / 2, z1: tank.cz + tank.size / 2 }

ground(bounds, tankHole)
prakara(bounds.x0, bounds.x1, bounds.z0, bounds.z1, 8)
gopuram(bounds.z1)
dhvajastambha(14)
mandapa(-5, 10)
vimana(-17.6)
pushkarini(tank.cx, tank.cz, tank.size)
subsidiaryShrine(21, -8, -Math.PI / 2, 0.5)
subsidiaryShrine(21, -27, -Math.PI / 2, 0.4)
subsidiaryShrine(-21, -27, Math.PI / 2, 0.4)

// --- Merge, report and export ---------------------------------------------------------------
const root = new THREE.Group()
root.name = 'Temple'
const stats = []
for (const [nodeName, byMat] of parts) {
  const group = new THREE.Group()
  group.name = nodeName
  let tris = 0
  for (const [matName, geos] of byMat) {
    const merged = mergeVertices(mergeGeometries(geos, false), 1e-4)
    merged.computeBoundingBox()
    const mesh = new THREE.Mesh(merged, MAT[matName])
    mesh.name = `${nodeName}:${matName}`
    group.add(mesh)
    tris += merged.index.count / 3
  }
  root.add(group)
  stats.push({ node: nodeName, meshes: byMat.size, triangles: tris })
}

const box3 = new THREE.Box3().setFromObject(root)
console.table(stats)
console.log('Total triangles:', stats.reduce((s, r) => s + r.triangles, 0))
console.log('Bounds min', box3.min.toArray().map((v) => v.toFixed(1)).join(', '), 'max', box3.max.toArray().map((v) => v.toFixed(1)).join(', '))

const raw = new Uint8Array(await new GLTFExporter().parseAsync(root, { binary: true }))
console.log(`Raw GLB: ${(raw.byteLength / 1024 / 1024).toFixed(2)} MB`)

// Compress: dedupe accessors/materials, quantize vertex attributes and apply EXT_meshopt_compression.
// The script itself is the unmodified "source" asset; re-run it to regenerate.
await MeshoptEncoder.ready
const io = new NodeIO()
  .registerExtensions([EXTMeshoptCompression, KHRMeshQuantization])
  .registerDependencies({ 'meshopt.encoder': MeshoptEncoder })
const doc = await io.readBinary(raw)
doc.getRoot().getAsset().generator = 'Sanatan build-temple-model.mjs (three.js GLTFExporter + glTF-Transform)'
doc.getRoot().getAsset().copyright = 'Original procedural model created for the Sanatan project'
await doc.transform(dedup(), prune(), meshopt({ encoder: MeshoptEncoder, level: 'medium' }))
const glb = await io.writeBinary(doc)
await mkdir('public/models', { recursive: true })
await writeFile('public/models/temple.glb', glb)
console.log(`Wrote public/models/temple.glb (${(glb.byteLength / 1024 / 1024).toFixed(2)} MB)`)
