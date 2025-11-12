/**
 * OverflowMenu - Lightweight custom overflow menu
 *
 * Replaces react-native-paper Menu with a custom, lightweight implementation.
 * Zero external dependencies, full control over styling and behavior.
 *
 * Features:
 * - Native Modal-based implementation
 * - Smooth animations
 * - Icon support (Feather icons)
 * - Destructive action styling
 * - Backdrop dismiss
 * - Professional look and feel
 */

import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Animated,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { MenuAction } from '../sdui/schema/structure.schema';

// ============================================================================
// OverflowMenu Props
// ============================================================================

interface OverflowMenuProps {
  /** Menu items to display */
  items: MenuAction[];

  /** Anchor element (the trigger button) */
  anchor: React.ReactNode;

  /** Callback when menu item is pressed */
  onItemPress: (item: MenuAction) => void;

  /** Theme colors */
  theme?: {
    backgroundColor?: string;
    textColor?: string;
    borderColor?: string;
  };
}

// ============================================================================
// Main OverflowMenu Component
// ============================================================================

export default function OverflowMenu({
  items,
  anchor,
  onItemPress,
  theme = {},
}: OverflowMenuProps) {
  const [visible, setVisible] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  const {
    backgroundColor = '#FFFFFF',
    textColor = '#333333',
    borderColor = '#E0E0E0',
  } = theme;

  // Show menu with animation
  const showMenu = () => {
    setVisible(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  // Hide menu with animation
  const hideMenu = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
    });
  };

  // Handle item press
  const handleItemPress = (item: MenuAction) => {
    hideMenu();
    // Small delay to allow menu to close before action
    setTimeout(() => {
      onItemPress(item);
    }, 150);
  };

  return (
    <>
      {/* Anchor Button (cloned with onPress) */}
      <TouchableOpacity onPress={showMenu} activeOpacity={0.7}>
        {anchor}
      </TouchableOpacity>

      {/* Overflow Menu Modal */}
      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={hideMenu}
      >
        {/* Backdrop */}
        <Pressable style={styles.backdrop} onPress={hideMenu}>
          <Animated.View
            style={[
              styles.backdropOverlay,
              {
                opacity: fadeAnim,
              },
            ]}
          />
        </Pressable>

        {/* Menu Popover */}
        <Animated.View
          style={[
            styles.menuContainer,
            {
              backgroundColor,
              borderColor,
              opacity: fadeAnim,
              transform: [
                {
                  scale: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.9, 1],
                  }),
                },
              ],
            },
          ]}
        >
          {items.map((item, index) => {
            const isDestructive = item.destructive;
            const iconName = (item.icon || 'circle') as any;
            const itemTextColor = isDestructive ? '#EF5350' : textColor;

            return (
              <TouchableOpacity
                key={item.id || index}
                style={[
                  styles.menuItem,
                  index !== items.length - 1 && { borderBottomColor: borderColor, borderBottomWidth: 1 },
                ]}
                onPress={() => handleItemPress(item)}
                activeOpacity={0.7}
              >
                {/* Icon */}
                <View style={styles.menuItemIcon}>
                  <Feather name={iconName} size={20} color={itemTextColor} />
                </View>

                {/* Label */}
                <Text style={[styles.menuItemText, { color: itemTextColor }]}>
                  {item.label || 'Untitled'}
                </Text>

                {/* Destructive indicator */}
                {isDestructive && (
                  <View style={styles.destructiveIndicator}>
                    <Feather name="alert-triangle" size={16} color="#EF5350" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </Animated.View>
      </Modal>
    </>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdropOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  menuContainer: {
    position: 'absolute',
    top: 70, // Below top bar
    right: 16,
    minWidth: 200,
    maxWidth: 280,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    minHeight: 48,
  },
  menuItemIcon: {
    marginRight: 12,
    width: 24,
    alignItems: 'center',
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  destructiveIndicator: {
    marginLeft: 8,
  },
});
