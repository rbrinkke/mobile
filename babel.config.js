module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
          alias: {
            '@': './src',
            '@features': './src/features',
            '@shared': './src/shared',
            '@api': './src/api',
            '@navigation': './src/navigation',
            '@store': './src/store',
            '@config': './src/config',
            '@assets': './assets',
          },
        },
      ],
      'react-native-reanimated/plugin', // Must be last
    ],
  };
};
