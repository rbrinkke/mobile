import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { StyleSheet } from 'react-native';

// Navigation
import BottomTabNavigator from './src/navigation/BottomTabNavigator';

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
 * App - Activity Platform with New Navigation Menu
 *
 * Features:
 * - Custom header with Logo, Search, Filter, Profile & More
 * - Bottom tab navigation: Activiteiten, Chats, Agenda, Meldingen, Moatjes
 * - Lucide icons for modern, consistent design
 * - Brand colors: #E6001A (primary) and #FFF3F4 (accent)
 */
export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <NavigationContainer>
            <BottomTabNavigator />
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
