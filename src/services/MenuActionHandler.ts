/**
 * Menu Action Handler - Type-safe action router for SDUI navigation
 *
 * This service handles:
 * 1. Action protocol routing (navigate://, modal://, api://, etc.)
 * 2. Badge count fetching from APIs
 * 3. Global navigation reference management
 *
 * Used by DynamicNavigator and DynamicTopBar for all menu interactions.
 */

import { NavigationContainerRef } from '@react-navigation/native';
import { Alert, Share } from 'react-native';
import type { ActionProtocol } from '../sdui/schema/structure.schema';
import apiClient from './apiClient';
import mockApi from './mockApi';

// ============================================================================
// Global Navigation Reference Management
// ============================================================================

/**
 * Global navigation reference for imperative navigation
 *
 * This follows the official React Navigation pattern for navigating
 * outside of React components (e.g., from service classes, push notifications).
 *
 * Set this reference in App.tsx via setNavigationRef().
 */
let navigationRef: NavigationContainerRef<any> | null = null;

/**
 * Set the global navigation reference
 *
 * Call this in App.tsx when NavigationContainer is ready:
 * ```tsx
 * <NavigationContainer
 *   ref={navRef}
 *   onReady={() => setNavigationRef(navRef.current)}
 * >
 * ```
 */
export function setNavigationRef(ref: NavigationContainerRef<any> | null) {
  navigationRef = ref;
  if (__DEV__ && ref) {
    console.log('[MenuActionHandler] ✅ Navigation reference set');
  }
}

/**
 * Get the current navigation reference (for testing/debugging)
 */
export function getNavigationRef(): NavigationContainerRef<any> | null {
  return navigationRef;
}

// ============================================================================
// Menu Action Handler Class
// ============================================================================

/**
 * Menu Action Handler - Routes actions to appropriate handlers
 *
 * This is the central dispatcher for all menu actions in the app.
 */
export class MenuActionHandler {
  /**
   * Execute an action protocol
   *
   * @param action - The action protocol to execute (e.g., 'navigate://profile')
   * @param context - Optional context data to pass to the action
   *
   * @example
   * ```typescript
   * // Navigate to profile
   * MenuActionHandler.execute('navigate://profile');
   *
   * // Open modal with data
   * MenuActionHandler.execute('modal://create-activity', { userId: '123' });
   *
   * // Share content
   * MenuActionHandler.execute('share://activity', { activityId: '456' });
   * ```
   */
  static execute(action: ActionProtocol, context?: Record<string, any>): void {
    if (action === 'none') {
      return; // No-op action
    }

    // Parse action protocol
    const [type, path] = action.split('://') as [string, string];

    if (__DEV__) {
      console.log(`[MenuActionHandler] Executing: ${action}`, context);
    }

    switch (type) {
      case 'navigate':
        this.handleNavigate(path, context);
        break;

      case 'modal':
        this.handleModal(path, context);
        break;

      case 'bottomsheet':
        this.handleBottomSheet(path, context);
        break;

      case 'share':
        this.handleShare(path, context);
        break;

      case 'api':
        this.handleApiCall(path, context);
        break;

      case 'confirm':
        this.handleConfirm(path, context);
        break;

      default:
        if (__DEV__) {
          console.warn(`[MenuActionHandler] ⚠️ Unknown action type: ${type}`);
        }
    }
  }

  /**
   * Handle navigate:// actions
   *
   * Navigates to a screen in the app.
   *
   * @example
   * - navigate://profile → Navigate to profile screen
   * - navigate://discover → Navigate to discover tab
   */
  private static handleNavigate(screenName: string, params?: Record<string, any>): void {
    if (!navigationRef) {
      if (__DEV__) {
        console.error('[MenuActionHandler] ❌ Navigation reference not set. Call setNavigationRef() in App.tsx');
      }
      return;
    }

    try {
      navigationRef.navigate(screenName as any, params);
    } catch (error) {
      if (__DEV__) {
        console.error(`[MenuActionHandler] ❌ Navigation failed to: ${screenName}`, error);
      }
    }
  }

  /**
   * Handle modal:// actions
   *
   * Opens a modal screen.
   *
   * @example
   * - modal://create-activity → Open create activity modal
   * - modal://filters → Open filters modal
   */
  private static handleModal(modalName: string, params?: Record<string, any>): void {
    if (!navigationRef) {
      if (__DEV__) {
        console.error('[MenuActionHandler] ❌ Navigation reference not set');
      }
      return;
    }

    try {
      // Navigate to a modal stack/screen
      // Adjust this based on your navigation structure
      navigationRef.navigate('Modal' as any, { screen: modalName, ...params });
    } catch (error) {
      if (__DEV__) {
        console.error(`[MenuActionHandler] ❌ Modal navigation failed: ${modalName}`, error);
      }
    }
  }

  /**
   * Handle bottomsheet:// actions
   *
   * Opens a bottom sheet (requires a global bottom sheet service).
   *
   * @example
   * - bottomsheet://filters → Open filters bottom sheet
   * - bottomsheet://sort-options → Open sort options
   *
   * TODO: Implement global BottomSheet service (e.g., using @gorhom/bottom-sheet)
   */
  private static handleBottomSheet(sheetName: string, params?: Record<string, any>): void {
    if (__DEV__) {
      console.log(`[MenuActionHandler] 📋 Bottom sheet requested: ${sheetName}`, params);
      Alert.alert(
        'Bottom Sheet',
        `This would open: ${sheetName}\n\nTODO: Implement global BottomSheet service`,
        [{ text: 'OK' }]
      );
    }

    // TODO: Integrate with a global bottom sheet service
    // Example with @gorhom/bottom-sheet:
    // BottomSheetService.open(sheetName, params);
  }

