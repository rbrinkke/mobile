/**
 * TanStack Query Client Configuration
 *
 * Centralized query client with MMKV persistence
 * for instant app startup and offline-first experience
 */
import { QueryClient } from '@tanstack/react-query';
import { createSyncStoragePersister } from '@tanstack/react-query-persist-client';
import { storage, mmkvStorage } from './storage';

export { storage };

/**
 * Query Client with optimized mobile settings
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1 * 60 * 1000, // 1 minute default (adjust per query)
      gcTime: 24 * 60 * 60 * 1000, // 24 hours cache
      retry: 2, // Retry failed requests twice
      refetchOnWindowFocus: true, // ✅ Refetch when app comes to foreground
      refetchOnReconnect: true, // ✅ Refetch when network reconnects
      refetchOnMount: true, // ✅ Refetch stale data when component mounts
    },
    mutations: {
      retry: 1, // Retry mutations once on failure
    },
  },
});

/**
 * MMKV Persister for instant app startup
 * Data persists to disk and loads synchronously (30x faster!)
 */
export const persister = createSyncStoragePersister({
  storage: mmkvStorage,
});
