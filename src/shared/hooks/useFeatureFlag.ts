/**
 * useFeatureFlag Hook - Feature Toggle Access
 *
 * Features:
 * - React hook for feature flag access
 * - Automatic re-render on flag changes
 * - Type-safe flag access
 */

import { useState, useEffect, useCallback } from 'react';
import { featureFlagsService } from '@services/featureFlags/featureFlagsService';

/**
 * Hook to check if feature is enabled
 *
 * @example
 * ```tsx
 * function ChatScreen() {
 *   const isChatEnabled = useFeatureFlag('chat-enabled');
 *
 *   if (!isChatEnabled) {
 *     return <ComingSoonMessage />;
 *   }
 *
 *   return <ChatInterface />;
 * }
 * ```
 */
export function useFeatureFlag(flagKey: string): boolean {
  const [isEnabled, setIsEnabled] = useState(() =>
    featureFlagsService.isEnabled(flagKey)
  );

  useEffect(() => {
    // Update flag status when flags are refreshed
    const checkFlag = () => {
      const enabled = featureFlagsService.isEnabled(flagKey);
      setIsEnabled(enabled);
    };

    // Check every 10 seconds for changes
    const interval = setInterval(checkFlag, 10000);

    return () => clearInterval(interval);
  }, [flagKey]);

  return isEnabled;
}

/**
 * Hook to get feature flag value
 *
 * @example
 * ```tsx
 * function SettingsScreen() {
 *   const maxUploadSize = useFeatureFlagValue<number>('max-upload-size', 10);
 *
 *   return <Text>Max upload: {maxUploadSize}MB</Text>;
 * }
 * ```
 */
export function useFeatureFlagValue<T = any>(
  flagKey: string,
  defaultValue?: T
): T {
  const [value, setValue] = useState<T>(() =>
    featureFlagsService.getValue<T>(flagKey, defaultValue)
  );

  useEffect(() => {
    const checkValue = () => {
      const newValue = featureFlagsService.getValue<T>(flagKey, defaultValue);
      setValue(newValue);
    };

    const interval = setInterval(checkValue, 10000);

    return () => clearInterval(interval);
  }, [flagKey, defaultValue]);

  return value;
}

/**
 * Hook to get A/B test variant
 *
 * @example
 * ```tsx
 * function OnboardingScreen() {
 *   const variant = useFeatureFlagVariant('new-onboarding-flow');
 *
 *   if (variant === 'variant-a') {
 *     return <OnboardingFlowA />;
 *   }
 *
 *   if (variant === 'variant-b') {
 *     return <OnboardingFlowB />;
 *   }
 *
 *   return <OnboardingFlowControl />;
 * }
 * ```
 */
export function useFeatureFlagVariant(flagKey: string): string | null {
  const [variant, setVariant] = useState<string | null>(() =>
    featureFlagsService.getVariant(flagKey)
  );

  useEffect(() => {
    const checkVariant = () => {
      const newVariant = featureFlagsService.getVariant(flagKey);
      setVariant(newVariant);
    };

    const interval = setInterval(checkVariant, 10000);

    return () => clearInterval(interval);
  }, [flagKey]);

  return variant;
}

/**
 * Hook for feature flag testing/development
 * - Only available in development mode
 *
 * @example
 * ```tsx
 * function DevMenu() {
 *   const { setOverride, clearOverride } = useFeatureFlagOverride();
 *
 *   return (
 *     <View>
 *       <Button onPress={() => setOverride('chat-enabled', false)}>
 *         Disable Chat
 *       </Button>
 *       <Button onPress={() => clearOverride('chat-enabled')}>
 *         Reset Chat
 *       </Button>
 *     </View>
 *   );
 * }
 * ```
 */
export function useFeatureFlagOverride() {
  const setOverride = useCallback(
    (flagKey: string, value: boolean | string | number) => {
      if (__DEV__) {
        featureFlagsService.setOverride(flagKey, value);
      }
    },
    []
  );

  const clearOverride = useCallback((flagKey: string) => {
    if (__DEV__) {
      featureFlagsService.clearOverride(flagKey);
    }
  }, []);

  const clearAllOverrides = useCallback(() => {
    if (__DEV__) {
      featureFlagsService.clearAllOverrides();
    }
  }, []);

  return {
    setOverride,
    clearOverride,
    clearAllOverrides,
  };
}
