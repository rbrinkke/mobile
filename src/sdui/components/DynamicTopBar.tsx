/**
 * DynamicTopBar - Context-aware top navigation bar
 *
 * Best-in-class top bar with:
 * - JSON-driven configuration
 * - Context-aware actions (different per page)
 * - Overflow menus (react-native-paper)
 * - Live badge counts
 * - Search bar support
 * - Feather icons
 *
 * Used by UniversalPageRenderer to show page-specific navigation.
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Feather } from '@expo/vector-icons';
import { Menu } from 'react-native-paper';

// SDUI imports
import type { TopBarConfig, MenuAction, AppTheme } from '../schema/structure.schema';
import { MenuActionHandler } from '../../services/MenuActionHandler';

// ============================================================================
// DynamicTopBar Props
// ============================================================================

interface DynamicTopBarProps {
  /** Top bar configuration from structure.json */
  config: TopBarConfig;

  /** Current page ID (for context-aware actions) */
  currentRoute: string;

  /** App theme for styling */
  theme: AppTheme;
}

// ============================================================================
// Menu Element Renderer
// ============================================================================

interface DynamicMenuElementProps {
  element: MenuAction;
  theme: AppTheme;
}

/**
 * DynamicMenuElement - Renders a single menu action
 *
 * Handles all menu action types:
 * - icon: Icon button (with optional badge)
 * - avatar: User avatar button
 * - logo: App logo button
 * - search: Search bar
 * - menu: Overflow menu (three dots)
 */
const DynamicMenuElement: React.FC<DynamicMenuElementProps> = React.memo(
  ({ element, theme }) => {
    // State for overflow menu visibility
    const [menuVisible, setMenuVisible] = useState(false);

    // Fetch live badge count (if configured)
    const { data: badgeCount = 0 } = useQuery({
      queryKey: ['badge', element.id],
      queryFn: async () => {
        if (element.badgeSource) {
          return await MenuActionHandler.getBadgeCount(element.badgeSource);
        }
        return element.badge ? 1 : 0; // Simple indicator if badge=true
      },
      staleTime: 30_000, // 30 seconds
      gcTime: 5 * 60_000, // 5 minutes
      refetchInterval: 60_000, // Refetch every minute
      enabled: !!(element.badgeSource || element.badge),
    });

    // Handle action press
    const handlePress = () => {
      if (element.action && element.action !== 'none') {
        MenuActionHandler.execute(element.action, { sourceId: element.id });
      }
    };

    // === Render based on type ===

    switch (element.type) {
      case 'icon':
      case 'avatar':
      case 'logo': {
        const iconName = (element.icon || 'circle') as any;

        return (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handlePress}
            activeOpacity={0.7}
          >
            <Feather name={iconName} size={24} color={theme.textColor} />

            {/* Badge indicator */}
            {badgeCount > 0 && (
              <View style={[styles.miniBadge, { backgroundColor: theme.primaryColor }]}>
                <Text style={styles.miniBadgeText}>
                  {badgeCount > 9 ? '9+' : badgeCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      }

      case 'search': {
        return (
          <View style={[styles.searchBar, { backgroundColor: theme.surfaceColor }]}>
            <Feather name="search" size={18} color={theme.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: theme.textColor }]}
              placeholder={element.placeholder || 'Search...'}
              placeholderTextColor={theme.textSecondary}
              onFocus={handlePress} // Trigger action on focus
            />
          </View>
        );
      }

      case 'menu': {
        // Overflow menu with react-native-paper Menu
        const iconName = (element.icon || 'more-vertical') as any;

        return (
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => setMenuVisible(true)}
                activeOpacity={0.7}
              >
                <Feather name={iconName} size={24} color={theme.textColor} />
              </TouchableOpacity>
            }
            contentStyle={{ backgroundColor: theme.backgroundColor }}
          >
            {element.items?.map((item, index) => {
              const itemIconName = (item.icon || 'circle') as any;
              const textColor = item.destructive ? '#EF5350' : theme.textColor;

              return (
                <Menu.Item
                  key={item.id || index}
                  onPress={() => {
                    setMenuVisible(false);
                    if (item.action && item.action !== 'none') {
                      MenuActionHandler.execute(item.action, {
                        sourceId: item.id,
                        parentId: element.id,
                      });
                    }
                  }}
                  title={item.label || 'Untitled'}
                  titleStyle={{ color: textColor }}
                  leadingIcon={() => (
                    <Feather name={itemIconName} size={20} color={textColor} />
                  )}
                />
              );
            })}
          </Menu>
        );
      }

      default:
        if (__DEV__) {
          console.warn(`[DynamicTopBar] Unknown menu action type: ${element.type}`);
        }
        return null;
    }
  }
);

// ============================================================================
// Main DynamicTopBar Component
// ============================================================================

/**
 * DynamicTopBar - The header navigation component
 *
 * Layout:
 * ```
 * ┌─────────────────────────────────────┐
 * │ [Left] [Center (flexible)] [Right] │
 * └─────────────────────────────────────┘
 * ```
 *
 * Contextual actions (filter, overflow) appear in the right section
 * based on the currentRoute.
 */
export default function DynamicTopBar({
  config,
  currentRoute,
  theme,
}: DynamicTopBarProps) {
  // Get context-specific actions for current page
  const contextActions = useMemo(
    () => config.contextualActions[currentRoute],
    [config.contextualActions, currentRoute]
  );

  if (__DEV__) {
    console.log(`[DynamicTopBar] Rendering for route: ${currentRoute}`, {
      hasContextActions: !!contextActions,
      hasFilter: !!contextActions?.filter,
      hasOverflow: !!contextActions?.overflow,
    });
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.backgroundColor }]}
      edges={['top']}
    >
      <View
        style={[
          styles.container,
          { borderBottomColor: theme.borderColor, backgroundColor: theme.backgroundColor },
        ]}
      >
        {/* LEFT SECTION */}
        <View style={styles.leftSection}>
          {config.left && <DynamicMenuElement element={config.left} theme={theme} />}
        </View>

        {/* CENTER SECTION */}
        <View style={styles.centerSection}>
          {config.center && <DynamicMenuElement element={config.center} theme={theme} />}
        </View>

        {/* RIGHT SECTION (includes context-specific actions) */}
        <View style={styles.rightSection}>
          {/* Base right actions */}
          {config.right?.map((element, index) => (
            <DynamicMenuElement key={element.id || index} element={element} theme={theme} />
          ))}

          {/* Context-specific filter button */}
          {contextActions?.filter && (
            <DynamicMenuElement element={contextActions.filter} theme={theme} />
          )}

          {/* Context-specific overflow menu */}
          {contextActions?.overflow && (
            <DynamicMenuElement element={contextActions.overflow} theme={theme} />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#FFFFFF',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
    borderBottomWidth: 1,
  },

  // Sections
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-start',
  },
  centerSection: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
    gap: 12,
  },

  // Action button
  actionButton: {
    padding: 4,
    position: 'relative',
  },

  // Mini badge (for top bar icons)
  miniBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  miniBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: 'bold',
  },

  // Search bar
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexGrow: 1,
    maxWidth: 400,
  },
  searchInput: {
    marginLeft: 8,
    fontSize: 16,
    flex: 1,
  },
});
