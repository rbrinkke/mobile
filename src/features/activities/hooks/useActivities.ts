/**
 * Activities Hook - Data fetching with TanStack Query
 *
 * Features:
 * - Infinite scroll with FlashList
 * - Optimistic updates for likes/joins
 * - Real-time feel with proper staleTime
 * - Image preloading for better UX
 * - Type-safe with domain models
 */

import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { queryKeys, invalidateActivities } from '@api/queryKeys';
import { preloadActivityImages } from '@shared/utils/imageUtils';
import { activitiesApi } from '../services/activitiesApi';
import type { Activity, ActivityFilters, ActivitiesListResponse } from '../types';

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Fetch activities with infinite scroll support
 * Includes automatic image preloading for better UX
 */
export function useActivities(filters?: ActivityFilters) {
  const query = useInfiniteQuery({
    queryKey: queryKeys.activities.infiniteList(filters),
    queryFn: async ({ pageParam = 0 }) => {
      return activitiesApi.getActivities(pageParam, 20, filters);
    },
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.nextOffset : undefined;
    },
    initialPageParam: 0,
    staleTime: 1 * 60 * 1000, // 1 minute (fresh for social feed)
    gcTime: 10 * 60 * 1000, // 10 minutes cache
  });

  // Preload images when new data arrives
  useEffect(() => {
    if (query.data?.pages) {
      const allActivities = query.data.pages.flatMap((page) => page.items);
      preloadActivityImages(allActivities);
    }
  }, [query.data]);

  return query;
}

/**
 * Fetch single activity by ID
 */
export function useActivity(id: string) {
  return useInfiniteQuery({
    queryKey: queryKeys.activities.detail(id),
    queryFn: () => activitiesApi.getActivity(id),
    staleTime: 5 * 60 * 1000, // 5 minutes (details change less frequently)
  });
}

/**
 * Search activities by query
 */
export function useSearchActivities(query: string, enabled: boolean = true) {
  return useInfiniteQuery({
    queryKey: [...queryKeys.activities.lists(), 'search', query],
    queryFn: () => activitiesApi.searchActivities(query),
    enabled: enabled && query.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Get nearby activities based on location
 */
export function useNearbyActivities(
  lat: number,
  lng: number,
  radius: number = 10,
  enabled: boolean = true
) {
  return useInfiniteQuery({
    queryKey: [...queryKeys.activities.lists(), 'nearby', { lat, lng, radius }],
    queryFn: () => activitiesApi.getNearbyActivities(lat, lng, radius),
    enabled,
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Like activity with optimistic updates
 */
export function useLikeActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (activityId: string) => activitiesApi.likeActivity(activityId),
    onMutate: async (activityId) => {
      // Cancel ongoing queries
      await queryClient.cancelQueries({ queryKey: queryKeys.activities.all });

      // Snapshot for rollback
      const previousData = queryClient.getQueryData(queryKeys.activities.infiniteList());

      // Optimistically update
      queryClient.setQueryData(queryKeys.activities.infiniteList(), (old: any) => {
        if (!old?.pages) return old;

        return {
          ...old,
          pages: old.pages.map((page: ActivitiesListResponse) => ({
            ...page,
            items: page.items.map((activity: Activity) =>
              activity.id === activityId
                ? {
                    ...activity,
                    liked: true,
                    likeCount: activity.likeCount + 1,
                  }
                : activity
            ),
          })),
        };
      });

      return { previousData };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(queryKeys.activities.infiniteList(), context.previousData);
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      invalidateActivities(queryClient, 'lists');
    },
  });
}

/**
 * Unlike activity with optimistic updates
 */
export function useUnlikeActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (activityId: string) => activitiesApi.unlikeActivity(activityId),
    onMutate: async (activityId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.activities.all });
      const previousData = queryClient.getQueryData(queryKeys.activities.infiniteList());

      queryClient.setQueryData(queryKeys.activities.infiniteList(), (old: any) => {
        if (!old?.pages) return old;

        return {
          ...old,
          pages: old.pages.map((page: ActivitiesListResponse) => ({
            ...page,
            items: page.items.map((activity: Activity) =>
              activity.id === activityId
                ? {
                    ...activity,
                    liked: false,
                    likeCount: Math.max(0, activity.likeCount - 1),
                  }
                : activity
            ),
          })),
        };
      });

      return { previousData };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKeys.activities.infiniteList(), context.previousData);
      }
    },
    onSettled: () => {
      invalidateActivities(queryClient, 'lists');
    },
  });
}

/**
 * Join activity with optimistic updates
 */
export function useJoinActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (activityId: string) => activitiesApi.joinActivity(activityId),
    onMutate: async (activityId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.activities.all });
      const previousData = queryClient.getQueryData(queryKeys.activities.infiniteList());

      queryClient.setQueryData(queryKeys.activities.infiniteList(), (old: any) => {
        if (!old?.pages) return old;

        return {
          ...old,
          pages: old.pages.map((page: ActivitiesListResponse) => ({
            ...page,
            items: page.items.map((activity: Activity) =>
              activity.id === activityId
                ? {
                    ...activity,
                    participants: activity.participants + 1,
                  }
                : activity
            ),
          })),
        };
      });

      return { previousData };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKeys.activities.infiniteList(), context.previousData);
      }
    },
    onSettled: () => {
      invalidateActivities(queryClient, 'lists');
    },
  });
}

/**
 * Leave activity with optimistic updates
 */
export function useLeaveActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (activityId: string) => activitiesApi.leaveActivity(activityId),
    onMutate: async (activityId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.activities.all });
      const previousData = queryClient.getQueryData(queryKeys.activities.infiniteList());

      queryClient.setQueryData(queryKeys.activities.infiniteList(), (old: any) => {
        if (!old?.pages) return old;

        return {
          ...old,
          pages: old.pages.map((page: ActivitiesListResponse) => ({
            ...page,
            items: page.items.map((activity: Activity) =>
              activity.id === activityId
                ? {
                    ...activity,
                    participants: Math.max(0, activity.participants - 1),
                  }
                : activity
            ),
          })),
        };
      });

      return { previousData };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKeys.activities.infiniteList(), context.previousData);
      }
    },
    onSettled: () => {
      invalidateActivities(queryClient, 'lists');
    },
  });
}

/**
 * Create new activity
 */
export function useCreateActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: activitiesApi.createActivity,
    onSuccess: () => {
      // Invalidate all activity lists to show new activity
      invalidateActivities(queryClient, 'lists');
    },
  });
}

/**
 * Update existing activity
 */
export function useUpdateActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: activitiesApi.updateActivity,
    onSuccess: (updatedActivity) => {
      // Update detail cache
      queryClient.setQueryData(queryKeys.activities.detail(updatedActivity.id), updatedActivity);

      // Invalidate lists to reflect changes
      invalidateActivities(queryClient, 'lists');
    },
  });
}

/**
 * Delete activity
 */
export function useDeleteActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: activitiesApi.deleteActivity,
    onSuccess: () => {
      // Invalidate all activity queries
      invalidateActivities(queryClient, 'all');
    },
  });
}
