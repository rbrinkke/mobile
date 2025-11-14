/**
 * Shared Type Definitions
 *
 * Common types used across multiple features.
 * Domain-agnostic, reusable type definitions.
 */

// ============================================================================
// API Response Patterns
// ============================================================================

/**
 * Standard paginated API response
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * Standard API error response
 */
export interface ApiError {
  message: string;
  code: string;
  details?: Record<string, any>;
  timestamp: string;
}

/**
 * Standard success response
 */
export interface ApiSuccess<T = void> {
  success: true;
  data?: T;
  message?: string;
}

// ============================================================================
// Common Domain Types
// ============================================================================

/**
 * Geographic coordinates
 */
export interface Coordinates {
  lat: number;
  lng: number;
}

/**
 * Address information
 */
export interface Address {
  street?: string;
  city: string;
  postalCode?: string;
  country: string;
  coordinates?: Coordinates;
}

/**
 * User reference (minimal user info)
 */
export interface UserRef {
  id: string;
  name: string;
  avatarUrl?: string;
}

/**
 * Media/Image information
 */
export interface MediaItem {
  id: string;
  url: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  blurhash?: string;
  altText?: string;
}

/**
 * Time range
 */
export interface TimeRange {
  start: string;  // ISO 8601
  end: string;    // ISO 8601
}

/**
 * Date range
 */
export interface DateRange {
  from: string;  // ISO 8601 date
  to: string;    // ISO 8601 date
}

// ============================================================================
// UI State Types
// ============================================================================

/**
 * Loading states
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Sort direction
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Sort configuration
 */
export interface SortConfig<T extends string = string> {
  field: T;
  direction: SortDirection;
}

/**
 * Filter state (generic)
 */
export interface FilterState {
  search?: string;
  sort?: SortConfig;
  [key: string]: any;
}

// ============================================================================
// Form Types
// ============================================================================

/**
 * Form field error
 */
export interface FieldError {
  field: string;
  message: string;
  code?: string;
}

/**
 * Form validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: FieldError[];
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Make specific properties optional
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Make specific properties required
 */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/**
 * Nullable type
 */
export type Nullable<T> = T | null;

/**
 * Optional type
 */
export type Optional<T> = T | undefined;

/**
 * ID type (branded string for type safety)
 */
export type ID = string & { readonly __brand: 'ID' };

/**
 * Create ID from string (runtime validation should happen at boundaries)
 */
export function createID(value: string): ID {
  return value as ID;
}

/**
 * Timestamp (ISO 8601 string)
 */
export type Timestamp = string & { readonly __brand: 'Timestamp' };

/**
 * Create timestamp from string
 */
export function createTimestamp(value: string): Timestamp {
  return value as Timestamp;
}
