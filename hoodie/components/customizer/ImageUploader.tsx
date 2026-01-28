'use client'

import { useRef, useState } from 'react'
import { useCustomizerStore } from '@/lib/store/useCustomizerStore'

export function ImageUploader() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { decalImage, setDecalImage } = useCustomizerStore()
  const [removeBackground, setRemoveBackground] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)

    if (removeBackground) {
      // Process with remove.bg API via our proxy
      setIsProcessing(true)

      const formData = new FormData()
      formData.append('image_file', file)
      formData.append('size', 'auto')

      try {
        const response = await fetch('/services/remove-bg', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error('Background removal failed')
        }

        const blob = await response.blob()
        const imageUrl = URL.createObjectURL(blob)
        setDecalImage(imageUrl)
      } catch (err) {
        console.error('Error removing background:', err)
        setError('Failed to remove background. Using original image.')
        // Fallback to original image
        const reader = new FileReader()
        reader.onload = (event) => {
          const result = event.target?.result as string
          setDecalImage(result)
        }
        reader.readAsDataURL(file)
      } finally {
        setIsProcessing(false)
      }
    } else {
      // Use original image
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        setDecalImage(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUploadClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    fileInputRef.current?.click()
  }

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    setDecalImage(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-700">Upload Your Design</h3>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={isProcessing}
      />

      {/* Background Removal Toggle */}
      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
        <input
          type="checkbox"
          id="removeBg"
          checked={removeBackground}
          onChange={(e) => setRemoveBackground(e.target.checked)}
          disabled={isProcessing}
          className="w-4 h-4 rounded border-gray-300 text-neutral-900 focus:ring-neutral-500"
        />
        <label htmlFor="removeBg" className="text-sm text-gray-600 select-none cursor-pointer">
          Remove background automatically
        </label>
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-500 bg-red-50 p-2 rounded">{error}</p>
      )}

      {/* Processing State */}
      {isProcessing && (
        <div className="flex items-center justify-center gap-2 p-4 bg-blue-50 rounded-lg">
          <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-sm text-blue-600">Removing background...</span>
        </div>
      )}

      {decalImage && !isProcessing ? (
        <div className="space-y-3">
          <div className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={decalImage}
              alt="Uploaded design"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleUploadClick}
              className="flex-1 px-3 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Change Image
            </button>
            <button
              type="button"
              onClick={handleRemoveImage}
              className="flex-1 px-3 py-2 text-sm bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
            >
              Remove
            </button>
          </div>
        </div>
      ) : !isProcessing ? (
        <div
          onClick={handleUploadClick}
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors"
        >
          <div className="text-gray-500">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="mt-2 text-sm">Click to upload your design</p>
            <p className="mt-1 text-xs text-gray-400">PNG, JPG up to 10MB</p>
          </div>
        </div>
      ) : null}
    </div>
  )
}
