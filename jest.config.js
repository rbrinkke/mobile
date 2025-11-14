/**
 * Jest Configuration - Best-in-Class Testing Setup
 *
 * Features:
 * - React Native preset with Expo
 * - TypeScript support
 * - Coverage reporting (80%+ target)
 * - Module path aliases
 * - MSW v2 integration
 */

module.exports = {
  preset: 'jest-expo',

  // TypeScript transformation
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },

  // Module path mapping (matches tsconfig.json)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@features/(.*)$': '<rootDir>/src/features/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
    '^@api/(.*)$': '<rootDir>/src/api/$1',
    '^@navigation/(.*)$': '<rootDir>/src/navigation/$1',
    '^@store/(.*)$': '<rootDir>/src/store/$1',
    '^@config/(.*)$': '<rootDir>/src/config/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@assets/(.*)$': '<rootDir>/assets/$1',
  },

  // Setup files
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.js',
  ],

  // Test match patterns
  testMatch: [
    '**/__tests__/**/*.(test|spec).(ts|tsx|js)',
    '**/*.(test|spec).(ts|tsx|js)',
  ],

  // Coverage configuration (80%+ target for production)
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/**/index.ts', // Barrel files
    '!src/**/*.stories.tsx',
    '!src/navigation/**', // Navigation config
  ],

  coverageThreshold: {
    global: {
      branches: 75,
      functions: 75,
      lines: 80,
      statements: 80,
    },
  },

  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/android/',
    '/ios/',
    '/tests/', // Playwright E2E tests (separate from Jest)
  ],

  // Module file extensions
  moduleFileExtensions: [
    'ts',
    'tsx',
    'js',
    'jsx',
    'json',
  ],

  // Globals for React Native
  globals: {
    __DEV__: true,
  },

  // Transform ignore patterns (allow MSW and other ESM modules)
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|msw)',
  ],

  // Clear mocks between tests for clean state
  clearMocks: true,

  // Verbose output for better debugging
  verbose: true,
};
