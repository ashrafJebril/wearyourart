// Shim for import.meta in React Native / Metro bundler
// This fixes the "Cannot use 'import.meta' outside a module" error

if (typeof global !== 'undefined' && !global.importMeta) {
  global.importMeta = {
    url: '',
    env: process.env || {},
  };
}

// Polyfill import.meta for bundled environments
if (typeof window !== 'undefined' && typeof window.importMeta === 'undefined') {
  window.importMeta = {
    url: window.location ? window.location.href : '',
    env: {},
  };
}
