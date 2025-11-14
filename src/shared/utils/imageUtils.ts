/**
 * Image Utilities - Preloading and cache management
 *
 * Features:
 * - Batch image preloading for better performance
 * - Cache management helpers
 * - Blurhash generation (for future implementation)
 */
import { Image } from 'expo-image';

interface Activity {
  id: string;
  imageUrl?: string;
}

/**
 * Preload activity images in batch
 * Call this when fetching new pages to improve perceived performance
 */
export async function preloadActivityImages(activities: Activity[]) {
  const imageUrls = activities
    .map(activity => activity.imageUrl)
    .filter((url): url is string => Boolean(url));

  if (imageUrls.length === 0) return;

  try {
    await Image.prefetch(imageUrls);
    console.log(`✅ Preloaded ${imageUrls.length} activity images`);
  } catch (error) {
    console.warn('Failed to preload images:', error);
  }
}

/**
 * Clear all image caches
 * Use sparingly - only when needed (e.g., user action or memory warnings)
 */
export async function clearImageCaches() {
  try {
    await Image.clearDiskCache();
    await Image.clearMemoryCache();
    console.log('✅ Cleared image caches');
  } catch (error) {
    console.warn('Failed to clear image caches:', error);
  }
}

/**
 * Clear only memory cache (disk cache persists)
 * Useful for freeing up memory without re-downloading images
 */
export async function clearMemoryCache() {
  try {
    await Image.clearMemoryCache();
    console.log('✅ Cleared memory cache');
  } catch (error) {
    console.warn('Failed to clear memory cache:', error);
  }
}

/**
 * Generate blurhash placeholder for an image URL
 * Note: Requires backend support to generate blurhash during image upload
 *
 * For now, returns a generic blurhash. In production:
 * 1. Backend generates blurhash during image upload
 * 2. Store blurhash in database alongside imageUrl
 * 3. Pass blurhash to Image component as placeholder prop
 */
export function getImagePlaceholder(imageUrl?: string): string {
  // Generic blurhash for gradient (light gray to white)
  // In production, this would come from the activity object
  return 'LGF5]+Yk^6#M@-5c,1J5@[or[Q6.';
}

/**
 * Get fallback image source when image fails to load
 * Returns local placeholder image
 */
export function getFallbackImageSource() {
  // In production, use a proper placeholder image
  // For now, return undefined to show error state
  return undefined;
}

/**
 * Image load error handler
 * Logs error and can send to analytics
 */
export function handleImageError(imageUrl: string, error: any) {
  if (__DEV__) {
    console.warn('Failed to load image:', imageUrl, error);
  }

  // TODO: Send to analytics in production
  // Analytics.logEvent('image_load_failed', { url: imageUrl, error: error?.message });
}

/**
 * Determine image priority based on viewport position
 * Use "high" for above-the-fold images, "normal" for below
 */
export function getImagePriority(index: number): 'high' | 'normal' | 'low' {
  if (index < 3) return 'high'; // First 3 items
  if (index < 10) return 'normal'; // Items 3-10
  return 'low'; // Items beyond 10
}
