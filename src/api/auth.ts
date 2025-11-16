/**
 * Auth API calls - SIMPEL!
 */

import { apiClient } from './client';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  PasswordChangeRequest,
} from '../types/auth';

export const authApi = {
  /**
   * Login user
   */
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    console.log('🔵 Sending login request:', JSON.stringify(data));
    const response = await apiClient.post<LoginResponse>(
      '/api/auth/login',
      data
    );
    console.log('✅ Login response:', JSON.stringify(response.data));
    return response.data;
  },

  /**
   * Register new user
   */
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    console.log('🔵 Sending register request:', JSON.stringify({ email: data.email }));
    const response = await apiClient.post<RegisterResponse>(
      '/api/auth/register',
      data
    );
    console.log('✅ Register response:', JSON.stringify(response.data));
    return response.data;
  },

  /**
   * Change password (requires authentication)
   */
  changePassword: async (data: PasswordChangeRequest): Promise<void> => {
    console.log('🔵 Sending password change request');
    await apiClient.post(
      '/api/auth/password/change',
      data
    );
    console.log('✅ Password changed successfully');
  },
};
