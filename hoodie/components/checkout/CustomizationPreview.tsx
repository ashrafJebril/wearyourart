'use client'

import { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment, OrbitControls } from '@react-three/drei'
import { Suspense } from 'react'
import { CartItem, CustomizationData, ScreenshotUrls } from '@/lib/types'
import { useCustomizerStore } from '@/lib/store/useCustomizerStore'
import { HoodieModel } from '@/components/customizer/HoodieModel'
import { VIEW_ROTATIONS, ViewType } from '@/lib/utils/canvasScreenshot'

interface CustomizationPreviewProps {
  item: CartItem
  onScreenshotsCaptured?: (screenshots: ScreenshotUrls) => void
}

export interface CustomizationPreviewRef {
  captureAllScreenshots: () => Promise<ScreenshotUrls>
}

function Loader() {
  return (
    <mesh>
      <boxGeometry args={[0.3, 0.3, 0.3]} />
      <meshStandardMaterial color="#a855f7" wireframe />
    </mesh>
  )
}

// Component to apply customization data to the store
function CustomizationApplier({ customization, color }: { customization?: CustomizationData; color: string }) {
  const store = useCustomizerStore()

  useEffect(() => {
    // Set the hoodie color
    store.setHoodieColor(color)

    if (!customization) return

    // Apply front customization
    if (customization.decalImage) {
      store.setDecalImage(customization.decalImage)
    }
    if (customization.decalPosition) {
      store.setDecalPosition(customization.decalPosition)
    }
    if (customization.decalScale !== undefined) {
      store.setDecalScale(customization.decalScale)
    }
    if (customization.decalRotation !== undefined) {
      store.setDecalRotation(customization.decalRotation)
    }
    if (customization.textValue) {
      store.setTextValue(customization.textValue)
    }
    if (customization.textFont) {
      store.setTextFont(customization.textFont)
    }
    if (customization.textColor) {
      store.setTextColor(customization.textColor)
    }
    if (customization.textPosition) {
      store.setTextPosition(customization.textPosition)
    }
    if (customization.textScale !== undefined) {
      store.setTextScale(customization.textScale)
    }
    if (customization.textRotation !== undefined) {
      store.setTextRotation(customization.textRotation)
    }

    // Apply back customization
    if (customization.backImage) {
      store.setBackImage(customization.backImage)
    }
    if (customization.backText) {
      store.setBackText(customization.backText)
    }
    if (customization.backTextFont) {
      store.setBackTextFont(customization.backTextFont)
    }
    if (customization.backTextColor) {
      store.setBackTextColor(customization.backTextColor)
    }
    if (customization.backPosition) {
      store.setBackPosition(customization.backPosition)
    }
    if (customization.backScale !== undefined) {
      store.setBackScale(customization.backScale)
    }
    if (customization.backRotation !== undefined) {
      store.setBackRotation(customization.backRotation)
    }

    // Apply left shoulder customization
    if (customization.leftShoulderImage) {
      store.setLeftShoulderImage(customization.leftShoulderImage)
    }
    if (customization.leftShoulderText) {
      store.setLeftShoulderText(customization.leftShoulderText)
    }
    if (customization.leftShoulderTextFont) {
      store.setLeftShoulderTextFont(customization.leftShoulderTextFont)
    }
    if (customization.leftShoulderTextColor) {
      store.setLeftShoulderTextColor(customization.leftShoulderTextColor)
    }
    if (customization.leftShoulderPosition) {
      store.setLeftShoulderPosition(customization.leftShoulderPosition)
    }
    if (customization.leftShoulderScale !== undefined) {
      store.setLeftShoulderScale(customization.leftShoulderScale)
    }
    if (customization.leftShoulderRotation !== undefined) {
      store.setLeftShoulderRotation(customization.leftShoulderRotation)
    }

    // Apply right shoulder customization
    if (customization.rightShoulderImage) {
      store.setRightShoulderImage(customization.rightShoulderImage)
    }
    if (customization.rightShoulderText) {
      store.setRightShoulderText(customization.rightShoulderText)
    }
    if (customization.rightShoulderTextFont) {
      store.setRightShoulderTextFont(customization.rightShoulderTextFont)
    }
    if (customization.rightShoulderTextColor) {
      store.setRightShoulderTextColor(customization.rightShoulderTextColor)
    }
    if (customization.rightShoulderPosition) {
      store.setRightShoulderPosition(customization.rightShoulderPosition)
    }
    if (customization.rightShoulderScale !== undefined) {
      store.setRightShoulderScale(customization.rightShoulderScale)
    }
    if (customization.rightShoulderRotation !== undefined) {
      store.setRightShoulderRotation(customization.rightShoulderRotation)
    }

    // Cleanup on unmount
    return () => {
      store.resetCustomizer()
    }
  }, [customization, color])

  return null
}

