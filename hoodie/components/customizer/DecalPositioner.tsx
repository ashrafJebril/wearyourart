'use client'

import { useCustomizerStore } from '@/lib/store/useCustomizerStore'

export function DecalPositioner() {
  const {
    decalImage,
    decalPosition,
    decalScale,
    decalRotation,
    setDecalPosition,
    setDecalScale,
    setDecalRotation,
  } = useCustomizerStore()

  if (!decalImage) {
    return (
      <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
        <p className="text-sm text-neutral-500 text-center">
          Upload a design to adjust its position
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Horizontal Position - matching Next.js range: -10 to 10 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-neutral-700">
            Horizontal Position
          </label>
          <span className="text-xs text-neutral-500">
            {decalPosition.x.toFixed(1)}
          </span>
        </div>
        <input
          type="range"
          min={-10}
          max={10}
          step={0.1}
          value={decalPosition.x}
          onChange={(e) => setDecalPosition({ x: parseFloat(e.target.value) })}
          className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-900"
        />
      </div>

      {/* Vertical Position - matching Next.js range: -20 to 0 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-neutral-700">
            Vertical Position
          </label>
          <span className="text-xs text-neutral-500">
            {decalPosition.y.toFixed(1)}
          </span>
        </div>
        <input
          type="range"
          min={-20}
          max={0}
          step={0.1}
          value={decalPosition.y}
          onChange={(e) => setDecalPosition({ y: parseFloat(e.target.value) })}
          className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-900"
        />
      </div>

      {/* Scale */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-neutral-700">Size</label>
          <span className="text-xs text-neutral-500">
            {Math.round(decalScale * 100)}%
          </span>
        </div>
        <input
          type="range"
          min={0.2}
          max={1.5}
          step={0.01}
          value={decalScale}
          onChange={(e) => setDecalScale(parseFloat(e.target.value))}
          className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-900"
        />
      </div>

      {/* Rotation */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-neutral-700">
            Rotation
          </label>
          <span className="text-xs text-neutral-500">{decalRotation}°</span>
        </div>
        <input
          type="range"
          min={-180}
          max={180}
          step={1}
          value={decalRotation}
          onChange={(e) => setDecalRotation(parseFloat(e.target.value))}
          className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-900"
        />
      </div>

      {/* Reset Button */}
      <button
        onClick={() => {
          setDecalPosition({ x: 0, y: -10, z: 0 })
          setDecalScale(0.6)
          setDecalRotation(0)
        }}
        className="w-full py-2 text-sm text-neutral-600 hover:text-neutral-900 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
      >
        Reset Position
      </button>
    </div>
  )
}
