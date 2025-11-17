module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@': './src',
            '@components': './src/components',
            '@screens': './src/screens',
            '@navigation': './src/navigation',
            '@hooks': './src/hooks',
            '@stores': './src/stores',
            '@api': './src/api',
            '@services': './src/services',
            '@types': './src/types',
            '@features': './src/features',
          },
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      ],
      'react-native-reanimated/plugin', // MUST be last
    ],
  };
};
