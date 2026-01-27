import React, { Suspense } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Canvas } from '@react-three/fiber/native';
import { OrbitControls } from '@react-three/drei/native';
import { HoodieModel } from './HoodieModel';

// Loading placeholder while model loads
function LoadingMesh() {
  return (
    <mesh rotation={[0, 0, 0]}>
      <boxGeometry args={[1, 1.5, 0.5]} />
      <meshStandardMaterial color="#0891b2" />
    </mesh>
  );
}

interface ProductCanvas3DProps {
  productType?: 'hoodie' | 'tshirt';
}

export function ProductCanvas3D({ productType = 'hoodie' }: ProductCanvas3DProps) {
  return (
    <View style={styles.container}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{ preserveDrawingBuffer: true }}
      >
        <Suspense fallback={<LoadingMesh />}>
          {/* Lighting setup */}
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={1.2} castShadow />
          <directionalLight position={[-3, 3, -3]} intensity={0.4} />
          <directionalLight position={[0, 5, 8]} intensity={0.8} />
          <pointLight position={[0, -5, 5]} intensity={0.3} />

          {/* 3D Hoodie Model with decals */}
          <HoodieModel />

          {/* Touch controls for mobile */}
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minDistance={3}
            maxDistance={8}
            rotateSpeed={0.5}
            zoomSpeed={0.5}
          />
        </Suspense>
      </Canvas>

      {/* Instruction overlay */}
      <View style={styles.overlayContainer}>
        <View style={styles.overlay}>
          <Text style={styles.overlayText}>
            Touch and drag to rotate • Pinch to zoom
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  overlayContainer: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    alignItems: 'center',
    pointerEvents: 'none',
  },
  overlay: {
    borderRadius: 100,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  overlayText: {
    fontSize: 12,
    color: '#fff',
  },
});
