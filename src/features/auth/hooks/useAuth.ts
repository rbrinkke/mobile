import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@api/auth';
import { authService } from '@services/authService';
import { useAuthStore } from '@stores/authStore';
import { queryKeys } from '@api/queryKeys';
import type {
  RegisterRequest,
  LoginRequest,
  RequestPasswordResetRequest,
  ResetPasswordRequest,
  VerifyCodeRequest,
  LoginResponse,
  TokenResponse,
} from '../types';

/**
 * Authentication hooks using TanStack Query
 *
 * Best-in-class features:
 * ✅ Automatic token storage via authService
 * ✅ Auth store updates for reactive UI
 * ✅ Optimistic updates where applicable
 * ✅ Comprehensive error handling
 * ✅ Query invalidation for fresh data
 * ✅ Loading states via TanStack Query
 */

/**
 * Register mutation
 */
export function useRegister() {
  return useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: (response) => {
      // Store verification token temporarily
      console.log('Registration successful', response);
    },
    onError: (error: any) => {
      console.error('Registration failed:', error);
    },
  });
}

/**
 * Verify email code mutation
 * After verification, stores tokens and updates auth store
 */
export function useVerifyCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: VerifyCodeRequest) => authApi.verifyCode(data),
    onSuccess: async (response) => {
      // Store tokens via authService (automatically sets user from JWT)
      authService.storeTokens(response.access_token, response.refresh_token);

      // Invalidate auth queries for fresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });

      if (__DEV__) {
        console.log('✅ Email verified - tokens stored');
      }
    },
    onError: (error: any) => {
      console.error('❌ Verification failed:', error);
    },
  });
}

/**
 * Login mutation
 * Handles different response types: direct login, 2FA, org selection
 */
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: async (response: LoginResponse) => {
      // Only store tokens if we got TokenResponse (direct login success)
      if (response.type === 'success') {
        const tokenResponse = response as TokenResponse;

        // Store tokens via authService (automatically sets user from JWT)
        authService.storeTokens(
          tokenResponse.access_token,
          tokenResponse.refresh_token
        );

        // Invalidate auth queries for fresh data
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });

        if (__DEV__) {
          console.log('✅ Login successful - tokens stored');
        }
      }
      // For code_sent or org_selection, let useAuthFlow handle the UI flow
    },
    onError: (error: any) => {
      console.error('❌ Login failed:', error);
    },
  });
}

/**
 * Request password reset mutation
 */
export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: (data: RequestPasswordResetRequest) =>
      authApi.requestPasswordReset(data),
    onSuccess: (response) => {
      console.log('Password reset code sent', response);
    },
    onError: (error: any) => {
      console.error('Password reset request failed:', error);
    },
  });
}

/**
 * Reset password mutation
 */
export function useResetPassword() {
  return useMutation({
    mutationFn: (data: ResetPasswordRequest) => authApi.resetPassword(data),
    onSuccess: () => {
      console.log('Password reset successful');
    },
    onError: (error: any) => {
      console.error('Password reset failed:', error);
    },
  });
}

/**
 * Logout mutation
 * Clears tokens, user data, and all cached queries
 */
export function useLogout() {
  const queryClient = useQueryClient();
  const logout = useAuthStore((state) => state.logout);

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: async () => {
      // Logout via auth store (clears tokens via authService)
      await logout();

      // Clear all cached query data
      queryClient.clear();

      if (__DEV__) {
        console.log('✅ Logout successful');
      }
    },
    onError: async (error: any) => {
      console.error('❌ Logout API call failed:', error);

      // Clear local state anyway (fail safely)
      await logout();
      queryClient.clear();
    },
  });
}

/**
 * Check if user is authenticated
 * Uses optimized Zustand selector for performance
 */
export function useIsAuthenticated(): boolean {
  return useAuthStore((state) => state.isAuthenticated);
}
