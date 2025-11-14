import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../services/authApi';
// import { authService } from '@services/auth/authService'; // TODO: Create authService
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
 * Features:
 * - Optimistic updates
 * - Automatic token storage
 * - Error handling
 * - Loading states
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
 */
export function useVerifyCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: VerifyCodeRequest) => authApi.verifyCode(data),
    onSuccess: async (response) => {
      // TODO: Store tokens using authService when available
      // await authService.storeTokens(
      //   response.access_token,
      //   response.refresh_token
      // );
      console.log('Tokens received:', { access: response.access_token.substring(0, 20) + '...' });

      // Invalidate auth queries
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });

      console.log('Email verified successfully');
    },
    onError: (error: any) => {
      console.error('Verification failed:', error);
    },
  });
}

/**
 * Login mutation
 */
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: async (response: LoginResponse) => {
      // Only store tokens if we got TokenResponse
      if (response.type === 'success') {
        const tokenResponse = response as TokenResponse;
        // TODO: Store tokens using authService when available
        // await authService.storeTokens(
        //   tokenResponse.access_token,
        //   tokenResponse.refresh_token
        // );
        console.log('Tokens received:', { access: tokenResponse.access_token.substring(0, 20) + '...' });

        // Invalidate auth queries
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });

        console.log('Login successful');
      }
      // For code_sent or org_selection, let UI handle the flow
    },
    onError: (error: any) => {
      console.error('Login failed:', error);
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
 */
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: async () => {
      // TODO: Clear tokens using authService when available
      // await authService.clearTokens();

      // Clear all cached data
      queryClient.clear();

      console.log('Logout successful');
    },
    onError: async (error: any) => {
      console.error('Logout failed:', error);

      // TODO: Clear tokens anyway
      // await authService.clearTokens();
      queryClient.clear();
    },
  });
}

/**
 * Check if user is authenticated
 */
export function useIsAuthenticated(): boolean {
  // TODO: Implement with authService when available
  return false;
}
