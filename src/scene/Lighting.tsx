import { Environment, Lightformer } from '@react-three/drei'
import { useMemo } from 'react'
import { BackSide, Color, ShaderMaterial, Vector3 } from 'three'

/** Low golden-hour sun from the front-right of the gateway. */
const SUN_POSITION: [number, number, number] = [70, 21, 48]
/** Haze colour shared by the fog and the sky's horizon so the ground dissolves into the sky. */
const HAZE = '#d79a68'

const skyVertex = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_Position = p.xyww; // always at the far plane
  }
`

const skyFragment = /* glsl */ `
  uniform vec3 zenith;
  uniform vec3 mid;
  uniform vec3 horizon;
  uniform vec3 glow;
  uniform vec3 sunDir;
  varying vec3 vDir;
  void main() {
    vec3 d = normalize(vDir);
    float h = clamp(d.y, 0.0, 1.0);
    vec3 col = mix(horizon, mid, smoothstep(0.0, 0.18, h));
    col = mix(col, zenith, smoothstep(0.12, 0.75, h));
    float s = max(dot(d, sunDir), 0.0);
    col += glow * (pow(s, 6.0) * 0.35 + pow(s, 120.0) * 0.9);
    if (d.y < 0.0) col = horizon;
    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`

/** Cheap gradient sky dome (no textures) with a soft glow toward the sun. */
function GradientSky() {
  const material = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: {
          zenith: { value: new Color('#3a4766') },
          mid: { value: new Color('#c08a68') },
          horizon: { value: new Color(HAZE) },
          glow: { value: new Color('#ffcf8f') },
          sunDir: { value: new Vector3(...SUN_POSITION).normalize() },
        },
        vertexShader: skyVertex,
        fragmentShader: skyFragment,
        side: BackSide,
        depthWrite: false,
        fog: false,
      }),
    [],
  )
  return (
    <mesh material={material} renderOrder={-1} frustumCulled={false}>
      <sphereGeometry args={[1000, 32, 16]} />
    </mesh>
  )
}

export function Lighting() {
  return (
    <>
      <GradientSky />
      <fog attach="fog" args={[HAZE, 110, 330]} />

      <hemisphereLight args={['#ffd6a5', '#3d2b1f', 0.6]} />
      <directionalLight
        position={SUN_POSITION}
        intensity={3.4}
        color="#ffbf7a"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.04}
        shadow-camera-left={-60}
        shadow-camera-right={60}
        shadow-camera-top={60}
        shadow-camera-bottom={-60}
        shadow-camera-near={10}
        shadow-camera-far={220}
      />

      {/* Local, procedural reflection environment (no HDRI download) for gilding and water */}
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={2.6} color="#ffc98a" position={[12, 5, 9]} scale={[24, 6, 1]} />
        <Lightformer form="rect" intensity={0.7} color="#7f97c4" position={[-10, 12, -10]} scale={[30, 10, 1]} />
        <Lightformer form="rect" intensity={0.35} color="#5a3b25" position={[0, -6, 0]} rotation-x={Math.PI / 2} scale={[40, 40, 1]} />
      </Environment>
    </>
  )
}
