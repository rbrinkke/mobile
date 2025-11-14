/**
 * Authentication Service - Production-Ready Token Management
 *
 * Features:
 * - Automatic token refresh on 401 responses
 * - Prevents multiple simultaneous refresh calls
 * - Token expiry detection (proactive refresh)
 * - Secure storage with MMKV
 * - Type-safe authentication state
 * - Network error handling
 */

import { storage } from '@api/storage';
import apiClient from '@api/client';
import { jwtDecode } from 'jwt-decode';

// ============================================================================
// Types
// ============================================================================

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

interface JwtPayload {
  sub: string; // User ID
  exp: number; // Expiration timestamp
  iat: number; // Issued at timestamp
  email?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  userId: string | null;
  email: string | null;
}

// ============================================================================
// Authentication Service
// ============================================================================

class AuthService {
  private readonly ACCESS_TOKEN_KEY = 'auth_access_token';
  private readonly REFRESH_TOKEN_KEY = 'auth_refresh_token';
  private readonly USER_ID_KEY = 'auth_user_id';
  private readonly USER_EMAIL_KEY = 'auth_user_email';

  private refreshPromise: Promise<string> | null = null;
  private refreshTimer: NodeJS.Timeout | null = null;

  /**
   * Initialize authentication service
   * - Sets up API interceptors
   * - Schedules proactive token refresh
   */
  async initialize(): Promise<void> {
    this.setupApiInterceptors();

    // Schedule proactive refresh if token exists
    const accessToken = this.getAccessToken();
    if (accessToken) {
      this.scheduleTokenRefresh(accessToken);
    }

    if (__DEV__) console.log('🔐 Auth service initialized');
  }

