import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { StyleSheet } from 'react-native';

// Navigation
import RootNavigator from './src/navigation/RootNavigator';

// Error Boundary
import { ErrorBoundary } from '@shared/components/ErrorBoundary';

// Offline Banner
import OfflineBanner from '@shared/components/OfflineBanner';

// Debug Panel (DEV only)
import { DebugPanel } from '@shared/components/DebugPanel';

// Create query client for TanStack Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1 * 60 * 1000, // 1 minute
      retry: 1,
    },
  },
});

/**
 * App - Activity Platform (Best-in-Class Architecture)
 *
 * Features:
 * ✅ Production-ready authentication flow
 * ✅ Persistent auth state (survives app restarts)
 * ✅ Automatic token refresh
 * ✅ Error boundaries for crash prevention
 * ✅ Offline detection and handling
 * ✅ Type-safe navigation throughout
 *
 * Architecture:
 * - RootNavigator: Auth guard (AuthScreen vs MainNavigator)
 * - MainNavigator: Bottom tabs (Activiteiten, Chats, Agenda, etc.)
 * - Brand colors: #E6001A primary, #FFF3F4 accent
 */
export default function App() {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={styles.container}>
        <SafeAreaProvider>
          <QueryClientProvider client={queryClient}>
            <NavigationContainer>
              <RootNavigator />
              <OfflineBanner />
            </NavigationContainer>
            <StatusBar style="auto" />
            {/* Debug Panel - Only visible in DEV mode */}
            {__DEV__ && <DebugPanel />}
          </QueryClientProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
