import React, { useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DynamicNavigator from './src/navigation/DynamicNavigator';
import { setupSduiSystem } from './src/sdui';
import { setAuthToken } from './src/services/apiClient';
import { setNavigationRef } from './src/services/MenuActionHandler';

// Initialize SDUI system (register building blocks)
setupSduiSystem();

// TODO: For development, set a test JWT token
// In production, this would come from your auth flow
if (__DEV__) {
  setAuthToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0X3VzZXJfMTIzIiwidHlwZSI6ImFjY2VzcyIsImV4cCI6MTc2Mjk2NTM3M30.oIlENdoxTZ_C0MZnDUsupvsXP6FAce634S9LBWg333U');
  console.log('🔑 Dev JWT token set');
}

// Create QueryClient for TanStack Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 24 * 60 * 60 * 1000, // 24 hours
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
  },
});

export default function App() {
  // Navigation reference for MenuActionHandler (imperative navigation)
  const navigationRef = useRef<NavigationContainerRef<any> | null>(null);

  // Set navigation reference when ready
  const handleNavigationReady = () => {
    if (navigationRef.current) {
      setNavigationRef(navigationRef.current);
      if (__DEV__) {
        console.log('🔗 Navigation reference set for MenuActionHandler');
      }
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer ref={navigationRef} onReady={handleNavigationReady}>
        <DynamicNavigator />
        <StatusBar style="auto" />
      </NavigationContainer>
    </QueryClientProvider>
  );
}
