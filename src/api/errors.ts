/**
 * API Error Handling
 *
 * Elegant error handling with typed error classes and user-friendly messages.
 * Production-ready error classification and handling.
 */

import type { ApiError } from '@shared/types';

// ============================================================================
// Error Classes
// ============================================================================

/**
 * Base API Error
 */
export class ApiErrorBase extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  /**
   * User-friendly error message
   */
  getUserMessage(): string {
    return this.message;
  }

  /**
   * Convert to API error format
   */
  toApiError(): ApiError {
    return {
      message: this.message,
      code: this.code,
      details: this.details,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Network error (no connection, timeout, etc.)
 */
export class NetworkError extends ApiErrorBase {
  constructor(message: string = 'Network error. Please check your connection.') {
    super(message, 'NETWORK_ERROR', 0);
  }

  getUserMessage(): string {
    return 'Unable to connect. Please check your internet connection.';
  }
}

/**
 * Authentication error (401)
 */
export class AuthenticationError extends ApiErrorBase {
  constructor(message: string = 'Authentication required') {
    super(message, 'AUTH_REQUIRED', 401);
  }

  getUserMessage(): string {
    return 'Please log in to continue.';
  }
}

/**
 * Authorization error (403)
 */
export class AuthorizationError extends ApiErrorBase {
  constructor(message: string = 'Access denied') {
    super(message, 'ACCESS_DENIED', 403);
  }

  getUserMessage(): string {
    return 'You don\'t have permission to access this resource.';
  }
}

/**
 * Resource not found (404)
 */
export class NotFoundError extends ApiErrorBase {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 'NOT_FOUND', 404);
  }

  getUserMessage(): string {
    return 'The requested resource was not found.';
  }
}

/**
 * Validation error (400)
 */
export class ValidationError extends ApiErrorBase {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'VALIDATION_ERROR', 400, details);
  }

  getUserMessage(): string {
    return this.message || 'Invalid input. Please check your data.';
  }
}

/**
 * Server error (500+)
 */
export class ServerError extends ApiErrorBase {
  constructor(message: string = 'Server error') {
    super(message, 'SERVER_ERROR', 500);
  }

  getUserMessage(): string {
    return 'Something went wrong on our end. Please try again later.';
  }
}

/**
 * Rate limit error (429)
 */
export class RateLimitError extends ApiErrorBase {
  constructor(retryAfter?: number) {
    super('Rate limit exceeded', 'RATE_LIMIT', 429, { retryAfter });
  }

  getUserMessage(): string {
    const retryAfter = this.details?.retryAfter;
    if (retryAfter) {
      return `Too many requests. Please wait ${retryAfter} seconds before trying again.`;
    }
    return 'Too many requests. Please slow down.';
  }
}

/**
 * Timeout error
 */
export class TimeoutError extends ApiErrorBase {
  constructor(message: string = 'Request timeout') {
    super(message, 'TIMEOUT', 0);
  }

  getUserMessage(): string {
    return 'Request took too long. Please try again.';
  }
}

// ============================================================================
// Error Handler
// ============================================================================

/**
 * Parse API error from response
 */
export async function parseApiError(response: Response): Promise<ApiErrorBase> {
  const statusCode = response.status;

  try {
    const body = await response.json();
    const message = body.message || body.error || response.statusText;
    const code = body.code || `HTTP_${statusCode}`;
    const details = body.details;

    // Return appropriate error class based on status code
    switch (statusCode) {
      case 400:
        return new ValidationError(message, details);
      case 401:
        return new AuthenticationError(message);
      case 403:
        return new AuthorizationError(message);
      case 404:
        return new NotFoundError(message);
      case 429:
        return new RateLimitError(body.retryAfter);
      case 500:
      case 502:
      case 503:
      case 504:
        return new ServerError(message);
      default:
        return new ApiErrorBase(message, code, statusCode, details);
    }
  } catch (parseError) {
    // Failed to parse error response
    return new ApiErrorBase(
      response.statusText || 'Unknown error',
      `HTTP_${statusCode}`,
      statusCode
    );
  }
}

/**
 * Handle fetch error (network, timeout, etc.)
 */
export function handleFetchError(error: any): ApiErrorBase {
  if (error.name === 'AbortError') {
    return new TimeoutError();
  }

  if (error.message?.includes('Failed to fetch') || error.message?.includes('Network')) {
    return new NetworkError();
  }

  return new ApiErrorBase(
    error.message || 'Unknown error occurred',
    'UNKNOWN_ERROR',
    0
  );
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: ApiErrorBase): boolean {
  // Retry on network errors, timeouts, and 5xx server errors
  return (
    error instanceof NetworkError ||
    error instanceof TimeoutError ||
    (error.statusCode >= 500 && error.statusCode < 600)
  );
}

/**
 * Get retry delay for error (in ms)
 * Uses exponential backoff
 */
export function getRetryDelay(attemptNumber: number, error: ApiErrorBase): number {
  // Rate limit: use provided retry-after
  if (error instanceof RateLimitError && error.details?.retryAfter) {
    return error.details.retryAfter * 1000;
  }

  // Exponential backoff: 1s, 2s, 4s, 8s, ...
  return Math.min(1000 * Math.pow(2, attemptNumber), 30000);
}

// ============================================================================
// Error Logging
// ============================================================================

/**
 * Log error (development + production-ready for Sentry integration)
 */
export function logError(error: ApiErrorBase, context?: Record<string, any>) {
  if (__DEV__) {
    console.error('[API Error]', {
      name: error.name,
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      details: error.details,
      context,
    });
  }

  // TODO: Send to error tracking service (Sentry, Bugsnag, etc.)
  // if (!__DEV__) {
  //   Sentry.captureException(error, {
  //     tags: { code: error.code, statusCode: error.statusCode },
  //     extra: { details: error.details, context },
  //   });
  // }
}
