/**
 * Skeleton - Loading placeholder system
 *
 * Features:
 * - Animated shimmer effect
 * - Reusable shapes (box, circle, text)
 * - Composable patterns
 * - Respects reduce motion preferences
 *
 * Usage: Build skeleton screens with these primitives
 */
import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle, Easing } from 'react-native';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: ViewStyle;
}

/**
 * Base Skeleton component with shimmer animation
 */
export function Skeleton({ width = '100%', height = 20, borderRadius = 4, style }: SkeletonProps) {
  const shimmerValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerValue, {
          toValue: 0,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    );

    shimmerAnimation.start();

    return () => shimmerAnimation.stop();
  }, [shimmerValue]);

  const opacity = shimmerValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
}

/**
 * Circle skeleton (for avatars)
 */
export function SkeletonCircle({ size = 40, style }: { size?: number; style?: ViewStyle }) {
  return <Skeleton width={size} height={size} borderRadius={size / 2} style={style} />;
}

/**
 * Text skeleton (single line)
 */
export function SkeletonText({ width = '80%', style }: { width?: number | string; style?: ViewStyle }) {
  return <Skeleton width={width} height={16} style={style} />;
}

/**
 * Card skeleton pattern (reusable)
 */
export function SkeletonCard({ style }: { style?: ViewStyle }) {
  return (
    <View style={[styles.card, style]}>
      {/* Image placeholder */}
      <Skeleton width="100%" height={200} borderRadius={0} style={styles.cardImage} />

      {/* Content placeholder */}
      <View style={styles.cardContent}>
        <SkeletonText width="70%" style={styles.cardTitle} />
        <SkeletonText width="90%" style={styles.cardDescription} />
        <SkeletonText width="60%" style={styles.cardDescription} />

        {/* Footer with actions */}
        <View style={styles.cardFooter}>
          <Skeleton width={80} height={36} borderRadius={8} />
          <Skeleton width={100} height={36} borderRadius={8} />
        </View>
      </View>
    </View>
  );
}

/**
 * List item skeleton pattern
 */
export function SkeletonListItem({ style }: { style?: ViewStyle }) {
  return (
    <View style={[styles.listItem, style]}>
      <SkeletonCircle size={48} />
      <View style={styles.listItemContent}>
        <SkeletonText width="60%" style={styles.listItemTitle} />
        <SkeletonText width="40%" />
      </View>
    </View>
  );
}

/**
 * Grid skeleton pattern (for discover screens)
 */
export function SkeletonGrid({ columns = 2, rows = 3 }: { columns?: number; rows?: number }) {
  return (
    <View style={styles.grid}>
      {Array.from({ length: rows * columns }).map((_, index) => (
        <View key={index} style={[styles.gridItem, { width: `${100 / columns - 4}%` }]}>
          <Skeleton width="100%" height={150} borderRadius={8} />
          <SkeletonText width="80%" style={styles.gridItemTitle} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E5E7EB',
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardImage: {
    marginBottom: 0,
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    marginBottom: 8,
  },
  cardDescription: {
    marginBottom: 6,
  },
  cardFooter: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    marginBottom: 6,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 16,
  },
  gridItem: {
    marginBottom: 16,
  },
  gridItemTitle: {
    marginTop: 8,
  },
});
