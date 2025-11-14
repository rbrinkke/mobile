/**
 * useSocketEvent Hook - Type-Safe Socket Event Subscription
 *
 * Features:
 * - Automatic cleanup on unmount
 * - Type-safe event handling
 * - Optional query invalidation
 * - Memory leak prevention
 */

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { socketService, SocketEventHandler } from '@services/socket/socketClient';

interface UseSocketEventOptions<T> {
  /**
   * Event name to listen for
   */
  event: string;

  /**
   * Event handler callback
   */
  onEvent: (data: T) => void;

  /**
   * Optional: Query keys to invalidate when event is received
   */
  invalidateQueries?: any[];

  /**
   * Optional: Only subscribe when this is true
   */
  enabled?: boolean;
}

/**
 * Subscribe to socket events with automatic cleanup
 *
 * @example
 * ```typescript
 * useSocketEvent({
 *   event: 'activity:updated',
 *   onEvent: (activity) => {
 *     console.log('Activity updated:', activity);
 *   },
 *   invalidateQueries: [queryKeys.activities.detail(activityId)],
 * });
 * ```
 */
export function useSocketEvent<T = any>(options: UseSocketEventOptions<T>): void {
  const { event, onEvent, invalidateQueries, enabled = true } = options;
  const queryClient = useQueryClient();

  // Use ref to avoid recreating handler on every render
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  // Create stable handler with query invalidation
  const handler = useCallback<SocketEventHandler<T>>(
    (data) => {
      // Call user's handler
      onEventRef.current(data);

      // Invalidate queries if specified
      if (invalidateQueries && invalidateQueries.length > 0) {
        invalidateQueries.forEach((queryKey) => {
          queryClient.invalidateQueries({ queryKey });
        });
      }
    },
    [invalidateQueries, queryClient]
  );

  useEffect(() => {
    if (!enabled) return;

    // Subscribe to event
    socketService.on(event, handler);

    // Cleanup on unmount
    return () => {
      socketService.off(event, handler);
    };
  }, [event, handler, enabled]);
}

/**
 * Subscribe to multiple socket events
 *
 * @example
 * ```typescript
 * useSocketEvents({
 *   'activity:updated': (activity) => console.log('Updated:', activity),
 *   'activity:deleted': (id) => console.log('Deleted:', id),
 * });
 * ```
 */
export function useSocketEvents(
  eventHandlers: Record<string, SocketEventHandler>,
  enabled = true
): void {
  useEffect(() => {
    if (!enabled) return;

    // Subscribe to all events
    Object.entries(eventHandlers).forEach(([event, handler]) => {
      socketService.on(event as any, handler);
    });

    // Cleanup on unmount
    return () => {
      Object.entries(eventHandlers).forEach(([event, handler]) => {
        socketService.off(event as any, handler);
      });
    };
  }, [eventHandlers, enabled]);
}

/**
 * Hook to get socket connection status
 */
export function useSocketConnection() {
  const [isConnected, setIsConnected] = useState(socketService.isConnected());

  useEffect(() => {
    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    socketService.on('connect' as any, handleConnect);
    socketService.on('disconnect' as any, handleDisconnect);

    return () => {
      socketService.off('connect' as any, handleConnect);
      socketService.off('disconnect' as any, handleDisconnect);
    };
  }, []);

  return {
    isConnected,
    reconnectAttempts: socketService.getReconnectAttempts(),
  };
}
