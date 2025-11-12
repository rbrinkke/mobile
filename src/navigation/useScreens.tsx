/**
 * useScreens - Screen mapping helper for DynamicNavigator
 *
 * Maps pageId strings to actual React Native screen components.
 * Used by DynamicNavigator to dynamically create bottom tab screens.
 *
 * When you add a new screen:
 * 1. Import the screen component
 * 2. Add it to the screens map
 * 3. Use the pageId in structure.json
 *
 * Example:
 * ```typescript
 * // In structure.json
 * { "pageId": "discover", ... }
 *
 * // Maps to:
 * screens["discover"] // => DiscoverScreen component
 * ```
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Import all screen components
import ActivityScreen from '../screens/ActivityScreen';
import ChatsScreen from '../screens/ChatsScreen';
import DemoScreen from '../screens/DemoScreen';
import DiscoverScreen from '../screens/DiscoverScreen';
import ForMeScreen from '../screens/ForMeScreen';
import ProfileScreen from '../screens/ProfileScreen';

/**
 * Fallback component for undefined pages
 *
 * Shows a helpful error message in development.
 */
function PageNotFoundScreen({ route }: any) {
  const pageId = route?.params?.pageId || 'unknown';

  return (
    <View style={styles.fallbackContainer}>
      <Text style={styles.fallbackEmoji}>🔍</Text>
      <Text style={styles.fallbackTitle}>Page Not Found</Text>
      <Text style={styles.fallbackText}>
        No screen component registered for pageId: "{pageId}"
      </Text>
      {__DEV__ && (
        <Text style={styles.fallbackHint}>
          Add this screen to src/navigation/useScreens.ts
        </Text>
      )}
    </View>
  );
}

/**
 * Screen registry - Maps pageId to React Native screen component
 *
 * This is the source of truth for which screens exist in the app.
 */
export const screens: Record<string, React.ComponentType<any>> = {
  // Main screens
  demo: DemoScreen,
  activity: ActivityScreen,
  forme: ForMeScreen,
  discover: DiscoverScreen,
  chats: ChatsScreen,
  profile: ProfileScreen,

  // Fallback for undefined pages
  'page-not-found': PageNotFoundScreen,
};

/**
 * Hook to access screen registry
 *
 * @returns Object with screens map and helper methods
 *
 * @example
 * ```typescript
 * const { screens, getScreen } = useScreens();
 * const Screen = getScreen('discover'); // Returns DiscoverScreen
 * ```
 */
export function useScreens() {
  /**
   * Get a screen component by pageId
   *
   * @param pageId - The page identifier from structure.json
   * @returns Screen component or fallback
   */
  const getScreen = (pageId: string): React.ComponentType<any> => {
    const screen = screens[pageId];

    if (!screen) {
      if (__DEV__) {
        console.warn(`[useScreens] ⚠️ Screen not found for pageId: "${pageId}"`);
      }
      return PageNotFoundScreen;
    }

    return screen;
  };

  /**
   * Check if a screen exists
   *
   * @param pageId - The page identifier
   * @returns true if screen exists
   */
  const hasScreen = (pageId: string): boolean => {
    return pageId in screens && screens[pageId] !== PageNotFoundScreen;
  };

  /**
   * Get all available pageIds
   *
   * @returns Array of registered pageIds
   */
  const getAvailablePageIds = (): string[] => {
    return Object.keys(screens).filter((id) => id !== 'page-not-found');
  };

  return {
    screens,
    getScreen,
    hasScreen,
    getAvailablePageIds,
  };
}

/**
 * Default export for convenience
 */
export default useScreens;

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F7F7F7',
  },
  fallbackEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  fallbackTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  fallbackText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 16,
  },
  fallbackHint: {
    fontSize: 14,
    color: '#FF6B6B',
    fontFamily: 'monospace',
    textAlign: 'center',
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
});
