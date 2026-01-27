'use client'

import { useState, useRef } from 'react'
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

type ShoulderSide = 'left' | 'right'

export function ShoulderCustomizer() {
  const [activeSide, setActiveSide] = useState<ShoulderSide>('left')
  const leftFileRef = useRef<HTMLInputElement>(null)
  const rightFileRef = useRef<HTMLInputElement>(null)

  const {
    leftShoulderImage,
    leftShoulderText,
    leftShoulderTextFont,
    leftShoulderTextColor,
    leftShoulderPosition,
    leftShoulderScale,
    leftShoulderRotation,
    setLeftShoulderImage,
    setLeftShoulderText,
    setLeftShoulderTextFont,
    setLeftShoulderTextColor,
    setLeftShoulderPosition,
    setLeftShoulderScale,
    setLeftShoulderRotation,
    rightShoulderImage,
    rightShoulderText,
    rightShoulderTextFont,
    rightShoulderTextColor,
    rightShoulderPosition,
    rightShoulderScale,
    rightShoulderRotation,
    setRightShoulderImage,
    setRightShoulderText,
    setRightShoulderTextFont,
    setRightShoulderTextColor,
    setRightShoulderPosition,
    setRightShoulderScale,
    setRightShoulderRotation,
  } = useCustomizerStore()

  const isLeft = activeSide === 'left'

  const image = isLeft ? leftShoulderImage : rightShoulderImage
  const text = isLeft ? leftShoulderText : rightShoulderText
  const textFont = isLeft ? leftShoulderTextFont : rightShoulderTextFont
  const textColor = isLeft ? leftShoulderTextColor : rightShoulderTextColor
  const position = isLeft ? leftShoulderPosition : rightShoulderPosition
  const scale = isLeft ? leftShoulderScale : rightShoulderScale
  const rotation = isLeft ? leftShoulderRotation : rightShoulderRotation

  const setText = isLeft ? setLeftShoulderText : setRightShoulderText
  const setTextFont = isLeft ? setLeftShoulderTextFont : setRightShoulderTextFont
  const setTextColor = isLeft ? setLeftShoulderTextColor : setRightShoulderTextColor
  const setPosition = isLeft ? setLeftShoulderPosition : setRightShoulderPosition
  const setScale = isLeft ? setLeftShoulderScale : setRightShoulderScale
  const setRotation = isLeft ? setLeftShoulderRotation : setRightShoulderRotation

  const handleLeftFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      console.log('Uploading to LEFT shoulder')
      setLeftShoulderImage(event.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleRightFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      console.log('Uploading to RIGHT shoulder')
      setRightShoulderImage(event.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const hasContent = image || text

  const defaultPosition = { x: 0, y: 0 }

  const handleReset = () => {
    setPosition(defaultPosition)
    setScale(0.5)
    setRotation(0)
  }

  const handleClear = () => {
    if (isLeft) {
      setLeftShoulderImage(null)
      setLeftShoulderText('')
      if (leftFileRef.current) {
        leftFileRef.current.value = ''
      }
    } else {
      setRightShoulderImage(null)
      setRightShoulderText('')
      if (rightFileRef.current) {
        rightFileRef.current.value = ''
      }
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-700">Shoulder Designs (Optional)</h3>

      {/* Tab Selector */}
      <div className="flex rounded-lg bg-neutral-100 p-1">
        <button
          onClick={() => setActiveSide('left')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
            activeSide === 'left'
              ? 'bg-white text-neutral-900 shadow-sm'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          Left Shoulder
          {(leftShoulderImage || leftShoulderText) && (
            <span className="ml-1 inline-block w-2 h-2 bg-green-500 rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveSide('right')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
            activeSide === 'right'
              ? 'bg-white text-neutral-900 shadow-sm'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          Right Shoulder
          {(rightShoulderImage || rightShoulderText) && (
            <span className="ml-1 inline-block w-2 h-2 bg-green-500 rounded-full" />
          )}
        </button>
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm text-neutral-600 mb-2">Upload Image</label>
        {/* Left shoulder file input */}
        <input
          ref={leftFileRef}
          type="file"
          accept="image/*"
          onChange={handleLeftFileChange}
          className="hidden"
        />
        {/* Right shoulder file input */}
        <input
          ref={rightFileRef}
          type="file"
          accept="image/*"
          onChange={handleRightFileChange}
          className="hidden"
        />
        {image ? (
          <div className="relative">
            <img
              src={image}
              alt={`${activeSide} shoulder`}
              className="w-full h-24 object-contain bg-neutral-100 rounded-lg"
            />
            <button
              onClick={() => {
                if (isLeft) {
                  setLeftShoulderImage(null)
                  if (leftFileRef.current) leftFileRef.current.value = ''
                } else {
                  setRightShoulderImage(null)
                  if (rightFileRef.current) rightFileRef.current.value = ''
                }
              }}
              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              if (isLeft) {
                leftFileRef.current?.click()
              } else {
                rightFileRef.current?.click()
              }
            }}
            className="w-full py-3 border-2 border-dashed border-neutral-300 rounded-lg text-sm text-neutral-600 hover:border-neutral-400 hover:text-neutral-700 transition-colors"
          >
            Click to upload image
          </button>
        )}
      </div>

      {/* Text Input */}
      <div>
        <label className="block text-sm text-neutral-600 mb-2">Add Text</label>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text..."
          maxLength={15}
          className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent outline-none text-sm"
        />
        <p className="text-xs text-neutral-400 mt-1">{text.length}/15 characters</p>
      </div>

      {/* Font Selector - only show if text entered */}
      {text && (
        <div>
          <label className="block text-sm text-neutral-600 mb-2">Font</label>
          <select
            value={textFont}
            onChange={(e) => setTextFont(e.target.value)}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent outline-none bg-white text-sm"
          >
            {AVAILABLE_FONTS.map((font) => (
              <option key={font.value} value={font.value}>
                {font.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Text Color - only show if text entered */}
      {text && (
        <div>
          <label className="block text-sm text-neutral-600 mb-2">Text Color</label>
          <div className="flex flex-wrap gap-2">
            {TEXT_COLORS.map((color) => (
              <button
                key={color.hex}
                onClick={() => setTextColor(color.hex)}
                className={`w-6 h-6 rounded-full border-2 transition-transform ${
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
      )}

      {/* Position & Scale Controls - only show if content exists */}
      {hasContent && (
        <div className="space-y-3 pt-3 border-t border-neutral-200">
          {/* Horizontal Position */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-neutral-600">Horizontal</label>
              <span className="text-xs text-neutral-500">{position.x.toFixed(0)}</span>
            </div>
            <input
              type="range"
              min={-30}
              max={30}
              step={1}
              value={position.x}
              onChange={(e) => setPosition({ x: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-900"
            />
          </div>

          {/* Vertical Position */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-neutral-600">Vertical</label>
              <span className="text-xs text-neutral-500">{position.y.toFixed(0)}</span>
            </div>
            <input
              type="range"
              min={-30}
              max={30}
              step={1}
              value={position.y}
              onChange={(e) => setPosition({ y: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-900"
            />
          </div>

          {/* Scale */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-neutral-600">Size</label>
              <span className="text-xs text-neutral-500">{Math.round(scale * 100)}%</span>
            </div>
            <input
              type="range"
              min={0.2}
              max={0.8}
              step={0.01}
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-900"
            />
          </div>

          {/* Rotation */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-neutral-600">Rotation</label>
              <span className="text-xs text-neutral-500">{rotation}°</span>
            </div>
            <input
              type="range"
              min={-180}
              max={180}
              step={1}
              value={rotation}
              onChange={(e) => setRotation(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-900"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={handleReset}
              className="flex-1 py-1.5 text-xs text-neutral-600 hover:text-neutral-900 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
            >
              Reset Position
            </button>
            <button
              onClick={handleClear}
              className="flex-1 py-1.5 text-xs text-red-600 hover:text-red-700 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
