/**
 * API Configuration for React Native
 *
 * Centralized configuration for API endpoints and environment settings.
 */

// For development: Use your local machine IP or ngrok URL
// For production: Use production API URL
export const API_CONFIG = {
  // Backend API URL - CHANGE THIS to your local IP or backend URL
  apiUrl: __DEV__
    ? 'http://localhost:8000'  // Development - Auth API (use your machine's IP for physical devices)
    : 'https://api.activity-app.com',  // Production

  // Timeouts
  requestTimeout: 10000,  // 10 seconds
  structureTimeout: 15000,  // 15 seconds for structure load

  // Retry configuration
  maxRetries: 3,
  retryDelay: 1000,
} as const;

/**
 * Get API base URL
 */
export function getApiUrl(): string {
  return API_CONFIG.apiUrl;
}

/**
 * Build full API endpoint URL
 */
export function buildApiUrl(path: string): string {
  const baseUrl = getApiUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}
