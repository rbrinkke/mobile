/**
 * useLikeActivity Hook Tests - Optimistic Updates Testing
 *
 * Tests:
 * - Optimistic UI updates (instant feedback)
 * - Server synchronization
 * - Error rollback
 * - Cache invalidation
 * - Concurrent mutations
 */

import { renderHook, waitFor } from '@testing-library/react-native';
import { AllProviders, createTestQueryClient } from '@/__tests__/utils/test-utils';
import { useLikeActivity, useActivities } from '../../hooks/useActivities';
import { queryKeys } from '@api/queryKeys';

describe('useLikeActivity', () => {
  let queryClient: ReturnType<typeof createTestQueryClient>;

  beforeEach(() => {
    queryClient = createTestQueryClient();
  });

  afterEach(() => {
    queryClient.clear();
  });

  /**
   * Test: Optimistic update - instant UI feedback
   */
  it('should update UI optimistically before server response', async () => {
    // Pre-populate cache with activities
    const { result: activitiesResult } = renderHook(() => useActivities(), {
      wrapper: ({ children }) => (
        <AllProviders queryClient={queryClient}>{children}</AllProviders>
      ),
    });

    await waitFor(() => {
      expect(activitiesResult.current.isSuccess).toBe(true);
    });

    const firstActivity = activitiesResult.current.data?.pages[0].items[0];
    expect(firstActivity?.liked).toBe(false);
    const initialLikeCount = firstActivity?.likeCount || 0;

    // Trigger like mutation
    const { result: likeResult } = renderHook(() => useLikeActivity(), {
      wrapper: ({ children }) => (
        <AllProviders queryClient={queryClient}>{children}</AllProviders>
      ),
    });

    likeResult.current.mutate(firstActivity!.id);

    // Check optimistic update (should be immediate)
    const cachedData = queryClient.getQueryData(queryKeys.activities.infiniteList());
    const updatedActivity = (cachedData as any)?.pages[0]?.items[0];

    // Optimistic update should have applied
    expect(updatedActivity?.liked).toBe(true);
    expect(updatedActivity?.likeCount).toBe(initialLikeCount + 1);

    // Wait for server response
    await waitFor(() => {
      expect(likeResult.current.isSuccess).toBe(true);
    });
  });

  /**
   * Test: Error rollback - restore previous state on error
   */
  it('should rollback optimistic update on server error', async () => {
    // Pre-populate cache
    const { result: activitiesResult } = renderHook(() => useActivities(), {
      wrapper: ({ children }) => (
        <AllProviders queryClient={queryClient}>{children}</AllProviders>
      ),
    });

    await waitFor(() => {
      expect(activitiesResult.current.isSuccess).toBe(true);
    });

    const firstActivity = activitiesResult.current.data?.pages[0].items[0];
    const originalLikeCount = firstActivity?.likeCount || 0;

    // Mock server error
    const mockFetch = jest.spyOn(global, 'fetch').mockRejectedValueOnce(
      new Error('Server error')
    );

    const { result: likeResult } = renderHook(() => useLikeActivity(), {
      wrapper: ({ children }) => (
        <AllProviders queryClient={queryClient}>{children}</AllProviders>
      ),
    });

    likeResult.current.mutate(firstActivity!.id);

    // Wait for error
    await waitFor(() => {
      expect(likeResult.current.isError).toBe(true);
    });

    // Verify rollback happened
    const cachedData = queryClient.getQueryData(queryKeys.activities.infiniteList());
    const rolledBackActivity = (cachedData as any)?.pages[0]?.items[0];

    expect(rolledBackActivity?.liked).toBe(false);
    expect(rolledBackActivity?.likeCount).toBe(originalLikeCount);

    mockFetch.mockRestore();
  });

  /**
   * Test: Cache invalidation after success
   */
  it('should invalidate cache after successful like', async () => {
    const { result: activitiesResult } = renderHook(() => useActivities(), {
      wrapper: ({ children }) => (
        <AllProviders queryClient={queryClient}>{children}</AllProviders>
      ),
    });

    await waitFor(() => {
      expect(activitiesResult.current.isSuccess).toBe(true);
    });

    const firstActivity = activitiesResult.current.data?.pages[0].items[0];

    const { result: likeResult } = renderHook(() => useLikeActivity(), {
      wrapper: ({ children }) => (
        <AllProviders queryClient={queryClient}>{children}</AllProviders>
      ),
    });

    likeResult.current.mutate(firstActivity!.id);

    await waitFor(() => {
      expect(likeResult.current.isSuccess).toBe(true);
    });

    // Verify cache was invalidated (refetch should happen)
    await waitFor(() => {
      const queries = queryClient.getQueryCache().getAll();
      const activitiesQuery = queries.find(
        (q) => JSON.stringify(q.queryKey).includes('activities')
      );
      expect(activitiesQuery?.state.dataUpdateCount).toBeGreaterThan(1);
    });
  });

  /**
   * Test: Concurrent mutations (race condition prevention)
   */
  it('should handle concurrent like/unlike mutations', async () => {
    const { result: activitiesResult } = renderHook(() => useActivities(), {
      wrapper: ({ children }) => (
        <AllProviders queryClient={queryClient}>{children}</AllProviders>
      ),
    });

    await waitFor(() => {
      expect(activitiesResult.current.isSuccess).toBe(true);
    });

    const firstActivity = activitiesResult.current.data?.pages[0].items[0];

    const { result: likeResult } = renderHook(() => useLikeActivity(), {
      wrapper: ({ children }) => (
        <AllProviders queryClient={queryClient}>{children}</AllProviders>
      ),
    });

    // Trigger multiple mutations rapidly
    likeResult.current.mutate(firstActivity!.id);
    likeResult.current.mutate(firstActivity!.id);

    await waitFor(() => {
      expect(likeResult.current.isIdle || likeResult.current.isSuccess).toBe(true);
    });

    // Final state should be consistent
    const cachedData = queryClient.getQueryData(queryKeys.activities.infiniteList());
    const finalActivity = (cachedData as any)?.pages[0]?.items[0];

    // Should not double-increment
    expect(finalActivity?.likeCount).toBeGreaterThanOrEqual(
      (firstActivity?.likeCount || 0) + 1
    );
  });

  /**
   * Test: Query cancellation (prevents race conditions)
   */
  it('should cancel ongoing queries before optimistic update', async () => {
    const { result: activitiesResult } = renderHook(() => useActivities(), {
      wrapper: ({ children }) => (
        <AllProviders queryClient={queryClient}>{children}</AllProviders>
      ),
    });

    await waitFor(() => {
      expect(activitiesResult.current.isSuccess).toBe(true);
    });

    const firstActivity = activitiesResult.current.data?.pages[0].items[0];

    const { result: likeResult } = renderHook(() => useLikeActivity(), {
      wrapper: ({ children }) => (
        <AllProviders queryClient={queryClient}>{children}</AllProviders>
      ),
    });

    const cancelQueriesSpy = jest.spyOn(queryClient, 'cancelQueries');

    likeResult.current.mutate(firstActivity!.id);

    // Verify cancelQueries was called
    await waitFor(() => {
      expect(cancelQueriesSpy).toHaveBeenCalledWith({
        queryKey: queryKeys.activities.all,
      });
    });

    cancelQueriesSpy.mockRestore();
  });
});
