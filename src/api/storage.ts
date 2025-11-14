/**
 * MMKV Storage Service
 * 30x faster than AsyncStorage with synchronous operations
 *
 * Features:
 * - Lightning-fast read/write operations
 * - Encryption support
 * - Type-safe API
 * - Used for TanStack Query persistence and Zustand
 */
import { MMKV } from 'react-native-mmkv';

// Create default storage instance
export const storage = new MMKV({
  id: 'app-storage',
  // Optional: Enable encryption
  // encryptionKey: 'your-encryption-key',
});

/**
 * Storage adapter for TanStack Query persistence
 */
export const mmkvStorage = {
  getItem: (key: string) => {
    const value = storage.getString(key);
    return value ?? null;
  },
  setItem: (key: string, value: string) => {
    storage.set(key, value);
  },
  removeItem: (key: string) => {
    storage.delete(key);
  },
};

/**
 * Type-safe storage helpers
 */
export const storageHelpers = {
  // Get string value
  getString: (key: string): string | undefined => storage.getString(key),

  // Get number value
  getNumber: (key: string): number | undefined => storage.getNumber(key),

  // Get boolean value
  getBoolean: (key: string): boolean | undefined => storage.getBoolean(key),

  // Get JSON object
  getObject: <T>(key: string): T | undefined => {
    const json = storage.getString(key);
    return json ? JSON.parse(json) : undefined;
  },

  // Set string value
  setString: (key: string, value: string) => storage.set(key, value),

  // Set number value
  setNumber: (key: string, value: number) => storage.set(key, value),

  // Set boolean value
  setBoolean: (key: string, value: boolean) => storage.set(key, value),

  // Set JSON object
  setObject: <T>(key: string, value: T) =>
    storage.set(key, JSON.stringify(value)),

  // Delete value
  delete: (key: string) => storage.delete(key),

  // Clear all storage
  clearAll: () => storage.clearAll(),

  // Get all keys
  getAllKeys: () => storage.getAllKeys(),
};

export default storage;
