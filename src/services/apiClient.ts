/**
 * Real API Client for Content API
 *
 * Handles communication with the backend SDUI endpoints.
 */

import { API_CONFIG, buildApiUrl } from '../config/api.config';
import type { AppStructure } from '../sdui';

/**
 * JWT Token Management
 * TODO: Integrate with auth system
 */
let jwtToken: string | null = null;

export function setAuthToken(token: string) {
  jwtToken = token;
}

export function getAuthToken(): string | null {
  return jwtToken;
}

export function clearAuthToken() {
  jwtToken = null;
}

/**
 * Make authenticated API request
 */
async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = new Headers(options.headers);

  // Debug logging
  if (__DEV__) {
    console.log('[API] authenticatedFetch called');
    console.log('[API] jwtToken available:', !!jwtToken);
    console.log('[API] jwtToken value:', jwtToken ? jwtToken.substring(0, 20) + '...' : 'null');
  }

  // Add JWT token if available
  if (jwtToken) {
    headers.set('Authorization', `Bearer ${jwtToken}`);
    if (__DEV__) {
      console.log('[API] Authorization header set');
    }
  } else {
    if (__DEV__) {
      console.warn('[API] WARNING: No JWT token available!');
    }
  }

  // Add content type
  headers.set('Content-Type', 'application/json');

  // Fetch with timeout using AbortController
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.requestTimeout);

  try {
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

/**
 * Real API Client
 */
export const apiClient = {
  /**
   * GET /api/sdui/structure
   *
   * Fetches the complete app structure from the backend.
   */
  async getStructure(): Promise<AppStructure> {
    const url = buildApiUrl('/api/sdui/structure');

    if (__DEV__) {
      console.log('[API] GET /api/sdui/structure');
    }

    const response = await authenticatedFetch(url, {
      method: 'GET',
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to fetch structure: ${response.status} ${error}`);
    }

    const structure = (await response.json()) as AppStructure;

    if (__DEV__) {
      console.log('[API] Structure loaded:', {
        version: structure.version,
        pages: structure.pages?.length || 0,
        buildingBlocks: structure.buildingBlocks?.length || 0,
      });
    }

    return structure;
  },

  /**
   * GET /api/sdui/read?query_name={name}
   *
   * Fetches data for a specific query.
   */
  async query(params: { query_name: string; [key: string]: any }): Promise<any> {
    const { query_name, ...otherParams } = params;

    // Build query string
    const queryParams = new URLSearchParams({
      query_name,
      ...otherParams,
    });

    const url = buildApiUrl(`/api/sdui/read?${queryParams.toString()}`);

    if (__DEV__) {
      console.log(`[API] GET /api/sdui/read?query_name=${query_name}`);
    }

    const response = await authenticatedFetch(url, {
      method: 'GET',
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Query failed (${query_name}): ${response.status} ${error}`);
    }

    const data = await response.json();

    if (__DEV__) {
      console.log(`[API] Query data received for ${query_name}:`, Object.keys(data));
    }

    return data;
  },
};

export default apiClient;
