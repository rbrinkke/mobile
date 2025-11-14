/**
 * OptimizedImage - Foundation component for all images
 *
 * Features:
 * - Expo Image with automatic caching
 * - Error handling with fallback
 * - Blurhash placeholders
 * - Performance optimized
 * - Accessibility ready
 *
 * Usage: Replace all <Image> with <OptimizedImage>
 */
import React, { useState } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Image, ImageContentFit } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { getImagePlaceholder, handleImageError } from '@shared/utils/imageUtils';

interface OptimizedImageProps {
  source: { uri: string } | number;
  style?: ViewStyle;
  contentFit?: ImageContentFit;
  blurhash?: string;
  priority?: 'low' | 'normal' | 'high';
  recyclingKey?: string;
  accessibilityLabel?: string;
  onError?: (error: any) => void;
}

export default function OptimizedImage({
  source,
  style,
  contentFit = 'cover',
  blurhash,
  priority = 'normal',
  recyclingKey,
  accessibilityLabel,
  onError,
}: OptimizedImageProps) {
  const [hasError, setHasError] = useState(false);

  // Get image URL for error logging
  const imageUrl = typeof source === 'object' && 'uri' in source ? source.uri : 'local';

  const handleError = (error: any) => {
    setHasError(true);
    handleImageError(imageUrl, error);
    onError?.(error);
  };

  // Show error fallback
  if (hasError) {
    return (
      <View style={[styles.errorContainer, style]}>
        <Feather name="image" size={48} color="#D1D5DB" />
      </View>
    );
  }

  return (
    <Image
      source={source}
      style={style}
      contentFit={contentFit}
      placeholder={blurhash || getImagePlaceholder()}
      transition={200}
      priority={priority}
      recyclingKey={recyclingKey}
      cachePolicy="memory-disk"
      onError={handleError}
      accessible={true}
      accessibilityLabel={accessibilityLabel || 'Image'}
      accessibilityRole="image"
    />
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
