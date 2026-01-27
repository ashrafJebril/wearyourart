"use client";

import { useRef, useEffect, useMemo, useState } from "react";
import { useGLTF, Decal } from "@react-three/drei";
import { useCustomizerStore } from "@/lib/store/useCustomizerStore";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

// T-shirt specific decal transform for front placement
function useTShirtDecalTransform(
  geometry: THREE.BufferGeometry,
  decalPosition: { x: number; y: number },
  decalScale: number,
  decalRotation: number,
  zOffset: number = 0,
) {
  return useMemo(() => {
    geometry.computeBoundingBox();
    const box = geometry.boundingBox!;
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    // T-shirt front positioning - geometry is already centered
    // Position decal on front chest area
    const posX = center.x + decalPosition.x * size.x * 0.005;
    const posY = center.y + decalPosition.y * size.y * 0.005 + size.y * 0.1;
    // Position directly at the front surface and project inward
    const posZ = box.max.z + zOffset;

    // Scale relative to model size
    const decalSize = decalScale * size.y * 0.5;
    // Depth should be enough to project onto the surface but not go through to the back
    // The mesh thickness is about size.z, so use half of that
    const decalDepth = size.z * 5;

    console.log("T-Shirt front decal transform:", {
      posX,
      posY,
      posZ,
      decalSize,
      decalDepth,
      size,
      center,
      box,
    });

    return {
      position: [posX, posY, posZ] as [number, number, number],
      rotation: [0, 0, (decalRotation * Math.PI) / 180] as [
        number,
        number,
        number,
      ],
      scale: [decalSize, decalSize, decalDepth] as [number, number, number],
    };
  }, [
    geometry,
    decalPosition.x,
    decalPosition.y,
    decalScale,
    decalRotation,
    zOffset,
  ]);
}

// T-shirt specific decal transform for back placement
function useTShirtBackDecalTransform(
  geometry: THREE.BufferGeometry,
  decalPosition: { x: number; y: number },
  decalScale: number,
  decalRotation: number,
  zOffset: number = 0,
) {
  return useMemo(() => {
    geometry.computeBoundingBox();
    const box = geometry.boundingBox!;
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    // T-shirt back positioning - geometry is already centered
    const posX = center.x + decalPosition.x * size.x * 0.005;
    const posY = center.y + decalPosition.y * size.y * 0.005 + size.y * 0.1;
    // Position at the back surface - decal projects onto mesh
    const posZ = box.min.z * 0.7 - zOffset;

    // Scale relative to model size
    const decalSize = decalScale * size.y * 0.3;
    // Use a very small depth to prevent decal from projecting through the thin T-shirt mesh
    const decalDepth = decalSize * 0.05;

    return {
      position: [posX, posY, posZ] as [number, number, number],
      rotation: [0, Math.PI, (decalRotation * Math.PI) / 180] as [
        number,
        number,
        number,
      ],
      scale: [decalSize, decalSize, decalDepth] as [number, number, number],
    };
  }, [
    geometry,
    decalPosition.x,
    decalPosition.y,
    decalScale,
    decalRotation,
    zOffset,
  ]);
}

// T-shirt left sleeve decal transform
// Left sleeve = viewer's left when looking at shirt from front = positive X side
function useTShirtLeftSleeveDecalTransform(
  geometry: THREE.BufferGeometry,
  decalPosition: { x: number; y: number },
  decalScale: number,
  decalRotation: number,
) {
  return useMemo(() => {
    geometry.computeBoundingBox();
    const box = geometry.boundingBox!;
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    // Position on left sleeve - project from positive X (outside) inward
    const posX = box.max.x;
    const posY = center.y + decalPosition.y * size.y * 0.003 + size.y * 0.3;
    const posZ = center.z + decalPosition.x * size.z * 0.003;

    const decalSize = decalScale * size.y * 0.1;
    const decalDepth = size.x * 1.0;

    console.log("Left sleeve decal transform:", {
      posX, posY, posZ, decalSize, decalDepth,
      boxSize: { x: size.x, y: size.y, z: size.z },
    });

    return {
      position: [posX, posY, posZ] as [number, number, number],
      rotation: [0, Math.PI / 2, (decalRotation * Math.PI) / 180] as [number, number, number],
      scale: [-decalSize, decalSize, decalDepth] as [number, number, number],
    };
  }, [geometry, decalPosition.x, decalPosition.y, decalScale, decalRotation]);
}

