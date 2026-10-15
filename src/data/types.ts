export type Vec3 = readonly [number, number, number]

export interface CameraPose {
  position: Vec3
  target: Vec3
}
