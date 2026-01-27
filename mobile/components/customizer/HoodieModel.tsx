import React, { useRef, useEffect, useMemo, useState, useCallback } from 'react';
import { Platform } from 'react-native';
import { Decal } from '@react-three/drei/native';
import { useFrame, useLoader } from '@react-three/fiber/native';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { useCustomizerStore } from '@/lib/stores/useCustomizerStore';

// Map font names to Google Fonts family names
const GOOGLE_FONTS_MAP: Record<string, string> = {
  'Roboto': 'Roboto',
  'Open Sans': 'Open+Sans',
  'Montserrat': 'Montserrat',
  'Playfair Display': 'Playfair+Display',
  'Oswald': 'Oswald',
  'Pacifico': 'Pacifico',
  'Bebas Neue': 'Bebas+Neue',
  'Dancing Script': 'Dancing+Script',
  'Cairo': 'Cairo',
  'Tajawal': 'Tajawal',
  'Amiri': 'Amiri',
  'Noto Naskh Arabic': 'Noto+Naskh+Arabic',
  'Scheherazade New': 'Scheherazade+New',
  'Aref Ruqaa': 'Aref+Ruqaa',
  'Lateef': 'Lateef',
  'Harmattan': 'Harmattan',
};

// Track loaded fonts and their loading promises
const loadedFonts = new Set<string>();
const fontLoadingPromises = new Map<string, Promise<void>>();

