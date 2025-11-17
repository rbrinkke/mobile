/**
 * Simple login hook - KISS!
 */

import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/auth';
import { useAuthStore } from '../stores/authStore';
import type { LoginRequest, LoginResponse } from '@features/auth/types';

export function useLogin() {
  return useMutation<LoginResponse, Error, LoginRequest>({
    mutationFn: (data) => authApi.login(data),
    onSuccess: (response) => {
      console.log('✅ Login successful!', response);

      // If direct login (no 2FA), store tokens immediately
      if ('access_token' in response && 'refresh_token' in response) {
        const expiresIn = response.expires_in || 900; // Default 15 minutes
        useAuthStore.getState().setTokens(
          response.access_token,
          response.refresh_token,
          expiresIn
        );
        console.log('🔐 Direct login - tokens stored');
      } else {
        console.log('📱 2FA required - waiting for code verification');
      }
    },
    onError: (error: any) => {
      console.error('❌ Login failed:', error.response?.data?.detail || error.message);
    },
  });
}
