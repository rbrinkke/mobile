/**
 * API Layer - Public Exports
 *
 * Centralized exports for the API layer.
 * Everything needed for making API calls and managing data.
 */

// API Client
export { default as apiClient } from './client';
export { setAuthToken, getAuthToken, clearAuthToken } from './client';

// Query Client & Storage
export { queryClient, persister, storage } from './queryClient';

// Query Keys
export { queryKeys } from './queryKeys';
export type { ActivityFilters, UserFilters, NotificationFilters } from './queryKeys';

// Invalidation Helpers
export {
  invalidateActivities,
  invalidateUsers,
  invalidateChats,
} from './queryKeys';

// Error Handling
export {
  ApiErrorBase,
  NetworkError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ValidationError,
  ServerError,
  RateLimitError,
  TimeoutError,
  parseApiError,
  handleFetchError,
  isRetryableError,
  getRetryDelay,
  logError,
} from './errors';

// Storage
export { mmkvStorage } from './storage';
