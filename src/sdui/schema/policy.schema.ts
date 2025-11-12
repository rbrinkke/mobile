import { z } from 'zod';

/**
 * SDUI Cache Policy Schema
 *
 * Defines how data should be cached and refetched for each query.
 * This is the core of the Policy-Driven Cache system.
 *
 * Strategy Types:
 * - onLoad: Fresh data every time (invalidate on mount)
 * - static: Never refetch (cache forever)
 * - poll: Auto-refresh at intervals (the "alarm bell")
 */

// ============================================================================
// Cache Strategy Types
// ============================================================================

/**
 * Cache Strategy Enum
 */
export const CachePolicyStrategySchema = z.enum(['onLoad', 'static', 'poll']);

export type CachePolicyStrategy = z.infer<typeof CachePolicyStrategySchema>;

// ============================================================================
// Adaptive Polling Configuration
// ============================================================================

/**
 * Adaptive Polling Configuration
 *
 * Makes polling smarter by adjusting intervals based on user activity.
 */
export const AdaptivePollingSchema = z
  .object({
    enabled: z.boolean().default(false).describe('Enable adaptive polling'),
    minInterval: z
      .number()
      .min(5000)
      .default(10000)
      .describe('Minimum poll interval (ms)'),
    maxInterval: z
      .number()
      .min(10000)
      .default(120000)
      .describe('Maximum poll interval (ms)'),
    backgroundMultiplier: z
      .number()
      .min(1)
      .default(4)
      .describe('Slow down polling by this factor when app backgrounded'),
    activityBoost: z
      .boolean()
      .default(true)
      .describe('Speed up polling on user activity (taps, scrolling)'),
  })
  .optional();

export type AdaptivePolling = z.infer<typeof AdaptivePollingSchema>;

// ============================================================================
// Cache Policy Schema
// ============================================================================

/**
 * Complete Cache Policy Configuration
 *
 * This schema defines all possible cache behaviors.
 */
export const CachePolicySchema = z
  .object({
    // Core strategy
    strategy: CachePolicyStrategySchema,

    // Strategy-specific options
    pollIntervalMs: z
      .number()
      .min(5000)
      .optional()
      .describe('Poll interval in milliseconds (required for poll strategy)'),

    // Advanced TanStack Query options (overrides)
    staleTimeMs: z
      .number()
      .min(0)
      .optional()
      .describe('Override default staleTime (ms)'),

    gcTimeMs: z
      .number()
      .min(0)
      .optional()
      .describe('Override default gcTime (ms)'),

    refetchOnWindowFocus: z
      .boolean()
      .optional()
      .describe('Refetch when app regains focus'),

    refetchOnReconnect: z
      .boolean()
      .optional()
      .describe('Refetch when network reconnects'),

    retry: z
      .union([z.boolean(), z.number().min(0).max(5)])
      .optional()
      .describe('Retry failed requests (false, or number of attempts)'),

    // Advanced features
    adaptivePolling: AdaptivePollingSchema,

    prefetch: z
      .boolean()
      .optional()
      .describe('Prefetch this query on app startup (cache warming)'),

    persist: z
      .boolean()
      .optional()
      .default(true)
      .describe('Persist this query to AsyncStorage'),

    // Metadata
    description: z
      .string()
      .optional()
      .describe('Human-readable description of this cache policy'),
  })
  .refine(
    (data) => {
      // Validation: poll strategy requires pollIntervalMs
      if (data.strategy === 'poll' && !data.pollIntervalMs) {
        return false;
      }
      return true;
    },
    {
      message: 'poll strategy requires pollIntervalMs to be set',
      path: ['pollIntervalMs'],
    }
  )
  .refine(
    (data) => {
      // Validation: gcTime should be >= staleTime
      if (data.gcTimeMs && data.staleTimeMs && data.gcTimeMs < data.staleTimeMs) {
        return false;
      }
      return true;
    },
    {
      message: 'gcTimeMs must be >= staleTimeMs',
      path: ['gcTimeMs'],
    }
  );