// T-shirt right sleeve decal transform
// Right sleeve = viewer's right when looking at shirt from front = negative X side
function useTShirtRightSleeveDecalTransform(
  geometry: THREE.BufferGeometry,
  decalPosition: { x: number; y: number },
  decalScale: number,
  decalRotation: number,
) {
  return useMemo(() => {
    geometry.computeBoundingBox();
    const box = geometry.boundingBox!;
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    // Position on right sleeve - project from negative X (outside) inward
    const posX = box.min.x;
    const posY = center.y + decalPosition.y * size.y * 0.003 + size.y * 0.3;
    const posZ = center.z + decalPosition.x * size.z * 0.003;

    const decalSize = decalScale * size.y * 0.1;
    const decalDepth = size.x * 1.0;

    console.log("Right sleeve decal transform:", {
      posX, posY, posZ, decalSize, decalDepth,
      boxSize: { x: size.x, y: size.y, z: size.z },
    });

    return {
      position: [posX, posY, posZ] as [number, number, number],
      rotation: [0, -Math.PI / 2, (decalRotation * Math.PI) / 180] as [number, number, number],
      scale: [-decalSize, decalSize, decalDepth] as [number, number, number],
    };
  }, [geometry, decalPosition.x, decalPosition.y, decalScale, decalRotation]);
}

// Helper to calculate decal transform for T-shirt front
function useTShirtFrontDecalTransform(
  geometry: THREE.BufferGeometry,
  decalPosition: { x: number; y: number },
  decalScale: number,
  decalRotation: number,
  zOffset: number = 0,
  texture: THREE.Texture | null = null,
) {
  return useMemo(() => {
    geometry.computeBoundingBox();
    const box = geometry.boundingBox!;
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    // Position on front chest - similar to hoodie logic
    const posX = center.x + decalPosition.x * 0.001;
    const posY = center.y + decalPosition.y * 0.001 + size.y * 0.2;
    const posZ = box.max.z + zOffset;

    const decalSize = decalScale * size.y * 0.25;

    // Calculate aspect ratio from texture
    let scaleX = decalSize;
    let scaleY = decalSize;
    if (texture && texture.image) {
      const aspectRatio = texture.image.width / texture.image.height;
      if (aspectRatio > 1) {
        // Wider than tall
        scaleY = decalSize / aspectRatio;
      } else {
        // Taller than wide
        scaleX = decalSize * aspectRatio;
      }
    }

    // Depth should project onto front surface but not through to back
    const decalDepth = size.z * 0.5;

    console.log("Front decal transform:", {
      texture: !!texture,
      textureImage: texture?.image
        ? { width: texture.image.width, height: texture.image.height }
        : null,
      decalScale,
      decalSize,
      scaleX,
      scaleY,
      decalDepth,
      posX,
      posY,
      posZ,
      boxSize: { x: size.x, y: size.y, z: size.z },
    });

    return {
      position: [posX, posY, posZ] as [number, number, number],
      rotation: [0, 0, (decalRotation * Math.PI) / 180] as [
        number,
        number,
        number,
      ],
      scale: [scaleX, scaleY, decalDepth] as [number, number, number],
    };
  }, [
    geometry,
    decalPosition.x,
    decalPosition.y,
    decalScale,
    decalRotation,
    zOffset,
    texture,
  ]);
}

