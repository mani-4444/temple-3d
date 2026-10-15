/**
 * Static backdrop shown behind the hero until the 3D canvas has rendered, and as the
 * stage for the non-WebGL fallback. Pure CSS/SVG — no external imagery.
 */
export function ScenePlaceholder() {
  const tiers = [0, 1, 2, 3, 4, 5, 6]
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden bg-basalt">
      <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_70%_85%,#8a4b22_0%,#3a2114_38%,#120d09_75%)]" />
      <svg
        viewBox="0 0 400 400"
        preserveAspectRatio="xMidYMax meet"
        className="absolute right-[-10%] bottom-0 h-[78%] w-auto opacity-80 sm:right-[6%]"
      >
        <defs>
          <linearGradient id="ph-stone" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#3b2a1d" />
            <stop offset="1" stopColor="#140e0a" />
          </linearGradient>
        </defs>
        {/* Tapering tiers of a gateway tower */}
        {tiers.map((i) => {
          const w = 220 - i * 24
          const y = 330 - i * 34
          return <rect key={i} x={200 - w / 2} y={y} width={w} height={30} fill="url(#ph-stone)" />
        })}
        <path d="M146 126 Q200 78 254 126 Z" fill="url(#ph-stone)" />
        {[166, 183, 200, 217, 234].map((x) => (
          <circle key={x} cx={x} cy={x === 200 ? 96 : 100} r={4} fill="#e0aa4c" opacity={0.85} />
        ))}
        <rect x="70" y="360" width="260" height="40" fill="#140e0a" />
        <rect x="176" y="300" width="48" height="60" rx="24" fill="#e0aa4c" opacity={0.18} />
      </svg>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(13,9,7,0.55)_0%,transparent_30%,transparent_55%,rgba(13,9,7,0.9)_100%)]" />
    </div>
  )
}
