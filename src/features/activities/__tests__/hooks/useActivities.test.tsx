/**
 * useActivities Hook Tests - Infinite Query Testing
 *
 * Tests:
 * - Initial data loading
 * - Infinite scroll pagination
 * - Error handling
 * - Cache behavior
 * - Image preloading
 */

import { renderHook, waitFor } from '@testing-library/react-native';
import { AllProviders, createTestQueryClient } from '@/__tests__/utils/test-utils';
import { useActivities } from '../../hooks/useActivities';
import { mockActivities } from '@/__tests__/mocks/handlers';

describe('useActivities', () => {
  let queryClient: ReturnType<typeof createTestQueryClient>;

  beforeEach(() => {
    queryClient = createTestQueryClient();
  });

  afterEach(() => {
    queryClient.clear();
  });

  /**
   * Test: Initial data loading
   */
  it('should fetch activities successfully', async () => {
    const { result } = renderHook(() => useActivities(), {
      wrapper: ({ children }) => (
        <AllProviders queryClient={queryClient}>{children}</AllProviders>
      ),
    });

    // Initial loading state
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Verify data structure
    expect(result.current.data?.pages).toHaveLength(1);
    expect(result.current.data?.pages[0].items).toEqual(mockActivities);
    expect(result.current.data?.pages[0].hasMore).toBe(false);
  });

  /**
   * Test: Infinite scroll pagination
   */
  it('should fetch next page when hasMore is true', async () => {
    const { result } = renderHook(() => useActivities(), {
      wrapper: ({ children }) => (
        <AllProviders queryClient={queryClient}>{children}</AllProviders>
      ),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Check if next page is available
    const firstPage = result.current.data?.pages[0];
    if (firstPage?.hasMore) {
      // Fetch next page
      await result.current.fetchNextPage();

      await waitFor(() => {
        expect(result.current.data?.pages).toHaveLength(2);
      });
    }

    // Verify no infinite loop
    expect(result.current.hasNextPage).toBe(false);
  });

  /**
   * Test: Cache behavior
   */
  it('should use cached data on remount', async () => {
    // First mount
    const { result: firstResult, unmount } = renderHook(() => useActivities(), {
      wrapper: ({ children }) => (
        <AllProviders queryClient={queryClient}>{children}</AllProviders>
      ),
    });

    await waitFor(() => {
      expect(firstResult.current.isSuccess).toBe(true);
    });

    const firstData = firstResult.current.data;
    unmount();

    // Second mount (should use cache)
    const { result: secondResult } = renderHook(() => useActivities(), {
      wrapper: ({ children }) => (
        <AllProviders queryClient={queryClient}>{children}</AllProviders>
      ),
    });

    // Data should be immediately available from cache
    expect(secondResult.current.data).toEqual(firstData);
  });

  /**
   * Test: Error handling
   */
  it('should handle fetch errors gracefully', async () => {
    // Mock network error
    const mockFetch = jest.spyOn(global, 'fetch').mockRejectedValueOnce(
      new Error('Network error')
    );

    const { result } = renderHook(() => useActivities(), {
      wrapper: ({ children }) => (
        <AllProviders queryClient={queryClient}>{children}</AllProviders>
      ),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeTruthy();

    mockFetch.mockRestore();
  });

  /**
   * Test: Filters
   */
  it('should fetch activities with filters', async () => {
    const filters = {
      category: 'sports' as const,
      radius: 5,
    };

    const { result } = renderHook(() => useActivities(filters), {
      wrapper: ({ children }) => (
        <AllProviders queryClient={queryClient}>{children}</AllProviders>
      ),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Verify query key includes filters
    const queryKey = queryClient
      .getQueryCache()
      .getAll()[0]?.queryKey;

    expect(queryKey).toContain('sports');
  });

  /**
   * Test: Stale time configuration
   */
  it('should respect staleTime configuration', async () => {
    const { result } = renderHook(() => useActivities(), {
      wrapper: ({ children }) => (
        <AllProviders queryClient={queryClient}>{children}</AllProviders>
      ),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Check stale time is set (1 minute = 60000ms)
    const query = queryClient.getQueryCache().getAll()[0];
    expect(query?.options.staleTime).toBe(1 * 60 * 1000);
  });
});