// Helper to calculate decal transform for T-shirt back
function useTShirtBackDecalTransformNew(
  geometry: THREE.BufferGeometry,
  decalPosition: { x: number; y: number },
  decalScale: number,
  decalRotation: number,
  zOffset: number = 0,
  texture: THREE.Texture | null = null,
) {
  return useMemo(() => {
    geometry.computeBoundingBox();
    const box = geometry.boundingBox!;
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    const posX = center.x + decalPosition.x * 0.001;
    const posY = center.y + decalPosition.y * 0.001 + size.y * 0.2;
    const posZ = box.min.z - zOffset;

    const decalSize = decalScale * size.y * 0.25;

    // Calculate aspect ratio from texture
    let scaleX = decalSize;
    let scaleY = decalSize;
    if (texture && texture.image) {
      const aspectRatio = texture.image.width / texture.image.height;
      if (aspectRatio > 1) {
        // Wider than tall
        scaleY = decalSize / aspectRatio;
      } else {
        // Taller than wide
        scaleX = decalSize * aspectRatio;
      }
    }

    // Depth should project onto back surface but not through to front
    const decalDepth = size.z * 0.5;

    console.log("Back decal transform:", {
      texture: !!texture,
      textureImage: texture?.image
        ? { width: texture.image.width, height: texture.image.height }
        : null,
      decalScale,
      decalSize,
      scaleX,
      scaleY,
      decalDepth,
      posX,
      posY,
      posZ,
      boxSize: { x: size.x, y: size.y, z: size.z },
    });

    return {
      position: [posX, posY, posZ] as [number, number, number],
      rotation: [0, Math.PI, (decalRotation * Math.PI) / 180] as [
        number,
        number,
        number,
      ],
      scale: [scaleX, scaleY, decalDepth] as [number, number, number],
    };
  }, [
    geometry,
    decalPosition.x,
    decalPosition.y,
    decalScale,
    decalRotation,
    zOffset,
    texture,
  ]);
}

function TShirtWithDecals({
  geometry,
  material,
  decalTexture,
  decalPosition,
  decalScale,
  decalRotation,
  textTexture,
  textPosition,
  textScale,
  textRotation,
  backImageTexture,
  backTextTexture,
  backPosition,
  backScale,
  backRotation,
  leftSleeveImageTexture,
  leftSleeveTextTexture,
  leftSleevePosition,
  leftSleeveScale,
  leftSleeveRotation,
  rightSleeveImageTexture,
  rightSleeveTextTexture,
  rightSleevePosition,
  rightSleeveScale,
  rightSleeveRotation,
}: {
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  decalTexture: THREE.Texture | null;
  decalPosition: { x: number; y: number };
  decalScale: number;
  decalRotation: number;
  textTexture: THREE.Texture | null;
  textPosition: { x: number; y: number };
  textScale: number;
  textRotation: number;
  backImageTexture: THREE.Texture | null;
  backTextTexture: THREE.Texture | null;
  backPosition: { x: number; y: number };
  backScale: number;
  backRotation: number;
  leftSleeveImageTexture: THREE.Texture | null;
  leftSleeveTextTexture: THREE.Texture | null;
  leftSleevePosition: { x: number; y: number };
  leftSleeveScale: number;
  leftSleeveRotation: number;
  rightSleeveImageTexture: THREE.Texture | null;
  rightSleeveTextTexture: THREE.Texture | null;
  rightSleevePosition: { x: number; y: number };
  rightSleeveScale: number;
  rightSleeveRotation: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null!);

  // Front image decal transform
  const imageTransform = useTShirtFrontDecalTransform(
    geometry,
    decalPosition,
    decalScale,
    decalRotation,
    0,
    decalTexture,
  );

  // Front text decal transform
  const textTransform = useTShirtFrontDecalTransform(
    geometry,
    textPosition,
    textScale,
    textRotation,
    0.01,
    textTexture,
  );

  // Back image decal transform
  const backImageTransform = useTShirtBackDecalTransformNew(
    geometry,
    backPosition,
    backScale,
    backRotation,
    0,
    backImageTexture,
  );

  // Back text decal transform
  const backTextTransform = useTShirtBackDecalTransformNew(
    geometry,
    backPosition,
    backScale * 1.1,
    backRotation,
    0.01,
    backTextTexture,
  );

  // Left sleeve image decal transform
  const leftSleeveImageTransform = useTShirtLeftSleeveDecalTransform(
    geometry,
    leftSleevePosition,
    leftSleeveScale,
    leftSleeveRotation,
  );

  // Left sleeve text decal transform
  const leftSleeveTextTransform = useTShirtLeftSleeveDecalTransform(
    geometry,
    leftSleevePosition,
    leftSleeveScale * 1.1,
    leftSleeveRotation,
  );

  // Right sleeve image decal transform
  const rightSleeveImageTransform = useTShirtRightSleeveDecalTransform(
    geometry,
    rightSleevePosition,
    rightSleeveScale,
    rightSleeveRotation,
  );

  // Right sleeve text decal transform
  const rightSleeveTextTransform = useTShirtRightSleeveDecalTransform(
    geometry,
    rightSleevePosition,
    rightSleeveScale * 1.1,
    rightSleeveRotation,
  );

  return (
    <mesh ref={meshRef} geometry={geometry} material={material}>
      {/* Front image decal */}
      {decalTexture && (
        <Decal
          position={imageTransform.position}
          rotation={imageTransform.rotation}
          scale={imageTransform.scale}
          map={decalTexture}
          polygonOffsetFactor={-10}
        />
      )}
      {/* Front text decal */}
      {textTexture && (
        <Decal
          position={textTransform.position}
          rotation={textTransform.rotation}
          scale={textTransform.scale}
          map={textTexture}
          polygonOffsetFactor={-50}
          depthTest={false}
        />
      )}
      {/* Back image decal */}
      {backImageTexture && (
        <Decal
          position={backImageTransform.position}
          rotation={backImageTransform.rotation}
          scale={backImageTransform.scale}
          map={backImageTexture}
          polygonOffsetFactor={-10}
        />
      )}
      {/* Back text decal */}
      {backTextTexture && (
        <Decal
          position={backTextTransform.position}
          rotation={backTextTransform.rotation}
          scale={backTextTransform.scale}
          map={backTextTexture}
          polygonOffsetFactor={-50}
          depthTest={false}
        />
      )}
      {/* Left sleeve image decal */}
      {leftSleeveImageTexture && (
        <Decal
          position={leftSleeveImageTransform.position}
          rotation={leftSleeveImageTransform.rotation}
          scale={leftSleeveImageTransform.scale}
          map={leftSleeveImageTexture}
          polygonOffsetFactor={-10}
        />
      )}
      {/* Left sleeve text decal */}
      {leftSleeveTextTexture && (
        <Decal
          position={leftSleeveTextTransform.position}
          rotation={leftSleeveTextTransform.rotation}
          scale={leftSleeveTextTransform.scale}
          map={leftSleeveTextTexture}
          polygonOffsetFactor={-50}
          depthTest={false}
        />
      )}
      {/* Right sleeve image decal */}
      {rightSleeveImageTexture && (
        <Decal
          position={rightSleeveImageTransform.position}
          rotation={rightSleeveImageTransform.rotation}
          scale={rightSleeveImageTransform.scale}
          map={rightSleeveImageTexture}
          polygonOffsetFactor={-10}
        />
      )}
      {/* Right sleeve text decal */}
      {rightSleeveTextTexture && (
        <Decal
          position={rightSleeveTextTransform.position}
          rotation={rightSleeveTextTransform.rotation}
          scale={rightSleeveTextTransform.scale}
          map={rightSleeveTextTexture}
          polygonOffsetFactor={-50}
          depthTest={false}
        />
      )}
    </mesh>
  );
}

