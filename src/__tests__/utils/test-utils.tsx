/**
 * Test Utilities - Best-in-Class Testing Helpers
 *
 * Features:
 * - Custom render with providers
 * - Query client wrapper
 * - Navigation mocks
 * - Accessibility testing helpers
 */

import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainer } from '@react-navigation/native';

/**
 * Create fresh QueryClient for each test
 * Prevents test pollution
 */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // No retries in tests
        gcTime: Infinity, // Keep cache during tests
      },
      mutations: {
        retry: false,
      },
    },
    logger: {
      log: console.log,
      warn: console.warn,
      error: () => {}, // Suppress error logs in tests
    },
  });
}

/**
 * All providers wrapper for testing
 */
interface AllProvidersProps {
  children: React.ReactNode;
  queryClient?: QueryClient;
}

export function AllProviders({ children, queryClient }: AllProvidersProps) {
  const client = queryClient || createTestQueryClient();

  return (
    <QueryClientProvider client={client}>
      <NavigationContainer>{children}</NavigationContainer>
    </QueryClientProvider>
  );
}

/**
 * Custom render with providers
 *
 * Usage:
 * ```typescript
 * const { getByText } = renderWithProviders(<MyComponent />);
 * ```
 */
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
}

export function renderWithProviders(
  ui: ReactElement,
  options?: CustomRenderOptions
) {
  const { queryClient, ...renderOptions } = options || {};

  const client = queryClient || createTestQueryClient();

  return {
    ...render(ui, {
      wrapper: ({ children }) => (
        <AllProviders queryClient={client}>{children}</AllProviders>
      ),
      ...renderOptions,
    }),
    queryClient: client,
  };
}

/**
 * Wait for query to be loaded
 *
 * Usage:
 * ```typescript
 * const { queryClient } = renderWithProviders(<Component />);
 * await waitForQueryToLoad(queryClient, ['activities']);
 * ```
 */
export async function waitForQueryToLoad(
  queryClient: QueryClient,
  queryKey: unknown[]
): Promise<void> {
  await new Promise<void>((resolve) => {
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      const query = event.query;
      if (
        JSON.stringify(query.queryKey) === JSON.stringify(queryKey) &&
        query.state.status === 'success'
      ) {
        unsubscribe();
        resolve();
      }
    });
  });
}

/**
 * Mock navigation for testing
 */
export const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  push: jest.fn(),
  pop: jest.fn(),
  reset: jest.fn(),
  setParams: jest.fn(),
  dispatch: jest.fn(),
  setOptions: jest.fn(),
  isFocused: jest.fn(() => true),
  canGoBack: jest.fn(() => true),
  getId: jest.fn(),
  getState: jest.fn(),
  getParent: jest.fn(),
  addListener: jest.fn(() => jest.fn()),
  removeListener: jest.fn(),
};

/**
 * Mock route for testing
 */
export const mockRoute = {
  key: 'test-route',
  name: 'TestScreen' as const,
  params: {} as any,
  path: undefined,
};

/**
 * Create mock route with params
 */
export function createMockRoute<T extends object>(
  name: string,
  params: T
): typeof mockRoute {
  return {
    ...mockRoute,
    name: name as any,
    params,
  };
}

/**
 * Accessibility testing helpers
 */
export const a11y = {
  /**
   * Get element by accessibility label
   */
  getByA11yLabel: (label: string, { exact = true }: { exact?: boolean } = {}) => {
    return { accessibilityLabel: exact ? label : expect.stringContaining(label) };
  },

  /**
   * Get element by accessibility hint
   */
  getByA11yHint: (hint: string) => {
    return { accessibilityHint: hint };
  },

  /**
   * Check if element is accessible
   */
  isAccessible: (element: any) => {
    return element.props.accessible === true;
  },
};

/**
 * Re-export everything from React Native Testing Library
 */
export * from '@testing-library/react-native';
