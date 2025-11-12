/**
 * Runtime Context Types
 *
 * Defines the type-safe structure for the Runtime Context Injection Protocol.
 *
 * The Runtime Context allows PageSection dataSource.params to reference live client-side
 * values using the $$CONTEXT.PATH pattern (e.g., $$USER.EMAIL, $$GEOLOCATION.LAT).
 *
 * This enables server-side filtering based on dynamic client state without embedding
 * filter logic in Building Blocks.
 */

// ============================================================================
// Context Namespaces
// ============================================================================

/**
 * USER Context - Data from the authenticated user (Auth Store)
 *
 * Available when user is authenticated.
 * Maps to User fields from authStore.
 */
export interface UserContext {
  /** User ID (UUID) */
  ID: string;

  /** User email address */
  EMAIL: string;

  /** Email verification status */
  IS_VERIFIED: boolean;

  /** 2FA enabled status */
  IS_2FA_ENABLED: boolean;
}

/**
 * GEOLOCATION Context - Live GPS coordinates
 *
 * Available when user grants location permission.
 * Can be used for proximity-based filtering.
 */
export interface GeolocationContext {
  /** Latitude coordinate */
  LAT: number;

  /** Longitude coordinate */
  LON: number;

  /** Accuracy in meters (optional) */
  ACCURACY?: number;
}

/**
 * FILTER Context - Global client-side filter state
 *
 * Can store app-wide search terms, selected categories, etc.
 * Useful for cross-page filtering without prop drilling.
 */
export interface FilterContext {
  /** Global search term */
  GLOBAL_SEARCH?: string;

  /** Selected category ID */
  CATEGORY?: string;

  /** Date range start (ISO 8601) */
  DATE_FROM?: string;

  /** Date range end (ISO 8601) */
  DATE_TO?: string;

  /** Custom filter fields (extensible) */
  [key: string]: string | number | boolean | undefined;
}

// ============================================================================
// Complete Runtime Context
// ============================================================================

/**
 * Complete Runtime Context
 *
 * Aggregates all context namespaces into one object.
 * This is what gets injected into PageSection params.
 *
 * Usage in JSON:
 * ```json
 * {
 *   "dataSource": {
 *     "queryName": "list_nearby_users",
 *     "params": {
 *       "user_lat": "$$GEOLOCATION.LAT",
 *       "user_lon": "$$GEOLOCATION.LON",
 *       "exclude_user_id": "$$USER.ID"
 *     }
 *   }
 * }
 * ```
 */
export interface RuntimeContext {
  /** Authenticated user context (null if not logged in) */
  USER: UserContext | null;

  /** Geolocation context (null if not available) */
  GEOLOCATION: GeolocationContext | null;

  /** Global filter state */
  FILTER: FilterContext;
}

// ============================================================================
// Helper Types
// ============================================================================

/**
 * Context Variable Path
 *
 * Type-safe representation of valid $$CONTEXT paths.
 *
 * Examples:
 * - "$$USER.ID"
 * - "$$GEOLOCATION.LAT"
 * - "$$FILTER.GLOBAL_SEARCH"
 */
export type ContextVariablePath = `$$${keyof RuntimeContext}.${string}`;

/**
 * Parameter Value
 *
 * Can be a static value OR a runtime context variable reference.
 */
export type ParameterValue = string | number | boolean | null | ContextVariablePath;

/**
 * Parameters with Context Support
 *
 * Like Record<string, any>, but with explicit support for $$CONTEXT variables.
 */
export type ParametersWithContext = Record<string, ParameterValue>;

// ============================================================================
// Resolution Result
// ============================================================================

/**
 * Parameter Resolution Result
 *
 * After resolving $$CONTEXT variables, params are transformed:
 * - Successfully resolved: value replaced with live data
 * - Failed to resolve (null/undefined): parameter removed OR query disabled
 */
export interface ResolvedParameters {
  /** Resolved parameters (ready for API call) */
  params: Record<string, any>;

  /** Should the query be enabled? (false if critical context is missing) */
  queryEnabled: boolean;

  /** Missing context variables (for debugging) */
  missingContext: string[];
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Check if a value is a context variable reference
 */
export function isContextVariable(value: any): value is ContextVariablePath {
  return typeof value === 'string' && value.startsWith('$$');
}

/**
 * Parse a context variable path into [namespace, field]
 *
 * @example
 * parseContextPath('$$USER.EMAIL') → ['USER', 'EMAIL']
 */
export function parseContextPath(path: string): [string, string] | null {
  if (!isContextVariable(path)) {
    return null;
  }

  const cleanPath = path.slice(2); // Remove '$$'
  const parts = cleanPath.split('.');

  if (parts.length !== 2) {
    console.warn(`[RuntimeContext] Invalid context path: ${path} (expected $$NAMESPACE.FIELD)`);
    return null;
  }

  return [parts[0], parts[1]];
}
