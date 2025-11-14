/**
 * Connection State Hook - Network monitoring with NetInfo
 *
 * Features:
 * - Real-time connection state monitoring
 * - Automatic query invalidation on reconnect
 * - Connection type detection (wifi, cellular, etc.)
 */
import { useState, useEffect } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { useQueryClient } from '@tanstack/react-query';

export interface ConnectionState {
  isOnline: boolean;
  isInternetReachable: boolean | null;
  type: string | null;
  details: NetInfoState['details'] | null;
}

/**
 * Hook to monitor network connection state
 * Automatically refetches all queries when coming back online
 */
export function useConnectionState() {
  const queryClient = useQueryClient();
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    isOnline: true,
    isInternetReachable: null,
    type: null,
    details: null,
  });

  useEffect(() => {
    // Get initial state
    NetInfo.fetch().then(state => {
      setConnectionState({
        isOnline: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
        details: state.details,
      });
    });

    // Subscribe to network state changes
    const unsubscribe = NetInfo.addEventListener(state => {
      const wasOffline = !connectionState.isOnline;
      const isNowOnline = state.isConnected ?? false;

      setConnectionState({
        isOnline: isNowOnline,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
        details: state.details,
      });

      // Refetch all queries when coming back online
      if (wasOffline && isNowOnline) {
        console.log('🌐 Back online - refetching queries');
        queryClient.invalidateQueries();
      }

      // Log connection changes (development only)
      if (__DEV__) {
        console.log('Network state:', {
          type: state.type,
          isConnected: state.isConnected,
          isInternetReachable: state.isInternetReachable,
        });
      }
    });

    return () => unsubscribe();
  }, [queryClient, connectionState.isOnline]);

  return connectionState;
}

/**
 * Simple hook that returns just online/offline status
 * Use this when you only need basic connectivity info
 */
export function useIsOnline(): boolean {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    NetInfo.fetch().then(state => {
      setIsOnline(state.isConnected ?? false);
    });

    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? false);
    });

    return () => unsubscribe();
  }, []);

  return isOnline;
}
