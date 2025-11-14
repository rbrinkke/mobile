import { apiClient } from '@api/client';
import type {
  RegisterRequest,
  RegisterResponse,
  VerifyCodeRequest,
  VerifyCodeResponse,
  LoginRequest,
  LoginResponse,
  RequestPasswordResetRequest,
  RequestPasswordResetResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
} from '../types';

/**
 * Authentication API service
 *
 * Aligned with Auth API OpenAPI specification at:
 * /mnt/d/activity/auth-api/Auth-app-openapi.json
 *
 * All endpoints use the /api/auth prefix
 */
export const authApi = {
  /**
   * Register a new user
   *
   * POST /api/auth/register
   * @returns verification_token for email verification
   */
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    return await apiClient.post<RegisterResponse>(
      '/api/auth/register',
      data
    );
  },

  /**
   * Verify email with 6-digit code
   *
   * POST /api/auth/verify-code
   * @returns access_token and refresh_token
   */
  verifyCode: async (data: VerifyCodeRequest): Promise<VerifyCodeResponse> => {
    return await apiClient.post<VerifyCodeResponse>(
      '/api/auth/verify-code',
      data
    );
  },

  /**
   * Login with email and password
   *
   * POST /api/auth/login
   *
   * Returns one of three possible responses:
   * 1. TokenResponse - Direct login success
   * 2. LoginCodeSentResponse - 2FA code sent to email
   * 3. OrganizationSelectionResponse - Multi-org user needs to select
   */
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const result = await apiClient.post<any>(
      '/api/auth/login',
      data
    );

    // Add discriminated union type tag if not present
    // Detect response type based on fields
    if ('access_token' in result) {
      return { ...result, type: 'success' as const };
    } else if ('organizations' in result) {
      return { ...result, type: 'org_selection' as const };
    } else if ('message' in result && 'email' in result) {
      return { ...result, type: 'code_sent' as const };
    }

    // Fallback (should not happen with correct API)
    throw new Error('Invalid login response format');
  },

  /**
   * Request password reset
   *
   * POST /api/auth/request-password-reset
   * @returns reset_token for password reset flow
   */
  requestPasswordReset: async (
    data: RequestPasswordResetRequest
  ): Promise<RequestPasswordResetResponse> => {
    return await apiClient.post<RequestPasswordResetResponse>(
      '/api/auth/request-password-reset',
      data
    );
  },

  /**
   * Reset password with code and new password
   *
   * POST /api/auth/reset-password
   */
  resetPassword: async (
    data: ResetPasswordRequest
  ): Promise<ResetPasswordResponse> => {
    return await apiClient.post<ResetPasswordResponse>(
      '/api/auth/reset-password',
      data
    );
  },

  /**
   * Refresh access token
   *
   * POST /api/auth/refresh-token
   * @param refreshToken - Current refresh token
   * @returns New access_token and refresh_token (rotation)
   */
  refreshToken: async (refreshToken: string): Promise<{
    access_token: string;
    refresh_token: string;
    token_type: 'bearer';
    expires_in: number;
  }> => {
    const response = await apiClient.post('/api/auth/refresh-token', {
      refresh_token: refreshToken,
    });
    return response.data;
  },

  /**
   * Logout (revoke tokens)
   *
   * POST /api/auth/logout
   */
  logout: async (): Promise<void> => {
    await apiClient.post('/api/auth/logout');
  },
};
