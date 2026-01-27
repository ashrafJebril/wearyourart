// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add support for .glb and .gltf 3D model files
config.resolver.assetExts.push('glb', 'gltf');

// Enable package exports for modern ES modules (Three.js, drei, etc.)
config.resolver.unstable_enablePackageExports = true;

// Specify conditions for module resolution (needed for drei/native)
config.resolver.unstable_conditionNames = ['browser', 'require', 'react-native'];

module.exports = config;
