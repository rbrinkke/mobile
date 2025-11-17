import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import reactNativePlugin from 'eslint-plugin-react-native';
import globals from 'globals';

export default [
  // Ignore patterns (replaces .eslintignore)
  {
    ignores: [
      'node_modules/**',
      '.expo/**',
      'dist/**',
      'coverage/**',
      '*.config.js',
      '*.config.ts',
      '/ios/**',
      '/android/**',
      '.metro-cache/**',
      '.jest-cache/**',
      '.eslintcache',
      '*.tsbuildinfo',
    ],
  },

  // Base ESLint recommended config
  js.configs.recommended,

  // Global configuration for all TypeScript/React files
  {
    files: ['**/*.{ts,tsx}'],

    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
        project: './tsconfig.json',
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
        // React Native / Expo globals
        __DEV__: 'readonly',
        console: 'readonly',
        process: 'readonly',
      },
    },

    plugins: {
      '@typescript-eslint': tsPlugin,
      'react': reactPlugin,
      'react-hooks': reactHooksPlugin,
      'react-native': reactNativePlugin,
    },

    settings: {
      react: {
        version: 'detect',
      },
    },

    rules: {
      // TypeScript Best Practices
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }],
      '@typescript-eslint/consistent-type-imports': ['error', {
        prefer: 'type-imports',
      }],

      // React Best Practices
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/display-name': 'off',
      'react/jsx-uses-react': 'off',
      'react/jsx-uses-vars': 'error',

      // React Hooks Best Practices
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // React Native Best Practices
      'react-native/no-unused-styles': 'error',
      'react-native/no-inline-styles': 'warn',
      'react-native/no-color-literals': 'warn',
      'react-native/split-platform-components': 'warn',

      // Code Quality
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',
      'eqeqeq': ['error', 'always'],
      'no-duplicate-imports': 'error',
    },
  },
];
