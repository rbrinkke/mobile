import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';

// Auth Screen
import { AuthScreen } from '@features/auth';

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
 * App - Testing Auth with REAL Auth-API Backend (port 8000)
 *
 * Now connected to the correct backend with VISIBLE inputs! 🎯
 * Function > Beauty 👑
 */
export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthScreen />
          <StatusBar style="auto" />
          {/* Debug Panel - Only visible in DEV mode */}
          <DebugPanel />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
