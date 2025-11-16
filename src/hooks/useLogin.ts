/**
 * Simple login hook - KISS!
 */

import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/auth';
import type { LoginRequest, LoginResponse } from '../types/auth';

export function useLogin() {
  return useMutation<LoginResponse, Error, LoginRequest>({
    mutationFn: (data) => authApi.login(data),
    onSuccess: (response) => {
      console.log('✅ Login successful!', response);
    },
    onError: (error: any) => {
      console.error('❌ Login failed:', error.response?.data?.detail || error.message);
    },
  });
}
