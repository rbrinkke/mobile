/**
 * DynamicNavigator - JSON-driven bottom tab navigation
 *
 * Replaces the hardcoded BottomTabNavigator with a fully dynamic system.
 * Configuration comes from structure.json via the SDUI system.
 *
 * Features:
 * - Dynamic tab creation from navigation[] array
 * - Feather icons (professional, consistent)
 * - Live badge counts via API
 * - Theme integration
 * - Sorted by order property
 *
 * This is best-in-class: Clean, performant, maintainable.
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useQuery } from '@tanstack/react-query';
import { Feather } from '@expo/vector-icons';

// SDUI imports
import { useStructure, useAppMeta } from '../sdui/hooks/useStructure';
import type { NavigationItem } from '../sdui/schema/structure.schema';
import { MenuActionHandler } from '../services/MenuActionHandler';

// Screen mapping
import { useScreens } from './useScreens';

const Tab = createBottomTabNavigator();

// ============================================================================
// Dynamic Tab Icon with Live Badge
// ============================================================================

interface DynamicTabIconProps {
  item: NavigationItem;
  focused: boolean;
  color: string;
}

/**
 * Dynamic Tab Icon Component
 *
 * Renders:
 * - Feather icon (from item.icon)
 * - Live badge count (from item.badgeSource API)
 * - Focus state styling
 *
 * Badge count is fetched via TanStack Query with:
 * - 30s stale time (reasonable freshness)
 * - 60s refetch interval (live updates)
 * - Automatic caching and deduplication
 */
function DynamicTabIcon({ item, focused, color }: DynamicTabIconProps) {
  // Fetch live badge count from API
  const { data: badgeCount = 0 } = useQuery({
    queryKey: ['badge', item.id],
    queryFn: async () => {
      // Priority: badgeSource (live API) > badge (static number)
      if (item.badgeSource) {
        return await MenuActionHandler.getBadgeCount(item.badgeSource);
      }
      return item.badge || 0;
    },
    staleTime: 30_000, // 30 seconds
    gcTime: 5 * 60_000, // 5 minutes
    refetchInterval: 60_000, // Refetch every 60 seconds for live data
    enabled: !!(item.badgeSource || item.badge), // Only fetch if badge configured
  });

  // Feather icon name (with fallback)
  const iconName = (item.icon || 'circle') as any;

  return (
    <View style={styles.iconContainer}>
      <Feather name={iconName} size={24} color={color} />

      {/* Badge indicator */}
      {badgeCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badgeCount > 99 ? '99+' : badgeCount}</Text>
        </View>
      )}
    </View>
  );
}

// ============================================================================
// Main Dynamic Navigator
// ============================================================================

/**
 * Dynamic Navigator - JSON-driven bottom tabs
 *
 * Reads configuration from structure.json and creates tabs dynamically.
 *
 * Process:
 * 1. Load structure via useStructure()
 * 2. Get navigation items (sorted by order)
 * 3. Map pageIds to screen components via useScreens()
 * 4. Create Tab.Screen for each visible item
 * 5. Apply theme colors
 *
 * Zero hardcoded tabs. 100% backend-driven.
 */
export default function DynamicNavigator() {
  const { data: structure, isLoading, error } = useStructure();
  const appMeta = useAppMeta();
  const { getScreen } = useScreens();

  // Sorted navigation items (by order property)
  const sortedNavItems = useMemo(() => {
    if (!structure?.navigation) return [];

    return [...structure.navigation]
      .filter((item) => item.visible) // Only visible items
      .sort((a, b) => a.order - b.order); // Sort by order
  }, [structure]);

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Loading navigation...</Text>
      </View>
    );
  }

  // Error state
  if (error || !structure || !appMeta) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorEmoji}>⚠️</Text>
        <Text style={styles.errorText}>Failed to load navigation</Text>
        {__DEV__ && error && (
          <Text style={styles.errorDetail}>{String(error)}</Text>
        )}
      </View>
    );
  }

  // Empty state (no tabs configured)
  if (sortedNavItems.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorEmoji}>📱</Text>
        <Text style={styles.errorText}>No navigation items configured</Text>
        {__DEV__ && (
          <Text style={styles.errorDetail}>
            Add navigation items to structure.json
          </Text>
        )}
      </View>
    );
  }

  const theme = appMeta.theme;

  // Dynamic tab screens
  const dynamicScreens = sortedNavItems.map((item) => {
    const ScreenComponent = getScreen(item.pageId);

    return (
      <Tab.Screen
        key={item.id}
        name={item.pageId}
        component={ScreenComponent}
        options={{
          tabBarLabel: item.label,
          tabBarIcon: ({ focused, color }) => (
            <DynamicTabIcon item={item} focused={focused} color={color} />
          ),
          // Hide header (we use DynamicTopBar in UniversalPageRenderer)
          headerShown: false,
        }}
      />
    );
  });

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primaryColor,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
          borderTopWidth: 1,
          borderTopColor: theme.borderColor,
          backgroundColor: theme.backgroundColor,
        },
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      {dynamicScreens}
    </Tab.Navigator>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  // Tab icon styles
  iconContainer: {
    position: 'relative',
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },

  // Tab bar label
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '500',
  },

  // Loading/Error states
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F7F7F7',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  errorEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorDetail: {
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
