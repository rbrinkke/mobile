/**
 * OfflineBanner Component - Displays when user is offline
 *
 * Features:
 * - Non-intrusive banner at top of screen
 * - Auto-dismisses when connection restored
 * - Shows connection type when back online
 */
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useConnectionState } from '@shared/hooks/useConnectionState';

export default function OfflineBanner() {
  const { isOnline, type } = useConnectionState();
  const [slideAnim] = useState(new Animated.Value(-100));
  const [showOnlineMessage, setShowOnlineMessage] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      // Slide down when offline
      setShowOnlineMessage(false);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    } else {
      // Show "Back online" message briefly
      if (slideAnim._value === 0) {
        setShowOnlineMessage(true);
        setTimeout(() => {
          // Slide up after 3 seconds
          Animated.timing(slideAnim, {
            toValue: -100,
            duration: 300,
            useNativeDriver: true,
          }).start(() => {
            setShowOnlineMessage(false);
          });
        }, 3000);
      }
    }
  }, [isOnline, slideAnim]);

  return (
    <Animated.View
      style={[
        styles.banner,
        {
          backgroundColor: showOnlineMessage ? '#10B981' : '#EF4444',
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Feather
        name={showOnlineMessage ? 'check-circle' : 'wifi-off'}
        size={20}
        color="#fff"
      />
      <Text style={styles.text}>
        {showOnlineMessage
          ? `Back online${type && type !== 'unknown' ? ` (${type})` : ''}`
          : 'No internet connection'}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  text: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
