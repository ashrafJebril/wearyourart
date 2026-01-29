"use client";

import { useRef, useEffect, useMemo, useState } from "react";
import { useGLTF, Decal } from "@react-three/drei";
import { useCustomizerStore } from "@/lib/store/useCustomizerStore";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

// Helper to calculate decal transform for a given position/scale/rotation
function useDecalTransform(
  geometry: THREE.BufferGeometry,
  decalPosition: { x: number; y: number },
  decalScale: number,
  decalRotation: number,
  zOffset: number = 0, // Additional Z offset for text to prevent clipping
) {
  return useMemo(() => {
    geometry.computeBoundingBox();
    const box = geometry.boundingBox!;
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    // Shift decal left to center it on the chest (model is asymmetric)
    const posX = center.x + decalPosition.x - 16;
    const posY = center.y + decalPosition.y + 70;
    const posZ = box.max.z - 100 + zOffset; // Apply additional Z offset

    const decalSize = decalScale * Math.min(size.x, size.y) * 0.3;

    return {
      position: [posX, posY, posZ] as [number, number, number],
      rotation: [0, 0, (decalRotation * Math.PI) / 180] as [
        number,
        number,
        number,
      ],
      scale: [decalSize, decalSize, decalSize] as [number, number, number],
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

// Helper to calculate LEFT shoulder decal transform
function useLeftShoulderDecalTransform(
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

    const shoulderXOffset = -70;
    const shoulderYOffset = 40;

    const posX = center.x + decalPosition.x - 180 + shoulderXOffset;
    const posY = center.y + decalPosition.y - 10 + shoulderYOffset;
    const posZ = box.max.z - 280;

    const decalSize = decalScale * Math.min(size.x, size.y) * 0.2;

    console.log("Left shoulder decal:", { posX, posY, posZ, decalSize });

    return {
      position: [posX, posY, posZ] as [number, number, number],
      rotation: [0, Math.PI / 2, (decalRotation * Math.PI) / 180] as [
        number,
        number,
        number,
      ],
      scale: [decalSize, decalSize, decalSize] as [number, number, number],
    };
  }, [geometry, decalPosition.x, decalPosition.y, decalScale, decalRotation]);
}

// Helper to calculate BACK decal transform - same structure as front
function useBackDecalTransform(
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

    // Same X/Y positioning as front
    const posX = center.x + decalPosition.x - 16;
    const posY = center.y + decalPosition.y + 70;
    // Back side: position at back surface (negative Z)
    // Need to push the decal out from the back surface (more negative Z = further back)
    const posZ = -(box.max.z - 50) - zOffset;

    const decalSize = decalScale * Math.min(size.x, size.y) * 0.3;

    console.log("Back decal transform:", {
      posX,
      posY,
      posZ,
      decalSize,
      boxMin: box.min.z,
      boxMax: box.max.z,
    });

    return {
      position: [posX, posY, posZ] as [number, number, number],
      // Rotation: Y = PI to face the back
      rotation: [0, Math.PI, (decalRotation * Math.PI) / 180] as [
        number,
        number,
        number,
      ],
      scale: [decalSize, decalSize, decalSize] as [number, number, number],
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

// Helper to calculate RIGHT shoulder decal transform
function useRightShoulderDecalTransform(
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

    const shoulderXOffset = 70; // Positive to go to right side (opposite of left's -70)
    const shoulderYOffset = 40;

    // Right shoulder: positive X direction (opposite of left)
    const posX = center.x + decalPosition.x + 165 + shoulderXOffset;
    const posY = center.y + decalPosition.y + 55 + shoulderYOffset;
    const posZ = box.max.z - 220; // Same Z as left shoulder

    const decalSize = decalScale * Math.min(size.x, size.y) * 0.2;

    console.log("Right shoulder decal:", { posX, posY, posZ, decalSize });

    return {
      position: [posX, posY, posZ] as [number, number, number],
      rotation: [0, -Math.PI / 2, (decalRotation * Math.PI) / 180] as [
        number,
        number,
        number,
      ],
      scale: [decalSize, decalSize, decalSize] as [number, number, number],
    };
  }, [geometry, decalPosition.x, decalPosition.y, decalScale, decalRotation]);
}

function HoodieWithDecals({
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
  backTextPosition,
  backTextScale,
  backTextRotation,
  leftShoulderImageTexture,
  leftShoulderTextTexture,
  leftShoulderPosition,
  leftShoulderScale,
  leftShoulderRotation,
  rightShoulderImageTexture,
  rightShoulderTextTexture,
  rightShoulderPosition,
  rightShoulderScale,
  rightShoulderRotation,
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
  backTextPosition: { x: number; y: number };
  backTextScale: number;
  backTextRotation: number;
  leftShoulderImageTexture: THREE.Texture | null;
  leftShoulderTextTexture: THREE.Texture | null;
  leftShoulderPosition: { x: number; y: number };
  leftShoulderScale: number;
  leftShoulderRotation: number;
  rightShoulderImageTexture: THREE.Texture | null;
  rightShoulderTextTexture: THREE.Texture | null;
  rightShoulderPosition: { x: number; y: number };
  rightShoulderScale: number;
  rightShoulderRotation: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null!);

  // Calculate image decal transform
  const imageTransform = useDecalTransform(
    geometry,
    decalPosition,
    decalScale,
    decalRotation,
    0, // No extra Z offset for image
  );

  // Calculate text decal transform - push it further forward to prevent clipping
  const textTransform = useDecalTransform(
    geometry,
    textPosition,
    textScale,
    textRotation,
    11, // Extra Z offset to keep text in front of curved surfaces
  );

  // Calculate back decal transforms
  const backImageTransform = useBackDecalTransform(
    geometry,
    backPosition,
    backScale,
    backRotation,
    0,
  );

  const backTextTransform = useBackDecalTransform(
    geometry,
    backTextPosition,
    backTextScale * 1.1,
    backTextRotation,
    50,
  );

  // Calculate left shoulder transforms
  const leftShoulderImageTransform = useLeftShoulderDecalTransform(
    geometry,
    leftShoulderPosition,
    leftShoulderScale,
    leftShoulderRotation,
  );

  const leftShoulderTextTransform = useLeftShoulderDecalTransform(
    geometry,
    leftShoulderPosition,
    leftShoulderScale * 1.1, // Slightly larger for text visibility
    leftShoulderRotation,
  );

  // Calculate right shoulder transforms
  const rightShoulderImageTransform = useRightShoulderDecalTransform(
    geometry,
    rightShoulderPosition,
    rightShoulderScale,
    rightShoulderRotation,
  );

  const rightShoulderTextTransform = useRightShoulderDecalTransform(
    geometry,
    rightShoulderPosition,
    rightShoulderScale * 1.1, // Slightly larger for text visibility
    rightShoulderRotation,
  );

  return (
    <mesh ref={meshRef} geometry={geometry} material={material}>
      {/* Image decal */}
      {decalTexture && (
        <Decal
          position={imageTransform.position}
          rotation={imageTransform.rotation}
          scale={imageTransform.scale}
          map={decalTexture}
          polygonOffsetFactor={-10}
        />
      )}
      {/* Text decal */}
      {textTexture && (
        <Decal
          position={textTransform.position}
          rotation={textTransform.rotation}
          scale={textTransform.scale}
          map={textTexture}
          polygonOffsetFactor={-10}
        />
      )}
      {/* Back image decal */}
      {backImageTexture && (
        <Decal
          position={backImageTransform.position}
          rotation={backImageTransform.rotation}
          scale={backImageTransform.scale}
          map={backImageTexture}
          polygonOffsetFactor={-4}
        />
      )}
      {/* Back text decal */}
      {backTextTexture && (
        <Decal
          position={backTextTransform.position}
          rotation={backTextTransform.rotation}
          scale={backTextTransform.scale}
          map={backTextTexture}
          polygonOffsetFactor={-10}
        />
      )}
      {/* Left shoulder image decal */}
      {leftShoulderImageTexture && (
        <Decal
          position={leftShoulderImageTransform.position}
          rotation={leftShoulderImageTransform.rotation}
          scale={leftShoulderImageTransform.scale}
          map={leftShoulderImageTexture}
          polygonOffsetFactor={-10}
          depthTest={false}
        />
      )}
      {/* Left shoulder text decal */}
      {leftShoulderTextTexture && (
        <Decal
          position={leftShoulderTextTransform.position}
          rotation={leftShoulderTextTransform.rotation}
          scale={leftShoulderTextTransform.scale}
          map={leftShoulderTextTexture}
          polygonOffsetFactor={-10}
        />
      )}
      {/* Right shoulder image decal */}
      {rightShoulderImageTexture && (
        <Decal
          position={rightShoulderImageTransform.position}
          rotation={rightShoulderImageTransform.rotation}
          scale={rightShoulderImageTransform.scale}
          map={rightShoulderImageTexture}
          polygonOffsetFactor={-10}
          depthTest={false}
        />
      )}
      {/* Right shoulder text decal */}
      {rightShoulderTextTexture && (
        <Decal
          position={rightShoulderTextTransform.position}
          rotation={rightShoulderTextTransform.rotation}
          scale={rightShoulderTextTransform.scale}
          map={rightShoulderTextTexture}
          polygonOffsetFactor={-10}
        />
      )}
    </mesh>
  );
}

export function HoodieModel() {
  const groupRef = useRef<THREE.Group>(null);
  const [decalTexture, setDecalTexture] = useState<THREE.Texture | null>(null);
  const [textTexture, setTextTexture] = useState<THREE.Texture | null>(null);
  const [backImageTexture, setBackImageTexture] =
    useState<THREE.Texture | null>(null);
  const [backTextTexture, setBackTextTexture] = useState<THREE.Texture | null>(
    null,
  );
  const [leftShoulderImageTexture, setLeftShoulderImageTexture] =
    useState<THREE.Texture | null>(null);
  const [leftShoulderTextTexture, setLeftShoulderTextTexture] =
    useState<THREE.Texture | null>(null);
  const [rightShoulderImageTexture, setRightShoulderImageTexture] =
    useState<THREE.Texture | null>(null);
  const [rightShoulderTextTexture, setRightShoulderTextTexture] =
    useState<THREE.Texture | null>(null);

  const {
    hoodieColor,
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
    backTextPosition,
    backTextScale,
    backTextRotation,
    leftShoulderImage,
    leftShoulderText,
    leftShoulderTextFont,
    leftShoulderTextColor,
    leftShoulderPosition,
    leftShoulderScale,
    leftShoulderRotation,
    rightShoulderImage,
    rightShoulderText,
    rightShoulderTextFont,
    rightShoulderTextColor,
    rightShoulderPosition,
    rightShoulderScale,
    rightShoulderRotation,
  } = useCustomizerStore();

  const { scene } = useGLTF("/models/hoodie.glb");

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
          color: "#1a1a1a",
          roughness: 0.85, // Slightly less than 1 for some subtle highlights
          metalness: 0,
          side: THREE.DoubleSide,
        });

        result.push({ geometry: geo, material: mat, name: child.name });
        console.log("Extracted mesh:", child.name);
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

    console.log("Main body mesh:", largest?.name);
    return largest;
  }, [meshes]);

  // Load decal texture
  useEffect(() => {
    if (!decalImage) {
      setDecalTexture(null);
      return;
    }

    const loader = new THREE.TextureLoader();
    loader.load(
      decalImage,
      (texture) => {
        console.log("Decal texture loaded successfully");
        setDecalTexture(texture);
      },
      undefined,
      (err) => {
        console.error("Texture load error:", err);
      },
    );
  }, [decalImage]);

  // Generate text texture from canvas
  useEffect(() => {
    if (!textValue) {
      setTextTexture(null);
      return;
    }

    const renderText = () => {
      // Create canvas for text rendering
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext("2d");

      if (!ctx) return;

      // Clear with transparent background
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Set text properties
      ctx.fillStyle = textColor;
      ctx.font = `bold 64px "${textFont}"`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Draw text
      ctx.fillText(textValue, canvas.width / 2, canvas.height / 2);

      // Create texture from canvas
      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;
      setTextTexture(texture);
    };

    // Wait for font to load before rendering
    document.fonts
      .load(`bold 64px "${textFont}"`)
      .then(() => {
        renderText();
      })
      .catch(() => {
        // Fallback: render anyway if font loading fails
        renderText();
      });

    return () => {
      // Cleanup handled by state update
    };
  }, [textValue, textFont, textColor]);

  // Load back image texture
  useEffect(() => {
    console.log(
      "Back image state changed:",
      backImage ? backImage.substring(0, 50) + "..." : "null",
    );
    if (!backImage) {
      setBackImageTexture(null);
      return;
    }

    const loader = new THREE.TextureLoader();
    loader.load(
      backImage,
      (texture) => {
        console.log(
          "Back image texture loaded successfully!",
          texture.image?.width,
          texture.image?.height,
        );
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = true;
        texture.anisotropy = 16;
        setBackImageTexture(texture);
      },
      undefined,
      (err) => {
        console.error("Back texture load error:", err);
      },
    );
  }, [backImage]);

  // Generate back text texture
  useEffect(() => {
    console.log("Back text effect triggered:", {
      backText,
      backTextFont,
      backTextColor,
    });

    if (!backText) {
      setBackTextTexture(null);
      return;
    }

    const renderText = () => {
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

      console.log("Back text rendered to canvas:", backText);

      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;
      setBackTextTexture(texture);

      console.log("Back text texture created");
    };

    // Wait for font to load before rendering
    document.fonts
      .load(`bold 64px "${backTextFont}"`)
      .then(() => {
        renderText();
      })
      .catch(() => {
        // Fallback: render anyway if font loading fails
        renderText();
      });

    return () => {
      // Cleanup handled by state update
    };
  }, [backText, backTextFont, backTextColor]);

  // Load left shoulder image texture
  useEffect(() => {
    if (!leftShoulderImage) {
      setLeftShoulderImageTexture(null);
      return;
    }

    console.log(
      "Loading left shoulder image...",
      leftShoulderImage.substring(0, 50),
    );
    const loader = new THREE.TextureLoader();
    loader.load(
      leftShoulderImage,
      (texture) => {
        console.log(
          "Left shoulder texture loaded successfully!",
          texture.image?.width,
          texture.image?.height,
        );
        // High quality texture settings
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = true;
        texture.anisotropy = 16;
        // Flip texture horizontally to correct mirror effect
        texture.wrapS = THREE.RepeatWrapping;
        texture.repeat.x = -1;
        texture.needsUpdate = true;
        setLeftShoulderImageTexture(texture);
      },
      undefined,
      (err) => {
        console.error("Left shoulder texture load error:", err);
      },
    );
  }, [leftShoulderImage]);

  // Generate left shoulder text texture
  useEffect(() => {
    if (!leftShoulderText) {
      setLeftShoulderTextTexture(null);
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = leftShoulderTextColor;
    ctx.font = `bold 64px "${leftShoulderTextFont}"`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(leftShoulderText, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    setLeftShoulderTextTexture(texture);

    return () => {
      texture.dispose();
    };
  }, [leftShoulderText, leftShoulderTextFont, leftShoulderTextColor]);

  // Load right shoulder image texture
  useEffect(() => {
    if (!rightShoulderImage) {
      setRightShoulderImageTexture(null);
      return;
    }

    console.log(
      "Loading right shoulder image...",
      rightShoulderImage.substring(0, 50),
    );
    const loader = new THREE.TextureLoader();
    loader.load(
      rightShoulderImage,
      (texture) => {
        console.log(
          "Right shoulder texture loaded successfully!",
          texture.image?.width,
          texture.image?.height,
        );
        // High quality texture settings
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = true;
        texture.anisotropy = 16;
        // Flip texture horizontally to correct mirror effect
        texture.wrapS = THREE.RepeatWrapping;
        texture.repeat.x = -1;
        texture.needsUpdate = true;
        setRightShoulderImageTexture(texture);
      },
      undefined,
      (err) => {
        console.error("Right shoulder texture load error:", err);
      },
    );
  }, [rightShoulderImage]);

  // Generate right shoulder text texture
  useEffect(() => {
    if (!rightShoulderText) {
      setRightShoulderTextTexture(null);
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = rightShoulderTextColor;
    ctx.font = `bold 64px "${rightShoulderTextFont}"`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(rightShoulderText, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    setRightShoulderTextTexture(texture);

    return () => {
      texture.dispose();
    };
  }, [rightShoulderText, rightShoulderTextFont, rightShoulderTextColor]);

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
  const isInitialized = useRef(false);
  const frameCount = useRef(0);

  console.log(
    "HoodieModel render - targetRotation from store:",
    targetRotation,
    "Math.PI =",
    Math.PI,
  );

  // Smooth rotation with gentle swaying animation
  useFrame((state) => {
    if (groupRef.current) {
      frameCount.current++;

      // Log first 5 frames to see what's happening
      if (frameCount.current <= 5) {
        console.log(`Frame ${frameCount.current}:`, {
          currentRotationY: groupRef.current.rotation.y,
          targetRotation,
          isInitialized: isInitialized.current,
          lastTargetRotation: lastTargetRotation.current,
        });
      }

      // Initialize rotation on first frame
      if (!isInitialized.current) {
        console.log("Initializing rotation to:", targetRotation);
        groupRef.current.rotation.y = targetRotation;
        isInitialized.current = true;
      }

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
          textTexture={textTexture}
          textPosition={textPosition}
          textScale={textScale}
          textRotation={textRotation}
          backImageTexture={backImageTexture}
          backTextTexture={backTextTexture}
          backPosition={backPosition}
          backScale={backScale}
          backRotation={backRotation}
          backTextPosition={backTextPosition}
          backTextScale={backTextScale}
          backTextRotation={backTextRotation}
          leftShoulderImageTexture={leftShoulderImageTexture}
          leftShoulderTextTexture={leftShoulderTextTexture}
          leftShoulderPosition={leftShoulderPosition}
          leftShoulderScale={leftShoulderScale}
          leftShoulderRotation={leftShoulderRotation}
          rightShoulderImageTexture={rightShoulderImageTexture}
          rightShoulderTextTexture={rightShoulderTextTexture}
          rightShoulderPosition={rightShoulderPosition}
          rightShoulderScale={rightShoulderScale}
          rightShoulderRotation={rightShoulderRotation}
        />
      )}
    </group>
  );
}

useGLTF.preload("/models/hoodie.glb");
