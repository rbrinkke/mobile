/**
 * Simple API client - KISS!
 */

import axios from 'axios';

// API URL - Use host IP for web browser compatibility
// When running in web browser, localhost refers to the browser's localhost, not the server
// For native apps, localhost works because it's the device's localhost
const API_URL = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
  ? `http://${window.location.hostname}:8000`  // Use same hostname as web app
  : 'http://localhost:8000';  // Fallback for native/local dev

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,  // Increased to 30s for slow connections
  headers: {
    'Content-Type': 'application/json',
  },
});

// Log API URL for debugging
console.log('🔗 API Client initialized:', API_URL);

// Response interceptor voor error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);
