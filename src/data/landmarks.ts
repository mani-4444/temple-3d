import type { CameraPose, Vec3 } from './types'

export interface Source {
  label: string
  url: string
}

export interface Landmark {
  /** Stable id used in state and URLs. */
  id: string
  /** Name of the top-level node in temple.glb that represents this landmark (for highlighting). */
  nodeName: string
  /** Architectural term. */
  term: string
  /** Short plain-English role. */
  role: string
  /** One-sentence definition (general architecture, sourced). */
  summary: string
  /** Further general context (sourced). */
  details: string[]
  /** What this particular (fictional) model shows — not a historical claim. */
  inThisModel: string
  /** Hotspot position in model space (metres). */
  anchor: Vec3
  /** Camera pose used when the landmark is focused; kept outside the geometry. */
  camera: CameraPose
  sources: Source[]
}

const wiki = (title: string, label = title): Source => ({
  label: `Wikipedia — ${label}`,
  url: `https://en.wikipedia.org/wiki/${title}`,
})

/** Ordered along the temple axis, from the entrance inward. */
export const LANDMARKS: readonly Landmark[] = [
  {
    id: 'gopuram',
    nodeName: 'gopuram',
    term: 'Gopuram',
    role: 'Gateway tower',
    summary:
      'A gopuram is a monumental, usually ornate entrance tower built over a gateway in the wall that encloses a temple.',
    details: [
      'Gopurams are multi-storeyed and taper as they rise, each storey slightly smaller than the one below. Their exteriors are often crowded with sculpture, usually of brightly painted plaster.',
      'In many South Indian temple complexes the outer gopuram is the tallest structure — taller than the tower over the main shrine.',
    ],
    inThisModel:
      'Seven diminishing storeys rise above a granite base pierced by the entrance passage. Every storey carries a parapet of miniature pavilions and rows of figures.',
    anchor: [0, 9.5, 32.6],
    camera: { position: [18, 9, 74], target: [0, 16, 27] },
    sources: [wiki('Gopuram')],
  },
  {
    id: 'kalasha',
    nodeName: 'gopuram_crown',
    term: 'Shala crown & kalashas',
    role: 'Crowning vault and finials',
    summary:
      'The top of a gopuram is typically a barrel-vaulted roof crowned by one or more kalasha finials.',
    details: [
      'A kalasha is a bulbous, pot-shaped finial. On temple roofs it is usually made of metal — such as copper, brass or gilded metal — though earlier examples were of terracotta or stone.',
    ],
    inThisModel:
      'A barrel vault with horseshoe-shaped gable ends caps the tower, with a row of seven gilded kalashas along its ridge.',
    anchor: [0, 33.6, 27],
    camera: { position: [12, 35, 44], target: [0, 31, 27] },
    sources: [wiki('Gopuram'), wiki('Kalasha')],
  },
  {
    id: 'dhvajastambha',
    nodeName: 'dhvajastambha',
    term: 'Dhvajastambha',
    role: 'Flagstaff',
    summary:
      'The dhvajastambha is a flagstaff erected in front of the front pavilion of a Hindu temple.',
    details: [
      'Flagstaffs were historically made of wood or stone; wooden ones are often sheathed in metal.',
      'Together with the bali pitha (offering altar) and the deity’s vehicle (vahana), it is traditionally regarded as one of three objects that protect the sanctuary.',
    ],
    inThisModel:
      'A metal-sheathed pole on a stepped stone pedestal stands on the temple axis between the gateway and the pillared hall, with a small offering altar in front of it.',
    anchor: [0, 8, 14],
    camera: { position: [21, 9, 21], target: [0, 8.2, 13.5] },
    sources: [wiki('Dhvajastambha')],
  },
  {
    id: 'mandapa',
    nodeName: 'mandapa',
    term: 'Mandapa',
    role: 'Pillared hall',
    summary:
      'A mandapa is a pillared hall or pavilion for public rituals, usually standing in front of the sanctum.',
    details: [
      'Mandapas can be open or enclosed, and their pillars were often richly carved. Temples with several mandapas give each a particular purpose, such as music and dance or assembly.',
    ],
    inThisModel:
      'An open hall of thirty pillars on a moulded plinth, reached by steps on the temple axis. Each pillar alternates square blocks and octagonal shafts beneath bracketed capitals.',
    anchor: [0, 8.6, 10],
    camera: { position: [14, 5, 22], target: [0, 3.6, 4] },
    sources: [wiki('Mandapa'), wiki('Dravidian_architecture', 'Dravidian architecture')],
  },
  {
    id: 'vimana',
    nodeName: 'vimana',
    term: 'Vimana',
    role: 'Tower over the sanctum',
    summary:
      'The vimana is the structure over the garbhagriha — the innermost sanctuary, which houses the sacred image of the temple’s primary deity.',
    details: [
      'In South India it is usually pyramidal, built of several storeys called talas, and capped by a dome-shaped crowning element known as the shikhara.',
      'Niches on the sanctum’s outer walls often hold carved deities.',
    ],
    inThisModel:
      'Three storeys edged with miniature pavilions rise to an octagonal domed shikhara and a gilded finial. Deity figures stand in niches on three walls, and an antechamber links the sanctum to the pillared hall.',
    anchor: [0, 17, -12.4],
    camera: { position: [-25, 16, 5], target: [0, 11, -17.6] },
    sources: [
      wiki('Vimana_(architectural_feature)', 'Vimana'),
      wiki('Garbhagriha'),
      wiki('Dravidian_architecture', 'Dravidian architecture'),
    ],
  },
  {
    id: 'pushkarini',
    nodeName: 'pushkarini',
    term: 'Pushkarini',
    role: 'Temple tank',
    summary:
      'A temple tank is a reservoir built as part of a temple complex; regional names include pushkarini and kalyani.',
    details: [
      'Many are lined with steps on their sides leading down to the water. The water is considered sacred and is used for ritual bathing and temple rites.',
    ],
    inThisModel:
      'A square tank with six flights of steps on every side, a low kerb, and a small domed pavilion standing in the water.',
    anchor: [-20, 5.2, -6],
    camera: { position: [-10, 12, 15], target: [-20, -0.8, -6] },
    sources: [wiki('Temple_tank', 'Temple tank')],
  },
]

export function getLandmark(id: string | null): Landmark | null {
  return LANDMARKS.find((l) => l.id === id) ?? null
}
