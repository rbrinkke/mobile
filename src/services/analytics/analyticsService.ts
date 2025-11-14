/**
 * Analytics Service - Segment Integration
 *
 * Production-ready analytics with Segment SDK
 *
 * Features:
 * - Event tracking with Segment
 * - Screen tracking with navigation
 * - User identification
 * - Session tracking
 * - Offline event queueing (built-in to Segment)
 * - Multiple integrations (Amplitude, Mixpanel, GA, etc.)
 *
 * Setup:
 * 1. Get Write Key from https://segment.com/
 * 2. Add to .env: SEGMENT_WRITE_KEY=your-key-here
 * 3. Segment auto-handles queueing, retries, and batching
 */

import { createClient, AnalyticsProvider, SegmentClient } from '@segment/analytics-react-native';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Application from 'expo-application';

// ============================================================================
// Types
// ============================================================================

interface EventProperties {
  [key: string]: string | number | boolean | null | undefined;
}

interface UserTraits {
  email?: string;
  name?: string;
  username?: string;
  createdAt?: string;
  [key: string]: string | number | boolean | null | undefined;
}

// ============================================================================
// Analytics Service
// ============================================================================

class AnalyticsService {
  private client: SegmentClient | null = null;
  private isInitialized = false;
  private currentScreen: string | null = null;

  /**
   * Initialize Segment Analytics
   */
  async initialize(): Promise<void> {
    const writeKey = process.env.SEGMENT_WRITE_KEY;

    if (!writeKey) {
      console.warn('⚠️  Segment Write Key not configured. Analytics disabled.');
      console.warn('   Add SEGMENT_WRITE_KEY to your .env file for production analytics.');
      return;
    }

    try {
      this.client = createClient({
        writeKey,

        // Track lifecycle events automatically
        trackAppLifecycleEvents: true,

        // Track deep links automatically
        trackDeepLinks: true,

        // Flush events based on conditions
        flushAt: 20, // Flush after 20 events
        flushInterval: 30, // Or every 30 seconds

        // Retry configuration
        maxBatchSize: 100,
        maxQueueSize: 1000,

        // Debug in development
        debug: __DEV__,
      });

      // Add context (device info) to all events
      await this.client.add({
        type: 'context',
        payload: {
          app: {
            name: 'Activity Platform',
            version: Application.nativeApplicationVersion,
            build: Application.nativeBuildVersion,
          },
          device: {
            type: Platform.OS,
            model: Device.modelName,
            manufacturer: Device.manufacturer,
          },
          os: {
            name: Platform.OS,
            version: Device.osVersion,
          },
          screen: {
            width: Device.screenWidth,
            height: Device.screenHeight,
          },
        },
      });

      this.isInitialized = true;
      console.log('✅ Segment Analytics initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Segment:', error);
    }
  }

  /**
   * Identify user
   * Associates all future events with this user
   */
  identify(userId: string, traits: UserTraits = {}): void {
    if (!this.client) {
      if (__DEV__) console.warn('Analytics not initialized');
      return;
    }

    this.client.identify(userId, traits);

    if (__DEV__) console.log('👤 User identified:', userId, traits);
  }

  /**
   * Reset user identity
   * Called on logout - creates new anonymous user
   */
  reset(): void {
    if (!this.client) return;

    this.client.reset();
    this.currentScreen = null;

    if (__DEV__) console.log('🔄 Analytics reset');
  }

  /**
   * Track custom event
   */
  track(eventName: string, properties: EventProperties = {}): void {
    if (!this.client) {
      if (__DEV__) console.warn('Analytics not initialized');
      return;
    }

    this.client.track(eventName, properties);

    if (__DEV__) {
      console.log('📈 Event tracked:', eventName, properties);
    }
  }

  /**
   * Track screen view
   */
  screen(screenName: string, properties: EventProperties = {}): void {
    if (!this.client) return;

    const screenProperties = {
      ...properties,
      previousScreen: this.currentScreen,
    };

    this.currentScreen = screenName;
    this.client.screen(screenName, screenProperties);

    if (__DEV__) {
      console.log('🖥️ Screen tracked:', screenName);
    }
  }

  /**
   * Update user traits
   * Merges with existing traits
   */
  alias(newUserId: string): void {
    if (!this.client) return;
    this.client.alias(newUserId);
  }

  /**
   * Group user into organization/team
   */
  group(groupId: string, traits: EventProperties = {}): void {
    if (!this.client) return;
    this.client.group(groupId, traits);
  }

  // ============================================================================
  // Activity Tracking
  // ============================================================================

  trackActivityCreated(activityId: string, category: string, location?: string): void {
    this.track('Activity Created', {
      activity_id: activityId,
      category,
      location,
    });
  }

  trackActivityJoined(activityId: string, category: string): void {
    this.track('Activity Joined', {
      activity_id: activityId,
      category,
    });
  }

  trackActivityLeft(activityId: string): void {
    this.track('Activity Left', {
      activity_id: activityId,
    });
  }

