/**
 * Development Tools
 *
 * Utilities for debugging and development
 * Only available in __DEV__ mode
 *
 * Usage:
 *   import { devTools } from '@utils/devTools';
 *   devTools.clearStorage();
 */

import { storage } from '@api/storage';
import { queryClient } from '@api/queryClient';

export const devTools = {
  /**
   * Clear all MMKV storage
   * Useful for testing fresh app state or fixing stuck auth screens
   */
  clearStorage: () => {
    if (!__DEV__) {
      console.warn('⚠️ devTools.clearStorage() only works in development');
      return;
    }

    try {
      const allKeys = storage.getAllKeys();
      console.log(`🧹 Clearing ${allKeys.length} keys from MMKV storage...`);

      // Log what we're clearing
      allKeys.forEach((key) => {
        console.log(`   - ${key}`);
      });

      // Clear MMKV storage
      storage.clearAll();

      console.log('✅ MMKV storage cleared!');
      console.log('🔄 Please restart the app (press "r" in terminal)');

      return true;
    } catch (error) {
      console.error('❌ Failed to clear storage:', error);
      return false;
    }
  },

  /**
   * Clear TanStack Query cache
   */
  clearQueryCache: () => {
    if (!__DEV__) {
      console.warn('⚠️ devTools.clearQueryCache() only works in development');
      return;
    }

    try {
      queryClient.clear();
      console.log('✅ Query cache cleared!');
      return true;
    } catch (error) {
      console.error('❌ Failed to clear query cache:', error);
      return false;
    }
  },

  /**
   * Clear everything (storage + query cache)
   */
  clearAll: () => {
    if (!__DEV__) {
      console.warn('⚠️ devTools.clearAll() only works in development');
      return;
    }

    console.log('🧹 Clearing all app data...\n');

    const storageCleared = devTools.clearStorage();
    const queryCacheCleared = devTools.clearQueryCache();

    if (storageCleared && queryCacheCleared) {
      console.log('\n✅ All data cleared!');
      console.log('🔄 Please restart the app (press "r" in terminal)\n');
      return true;
    }

    return false;
  },

  /**
   * Log current storage state
   */
  inspectStorage: () => {
    if (!__DEV__) {
      console.warn('⚠️ devTools.inspectStorage() only works in development');
      return;
    }

    const allKeys = storage.getAllKeys();
    console.log(`📦 MMKV Storage (${allKeys.length} keys):\n`);

    allKeys.forEach((key) => {
      const value = storage.getString(key);
      // Don't log full values (can be large), just first 100 chars
      const preview = value
        ? value.substring(0, 100) + (value.length > 100 ? '...' : '')
        : 'null';
      console.log(`${key}:`);
      console.log(`  ${preview}\n`);
    });
  },
};

// Make it available globally in dev mode for console access
if (__DEV__) {
  // @ts-ignore
  global.devTools = devTools;

  console.log(
    '🛠️ DevTools available! Use in console:\n' +
      '   devTools.clearStorage()     - Clear MMKV storage\n' +
      '   devTools.clearQueryCache()  - Clear query cache\n' +
      '   devTools.clearAll()         - Clear everything\n' +
      '   devTools.inspectStorage()   - Inspect storage\n'
  );
}