// Load Google Font dynamically
async function loadGoogleFont(fontName: string): Promise<void> {
  // If already loaded, return immediately
  if (loadedFonts.has(fontName)) {
    return;
  }

  // If currently loading, wait for that promise
  const existingPromise = fontLoadingPromises.get(fontName);
  if (existingPromise) {
    return existingPromise;
  }

  const googleFontName = GOOGLE_FONTS_MAP[fontName];
  if (!googleFontName) {
    return;
  }

  // Check if we're in a browser environment
  if (typeof document === 'undefined') {
    return;
  }

  // Create the loading promise
  const loadingPromise = (async () => {
    // Check if font link already exists
    let link = document.querySelector(`link[href*="family=${googleFontName}"]`) as HTMLLinkElement | null;

    if (!link) {
      // Create and inject Google Fonts link
      link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${googleFontName}:wght@400;700&display=swap`;
      document.head.appendChild(link);

      // Wait for the stylesheet to load
      await new Promise<void>((resolve) => {
        link!.onload = () => resolve();
        link!.onerror = () => resolve(); // Continue even on error
        // Timeout fallback
        setTimeout(resolve, 2000);
      });
    }

    // Now wait for the font to actually be ready
    if ('fonts' in document) {
      try {
        // Try to load the font with different weights
        await Promise.race([
          document.fonts.load(`bold 48px "${fontName}"`),
          document.fonts.load(`700 48px "${fontName}"`),
          new Promise(resolve => setTimeout(resolve, 1500))
        ]);

        // Additional wait to ensure font is rendered properly
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (e) {
        console.warn(`Font loading failed for ${fontName}:`, e);
      }
    } else {
      // Fallback: wait for font to load
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    loadedFonts.add(fontName);
  })();

  fontLoadingPromises.set(fontName, loadingPromise);

  try {
    await loadingPromise;
  } finally {
    fontLoadingPromises.delete(fontName);
  }
}

// Function to generate text texture using canvas
function createTextTexture(
  text: string,
  font: string,
  color: string,
  canvasSize: number = 512
): THREE.Texture | null {
  if (!text || text.trim() === '') {
    return null;
  }

  // Create canvas element
  const canvas = document.createElement('canvas');
  canvas.width = canvasSize;
  canvas.height = canvasSize;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return null;
  }

  // Clear canvas with transparent background
  ctx.clearRect(0, 0, canvasSize, canvasSize);

  // Set text properties
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Calculate font size to fit text width
  let fontSize = 80;
  ctx.font = `bold ${fontSize}px "${font}", sans-serif`;

  // Measure text and adjust font size if needed
  let textMetrics = ctx.measureText(text);
  const maxWidth = canvasSize * 0.85;

  while (textMetrics.width > maxWidth && fontSize > 20) {
    fontSize -= 4;
    ctx.font = `bold ${fontSize}px "${font}", sans-serif`;
    textMetrics = ctx.measureText(text);
  }

  // Draw text in center
  ctx.fillText(text, canvasSize / 2, canvasSize / 2);

  // Create texture from canvas
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;

  return texture;

}

// Check if a font is available
function isFontAvailable(fontName: string): boolean {
  if (typeof document === 'undefined') return false;

  // Create a test canvas
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return false;

  const testText = 'abcdefghijklmnopqrstuvwxyz0123456789';

  // Measure with fallback font
  ctx.font = '72px monospace';
  const fallbackWidth = ctx.measureText(testText).width;

  // Measure with the target font
  ctx.font = `72px "${fontName}", monospace`;
  const fontWidth = ctx.measureText(testText).width;

  // If widths are different, font is loaded
  return fontWidth !== fallbackWidth;
}

// Async version that loads font first
async function createTextTextureAsync(
  text: string,
  font: string,
  color: string,
  canvasSize: number = 512
): Promise<THREE.Texture | null> {
  if (!text || text.trim() === '') {
    return null;
  }

  // Load the font first
  await loadGoogleFont(font);

  // Double-check font is available with polling
  let attempts = 0;
  while (!isFontAvailable(font) && attempts < 20) {
    await new Promise(resolve => setTimeout(resolve, 100));
    attempts++;
  }

  // Then create the texture
  return createTextTexture(text, font, color, canvasSize);
}

// Model URL for web platform
const MODEL_URL = '/assets/assets/models/hoodie.glb';

// Helper to calculate decal transform for front placement
function useDecalTransform(
  geometry: THREE.BufferGeometry | null,
  decalPosition: { x: number; y: number },
  decalScale: number,
  decalRotation: number,
  zOffset: number = 0
) {
  return useMemo(() => {
    if (!geometry) {
      return {
        position: [0, 0, 0] as [number, number, number],
        rotation: [0, 0, 0] as [number, number, number],
        scale: [1, 1, 1] as [number, number, number],
      };
    }

    geometry.computeBoundingBox();
    const box = geometry.boundingBox!;
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    const posX = center.x + decalPosition.x - 16;
    const posY = center.y + decalPosition.y + 70;
    const posZ = box.max.z - 100 + zOffset;

    const decalSize = decalScale * Math.min(size.x, size.y) * 0.3;

    return {
      position: [posX, posY, posZ] as [number, number, number],
      rotation: [0, 0, (decalRotation * Math.PI) / 180] as [number, number, number],
      scale: [decalSize, decalSize, decalSize] as [number, number, number],
    };
  }, [geometry, decalPosition.x, decalPosition.y, decalScale, decalRotation, zOffset]);
}

// Helper to calculate back decal transform
function useBackDecalTransform(
  geometry: THREE.BufferGeometry | null,
  decalPosition: { x: number; y: number },
  decalScale: number,
  decalRotation: number,
  zOffset: number = 0
) {
  return useMemo(() => {
    if (!geometry) {
      return {
        position: [0, 0, 0] as [number, number, number],
        rotation: [0, Math.PI, 0] as [number, number, number],
        scale: [1, 1, 1] as [number, number, number],
      };
    }

    geometry.computeBoundingBox();
    const box = geometry.boundingBox!;
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    const posX = center.x + decalPosition.x - 16;
    const posY = center.y + decalPosition.y + 70;
    const posZ = -(box.max.z - 50) - zOffset;

    const decalSize = decalScale * Math.min(size.x, size.y) * 0.3;

    return {
      position: [posX, posY, posZ] as [number, number, number],
      rotation: [0, Math.PI, (decalRotation * Math.PI) / 180] as [number, number, number],
      scale: [decalSize, decalSize, decalSize] as [number, number, number],
    };
  }, [geometry, decalPosition.x, decalPosition.y, decalScale, decalRotation, zOffset]);
}

// Helper to calculate left shoulder decal transform
function useLeftShoulderDecalTransform(
  geometry: THREE.BufferGeometry | null,
  decalPosition: { x: number; y: number },
  decalScale: number,
  decalRotation: number
) {
  return useMemo(() => {
    if (!geometry) {
      return {
        position: [0, 0, 0] as [number, number, number],
        rotation: [0, Math.PI / 2, 0] as [number, number, number],
        scale: [1, 1, 1] as [number, number, number],
      };
    }

    geometry.computeBoundingBox();
    const box = geometry.boundingBox!;
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    const shoulderXOffset = -70;
    const shoulderYOffset = 40;

    const posX = center.x + decalPosition.x - 180 + shoulderXOffset;
    const posY = center.y + decalPosition.y - 10 + shoulderYOffset;
    const posZ = box.max.z - 280;

    const decalSize = decalScale * Math.min(size.x, size.y) * 0.2;

    return {
      position: [posX, posY, posZ] as [number, number, number],
      rotation: [0, Math.PI / 2, (decalRotation * Math.PI) / 180] as [number, number, number],
      scale: [decalSize, decalSize, decalSize] as [number, number, number],
    };
  }, [geometry, decalPosition.x, decalPosition.y, decalScale, decalRotation]);
}

// Helper to calculate right shoulder decal transform
function useRightShoulderDecalTransform(
  geometry: THREE.BufferGeometry | null,
  decalPosition: { x: number; y: number },
  decalScale: number,
  decalRotation: number
) {
  return useMemo(() => {
    if (!geometry) {
      return {
        position: [0, 0, 0] as [number, number, number],
        rotation: [0, -Math.PI / 2, 0] as [number, number, number],
        scale: [1, 1, 1] as [number, number, number],
      };
    }

    geometry.computeBoundingBox();
    const box = geometry.boundingBox!;
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    const shoulderXOffset = 70;
    const shoulderYOffset = 40;

    const posX = center.x + decalPosition.x + 165 + shoulderXOffset;
    const posY = center.y + decalPosition.y + 55 + shoulderYOffset;
    const posZ = box.max.z - 220;

    const decalSize = decalScale * Math.min(size.x, size.y) * 0.2;

    return {
      position: [posX, posY, posZ] as [number, number, number],
      rotation: [0, -Math.PI / 2, (decalRotation * Math.PI) / 180] as [number, number, number],
      scale: [decalSize, decalSize, decalSize] as [number, number, number],
    };
  }, [geometry, decalPosition.x, decalPosition.y, decalScale, decalRotation]);
}

// Component to render hoodie with all decals
function HoodieWithDecals({
  geometry,
  material,
  decalTexture,
  decalPosition,
  decalScale,
  decalRotation,
  frontTextTexture,
  frontTextPosition,
  frontTextScale,
  frontTextRotation,
  backImageTexture,
  backPosition,
  backScale,
  backRotation,
  backTextTexture,
  backTextPosition,
  backTextScale,
  backTextRotation,
  leftShoulderImageTexture,
  leftShoulderPosition,
  leftShoulderScale,
  leftShoulderRotation,
  leftShoulderTextTexture,
  rightShoulderImageTexture,
  rightShoulderPosition,
  rightShoulderScale,
  rightShoulderRotation,
  rightShoulderTextTexture,
}: {
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  decalTexture: THREE.Texture | null;
  decalPosition: { x: number; y: number };
  decalScale: number;
  decalRotation: number;
  frontTextTexture: THREE.Texture | null;
  frontTextPosition: { x: number; y: number };
  frontTextScale: number;
  frontTextRotation: number;
  backImageTexture: THREE.Texture | null;
  backPosition: { x: number; y: number };
  backScale: number;
  backRotation: number;
  backTextTexture: THREE.Texture | null;
  backTextPosition: { x: number; y: number };
  backTextScale: number;
  backTextRotation: number;
  leftShoulderImageTexture: THREE.Texture | null;
  leftShoulderPosition: { x: number; y: number };
  leftShoulderScale: number;
  leftShoulderRotation: number;
  leftShoulderTextTexture: THREE.Texture | null;
  rightShoulderImageTexture: THREE.Texture | null;
  rightShoulderPosition: { x: number; y: number };
  rightShoulderScale: number;
  rightShoulderRotation: number;
  rightShoulderTextTexture: THREE.Texture | null;
}) {
  const meshRef = useRef<THREE.Mesh>(null!);

  // Calculate transforms for each placement - images
  const frontTransform = useDecalTransform(geometry, decalPosition, decalScale, decalRotation, 0);
  const backTransform = useBackDecalTransform(geometry, backPosition, backScale, backRotation, 0);
  const leftShoulderTransform = useLeftShoulderDecalTransform(
    geometry,
    leftShoulderPosition,
    leftShoulderScale,
    leftShoulderRotation
  );
  const rightShoulderTransform = useRightShoulderDecalTransform(
    geometry,
    rightShoulderPosition,
    rightShoulderScale,
    rightShoulderRotation
  );

  // Calculate transforms for text decals (slightly in front of images)
  const frontTextTransform = useDecalTransform(geometry, frontTextPosition, frontTextScale, frontTextRotation, 5);
  const backTextTransform = useBackDecalTransform(geometry, backTextPosition, backTextScale, backTextRotation, 5);
  const leftShoulderTextTransform = useLeftShoulderDecalTransform(
    geometry,
    leftShoulderPosition,
    leftShoulderScale,
    leftShoulderRotation
  );
  const rightShoulderTextTransform = useRightShoulderDecalTransform(
    geometry,
    rightShoulderPosition,
    rightShoulderScale,
    rightShoulderRotation
  );

  return (
    <mesh ref={meshRef} geometry={geometry} material={material}>
      {/* Front image decal */}
      {decalTexture && (
        <Decal
          position={frontTransform.position}
          rotation={frontTransform.rotation}
          scale={frontTransform.scale}
          map={decalTexture}
        />
      )}
      {/* Front text decal */}
      {frontTextTexture && (
        <Decal
          position={frontTextTransform.position}
          rotation={frontTextTransform.rotation}
          scale={frontTextTransform.scale}
          map={frontTextTexture}
        />
      )}
      {/* Back image decal */}
      {backImageTexture && (
        <Decal
          position={backTransform.position}
          rotation={backTransform.rotation}
          scale={backTransform.scale}
          map={backImageTexture}
        />
      )}
      {/* Back text decal */}
      {backTextTexture && (
        <Decal
          position={backTextTransform.position}
          rotation={backTextTransform.rotation}
          scale={backTextTransform.scale}
          map={backTextTexture}
        />
      )}
      {/* Left shoulder image decal */}
      {leftShoulderImageTexture && (
        <Decal
          position={leftShoulderTransform.position}
          rotation={leftShoulderTransform.rotation}
          scale={leftShoulderTransform.scale}
          map={leftShoulderImageTexture}
        />
      )}
      {/* Left shoulder text decal */}
      {leftShoulderTextTexture && (
        <Decal
          position={leftShoulderTextTransform.position}
          rotation={leftShoulderTextTransform.rotation}
          scale={leftShoulderTextTransform.scale}
          map={leftShoulderTextTexture}
        />
      )}
      {/* Right shoulder image decal */}
      {rightShoulderImageTexture && (
        <Decal
          position={rightShoulderTransform.position}
          rotation={rightShoulderTransform.rotation}
          scale={rightShoulderTransform.scale}
          map={rightShoulderImageTexture}
        />
      )}
      {/* Right shoulder text decal */}
      {rightShoulderTextTexture && (
        <Decal
          position={rightShoulderTextTransform.position}
          rotation={rightShoulderTextTransform.rotation}
          scale={rightShoulderTextTransform.scale}
          map={rightShoulderTextTexture}
        />
      )}
    </mesh>
  );
}

export function HoodieModel() {
  const groupRef = useRef<THREE.Group>(null);
  const [decalTexture, setDecalTexture] = useState<THREE.Texture | null>(null);
  const [backImageTexture, setBackImageTexture] = useState<THREE.Texture | null>(null);
  const [leftShoulderImageTexture, setLeftShoulderImageTexture] = useState<THREE.Texture | null>(null);
  const [rightShoulderImageTexture, setRightShoulderImageTexture] = useState<THREE.Texture | null>(null);

  // Text textures
  const [frontTextTexture, setFrontTextTexture] = useState<THREE.Texture | null>(null);
  const [backTextTexture, setBackTextTexture] = useState<THREE.Texture | null>(null);
  const [leftShoulderTextTexture, setLeftShoulderTextTexture] = useState<THREE.Texture | null>(null);
  const [rightShoulderTextTexture, setRightShoulderTextTexture] = useState<THREE.Texture | null>(null);

  const {
    hoodieColor,
    targetRotation,
    decalImage,
    decalPosition,
    decalScale,
    decalRotation,
    // Front text
    textValue,
    textFont,
    textColor,
    textPosition,
    textScale,
    textRotation,
    // Back
    backImage,
    backPosition,
    backScale,
    backRotation,
    backText,
    backTextFont,
    backTextColor,
    backTextPosition,
    backTextScale,
    backTextRotation,
    // Left shoulder
    leftShoulderImage,
    leftShoulderPosition,
    leftShoulderScale,
    leftShoulderRotation,
    leftShoulderText,
    leftShoulderTextFont,
    leftShoulderTextColor,
    // Right shoulder
    rightShoulderImage,
    rightShoulderPosition,
    rightShoulderScale,
    rightShoulderRotation,
    rightShoulderText,
    rightShoulderTextFont,
    rightShoulderTextColor,
  } = useCustomizerStore();

  // Load hoodie model using GLTFLoader directly
  const gltf = useLoader(GLTFLoader, MODEL_URL);
  const scene = gltf.scene;

  // Extract meshes with their geometries and materials
  const meshes = useMemo(() => {
    const result: {
      geometry: THREE.BufferGeometry;
      material: THREE.Material;
      name: string;
    }[] = [];

    // Clone scene and center it
    const cloned = scene.clone(true);
    const box = new THREE.Box3().setFromObject(cloned);
    const center = new THREE.Vector3();
    box.getCenter(center);

    cloned.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // Clone geometry and apply parent transforms
        const geo = child.geometry.clone();

        // Apply the mesh's world matrix to the geometry
        child.updateWorldMatrix(true, false);
        geo.applyMatrix4(child.matrixWorld);

        // Center the geometry
        geo.translate(-center.x, -center.y, -center.z);

        // Create a new MeshStandardMaterial with fabric-like properties
        const mat = new THREE.MeshStandardMaterial({
          color: '#1a1a1a',
          roughness: 0.85,
          metalness: 0,
          side: THREE.DoubleSide,
        });

        result.push({ geometry: geo, material: mat, name: child.name });
      }
    });

    return result;
  }, [scene]);

  // Find the main body mesh (largest)
  const bodyMesh = useMemo(() => {
    let largest = meshes[0];
    let largestArea = 0;

    meshes.forEach((m) => {
      m.geometry.computeBoundingBox();
      const box = m.geometry.boundingBox!;
      const size = new THREE.Vector3();
      box.getSize(size);
      const area = size.x * size.y + size.y * size.z + size.x * size.z;

      if (area > largestArea) {
        largestArea = area;
        largest = m;
      }
    });

    return largest;
  }, [meshes]);

  // Load front decal texture
  useEffect(() => {
    if (!decalImage) {
      setDecalTexture(null);
      return;
    }

    const loader = new THREE.TextureLoader();
    loader.load(
      decalImage,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = true;
        setDecalTexture(texture);
      },
      undefined,
      (err) => console.error('Front texture load error:', err)
    );
  }, [decalImage]);

  // Load back image texture
  useEffect(() => {
    if (!backImage) {
      setBackImageTexture(null);
      return;
    }

    const loader = new THREE.TextureLoader();
    loader.load(
      backImage,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = true;
        setBackImageTexture(texture);
      },
      undefined,
      (err) => console.error('Back texture load error:', err)
    );
  }, [backImage]);

  // Load left shoulder image texture
  useEffect(() => {
    if (!leftShoulderImage) {
      setLeftShoulderImageTexture(null);
      return;
    }

    const loader = new THREE.TextureLoader();
    loader.load(
      leftShoulderImage,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = true;
        texture.wrapS = THREE.RepeatWrapping;
        texture.repeat.x = -1;
        texture.needsUpdate = true;
        setLeftShoulderImageTexture(texture);
      },
      undefined,
      (err) => console.error('Left shoulder texture load error:', err)
    );
  }, [leftShoulderImage]);

  // Load right shoulder image texture
  useEffect(() => {
    if (!rightShoulderImage) {
      setRightShoulderImageTexture(null);
      return;
    }

    const loader = new THREE.TextureLoader();
    loader.load(
      rightShoulderImage,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = true;
        texture.wrapS = THREE.RepeatWrapping;
        texture.repeat.x = -1;
        texture.needsUpdate = true;
        setRightShoulderImageTexture(texture);
      },
      undefined,
      (err) => console.error('Right shoulder texture load error:', err)
    );
  }, [rightShoulderImage]);

  // Generate front text texture
  useEffect(() => {
    if (!textValue || textValue.trim() === '') {
      setFrontTextTexture((prev) => {
        if (prev) prev.dispose();
        return null;
      });
      return;
    }

    let cancelled = false;

    createTextTextureAsync(textValue, textFont, textColor).then((texture) => {
      if (!cancelled && texture) {
        setFrontTextTexture((prev) => {
          if (prev) prev.dispose();
          return texture;
        });
      } else if (texture) {
        texture.dispose();
      }
    });

    return () => {
      cancelled = true;
    };
  }, [textValue, textFont, textColor]);

  // Generate back text texture
  useEffect(() => {
    if (!backText || backText.trim() === '') {
      setBackTextTexture((prev) => {
        if (prev) prev.dispose();
        return null;
      });
      return;
    }

    let cancelled = false;

    createTextTextureAsync(backText, backTextFont, backTextColor).then((texture) => {
      if (!cancelled && texture) {
        setBackTextTexture((prev) => {
          if (prev) prev.dispose();
          return texture;
        });
      } else if (texture) {
        texture.dispose();
      }
    });

    return () => {
      cancelled = true;
    };
  }, [backText, backTextFont, backTextColor]);

  // Generate left shoulder text texture
  useEffect(() => {
    if (!leftShoulderText || leftShoulderText.trim() === '') {
      setLeftShoulderTextTexture((prev) => {
        if (prev) prev.dispose();
        return null;
      });
      return;
    }

    let cancelled = false;

    createTextTextureAsync(leftShoulderText, leftShoulderTextFont, leftShoulderTextColor).then((texture) => {
      if (!cancelled && texture) {
        setLeftShoulderTextTexture((prev) => {
          if (prev) prev.dispose();
          return texture;
        });
      } else if (texture) {
        texture.dispose();
      }
    });

    return () => {
      cancelled = true;
    };
  }, [leftShoulderText, leftShoulderTextFont, leftShoulderTextColor]);

  // Generate right shoulder text texture
  useEffect(() => {
    if (!rightShoulderText || rightShoulderText.trim() === '') {
      setRightShoulderTextTexture((prev) => {
        if (prev) prev.dispose();
        return null;
      });
      return;
    }

    let cancelled = false;

    createTextTextureAsync(rightShoulderText, rightShoulderTextFont, rightShoulderTextColor).then((texture) => {
      if (!cancelled && texture) {
        setRightShoulderTextTexture((prev) => {
          if (prev) prev.dispose();
          return texture;
        });
      } else if (texture) {
        texture.dispose();
      }
    });

    return () => {
      cancelled = true;
    };
  }, [rightShoulderText, rightShoulderTextFont, rightShoulderTextColor]);

  // Update hoodie colors
  useEffect(() => {
    meshes.forEach((m) => {
      if (m.material instanceof THREE.MeshStandardMaterial) {
        m.material.color = new THREE.Color(hoodieColor);
        m.material.roughness = 0.85;
        m.material.metalness = 0;
        m.material.needsUpdate = true;
      }
    });
  }, [meshes, hoodieColor]);

  // Rotation animation
  const isTransitioning = useRef(false);
  const lastTargetRotation = useRef(targetRotation);
  const isInitialized = useRef(false);

  useFrame((state) => {
    if (groupRef.current) {
      // Initialize rotation on first frame
      if (!isInitialized.current) {
        groupRef.current.rotation.y = targetRotation;
        isInitialized.current = true;
      }

      // Detect when target changes (tab switch)
      if (lastTargetRotation.current !== targetRotation) {
        isTransitioning.current = true;
        lastTargetRotation.current = targetRotation;
      }

      // Gentle swaying motion
      const swayAmount = 0.08;
      const swaySpeed = 0.3;
      const sway = Math.sin(state.clock.elapsedTime * swaySpeed) * swayAmount;

      if (isTransitioning.current) {
        // Smoothly rotate towards target when tab changes
        const currentY = groupRef.current.rotation.y;
        let diff = targetRotation - currentY;

        // Normalize for shortest path
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;

        if (Math.abs(diff) > 0.01) {
          groupRef.current.rotation.y += diff * 0.1;
        } else {
          groupRef.current.rotation.y = targetRotation;
          isTransitioning.current = false;
        }
      } else {
        // Normal swaying around the target rotation
        groupRef.current.rotation.y = targetRotation + sway;
      }
    }
  });

  return (
    <group ref={groupRef} scale={0.005} rotation={[0, 0, 0]}>
      {/* Render all meshes except body */}
      {meshes
        .filter((m) => m !== bodyMesh)
        .map((m, i) => (
          <mesh key={i} geometry={m.geometry} material={m.material} />
        ))}

      {/* Render body mesh with decals */}
      {bodyMesh && (
        <HoodieWithDecals
          geometry={bodyMesh.geometry}
          material={bodyMesh.material}
          decalTexture={decalTexture}
          decalPosition={decalPosition}
          decalScale={decalScale}
          decalRotation={decalRotation}
          frontTextTexture={frontTextTexture}
          frontTextPosition={textPosition}
          frontTextScale={textScale}
          frontTextRotation={textRotation}
          backImageTexture={backImageTexture}
          backPosition={backPosition}
          backScale={backScale}
          backRotation={backRotation}
          backTextTexture={backTextTexture}
          backTextPosition={backTextPosition}
          backTextScale={backTextScale}
          backTextRotation={backTextRotation}
          leftShoulderImageTexture={leftShoulderImageTexture}
          leftShoulderPosition={leftShoulderPosition}
          leftShoulderScale={leftShoulderScale}
          leftShoulderRotation={leftShoulderRotation}
          leftShoulderTextTexture={leftShoulderTextTexture}
          rightShoulderImageTexture={rightShoulderImageTexture}
          rightShoulderPosition={rightShoulderPosition}
          rightShoulderScale={rightShoulderScale}
          rightShoulderRotation={rightShoulderRotation}
          rightShoulderTextTexture={rightShoulderTextTexture}
        />
      )}
    </group>
  );
}
