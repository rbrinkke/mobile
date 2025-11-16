import { useState, useCallback } from 'react';
import type {
  AuthMode,
  AuthState,
  RegisterFlowState,
  LoginFlowState,
  ResetPasswordFlowState,
  Organization,
  LoginResponse,
} from '../types';
import {
  useRegister,
  useVerifyCode,
  useLogin,
  useRequestPasswordReset,
  useResetPassword,
} from './useAuth.mock'; // Using mocks for now
import {
  isTokenResponse,
  isLoginCodeSentResponse,
  isOrganizationSelectionResponse,
} from '../types';

/**
 * Unified auth flow state machine hook
 *
 * Manages complex multi-step authentication flows:
 * - Register → Verify Email
 * - Login → 2FA Code → Success
 * - Login → Org Selection → Success
 * - Reset Password → Verify Code → New Password
 *
 * Features:
 * - Type-safe state machines
 * - Automatic flow progression
 * - Error handling with field-specific errors
 * - Loading states
 */

export function useAuthFlow() {
  const [authState, setAuthState] = useState<AuthState>({
    mode: 'login',
  });

  // Mutations
  const registerMutation = useRegister();
  const verifyCodeMutation = useVerifyCode();
  const loginMutation = useLogin();
  const requestResetMutation = useRequestPasswordReset();
  const resetPasswordMutation = useResetPassword();

  // ============================================================================
  // Mode Switching
  // ============================================================================

  const switchToLogin = useCallback(() => {
    setAuthState({ mode: 'login', error: undefined });
  }, []);

  const switchToRegister = useCallback(() => {
    setAuthState({ mode: 'register', error: undefined });
  }, []);

  const switchToResetPassword = useCallback(() => {
    setAuthState({ mode: 'reset-password', error: undefined });
  }, []);

  // ============================================================================
  // Register Flow
  // ============================================================================

  const handleRegister = useCallback(
    async (email: string, password: string) => {
      try {
        const response = await registerMutation.mutateAsync({
          email,
          password,
        });

        // Move to email verification step
        setAuthState({
          mode: 'verify-email',
          email,
          verificationToken: response.verification_token,
          userId: response.user_id,
        });
      } catch (error: any) {
        setAuthState((prev) => ({
          ...prev,
          error: error.response?.data?.message || 'Registration failed',
        }));
      }
    },
    [registerMutation]
  );

  const handleVerifyEmail = useCallback(
    async (code: string) => {
      if (!authState.verificationToken) {
        throw new Error('No verification token');
      }

      try {
        await verifyCodeMutation.mutateAsync({
          verification_token: authState.verificationToken,
          code,
        });

        // Success! Tokens are stored by the mutation
        // Navigate to home screen (handled by parent component)
      } catch (error: any) {
        setAuthState((prev) => ({
          ...prev,
          error:
            error.response?.data?.message || 'Invalid verification code',
        }));
      }
    },
    [authState.verificationToken, verifyCodeMutation]
  );

  // ============================================================================
  // Login Flow
  // ============================================================================

  const handleLogin = useCallback(
    async (email: string, password: string, code?: string, orgId?: string) => {
      try {
        const response = await loginMutation.mutateAsync({
          email,
          password,
          code,
          org_id: orgId,
        });

        // Handle different response types
        if (isTokenResponse(response)) {
          // Direct login success! Tokens stored by mutation
          // Navigate to home (handled by parent)
        } else if (isLoginCodeSentResponse(response)) {
          // 2FA required
          setAuthState({
            mode: 'enter-code',
            email,
            userId: response.user_id,
          });
        } else if (isOrganizationSelectionResponse(response)) {
          // Multi-org user needs to select
          setAuthState({
            mode: 'org-selection',
            email,
            userId: response.user_id,
            organizations: response.organizations,
          });
        }
      } catch (error: any) {
        setAuthState((prev) => ({
          ...prev,
          error: error.response?.data?.message || 'Login failed',
        }));
      }
    },
    [loginMutation]
  );

  const handle2FACode = useCallback(
    async (code: string) => {
      if (!authState.email) {
        throw new Error('No email stored');
      }

      // Re-login with 2FA code
      await handleLogin(authState.email, '', code);
    },
    [authState.email, handleLogin]
  );

  const handleOrgSelection = useCallback(
    async (orgId: string) => {
      if (!authState.email) {
        throw new Error('No email stored');
      }

      // Re-login with org selection
      await handleLogin(authState.email, '', undefined, orgId);
    },
    [authState.email, handleLogin]
  );

  // ============================================================================
  // Password Reset Flow
  // ============================================================================

  const handleRequestPasswordReset = useCallback(
    async (email: string) => {
      try {
        const response = await requestResetMutation.mutateAsync({ email });

        // Move to code entry step
        setAuthState({
          mode: 'enter-code',
          email,
          resetToken: response.reset_token,
        });
      } catch (error: any) {
        setAuthState((prev) => ({
          ...prev,
          error:
            error.response?.data?.message || 'Password reset request failed',
        }));
      }
    },
    [requestResetMutation]
  );

  const handleResetPassword = useCallback(
    async (code: string, newPassword: string) => {
      if (!authState.resetToken) {
        throw new Error('No reset token');
      }

      try {
        await resetPasswordMutation.mutateAsync({
          reset_token: authState.resetToken,
          code,
          new_password: newPassword,
        });

        // Success! Show login screen
        setAuthState({
          mode: 'login',
          email: authState.email,
        });
      } catch (error: any) {
        setAuthState((prev) => ({
          ...prev,
          error: error.response?.data?.message || 'Password reset failed',
        }));
      }
    },
    [authState.resetToken, authState.email, resetPasswordMutation]
  );

  // ============================================================================
  // Error Handling
  // ============================================================================

  const clearError = useCallback(() => {
    setAuthState((prev) => ({ ...prev, error: undefined }));
  }, []);

  // ============================================================================
  // Loading States
  // ============================================================================

  const isLoading =
    registerMutation.isPending ||
    verifyCodeMutation.isPending ||
    loginMutation.isPending ||
    requestResetMutation.isPending ||
    resetPasswordMutation.isPending;

  // ============================================================================
  // Return
  // ============================================================================

  return {
    // State
    authState,
    isLoading,

    // Mode switching
    switchToLogin,
    switchToRegister,
    switchToResetPassword,

    // Register flow
    handleRegister,
    handleVerifyEmail,

    // Login flow
    handleLogin,
    handle2FACode,
    handleOrgSelection,

    // Reset password flow
    handleRequestPasswordReset,
    handleResetPassword,

    // Error handling
    clearError,
  };
}