export function TShirtModel() {
  const groupRef = useRef<THREE.Group>(null);
  const [decalTexture, setDecalTexture] = useState<THREE.Texture | null>(null);
  const [textTexture, setTextTexture] = useState<THREE.Texture | null>(null);
  const [backImageTexture, setBackImageTexture] =
    useState<THREE.Texture | null>(null);
  const [backTextTexture, setBackTextTexture] = useState<THREE.Texture | null>(
    null,
  );
  const [leftSleeveImageTexture, setLeftSleeveImageTexture] =
    useState<THREE.Texture | null>(null);
  const [leftSleeveTextTexture, setLeftSleeveTextTexture] =
    useState<THREE.Texture | null>(null);
  const [rightSleeveImageTexture, setRightSleeveImageTexture] =
    useState<THREE.Texture | null>(null);
  const [rightSleeveTextTexture, setRightSleeveTextTexture] =
    useState<THREE.Texture | null>(null);

  const {
    hoodieColor, // Using same store field for garment color
    targetRotation,
    decalImage,
    decalPosition,
    decalScale,
    decalRotation,
    textValue,
    textFont,
    textColor,
    textPosition,
    textScale,
    textRotation,
    backImage,
    backText,
    backTextFont,
    backTextColor,
    backPosition,
    backScale,
    backRotation,
    // Using leftShoulder store fields for left sleeve
    leftShoulderImage: leftSleeveImage,
    leftShoulderText: leftSleeveText,
    leftShoulderTextFont: leftSleeveTextFont,
    leftShoulderTextColor: leftSleeveTextColor,
    leftShoulderPosition: leftSleevePosition,
    leftShoulderScale: leftSleeveScale,
    leftShoulderRotation: leftSleeveRotation,
    // Using rightShoulder store fields for right sleeve
    rightShoulderImage: rightSleeveImage,
    rightShoulderText: rightSleeveText,
    rightShoulderTextFont: rightSleeveTextFont,
    rightShoulderTextColor: rightSleeveTextColor,
    rightShoulderPosition: rightSleevePosition,
    rightShoulderScale: rightSleeveScale,
    rightShoulderRotation: rightSleeveRotation,
  } = useCustomizerStore();

  const { scene } = useGLTF("/models/tshirt.glb");

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
    const size = new THREE.Vector3();
    box.getCenter(center);
    box.getSize(size);

    console.log("T-Shirt model bounds:", {
      min: box.min,
      max: box.max,
      center,
      size,
      sizeX: size.x,
      sizeY: size.y,
      sizeZ: size.z,
    });

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
          color: "#1a1a1a",
          roughness: 0.85,
          metalness: 0,
          side: THREE.DoubleSide,
        });

        result.push({ geometry: geo, material: mat, name: child.name });
        console.log("T-Shirt: Extracted mesh:", child.name);
      }
    });

    console.log("T-Shirt: Total meshes extracted:", result.length);
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

    console.log("T-Shirt: Main body mesh:", largest?.name);
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
        console.log("T-Shirt: Decal texture loaded successfully", {
          hasImage: !!texture.image,
          imageWidth: texture.image?.width,
          imageHeight: texture.image?.height,
        });
        setDecalTexture(texture);
      },
      undefined,
      (err) => {
        console.error("T-Shirt: Texture load error:", err);
      },
    );
  }, [decalImage]);

  // Generate text texture from canvas
  useEffect(() => {
    if (!textValue) {
      setTextTexture(null);
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = textColor;
    ctx.font = `bold 64px "${textFont}"`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(textValue, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    setTextTexture(texture);

    return () => {
      texture.dispose();
    };
  }, [textValue, textFont, textColor]);

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
        texture.anisotropy = 16;
        setBackImageTexture(texture);
      },
      undefined,
      (err) => {
        console.error("T-Shirt: Back texture load error:", err);
      },
    );
  }, [backImage]);

  // Generate back text texture
  useEffect(() => {
    if (!backText) {
      setBackTextTexture(null);
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = backTextColor;
    ctx.font = `bold 64px "${backTextFont}"`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(backText, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    setBackTextTexture(texture);

    return () => {
      texture.dispose();
    };
  }, [backText, backTextFont, backTextColor]);

  // Load left sleeve image texture
  useEffect(() => {
    if (!leftSleeveImage) {
      setLeftSleeveImageTexture(null);
      return;
    }

    const loader = new THREE.TextureLoader();
    loader.load(
      leftSleeveImage,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = true;
        texture.anisotropy = 16;
        texture.wrapS = THREE.RepeatWrapping;
        texture.repeat.x = -1;
        texture.needsUpdate = true;
        setLeftSleeveImageTexture(texture);
      },
      undefined,
      (err) => {
        console.error("T-Shirt: Left sleeve texture load error:", err);
      },
    );
  }, [leftSleeveImage]);

  // Generate left sleeve text texture
  useEffect(() => {
    if (!leftSleeveText) {
      setLeftSleeveTextTexture(null);
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = leftSleeveTextColor;
    ctx.font = `bold 64px "${leftSleeveTextFont}"`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(leftSleeveText, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    setLeftSleeveTextTexture(texture);

    return () => {
      texture.dispose();
    };
  }, [leftSleeveText, leftSleeveTextFont, leftSleeveTextColor]);

  // Load right sleeve image texture
  useEffect(() => {
    if (!rightSleeveImage) {
      setRightSleeveImageTexture(null);
      return;
    }

    const loader = new THREE.TextureLoader();
    loader.load(
      rightSleeveImage,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = true;
        texture.anisotropy = 16;
        texture.wrapS = THREE.RepeatWrapping;
        texture.repeat.x = -1;
        texture.needsUpdate = true;
        setRightSleeveImageTexture(texture);
      },
      undefined,
      (err) => {
        console.error("T-Shirt: Right sleeve texture load error:", err);
      },
    );
  }, [rightSleeveImage]);

  // Generate right sleeve text texture
  useEffect(() => {
    if (!rightSleeveText) {
      setRightSleeveTextTexture(null);
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = rightSleeveTextColor;
    ctx.font = `bold 64px "${rightSleeveTextFont}"`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(rightSleeveText, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    setRightSleeveTextTexture(texture);

    return () => {
      texture.dispose();
    };
  }, [rightSleeveText, rightSleeveTextFont, rightSleeveTextColor]);

  // Update colors
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

  // Track if we're transitioning to a new target
  const isTransitioning = useRef(false);
  const lastTargetRotation = useRef(targetRotation);

  // Smooth rotation with gentle swaying animation
  useFrame((state) => {
    if (groupRef.current) {
      // Detect when target changes (tab switch)
      if (lastTargetRotation.current !== targetRotation) {
        isTransitioning.current = true;
        lastTargetRotation.current = targetRotation;
      }

      // Beautiful gentle swaying motion
      const swayAmount = 0.1;
      const swaySpeed = 0.3;
      const sway = Math.sin(state.clock.elapsedTime * swaySpeed) * swayAmount;

      if (isTransitioning.current) {
        // Smoothly rotate towards target when tab changes
        const currentY = groupRef.current.rotation.y;

        // Calculate shortest path for rotation (handle wrap-around)
        let diff = targetRotation - currentY;

        // Normalize the difference to be between -PI and PI for shortest path
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;

        if (Math.abs(diff) > 0.01) {
          // Faster interpolation for smoother feel
          groupRef.current.rotation.y += diff * 0.12;
        } else {
          // Arrived at target, stop transitioning
          groupRef.current.rotation.y = targetRotation;
          isTransitioning.current = false;
        }
      } else {
        // Normal swaying around the target rotation
        groupRef.current.rotation.y = targetRotation + sway;
      }
    }
  });

  // Calculate appropriate scale based on model size
  const modelScale = useMemo(() => {
    if (meshes.length === 0) return 1;

    // Get the overall bounding box of all meshes
    let maxDimension = 0;
    meshes.forEach((m) => {
      m.geometry.computeBoundingBox();
      const box = m.geometry.boundingBox!;
      const size = new THREE.Vector3();
      box.getSize(size);
      maxDimension = Math.max(maxDimension, size.x, size.y, size.z);
    });

    // Target size to match hoodie visual size (hoodie is ~2 units tall after 0.005 scale)
    const targetSize = 3.0;
    const scale = maxDimension > 0 ? targetSize / maxDimension : 1;

    console.log(
      "T-Shirt: Calculated scale:",
      scale,
      "maxDimension:",
      maxDimension,
    );
    return scale;
  }, [meshes]);

  return (
    <group ref={groupRef} scale={modelScale}>
      {/* Render all meshes except body */}
      {meshes
        .filter((m) => m !== bodyMesh)
        .map((m, i) => (
          <mesh key={i} geometry={m.geometry} material={m.material} />
        ))}

      {/* Render body mesh with decals */}
      {bodyMesh && (
        <TShirtWithDecals
          geometry={bodyMesh.geometry}
          material={bodyMesh.material}
          decalTexture={decalTexture}
          decalPosition={decalPosition}
          decalScale={decalScale}
          decalRotation={decalRotation}
          textTexture={textTexture}
          textPosition={textPosition}
          textScale={textScale}
          textRotation={textRotation}
          backImageTexture={backImageTexture}
          backTextTexture={backTextTexture}
          backPosition={backPosition}
          backScale={backScale}
          backRotation={backRotation}
          leftSleeveImageTexture={leftSleeveImageTexture}
          leftSleeveTextTexture={leftSleeveTextTexture}
          leftSleevePosition={leftSleevePosition}
          leftSleeveScale={leftSleeveScale}
          leftSleeveRotation={leftSleeveRotation}
          rightSleeveImageTexture={rightSleeveImageTexture}
          rightSleeveTextTexture={rightSleeveTextTexture}
          rightSleevePosition={rightSleevePosition}
          rightSleeveScale={rightSleeveScale}
          rightSleeveRotation={rightSleeveRotation}
        />
      )}
    </group>
  );
}

useGLTF.preload("/models/tshirt.glb");
