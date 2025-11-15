import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { StyleSheet } from 'react-native';

// Navigation
import MainNavigator from './src/navigation/MainNavigator';

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
 * App - Activity Platform
 *
 * MainNavigator bevat:
 * - Top header: Logo, Search, Filter, Profile & More
 * - Bottom tabs: Activiteiten, Chats, Agenda, Meldingen, Moatjes
 * - Lucide icons, brand colors (#E6001A primary, #FFF3F4 accent)
 */
export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <NavigationContainer>
            <MainNavigator />
          </NavigationContainer>
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
