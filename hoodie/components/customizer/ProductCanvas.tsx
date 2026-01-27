'use client'

import { Suspense, forwardRef, useRef, useImperativeHandle } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment, OrbitControls } from '@react-three/drei'
import { HoodieModel } from './HoodieModel'
import { TShirtModel } from './TShirtModel'

export type ProductType = 'hoodie' | 'tshirt'

interface ProductCanvasProps {
  productType: ProductType
}

export interface ProductCanvasRef {
  captureScreenshot: () => string | null
  getCanvas: () => HTMLCanvasElement | null
}

function Loader() {
  return (
    <mesh>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial color="#a855f7" wireframe />
    </mesh>
  )
}

export const ProductCanvas = forwardRef<ProductCanvasRef, ProductCanvasProps>(
  function ProductCanvas({ productType }, ref) {
    const canvasContainerRef = useRef<HTMLDivElement>(null)

    useImperativeHandle(ref, () => ({
      captureScreenshot: () => {
        const canvas = canvasContainerRef.current?.querySelector('canvas')
        if (canvas) {
          return canvas.toDataURL('image/png')
        }
        return null
      },
      getCanvas: () => {
        return canvasContainerRef.current?.querySelector('canvas') || null
      },
    }))

    return (
      <div
        ref={canvasContainerRef}
        className="w-full h-full bg-gradient-to-b from-neutral-100 to-neutral-200 rounded-2xl overflow-hidden"
      >
        <Canvas
          camera={{ position: [0, 0, 5], fov: 50 }}
          gl={{ preserveDrawingBuffer: true, antialias: true }}
          dpr={[1, 2]}
        >
          <Suspense fallback={<Loader />}>
            {/* Lighting - balanced for good color and depth */}
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 5, 5]} intensity={1.2} castShadow />
            <directionalLight position={[-3, 3, -3]} intensity={0.4} />
            <directionalLight position={[0, 5, 8]} intensity={0.8} />
            <pointLight position={[0, -5, 5]} intensity={0.3} />

            {/* Conditionally render model based on product type */}
            {productType === 'tshirt' ? <TShirtModel /> : <HoodieModel />}

            {/* Controls */}
            <OrbitControls
              enablePan={false}
              enableZoom={true}
              minDistance={2}
              maxDistance={10}
              autoRotate={false}
              target={[0, 0, 0]}
            />

            {/* Environment for reflections */}
            <Environment preset="city" />
          </Suspense>
        </Canvas>
      </div>
    )
  }
)