  /**
   * Handle share:// actions
   *
   * Opens the native share sheet.
   *
   * @example
   * - share://activity → Share activity content
   * - share://profile → Share profile link
   */
  private static async handleShare(contentType: string, params?: Record<string, any>): Promise<void> {
    try {
      // Build share content based on type and params
      const shareContent = this.buildShareContent(contentType, params);

      await Share.share({
        message: shareContent.message,
        url: shareContent.url,
        title: shareContent.title,
      });

      if (__DEV__) {
        console.log(`[MenuActionHandler] ✅ Share completed: ${contentType}`);
      }
    } catch (error) {
      if (__DEV__) {
        console.error(`[MenuActionHandler] ❌ Share failed: ${contentType}`, error);
      }
    }
  }

  /**
   * Handle api:// actions
   *
   * Executes an API call (typically for actions like "mark all as read").
   *
   * @example
   * - api://reset-data → Call reset data endpoint
   * - api://mark-notifications-read → Mark all notifications as read
   */
  private static async handleApiCall(endpoint: string, params?: Record<string, any>): Promise<void> {
    try {
      if (__DEV__) {
        console.log(`[MenuActionHandler] 🌐 API call: ${endpoint}`, params);
      }

      // Execute API call via apiClient
      // For actions (not queries), you might need a different method
      // For now, we'll use the query method
      await apiClient.query({
        query_name: endpoint,
        ...params,
      });

      if (__DEV__) {
        console.log(`[MenuActionHandler] ✅ API call completed: ${endpoint}`);
      }
    } catch (error) {
      if (__DEV__) {
        console.error(`[MenuActionHandler] ❌ API call failed: ${endpoint}`, error);
      }
      Alert.alert('Error', `API call failed: ${endpoint}`);
    }
  }

  /**
   * Handle confirm:// actions
   *
   * Shows a confirmation dialog before executing a destructive action.
   *
   * @example
   * - confirm://delete-account → Confirm account deletion
   * - confirm://block-user → Confirm blocking a user
   */
  private static handleConfirm(actionName: string, params?: Record<string, any>): void {
    const confirmations: Record<string, { title: string; message: string; action: () => void }> = {
      'block-user': {
        title: 'Block User',
        message: 'Are you sure you want to block this user?',
        action: () => {
          if (__DEV__) console.log('[MenuActionHandler] User blocked', params);
        },
      },
      'delete-activity': {
        title: 'Delete Activity',
        message: 'Are you sure you want to delete this activity?',
        action: () => {
          if (__DEV__) console.log('[MenuActionHandler] Activity deleted', params);
        },
      },
      // Add more confirmations as needed
    };

    const config = confirmations[actionName];

    if (!config) {
      if (__DEV__) {
        console.warn(`[MenuActionHandler] ⚠️ Unknown confirmation: ${actionName}`);
      }
      return;
    }

    Alert.alert(config.title, config.message, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        style: 'destructive',
        onPress: config.action,
      },
    ]);
  }

  /**
   * Build share content based on type and params
   */
  private static buildShareContent(
    contentType: string,
    params?: Record<string, any>
  ): { message: string; url?: string; title?: string } {
    // Customize share content based on type
    switch (contentType) {
      case 'activity':
        return {
          title: 'Check out this activity!',
          message: `Join me for: ${params?.title || 'an activity'}`,
          url: `https://app.example.com/activity/${params?.id}`,
        };
      case 'profile':
        return {
          title: 'Check out this profile!',
          message: `Connect with ${params?.name || 'this user'}`,
          url: `https://app.example.com/profile/${params?.id}`,
        };
      default:
        return {
          message: 'Check this out!',
        };
    }
  }

  // ==========================================================================
  // Badge Count Fetching
  // ==========================================================================

  /**
   * Get badge count from an API source
   *
   * Used by DynamicNavigator and DynamicTopBar to fetch live badge counts.
   *
   * @param source - The API source (e.g., 'api://messages/unread-count')
   * @returns Promise that resolves to the badge count
   *
   * @example
   * ```typescript
   * const count = await MenuActionHandler.getBadgeCount('api://messages/unread-count');
   * console.log(`You have ${count} unread messages`);
   * ```
   *
   * Expected API response format:
   * ```json
   * { "count": 42 }
   * ```
   */
  static async getBadgeCount(source: ActionProtocol): Promise<number> {
    if (!source.startsWith('api://')) {
      if (__DEV__) {
        console.warn(`[MenuActionHandler] ⚠️ Invalid badge source: ${source}`);
      }
      return 0;
    }

    // Extract query name from protocol
    const queryName = source.replace('api://', '');

    try {
      // Use mock API in development mode (no backend required)
      const data = __DEV__
        ? await mockApi.query({ query_name: queryName })
        : await apiClient.query({ query_name: queryName });

      // Expected format: { count: number }
      if (typeof data.count === 'number') {
        return data.count;
      }

      if (__DEV__) {
        console.warn(
          `[MenuActionHandler] ⚠️ API response missing 'count' field for: ${queryName}`,
          data
        );
      }

      return 0;
    } catch (error) {
      if (__DEV__) {
        console.error(`[MenuActionHandler] ❌ Badge count fetch failed: ${queryName}`, error);
      }
      return 0;
    }
  }
}

/**
 * Default export for convenience
 */
export default MenuActionHandler;
