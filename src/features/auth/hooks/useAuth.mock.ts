import { useMutation } from '@tanstack/react-query';
import type {
  RegisterRequest,
  LoginRequest,
  RequestPasswordResetRequest,
  ResetPasswordRequest,
  VerifyCodeRequest,
  LoginResponse,
} from '../types';

/**
 * Mock authentication hooks for testing UI
 * TODO: Replace with real API calls
 */

export function useRegister() {
  return useMutation({
    mutationFn: async (data: RegisterRequest) => {
      console.log('📧 Mock: Register', data);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return { success: true, message: 'Check your email for verification code' };
    },
  });
}

export function useVerifyCode() {
  return useMutation({
    mutationFn: async (data: VerifyCodeRequest) => {
      console.log('✅ Mock: Verify code', data);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        token_type: 'bearer',
      };
    },
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: async (data: LoginRequest) => {
      console.log('🔐 Mock: Login', data);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock: Return token directly (no 2FA for now)
      return {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        token_type: 'bearer',
      } as LoginResponse;
    },
  });
}

export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: async (data: RequestPasswordResetRequest) => {
      console.log('🔑 Mock: Request password reset', data);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return { success: true, message: 'Reset code sent to email' };
    },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: async (data: ResetPasswordRequest) => {
      console.log('🔐 Mock: Reset password', data);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return { success: true, message: 'Password reset successful' };
    },
  });
}