  /**
   * Setup API interceptors for automatic token refresh
   */
  private setupApiInterceptors(): void {
    // Request interceptor: Add access token to headers
    apiClient.interceptors.request.use(
      (config) => {
        const token = this.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor: Handle 401 with token refresh
    apiClient.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // If 401 and not already retrying
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Attempt token refresh
            const newAccessToken = await this.refreshAccessToken();

            // Update authorization header
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

            // Retry original request
            return apiClient(originalRequest);
          } catch (refreshError) {
            // Refresh failed - logout user
            this.logout();
            throw refreshError;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<AuthState> {
    try {
      const response = await apiClient.post<TokenPair>('/api/auth/login', {
        email,
        password,
      });

      const { accessToken, refreshToken } = response.data;

      // Store tokens
      this.setTokens(accessToken, refreshToken);

      // Extract user info from JWT
      const payload = this.decodeToken(accessToken);
      this.setUserInfo(payload.sub, payload.email || email);

      // Schedule proactive refresh
      this.scheduleTokenRefresh(accessToken);

      if (__DEV__) console.log('✅ Login successful:', payload.sub);

      return {
        isAuthenticated: true,
        userId: payload.sub,
        email: payload.email || email,
      };
    } catch (error: any) {
      if (__DEV__) console.error('❌ Login failed:', error.message);
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  }

  /**
   * Register new user
   */
  async register(email: string, password: string, name: string): Promise<void> {
    try {
      await apiClient.post('/api/auth/register', {
        email,
        password,
        name,
      });

      if (__DEV__) console.log('✅ Registration successful');
    } catch (error: any) {
      if (__DEV__) console.error('❌ Registration failed:', error.message);
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  }

  /**
   * Refresh access token using refresh token
   * - Prevents multiple simultaneous refresh calls
   * - Returns existing promise if refresh already in progress
   */
  async refreshAccessToken(): Promise<string> {
    // Prevent multiple simultaneous refresh calls
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this._refreshAccessToken();

    try {
      const newAccessToken = await this.refreshPromise;
      return newAccessToken;
    } finally {
      this.refreshPromise = null;
    }
  }

  /**
   * Internal token refresh implementation
   */
  private async _refreshAccessToken(): Promise<string> {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await apiClient.post<TokenPair>('/api/auth/refresh', {
        refreshToken,
      });

      const { accessToken, refreshToken: newRefreshToken } = response.data;

      // Store new tokens
      this.setTokens(accessToken, newRefreshToken);

      // Schedule next refresh
      this.scheduleTokenRefresh(accessToken);

      if (__DEV__) console.log('🔄 Token refreshed successfully');

      return accessToken;
    } catch (error: any) {
      if (__DEV__) console.error('❌ Token refresh failed:', error.message);

      // Clear invalid tokens
      this.clearTokens();

      throw new Error('Token refresh failed');
    }
  }

  /**
   * Schedule proactive token refresh before expiration
   * - Refreshes 5 minutes before expiry
   * - Prevents 401 errors from expired tokens
   */
  private scheduleTokenRefresh(accessToken: string): void {
    // Clear existing timer
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }

    try {
      const payload = this.decodeToken(accessToken);
      const expiresAt = payload.exp * 1000; // Convert to milliseconds
      const now = Date.now();

      // Refresh 5 minutes before expiry
      const refreshAt = expiresAt - 5 * 60 * 1000;
      const delay = Math.max(0, refreshAt - now);

      if (delay > 0) {
        this.refreshTimer = setTimeout(() => {
          this.refreshAccessToken().catch((error) => {
            if (__DEV__) console.error('Scheduled token refresh failed:', error);
          });
        }, delay);

        if (__DEV__) {
          const refreshDate = new Date(refreshAt);
          console.log(`⏰ Token refresh scheduled for: ${refreshDate.toLocaleString()}`);
        }
      }
    } catch (error) {
      if (__DEV__) console.error('Failed to schedule token refresh:', error);
    }
  }

  /**
   * Logout user
   * - Clears tokens and user info
   * - Cancels refresh timer
   * - Notifies backend (optional)
   */
  async logout(): Promise<void> {
    // Cancel refresh timer
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }

    // Notify backend (optional - fire and forget)
    const refreshToken = this.getRefreshToken();
    if (refreshToken) {
      apiClient
        .post('/api/auth/logout', { refreshToken })
        .catch(() => {
          // Ignore errors - logout locally anyway
        });
    }

    // Clear local storage
    this.clearTokens();
    this.clearUserInfo();

    if (__DEV__) console.log('👋 Logout successful');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const accessToken = this.getAccessToken();
    if (!accessToken) return false;

    try {
      const payload = this.decodeToken(accessToken);
      const now = Date.now() / 1000;

      // Check if token is expired
      return payload.exp > now;
    } catch {
      return false;
    }
  }

  /**
   * Get current authentication state
   */
  getAuthState(): AuthState {
    const userId = storage.getString(this.USER_ID_KEY);
    const email = storage.getString(this.USER_EMAIL_KEY);

    return {
      isAuthenticated: this.isAuthenticated(),
      userId: userId || null,
      email: email || null,
    };
  }

  /**
   * Get access token from storage
   */
  getAccessToken(): string | null {
    return storage.getString(this.ACCESS_TOKEN_KEY) || null;
  }

  /**
   * Get refresh token from storage
   */
  private getRefreshToken(): string | null {
    return storage.getString(this.REFRESH_TOKEN_KEY) || null;
  }

  /**
   * Store tokens
   */
  private setTokens(accessToken: string, refreshToken: string): void {
    storage.set(this.ACCESS_TOKEN_KEY, accessToken);
    storage.set(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  /**
   * Clear tokens from storage
   */
  private clearTokens(): void {
    storage.delete(this.ACCESS_TOKEN_KEY);
    storage.delete(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Store user info
   */
  private setUserInfo(userId: string, email: string): void {
    storage.set(this.USER_ID_KEY, userId);
    storage.set(this.USER_EMAIL_KEY, email);
  }

  /**
   * Clear user info from storage
   */
  private clearUserInfo(): void {
    storage.delete(this.USER_ID_KEY);
    storage.delete(this.USER_EMAIL_KEY);
  }

  /**
   * Decode JWT token
   */
  private decodeToken(token: string): JwtPayload {
    return jwtDecode<JwtPayload>(token);
  }

  /**
   * Get token expiry date
   */
  getTokenExpiry(): Date | null {
    const accessToken = this.getAccessToken();
    if (!accessToken) return null;

    try {
      const payload = this.decodeToken(accessToken);
      return new Date(payload.exp * 1000);
    } catch {
      return null;
    }
  }

  /**
   * Check if token will expire soon (within 5 minutes)
   */
  isTokenExpiringSoon(): boolean {
    const expiryDate = this.getTokenExpiry();
    if (!expiryDate) return false;

    const now = Date.now();
    const timeUntilExpiry = expiryDate.getTime() - now;
    const fiveMinutes = 5 * 60 * 1000;

    return timeUntilExpiry < fiveMinutes;
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

export const authService = new AuthService();

export default authService;