  trackActivityLiked(activityId: string): void {
    this.track('Activity Liked', {
      activity_id: activityId,
    });
  }

  trackActivityUnliked(activityId: string): void {
    this.track('Activity Unliked', {
      activity_id: activityId,
    });
  }

  trackActivityShared(activityId: string, method: string): void {
    this.track('Activity Shared', {
      activity_id: activityId,
      share_method: method,
    });
  }

  trackActivityDeleted(activityId: string): void {
    this.track('Activity Deleted', {
      activity_id: activityId,
    });
  }

  // ============================================================================
  // Social Tracking
  // ============================================================================

  trackMessageSent(chatId: string, messageLength: number): void {
    this.track('Message Sent', {
      chat_id: chatId,
      message_length: messageLength,
    });
  }

  trackCommentAdded(activityId: string, commentLength: number): void {
    this.track('Comment Added', {
      activity_id: activityId,
      comment_length: commentLength,
    });
  }

  trackProfileViewed(userId: string): void {
    this.track('Profile Viewed', {
      viewed_user_id: userId,
    });
  }

  trackUserFollowed(userId: string): void {
    this.track('User Followed', {
      followed_user_id: userId,
    });
  }

  trackUserUnfollowed(userId: string): void {
    this.track('User Unfollowed', {
      unfollowed_user_id: userId,
    });
  }

  // ============================================================================
  // Discovery & Search
  // ============================================================================

  trackSearch(query: string, resultCount: number, filters?: Record<string, any>): void {
    this.track('Search Performed', {
      query,
      result_count: resultCount,
      ...filters,
    });
  }

  trackFilterApplied(filterType: string, filterValue: string | number): void {
    this.track('Filter Applied', {
      filter_type: filterType,
      filter_value: filterValue,
    });
  }

  trackLocationPermissionGranted(): void {
    this.track('Location Permission Granted');
  }

  trackLocationPermissionDenied(): void {
    this.track('Location Permission Denied');
  }

  // ============================================================================
  // Authentication
  // ============================================================================

  trackSignUp(method: string): void {
    this.track('Signed Up', {
      method, // email, google, apple
    });
  }

  trackSignIn(method: string): void {
    this.track('Signed In', {
      method,
    });
  }

  trackSignOut(): void {
    this.track('Signed Out');
  }

  // ============================================================================
  // Onboarding
  // ============================================================================

  trackOnboardingStarted(): void {
    this.track('Onboarding Started');
  }

  trackOnboardingCompleted(steps: number): void {
    this.track('Onboarding Completed', {
      steps_completed: steps,
    });
  }

  trackOnboardingSkipped(step: number): void {
    this.track('Onboarding Skipped', {
      skipped_at_step: step,
    });
  }

  // ============================================================================
  // Errors
  // ============================================================================

  trackError(error: Error, context?: Record<string, any>): void {
    this.track('Error Occurred', {
      error_message: error.message,
      error_name: error.name,
      ...context,
    });
  }

  // ============================================================================
  // E-commerce (future)
  // ============================================================================

  trackProductViewed(productId: string, productName: string, price: number): void {
    this.track('Product Viewed', {
      product_id: productId,
      product_name: productName,
      price,
    });
  }

  trackCheckoutStarted(value: number, currency: string = 'EUR'): void {
    this.track('Checkout Started', {
      value,
      currency,
    });
  }

  trackPurchaseCompleted(
    orderId: string,
    revenue: number,
    products: Array<{ id: string; name: string; price: number }>
  ): void {
    this.track('Order Completed', {
      order_id: orderId,
      revenue,
      products,
    });
  }

  // ============================================================================
  // Utility
  // ============================================================================

  /**
   * Flush pending events immediately
   * Useful before app backgrounding
   */
  async flush(): Promise<void> {
    if (!this.client) return;

    try {
      await this.client.flush();
      if (__DEV__) console.log('📤 Analytics flushed');
    } catch (error) {
      console.error('Failed to flush analytics:', error);
    }
  }

  /**
   * Cleanup analytics service
   */
  async cleanup(): Promise<void> {
    await this.flush();
    if (__DEV__) console.log('🧹 Analytics cleaned up');
  }

  /**
   * Check if initialized
   */
  get initialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Get Segment client (for advanced usage)
   */
  getClient(): SegmentClient | null {
    return this.client;
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

export const analyticsService = new AnalyticsService();

export default analyticsService;

/**
 * Usage Examples:
 *
 * // Initialize (in App.tsx)
 * await analyticsService.initialize();
 *
 * // Identify user after login
 * analyticsService.identify('user_123', {
 *   email: 'user@example.com',
 *   name: 'John Doe',
 *   plan: 'premium'
 * });
 *
 * // Track events
 * analyticsService.trackActivityCreated('activity_456', 'sports', 'Amsterdam');
 * analyticsService.trackMessageSent('chat_789', 42);
 *
 * // Track screens (use with React Navigation)
 * analyticsService.screen('Activity Detail', { activity_id: '456' });
 *
 * // Reset on logout
 * analyticsService.reset();
 */
