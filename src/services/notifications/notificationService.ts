/**
 * Push Notification Service - Production-Ready Expo Notifications
 *
 * Features:
 * - Expo push notifications integration
 * - Automatic token registration
 * - Notification listeners (received, response)
 * - Permission handling
 * - Badge count management
 * - Notification channels (Android)
 * - Deep link handling from notifications
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { storage } from '@api/storage';
import apiClient from '@api/client';

// ============================================================================
// Types
// ============================================================================

interface NotificationContent {
  title: string;
  body: string;
  data?: Record<string, any>;
  badge?: number;
  sound?: boolean | string;
}

interface NotificationChannel {
  id: string;
  name: string;
  importance: Notifications.AndroidImportance;
  sound?: string;
  vibrationPattern?: number[];
  lightColor?: string;
}

export type NotificationHandler = (
  notification: Notifications.Notification
) => void;

export type NotificationResponseHandler = (
  response: Notifications.NotificationResponse
) => void;

// ============================================================================
// Notification Configuration
// ============================================================================

// Configure how notifications are handled when app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// ============================================================================
// Notification Service
// ============================================================================

class NotificationService {
  private readonly PUSH_TOKEN_KEY = 'push_notification_token';
  private readonly BADGE_COUNT_KEY = 'notification_badge_count';

  private pushToken: string | null = null;
  private notificationListener: Notifications.Subscription | null = null;
  private responseListener: Notifications.Subscription | null = null;

  /**
   * Initialize notification service
   * - Requests permissions
   * - Registers push token
   * - Sets up notification channels (Android)
   * - Configures listeners
   */
  async initialize(): Promise<void> {
    if (!Device.isDevice) {
      if (__DEV__) {
        console.warn('⚠️ Push notifications only work on physical devices');
      }
      return;
    }

    try {
      // Request permissions
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        if (__DEV__) console.warn('⚠️ Notification permissions denied');
        return;
      }

      // Setup Android notification channels
      if (Platform.OS === 'android') {
        await this.setupNotificationChannels();
      }

      // Register push token
      await this.registerPushToken();

      if (__DEV__) console.log('🔔 Notification service initialized');
    } catch (error) {
      if (__DEV__) console.error('❌ Notification initialization failed:', error);
    }
  }

  /**
   * Request notification permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();

      let finalStatus = existingStatus;

      // Ask for permission if not granted
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        if (__DEV__) console.warn('⚠️ Notification permission not granted');
        return false;
      }

      return true;
    } catch (error) {
      if (__DEV__) console.error('❌ Permission request failed:', error);
      return false;
    }
  }

  /**
   * Setup Android notification channels
   * - Required for Android 8.0+
   * - Allows users to control notification behavior per channel
   */
  private async setupNotificationChannels(): Promise<void> {
    const channels: NotificationChannel[] = [
      {
        id: 'default',
        name: 'Default Notifications',
        importance: Notifications.AndroidImportance.DEFAULT,
        sound: 'default',
      },
      {
        id: 'activity-updates',
        name: 'Activity Updates',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
        vibrationPattern: [0, 250, 250, 250],
      },
      {
        id: 'messages',
        name: 'Messages',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'message.wav',
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4A90E2',
      },
      {
        id: 'social',
        name: 'Social Interactions',
        importance: Notifications.AndroidImportance.DEFAULT,
        sound: 'default',
      },
    ];

    for (const channel of channels) {
      await Notifications.setNotificationChannelAsync(channel.id, {
        name: channel.name,
        importance: channel.importance,
        sound: channel.sound,
        vibrationPattern: channel.vibrationPattern,
        lightColor: channel.lightColor,
      });
    }

    if (__DEV__) console.log('📱 Android notification channels configured');
  }

  /**
   * Register push token with backend
   */
  async registerPushToken(): Promise<void> {
    try {
      // Get push token from Expo
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
      });

      this.pushToken = tokenData.data;

      // Store locally
      storage.set(this.PUSH_TOKEN_KEY, this.pushToken);

      // Register with backend
      await apiClient.post('/api/notifications/register', {
        pushToken: this.pushToken,
        platform: Platform.OS,
        deviceName: Device.deviceName,
        osVersion: Device.osVersion,
      });

      if (__DEV__) console.log('✅ Push token registered:', this.pushToken);
    } catch (error) {
      if (__DEV__) console.error('❌ Push token registration failed:', error);
      throw error;
    }
  }

  /**
   * Get stored push token
   */
  getPushToken(): string | null {
    if (this.pushToken) return this.pushToken;

    const stored = storage.getString(this.PUSH_TOKEN_KEY);
    if (stored) {
      this.pushToken = stored;
      return stored;
    }

    return null;
  }

  /**
   * Unregister push token (on logout)
   */
  async unregisterPushToken(): Promise<void> {
    const token = this.getPushToken();
    if (!token) return;

    try {
      await apiClient.post('/api/notifications/unregister', {
        pushToken: token,
      });

      this.pushToken = null;
      storage.delete(this.PUSH_TOKEN_KEY);

      if (__DEV__) console.log('✅ Push token unregistered');
    } catch (error) {
      if (__DEV__) console.error('❌ Push token unregister failed:', error);
    }
  }

  /**
   * Setup notification listener
   * - Called when notification is received while app is foregrounded
   */
  addNotificationReceivedListener(
    handler: NotificationHandler
  ): Notifications.Subscription {
    return Notifications.addNotificationReceivedListener(handler);
  }

  /**
   * Setup notification response listener
   * - Called when user taps notification
   */
  addNotificationResponseListener(
    handler: NotificationResponseHandler
  ): Notifications.Subscription {
    return Notifications.addNotificationResponseReceivedListener(handler);
  }

  /**
   * Remove notification listener
   */
  removeNotificationListener(subscription: Notifications.Subscription): void {
    subscription.remove();
  }

  /**
   * Schedule local notification
   */
  async scheduleNotification(
    content: NotificationContent,
    trigger: Notifications.NotificationTriggerInput
  ): Promise<string> {
    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: content.title,
          body: content.body,
          data: content.data,
          badge: content.badge,
          sound: content.sound,
        },
        trigger,
      });

      if (__DEV__) console.log('🔔 Notification scheduled:', id);

      return id;
    } catch (error) {
      if (__DEV__) console.error('❌ Notification schedule failed:', error);
      throw error;
    }
  }

  /**
   * Present local notification immediately
   */
  async presentNotification(content: NotificationContent): Promise<string> {
    return this.scheduleNotification(content, null);
  }

  /**
   * Cancel scheduled notification
   */
  async cancelNotification(notificationId: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  /**
   * Dismiss notification from notification tray
   */
  async dismissNotification(notificationId: string): Promise<void> {
    await Notifications.dismissNotificationAsync(notificationId);
  }

  /**
   * Dismiss all notifications from notification tray
   */
  async dismissAllNotifications(): Promise<void> {
    await Notifications.dismissAllNotificationsAsync();
  }

  /**
   * Get badge count
   */
  async getBadgeCount(): Promise<number> {
    return (await Notifications.getBadgeCountAsync()) || 0;
  }

  /**
   * Set badge count
   */
  async setBadgeCount(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count);
    storage.set(this.BADGE_COUNT_KEY, count.toString());
  }

  /**
   * Increment badge count
   */
  async incrementBadgeCount(): Promise<void> {
    const current = await this.getBadgeCount();
    await this.setBadgeCount(current + 1);
  }

  /**
   * Decrement badge count
   */
  async decrementBadgeCount(): Promise<void> {
    const current = await this.getBadgeCount();
    const newCount = Math.max(0, current - 1);
    await this.setBadgeCount(newCount);
  }

  /**
   * Clear badge count
   */
  async clearBadgeCount(): Promise<void> {
    await this.setBadgeCount(0);
  }

  /**
   * Get notification that opened the app
   * - Returns null if app was not opened from notification
   */
  async getInitialNotification(): Promise<Notifications.NotificationResponse | null> {
    return await Notifications.getLastNotificationResponseAsync();
  }

  /**
   * Cleanup notification service
   * - Remove listeners
   * - Clear badge count
   */
  cleanup(): void {
    if (this.notificationListener) {
      this.notificationListener.remove();
      this.notificationListener = null;
    }

    if (this.responseListener) {
      this.responseListener.remove();
      this.responseListener = null;
    }

    if (__DEV__) console.log('🧹 Notification service cleaned up');
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

export const notificationService = new NotificationService();

export default notificationService;
