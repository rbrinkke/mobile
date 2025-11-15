/**
 * Root Navigator - Best-in-Class Authentication Flow
 *
 * Features:
 * ✅ Automatic auth state detection
 * ✅ Smooth transitions between auth/main app
 * ✅ Loading state while initializing
 * ✅ Persistent auth via Zustand + MMKV
 * ✅ Type-safe navigation
 * ✅ Accessibility support
 *
 * Flow:
 * 1. App starts → Show loading screen
 * 2. Initialize auth store → Check tokens → Validate
 * 3. If authenticated → MainNavigator (bottom tabs)
 * 4. If not authenticated → AuthScreen (login/register)
 * 5. After login → Automatic transition to MainNavigator
 * 6. After logout → Automatic transition to AuthScreen
 */

import React, { useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  useAuthStore,
  useIsAuthenticated,
  useAuthInitialized,
  type AuthStore,
} from '@stores/authStore';

// Screens
import { AuthScreen } from '@features/auth/screens/AuthScreen';
import MainNavigator from './MainNavigator';

const Stack = createNativeStackNavigator();

// ============================================================================
// Loading Screen
// ============================================================================

function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#E6001A" />
      <Text style={styles.loadingText}>Initializing...</Text>
    </View>
  );
}

// ============================================================================
// Root Navigator
// ============================================================================

export default function RootNavigator() {
  const isAuthenticated = useIsAuthenticated();
  const isInitialized = useAuthInitialized();
  const initialize = useAuthStore((state: AuthStore) => state.initialize);

  // Initialize auth state on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Show loading screen while checking auth state
  if (!isInitialized) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade', // Smooth fade transition
        animationDuration: 300,
      }}
    >
      {isAuthenticated ? (
        // User is authenticated → Show main app with bottom tabs
        <Stack.Screen
          name="Main"
          component={MainNavigator}
          options={{
            // Prevent going back to auth screen
            gestureEnabled: false,
          }}
        />
      ) : (
        // User is not authenticated → Show auth flow
        <Stack.Screen
          name="Auth"
          component={AuthScreen}
          options={{
            // Prevent going back (no previous screen)
            gestureEnabled: false,
          }}
        />
      )}
    </Stack.Navigator>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
});
