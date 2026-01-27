// Asset type declarations for 3D model files
declare module '*.glb' {
  const content: number;
  export default content;
}

declare module '*.gltf' {
  const content: number;
  export default content;
}
