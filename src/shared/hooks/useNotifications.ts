/**
 * useNotifications Hook - Push Notification Management
 *
 * Features:
 * - React hook for notification handling
 * - Automatic listener setup/cleanup
 * - Badge count management
 * - Deep link navigation from notifications
 */

import { useEffect, useState, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { notificationService } from '@services/notifications/notificationService';

interface UseNotificationsReturn {
  badgeCount: number;
  incrementBadge: () => Promise<void>;
  decrementBadge: () => Promise<void>;
  clearBadge: () => Promise<void>;
  hasPermission: boolean;
  requestPermission: () => Promise<boolean>;
}

/**
 * Hook for notification handling
 *
 * @example
 * ```tsx
 * function App() {
 *   const { badgeCount, clearBadge } = useNotifications();
 *
 *   return (
 *     <View>
 *       <Text>Unread: {badgeCount}</Text>
 *       <Button onPress={clearBadge}>Clear</Button>
 *     </View>
 *   );
 * }
 * ```
 */
export function useNotifications(): UseNotificationsReturn {
  const navigation = useNavigation();
  const [badgeCount, setBadgeCount] = useState(0);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    // Initialize badge count
    notificationService.getBadgeCount().then(setBadgeCount);

    // Check permission status
    Notifications.getPermissionsAsync().then(({ status }) => {
      setHasPermission(status === 'granted');
    });

    // Handle notifications received while app is foregrounded
    const notificationListener =
      notificationService.addNotificationReceivedListener((notification) => {
        if (__DEV__) {
          console.log('🔔 Notification received:', notification);
        }

        // Increment badge
        notificationService.incrementBadgeCount().then(() => {
          notificationService.getBadgeCount().then(setBadgeCount);
        });
      });

    // Handle notification tap
    const responseListener =
      notificationService.addNotificationResponseListener((response) => {
        if (__DEV__) {
          console.log('👆 Notification tapped:', response);
        }

        handleNotificationNavigation(response.notification);
      });

    // Handle initial notification (app opened from notification)
    notificationService.getInitialNotification().then((response) => {
      if (response) {
        handleNotificationNavigation(response.notification);
      }
    });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);

  /**
   * Handle navigation from notification
   */
  const handleNotificationNavigation = useCallback(
    (notification: Notifications.Notification) => {
      const data = notification.request.content.data;

      if (!data) return;

      // Navigate based on notification type
      switch (data.type) {
        case 'activity:updated':
          if (data.activityId) {
            navigation.navigate('ActivityDetail' as never, {
              activityId: data.activityId,
            } as never);
          }
          break;

        case 'activity:user_joined':
          if (data.activityId) {
            navigation.navigate('ActivityDetail' as never, {
              activityId: data.activityId,
            } as never);
          }
          break;

        case 'message:new':
          if (data.chatId) {
            navigation.navigate('ChatDetail' as never, {
              chatId: data.chatId,
            } as never);
          }
          break;

        case 'activity:like_added':
          if (data.activityId) {
            navigation.navigate('ActivityDetail' as never, {
              activityId: data.activityId,
            } as never);
          }
          break;

        default:
          if (__DEV__) {
            console.log('Unknown notification type:', data.type);
          }
      }
    },
    [navigation]
  );

  /**
   * Increment badge count
   */
  const incrementBadge = useCallback(async () => {
    await notificationService.incrementBadgeCount();
    const count = await notificationService.getBadgeCount();
    setBadgeCount(count);
  }, []);

  /**
   * Decrement badge count
   */
  const decrementBadge = useCallback(async () => {
    await notificationService.decrementBadgeCount();
    const count = await notificationService.getBadgeCount();
    setBadgeCount(count);
  }, []);

  /**
   * Clear badge count
   */
  const clearBadge = useCallback(async () => {
    await notificationService.clearBadgeCount();
    setBadgeCount(0);
  }, []);

  /**
   * Request notification permission
   */
  const requestPermission = useCallback(async () => {
    const granted = await notificationService.requestPermissions();
    setHasPermission(granted);
    return granted;
  }, []);

  return {
    badgeCount,
    incrementBadge,
    decrementBadge,
    clearBadge,
    hasPermission,
    requestPermission,
  };
}

/**
 * Hook for displaying badge count on tab bar
 */
export function useTabBarBadge(count: number): number | undefined {
  return count > 0 ? count : undefined;
}