export const CustomizationPreview = forwardRef<CustomizationPreviewRef, CustomizationPreviewProps>(
  function CustomizationPreview({ item, onScreenshotsCaptured }, ref) {
    const canvasContainerRef = useRef<HTMLDivElement>(null)
    const [activeView, setActiveView] = useState<ViewType>('front')
    const [isCapturing, setIsCapturing] = useState(false)
    const setTargetRotation = useCustomizerStore((state) => state.setActivePlacement)

    const views: { id: ViewType; label: string }[] = [
      { id: 'front', label: 'Front' },
      { id: 'back', label: 'Back' },
      { id: 'left', label: 'Left' },
      { id: 'right', label: 'Right' },
    ]

    const handleViewChange = (view: ViewType) => {
      setActiveView(view)
      // Map view to placement for rotation
      const placementMap: Record<ViewType, 'front' | 'back' | 'leftShoulder' | 'rightShoulder'> = {
        front: 'front',
        back: 'back',
        left: 'leftShoulder',
        right: 'rightShoulder',
      }
      setTargetRotation(placementMap[view])
    }

    const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

    const captureAllScreenshots = async (): Promise<ScreenshotUrls> => {
      setIsCapturing(true)
      const screenshots: Partial<ScreenshotUrls> = {}
      const canvas = canvasContainerRef.current?.querySelector('canvas')

      if (!canvas) {
        setIsCapturing(false)
        throw new Error('Canvas not found')
      }

      const viewsToCapture: ViewType[] = ['front', 'back', 'left', 'right']
      const placementMap: Record<ViewType, 'front' | 'back' | 'leftShoulder' | 'rightShoulder'> = {
        front: 'front',
        back: 'back',
        left: 'leftShoulder',
        right: 'rightShoulder',
      }

      for (const view of viewsToCapture) {
        // Set rotation
        setTargetRotation(placementMap[view])
        setActiveView(view)

        // Wait for animation to complete
        await wait(600)

        // Capture screenshot
        screenshots[view] = canvas.toDataURL('image/png')
      }

      setIsCapturing(false)

      const result = screenshots as ScreenshotUrls
      if (onScreenshotsCaptured) {
        onScreenshotsCaptured(result)
      }

      return result
    }

    useImperativeHandle(ref, () => ({
      captureAllScreenshots,
    }))

    // Check if item has customization
    const hasCustomization = !!(
      item.customization &&
      (item.customization.decalImage ||
        item.customization.textValue ||
        item.customization.backImage ||
        item.customization.backText ||
        item.customization.leftShoulderImage ||
        item.customization.leftShoulderText ||
        item.customization.rightShoulderImage ||
        item.customization.rightShoulderText)
    )

    if (!hasCustomization) {
      return null
    }

    return (
      <div className="border border-neutral-200 rounded-lg p-4 bg-white">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-sm">Custom Design Preview</h4>
          {isCapturing && (
            <span className="text-xs text-neutral-500 animate-pulse">
              Capturing screenshots...
            </span>
          )}
        </div>

        {/* View selector tabs */}
        <div className="flex gap-1 mb-3">
          {views.map((view) => (
            <button
              key={view.id}
              onClick={() => handleViewChange(view.id)}
              disabled={isCapturing}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                activeView === view.id
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              } ${isCapturing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {view.label}
            </button>
          ))}
        </div>

        {/* 3D Preview */}
        <div
          ref={canvasContainerRef}
          className="w-full aspect-square bg-gradient-to-b from-neutral-100 to-neutral-200 rounded-lg overflow-hidden"
        >
          <Canvas
            camera={{ position: [0, 0, 5], fov: 50 }}
            gl={{ preserveDrawingBuffer: true, antialias: true }}
            dpr={[1, 2]}
          >
            <Suspense fallback={<Loader />}>
              {/* Apply customization data */}
              <CustomizationApplier
                customization={item.customization}
                color={item.color.hex}
              />

              {/* Lighting */}
              <ambientLight intensity={0.6} />
              <directionalLight position={[5, 5, 5]} intensity={1.2} castShadow />
              <directionalLight position={[-3, 3, -3]} intensity={0.4} />
              <directionalLight position={[0, 5, 8]} intensity={0.8} />
              <pointLight position={[0, -5, 5]} intensity={0.3} />

              {/* Model */}
              <HoodieModel />

              {/* Controls */}
              <OrbitControls
                enablePan={false}
                enableZoom={true}
                minDistance={3}
                maxDistance={8}
                autoRotate={false}
                target={[0, 0, 0]}
              />

              {/* Environment */}
              <Environment preset="city" />
            </Suspense>
          </Canvas>
        </div>

        {/* Customization summary */}
        <div className="mt-3 text-xs text-neutral-500">
          <p className="font-medium text-neutral-700 mb-1">Customizations:</p>
          <ul className="space-y-0.5">
            {(item.customization?.decalImage || item.customization?.textValue) && (
              <li>Front: {item.customization?.decalImage ? 'Image' : ''}{item.customization?.decalImage && item.customization?.textValue ? ' + ' : ''}{item.customization?.textValue ? `Text "${item.customization.textValue}"` : ''}</li>
            )}
            {(item.customization?.backImage || item.customization?.backText) && (
              <li>Back: {item.customization?.backImage ? 'Image' : ''}{item.customization?.backImage && item.customization?.backText ? ' + ' : ''}{item.customization?.backText ? `Text "${item.customization.backText}"` : ''}</li>
            )}
            {(item.customization?.leftShoulderImage || item.customization?.leftShoulderText) && (
              <li>Left Shoulder: {item.customization?.leftShoulderImage ? 'Image' : ''}{item.customization?.leftShoulderImage && item.customization?.leftShoulderText ? ' + ' : ''}{item.customization?.leftShoulderText ? `Text "${item.customization.leftShoulderText}"` : ''}</li>
            )}
            {(item.customization?.rightShoulderImage || item.customization?.rightShoulderText) && (
              <li>Right Shoulder: {item.customization?.rightShoulderImage ? 'Image' : ''}{item.customization?.rightShoulderImage && item.customization?.rightShoulderText ? ' + ' : ''}{item.customization?.rightShoulderText ? `Text "${item.customization.rightShoulderText}"` : ''}</li>
            )}
          </ul>
        </div>
      </div>
    )
  }
)
