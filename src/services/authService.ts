/**
 * Authentication Service - Token management layer
 *
 * Provides a clean API for token operations using authStore
 */

import { useAuthStore } from '@stores/authStore';
import { jwtDecode } from 'jwt-decode';

interface JWTPayload {
  sub: string;  // user_id
  email?: string;
  exp: number;
}

export const authService = {
  /**
   * Store tokens in authStore
   */
  storeTokens: (accessToken: string, refreshToken: string) => {
    try {
      // Decode JWT to get expiry
      const decoded = jwtDecode<JWTPayload>(accessToken);
      const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);

      // Store in authStore
      useAuthStore.getState().setTokens(accessToken, refreshToken, expiresIn);

      // Extract and store user info
      if (decoded.sub && decoded.email) {
        useAuthStore.getState().setUser(decoded.sub, decoded.email);
      }

      console.log('🔐 Tokens stored via authService');
    } catch (error) {
      console.error('❌ Failed to decode/store tokens:', error);
      throw new Error('Invalid token format');
    }
  },

  /**
   * Get current auth state
   */
  getAuthState: () => {
    const state = useAuthStore.getState();
    return {
      userId: state.user?.userId ?? null,
      email: state.user?.email ?? null,
      isAuthenticated: state.isAuthenticated,
      accessToken: state.getAccessToken(),
    };
  },

  /**
   * Get access token
   */
  getAccessToken: () => {
    return useAuthStore.getState().getAccessToken();
  },

  /**
   * Check if token is expired
   */
  isTokenExpired: () => {
    return useAuthStore.getState().isTokenExpired();
  },

  /**
   * Logout - clear all auth data
   */
  logout: async () => {
    await useAuthStore.getState().logout();
  },
};