export type CachePolicy = z.infer<typeof CachePolicySchema>;

// ============================================================================
// Data Query Configuration
// ============================================================================

/**
 * Data Query Configuration
 *
 * Defines a single data query with its cache policy.
 * Pages and components can have multiple queries.
 */
export const DataQueryConfigSchema = z.object({
  id: z.string().min(1).describe('Unique identifier for this query'),

  queryName: z.string().min(1).describe('The read-api query_name to execute'),

  params: z
    .record(z.string(), z.unknown())
    .optional()
    .default({})
    .describe('Static query parameters'),

  dependencies: z
    .array(z.string())
    .optional()
    .describe('IDs of other queries this query depends on'),

  condition: z
    .string()
    .optional()
    .describe('Conditional expression (e.g., "${features.notifications === true}")'),

  cachePolicy: CachePolicySchema.optional().describe('Cache policy for this query'),

  enabled: z
    .boolean()
    .default(true)
    .describe('Is this query enabled?'),
});

export type DataQueryConfig = z.infer<typeof DataQueryConfigSchema>;

// ============================================================================
// Component Data Configuration
// ============================================================================

/**
 * Component Data Configuration
 *
 * Defines data requirements for a component (page or widget).
 */
export const ComponentDataSchema = z
  .object({
    queries: z
      .array(DataQueryConfigSchema)
      .optional()
      .describe('Data queries for this component'),

    prefetchOnHover: z
      .boolean()
      .optional()
      .describe('Prefetch data when user hovers over navigation link'),
  })
  .optional();

export type ComponentData = z.infer<typeof ComponentDataSchema>;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Validates a cache policy
 *
 * @throws {z.ZodError} If validation fails
 */
export function validateCachePolicy(policy: unknown): CachePolicy {
  return CachePolicySchema.parse(policy);
}

/**
 * Safely validates a cache policy (doesn't throw)
 */
export function safeCachePolicy(policy: unknown) {
  return CachePolicySchema.safeParse(policy);
}

/**
 * Validates a data query configuration
 */
export function validateDataQueryConfig(config: unknown): DataQueryConfig {
  return DataQueryConfigSchema.parse(config);
}

/**
 * Get default cache policy for a strategy
 */
export function getDefaultCachePolicy(strategy: CachePolicyStrategy): CachePolicy {
  const defaults: Record<CachePolicyStrategy, CachePolicy> = {
    onLoad: {
      strategy: 'onLoad',
      persist: true,
      staleTimeMs: 0,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      description: 'Fresh data on every load',
    },
    static: {
      strategy: 'static',
      persist: true,
      staleTimeMs: Infinity,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      description: 'Static content, never refetch',
    },
    poll: {
      strategy: 'poll',
      persist: true,
      pollIntervalMs: 30000,
      refetchOnWindowFocus: false,
      description: 'Auto-refresh every 30 seconds',
    },
  };

  return defaults[strategy];
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Check if a cache policy uses poll strategy
 */
export function isPollStrategy(policy: CachePolicy): boolean {
  return policy.strategy === 'poll';
}

/**
 * Check if a cache policy uses static strategy
 */
export function isStaticStrategy(policy: CachePolicy): boolean {
  return policy.strategy === 'static';
}

/**
 * Check if a cache policy uses onLoad strategy
 */
export function isOnLoadStrategy(policy: CachePolicy): boolean {
  return policy.strategy === 'onLoad';
}

// ============================================================================
// Debug Helpers
// ============================================================================

/**
 * Get human-readable description of cache policy
 */
export function describeCachePolicy(policy: CachePolicy): string {
  if (policy.description) {
    return policy.description;
  }

  switch (policy.strategy) {
    case 'onLoad':
      return 'Fresh data on every load (instant invalidation)';
    case 'static':
      return 'Static content (never refetch)';
    case 'poll':
      return `Auto-refresh every ${policy.pollIntervalMs}ms${
        policy.adaptivePolling?.enabled ? ' (adaptive)' : ''
      }`;
  }
}
