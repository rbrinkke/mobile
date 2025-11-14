/**
 * useOfflineMutation - Offline-First Mutations
 *
 * Features:
 * - Automatic queueing when offline
 * - Optimistic updates work offline
 * - Automatic sync when back online
 * - Type-safe mutation handling
 */

import React from 'react';
import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import NetInfo from '@react-native-community/netinfo';
import { offlineQueue } from '@services/offline/offlineQueue';

interface OfflineMutationOptions<TData, TVariables, TContext> {
  /**
   * Standard mutation function
   */
  mutationFn: (variables: TVariables) => Promise<TData>;

  /**
   * API endpoint for offline queue
   */
  endpoint: string | ((variables: TVariables) => string);

  /**
   * HTTP method
   */
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

  /**
   * Optimistic update function
   */
  onMutate?: (variables: TVariables) => Promise<TContext> | TContext;

  /**
   * Error handler
   */
  onError?: (error: any, variables: TVariables, context: TContext | undefined) => void;

  /**
   * Success handler
   */
  onSuccess?: (data: TData, variables: TVariables, context: TContext | undefined) => void;

  /**
   * Finally handler
   */
  onSettled?: (
    data: TData | undefined,
    error: any,
    variables: TVariables,
    context: TContext | undefined
  ) => void;

  /**
   * Max retry attempts in offline queue
   */
  maxRetries?: number;
}

/**
 * Offline-first mutation hook
 *
 * @example
 * ```typescript
 * const likeMutation = useOfflineMutation({
 *   mutationFn: (activityId) => activitiesApi.likeActivity(activityId),
 *   endpoint: (activityId) => `/api/activities/${activityId}/like`,
 *   method: 'POST',
 *   onMutate: async (activityId) => {
 *     // Optimistic update
 *     const previous = queryClient.getQueryData(['activities']);
 *     queryClient.setQueryData(['activities'], (old) => updateActivity(old, activityId));
 *     return { previous };
 *   },
 *   onError: (err, vars, context) => {
 *     // Rollback on error
 *     queryClient.setQueryData(['activities'], context?.previous);
 *   },
 * });
 * ```
 */
export function useOfflineMutation<
  TData = unknown,
  TVariables = void,
  TContext = unknown
>(
  options: OfflineMutationOptions<TData, TVariables, TContext>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: TVariables) => {
      const netInfo = await NetInfo.fetch();

      if (!netInfo.isConnected) {
        // Add to offline queue
        const endpoint =
          typeof options.endpoint === 'function'
            ? options.endpoint(variables)
            : options.endpoint;

        offlineQueue.addToQueue(
          {
            endpoint,
            method: options.method,
            data: variables,
          },
          {
            maxRetries: options.maxRetries,
          }
        );

        // Throw offline error (optimistic update will still apply)
        throw new OfflineError('Mutation queued for offline processing');
      }

      // Online - execute normally
      return options.mutationFn(variables);
    },
    onMutate: options.onMutate,
    onError: (error, variables, context) => {
      // Don't call error handler for offline queue
      if (error instanceof OfflineError) {
        if (__DEV__) console.log('📥 Mutation queued (offline)');
        return;
      }

      options.onError?.(error, variables, context);
    },
    onSuccess: options.onSuccess,
    onSettled: options.onSettled,
  });
}

/**
 * Custom error for offline mutations
 */
export class OfflineError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OfflineError';
  }
}

/**
 * Hook to show offline queue status
 */
export function useOfflineQueueStatus() {
  const [status, setStatus] = React.useState(offlineQueue.getQueueStatus());

  React.useEffect(() => {
    // Update status every 5 seconds
    const interval = setInterval(() => {
      setStatus(offlineQueue.getQueueStatus());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return status;
}
