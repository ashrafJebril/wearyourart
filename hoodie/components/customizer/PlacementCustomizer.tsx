'use client'

import { useRef, useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useCustomizerStore, AVAILABLE_FONTS, PlacementArea } from '@/lib/store/useCustomizerStore'
import { uploadDesignImage } from '@/lib/api/client'
import { getSessionId } from '@/lib/utils/session'

interface LibraryImage {
  filename: string
  url: string
  size: number
  createdAt: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

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

const PLACEMENT_TABS: { id: PlacementArea; label: string }[] = [
  { id: 'front', label: 'Front' },
  { id: 'back', label: 'Back' },
  { id: 'leftShoulder', label: 'Left' },
  { id: 'rightShoulder', label: 'Right' },
]

export function PlacementCustomizer() {
  const frontFileRef = useRef<HTMLInputElement>(null)
  const backFileRef = useRef<HTMLInputElement>(null)
  const leftFileRef = useRef<HTMLInputElement>(null)
  const rightFileRef = useRef<HTMLInputElement>(null)

  // Library state
  const [showLibrary, setShowLibrary] = useState(false)
  const [libraryImages, setLibraryImages] = useState<LibraryImage[]>([])
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(false)

  // Font dropdown state
  const [showFontDropdown, setShowFontDropdown] = useState(false)

  // Upload state
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  // Background removal state
  const [isProcessing, setIsProcessing] = useState(false)
  const [bgRemovalError, setBgRemovalError] = useState<string | null>(null)
  const [bgRemoved, setBgRemoved] = useState(false)

  const fetchLibraryImages = async () => {
    setIsLoadingLibrary(true)
    try {
      const response = await fetch(`${API_URL}/upload/public`)
      if (response.ok) {
        const data = await response.json()
        setLibraryImages(data)
      }
    } catch (error) {
      console.error('Error fetching library images:', error)
    } finally {
      setIsLoadingLibrary(false)
    }
  }

  useEffect(() => {
    if (showLibrary) {
      fetchLibraryImages()
    }
  }, [showLibrary])

  const {
    activePlacement,
    setActivePlacement,
    // Front
    decalImage,
    setDecalImage,
    decalPosition,
    setDecalPosition,
    decalScale,
    setDecalScale,
    decalRotation,
    setDecalRotation,
    textValue,
    setTextValue,
    textFont,
    setTextFont,
    textColor,
    setTextColor,
    textPosition,
    setTextPosition,
    textScale,
    setTextScale,
    textRotation,
    setTextRotation,
    // Back
    backImage,
    setBackImage,
    backText,
    setBackText,
    backTextFont,
    setBackTextFont,
    backTextColor,
    setBackTextColor,
    backPosition,
    setBackPosition,
    backScale,
    setBackScale,
    backRotation,
    setBackRotation,
    backTextPosition,
    setBackTextPosition,
    backTextScale,
    setBackTextScale,
    backTextRotation,
    setBackTextRotation,
    // Left shoulder
    leftShoulderImage,
    setLeftShoulderImage,
    leftShoulderText,
    setLeftShoulderText,
    leftShoulderTextFont,
    setLeftShoulderTextFont,
    leftShoulderTextColor,
    setLeftShoulderTextColor,
    leftShoulderPosition,
    setLeftShoulderPosition,
    leftShoulderScale,
    setLeftShoulderScale,
    leftShoulderRotation,
    setLeftShoulderRotation,
    // Right shoulder
    rightShoulderImage,
    setRightShoulderImage,
    rightShoulderText,
    setRightShoulderText,
    rightShoulderTextFont,
    setRightShoulderTextFont,
    rightShoulderTextColor,
    setRightShoulderTextColor,
    rightShoulderPosition,
    setRightShoulderPosition,
    rightShoulderScale,
    setRightShoulderScale,
    rightShoulderRotation,
    setRightShoulderRotation,
  } = useCustomizerStore()

  // Get current placement's data
  const getPlacementData = () => {
    switch (activePlacement) {
      case 'front':
        return {
          image: decalImage,
          setImage: setDecalImage,
          text: textValue,
          setText: setTextValue,
          textFont: textFont,
          setTextFont: setTextFont,
          textColor: textColor,
          setTextColor: setTextColor,
          position: { x: decalPosition.x, y: decalPosition.y },
          setPosition: (pos: Partial<{ x: number; y: number }>) => setDecalPosition(pos),
          scale: decalScale,
          setScale: setDecalScale,
          rotation: decalRotation,
          setRotation: setDecalRotation,
          textPosition: textPosition,
          setTextPosition: setTextPosition,
          textScale: textScale,
          setTextScale: setTextScale,
          textRotation: textRotation,
          setTextRotation: setTextRotation,
          fileRef: frontFileRef,
          positionRange: { xMin: -10, xMax: 10, yMin: -100, yMax: 40 },
          hasTextPosition: true,
        }
      case 'back':
        return {
          image: backImage,
          setImage: setBackImage,
          text: backText,
          setText: setBackText,
          textFont: backTextFont,
          setTextFont: setBackTextFont,
          textColor: backTextColor,
          setTextColor: setBackTextColor,
          position: backPosition,
          setPosition: setBackPosition,
          scale: backScale,
          setScale: setBackScale,
          rotation: backRotation,
          setRotation: setBackRotation,
          textPosition: backTextPosition,
          setTextPosition: setBackTextPosition,
          textScale: backTextScale,
          setTextScale: setBackTextScale,
          textRotation: backTextRotation,
          setTextRotation: setBackTextRotation,
          fileRef: backFileRef,
          positionRange: { xMin: -10, xMax: 10, yMin: -100, yMax: 40 },
          hasTextPosition: true,
        }
      case 'leftShoulder':
        return {
          image: leftShoulderImage,
          setImage: setLeftShoulderImage,
          text: leftShoulderText,
          setText: setLeftShoulderText,
          textFont: leftShoulderTextFont,
          setTextFont: setLeftShoulderTextFont,
          textColor: leftShoulderTextColor,
          setTextColor: setLeftShoulderTextColor,
          position: leftShoulderPosition,
          setPosition: setLeftShoulderPosition,
          scale: leftShoulderScale,
          setScale: setLeftShoulderScale,
          rotation: leftShoulderRotation,
          setRotation: setLeftShoulderRotation,
          textPosition: leftShoulderPosition,
          setTextPosition: setLeftShoulderPosition,
          textScale: leftShoulderScale,
          setTextScale: setLeftShoulderScale,
          textRotation: leftShoulderRotation,
          setTextRotation: setLeftShoulderRotation,
          fileRef: leftFileRef,
          positionRange: { xMin: -30, xMax: 30, yMin: -30, yMax: 30 },
          hasTextPosition: false,
        }
      case 'rightShoulder':
        return {
          image: rightShoulderImage,
          setImage: setRightShoulderImage,
          text: rightShoulderText,
          setText: setRightShoulderText,
          textFont: rightShoulderTextFont,
          setTextFont: setRightShoulderTextFont,
          textColor: rightShoulderTextColor,
          setTextColor: setRightShoulderTextColor,
          position: rightShoulderPosition,
          setPosition: setRightShoulderPosition,
          scale: rightShoulderScale,
          setScale: setRightShoulderScale,
          rotation: rightShoulderRotation,
          setRotation: setRightShoulderRotation,
          textPosition: rightShoulderPosition,
          setTextPosition: setRightShoulderPosition,
          textScale: rightShoulderScale,
          setTextScale: setRightShoulderScale,
          textRotation: rightShoulderRotation,
          setTextRotation: setRightShoulderRotation,
          fileRef: rightFileRef,
          positionRange: { xMin: -30, xMax: 30, yMin: -30, yMax: 30 },
          hasTextPosition: false,
        }
    }
  }

  const data = getPlacementData()

  // Check if each placement has content (for indicator dots)
  const hasContent = (placement: PlacementArea): boolean => {
    switch (placement) {
      case 'front':
        return !!(decalImage || textValue)
      case 'back':
        return !!(backImage || backText)
      case 'leftShoulder':
        return !!(leftShoulderImage || leftShoulderText)
      case 'rightShoulder':
        return !!(rightShoulderImage || rightShoulderText)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setBgRemovalError(null)
    setBgRemoved(false)
    setUploadError(null)
    setIsUploading(true)

    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (event) => resolve(event.target?.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      console.log(`[PlacementCustomizer] Uploading image for placement: ${activePlacement}`)

      // Upload to DigitalOcean Spaces via backend
      const response = await uploadDesignImage({
        base64,
        placement: activePlacement,
        sessionId: getSessionId(),
      })

      console.log(`[PlacementCustomizer] Upload successful, URL: ${response.url}`)

      // Store the URL (not base64) in the customizer store
      data.setImage(response.url)
    } catch (error) {
      console.error('[PlacementCustomizer] Upload failed:', error)
      setUploadError('Failed to upload image. Please try again.')

      // Fallback: store base64 locally if upload fails
      const reader = new FileReader()
      reader.onload = (event) => {
        data.setImage(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    } finally {
      setIsUploading(false)
    }
  }

  const handleReset = () => {
    data.setPosition({ x: 0, y: activePlacement === 'front' ? -10 : 0 })
    data.setScale(activePlacement === 'front' ? 0.6 : 0.5)
    data.setRotation(0)
  }

  const handleClear = () => {
    data.setImage(null)
    data.setText('')
    setBgRemoved(false)
    if (data.fileRef.current) {
      data.fileRef.current.value = ''
    }
  }

  const handleSelectFromLibrary = (imageUrl: string) => {
    // URL is already complete from the backend
    data.setImage(imageUrl)
    setShowLibrary(false)
    setBgRemoved(false)
  }

  const handleRemoveBackground = async () => {
    if (!data.image) return

    setIsProcessing(true)
    setBgRemovalError(null)

    try {
      // Fetch the current image as a blob
      const response = await fetch(data.image)
      const blob = await response.blob()

      // Send to remove.bg API
      const formData = new FormData()
      formData.append('image_file', blob, 'image.png')
      formData.append('size', 'auto')

      const bgResponse = await fetch('/api/remove-bg', {
        method: 'POST',
        body: formData,
      })

      if (!bgResponse.ok) {
        throw new Error('Background removal failed')
      }

      const resultBlob = await bgResponse.blob()

      // Convert blob to base64 and re-upload to server
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (event) => resolve(event.target?.result as string)
        reader.onerror = reject
        reader.readAsDataURL(resultBlob)
      })

      // Upload the processed image to DigitalOcean Spaces
      const uploadResponse = await uploadDesignImage({
        base64,
        placement: `${activePlacement}-nobg`,
        sessionId: getSessionId(),
      })

      console.log(`[PlacementCustomizer] Background removed image uploaded, URL: ${uploadResponse.url}`)
      data.setImage(uploadResponse.url)
      setBgRemoved(true)
    } catch (err) {
      console.error('Error removing background:', err)
      setBgRemovalError('Failed to remove background')
    } finally {
      setIsProcessing(false)
    }
  }

  const currentHasContent = data.image || data.text

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-700">Design Placement</h3>

      {/* Placement Tabs */}
      <div className="flex rounded-lg bg-neutral-100 p-1">
        {PLACEMENT_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActivePlacement(tab.id)}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors relative ${
              activePlacement === tab.id
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            {tab.label}
            {hasContent(tab.id) && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Hidden file inputs for each placement */}
      <input
        ref={frontFileRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={backFileRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={leftFileRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={rightFileRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />


      {/* Error Messages */}
      {bgRemovalError && (
        <p className="text-sm text-red-500 bg-red-50 p-2 rounded">{bgRemovalError}</p>
      )}
      {uploadError && (
        <p className="text-sm text-orange-600 bg-orange-50 p-2 rounded">{uploadError}</p>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="flex items-center justify-center gap-2 p-4 bg-green-50 rounded-lg">
          <svg className="animate-spin h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-sm text-green-600">Uploading image...</span>
        </div>
      )}

      {/* Background Removal Progress */}
      {isProcessing && (
        <div className="flex items-center justify-center gap-2 p-4 bg-blue-50 rounded-lg">
          <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-sm text-blue-600">Removing background...</span>
        </div>
      )}

      {/* Image Upload */}
      <div>
        <label className="block text-sm text-neutral-600 mb-2">Add Image</label>
        {data.image ? (
          <div className="space-y-2">
            <div className="relative">
              <img
                src={data.image}
                alt={`${activePlacement} design`}
                className="w-full h-24 object-contain bg-neutral-100 rounded-lg"
              />
              <button
                onClick={() => {
                  data.setImage(null)
                  setBgRemoved(false)
                  if (data.fileRef.current) data.fileRef.current.value = ''
                }}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {/* Remove Background Button */}
            {!bgRemoved && !isProcessing && (
              <button
                onClick={handleRemoveBackground}
                className="w-full py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Remove Background
              </button>
            )}
            {bgRemoved && (
              <div className="flex items-center justify-center gap-2 py-2 text-sm text-green-600 bg-green-50 rounded-lg">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Background Removed
              </div>
            )}
          </div>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => data.fileRef.current?.click()}
              className="flex-1 py-3 border-2 border-dashed border-neutral-300 rounded-lg text-sm text-neutral-600 hover:border-neutral-400 hover:text-neutral-700 transition-colors flex flex-col items-center gap-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span>Upload</span>
            </button>
            <button
              onClick={() => setShowLibrary(true)}
              className="flex-1 py-3 border-2 border-dashed border-neutral-300 rounded-lg text-sm text-neutral-600 hover:border-neutral-400 hover:text-neutral-700 transition-colors flex flex-col items-center gap-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Library</span>
            </button>
          </div>
        )}
      </div>

      {/* Text Input - only for front and back placements */}
      {(activePlacement === 'front' || activePlacement === 'back') && (
        <div>
          <label className="block text-sm text-neutral-600 mb-2">Add Text</label>
          <input
            type="text"
            value={data.text}
            onChange={(e) => data.setText(e.target.value)}
            placeholder="Enter text..."
            maxLength={20}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent outline-none text-sm"
          />
          <p className="text-xs text-neutral-400 mt-1">{data.text.length}/20 characters</p>
        </div>
      )}

      {/* Font Selector - only show if text entered and on front/back */}
      {data.text && (activePlacement === 'front' || activePlacement === 'back') && (
        <div className="relative">
          <label className="block text-sm text-neutral-600 mb-2">Font</label>
          <button
            type="button"
            onClick={() => setShowFontDropdown(!showFontDropdown)}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent outline-none bg-white text-sm text-left flex items-center justify-between"
            style={{ fontFamily: data.textFont }}
          >
            <span>{AVAILABLE_FONTS.find(f => f.value === data.textFont)?.name || data.textFont}</span>
            <svg className={`w-4 h-4 transition-transform ${showFontDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showFontDropdown && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-neutral-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {AVAILABLE_FONTS.map((font) => (
                <button
                  key={font.value}
                  type="button"
                  onClick={() => {
                    data.setTextFont(font.value)
                    setShowFontDropdown(false)
                  }}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-neutral-100 ${
                    data.textFont === font.value ? 'bg-neutral-100' : ''
                  }`}
                  style={{ fontFamily: font.value }}
                >
                  {font.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Text Color - only show if text entered and on front/back */}
      {data.text && (activePlacement === 'front' || activePlacement === 'back') && (
        <div>
          <label className="block text-sm text-neutral-600 mb-2">Text Color</label>
          <div className="flex flex-wrap gap-2">
            {TEXT_COLORS.map((color) => (
              <button
                key={color.hex}
                onClick={() => data.setTextColor(color.hex)}
                className={`w-6 h-6 rounded-full border-2 transition-transform ${
                  data.textColor === color.hex
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
      {currentHasContent && (
        <div className="space-y-3 pt-3 border-t border-neutral-200">
          {/* Image Position Controls */}
          {data.image && (
            <>
              <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Image Position</p>

              {/* Horizontal Position */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-neutral-600">Horizontal</label>
                  <span className="text-xs text-neutral-500">{data.position.x.toFixed(0)}</span>
                </div>
                <input
                  type="range"
                  min={data.positionRange.xMin}
                  max={data.positionRange.xMax}
                  step={1}
                  value={data.position.x}
                  onChange={(e) => data.setPosition({ x: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-900"
                />
              </div>

              {/* Vertical Position */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-neutral-600">Vertical</label>
                  <span className="text-xs text-neutral-500">{data.position.y.toFixed(0)}</span>
                </div>
                <input
                  type="range"
                  min={data.positionRange.yMin}
                  max={data.positionRange.yMax}
                  step={1}
                  value={data.position.y}
                  onChange={(e) => data.setPosition({ y: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-900"
                />
              </div>

              {/* Scale */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-neutral-600">Size</label>
                  <span className="text-xs text-neutral-500">{Math.round(data.scale * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0.2}
                  max={1.0}
                  step={0.01}
                  value={data.scale}
                  onChange={(e) => data.setScale(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-900"
                />
              </div>

              {/* Rotation */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-neutral-600">Rotation</label>
                  <span className="text-xs text-neutral-500">{data.rotation}°</span>
                </div>
                <input
                  type="range"
                  min={-180}
                  max={180}
                  step={1}
                  value={data.rotation}
                  onChange={(e) => data.setRotation(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-900"
                />
              </div>
            </>
          )}

          {/* Text Position Controls - separate from image for front */}
          {data.text && data.hasTextPosition && (
            <>
              <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mt-4">Text Position</p>

              {/* Text Horizontal */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-neutral-600">Horizontal</label>
                  <span className="text-xs text-neutral-500">{data.textPosition.x.toFixed(0)}</span>
                </div>
                <input
                  type="range"
                  min={data.positionRange.xMin}
                  max={data.positionRange.xMax}
                  step={1}
                  value={data.textPosition.x}
                  onChange={(e) => data.setTextPosition({ x: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-900"
                />
              </div>

              {/* Text Vertical */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-neutral-600">Vertical</label>
                  <span className="text-xs text-neutral-500">{data.textPosition.y.toFixed(0)}</span>
                </div>
                <input
                  type="range"
                  min={data.positionRange.yMin}
                  max={data.positionRange.yMax}
                  step={1}
                  value={data.textPosition.y}
                  onChange={(e) => data.setTextPosition({ y: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-900"
                />
              </div>

              {/* Text Scale */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-neutral-600">Text Size</label>
                  <span className="text-xs text-neutral-500">{Math.round(data.textScale * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0.2}
                  max={2.5}
                  step={0.01}
                  value={data.textScale}
                  onChange={(e) => data.setTextScale(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-900"
                />
              </div>

              {/* Text Rotation */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-neutral-600">Text Rotation</label>
                  <span className="text-xs text-neutral-500">{data.textRotation}°</span>
                </div>
                <input
                  type="range"
                  min={-180}
                  max={180}
                  step={1}
                  value={data.textRotation}
                  onChange={(e) => data.setTextRotation(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-900"
                />
              </div>
            </>
          )}

          {/* Text-only position controls for non-front placements */}
          {data.text && !data.hasTextPosition && !data.image && (
            <>
              {/* Horizontal Position */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-neutral-600">Horizontal</label>
                  <span className="text-xs text-neutral-500">{data.position.x.toFixed(0)}</span>
                </div>
                <input
                  type="range"
                  min={data.positionRange.xMin}
                  max={data.positionRange.xMax}
                  step={1}
                  value={data.position.x}
                  onChange={(e) => data.setPosition({ x: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-900"
                />
              </div>

              {/* Vertical Position */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-neutral-600">Vertical</label>
                  <span className="text-xs text-neutral-500">{data.position.y.toFixed(0)}</span>
                </div>
                <input
                  type="range"
                  min={data.positionRange.yMin}
                  max={data.positionRange.yMax}
                  step={1}
                  value={data.position.y}
                  onChange={(e) => data.setPosition({ y: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-900"
                />
              </div>

              {/* Scale */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-neutral-600">Size</label>
                  <span className="text-xs text-neutral-500">{Math.round(data.scale * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0.2}
                  max={1.0}
                  step={0.01}
                  value={data.scale}
                  onChange={(e) => data.setScale(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-900"
                />
              </div>

              {/* Rotation */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-neutral-600">Rotation</label>
                  <span className="text-xs text-neutral-500">{data.rotation}°</span>
                </div>
                <input
                  type="range"
                  min={-180}
                  max={180}
                  step={1}
                  value={data.rotation}
                  onChange={(e) => data.setRotation(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-900"
                />
              </div>
            </>
          )}

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

      {/* Library Modal - rendered via portal to avoid parent margin issues */}
      {showLibrary && typeof document !== 'undefined' && createPortal(
        <div
          className="bg-black/70 flex items-center justify-center"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 9999,
          }}
        >
          <div className="bg-white w-[90vw] max-w-4xl max-h-[80vh] rounded-xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="text-xl font-semibold text-neutral-900">
                Select from Image Library
              </h3>
              <button
                onClick={() => setShowLibrary(false)}
                className="text-neutral-400 hover:text-neutral-600 p-2"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {isLoadingLibrary ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-neutral-900"></div>
                </div>
              ) : libraryImages.length === 0 ? (
                <div className="text-center py-24">
                  <svg className="mx-auto h-16 w-16 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <h3 className="mt-4 text-lg font-medium text-neutral-900">No images available</h3>
                  <p className="mt-2 text-base text-neutral-500">
                    Upload your own image instead.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {libraryImages.map((image) => (
                    <button
                      key={image.filename}
                      onClick={() => handleSelectFromLibrary(image.url)}
                      className="relative aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-neutral-900 transition-colors group"
                    >
                      <img
                        src={image.url}
                        alt={image.filename}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 text-white text-sm font-medium bg-black bg-opacity-50 px-2 py-1 rounded">
                          Select
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 px-6 py-5 border-t bg-neutral-50">
              <button
                onClick={() => setShowLibrary(false)}
                className="px-6 py-3 text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-100 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
