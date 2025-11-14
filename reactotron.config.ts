/**
 * Reactotron Configuration
 *
 * Best-in-class debugging for React Native (2024-2025 standard)
 *
 * Features:
 * - State inspection (Zustand)
 * - TanStack Query monitoring
 * - Network request/response logging
 * - Timeline view of all events
 * - Custom commands
 * - AsyncStorage inspection
 * - Performance monitoring
 * - No performance hit (disabled in production)
 *
 * Setup:
 * 1. Download Reactotron desktop app: https://github.com/infinitered/reactotron/releases
 * 2. Run desktop app
 * 3. Start your React Native app
 * 4. Reactotron auto-connects!
 */

import Reactotron, { networking } from 'reactotron-react-native';
import { QueryClientManager, reactotronReactQuery } from 'reactotron-react-query';
import { queryClient } from './src/api/queryClient';
import { storage } from './src/api/storage';

// Only enable in development
if (__DEV__) {
  // Create QueryClient manager for TanStack Query integration
  const queryClientManager = new QueryClientManager({
    queryClient,
  });

  const reactotron = Reactotron.configure({
    name: 'Activity Platform',
    host: 'localhost', // Change to your machine's IP for physical device
  })
    // Network monitoring
    .use(
      networking({
        ignoreUrls: /symbolicate|127.0.0.1/, // Ignore Metro bundler
      })
    )
    // TanStack Query monitoring
    .use(reactotronReactQuery(queryClientManager))
    // AsyncStorage monitoring
    .useReactNative({
      asyncStorage: {
        ignore: ['session', 'credentials'], // Don't log sensitive data
      },
      networking: {
        ignoreUrls: /symbolicate/,
      },
      editor: false, // Disable editor integration (can be slow)
      overlay: false, // Disable overlay (can block UI in dev)
    })
    .connect();

  // Custom commands
  reactotron.onCustomCommand({
    command: 'clearQueryCache',
    handler: () => {
      queryClient.clear();
      console.log('✅ Query cache cleared');
    },
    title: 'Clear Query Cache',
    description: 'Clears all TanStack Query cache',
  });

  reactotron.onCustomCommand({
    command: 'clearStorage',
    handler: () => {
      storage.clearAll();
      console.log('✅ MMKV storage cleared');
    },
    title: 'Clear MMKV Storage',
    description: 'Clears all persistent storage',
  });

  reactotron.onCustomCommand({
    command: 'simulateOffline',
    handler: () => {
      console.log('⚠️ Simulating offline mode (not implemented yet)');
      // TODO: Integrate with offline simulation
    },
    title: 'Simulate Offline',
    description: 'Simulates offline mode for testing',
  });

  // Log app start
  console.log('🐛 Reactotron configured and connected');

  // Make Reactotron available globally for debugging
  // @ts-ignore
  console.tron = reactotron;
}

/**
 * Usage in your code:
 *
 * // Log to Reactotron
 * if (__DEV__) {
 *   console.tron.log('User created activity', { activityId: '123' });
 *   console.tron.warn('This might be a problem');
 *   console.tron.error('Something went wrong!');
 * }
 *
 * // Display something (overlay in Reactotron)
 * if (__DEV__) {
 *   console.tron.display({
 *     name: 'API Response',
 *     value: response.data,
 *     preview: 'Activity created successfully',
 *   });
 * }
 *
 * // Benchmark performance
 * if (__DEV__) {
 *   const benchmark = console.tron.benchmark('Heavy Operation');
 *   // ... do expensive work
 *   benchmark.stop();
 * }
 */

export default Reactotron;
