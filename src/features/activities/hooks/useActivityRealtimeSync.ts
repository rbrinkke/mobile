/**
 * Activity Real-Time Sync Hook
 *
 * Integrates WebSocket events with TanStack Query cache for real-time updates.
 * Keeps activity data in sync across all screens automatically.
 */

import { useQueryClient } from '@tanstack/react-query';
import { useSocketEvent } from '@shared/hooks/useSocketEvent';
import { queryKeys } from '@api/queryKeys';
import type { Activity } from '../types';

/**
 * Subscribe to real-time activity updates
 *
 * Automatically updates TanStack Query cache when:
 * - Activities are created/updated/deleted
 * - Users join/leave activities
 * - Activities are liked/unliked
 *
 * @example
 * ```typescript
 * // In your App.tsx or root component
 * useActivityRealtimeSync();
 * ```
 */
export function useActivityRealtimeSync() {
  const queryClient = useQueryClient();

  // Activity created
  useSocketEvent<Activity>({
    event: 'activity:created',
    onEvent: (activity) => {
      // Invalidate lists to show new activity
      queryClient.invalidateQueries({ queryKey: queryKeys.activities.lists() });

      if (__DEV__) console.log('🆕 Activity created:', activity.id);
    },
  });

  // Activity updated
  useSocketEvent<Activity>({
    event: 'activity:updated',
    onEvent: (activity) => {
      // Update detail cache
      queryClient.setQueryData(queryKeys.activities.detail(activity.id), activity);

      // Update in lists
      queryClient.setQueriesData(
        { queryKey: queryKeys.activities.lists() },
        (old: any) => {
          if (!old?.pages) return old;

          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              items: page.items.map((item: Activity) =>
                item.id === activity.id ? activity : item
              ),
            })),
          };
        }
      );

      if (__DEV__) console.log('✏️ Activity updated:', activity.id);
    },
  });

  // Activity deleted
  useSocketEvent<{ activityId: string }>({
    event: 'activity:deleted',
    onEvent: ({ activityId }) => {
      // Remove from detail cache
      queryClient.removeQueries({ queryKey: queryKeys.activities.detail(activityId) });

      // Remove from lists
      queryClient.setQueriesData(
        { queryKey: queryKeys.activities.lists() },
        (old: any) => {
          if (!old?.pages) return old;

          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              items: page.items.filter((item: Activity) => item.id !== activityId),
            })),
          };
        }
      );

      if (__DEV__) console.log('🗑️ Activity deleted:', activityId);
    },
  });

  // User joined activity
  useSocketEvent<{ activityId: string; userId: string; participantCount: number }>({
    event: 'activity:user_joined',
    onEvent: ({ activityId, participantCount }) => {
      // Update participant count
      updateActivityField(queryClient, activityId, { participants: participantCount });

      if (__DEV__) console.log('👋 User joined activity:', activityId);
    },
  });

  // User left activity
  useSocketEvent<{ activityId: string; userId: string; participantCount: number }>({
    event: 'activity:user_left',
    onEvent: ({ activityId, participantCount }) => {
      // Update participant count
      updateActivityField(queryClient, activityId, { participants: participantCount });

      if (__DEV__) console.log('👋 User left activity:', activityId);
    },
  });

  // Activity liked
  useSocketEvent<{ activityId: string; userId: string; likeCount: number }>({
    event: 'activity:like_added',
    onEvent: ({ activityId, likeCount }) => {
      // Update like count
      updateActivityField(queryClient, activityId, { likeCount });

      if (__DEV__) console.log('❤️ Activity liked:', activityId);
    },
  });

  // Activity unliked
  useSocketEvent<{ activityId: string; userId: string; likeCount: number }>({
    event: 'activity:like_removed',
    onEvent: ({ activityId, likeCount }) => {
      // Update like count
      updateActivityField(queryClient, activityId, { likeCount });

      if (__DEV__) console.log('💔 Activity unliked:', activityId);
    },
  });
}

/**
 * Helper: Update specific fields of an activity in all caches
 */
function updateActivityField(
  queryClient: any,
  activityId: string,
  updates: Partial<Activity>
) {
  // Update detail cache
  queryClient.setQueryData(
    queryKeys.activities.detail(activityId),
    (old: Activity | undefined) => {
      if (!old) return old;
      return { ...old, ...updates };
    }
  );

  // Update in lists
  queryClient.setQueriesData(
    { queryKey: queryKeys.activities.lists() },
    (old: any) => {
      if (!old?.pages) return old;

      return {
        ...old,
        pages: old.pages.map((page: any) => ({
          ...page,
          items: page.items.map((item: Activity) =>
            item.id === activityId ? { ...item, ...updates } : item
          ),
        })),
      };
    }
  );
}
