/**
 * API Client - Production-Ready HTTP Client
 *
 * Enterprise-grade API client with elegant error handling.
 * Features:
 * - JWT token management
 * - Type-safe error handling
 * - Automatic request timeout
 * - Development logging
 * - Production-ready error reporting
 */

import { API_CONFIG, buildApiUrl } from '../config/api.config';
import { parseApiError, handleFetchError, logError } from './errors';

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
  const method = options.method || 'GET';
  const requestId = `${method}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

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

  // 🔥 COMPREHENSIVE REQUEST LOGGING
  if (__DEV__) {
    console.group(`🌐 API Request [${requestId}]`);
    console.log('📍 URL:', url);
    console.log('🔧 Method:', method);
    console.log('🔑 Has Token:', !!jwtToken);
    if (options.body) {
      try {
        console.log('📦 Body:', JSON.parse(options.body as string));
      } catch {
        console.log('📦 Body:', options.body);
      }
    }
    console.log('⏱️  Timeout:', API_CONFIG.requestTimeout + 'ms');
    console.log('🕐 Started:', new Date().toISOString());
    console.groupEnd();
  }

  const startTime = Date.now();

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const duration = Date.now() - startTime;

    // 🔥 COMPREHENSIVE RESPONSE LOGGING
    if (__DEV__) {
      const responseClone = response.clone();
      let responseData;
      try {
        responseData = await responseClone.json();
      } catch {
        responseData = await responseClone.text();
      }

      console.group(`${response.ok ? '✅' : '❌'} API Response [${requestId}]`);
      console.log('📍 URL:', url);
      console.log('📊 Status:', response.status, response.statusText);
      console.log('⏱️  Duration:', duration + 'ms');
      console.log('📦 Data:', responseData);
      console.log('🕐 Completed:', new Date().toISOString());
      console.groupEnd();
    }

    // Handle HTTP errors
    if (!response.ok) {
      const apiError = await parseApiError(response);
      logError(apiError, { url, method, requestId, duration });
      throw apiError;
    }

    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);
    const duration = Date.now() - startTime;

    // 🔥 COMPREHENSIVE ERROR LOGGING
    if (__DEV__) {
      console.group(`💥 API Error [${requestId}]`);
      console.log('📍 URL:', url);
      console.log('🔧 Method:', method);
      console.log('⏱️  Duration:', duration + 'ms');
      console.log('❌ Error Type:', error.name || 'Unknown');
      console.log('💬 Error Message:', error.message || 'No message');
      if (error.statusCode) {
        console.log('📊 Status Code:', error.statusCode);
      }
      console.log('📦 Full Error:', error);
      console.log('🕐 Failed at:', new Date().toISOString());
      console.groupEnd();
    }

    // Already an API error, re-throw
    if (error.statusCode !== undefined) {
      throw error;
    }

    // Handle fetch/network errors
    const apiError = handleFetchError(error);
    logError(apiError, { url, method, requestId, duration });
    throw apiError;
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

    return response.json();
  },
};

export default apiClient;
