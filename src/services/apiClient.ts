/**
 * API Client - Generic HTTP client with JWT authentication
 *
 * Professional API client for making authenticated requests to any backend.
 * Features:
 * - JWT token management
 * - Request timeout handling
 * - Type-safe methods
 * - Development logging
 */

import { API_CONFIG, buildApiUrl } from '../config/api.config';

// ============================================================================
// JWT Token Management
// ============================================================================

let jwtToken: string | null = null;

/**
 * Set the JWT access token for authenticated requests
 */
export function setAuthToken(token: string) {
  jwtToken = token;
  if (__DEV__) {
    console.log('🔑 Auth token set:', token.substring(0, 20) + '...');
  }
}

/**
 * Get the current JWT token
 */
export function getAuthToken(): string | null {
  return jwtToken;
}

/**
 * Clear the JWT token (logout)
 */
export function clearAuthToken() {
  jwtToken = null;
  if (__DEV__) {
    console.log('🔓 Auth token cleared');
  }
}

// ============================================================================
// Authenticated Fetch
// ============================================================================

/**
 * Make authenticated API request with automatic JWT injection
 */
async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = new Headers(options.headers);

  // Add JWT token if available
  if (jwtToken) {
    headers.set('Authorization', `Bearer ${jwtToken}`);
  } else if (__DEV__) {
    console.warn('[API] No JWT token available');
  }

  // Add content type
  headers.set('Content-Type', 'application/json');

  // Fetch with timeout using AbortController
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.requestTimeout);

  try {
    if (__DEV__) {
      console.log(`[API] ${options.method || 'GET'} ${url}`);
    }

    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
}

// ============================================================================
// API Client
// ============================================================================

/**
 * Generic API Client with common HTTP methods
 *
 * Usage:
 * ```typescript
 * // GET request
 * const data = await apiClient.get('/api/users/123');
 *
 * // POST request
 * const result = await apiClient.post('/api/users', { name: 'John' });
 *
 * // With query params
 * const data = await apiClient.get('/api/search', { q: 'react native' });
 * ```
 */
export const apiClient = {
  /**
   * GET request
   */
  async get<T = any>(endpoint: string, params?: Record<string, any>): Promise<T> {
    let url = buildApiUrl(endpoint);

    // Add query params if provided
    if (params) {
      const queryParams = new URLSearchParams(params);
      url = `${url}?${queryParams.toString()}`;
    }

    const response = await authenticatedFetch(url, {
      method: 'GET',
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`GET ${endpoint} failed: ${response.status} ${error}`);
    }

    return response.json();
  },

  /**
   * POST request
   */
  async post<T = any>(endpoint: string, body?: any): Promise<T> {
    const url = buildApiUrl(endpoint);

    const response = await authenticatedFetch(url, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`POST ${endpoint} failed: ${response.status} ${error}`);
    }

    return response.json();
  },

  /**
   * PUT request
   */
  async put<T = any>(endpoint: string, body?: any): Promise<T> {
    const url = buildApiUrl(endpoint);

    const response = await authenticatedFetch(url, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`PUT ${endpoint} failed: ${response.status} ${error}`);
    }

    return response.json();
  },

  /**
   * DELETE request
   */
  async delete<T = any>(endpoint: string): Promise<T> {
    const url = buildApiUrl(endpoint);

    const response = await authenticatedFetch(url, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`DELETE ${endpoint} failed: ${response.status} ${error}`);
    }

    return response.json();
  },

  /**
   * PATCH request
   */
  async patch<T = any>(endpoint: string, body?: any): Promise<T> {
    const url = buildApiUrl(endpoint);

    const response = await authenticatedFetch(url, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`PATCH ${endpoint} failed: ${response.status} ${error}`);
    }

    return response.json();
  },
};

export default apiClient;
