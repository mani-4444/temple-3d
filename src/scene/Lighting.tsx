import { Environment, Lightformer, Sky } from '@react-three/drei'

/** Low golden-hour sun from the front-right of the gateway. */
const SUN_POSITION: [number, number, number] = [60, 30, 55]

export function Lighting() {
  return (
    <>
      <Sky
        sunPosition={SUN_POSITION}
        turbidity={8}
        rayleigh={2.4}
        mieCoefficient={0.008}
        mieDirectionalG={0.86}
        distance={4500}
      />
      <fog attach="fog" args={['#c79a6e', 90, 300]} />

      <hemisphereLight args={['#ffd9a8', '#4a3424', 0.55]} />
      <directionalLight
        position={SUN_POSITION}
        intensity={3.2}
        color="#ffc483"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.04}
        shadow-camera-left={-55}
        shadow-camera-right={55}
        shadow-camera-top={55}
        shadow-camera-bottom={-55}
        shadow-camera-near={10}
        shadow-camera-far={200}
      />

      {/* Local, procedural reflection environment (no HDRI download) for the gilded finials */}
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={2.5} color="#ffcf8a" position={[10, 6, 10]} scale={[20, 8, 1]} />
        <Lightformer form="rect" intensity={0.6} color="#8fb3d9" position={[-10, 10, -10]} scale={[30, 10, 1]} />
        <Lightformer form="rect" intensity={0.4} color="#5a3b25" position={[0, -6, 0]} rotation-x={Math.PI / 2} scale={[40, 40, 1]} />
      </Environment>
    </>
  )
}
