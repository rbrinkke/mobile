/**
 * Accessibility Utilities - VoiceOver/TalkBack Foundation
 *
 * iOS: VoiceOver
 * Android: TalkBack
 *
 * Features:
 * - Accessible labels generator
 * - Role definitions
 * - Hint helpers
 * - Screen reader announcements
 */
import { AccessibilityRole, AccessibilityInfo } from 'react-native';

/**
 * Accessibility roles for semantic meaning
 * Use these constants for consistency
 */
export const A11Y_ROLES = {
  BUTTON: 'button' as AccessibilityRole,
  LINK: 'link' as AccessibilityRole,
  HEADER: 'header' as AccessibilityRole,
  IMAGE: 'image' as AccessibilityRole,
  IMAGE_BUTTON: 'imagebutton' as AccessibilityRole,
  TEXT: 'text' as AccessibilityRole,
  SEARCH: 'search' as AccessibilityRole,
  CHECKBOX: 'checkbox' as AccessibilityRole,
  RADIO: 'radio' as AccessibilityRole,
  MENU: 'menu' as AccessibilityRole,
  MENU_ITEM: 'menuitem' as AccessibilityRole,
  TAB: 'tab' as AccessibilityRole,
  TAB_LIST: 'tablist' as AccessibilityRole,
} as const;

/**
 * Generate accessible label for interactive elements
 *
 * Example:
 * generateA11yLabel('Like', { count: 42, state: 'liked' })
 * => "Like button, 42 likes, currently liked"
 */
export function generateA11yLabel(
  action: string,
  meta?: {
    count?: number;
    state?: string;
    context?: string;
  }
): string {
  let label = action;

  if (meta?.count !== undefined) {
    label += `, ${meta.count} ${meta.count === 1 ? 'item' : 'items'}`;
  }

  if (meta?.state) {
    label += `, ${meta.state}`;
  }

  if (meta?.context) {
    label += `, ${meta.context}`;
  }

  return label;
}

/**
 * Generate accessible hint for actions
 *
 * Example:
 * generateA11yHint('like', 'activity')
 * => "Double tap to like this activity"
 */
export function generateA11yHint(action: string, target?: string): string {
  const targetText = target ? ` this ${target}` : '';
  return `Double tap to ${action}${targetText}`;
}

/**
 * Announce message to screen reader
 * Use for dynamic content updates
 *
 * Example:
 * announceForAccessibility('Activity liked successfully')
 */
export function announceForAccessibility(message: string) {
  AccessibilityInfo.announceForAccessibility(message);
}

/**
 * Check if screen reader is enabled
 * Use to conditionally show/hide visual elements
 */
export async function isScreenReaderEnabled(): Promise<boolean> {
  return await AccessibilityInfo.isScreenReaderEnabled();
}

/**
 * Reduce motion check
 * Respect user's motion preferences
 */
export async function isReduceMotionEnabled(): Promise<boolean> {
  return await AccessibilityInfo.isReduceMotionEnabled();
}

/**
 * Common accessibility props for interactive elements
 *
 * Usage:
 * <TouchableOpacity {...getAccessibleButtonProps('Like', 'like this post')}>
 */
export function getAccessibleButtonProps(
  label: string,
  hint?: string,
  state?: { selected?: boolean; disabled?: boolean }
) {
  return {
    accessible: true,
    accessibilityRole: A11Y_ROLES.BUTTON,
    accessibilityLabel: label,
    accessibilityHint: hint,
    accessibilityState: state,
  };
}

/**
 * Accessibility props for images
 *
 * Usage:
 * <Image {...getAccessibleImageProps('User profile picture')} />
 */
export function getAccessibleImageProps(label: string) {
  return {
    accessible: true,
    accessibilityRole: A11Y_ROLES.IMAGE,
    accessibilityLabel: label,
  };
}

/**
 * Accessibility props for text input
 *
 * Usage:
 * <TextInput {...getAccessibleInputProps('Email', 'Enter your email address')} />
 */
export function getAccessibleInputProps(label: string, hint?: string, required?: boolean) {
  return {
    accessible: true,
    accessibilityLabel: label,
    accessibilityHint: hint,
    accessibilityRequired: required,
  };
}

/**
 * Group accessibility props for containers
 * Treats children as a single element
 *
 * Usage:
 * <View {...getAccessibilityGroupProps('Activity card with like and join buttons')}>
 */
export function getAccessibilityGroupProps(label: string) {
  return {
    accessible: true,
    accessibilityLabel: label,
  };
}

/**
 * Hide element from screen reader
 * Use for decorative elements
 *
 * Usage:
 * <View {...hideFromAccessibility()}>
 */
export function hideFromAccessibility() {
  return {
    accessible: false,
    importantForAccessibility: 'no-hide-descendants' as const,
  };
}
