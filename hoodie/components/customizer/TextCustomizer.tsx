'use client'

import { useCustomizerStore, AVAILABLE_FONTS } from '@/lib/store/useCustomizerStore'

const TEXT_COLORS = [
  { name: 'White', hex: '#ffffff' },
  { name: 'Black', hex: '#000000' },
  { name: 'Red', hex: '#ef4444' },
  { name: 'Blue', hex: '#3b82f6' },
  { name: 'Green', hex: '#22c55e' },
  { name: 'Yellow', hex: '#eab308' },
  { name: 'Purple', hex: '#a855f7' },
  { name: 'Orange', hex: '#f97316' },
]

export function TextCustomizer() {
  const {
    textValue,
    textFont,
    textColor,
    textPosition,
    textScale,
    textRotation,
    setTextValue,
    setTextFont,
    setTextColor,
    setTextPosition,
    setTextScale,
    setTextRotation,
  } = useCustomizerStore()

  return (
    <div className="space-y-5">
      <h3 className="text-sm font-medium text-gray-700">Add Text</h3>

      {/* Text Input */}
      <div>
        <label className="block text-sm text-neutral-600 mb-2">Your Text</label>
        <input
          type="text"
          value={textValue}
          onChange={(e) => setTextValue(e.target.value)}
          placeholder="Enter your text..."
          maxLength={30}
          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent outline-none"
        />
        <p className="text-xs text-neutral-400 mt-1">{textValue.length}/30 characters</p>
      </div>

      {/* Font Selector */}
      <div>
        <label className="block text-sm text-neutral-600 mb-2">Font Style</label>
        <select
          value={textFont}
          onChange={(e) => setTextFont(e.target.value)}
          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent outline-none bg-white"
        >
          {AVAILABLE_FONTS.map((font) => (
            <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
              {font.name}
            </option>
          ))}
        </select>
        {/* Font Preview */}
        {textValue && (
          <div
            className="mt-2 p-3 bg-neutral-100 rounded-lg text-center text-lg"
            style={{ fontFamily: textFont }}
          >
            {textValue}
          </div>
        )}
      </div>

      {/* Text Color */}
      <div>
        <label className="block text-sm text-neutral-600 mb-2">Text Color</label>
        <div className="flex flex-wrap gap-2">
          {TEXT_COLORS.map((color) => (
            <button
              key={color.hex}
              onClick={() => setTextColor(color.hex)}
              className={`w-8 h-8 rounded-full border-2 transition-transform ${
                textColor === color.hex
                  ? 'border-neutral-900 scale-110'
                  : 'border-neutral-300 hover:scale-105'
              }`}
              style={{ backgroundColor: color.hex }}
              title={color.name}
            />
          ))}
        </div>
      </div>

      {/* Position & Scale Controls - only show if text is entered */}
      {textValue && (
        <div className="space-y-4 pt-2 border-t border-neutral-200">
          {/* Horizontal Position */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-neutral-600">Horizontal</label>
              <span className="text-xs text-neutral-500">{textPosition.x.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min={-10}
              max={10}
              step={0.1}
              value={textPosition.x}
              onChange={(e) => setTextPosition({ x: parseFloat(e.target.value) })}
              className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-900"
            />
          </div>

          {/* Vertical Position */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-neutral-600">Vertical</label>
              <span className="text-xs text-neutral-500">{textPosition.y.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min={-100}
              max={40}
              step={0.1}
              value={textPosition.y}
              onChange={(e) => setTextPosition({ y: parseFloat(e.target.value) })}
              className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-900"
            />
          </div>

          {/* Scale */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-neutral-600">Size</label>
              <span className="text-xs text-neutral-500">{Math.round(textScale * 100)}%</span>
            </div>
            <input
              type="range"
              min={0.2}
              max={1.5}
              step={0.01}
              value={textScale}
              onChange={(e) => setTextScale(parseFloat(e.target.value))}
              className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-900"
            />
          </div>

          {/* Rotation */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-neutral-600">Rotation</label>
              <span className="text-xs text-neutral-500">{textRotation}°</span>
            </div>
            <input
              type="range"
              min={-180}
              max={180}
              step={1}
              value={textRotation}
              onChange={(e) => setTextRotation(parseFloat(e.target.value))}
              className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-900"
            />
          </div>

          {/* Reset Button */}
          <button
            onClick={() => {
              setTextPosition({ x: 0, y: -5 })
              setTextScale(0.5)
              setTextRotation(0)
            }}
            className="w-full py-2 text-sm text-neutral-600 hover:text-neutral-900 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
          >
            Reset Text Position
          </button>
        </div>
      )}

      {/* Clear Text */}
      {textValue && (
        <button
          onClick={() => setTextValue('')}
          className="w-full py-2 text-sm text-red-600 hover:text-red-700 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
        >
          Remove Text
        </button>
      )}
    </div>
  )
}
