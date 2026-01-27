module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Transform import.meta to CommonJS for Three.js and other modern ES modules
      'babel-plugin-transform-import-meta',
    ],
  };
};
