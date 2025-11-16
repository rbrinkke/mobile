/**
 * Auth API calls - SIMPEL!
 */

import { apiClient } from './client';
import type { LoginRequest, LoginResponse } from '../types/auth';

export const authApi = {
  /**
   * Login user
   */
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    console.log('🔵 Sending login request:', JSON.stringify(data));
    const response = await apiClient.post<LoginResponse>(
      '/api/auth/login',
      data  // Send JSON directly
    );
    console.log('✅ Login response:', JSON.stringify(response.data));
    return response.data;
  },
};
