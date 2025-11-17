const { getDefaultConfig } = require('expo/metro-config');
const { FileStore } = require('metro-cache');
const path = require('path');
const os = require('os');

const config = getDefaultConfig(__dirname);

// PERFORMANCE OPTIMIZATIONS (2025 Best Practices)
module.exports = {
  ...config,

  // Use all CPU cores for parallel processing
  maxWorkers: os.cpus().length,

  transformer: {
    ...config.transformer,

    // Faster minification during development
    minifierConfig: {
      keep_classnames: true, // Faster than mangling
      keep_fnames: true,
      mangle: {
        keep_classnames: true,
        keep_fnames: true,
      },
    },

    // Skip unnecessary Babel lookups for performance
    enableBabelRCLookup: false,
  },

  resolver: {
    ...config.resolver,
    // Optimize node_modules resolution
    nodeModulesPaths: [
      './node_modules',
    ],
  },

  // ADVANCED CACHE: Persistent FileStore for optimal performance
  cacheStores: [
    new FileStore({
      root: path.join(__dirname, '.metro-cache'),
    }),
  ],

  // Stable worker assignment for better cache hits
  transformerPath: require.resolve('metro-transform-worker'),
};
