/**
 * useAnalytics Hook - Event and Screen Tracking
 *
 * Features:
 * - React hook for analytics tracking
 * - Automatic screen tracking with React Navigation
 * - Type-safe event tracking
 */

import { useEffect, useCallback } from 'react';
import { useNavigationState } from '@react-navigation/native';
import { analyticsService } from '@services/analytics/analyticsService';

/**
 * Hook for analytics event tracking
 *
 * @example
 * ```tsx
 * function ActivityScreen() {
 *   const { trackEvent } = useAnalytics();
 *
 *   const handleJoin = () => {
 *     trackEvent('activity_joined', { activityId: '123' });
 *   };
 *
 *   return <Button onPress={handleJoin}>Join</Button>;
 * }
 * ```
 */
export function useAnalytics() {
  const trackEvent = useCallback(
    (eventName: string, properties?: Record<string, any>) => {
      analyticsService.trackEvent(eventName, properties);
    },
    []
  );

  const trackScreen = useCallback((screenName: string, properties?: Record<string, any>) => {
    analyticsService.trackScreen(screenName, properties as any);
  }, []);

  return {
    trackEvent,
    trackScreen,
  };
}

/**
 * Hook for automatic screen tracking
 * - Automatically tracks screen views with React Navigation
 * - Use in App.tsx or root navigator
 *
 * @example
 * ```tsx
 * function App() {
 *   useScreenTracking();
 *
 *   return <NavigationContainer>...</NavigationContainer>;
 * }
 * ```
 */
export function useScreenTracking() {
  const navigationState = useNavigationState((state) => state);

  useEffect(() => {
    if (!navigationState) return;

    // Get current route
    const getCurrentRoute = (state: any): any => {
      if (!state || !state.routes || state.routes.length === 0) {
        return null;
      }

      const route = state.routes[state.index];

      // If nested navigator, go deeper
      if (route.state) {
        return getCurrentRoute(route.state);
      }

      return route;
    };

    const currentRoute = getCurrentRoute(navigationState);

    if (currentRoute) {
      analyticsService.trackScreen(currentRoute.name, {
        params: currentRoute.params,
      });
    }
  }, [navigationState]);
}

/**
 * Hook for activity analytics
 */
export function useActivityAnalytics() {
  const trackActivityCreated = useCallback((activityId: string, category: string) => {
    analyticsService.trackActivityCreated(activityId, category);
  }, []);

  const trackActivityJoined = useCallback((activityId: string, category: string) => {
    analyticsService.trackActivityJoined(activityId, category);
  }, []);

  const trackActivityLeft = useCallback((activityId: string) => {
    analyticsService.trackActivityLeft(activityId);
  }, []);

  const trackActivityLiked = useCallback((activityId: string) => {
    analyticsService.trackActivityLiked(activityId);
  }, []);

  const trackActivityShared = useCallback((activityId: string, method: string) => {
    analyticsService.trackActivityShared(activityId, method);
  }, []);

  return {
    trackActivityCreated,
    trackActivityJoined,
    trackActivityLeft,
    trackActivityLiked,
    trackActivityShared,
  };
}

/**
 * Hook for social analytics
 */
export function useSocialAnalytics() {
  const trackMessageSent = useCallback((chatId: string, messageLength: number) => {
    analyticsService.trackMessageSent(chatId, messageLength);
  }, []);

  const trackCommentAdded = useCallback((activityId: string, commentLength: number) => {
    analyticsService.trackCommentAdded(activityId, commentLength);
  }, []);

  const trackProfileViewed = useCallback((userId: string) => {
    analyticsService.trackProfileViewed(userId);
  }, []);

  return {
    trackMessageSent,
    trackCommentAdded,
    trackProfileViewed,
  };
}

/**
 * Hook for search analytics
 */
export function useSearchAnalytics() {
  const trackSearch = useCallback((query: string, resultCount: number) => {
    analyticsService.trackSearch(query, resultCount);
  }, []);

  return {
    trackSearch,
  };
}
